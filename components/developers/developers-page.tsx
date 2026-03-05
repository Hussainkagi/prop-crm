"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeveloperCard, type Developer } from "./developer-card";
import { DeveloperListSkeleton } from "@/components/ui/developer-card-skeleton";
import {
  RegisterDeveloperForm,
  type DeveloperFormData,
} from "./register-developer-form";
import {
  fetchDevelopers,
  registerDeveloper,
  addDeveloperAddress,
  type ApiDeveloper,
} from "@/lib/api/developer-api";
import { showSplashLoader, hideSplashLoader } from "@/utils/splash-loader";

export function normalizeDubaiMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (/^971\d{9}$/.test(digits)) return digits;
  if (/^0[54]\d{8}$/.test(digits)) return `971${digits.slice(1)}`;
  if (/^[54]\d{8}$/.test(digits)) return `971${digits}`;
  return null;
}

const REGISTRATION_TYPE_LABELS: Record<string, string> = {
  "private-limited": "Private Limited",
  "public-limited": "Public Limited",
  llp: "LLP",
  partnership: "Partnership",
  proprietorship: "Proprietorship",
};

function mapApiDeveloper(d: ApiDeveloper): Developer {
  return {
    id: String(d.developer_id),
    companyName: d.company_name,
    companyType: d.registration_type,
    contact: d.contact_person_name,
    phone: d.mobile_primary,
    email: d.email_primary,
    location: "—",
    status: d.developer_status.toUpperCase() as Developer["status"],
  };
}

function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [submitError]);

  // ── Fetch — skeleton only, no splash loader ─────────────────────────────────
  const loadDevelopers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchDevelopers(1, 10);
      setDevelopers(res.data.map(mapApiDeveloper));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load developers.",
      );
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, []);

  useEffect(() => {
    loadDevelopers();
  }, [loadDevelopers]);

  // ── Register — still uses splash loader (multi-step async action) ───────────
  const handleRegister = async (data: DeveloperFormData) => {
    const primaryNorm = normalizeDubaiMobile(data.companyInfo.mobilePrimary);
    if (!primaryNorm) {
      setSubmitError(
        "Primary mobile is invalid. Accepted formats: +971501234567 · 971501234567 · 0501234567",
      );
      return;
    }

    let alternateNorm: string | undefined;
    if (data.companyInfo.mobileAlternate.trim()) {
      const norm = normalizeDubaiMobile(data.companyInfo.mobileAlternate);
      if (!norm) {
        setSubmitError(
          "Alternate mobile is invalid. Accepted formats: +971501234567 · 971501234567 · 0501234567",
        );
        return;
      }
      alternateNorm = norm;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    showSplashLoader("Registering developer...");

    try {
      const devRes = await registerDeveloper({
        company_name: data.companyInfo.companyName,
        registration_type:
          REGISTRATION_TYPE_LABELS[data.companyInfo.registrationType] ??
          data.companyInfo.registrationType,
        registration_number: data.companyInfo.registrationNumber,
        contact_person_name: data.companyInfo.contactPersonName,
        mobile_primary: primaryNorm,
        mobile_alternate: alternateNorm,
        email_primary: data.companyInfo.emailPrimary,
        email_alternate: data.companyInfo.emailAlternate || undefined,
        website_url: data.companyInfo.websiteUrl || undefined,
        years_in_business: data.companyInfo.yearsInBusiness
          ? Number(data.companyInfo.yearsInBusiness)
          : undefined,
        total_projects_completed: data.companyInfo.totalProjectsCompleted
          ? Number(data.companyInfo.totalProjectsCompleted)
          : undefined,
        rera_registration_number:
          data.companyInfo.reraRegistrationNumber || undefined,
        credit_rating: data.companyInfo.creditRating || undefined,
      });

      const developerId = devRes.data.developer_id;

      if (data.address.corrAddressLine1.trim()) {
        try {
          await addDeveloperAddress(developerId, {
            address_type: data.address.addressType || "Correspondence",
            address_line1: data.address.corrAddressLine1,
            address_line2: data.address.corrAddressLine2 || undefined,
            city: data.address.corrCity,
            state: data.address.corrState,
            pincode: data.address.corrPincode,
            country: data.address.corrCountry || "UAE",
            landmark: data.address.corrLandmark || undefined,
          });
        } catch (addrErr) {
          console.warn("Address could not be saved:", addrErr);
        }
      }

      setDevelopers((prev) => [
        {
          id: String(developerId),
          companyName: devRes.data.company_name,
          companyType: devRes.data.registration_type,
          contact: devRes.data.contact_person_name,
          phone: devRes.data.mobile_primary,
          email: devRes.data.email_primary,
          location: data.address.corrCity
            ? `${data.address.corrCity}, ${data.address.corrState}`
            : "—",
          status:
            devRes.data.developer_status.toUpperCase() as Developer["status"],
        },
        ...prev,
      ]);
      setShowForm(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to register developer.",
      );
    } finally {
      hideSplashLoader();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Developer Management</h1>
        {!showForm && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={loadDevelopers}
              disabled={isLoading}
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              onClick={() => {
                setShowForm(true);
                setSubmitError(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Register New Developer
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={loadDevelopers}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {showForm ? (
        <>
          {submitError && (
            <div ref={errorRef}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            </div>
          )}
          <RegisterDeveloperForm
            onSubmit={handleRegister}
            onCancel={() => {
              setShowForm(false);
              setSubmitError(null);
            }}
            isSubmitting={isSubmitting}
          />
        </>
      ) : (
        <div className="space-y-4">
          {/* ── Skeleton while loading ── */}
          {isLoading && <DeveloperListSkeleton count={5} />}

          {/* ── Real cards once loaded ── */}
          {!isLoading &&
            developers.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}

          {/* ── Empty state ── */}
          {!isLoading && developers.length === 0 && !error && (
            <div className="py-12 text-center text-muted-foreground">
              No developers registered yet. Click the button above to register a
              new developer.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DevelopersPage;
