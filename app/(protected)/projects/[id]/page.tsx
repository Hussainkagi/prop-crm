"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Building,
  MapPin,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Save,
  CreditCard,
  CheckSquare,
  Square,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentPlan {
  plan_id: number;
  plan_name: string;
  plan_code: string;
  plan_type: string;
  plan_status: string;
  total_installments: number;
  booking_amount_percentage: number | string;
  vat_applicable?: boolean;
  vat_percentage: number | string;
  down_payment_percentage?: number;
  early_payment_discount_percentage?: number;
  penalty_terms?: string;
}

interface ProjectDetail {
  project_id: number;
  project_name: string;
  project_type: string;
  project_category: string;
  rera_registration_number: string;
  project_address_line1: string;
  project_address_line2: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  latitude: string | null;
  longitude: string | null;
  total_land_area: string;
  land_area_unit: string;
  total_built_up_area: string;
  number_of_towers: number;
  total_units: number;
  launch_date: string;
  expected_completion_date: string;
  actual_completion_date: string | null;
  project_status: string;
  possession_status: string;
  construction_stage_percentage: number;
  amenities: Record<string, boolean | string>;
  developer_name: string;
  payment_plans: PaymentPlan[];
}

type FormErrors = Partial<Record<string, string>>;

// ─── Amenity helpers ──────────────────────────────────────────────────────────

const AMENITY_KEY_MAP: Record<string, string> = {
  "Swimming Pool": "swimming_pool",
  Gym: "gym",
  Clubhouse: "clubhouse",
  "Children Play Area": "children_play_area",
  "24Hr Security": "24hr_security",
  "Power Backup": "power_backup",
  "Indoor Games": "indoor_games",
  "Jogging Track": "jogging_track",
  "Tennis Court": "tennis_court",
  "Badminton Court": "badminton_court",
};

// reverse map: api_key → display label
const AMENITY_DISPLAY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(AMENITY_KEY_MAP).map(([label, key]) => [key, label]),
);

const PRESET_AMENITIES = Object.keys(AMENITY_KEY_MAP);

function amenityKeyToLabel(key: string): string {
  return (
    AMENITY_DISPLAY_MAP[key] ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function amenitiesToApiPayload(
  amenities: string[],
): Record<string, boolean | string> {
  const payload: Record<string, boolean | string> = {};
  amenities.forEach((a) => {
    const key = AMENITY_KEY_MAP[a] ?? a.toLowerCase().replace(/\s+/g, "_");
    payload[key] = true;
  });
  return payload;
}

// Convert API amenities object → display label array
function apiAmenitiesToLabels(
  amenities: Record<string, boolean | string>,
): string[] {
  return Object.entries(amenities)
    .filter(([, v]) => v === true || (typeof v === "string" && v))
    .map(([k]) => amenityKeyToLabel(k));
}

// ─── API helpers ──────────────────────────────────────────────────────────────

function getToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("crm_access_token")
    : null;
}

async function fetchProject(id: string): Promise<ProjectDetail> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Error ${res.status}`);
  }
  const json = await res.json();
  return json.data as ProjectDetail;
}

async function fetchAllPaymentPlans(): Promise<PaymentPlan[]> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/payment-plans?page=1&limit=100`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Failed to fetch payment plans: ${res.status}`);
  const json = await res.json();
  return json.data as PaymentPlan[];
}

async function updateProject(
  id: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("No access token.");
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Error ${res.status}`);
  }
}

async function linkPaymentPlans(
  projectId: number,
  planIds: number[],
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("No access token.");
  const res = await fetch(`${BASE_URL}/payment-plans/link-project`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ project_id: projectId, plan_ids: planIds }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    window.scrollTo({ top: 0, behavior: "smooth" });
    throw new Error(err?.message ?? `Error ${res.status}`);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── Small components ─────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

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

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-7 w-64" />
      </div>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <Skeleton className="mb-4 h-5 w-40" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Edit Form State ──────────────────────────────────────────────────────────

interface EditFormState {
  project_name: string;
  project_type: string;
  project_category: string;
  rera_registration_number: string;
  project_address_line1: string;
  project_address_line2: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  latitude: string;
  longitude: string;
  total_land_area: string;
  land_area_unit: string;
  total_built_up_area: string;
  number_of_towers: string;
  total_units: string;
  launch_date: string;
  expected_completion_date: string;
  actual_completion_date: string;
  project_status: string;
  possession_status: string;
  construction_stage_percentage: string;
  amenities: string[];
}

function projectToFormState(p: ProjectDetail): EditFormState {
  const toDate = (iso: string | null) => {
    if (!iso) return "";
    try {
      return new Date(iso).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };
  return {
    project_name: p.project_name ?? "",
    project_type: p.project_type ?? "",
    project_category: p.project_category ?? "",
    rera_registration_number: p.rera_registration_number ?? "",
    project_address_line1: p.project_address_line1 ?? "",
    project_address_line2: p.project_address_line2 ?? "",
    locality: p.locality ?? "",
    city: p.city ?? "",
    state: p.state ?? "",
    pincode: p.pincode ?? "",
    landmark: p.landmark ?? "",
    latitude: p.latitude ?? "",
    longitude: p.longitude ?? "",
    total_land_area: p.total_land_area ?? "",
    land_area_unit: p.land_area_unit ?? "sq.ft",
    total_built_up_area: p.total_built_up_area ?? "",
    number_of_towers: String(p.number_of_towers ?? ""),
    total_units: String(p.total_units ?? ""),
    launch_date: toDate(p.launch_date),
    expected_completion_date: toDate(p.expected_completion_date),
    actual_completion_date: toDate(p.actual_completion_date),
    project_status: p.project_status ?? "",
    possession_status: p.possession_status ?? "",
    construction_stage_percentage: String(
      p.construction_stage_percentage ?? "",
    ),
    amenities: p.amenities ? apiAmenitiesToLabels(p.amenities) : [],
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [form, setForm] = useState<EditFormState | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Payment plans
  const [allPlans, setAllPlans] = useState<PaymentPlan[]>([]);
  const [linkedPlanIds, setLinkedPlanIds] = useState<number[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // UI state
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [linkWarning, setLinkWarning] = useState("");
  const [currentAmenity, setCurrentAmenity] = useState("");

  // Load project + all payment plans in parallel
  const loadData = useCallback(async () => {
    if (!projectId) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const [proj, plans] = await Promise.all([
        fetchProject(projectId),
        fetchAllPaymentPlans().catch(() => [] as PaymentPlan[]),
      ]);
      setProject(proj);
      setForm(projectToFormState(proj));
      setAllPlans(plans);
      // Pre-select currently linked plans
      const alreadyLinked = (proj.payment_plans ?? []).map((p) => p.plan_id);
      setLinkedPlanIds(alreadyLinked);
    } catch (err: unknown) {
      setPageError(
        err instanceof Error ? err.message : "Failed to load project.",
      );
    } finally {
      setPlansLoading(false);
      setPageLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (pageLoading) return <PageSkeleton />;
  if (pageError || !form || !project) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{pageError ?? "Project not found."}</span>
            <Button variant="outline" size="sm" onClick={loadData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ── helpers ──
  const set = (field: keyof EditFormState, value: string | string[]) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const togglePlan = (planId: number) => {
    setLinkedPlanIds((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId],
    );
  };

  const addAmenity = (amenity?: string) => {
    const value = (amenity ?? currentAmenity).trim();
    if (!value || form.amenities.includes(value)) return;
    set("amenities", [...form.amenities, value]);
    if (!amenity) setCurrentAmenity("");
  };

  const removeAmenity = (index: number) => {
    set(
      "amenities",
      form.amenities.filter((_, i) => i !== index),
    );
  };

  // ── validation ──
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.project_name.trim())
      errs.project_name = "Project name is required.";
    if (!form.project_type) errs.project_type = "Project type is required.";
    if (!form.project_address_line1.trim())
      errs.project_address_line1 = "Address line 1 is required.";
    if (!form.locality.trim()) errs.locality = "Locality is required.";
    if (!form.city.trim()) errs.city = "City is required.";
    if (!form.state.trim()) errs.state = "State is required.";
    if (!form.pincode.trim()) errs.pincode = "Pincode is required.";
    if (!form.total_units.trim() || Number(form.total_units) <= 0)
      errs.total_units = "Total units must be a positive number.";
    if (!form.launch_date) errs.launch_date = "Launch date is required.";
    if (!form.expected_completion_date)
      errs.expected_completion_date = "Expected completion date is required.";
    if (form.launch_date && form.expected_completion_date) {
      if (new Date(form.expected_completion_date) <= new Date(form.launch_date))
        errs.expected_completion_date = "Must be after launch date.";
    }
    if (!form.project_status)
      errs.project_status = "Project status is required.";
    const csp = Number(form.construction_stage_percentage);
    if (
      form.construction_stage_percentage &&
      (isNaN(csp) || csp < 0 || csp > 100)
    )
      errs.construction_stage_percentage = "Must be between 0 and 100.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setLinkWarning("");

    if (!validate()) {
      const firstKey = Object.keys(errors)[0];
      document
        .getElementById(firstKey)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Build update payload
      const payload: Record<string, unknown> = {
        project_name: form.project_name.trim(),
        project_type: form.project_type,
        project_category: form.project_category || undefined,
        rera_registration_number: form.rera_registration_number.trim(),
        project_address_line1: form.project_address_line1.trim(),
        project_address_line2: form.project_address_line2.trim() || undefined,
        locality: form.locality.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        landmark: form.landmark.trim() || undefined,
        total_units: Number(form.total_units),
        launch_date: form.launch_date,
        expected_completion_date: form.expected_completion_date,
        project_status: form.project_status,
        possession_status: form.possession_status,
        amenities: amenitiesToApiPayload(form.amenities),
        construction_stage_percentage: form.construction_stage_percentage
          ? Number(form.construction_stage_percentage)
          : undefined,
      };
      if (form.latitude) payload.latitude = parseFloat(form.latitude);
      if (form.longitude) payload.longitude = parseFloat(form.longitude);
      if (form.total_land_area)
        payload.total_land_area = parseFloat(form.total_land_area);
      if (form.land_area_unit) payload.land_area_unit = form.land_area_unit;
      if (form.total_built_up_area)
        payload.total_built_up_area = parseFloat(form.total_built_up_area);
      if (form.number_of_towers)
        payload.number_of_towers = Number(form.number_of_towers);
      if (form.actual_completion_date)
        payload.actual_completion_date = form.actual_completion_date;

      await updateProject(projectId, payload);

      // Link payment plans if selection changed
      const originalIds = (project.payment_plans ?? []).map((p) => p.plan_id);
      const newIds = linkedPlanIds.filter((id) => !originalIds.includes(id));
      if (newIds.length > 0) {
        try {
          await linkPaymentPlans(project.project_id, newIds);
        } catch (linkErr: unknown) {
          const msg =
            linkErr instanceof Error ? linkErr.message : "Linking failed.";
          setLinkWarning(
            `Project updated, but payment plan linking failed: ${msg}`,
          );
        }
      }

      if (!linkWarning) setSuccessMsg("Project updated successfully!");
    } catch (err: unknown) {
      setErrors({
        api: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── options ──
  const projectTypes = ["Residential", "Commercial", "Mixed Use"];
  const projectCategories = [
    "Luxury",
    "Mid-Range",
    "Affordable",
    "Premium",
    "Budget",
  ];
  const landAreaUnits = ["sq.ft", "sq.m", "acres", "hectares", "Acres"];
  const projectStatuses = [
    "Planning",
    "Under Construction",
    "Active",
    "Completed",
    "On Hold",
    "Cancelled",
  ];
  const possessionStatuses = [
    "Not Started",
    "Ready to Move",
    "Under Construction",
    "Possession Given",
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/projects")}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Edit Project</h2>
          <p className="text-sm text-muted-foreground">
            {project.project_name}
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          ID: {project.project_id}
        </Badge>
      </div>

      {/* Banners */}
      {errors.api && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.api}</AlertDescription>
        </Alert>
      )}
      {linkWarning && (
        <Alert className="mb-4 border-amber-400 bg-amber-50 text-amber-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{linkWarning}</AlertDescription>
        </Alert>
      )}
      {successMsg && (
        <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* ── Basic Information ── */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Building className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={form.project_name}
                  onChange={(e) => set("project_name", e.target.value)}
                  className={errors.project_name ? "border-red-500" : ""}
                />
                <FieldError msg={errors.project_name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_type">Project Type *</Label>
                <Select
                  value={form.project_type}
                  onValueChange={(v) => set("project_type", v)}
                >
                  <SelectTrigger
                    id="project_type"
                    className={errors.project_type ? "border-red-500" : ""}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError msg={errors.project_type} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_category">Project Category</Label>
                <Select
                  value={form.project_category}
                  onValueChange={(v) => set("project_category", v)}
                >
                  <SelectTrigger id="project_category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rera_registration_number">
                  RERA Registration Number
                </Label>
                <Input
                  id="rera_registration_number"
                  value={form.rera_registration_number}
                  onChange={(e) =>
                    set("rera_registration_number", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Address ── */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <MapPin className="h-4 w-4" />
              Address Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project_address_line1">Address Line 1 *</Label>
                <Input
                  id="project_address_line1"
                  value={form.project_address_line1}
                  onChange={(e) => set("project_address_line1", e.target.value)}
                  className={
                    errors.project_address_line1 ? "border-red-500" : ""
                  }
                />
                <FieldError msg={errors.project_address_line1} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project_address_line2">Address Line 2</Label>
                <Input
                  id="project_address_line2"
                  value={form.project_address_line2}
                  onChange={(e) => set("project_address_line2", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locality">Locality *</Label>
                <Input
                  id="locality"
                  value={form.locality}
                  onChange={(e) => set("locality", e.target.value)}
                  className={errors.locality ? "border-red-500" : ""}
                />
                <FieldError msg={errors.locality} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={errors.city ? "border-red-500" : ""}
                />
                <FieldError msg={errors.city} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  className={errors.state ? "border-red-500" : ""}
                />
                <FieldError msg={errors.state} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={form.pincode}
                  onChange={(e) => set("pincode", e.target.value)}
                  maxLength={6}
                  className={errors.pincode ? "border-red-500" : ""}
                />
                <FieldError msg={errors.pincode} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={form.landmark}
                  onChange={(e) => set("landmark", e.target.value)}
                  placeholder="Nearby landmark"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.00000001"
                  value={form.latitude}
                  onChange={(e) => set("latitude", e.target.value)}
                  placeholder="12.97194"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.00000001"
                  value={form.longitude}
                  onChange={(e) => set("longitude", e.target.value)}
                  placeholder="77.75070"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Project Details ── */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Project Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="total_land_area">Total Land Area</Label>
                <div className="flex gap-2">
                  <Input
                    id="total_land_area"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.total_land_area}
                    onChange={(e) => set("total_land_area", e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={form.land_area_unit}
                    onValueChange={(v) => set("land_area_unit", v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {landAreaUnits.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_built_up_area">
                  Total Built-up Area (sq.ft)
                </Label>
                <Input
                  id="total_built_up_area"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.total_built_up_area}
                  onChange={(e) => set("total_built_up_area", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number_of_towers">
                  Number of Towers/Blocks
                </Label>
                <Input
                  id="number_of_towers"
                  type="number"
                  min="1"
                  value={form.number_of_towers}
                  onChange={(e) => set("number_of_towers", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_units">Total Units *</Label>
                <Input
                  id="total_units"
                  type="number"
                  min="1"
                  value={form.total_units}
                  onChange={(e) => set("total_units", e.target.value)}
                  className={errors.total_units ? "border-red-500" : ""}
                />
                <FieldError msg={errors.total_units} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Dates & Status ── */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Dates & Status</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="launch_date">Launch Date *</Label>
                <Input
                  id="launch_date"
                  type="date"
                  value={form.launch_date}
                  onChange={(e) => set("launch_date", e.target.value)}
                  className={errors.launch_date ? "border-red-500" : ""}
                />
                <FieldError msg={errors.launch_date} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_completion_date">
                  Expected Completion Date *
                </Label>
                <Input
                  id="expected_completion_date"
                  type="date"
                  value={form.expected_completion_date}
                  onChange={(e) =>
                    set("expected_completion_date", e.target.value)
                  }
                  className={
                    errors.expected_completion_date ? "border-red-500" : ""
                  }
                />
                <FieldError msg={errors.expected_completion_date} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual_completion_date">
                  Actual Completion Date
                </Label>
                <Input
                  id="actual_completion_date"
                  type="date"
                  value={form.actual_completion_date}
                  onChange={(e) =>
                    set("actual_completion_date", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_status">Project Status *</Label>
                <Select
                  value={form.project_status}
                  onValueChange={(v) => set("project_status", v)}
                >
                  <SelectTrigger
                    id="project_status"
                    className={errors.project_status ? "border-red-500" : ""}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError msg={errors.project_status} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="possession_status">Possession Status</Label>
                <Select
                  value={form.possession_status}
                  onValueChange={(v) => set("possession_status", v)}
                >
                  <SelectTrigger id="possession_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {possessionStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="construction_stage_percentage">
                  Construction Stage (%)
                </Label>
                <Input
                  id="construction_stage_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={form.construction_stage_percentage}
                  onChange={(e) =>
                    set("construction_stage_percentage", e.target.value)
                  }
                  placeholder="0–100"
                  className={
                    errors.construction_stage_percentage ? "border-red-500" : ""
                  }
                />
                <FieldError msg={errors.construction_stage_percentage} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Amenities ── */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Amenities</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {PRESET_AMENITIES.map((a) => {
                const selected = form.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      selected
                        ? removeAmenity(form.amenities.indexOf(a))
                        : addAmenity(a)
                    }
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${selected ? "border-green-600 bg-green-100 text-green-800" : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"}`}
                  >
                    {selected && <span className="mr-1">✓</span>}
                    {a}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={currentAmenity}
                onChange={(e) => setCurrentAmenity(e.target.value)}
                placeholder="Add custom amenity"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => addAmenity()}
                size="icon"
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.amenities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {form.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-sm"
                  >
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Payment Plans ── */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-1 flex items-center gap-2 text-base font-semibold">
              <CreditCard className="h-4 w-4" />
              Payment Plans
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Currently linked plans are pre-selected. Select additional plans
              to link them to this project.
            </p>

            {plansLoading && (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading payment plans…
              </div>
            )}

            {!plansLoading && allPlans.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No payment plans available.
              </p>
            )}

            {!plansLoading && allPlans.length > 0 && (
              <div className="space-y-3">
                {allPlans.map((plan) => {
                  const isLinked = linkedPlanIds.includes(plan.plan_id);
                  const wasOriginallyLinked = (
                    project.payment_plans ?? []
                  ).some((p) => p.plan_id === plan.plan_id);
                  return (
                    <button
                      key={plan.plan_id}
                      type="button"
                      onClick={() => togglePlan(plan.plan_id)}
                      className={`w-full rounded-lg border p-4 text-left transition-colors ${
                        isLinked
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 shrink-0 ${isLinked ? "text-green-600" : "text-gray-400"}`}
                        >
                          {isLinked ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm">
                              {plan.plan_name}
                            </span>
                            <PlanTypeBadge type={plan.plan_type} />
                            <span
                              className={`text-xs rounded-full px-2 py-0.5 ${plan.plan_status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                            >
                              {plan.plan_status}
                            </span>
                            {wasOriginallyLinked && (
                              <span className="text-xs rounded-full px-2 py-0.5 bg-blue-100 text-blue-600 font-medium">
                                Already linked
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground font-mono">
                            {plan.plan_code}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>
                              <span className="font-medium text-foreground">
                                {plan.total_installments}
                              </span>{" "}
                              installments
                            </span>
                            <span>
                              Booking:{" "}
                              <span className="font-medium text-foreground">
                                {plan.booking_amount_percentage}%
                              </span>
                            </span>
                            {Number(plan.vat_percentage) > 0 && (
                              <span>
                                VAT:{" "}
                                <span className="font-medium text-foreground">
                                  {plan.vat_percentage}%
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {linkedPlanIds.length > 0 && (
              <p className="mt-3 text-sm text-green-700 font-medium">
                {linkedPlanIds.length} plan{linkedPlanIds.length > 1 ? "s" : ""}{" "}
                selected
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/projects")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
