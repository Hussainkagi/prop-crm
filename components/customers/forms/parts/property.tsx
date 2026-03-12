"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Constants ───────────────────────────────────────────────────────────────

const CUSTOM_PLAN_ID = -1;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiProject {
  project_id: number;
  project_name: string;
  project_type: string;
  project_category: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  total_units: number;
  possession_status: string;
  project_status: string;
  construction_stage_percentage: number;
  status: string;
  launch_date: string;
  expected_completion_date: string;
  developer_name: string;
  created_at: string;
  updated_at: string;
}

interface PaymentPlan {
  plan_id: number;
  project_id: number;
  plan_code: string;
  plan_name: string;
  plan_type: string;
  plan_status: string;
  penalty_terms: string;
  special_offers: Record<string, string> | null;
  vat_percentage: number;
  grace_period_days: number;
  total_installments: number;
  down_payment_percentage: number;
  booking_amount_percentage: number;
  early_payment_discount_percentage: number;
}

interface CustomerPropertyPlanFormProps {
  customerId: number;
  developerId: number;
  existingProjectId?: number | null;
  existingPlanId?: number | null;
  onSuccess: () => void;
  onSkip: () => void;
  apiBaseUrl: string;
}

// ─── Step badge ───────────────────────────────────────────────────────────────

function StepBadge({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
          done
            ? "bg-green-500 text-white"
            : active
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {done ? "✓" : number}
      </span>
      <span
        className={`text-sm font-medium ${active ? "text-gray-900" : "text-gray-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 h-4 w-4 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

function PaymentPlanSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 h-4 w-4 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-3 w-36" />
          <div className="flex gap-6 pt-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Payment Plan card ─────────────────────────────────────────────────

function CustomPaymentPlanCard({
  isSelected,
  onSelect,
  file,
  onFileChange,
}: {
  isSelected: boolean;
  onSelect: () => void;
  file: File | null;
  onFileChange: (f: File | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (picked) onFileChange(picked);
    e.target.value = "";
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-lg border-2 border-dashed p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-purple-500 bg-purple-50"
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            isSelected ? "border-purple-600" : "border-gray-300"
          }`}
        >
          {isSelected && <div className="h-2 w-2 rounded-full bg-purple-600" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">
              Custom Payment Plan
            </span>
            <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
              Custom
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload your own payment schedule as an Excel file (.xlsx / .xls)
          </p>

          <div className="mt-3" onClick={(e) => e.stopPropagation()}>
            {!file ? (
              <button
                type="button"
                disabled={!isSelected}
                onClick={() => inputRef.current?.click()}
                className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors ${
                  isSelected
                    ? "border-purple-300 bg-white text-purple-700 hover:bg-purple-50 cursor-pointer"
                    : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                {isSelected
                  ? "Click to upload Excel file"
                  : "Select this plan to upload"}
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-green-600 text-white text-xs font-bold">
                  XLS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="ml-1 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-green-100 hover:text-red-500 transition-colors"
                  title="Remove file"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Plan type badge ──────────────────────────────────────────────────────────

function PlanTypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    "Construction Linked": "bg-blue-100 text-blue-700",
    "Time Linked": "bg-purple-100 text-purple-700",
    "Down Payment": "bg-amber-100 text-amber-700",
    Flexi: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[type] ?? "bg-gray-100 text-gray-600"}`}
    >
      {type}
    </span>
  );
}

// ─── Submit step label helper ─────────────────────────────────────────────────

type SubmitStep =
  | "idle"
  | "creating_booking"
  | "generating_schedule"
  | "uploading_plan"
  | "done";

function submitLabel(step: SubmitStep): string {
  switch (step) {
    case "creating_booking":
      return "Creating booking…";
    case "generating_schedule":
      return "Generating payment schedule…";
    case "uploading_plan":
      return "Uploading custom plan…";
    default:
      return "Save & Finish";
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CustomerPropertyPlanForm({
  customerId,
  developerId,
  existingProjectId,
  existingPlanId,
  onSuccess,
  onSkip,
  apiBaseUrl,
}: CustomerPropertyPlanFormProps) {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [selectedProject, setSelectedProject] = useState<ApiProject | null>(
    null,
  );

  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [customPlanFile, setCustomPlanFile] = useState<File | null>(null);

  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitting = submitStep !== "idle" && submitStep !== "done";

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("crm_access_token")
      : null;

  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // ── Fetch projects on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);

      const [data] = await Promise.all([
        fetch(`${apiBaseUrl}/projects?page=1&limit=100`, {
          headers: authHeaders,
        })
          .then((res) => {
            if (!res.ok)
              throw new Error(`Error ${res.status}: ${res.statusText}`);
            return res.json();
          })
          .catch((err: Error) => {
            setProjectsError(err.message || "Failed to load projects");
            return null;
          }),
        new Promise((resolve) => setTimeout(resolve, 400)),
      ]);

      if (data?.success && Array.isArray(data.data)) {
        setProjects(data.data);
        if (existingProjectId) {
          const preSelected = data.data.find(
            (p: ApiProject) => p.project_id === existingProjectId,
          );
          if (preSelected) handleProjectSelect(preSelected);
        }
      }

      setProjectsLoading(false);
    };

    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl]);

  // ── Fetch payment plans when project selected ────────────────────────────
  const handleProjectSelect = async (project: ApiProject) => {
    setSelectedProject(project);
    setSelectedPlanId(null);
    setCustomPlanFile(null);
    setPaymentPlans([]);
    setPlansError(null);
    setPlansLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/projects/${project.project_id}`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      const plans: PaymentPlan[] = json.data?.payment_plans ?? [];
      setPaymentPlans(plans);
      if (existingPlanId) {
        const exists = plans.some((p) => p.plan_id === existingPlanId);
        if (exists) setSelectedPlanId(existingPlanId);
      }
    } catch (err: unknown) {
      setPlansError(
        err instanceof Error ? err.message : "Failed to load payment plans.",
      );
    } finally {
      setPlansLoading(false);
    }
  };

  // ── Submit: create booking → generate schedule → (optional) upload custom plan ──
  const handleSubmit = async () => {
    setSubmitError(null);

    if (!selectedProject) {
      setSubmitError("Please select a project.");
      return;
    }

    const isCustomPlan = selectedPlanId === CUSTOM_PLAN_ID;

    try {
      // ── Step 1: Create booking ──────────────────────────────────────────
      setSubmitStep("creating_booking");

      const bookingPayload: Record<string, unknown> = {
        customer_id: customerId,
        developer_id: developerId,
        project_id: selectedProject.project_id,
        booking_date: new Date().toISOString().split("T")[0], // today as YYYY-MM-DD
      };

      // Only include payment_plan_id when a real plan (not custom) is chosen
      if (selectedPlanId !== null && !isCustomPlan) {
        bookingPayload.payment_plan_id = selectedPlanId;
      }

      const bookingRes = await fetch(`${apiBaseUrl}/bookings`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(bookingPayload),
      });

      const bookingJson = await bookingRes.json();
      if (!bookingRes.ok) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        throw new Error(bookingJson.message || "Failed to create booking");
      }

      const bookingId: number = bookingJson.data.booking_id;
      window.scrollTo({ top: 0, behavior: "smooth" });

      // ── Step 2: Generate payment schedule ──────────────────────────────
      setSubmitStep("generating_schedule");

      const scheduleRes = await fetch(
        `${apiBaseUrl}/payment-actions/schedules/generate/${bookingId}`,
        {
          method: "POST",
          headers: authHeaders,
        },
      );

      if (!scheduleRes.ok) {
        const scheduleJson = await scheduleRes.json().catch(() => ({}));
        window.scrollTo({ top: 0, behavior: "smooth" });
        throw new Error(
          scheduleJson.message ||
            "Booking created but schedule generation failed.",
        );
      }
      window.scrollTo({ top: 0, behavior: "smooth" });

      // ── Step 3 (optional): Upload custom plan file ──────────────────────
      if (isCustomPlan && customPlanFile) {
        setSubmitStep("uploading_plan");

        const formData = new FormData();
        formData.append("file", customPlanFile);
        formData.append("customer_id", String(customerId));
        formData.append("project_id", String(selectedProject.project_id));

        const uploadRes = await fetch(
          `${apiBaseUrl}/customers/${customerId}/payment-plan/upload`,
          {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          const uploadJson = await uploadRes.json().catch(() => ({}));
          throw new Error(
            uploadJson.message || "Booking saved but file upload failed.",
          );
        }
      }

      setSubmitStep("done");
      onSuccess();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
      setSubmitStep("idle");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-2">
        <StepBadge number={1} label="Basic Info" active={false} done />
        <div className="h-px flex-1 bg-gray-200" />
        <StepBadge number={2} label="Property & Plan" active={true} />
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        ✓ Customer profile created (ID: {customerId}). Now assign a project.
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* ── In-progress status banner ── */}
      {isSubmitting && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700 flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
          {submitLabel(submitStep)}
        </div>
      )}

      {/* ── Project Selection ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Select Project <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectsError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {projectsError}
            </div>
          ) : projectsLoading ? (
            <div className="space-y-3">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No projects available.
            </p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const isSelected =
                  selectedProject?.project_id === project.project_id;
                return (
                  <div
                    key={project.project_id}
                    onClick={() => handleProjectSelect(project)}
                    className={`rounded-lg border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-purple-600 bg-purple-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "border-purple-600" : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-purple-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            {project.project_name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              project.project_status === "Active"
                                ? "bg-green-100 text-green-700"
                                : project.project_status === "Completed"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {project.project_status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                            {project.project_category}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-0.5">
                          {project.locality}, {project.city}, {project.state}
                        </p>

                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                          <span>
                            <span className="font-medium text-gray-700">
                              Type:
                            </span>{" "}
                            {project.project_type}
                          </span>
                          <span>
                            <span className="font-medium text-gray-700">
                              Units:
                            </span>{" "}
                            {project.total_units}
                          </span>
                          <span>
                            <span className="font-medium text-gray-700">
                              Possession:
                            </span>{" "}
                            {project.possession_status}
                          </span>
                          <span>
                            <span className="font-medium text-gray-700">
                              Developer:
                            </span>{" "}
                            {project.developer_name}
                          </span>
                        </div>

                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Construction progress</span>
                            <span>
                              {project.construction_stage_percentage}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-gray-200">
                            <div
                              className="h-1.5 rounded-full bg-purple-500 transition-all"
                              style={{
                                width: `${project.construction_stage_percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Payment Plans ── */}
      {selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Payment Plan</CardTitle>
            <p className="text-sm text-muted-foreground">
              Payment plans available for{" "}
              <span className="font-medium text-gray-700">
                {selectedProject.project_name}
              </span>
            </p>
          </CardHeader>
          <CardContent>
            {plansLoading ? (
              <div className="space-y-3">
                <PaymentPlanSkeleton />
                <PaymentPlanSkeleton />
              </div>
            ) : plansError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {plansError}
              </div>
            ) : (
              <div className="space-y-3">
                {paymentPlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.plan_id;
                  return (
                    <div
                      key={plan.plan_id}
                      onClick={() =>
                        setSelectedPlanId(isSelected ? null : plan.plan_id)
                      }
                      className={`rounded-lg border p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-purple-600 bg-purple-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? "border-purple-600" : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-purple-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">
                              {plan.plan_name}
                            </span>
                            <PlanTypeBadge type={plan.plan_type} />
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                plan.plan_status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {plan.plan_status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            {plan.plan_code}
                          </p>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                            <span>
                              <span className="font-medium text-gray-700">
                                Installments:
                              </span>{" "}
                              {plan.total_installments}
                            </span>
                            <span>
                              <span className="font-medium text-gray-700">
                                Booking:
                              </span>{" "}
                              {plan.booking_amount_percentage}%
                            </span>
                            <span>
                              <span className="font-medium text-gray-700">
                                Down Payment:
                              </span>{" "}
                              {plan.down_payment_percentage}%
                            </span>
                            <span>
                              <span className="font-medium text-gray-700">
                                VAT:
                              </span>{" "}
                              {plan.vat_percentage}%
                            </span>
                            {plan.early_payment_discount_percentage > 0 && (
                              <span>
                                <span className="font-medium text-green-700">
                                  Early discount:
                                </span>{" "}
                                <span className="text-green-700">
                                  {plan.early_payment_discount_percentage}%
                                </span>
                              </span>
                            )}
                          </div>
                          {plan.special_offers &&
                            Object.keys(plan.special_offers).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.values(plan.special_offers).map(
                                  (offer, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-700"
                                    >
                                      🎁 {offer}
                                    </span>
                                  ),
                                )}
                              </div>
                            )}
                          {plan.penalty_terms && (
                            <p className="mt-2 text-xs text-gray-400 italic">
                              Penalty: {plan.penalty_terms}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <CustomPaymentPlanCard
                  isSelected={selectedPlanId === CUSTOM_PLAN_ID}
                  onSelect={() =>
                    setSelectedPlanId(
                      selectedPlanId === CUSTOM_PLAN_ID ? null : CUSTOM_PLAN_ID,
                    )
                  }
                  file={customPlanFile}
                  onFileChange={setCustomPlanFile}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Actions ── */}
      <div className="flex justify-between gap-3 pb-6">
        <Button variant="ghost" onClick={onSkip} disabled={isSubmitting}>
          Skip for now
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedProject || projectsLoading}
        >
          {isSubmitting ? submitLabel(submitStep) : "Save & Finish"}
        </Button>
      </div>
    </div>
  );
}
