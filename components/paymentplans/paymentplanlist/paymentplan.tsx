"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Building,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import CommonTable from "@/components/organism/commonTable";
import {
  fetchPaymentPlans,
  deletePaymentPlan,
  approvePaymentPlan,
  type ApiPaymentPlan,
} from "@/lib/api/payment-plan-api";
import { showSplashLoader, hideSplashLoader } from "@/utils/splash-loader";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Active: "default",
  Inactive: "secondary",
  Draft: "outline",
  Archived: "outline",
};

const STATUS_CLASS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-amber-50 text-amber-700 border-amber-200",
  Inactive: "bg-gray-100 text-gray-600 border-gray-200",
  Archived: "bg-red-50 text-red-700 border-red-200",
};

export function PaymentPlansList() {
  const router = useRouter();
  const [plans, setPlans] = useState<ApiPaymentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Delete dialog state
  const [planToDelete, setPlanToDelete] = useState<ApiPaymentPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Approve state
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    showSplashLoader("Loading payment plans...");
    try {
      const res = await fetchPaymentPlans(1, 100); // load all for table pagination
      setPlans(res.data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load payment plans.",
      );
    } finally {
      hideSplashLoader();
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (plan: ApiPaymentPlan) => {
    setApprovingId(plan.plan_id);
    setActionError(null);
    showSplashLoader("Approving payment plan...");
    try {
      await approvePaymentPlan(plan.plan_id);
      setPlans((prev) =>
        prev.map((p) =>
          p.plan_id === plan.plan_id ? { ...p, plan_status: "Active" } : p,
        ),
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to approve payment plan.",
      );
    } finally {
      hideSplashLoader();
      setApprovingId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    showSplashLoader("Deleting payment plan...");
    try {
      await deletePaymentPlan(planToDelete.plan_id);
      setPlans((prev) =>
        prev.filter((p) => p.plan_id !== planToDelete.plan_id),
      );
      setPlanToDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete payment plan.",
      );
    } finally {
      hideSplashLoader();
      setIsDeleting(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    {
      key: "plan_code",
      header: "Plan Code",
      width: "150px",
      sortable: true,
      filterable: true,
      render: (row: ApiPaymentPlan) => (
        <span className="font-medium tabular-nums">{row.plan_code}</span>
      ),
    },
    {
      key: "plan_name",
      header: "Plan Name",
      width: "200px",
      sortable: true,
      filterable: true,
    },
    {
      key: "project_name",
      header: "Project",
      width: "180px",
      sortable: true,
      filterable: true,
    },
    {
      key: "plan_type",
      header: "Type",
      width: "160px",
      sortable: true,
      filterable: true,
    },
    {
      key: "total_installments",
      header: "Installments",
      width: "120px",
      sortable: true,
      cellClassName: "text-center",
      headerClassName: "text-center",
    },
    {
      key: "booking_amount_percentage",
      header: "Booking %",
      width: "110px",
      sortable: true,
      cellClassName: "text-center",
      headerClassName: "text-center",
      render: (row: ApiPaymentPlan) =>
        row.booking_amount_percentage
          ? `${row.booking_amount_percentage}%`
          : "—",
    },
    {
      key: "vat_applicable",
      header: "VAT",
      width: "80px",
      sortable: true,
      cellClassName: "text-center",
      headerClassName: "text-center",
      render: (row: ApiPaymentPlan) => (
        <span
          className={
            row.vat_applicable
              ? "text-emerald-600 font-medium"
              : "text-gray-400"
          }
        >
          {row.vat_applicable ? `${row.vat_percentage}%` : "No"}
        </span>
      ),
    },
    {
      key: "plan_status",
      header: "Status",
      width: "110px",
      sortable: true,
      filterable: true,
      cellClassName: "text-center",
      headerClassName: "text-center",
      render: (row: ApiPaymentPlan) => (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
            STATUS_CLASS[row.plan_status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {row.plan_status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "130px",
      sortable: false,
      hiddenFromToggle: true,
      cellClassName: "text-right",
      headerClassName: "text-right",
      render: (row: ApiPaymentPlan) => (
        <div className="flex justify-end gap-1">
          {row.plan_status === "Draft" && (
            <Button
              variant="ghost"
              size="icon"
              title="Approve"
              disabled={approvingId === row.plan_id}
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(row);
              }}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                `/settings/payments/payment-plans/edit/${row.plan_id}`,
              );
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              setPlanToDelete(row);
              setDeleteError(null);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payment Plans</h2>
          <p className="text-sm text-muted-foreground">
            Manage payment plans for projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={load}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            onClick={() =>
              router.push("/settings/payments/payment-plans/create")
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Payment Plan
          </Button>
        </div>
      </div>

      {loadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{loadError}</span>
            <Button variant="ghost" size="sm" onClick={load}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {actionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <CommonTable
        data={plans}
        columns={columns}
        searchPlaceholder="Search payment plans..."
        emptyMessage="No payment plans found"
        emptyIcon={<Building className="w-12 h-12" />}
        emptyAction={
          <Button
            onClick={() =>
              router.push("/settings/payments/payment-plans/create")
            }
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Payment Plan
          </Button>
        }
        perPage={10}
        striped={true}
        hover={true}
        sortable={true}
        showColumnToggle={true}
        showPerPageSelector={true}
        exportable={true}
        rowClickable={false}
        getRowId={(row) => String(row.plan_id)}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!planToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPlanToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Payment Plan
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {planToDelete?.plan_name}
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
                setPlanToDelete(null);
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
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
