/**
 * developer-api.ts
 * Place at: @/lib/api/developer-api.ts
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

export interface ApiDeveloper {
  developer_id: number;
  company_name: string;
  registration_type: string;
  contact_person_name: string;
  mobile_primary: string;
  email_primary: string;
  rera_registration_number: string;
  credit_rating: string;
  developer_status: string;
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

export interface GetDevelopersResponse {
  success: boolean;
  message: string;
  data: ApiDeveloper[];
  pagination: Pagination;
}

export interface RegisterDeveloperPayload {
  company_name: string;
  registration_type: string;
  registration_number: string;
  contact_person_name: string;
  mobile_primary: string;
  mobile_alternate?: string;
  email_primary: string;
  email_alternate?: string;
  website_url?: string;
  years_in_business?: number;
  total_projects_completed?: number;
  rera_registration_number?: string;
  credit_rating?: string;
}

export interface RegisterDeveloperResponse {
  success: boolean;
  message: string;
  data: ApiDeveloper & {
    registration_number: string;
    mobile_alternate: string;
    email_alternate: string;
    logo_path: string | null;
    website_url: string;
    years_in_business: number;
    total_projects_completed: number;
  };
}

export interface AddDeveloperAddressPayload {
  address_type: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
}

export interface AddDeveloperAddressResponse {
  success: boolean;
  message: string;
  data: {
    address_id: number;
    developer_id: number;
    address_type: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    landmark: string;
    created_at: string;
    created_by: number;
    updated_at: string;
    updated_by: number | null;
  };
}

export interface ApiDeveloperAddress {
  address_id: number;
  address_type: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark: string;
}

export interface ApiDeveloperDetail {
  developer_id: number;
  company_name: string;
  registration_type: string;
  registration_number: string;
  contact_person_name: string;
  mobile_primary: string;
  mobile_alternate: string;
  email_primary: string;
  email_alternate: string;
  logo_path: string | null;
  website_url: string;
  years_in_business: number;
  total_projects_completed: number;
  rera_registration_number: string;
  credit_rating: string;
  developer_status: string;
  created_at: string;
  updated_at: string;
  addresses: ApiDeveloperAddress[];
}

export interface GetDeveloperResponse {
  success: boolean;
  message: string;
  data: ApiDeveloperDetail;
}

export interface UpdateDeveloperPayload {
  contact_person_name?: string;
  mobile_primary?: string;
  mobile_alternate?: string;
  email_primary?: string;
  email_alternate?: string;
  website_url?: string;
  years_in_business?: number;
  total_projects_completed?: number;
  rera_registration_number?: string;
  credit_rating?: string;
  company_name?: string;
  registration_type?: string;
  registration_number?: string;
}

export interface UpdateDeveloperResponse {
  success: boolean;
  message: string;
  data: ApiDeveloperDetail;
}

export interface UpdateDeveloperAddressPayload {
  address_type?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  landmark?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchDevelopers(
  page = 1,
  limit = 10,
): Promise<GetDevelopersResponse> {
  const res = await fetch(
    `${BASE_URL}/developers?page=${page}&limit=${limit}`,
    { headers: authHeaders() },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch developers");
  }
  return res.json();
}

export async function registerDeveloper(
  payload: RegisterDeveloperPayload,
): Promise<RegisterDeveloperResponse> {
  const res = await fetch(`${BASE_URL}/developers/register`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to register developer");
  }
  return res.json();
}

export async function addDeveloperAddress(
  developerId: number,
  payload: AddDeveloperAddressPayload,
): Promise<AddDeveloperAddressResponse> {
  const res = await fetch(`${BASE_URL}/developers/${developerId}/addresses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save developer address");
  }
  return res.json();
}

export async function fetchDeveloper(
  developerId: number,
): Promise<GetDeveloperResponse> {
  const res = await fetch(`${BASE_URL}/developers/${developerId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch developer");
  }
  return res.json();
}

export async function updateDeveloper(
  developerId: number,
  payload: UpdateDeveloperPayload,
): Promise<UpdateDeveloperResponse> {
  const res = await fetch(`${BASE_URL}/developers/${developerId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update developer");
  }
  return res.json();
}

export async function deleteDeveloper(developerId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/developers/${developerId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete developer");
  }
}

export async function deleteDeveloperAddress(
  developerId: number,
  addressId: number,
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/developers/${developerId}/addresses/${addressId}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete address");
  }
}

export async function updateDeveloperAddress(
  developerId: number,
  addressId: number,
  payload: UpdateDeveloperAddressPayload,
): Promise<AddDeveloperAddressResponse> {
  const res = await fetch(
    `${BASE_URL}/developers/${developerId}/addresses/${addressId}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update developer address");
  }
  return res.json();
}
