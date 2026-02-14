"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import CommonTable from "@/components/organism/commonTable";

interface PaymentPlan {
  plan_id: string;
  project_id: string;
  plan_name: string;
  plan_code: string;
  plan_type: string;
  total_installments: number;
  booking_amount_percentage: number;
  down_payment_percentage: number;
  on_possession_percentage: number;
  plan_status: string;
  created_at: string;
  // Display helpers
  projectName?: string;
}

const initialPlans: PaymentPlan[] = [
  {
    plan_id: "1",
    project_id: "1",
    projectName: "Skyline Heights",
    plan_name: "20-80 Standard Plan",
    plan_code: "20-80-STD",
    plan_type: "Construction Linked",
    total_installments: 36,
    booking_amount_percentage: 10,
    down_payment_percentage: 20,
    on_possession_percentage: 80,
    plan_status: "Active",
    created_at: "2024-01-15",
  },
  {
    plan_id: "2",
    project_id: "1",
    projectName: "Skyline Heights",
    plan_name: "30-70 Fast Track",
    plan_code: "30-70-FT",
    plan_type: "Construction Linked",
    total_installments: 24,
    booking_amount_percentage: 10,
    down_payment_percentage: 30,
    on_possession_percentage: 70,
    plan_status: "Active",
    created_at: "2024-01-15",
  },
];

export function PaymentPlansList() {
  const router = useRouter();
  const [plans] = useState<PaymentPlan[]>(initialPlans);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Inactive":
        return "secondary";
      case "Archived":
        return "outline";
      default:
        return "default";
    }
  };

  const columns = [
    {
      key: "plan_code",
      header: "Plan Code",
      width: "150px",
      sortable: true,
      filterable: true,
      render: (row: PaymentPlan) => (
        <span className="font-medium">{row.plan_code}</span>
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
      key: "projectName",
      header: "Project",
      width: "180px",
      sortable: true,
      filterable: true,
    },
    {
      key: "plan_type",
      header: "Type",
      width: "150px",
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
      key: "down_payment_percentage",
      header: "Down Payment",
      width: "130px",
      sortable: true,
      cellClassName: "text-center",
      headerClassName: "text-center",
      render: (row: PaymentPlan) => `${row.down_payment_percentage}%`,
    },
    {
      key: "plan_status",
      header: "Status",
      width: "120px",
      sortable: true,
      filterable: true,
      cellClassName: "text-center",
      headerClassName: "text-center",
      render: (row: PaymentPlan) => (
        <Badge variant={getStatusColor(row.plan_status)}>
          {row.plan_status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
      sortable: false,
      hiddenFromToggle: true,
      cellClassName: "text-right",
      headerClassName: "text-right",
      render: (row: PaymentPlan) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
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
            onClick={(e) => {
              e.stopPropagation();
              // Handle delete
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
        <Button
          onClick={() => router.push("/settings/payments/payment-plans/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Payment Plan
        </Button>
      </div>

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
        getRowId={(row) => row.plan_id}
      />
    </div>
  );
}
