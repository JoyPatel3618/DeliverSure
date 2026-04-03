import enum
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import WorkType, ClaimStatus

class PlanType(str, enum.Enum):
    STARTER = "Starter"
    PRO = "Pro"
    ELITE = "Elite"

class RiderCreate(BaseModel):
    name: str
    phone_number: str
    work_type: WorkType
    zone: str
    avg_weekly_income: float

class RiderResponse(BaseModel):
    id: int
    name: str
    phone_number: str
    work_type: WorkType
    zone: str
    avg_weekly_income: float

    class ConfigDict:
        from_attributes = True

class LoginRequest(BaseModel):
    phone_number: str

class PolicyResponse(BaseModel):
    id: int
    rider_id: int
    weekly_premium: float
    coverage_amount: float
    is_active: bool
    zone: str
    plan_type: Optional[PlanType] = None
    created_at: datetime

    class ConfigDict:
        from_attributes = True

class ClaimResponse(BaseModel):
    id: int
    rider_id: int
    policy_id: int
    trigger_event: str
    payout_amount: float
    status: ClaimStatus
    timestamp: datetime

    class ConfigDict:
        from_attributes = True

class EnvironmentalUpdate(BaseModel):
    zone: str
    rainfall: Optional[float] = None
    aqi: Optional[int] = None
    traffic_index: Optional[float] = None
