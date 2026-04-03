from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import asyncio
import datetime
from typing import List, Optional

import models
import schemas
import database
from database import engine, get_db
from business_logic.risk_engine import calculate_risk_score, calculate_weekly_premium, calculate_potential_coverage

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DeliverSure API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

RAIN_THRESHOLD = 5.0
AQI_THRESHOLD = 300
TRAFFIC_THRESHOLD = 2.0

@app.post("/register", response_model=schemas.RiderResponse)
def register_rider(rider: schemas.RiderCreate, db: Session = Depends(get_db)):
    existing_rider = db.query(models.Rider).filter(models.Rider.phone_number == rider.phone_number).first()
    if existing_rider:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    normalized_zone = rider.zone.strip().lower()
    db_rider = models.Rider(
        name=rider.name,
        phone_number=rider.phone_number,
        work_type=rider.work_type,
        zone=normalized_zone,
        avg_weekly_income=rider.avg_weekly_income
    )
    db.add(db_rider)
    db.commit()
    db.refresh(db_rider)

    env_state = db.query(models.EnvironmentalState).filter(models.EnvironmentalState.zone == normalized_zone).first()
    if not env_state:
        env_state = models.EnvironmentalState(zone=normalized_zone)
        db.add(env_state)
        db.commit()

    return db_rider

@app.post("/login", response_model=schemas.RiderResponse)
def login_rider(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    rider = db.query(models.Rider).filter(models.Rider.phone_number == login_data.phone_number).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found with this phone number")
    return rider

@app.post("/create-policy/{rider_id}", response_model=schemas.PolicyResponse)
def create_policy(rider_id: int, plan_type: schemas.PlanType = schemas.PlanType.PRO, db: Session = Depends(get_db)):
    rider = db.query(models.Rider).filter(models.Rider.id == rider_id).first()
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found")

    risk_score = calculate_risk_score(rider.zone)
    premium = calculate_weekly_premium(rider.avg_weekly_income, risk_score, plan_type.value)
    coverage = calculate_potential_coverage(rider.avg_weekly_income, plan_type.value)

    db_policy = models.Policy(
        rider_id=rider_id,
        weekly_premium=premium,
        coverage_amount=coverage,
        plan_type=plan_type.value,
        is_active=True
    )
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)

    setattr(db_policy, "zone", rider.zone)
    return db_policy

@app.get("/policy/{rider_id}", response_model=schemas.PolicyResponse)
def get_policy(rider_id: int, db: Session = Depends(get_db)):
    policy = db.query(models.Policy).filter(models.Policy.rider_id == rider_id, models.Policy.is_active == True).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Active policy not found")

    rider = db.query(models.Rider).filter(models.Rider.id == rider_id).first()
    setattr(policy, "zone", rider.zone)
    return policy

@app.get("/risk/{zone}")
def get_risk_score(zone: str):
    score = calculate_risk_score(zone)
    return {"zone": zone, "risk_score": score}

@app.post("/simulate-event")
async def simulate_event(update: schemas.EnvironmentalUpdate, db: Session = Depends(get_db)):
    target_zone = update.zone.strip().lower()
    env_state = db.query(models.EnvironmentalState).filter(models.EnvironmentalState.zone == target_zone).first()
    if not env_state:
        env_state = models.EnvironmentalState(zone=target_zone)
        db.add(env_state)

    if update.rainfall is not None:
        env_state.rainfall = update.rainfall
    if update.aqi is not None:
        env_state.aqi = update.aqi
    if update.traffic_index is not None:
        env_state.traffic_index = update.traffic_index

    env_state.last_updated = datetime.datetime.utcnow()
    db.commit()

    await check_and_create_claims(db, target_zone)

    return {"message": "Environment updated", "state": {
        "rainfall": env_state.rainfall,
        "aqi": env_state.aqi,
        "traffic_index": env_state.traffic_index
    }}

async def check_and_create_claims(db: Session, zone: str):
    target_zone = zone.strip().lower()
    env_state = db.query(models.EnvironmentalState).filter(models.EnvironmentalState.zone == target_zone).first()
    if not env_state:
        return

    trigger_reason = None
    payout_factor = 0.0

    if env_state.rainfall > RAIN_THRESHOLD:
        trigger_reason = f"Heavy Rainfall ({env_state.rainfall}mm/hr)"
        payout_factor = 0.15
    elif env_state.aqi > AQI_THRESHOLD:
        trigger_reason = f"Hazardous Air Quality (AQI {env_state.aqi})"
        payout_factor = 0.08
    elif env_state.traffic_index > TRAFFIC_THRESHOLD:
        trigger_reason = f"Extreme Traffic Congestion ({env_state.traffic_index}x)"
        payout_factor = 0.05

    if trigger_reason:
        riders_in_zone = db.query(models.Rider).filter(models.Rider.zone == target_zone).all()
        for rider in riders_in_zone:
            active_policy = db.query(models.Policy).filter(
                models.Policy.rider_id == rider.id,
                models.Policy.is_active == True
            ).first()

            if active_policy:
                existing_inflight = db.query(models.Claim).filter(
                    models.Claim.policy_id == active_policy.id,
                    models.Claim.status.in_([
                        models.ClaimStatus.TRIGGERED,
                        models.ClaimStatus.PROCESSING
                    ])
                ).first()
                if existing_inflight:
                    continue

                total_paid_history = db.query(models.Claim).filter(
                    models.Claim.policy_id == active_policy.id,
                    models.Claim.status.in_([models.ClaimStatus.PAID, models.ClaimStatus.APPROVED, models.ClaimStatus.PROCESSING])
                ).all()
                total_sum_paid = sum(c.payout_amount for c in total_paid_history)

                remaining_balance = active_policy.coverage_amount - total_sum_paid

                if remaining_balance <= 0:
                    continue

                raw_payout = active_policy.coverage_amount * payout_factor
                final_payout = min(raw_payout, remaining_balance)

                new_claim = models.Claim(
                    rider_id=rider.id,
                    policy_id=active_policy.id,
                    trigger_event=trigger_reason,
                    payout_amount=round(final_payout, 2),
                    status=models.ClaimStatus.TRIGGERED
                )
                db.add(new_claim)
                db.commit()
                db.refresh(new_claim)
                asyncio.get_event_loop().create_task(process_claim_lifecycle(new_claim.id))

async def process_claim_lifecycle(claim_id: int):
    await asyncio.sleep(1)
    from database import SessionLocal
    db = SessionLocal()
    try:
        claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
        if claim:
            claim.status = models.ClaimStatus.PROCESSING
            db.commit()
            await asyncio.sleep(1)
            claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
            if claim:
                claim.status = models.ClaimStatus.APPROVED
                db.commit()
            await asyncio.sleep(1)
            claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
            if claim:
                claim.status = models.ClaimStatus.PAID
                db.commit()
    finally:
        db.close()

@app.get("/claims", response_model=List[schemas.ClaimResponse])
def get_claims(rider_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Claim)
    if rider_id:
        query = query.filter(models.Claim.rider_id == rider_id)
    return query.order_by(models.Claim.timestamp.desc()).all()

@app.get("/payouts")
def get_payouts(rider_id: int, db: Session = Depends(get_db)):
    claims = db.query(models.Claim).filter(
        models.Claim.rider_id == rider_id,
        models.Claim.status == models.ClaimStatus.PAID
    ).all()
    total_paid = sum(c.payout_amount for c in claims)
    return {"total_payout": total_paid, "count": len(claims)}
