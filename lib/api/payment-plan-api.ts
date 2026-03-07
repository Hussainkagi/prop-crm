/**
 * payment-plan-api.ts
 * Place at: @/lib/api/payment-plan-api.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function getAccessToken(): string {
  return localStorage.getItem("crm_access_token") || "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAccessToken()}`,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiPaymentPlan {
  plan_id: number;
  plan_name: string;
  plan_code: string;
  plan_type: string;
  total_installments: number;
  booking_amount_percentage: string;
  vat_applicable: boolean;
  vat_percentage: string;
  plan_status: string;
  project_name: string;
  created_at: string;
  updated_at: string;
}

export interface ApiPaymentPlanDetail {
  plan_id: number;
  project_id: number;
  plan_name: string;
  plan_code: string;
  plan_description: string;
  plan_type: string;
  total_installments: number;
  booking_amount_percentage: string;
  down_payment_percentage: string;
  on_agreement_percentage: string;
  on_possession_percentage: string;
  grace_period_days: number;
  late_payment_charge_percentage: string;
  penalty_terms: string;
  early_payment_discount_percentage: string;
  vat_applicable: boolean;
  vat_percentage: string;
  stamp_duty_included: boolean;
  plan_status: string;
  special_offers: Record<string, string> | null;
  project_name: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetPaymentPlansResponse {
  success: boolean;
  message: string;
  data: ApiPaymentPlan[];
  pagination: Pagination;
}

export interface GetPaymentPlanResponse {
  success: boolean;
  message: string;
  data: ApiPaymentPlanDetail;
}

export interface CreatePaymentPlanPayload {
  plan_name: string;
  plan_code?: string; // optional — unique but not required
  plan_description?: string;
  plan_type: string;
  total_installments?: number;
  booking_amount_percentage?: number;
  down_payment_percentage?: number;
  on_agreement_percentage?: number;
  on_possession_percentage?: number;
  grace_period_days?: number;
  late_payment_charge_percentage?: number;
  penalty_terms?: string;
  early_payment_discount_percentage?: number;
  vat_applicable: boolean;
  vat_percentage?: number;
  stamp_duty_included: boolean;
  special_offers?: Record<string, string>;
}

export interface UpdatePaymentPlanPayload {
  plan_name?: string;
  plan_code?: string;
  plan_description?: string;
  plan_type?: string;
  total_installments?: number;
  booking_amount_percentage?: number;
  down_payment_percentage?: number;
  on_agreement_percentage?: number;
  on_possession_percentage?: number;
  grace_period_days?: number;
  late_payment_charge_percentage?: number;
  penalty_terms?: string;
  early_payment_discount_percentage?: number;
  vat_applicable?: boolean;
  vat_percentage?: number;
  stamp_duty_included?: boolean;
  plan_status?: string;
  special_offers?: Record<string, string>;
}

export interface CreateUpdatePaymentPlanResponse {
  success: boolean;
  message: string;
  data: ApiPaymentPlanDetail;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchPaymentPlans(
  page = 1,
  limit = 10,
): Promise<GetPaymentPlansResponse> {
  const res = await fetch(
    `${BASE_URL}/payment-plans?page=${page}&limit=${limit}`,
    { headers: authHeaders() },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch payment plans");
  }
  return res.json();
}

export async function fetchPaymentPlan(
  planId: number,
): Promise<GetPaymentPlanResponse> {
  const res = await fetch(`${BASE_URL}/payment-plans/${planId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch payment plan");
  }
  return res.json();
}

export async function createPaymentPlan(
  payload: CreatePaymentPlanPayload,
): Promise<CreateUpdatePaymentPlanResponse> {
  const res = await fetch(`${BASE_URL}/payment-plans`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create payment plan");
  }
  return res.json();
}

export async function updatePaymentPlan(
  planId: number,
  payload: UpdatePaymentPlanPayload,
): Promise<CreateUpdatePaymentPlanResponse> {
  const res = await fetch(`${BASE_URL}/payment-plans/${planId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update payment plan");
  }
  return res.json();
}

export async function approvePaymentPlan(planId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/payment-plans/${planId}/approve`, {
    method: "PUT",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to approve payment plan");
  }
}

export async function revertPaymentPlanToDraft(planId: number): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/payment-plans/${planId}/revert-to-draft`,
    { method: "PUT", headers: authHeaders() },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to revert payment plan to draft");
  }
}

export async function deletePaymentPlan(planId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/payment-plans/${planId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete payment plan");
  }
}
