from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

class WorkType(str, enum.Enum):
    GROCERY = "grocery"
    PHARMA = "pharma"
    ESSENTIALS = "essentials"

class ClaimStatus(str, enum.Enum):
    TRIGGERED = "triggered"
    PROCESSING = "processing"
    APPROVED = "approved"
    PAID = "paid"

class Rider(Base):
    __tablename__ = "riders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone_number = Column(String, unique=True, index=True)
    work_type = Column(Enum(WorkType))
    zone = Column(String)
    avg_weekly_income = Column(Float)

    policies = relationship("Policy", back_populates="rider")
    claims = relationship("Claim", back_populates="rider")

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    rider_id = Column(Integer, ForeignKey("riders.id"))
    weekly_premium = Column(Float)
    coverage_amount = Column(Float)
    plan_type = Column(String, default="Standard")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    rider = relationship("Rider", back_populates="policies")

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    rider_id = Column(Integer, ForeignKey("riders.id"))
    policy_id = Column(Integer, ForeignKey("policies.id"))
    trigger_event = Column(String)
    payout_amount = Column(Float)
    status = Column(Enum(ClaimStatus), default=ClaimStatus.TRIGGERED)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    rider = relationship("Rider", back_populates="claims")

class EnvironmentalState(Base):
    __tablename__ = "environmental_state"

    id = Column(Integer, primary_key=True, index=True)
    zone = Column(String, unique=True, index=True)
    rainfall = Column(Float, default=0.0)
    aqi = Column(Integer, default=50)
    traffic_index = Column(Float, default=1.0)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)
