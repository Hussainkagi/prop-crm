"use client";

/**
 * Place at: app/developers/[id]/page.tsx
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Save,
  AlertCircle,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CompanyInfoForm } from "@/components/developers/forms/company-info-form";
import { AddressForm } from "@/components/developers/forms/address-form";
import {
  fetchDeveloper,
  updateDeveloper,
  deleteDeveloper,
  deleteDeveloperAddress,
  type ApiDeveloperDetail,
  type ApiDeveloperAddress,
} from "@/lib/api/developer-api";
import { showSplashLoader, hideSplashLoader } from "@/utils/splash-loader";

// ─── Registration type reverse map (API label → select value) ─────────────────
const REGISTRATION_TYPE_VALUES: Record<string, string> = {
  "Private Limited": "private-limited",
  "Public Limited": "public-limited",
  LLP: "llp",
  Partnership: "partnership",
  Proprietorship: "proprietorship",
};

// ─── Registration type forward map (select value → API label) ────────────────
const REGISTRATION_TYPE_LABELS: Record<string, string> = {
  "private-limited": "Private Limited",
  "public-limited": "Public Limited",
  llp: "LLP",
  partnership: "Partnership",
  proprietorship: "Proprietorship",
};

// ─── Strip +971/971/0 prefix → local 9-digit form ────────────────────────────
function toLocalMobile(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (/^971[54]\d{8}$/.test(digits)) return digits.slice(3);
  if (/^0[54]\d{8}$/.test(digits)) return digits.slice(1);
  if (/^[54]\d{8}$/.test(digits)) return digits;
  return raw || "";
}

// ─── Normalize for API ────────────────────────────────────────────────────────
function normalizeDubaiMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (/^971\d{9}$/.test(digits)) return digits;
  if (/^0[54]\d{8}$/.test(digits)) return `971${digits.slice(1)}`;
  if (/^[54]\d{8}$/.test(digits)) return `971${digits}`;
  return null;
}

// ─── Map API detail → form data ───────────────────────────────────────────────
function apiToFormData(d: ApiDeveloperDetail) {
  const address = d.addresses?.[0];
  return {
    companyInfo: {
      companyName: d.company_name || "",
      registrationType:
        REGISTRATION_TYPE_VALUES[d.registration_type] ||
        d.registration_type ||
        "",
      registrationNumber: d.registration_number || "",
      contactPersonName: d.contact_person_name || "",
      mobilePrimary: toLocalMobile(d.mobile_primary),
      mobileAlternate: toLocalMobile(d.mobile_alternate),
      emailPrimary: d.email_primary || "",
      emailAlternate: d.email_alternate || "",
      websiteUrl: d.website_url || "",
      yearsInBusiness: d.years_in_business?.toString() || "",
      totalProjectsCompleted: d.total_projects_completed?.toString() || "",
      reraRegistrationNumber: d.rera_registration_number || "",
      creditRating: d.credit_rating || "",
    },
    address: {
      corrAddressLine1: address?.address_line1 || "",
      corrAddressLine2: address?.address_line2 || "",
      corrCity: address?.city || "",
      corrState: address?.state || "",
      corrPincode: address?.pincode || "",
      corrCountry: address?.country || "UAE",
      corrLandmark: address?.landmark || "",
      addressType: address?.address_type || "Correspondence",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DeveloperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const developerId = Number(params.id);

  const [developer, setDeveloper] = useState<ApiDeveloperDetail | null>(null);
  const [formData, setFormData] = useState<ReturnType<
    typeof apiToFormData
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const errorRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to error
  useEffect(() => {
    if ((saveError || loadError) && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [saveError, loadError]);

  // ── Load developer ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    showSplashLoader("Loading developer...");
    try {
      const res = await fetchDeveloper(developerId);
      setDeveloper(res.data);
      setFormData(apiToFormData(res.data));
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load developer.",
      );
    } finally {
      hideSplashLoader();
      setIsLoading(false);
    }
  }, [developerId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Form change handlers ────────────────────────────────────────────────────
  const handleCompanyInfoChange = (field: string, value: string) => {
    setFormData((prev) =>
      prev
        ? { ...prev, companyInfo: { ...prev.companyInfo, [field]: value } }
        : prev,
    );
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) =>
      prev ? { ...prev, address: { ...prev.address, [field]: value } } : prev,
    );
    setSaveError(null);
    setSaveSuccess(false);
  };

  // ── Save (Update) ───────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !developer) return;

    // Validate mobile
    const primaryNorm = normalizeDubaiMobile(
      formData.companyInfo.mobilePrimary,
    );
    if (!primaryNorm) {
      setSaveError(
        "Primary mobile is invalid. Accepted: +971501234567 · 971501234567 · 0501234567 · 501234567",
      );
      return;
    }

    let alternateNorm: string | undefined;
    if (formData.companyInfo.mobileAlternate.trim()) {
      const norm = normalizeDubaiMobile(formData.companyInfo.mobileAlternate);
      if (!norm) {
        setSaveError(
          "Alternate mobile is invalid. Accepted: +971501234567 · 971501234567 · 0501234567 · 501234567",
        );
        return;
      }
      alternateNorm = norm;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    showSplashLoader("Saving changes...");

    try {
      await updateDeveloper(developerId, {
        company_name: formData.companyInfo.companyName,
        registration_type:
          REGISTRATION_TYPE_LABELS[formData.companyInfo.registrationType] ??
          formData.companyInfo.registrationType,
        registration_number: formData.companyInfo.registrationNumber,
        contact_person_name: formData.companyInfo.contactPersonName,
        mobile_primary: primaryNorm,
        mobile_alternate: alternateNorm,
        email_primary: formData.companyInfo.emailPrimary,
        email_alternate: formData.companyInfo.emailAlternate || undefined,
        website_url: formData.companyInfo.websiteUrl || undefined,
        years_in_business: formData.companyInfo.yearsInBusiness
          ? Number(formData.companyInfo.yearsInBusiness)
          : undefined,
        total_projects_completed: formData.companyInfo.totalProjectsCompleted
          ? Number(formData.companyInfo.totalProjectsCompleted)
          : undefined,
        rera_registration_number:
          formData.companyInfo.reraRegistrationNumber || undefined,
        credit_rating: formData.companyInfo.creditRating || undefined,
      });

      setSaveSuccess(true);
      // Scroll to top to show success banner
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save changes.",
      );
    } finally {
      hideSplashLoader();
      setIsSaving(false);
    }
  };

  // ── Delete developer ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!developer) return;
    setIsDeleting(true);
    setDeleteError(null);
    showSplashLoader("Deleting developer...");

    try {
      // Delete all addresses first
      for (const addr of developer.addresses ?? []) {
        await deleteDeveloperAddress(developerId, addr.address_id);
      }
      // Then delete developer
      await deleteDeveloper(developerId);
      hideSplashLoader();
      router.push("/developers");
    } catch (err) {
      hideSplashLoader();
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete developer.",
      );
      setIsDeleting(false);
    }
  };

  // ── Loading / error state ───────────────────────────────────────────────────
  if (isLoading) return null; // splash loader handles this

  if (loadError) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{loadError}</span>
            <Button variant="ghost" size="sm" onClick={load}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!developer || !formData) return null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Centred container: back | title | delete | alerts | form ── */}
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Row: back ←  ················  → Delete */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 px-0 hover:bg-transparent hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Developers
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Developer
          </Button>
        </div>

        {/* Company icon + name + ID + status */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{developer.company_name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-muted-foreground">
                ID: {developer.developer_id}
              </span>
              <Badge
                variant={
                  developer.developer_status === "Active"
                    ? "default"
                    : "secondary"
                }
                className={
                  developer.developer_status === "Active"
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : ""
                }
              >
                {developer.developer_status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Error / success banners */}
        <div ref={errorRef}>
          {saveError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
          {saveSuccess && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>
                Developer updated successfully.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Form card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Edit Developer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <CompanyInfoForm
                data={formData.companyInfo}
                onChange={handleCompanyInfoChange}
              />
              <AddressForm
                data={formData.address}
                onChange={handleAddressChange}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* end centred container */}

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Developer
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {developer.company_name}
              </span>
              ? This will also delete all associated addresses. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
