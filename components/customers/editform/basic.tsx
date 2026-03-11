"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ApiCustomerDetail } from "@/app/(protected)/customers/[id]/page";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditCustomerBasicInfoFormProps {
  customer: ApiCustomerDetail;
  onSuccess: () => void;
  onCancel: () => void;
  apiBaseUrl: string;
}

const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EditCustomerBasicInfoForm({
  customer,
  onSuccess,
  onCancel,
  apiBaseUrl,
}: EditCustomerBasicInfoFormProps) {
  // Pre-fill form from existing customer data
  const [form, setForm] = useState({
    salutation: customer.salutation ?? "",
    first_name: customer.first_name ?? "",
    middle_name: customer.middle_name ?? "",
    last_name: customer.last_name ?? "",
    date_of_birth: customer.date_of_birth
      ? new Date(customer.date_of_birth).toISOString().split("T")[0]
      : "",
    gender: customer.gender ?? "",
    marital_status: customer.marital_status ?? "",
    nationality: customer.nationality ?? "",
    mobile_primary: customer.mobile_primary ?? "",
    mobile_alternate: customer.mobile_alternate ?? "",
    whatsapp_number: customer.whatsapp_number ?? "",
    email_primary: customer.email_primary ?? "",
    email_alternate: customer.email_alternate ?? "",
    preferred_communication_mode: customer.preferred_communication_mode ?? "",
    corr_address_line1: customer.corr_address_line1 ?? "",
    corr_address_line2: customer.corr_address_line2 ?? "",
    corr_locality: customer.corr_locality ?? "",
    corr_city: customer.corr_city ?? "",
    corr_state: customer.corr_state ?? "",
    corr_pincode: customer.corr_pincode ?? "",
    corr_country: customer.corr_country ?? "UAE",
    corr_landmark: customer.corr_landmark ?? "",
    residence_type: customer.residence_type ?? "",
    years_at_current_address: customer.years_at_current_address
      ? String(customer.years_at_current_address)
      : "",
    perm_same_as_corr: customer.perm_same_as_corr ?? true,
    perm_address_line1: customer.perm_address_line1 ?? "",
    perm_address_line2: customer.perm_address_line2 ?? "",
    perm_locality: customer.perm_locality ?? "",
    perm_city: customer.perm_city ?? "",
    perm_state: customer.perm_state ?? "",
    perm_pincode: customer.perm_pincode ?? "",
    perm_country: customer.perm_country ?? "UAE",
  });

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    setGlobalError(null);
    setFieldErrors({});

    // Client-side validation
    const clientErrors: Record<string, string> = {};
    if (!form.first_name) clientErrors.first_name = "First name is required.";
    if (!form.last_name) clientErrors.last_name = "Last name is required.";
    if (!form.mobile_primary)
      clientErrors.mobile_primary = "Primary mobile is required.";
    if (!form.email_primary)
      clientErrors.email_primary = "Primary email is required.";
    if (!form.corr_address_line1)
      clientErrors.corr_address_line1 = "Address line 1 is required.";
    if (!form.corr_city) clientErrors.corr_city = "City is required.";
    if (!form.corr_state) clientErrors.corr_state = "State is required.";
    if (!form.corr_pincode) clientErrors.corr_pincode = "P.O. Box is required.";
    if (!form.perm_same_as_corr) {
      if (!form.perm_address_line1)
        clientErrors.perm_address_line1 = "Address line 1 is required.";
      if (!form.perm_city) clientErrors.perm_city = "City is required.";
      if (!form.perm_state) clientErrors.perm_state = "State is required.";
      if (!form.perm_pincode)
        clientErrors.perm_pincode = "P.O. Box is required.";
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("crm_access_token")
          : null;

      const payload = {
        ...form,
        years_at_current_address: form.years_at_current_address
          ? parseInt(form.years_at_current_address)
          : undefined,
        ...(form.perm_same_as_corr && {
          perm_address_line1: form.corr_address_line1,
          perm_address_line2: form.corr_address_line2,
          perm_locality: form.corr_locality,
          perm_city: form.corr_city,
          perm_state: form.corr_state,
          perm_pincode: form.corr_pincode,
          perm_country: form.corr_country,
        }),
      };

      const res = await fetch(
        `${apiBaseUrl}/customers/${customer.customer_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      const json = await res.json();

      if (!res.ok) {
        if (json.errors && Array.isArray(json.errors)) {
          const apiErrors: Record<string, string> = {};
          for (const e of json.errors) {
            apiErrors[e.field] = e.message;
          }
          setFieldErrors(apiErrors);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          setGlobalError(json.message || "Failed to update customer");
        }
        return;
      }

      onSuccess();
    } catch (err: unknown) {
      setGlobalError(
        err instanceof Error ? err.message : "Something went wrong",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {globalError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Salutation</Label>
              <Select
                value={form.salutation}
                onValueChange={(v) => set("salutation", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {["Mr", "Mrs", "Ms", "Dr", "Prof"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3 space-y-2">
              <Label>
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                className={fieldErrors.first_name ? "border-red-400" : ""}
              />
              <FieldError message={fieldErrors.first_name} />
            </div>
            <div className="col-span-3 space-y-2">
              <Label>Middle Name</Label>
              <Input
                value={form.middle_name}
                onChange={(e) => set("middle_name", e.target.value)}
              />
            </div>
            <div className="col-span-4 space-y-2">
              <Label>
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                className={fieldErrors.last_name ? "border-red-400" : ""}
              />
              <FieldError message={fieldErrors.last_name} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={form.date_of_birth}
                onChange={(e) => set("date_of_birth", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => set("gender", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["Male", "Female", "Other"].map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Marital Status</Label>
              <Select
                value={form.marital_status}
                onValueChange={(v) => set("marital_status", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["Single", "Married", "Divorced", "Widowed"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-1/3 space-y-2">
            <Label>Nationality</Label>
            <Input
              value={form.nationality}
              onChange={(e) => set("nationality", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                Mobile (Primary) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.mobile_primary}
                onChange={(e) => set("mobile_primary", e.target.value)}
                className={fieldErrors.mobile_primary ? "border-red-400" : ""}
              />
              <FieldError message={fieldErrors.mobile_primary} />
            </div>
            <div className="space-y-2">
              <Label>Mobile (Alternate)</Label>
              <Input
                value={form.mobile_alternate}
                onChange={(e) => set("mobile_alternate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input
                value={form.whatsapp_number}
                onChange={(e) => set("whatsapp_number", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Email (Primary) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={form.email_primary}
                onChange={(e) => set("email_primary", e.target.value)}
                className={fieldErrors.email_primary ? "border-red-400" : ""}
              />
              <FieldError message={fieldErrors.email_primary} />
            </div>
            <div className="space-y-2">
              <Label>Email (Alternate)</Label>
              <Input
                type="email"
                value={form.email_alternate}
                onChange={(e) => set("email_alternate", e.target.value)}
              />
            </div>
          </div>

          <div className="w-1/3 space-y-2">
            <Label>Preferred Communication Mode</Label>
            <Select
              value={form.preferred_communication_mode}
              onValueChange={(v) => set("preferred_communication_mode", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {["Mobile", "WhatsApp", "Email", "SMS"].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Correspondence Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Correspondence Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Address Line 1 <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.corr_address_line1}
                onChange={(e) => set("corr_address_line1", e.target.value)}
                className={
                  fieldErrors.corr_address_line1 ? "border-red-400" : ""
                }
              />
              <FieldError message={fieldErrors.corr_address_line1} />
            </div>
            <div className="space-y-2">
              <Label>Address Line 2</Label>
              <Input
                value={form.corr_address_line2}
                onChange={(e) => set("corr_address_line2", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Locality / Area</Label>
              <Input
                value={form.corr_locality}
                onChange={(e) => set("corr_locality", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                City / Emirate <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.corr_city}
                onValueChange={(v) => set("corr_city", v)}
              >
                <SelectTrigger
                  className={fieldErrors.corr_city ? "border-red-400" : ""}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {UAE_EMIRATES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.corr_city} />
            </div>
            <div className="space-y-2">
              <Label>
                State / Emirate <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.corr_state}
                onValueChange={(v) => set("corr_state", v)}
              >
                <SelectTrigger
                  className={fieldErrors.corr_state ? "border-red-400" : ""}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {UAE_EMIRATES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.corr_state} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                P.O. Box <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.corr_pincode}
                onChange={(e) => set("corr_pincode", e.target.value)}
                className={fieldErrors.corr_pincode ? "border-red-400" : ""}
              />
              <FieldError message={fieldErrors.corr_pincode} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={form.corr_country}
                onChange={(e) => set("corr_country", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Landmark</Label>
              <Input
                value={form.corr_landmark}
                onChange={(e) => set("corr_landmark", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Residence Type</Label>
              <Select
                value={form.residence_type}
                onValueChange={(v) => set("residence_type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["Owned", "Rented", "Family Owned", "Company Provided"].map(
                    (r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Years at Current Address</Label>
              <Input
                type="number"
                min={0}
                value={form.years_at_current_address}
                onChange={(e) =>
                  set("years_at_current_address", e.target.value)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permanent Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permanent Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="perm_same"
              checked={form.perm_same_as_corr}
              onCheckedChange={(checked) => set("perm_same_as_corr", !!checked)}
            />
            <Label htmlFor="perm_same" className="cursor-pointer font-normal">
              Same as correspondence address
            </Label>
          </div>

          {!form.perm_same_as_corr && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Address Line 1 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.perm_address_line1}
                    onChange={(e) => set("perm_address_line1", e.target.value)}
                    className={
                      fieldErrors.perm_address_line1 ? "border-red-400" : ""
                    }
                  />
                  <FieldError message={fieldErrors.perm_address_line1} />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input
                    value={form.perm_address_line2}
                    onChange={(e) => set("perm_address_line2", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Locality / Area</Label>
                  <Input
                    value={form.perm_locality}
                    onChange={(e) => set("perm_locality", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.perm_city}
                    onChange={(e) => set("perm_city", e.target.value)}
                    className={fieldErrors.perm_city ? "border-red-400" : ""}
                  />
                  <FieldError message={fieldErrors.perm_city} />
                </div>
                <div className="space-y-2">
                  <Label>
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.perm_state}
                    onChange={(e) => set("perm_state", e.target.value)}
                    className={fieldErrors.perm_state ? "border-red-400" : ""}
                  />
                  <FieldError message={fieldErrors.perm_state} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Pincode / P.O. Box <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.perm_pincode}
                    onChange={(e) => set("perm_pincode", e.target.value)}
                    className={fieldErrors.perm_pincode ? "border-red-400" : ""}
                  />
                  <FieldError message={fieldErrors.perm_pincode} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={form.perm_country}
                    onChange={(e) => set("perm_country", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
