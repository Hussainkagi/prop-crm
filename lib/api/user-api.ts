/**
 * user-api.ts
 * Place at: @/lib/user-api.ts
 * User management API endpoints
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

export interface ApiUser {
  user_id: number;
  username: string;
  email_id: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  employee_code: string;
  role_id: number;
  role_name: string;
  department: string;
  designation: string;
  user_status: string;
  developer_id: number;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data: ApiUser[];
  pagination: Pagination;
}

export interface GetUserByIdResponse {
  success: boolean;
  message: string;
  data: ApiUser;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  email_id: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  employee_code: string;
  role_id: number;
  department: string;
  designation: string;
  developer_id: number;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: ApiUser;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  mobile_number?: string;
  role_id?: number;
  department?: string;
  designation?: string;
  user_status?: string;
  developer_id?: number;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: ApiUser;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordPayload {
  new_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface UnlockUserResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch all users with pagination and filters
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10, max: 100)
 * @param filters - Optional filters (status, role_id, department, developer_id, search)
 */
export async function getAllUsers(
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    role_id?: number;
    department?: string;
    developer_id?: number;
    search?: string;
  },
): Promise<GetUsersResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.role_id) {
      params.append("role_id", filters.role_id.toString());
    }
    if (filters?.department) {
      params.append("department", filters.department);
    }
    if (filters?.developer_id) {
      params.append("developer_id", filters.developer_id.toString());
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const response = await fetch(`${BASE_URL}/users?${params.toString()}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.message || "Failed to fetch users");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

/**
 * Fetch a single user by ID
 */
export async function getUserById(
  userId: number,
): Promise<GetUserByIdResponse> {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.message || "Failed to fetch user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(
  payload: CreateUserPayload,
): Promise<CreateUserResponse> {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.message || "Failed to create user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

/**
 * Update an existing user
 */
export async function updateUser(
  userId: number,
  payload: UpdateUserPayload,
): Promise<UpdateUserResponse> {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.message || "Failed to update user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Delete (soft delete) a user
 */
export async function deleteUser(userId: number): Promise<DeleteUserResponse> {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.message || "Failed to delete user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

/**
 * Reset a user's password (admin only)
 */
export async function resetUserPassword(
  userId: number,
  newPassword: string,
): Promise<ResetPasswordResponse> {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/reset-password`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ new_password: newPassword }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.message || "Failed to reset password");
    }

    return await response.json();
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

/**
 * Unlock a user's account
 */
export async function unlockUser(userId: number): Promise<UnlockUserResponse> {
  try {
    const response = await fetch(`${BASE_URL}/users/${userId}/unlock`, {
      method: "PUT",
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.message || "Failed to unlock user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error unlocking user:", error);
    throw error;
  }
}

// ─── Roles & Developers ────────────────────────────────────────────────────────

export interface ApiRole {
  role_id: number;
  role_name: string;
  role_description: string;
  role_level: number;
  created_at: string;
}

export interface ApiDeveloper {
  developer_id: number;
  company_name: string;
  developer_status: string;
}

export interface GetRolesResponse {
  success: boolean;
  message: string;
  data: ApiRole[];
}

export interface GetDevelopersResponse {
  success: boolean;
  message: string;
  data: ApiDeveloper[];
}

/**
 * Fetch all roles
 */
export async function getAllRoles(): Promise<GetRolesResponse> {
  try {
    const response = await fetch(`${BASE_URL}/roles`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.message || "Failed to fetch roles");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
}

/**
 * Fetch all developers
 */
export async function getAllDevelopers(): Promise<GetDevelopersResponse> {
  try {
    const response = await fetch(`${BASE_URL}/developers`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      throw new Error(errorData.message || "Failed to fetch developers");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching developers:", error);
    throw error;
  }
}
