"use client";

import { useState } from "react";
import { Building, X, Plus, MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectFormData {
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
  selectedPaymentPlan: string;
}

type FormErrors = Partial<
  Record<keyof ProjectFormData | "api" | "token", string>
>;

interface RegisterProjectFormProps {
  onSubmit?: (data: ProjectFormData) => void;
  onCancel: () => void;
}

// ─── Amenity → API key mapping ────────────────────────────────────────────────

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

// ─── Validation ───────────────────────────────────────────────────────────────

const PINCODE_RE = /^\d{6}$/;
const RERA_RE = /^RERA-[A-Z]{2}-\d{4}-\d{6}$/;
const COORD_RE = /^-?\d+(\.\d+)?$/;

function validate(data: ProjectFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.project_name.trim())
    errors.project_name = "Project name is required.";
  if (!data.project_type) errors.project_type = "Project type is required.";
  if (!data.rera_registration_number.trim()) {
    errors.rera_registration_number = "RERA number is required.";
  } else if (!RERA_RE.test(data.rera_registration_number.trim())) {
    errors.rera_registration_number =
      "Format must be RERA-XX-YYYY-NNNNNN (e.g. RERA-KA-2023-007890).";
  }

  // Address
  if (!data.project_address_line1.trim())
    errors.project_address_line1 = "Address line 1 is required.";
  if (!data.locality.trim()) errors.locality = "Locality is required.";
  if (!data.city.trim()) errors.city = "City is required.";
  if (!data.state.trim()) errors.state = "State is required.";
  if (!data.pincode.trim()) {
    errors.pincode = "Pincode is required.";
  } else if (!PINCODE_RE.test(data.pincode.trim())) {
    errors.pincode = "Pincode must be exactly 6 digits.";
  }

  if (data.latitude && !COORD_RE.test(data.latitude))
    errors.latitude = "Enter a valid latitude.";
  if (data.longitude && !COORD_RE.test(data.longitude))
    errors.longitude = "Enter a valid longitude.";

  if (data.latitude) {
    const lat = parseFloat(data.latitude);
    if (lat < -90 || lat > 90)
      errors.latitude = "Latitude must be between -90 and 90.";
  }
  if (data.longitude) {
    const lon = parseFloat(data.longitude);
    if (lon < -180 || lon > 180)
      errors.longitude = "Longitude must be between -180 and 180.";
  }

  // Project details
  if (!data.total_units.trim()) {
    errors.total_units = "Total units is required.";
  } else if (isNaN(Number(data.total_units)) || Number(data.total_units) <= 0) {
    errors.total_units = "Total units must be a positive number.";
  }

  if (data.total_land_area && Number(data.total_land_area) <= 0)
    errors.total_land_area = "Land area must be positive.";
  if (data.total_built_up_area && Number(data.total_built_up_area) <= 0)
    errors.total_built_up_area = "Built-up area must be positive.";
  if (data.number_of_towers && Number(data.number_of_towers) <= 0)
    errors.number_of_towers = "Number of towers must be positive.";

  const csp = Number(data.construction_stage_percentage);
  if (
    data.construction_stage_percentage &&
    (isNaN(csp) || csp < 0 || csp > 100)
  ) {
    errors.construction_stage_percentage =
      "Construction stage must be between 0 and 100.";
  }

  // Dates
  if (!data.launch_date) errors.launch_date = "Launch date is required.";
  if (!data.expected_completion_date)
    errors.expected_completion_date = "Expected completion date is required.";

  if (data.launch_date && data.expected_completion_date) {
    if (new Date(data.expected_completion_date) <= new Date(data.launch_date)) {
      errors.expected_completion_date =
        "Expected completion date must be after launch date.";
    }
  }

  if (data.actual_completion_date && data.launch_date) {
    if (new Date(data.actual_completion_date) < new Date(data.launch_date)) {
      errors.actual_completion_date =
        "Actual completion date cannot be before launch date.";
    }
  }

  if (!data.project_status)
    errors.project_status = "Project status is required.";

  return errors;
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function createProject(data: ProjectFormData): Promise<void> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("crm_access_token")
      : null;

  if (!token) throw new Error("No access token found. Please log in again.");

  const payload: Record<string, unknown> = {
    project_name: data.project_name.trim(),
    project_type: data.project_type,
    rera_registration_number: data.rera_registration_number.trim(),
    project_address_line1: data.project_address_line1.trim(),
    project_address_line2: data.project_address_line2.trim() || undefined,
    locality: data.locality.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    pincode: data.pincode.trim(),
    landmark: data.landmark.trim() || undefined,
    total_units: Number(data.total_units),
    launch_date: data.launch_date,
    expected_completion_date: data.expected_completion_date,
    project_status: data.project_status,
    possession_status: data.possession_status,
    amenities: amenitiesToApiPayload(data.amenities),
  };

  if (data.project_category) payload.project_category = data.project_category;
  if (data.latitude) payload.latitude = parseFloat(data.latitude);
  if (data.longitude) payload.longitude = parseFloat(data.longitude);
  if (data.total_land_area)
    payload.total_land_area = parseFloat(data.total_land_area);
  if (data.land_area_unit) payload.land_area_unit = data.land_area_unit;
  if (data.total_built_up_area)
    payload.total_built_up_area = parseFloat(data.total_built_up_area);
  if (data.number_of_towers)
    payload.number_of_towers = Number(data.number_of_towers);
  if (data.actual_completion_date)
    payload.actual_completion_date = data.actual_completion_date;
  if (data.construction_stage_percentage)
    payload.construction_stage_percentage = Number(
      data.construction_stage_percentage,
    );
  if (data.selectedPaymentPlan) payload.payment_plan = data.selectedPaymentPlan;

  const res = await fetch(`${BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `Server error: ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message ?? err?.error ?? message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }
}

// ─── Field error helper ───────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

// ─── Preset amenity chips ─────────────────────────────────────────────────────

const PRESET_AMENITIES = [
  "Swimming Pool",
  "Gym",
  "Clubhouse",
  "Children Play Area",
  "24Hr Security",
  "Power Backup",
  "Indoor Games",
  "Jogging Track",
  "Tennis Court",
  "Badminton Court",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterProjectForm({
  onSubmit,
  onCancel,
}: RegisterProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    project_name: "",
    project_type: "Residential",
    project_category: "",
    rera_registration_number: "",
    project_address_line1: "",
    project_address_line2: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    latitude: "",
    longitude: "",
    total_land_area: "",
    land_area_unit: "sq.ft",
    total_built_up_area: "",
    number_of_towers: "",
    total_units: "",
    launch_date: "",
    expected_completion_date: "",
    actual_completion_date: "",
    project_status: "Under Construction",
    possession_status: "Not Started",
    construction_stage_percentage: "",
    amenities: [],
    selectedPaymentPlan: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [currentAmenity, setCurrentAmenity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const set = (field: keyof ProjectFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // clear error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const addAmenity = (amenity?: string) => {
    const value = (amenity ?? currentAmenity).trim();
    if (!value) return;
    if (formData.amenities.includes(value)) return;
    set("amenities", [...formData.amenities, value]);
    if (!amenity) setCurrentAmenity("");
  };

  const removeAmenity = (index: number) => {
    set(
      "amenities",
      formData.amenities.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");

    // Check token first
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("crm_access_token")
        : null;
    if (!token) {
      setErrors({ token: "No access token found. Please log in again." });
      return;
    }

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // scroll to first error
      const firstKey = Object.keys(validationErrors)[0];
      document
        .getElementById(firstKey)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      await createProject(formData);
      setSuccessMsg("Project registered successfully!");
      onSubmit?.(formData);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setErrors({ api: message });
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
  const paymentPlans = [
    {
      id: "20-80",
      name: "20-80 Plan",
      description: "20% down payment, balance in 36 monthly installments",
      downPayment: "20%",
    },
    {
      id: "30-70",
      name: "30-70 Plan",
      description: "30% down payment, balance in 24 monthly installments",
      downPayment: "30%",
    },
    {
      id: "40-60",
      name: "40-60 Plan",
      description: "40% down payment, balance in 18 monthly installments",
      downPayment: "40%",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-2">
        <Building className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold">Add New Project</h2>
      </div>

      {/* Token error banner */}
      {errors.token && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.token}</AlertDescription>
        </Alert>
      )}

      {/* API error banner */}
      {errors.api && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.api}</AlertDescription>
        </Alert>
      )}

      {/* Success banner */}
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
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) => set("project_name", e.target.value)}
                  placeholder="Enter project name"
                  className={errors.project_name ? "border-red-500" : ""}
                />
                <FieldError msg={errors.project_name} />
              </div>

              {/* Project Type */}
              <div className="space-y-2">
                <Label htmlFor="project_type">Project Type *</Label>
                <Select
                  value={formData.project_type}
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

              {/* Project Category */}
              <div className="space-y-2">
                <Label htmlFor="project_category">Project Category</Label>
                <Select
                  value={formData.project_category}
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

              {/* RERA */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rera_registration_number">
                  RERA Registration Number *
                </Label>
                <Input
                  id="rera_registration_number"
                  value={formData.rera_registration_number}
                  onChange={(e) =>
                    set("rera_registration_number", e.target.value)
                  }
                  placeholder="RERA-KA-2023-007890"
                  className={
                    errors.rera_registration_number ? "border-red-500" : ""
                  }
                />
                <FieldError msg={errors.rera_registration_number} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Address Information ── */}
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
                  value={formData.project_address_line1}
                  onChange={(e) => set("project_address_line1", e.target.value)}
                  placeholder="Street address, building number"
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
                  value={formData.project_address_line2}
                  onChange={(e) => set("project_address_line2", e.target.value)}
                  placeholder="Apartment, suite, unit, floor, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locality">Locality *</Label>
                <Input
                  id="locality"
                  value={formData.locality}
                  onChange={(e) => set("locality", e.target.value)}
                  placeholder="Area/Locality"
                  className={errors.locality ? "border-red-500" : ""}
                />
                <FieldError msg={errors.locality} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="City"
                  className={errors.city ? "border-red-500" : ""}
                />
                <FieldError msg={errors.city} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder="State"
                  className={errors.state ? "border-red-500" : ""}
                />
                <FieldError msg={errors.state} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => set("pincode", e.target.value)}
                  placeholder="560066"
                  maxLength={6}
                  className={errors.pincode ? "border-red-500" : ""}
                />
                <FieldError msg={errors.pincode} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
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
                  value={formData.latitude}
                  onChange={(e) => set("latitude", e.target.value)}
                  placeholder="12.97194"
                  className={errors.latitude ? "border-red-500" : ""}
                />
                <FieldError msg={errors.latitude} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.00000001"
                  value={formData.longitude}
                  onChange={(e) => set("longitude", e.target.value)}
                  placeholder="77.75070"
                  className={errors.longitude ? "border-red-500" : ""}
                />
                <FieldError msg={errors.longitude} />
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
                    value={formData.total_land_area}
                    onChange={(e) => set("total_land_area", e.target.value)}
                    placeholder="0.00"
                    className={`flex-1 ${errors.total_land_area ? "border-red-500" : ""}`}
                  />
                  <Select
                    value={formData.land_area_unit}
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
                <FieldError msg={errors.total_land_area} />
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
                  value={formData.total_built_up_area}
                  onChange={(e) => set("total_built_up_area", e.target.value)}
                  placeholder="0.00"
                  className={errors.total_built_up_area ? "border-red-500" : ""}
                />
                <FieldError msg={errors.total_built_up_area} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number_of_towers">
                  Number of Towers/Blocks
                </Label>
                <Input
                  id="number_of_towers"
                  type="number"
                  min="1"
                  value={formData.number_of_towers}
                  onChange={(e) => set("number_of_towers", e.target.value)}
                  placeholder="0"
                  className={errors.number_of_towers ? "border-red-500" : ""}
                />
                <FieldError msg={errors.number_of_towers} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_units">Total Units *</Label>
                <Input
                  id="total_units"
                  type="number"
                  min="1"
                  value={formData.total_units}
                  onChange={(e) => set("total_units", e.target.value)}
                  placeholder="0"
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
                  value={formData.launch_date}
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
                  value={formData.expected_completion_date}
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
                  value={formData.actual_completion_date}
                  onChange={(e) =>
                    set("actual_completion_date", e.target.value)
                  }
                  className={
                    errors.actual_completion_date ? "border-red-500" : ""
                  }
                />
                <FieldError msg={errors.actual_completion_date} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_status">Project Status *</Label>
                <Select
                  value={formData.project_status}
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
                  value={formData.possession_status}
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
                  value={formData.construction_stage_percentage}
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

            {/* Preset chips */}
            <div className="mb-3 flex flex-wrap gap-2">
              {PRESET_AMENITIES.map((a) => {
                const selected = formData.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      selected
                        ? removeAmenity(formData.amenities.indexOf(a))
                        : addAmenity(a)
                    }
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      selected
                        ? "border-green-600 bg-green-100 text-green-800"
                        : "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {selected && <span className="mr-1">✓</span>}
                    {a}
                  </button>
                );
              })}
            </div>

            {/* Custom amenity input */}
            <div className="flex gap-2">
              <Input
                value={currentAmenity}
                onChange={(e) => setCurrentAmenity(e.target.value)}
                placeholder="Add custom amenity (e.g., Rooftop Garden)"
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

            {/* Selected tags */}
            {formData.amenities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
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

        {/* ── Payment Plan ── */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">
              Select Payment Plan
            </h3>

            <RadioGroup
              value={formData.selectedPaymentPlan}
              onValueChange={(v) => set("selectedPaymentPlan", v)}
              className="space-y-3"
            >
              {paymentPlans.map((plan) => (
                <label
                  key={plan.id}
                  htmlFor={plan.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {plan.description}
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      Down Payment: {plan.downPayment}
                    </div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Add Project"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
