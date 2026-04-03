import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Rider {
  id: number;
  name: string;
  phone_number: string;
  work_type: 'grocery' | 'pharma' | 'essentials';
  zone: string;
  avg_weekly_income: number;
}

export interface Policy {
  id: number;
  rider_id: number;
  weekly_premium: number;
  coverage_amount: number;
  is_active: boolean;
  zone: string;
  plan_type: string;
  created_at: string;
}

export interface Claim {
  id: number;
  rider_id: number;
  policy_id: number;
  trigger_event: string;
  payout_amount: number;
  status: 'triggered' | 'processing' | 'approved' | 'paid';
  timestamp: string;
}

export const loginRider = (phoneNumber: string) => api.post('/login', { phone_number: phoneNumber });
export const registerRider = (data: any) => api.post('/register', data);
export const createPolicy = (riderId: number, planType: string = 'Pro') => api.post(`/create-policy/${riderId}?plan_type=${planType}`);
export const getPolicy = (riderId: number) => api.get(`/policy/${riderId}`);
export const getClaims = (riderId: number) => api.get(`/claims?rider_id=${riderId}`);
export const simulateDisruption = (data: any) => api.post('/simulate-event', data);
export const getRiskScore = (zone: string) => api.get(`/risk/${zone}`);
