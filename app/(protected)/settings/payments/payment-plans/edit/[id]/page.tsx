"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  fetchPaymentPlan,
  updatePaymentPlan,
  approvePaymentPlan,
  revertPaymentPlanToDraft,
  deletePaymentPlan,
  type ApiPaymentPlanDetail,
  type UpdatePaymentPlanPayload,
} from "@/lib/api/payment-plan-api";
import { showSplashLoader, hideSplashLoader } from "@/utils/splash-loader";

interface PaymentPlanFormData {
  plan_name: string;
  plan_code: string;
  plan_description: string;
  plan_type: string;
  total_installments: string;
  booking_amount_percentage: string;
  down_payment_percentage: string;
  on_agreement_percentage: string;
  on_possession_percentage: string;
  grace_period_days: string;
  late_payment_charge_percentage: string;
  penalty_terms: string;
  early_payment_discount_percentage: string;
  vat_applicable: boolean;
  vat_percentage: string;
  stamp_duty_included: boolean;
  plan_status: string;
}

const PLAN_TYPES = [
  "Construction Linked",
  "Time Linked",
  "Possession Linked",
  "Flexi Payment",
  "Custom",
];

function apiToForm(d: ApiPaymentPlanDetail): PaymentPlanFormData {
  return {
    plan_name: d.plan_name ?? "",
    plan_code: d.plan_code ?? "",
    plan_description: d.plan_description ?? "",
    plan_type: d.plan_type ?? "Construction Linked",
    total_installments: d.total_installments?.toString() ?? "",
    booking_amount_percentage: d.booking_amount_percentage ?? "", // was `|| ""` which fails on "0"
    down_payment_percentage: d.down_payment_percentage ?? "",
    on_agreement_percentage: d.on_agreement_percentage ?? "",
    on_possession_percentage: d.on_possession_percentage ?? "",
    grace_period_days: d.grace_period_days?.toString() ?? "",
    late_payment_charge_percentage: d.late_payment_charge_percentage ?? "",
    penalty_terms: d.penalty_terms ?? "",
    early_payment_discount_percentage:
      d.early_payment_discount_percentage ?? "",
    vat_applicable: d.vat_applicable ?? true,
    vat_percentage: d.vat_percentage ?? "5.00",
    stamp_duty_included: d.stamp_duty_included ?? false,
    plan_status: d.plan_status ?? "Draft",
  };
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Draft: "bg-amber-50 text-amber-700",
  Inactive: "bg-gray-100 text-gray-600",
  Archived: "bg-red-50 text-red-700",
};

export default function EditPaymentPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = Number(params?.id);

  const [plan, setPlan] = useState<ApiPaymentPlanDetail | null>(null);
  const [formData, setFormData] = useState<PaymentPlanFormData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isApproving, setIsApproving] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    showSplashLoader("Loading payment plan...");
    try {
      const res = await fetchPaymentPlan(planId);
      setPlan(res.data);
      setFormData(apiToForm(res.data));
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load payment plan.",
      );
    } finally {
      hideSplashLoader();
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (field: keyof PaymentPlanFormData, value: string | boolean) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
    setSaveError(null);
    setSaveSuccess(false);
    setActionError(null);
  };

  const toOptionalNum = (v: string) => (v.trim() ? Number(v) : undefined);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const payload: UpdatePaymentPlanPayload = {
      plan_name: formData.plan_name,
      plan_code: formData.plan_code,
      plan_description: formData.plan_description || undefined,
      plan_type: formData.plan_type,
      total_installments: Number(formData.total_installments),
      booking_amount_percentage: toOptionalNum(
        formData.booking_amount_percentage,
      ),
      down_payment_percentage: Number(formData.down_payment_percentage),
      on_agreement_percentage: toOptionalNum(formData.on_agreement_percentage),
      on_possession_percentage: toOptionalNum(
        formData.on_possession_percentage,
      ),
      grace_period_days: toOptionalNum(formData.grace_period_days),
      late_payment_charge_percentage: toOptionalNum(
        formData.late_payment_charge_percentage,
      ),
      penalty_terms: formData.penalty_terms || undefined,
      early_payment_discount_percentage: toOptionalNum(
        formData.early_payment_discount_percentage,
      ),
      vat_applicable: formData.vat_applicable,
      vat_percentage: formData.vat_applicable
        ? toOptionalNum(formData.vat_percentage)
        : undefined,
      stamp_duty_included: formData.stamp_duty_included,
      plan_status: formData.plan_status,
    };

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    showSplashLoader("Saving changes...");
    try {
      const res = await updatePaymentPlan(planId, payload);
      setPlan(res.data);
      setFormData(apiToForm(res.data));
      setSaveSuccess(true);
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

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    setIsApproving(true);
    setActionError(null);
    showSplashLoader("Approving payment plan...");
    try {
      await approvePaymentPlan(planId);
      await load();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to approve payment plan.",
      );
    } finally {
      hideSplashLoader();
      setIsApproving(false);
    }
  };

  // ── Revert to draft ───────────────────────────────────────────────────────
  const handleRevert = async () => {
    setIsReverting(true);
    setActionError(null);
    showSplashLoader("Reverting to draft...");
    try {
      await revertPaymentPlanToDraft(planId);
      await load();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to revert to draft.",
      );
    } finally {
      hideSplashLoader();
      setIsReverting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    showSplashLoader("Deleting payment plan...");
    try {
      await deletePaymentPlan(planId);
      hideSplashLoader();
      router.push("/settings/payments/payment-plans");
    } catch (err) {
      hideSplashLoader();
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete payment plan.",
      );
      setIsDeleting(false);
    }
  };

  if (isLoading) return null;

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

  if (!plan || !formData) return null;

  const isDraft = plan.plan_status === "Draft";
  const isActive = plan.plan_status === "Active";

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{plan.plan_name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  STATUS_COLORS[plan.plan_status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {plan.plan_status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {plan.plan_code} · {plan.project_name}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isDraft && (
            <Button
              variant="outline"
              className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={handleApprove}
              disabled={isApproving}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isApproving ? "Approving..." : "Approve"}
            </Button>
          )}
          {isActive && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleRevert}
              disabled={isReverting}
            >
              <RotateCcw className="h-4 w-4" />
              {isReverting ? "Reverting..." : "Revert to Draft"}
            </Button>
          )}
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Banners */}
      {saveSuccess && (
        <Alert className="max-w-4xl border-green-200 bg-green-50 text-green-800">
          <AlertDescription>
            Payment plan updated successfully.
          </AlertDescription>
        </Alert>
      )}
      {(saveError || actionError) && (
        <Alert variant="destructive" className="max-w-4xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError || actionError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Banknote className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Project</Label>
                <Input
                  value={plan.project_name}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_name">Plan Name *</Label>
                <Input
                  id="plan_name"
                  value={formData.plan_name}
                  onChange={(e) => set("plan_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_code">Plan Code *</Label>
                <Input
                  id="plan_code"
                  value={formData.plan_code}
                  onChange={(e) => set("plan_code", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_type">Plan Type *</Label>
                <Select
                  value={formData.plan_type}
                  onValueChange={(v) => set("plan_type", v)}
                >
                  <SelectTrigger id="plan_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="plan_description">Plan Description</Label>
                <Textarea
                  id="plan_description"
                  value={formData.plan_description}
                  onChange={(e) => set("plan_description", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Structure */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Payment Structure</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="total_installments">Total Installments *</Label>
                <Input
                  id="total_installments"
                  type="number"
                  min={1}
                  value={formData.total_installments}
                  onChange={(e) => set("total_installments", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_amount_percentage">
                  Booking Amount (%)
                </Label>
                <Input
                  id="booking_amount_percentage"
                  type="number"
                  step="0.01"
                  value={formData.booking_amount_percentage}
                  onChange={(e) =>
                    set("booking_amount_percentage", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="down_payment_percentage">
                  Down Payment (%) *
                </Label>
                <Input
                  id="down_payment_percentage"
                  type="number"
                  step="0.01"
                  value={formData.down_payment_percentage}
                  onChange={(e) =>
                    set("down_payment_percentage", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="on_agreement_percentage">
                  On Agreement (%)
                </Label>
                <Input
                  id="on_agreement_percentage"
                  type="number"
                  step="0.01"
                  value={formData.on_agreement_percentage}
                  onChange={(e) =>
                    set("on_agreement_percentage", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="on_possession_percentage">
                  On Possession (%)
                </Label>
                <Input
                  id="on_possession_percentage"
                  type="number"
                  step="0.01"
                  value={formData.on_possession_percentage}
                  onChange={(e) =>
                    set("on_possession_percentage", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Terms & Conditions</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="grace_period_days">Grace Period (Days)</Label>
                <Input
                  id="grace_period_days"
                  type="number"
                  value={formData.grace_period_days}
                  onChange={(e) => set("grace_period_days", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="late_payment_charge_percentage">
                  Late Payment Charge (%)
                </Label>
                <Input
                  id="late_payment_charge_percentage"
                  type="number"
                  step="0.01"
                  value={formData.late_payment_charge_percentage}
                  onChange={(e) =>
                    set("late_payment_charge_percentage", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="early_payment_discount_percentage">
                  Early Payment Discount (%)
                </Label>
                <Input
                  id="early_payment_discount_percentage"
                  type="number"
                  step="0.01"
                  value={formData.early_payment_discount_percentage}
                  onChange={(e) =>
                    set("early_payment_discount_percentage", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="penalty_terms">Penalty Terms</Label>
                <Textarea
                  id="penalty_terms"
                  value={formData.penalty_terms}
                  onChange={(e) => set("penalty_terms", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Status */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Tax & Status</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vat_applicable">VAT Applicable</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply VAT to this payment plan
                  </p>
                </div>
                <Switch
                  id="vat_applicable"
                  checked={formData.vat_applicable}
                  onCheckedChange={(v) => set("vat_applicable", v)}
                />
              </div>

              {formData.vat_applicable && (
                <div className="space-y-2">
                  <Label htmlFor="vat_percentage">VAT Percentage (%)</Label>
                  <Input
                    id="vat_percentage"
                    type="number"
                    step="0.01"
                    value={formData.vat_percentage}
                    onChange={(e) => set("vat_percentage", e.target.value)}
                    placeholder="5.00"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="stamp_duty_included">
                    Stamp Duty Included
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Include stamp duty in this plan
                  </p>
                </div>
                <Switch
                  id="stamp_duty_included"
                  checked={formData.stamp_duty_included}
                  onCheckedChange={(v) => set("stamp_duty_included", v)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_status">Plan Status</Label>
                <Select
                  value={formData.plan_status}
                  onValueChange={(v) => set("plan_status", v)}
                >
                  <SelectTrigger id="plan_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Payment Plan
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {plan.plan_name}
              </span>
              ? This action cannot be undone.
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
