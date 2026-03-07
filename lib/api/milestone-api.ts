/**
 * milestone-api.ts
 * Place at: @/lib/api/milestone-api.ts
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

export interface ApiMilestone {
  milestone_id: number;
  plan_id: number;
  milestone_sequence: number;
  milestone_name: string;
  milestone_percentage: number;
  days_from_previous: number;
  amount_type: string;
  expected_days_from_booking: number;
  created_at?: string;
  updated_at?: string;
}

export interface GetMilestonesResponse {
  success: boolean;
  message: string;
  data: ApiMilestone[];
}

export interface GetMilestoneResponse {
  success: boolean;
  message: string;
  data: ApiMilestone;
}

export interface CreateMilestonePayload {
  milestone_sequence: number;
  milestone_name: string;
  milestone_percentage: number;
  days_from_previous: number;
  amount_type: string;
  expected_days_from_booking: number;
}

export interface UpdateMilestonePayload {
  milestone_name?: string;
  milestone_sequence?: number;
  milestone_percentage?: number;
  days_from_previous?: number;
  amount_type?: string;
  expected_days_from_booking?: number;
}

export interface CreateUpdateMilestoneResponse {
  success: boolean;
  message: string;
  data: ApiMilestone;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchMilestones(
  planId: number,
): Promise<GetMilestonesResponse> {
  const res = await fetch(
    `${BASE_URL}/api/payment-plans/${planId}/milestones`,
    { headers: authHeaders() },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch milestones");
  }
  return res.json();
}

export async function fetchMilestone(
  planId: number,
  milestoneId: number,
): Promise<GetMilestoneResponse> {
  const res = await fetch(
    `${BASE_URL}/payment-plans/${planId}/milestones/${milestoneId}`,
    { headers: authHeaders() },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch milestone");
  }
  return res.json();
}

export async function createMilestone(
  planId: number,
  payload: CreateMilestonePayload,
): Promise<CreateUpdateMilestoneResponse> {
  const res = await fetch(`${BASE_URL}/payment-plans/${planId}/milestones`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create milestone");
  }
  return res.json();
}

export async function updateMilestone(
  planId: number,
  milestoneId: number,
  payload: UpdateMilestonePayload,
): Promise<CreateUpdateMilestoneResponse> {
  const res = await fetch(
    `${BASE_URL}/payment-plans/${planId}/milestones/${milestoneId}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update milestone");
  }
  return res.json();
}

export async function deleteMilestone(
  planId: number,
  milestoneId: number,
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/payment-plans/${planId}/milestones/${milestoneId}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete milestone");
  }
}
