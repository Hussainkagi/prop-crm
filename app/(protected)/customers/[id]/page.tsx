"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Pencil, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EditCustomerBasicInfoForm } from "@/components/customers/editform/basic";
import { CustomerPropertyPlanForm } from "@/components/customers/forms/parts/property";
import { use } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiCustomerDetail {
  customer_id: number;
  salutation: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  nationality: string;
  mobile_primary: string;
  mobile_alternate: string;
  whatsapp_number: string;
  email_primary: string;
  email_alternate: string;
  preferred_communication_mode: string;
  corr_address_line1: string;
  corr_address_line2: string;
  corr_locality: string;
  corr_city: string;
  corr_state: string;
  corr_pincode: string;
  corr_country: string;
  corr_landmark: string;
  residence_type: string;
  years_at_current_address: number;
  perm_same_as_corr: boolean;
  perm_address_line1: string;
  perm_address_line2: string;
  perm_locality: string;
  perm_city: string;
  perm_state: string;
  perm_pincode: string;
  perm_country: string;
  customer_status: string;
  created_at: string;
  updated_at: string;
  developer_id: number;
  plan_id: number | null;
}

type ActiveTab = "details" | "project";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

// ─── Read-only detail view ────────────────────────────────────────────────────

function CustomerDetailView({
  customer,
  onEdit,
}: {
  customer: ApiCustomerDetail;
  onEdit: () => void;
}) {
  const fullName = [
    customer.salutation,
    customer.first_name,
    customer.middle_name,
    customer.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const dob = customer.date_of_birth
    ? new Date(customer.date_of_birth).toLocaleDateString("en-AE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <User className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <p className="text-sm text-muted-foreground">
              {customer.email_primary}
            </p>
            <Badge
              variant={
                customer.customer_status === "Active" ? "default" : "secondary"
              }
              className="mt-1"
            >
              {customer.customer_status}
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="mr-2 h-3.5 w-3.5" />
          Edit Details
        </Button>
      </div>

      {/* Personal */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">
          Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
          <InfoRow label="Date of Birth" value={dob} />
          <InfoRow label="Gender" value={customer.gender} />
          <InfoRow label="Marital Status" value={customer.marital_status} />
          <InfoRow label="Nationality" value={customer.nationality} />
        </div>
      </section>

      {/* Contact */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">
          Contact Information
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
          <InfoRow label="Mobile (Primary)" value={customer.mobile_primary} />
          <InfoRow
            label="Mobile (Alternate)"
            value={customer.mobile_alternate}
          />
          <InfoRow label="WhatsApp" value={customer.whatsapp_number} />
          <InfoRow label="Email (Primary)" value={customer.email_primary} />
          <InfoRow label="Email (Alternate)" value={customer.email_alternate} />
          <InfoRow
            label="Preferred Communication"
            value={customer.preferred_communication_mode}
          />
        </div>
      </section>

      {/* Correspondence Address */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">
          Correspondence Address
        </h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
          <InfoRow label="Address Line 1" value={customer.corr_address_line1} />
          <InfoRow label="Address Line 2" value={customer.corr_address_line2} />
          <InfoRow label="Locality" value={customer.corr_locality} />
          <InfoRow label="City / Emirate" value={customer.corr_city} />
          <InfoRow label="State / Emirate" value={customer.corr_state} />
          <InfoRow label="P.O. Box" value={customer.corr_pincode} />
          <InfoRow label="Country" value={customer.corr_country} />
          <InfoRow label="Landmark" value={customer.corr_landmark} />
          <InfoRow label="Residence Type" value={customer.residence_type} />
          <InfoRow
            label="Years at Address"
            value={customer.years_at_current_address}
          />
        </div>
      </section>

      {/* Permanent Address */}
      {!customer.perm_same_as_corr && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-1 border-b">
            Permanent Address
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
            <InfoRow
              label="Address Line 1"
              value={customer.perm_address_line1}
            />
            <InfoRow
              label="Address Line 2"
              value={customer.perm_address_line2}
            />
            <InfoRow label="Locality" value={customer.perm_locality} />
            <InfoRow label="City" value={customer.perm_city} />
            <InfoRow label="State" value={customer.perm_state} />
            <InfoRow label="Pincode / P.O. Box" value={customer.perm_pincode} />
            <InfoRow label="Country" value={customer.perm_country} />
          </div>
        </section>
      )}
      {customer.perm_same_as_corr && (
        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          Permanent address same as correspondence address
        </p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const customerId = parseInt(id);

  const [customer, setCustomer] = useState<ApiCustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("details");
  const [isEditing, setIsEditing] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const fetchCustomer = async () => {
    setLoading(true);
    setError(null);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("crm_access_token")
        : null;

    const [data] = await Promise.all([
      fetch(`${apiBaseUrl}/customers/${customerId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then((res) => {
          if (!res.ok)
            throw new Error(`Error ${res.status}: ${res.statusText}`);
          return res.json();
        })
        .catch((err: Error) => {
          setError(err.message || "Failed to load customer");
          return null;
        }),
      new Promise((resolve) => setTimeout(resolve, 400)),
    ]);

    if (data?.success && data.data) {
      setCustomer(data.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "details", label: "Customer Details" },
    { key: "project", label: "Project Assignment" },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/customers")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Customers
      </button>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            onClick={fetchCustomer}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setIsEditing(false);
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-muted-foreground hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <DetailSkeleton />
      ) : customer ? (
        <>
          {activeTab === "details" &&
            (isEditing ? (
              <EditCustomerBasicInfoForm
                customer={customer}
                apiBaseUrl={apiBaseUrl}
                onSuccess={() => {
                  setIsEditing(false);
                  fetchCustomer();
                }}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <CustomerDetailView
                customer={customer}
                onEdit={() => setIsEditing(true)}
              />
            ))}

          {activeTab === "project" && (
            <CustomerPropertyPlanForm
              customerId={customerId}
              apiBaseUrl={apiBaseUrl}
              onSuccess={() => {
                fetchCustomer();
              }}
              onSkip={() => setActiveTab("details")}
            />
          )}
        </>
      ) : null}
    </div>
  );
}
