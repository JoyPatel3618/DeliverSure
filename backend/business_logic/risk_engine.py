import random

def calculate_risk_score(zone: str):
    normalized_zone = zone.strip().lower()
    zone_hash = sum(ord(c) for c in normalized_zone) % 10
    base_risk = 0.3 + (zone_hash * 0.05)
    variability = random.uniform(-0.05, 0.05)
    return round(min(max(base_risk + variability, 0.1), 1.0), 2)

def calculate_weekly_premium(avg_weekly_income: float, risk_score: float, plan_type: str = "Pro"):
    base_rates = {
        "Starter": 0.02,
        "Pro": 0.035,
        "Elite": 0.05
    }
    risk_factor = 1.0 + (risk_score * 0.6)
    base_rate = base_rates.get(plan_type, 0.035)
    income_premium = avg_weekly_income * base_rate
    calculated_premium = income_premium * risk_factor
    return round(max(calculated_premium, 100.0), 2)

def calculate_potential_coverage(avg_weekly_income: float, plan_type: str = "Pro"):
    avg_daily_income = avg_weekly_income / 7.0
    covered_days = {
        "Starter": 4,
        "Pro": 5,
        "Elite": 6
    }
    days = covered_days.get(plan_type, 5)
    return round(avg_daily_income * days, 2)
