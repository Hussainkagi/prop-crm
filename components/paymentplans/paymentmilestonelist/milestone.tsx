"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Milestone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import CommonTable from "@/components/organism/commonTable";

interface PaymentMilestone {
  milestone_id: string;
  plan_id: string;
  milestone_sequence: number;
  milestone_name: string;
  milestone_percentage: number;
  days_from_previous: number;
  amount_type: string;
  expected_days_from_booking: number;
  // Display helpers
  planName?: string;
  projectName?: string;
}

const initialMilestones: PaymentMilestone[] = [
  {
    milestone_id: "1",
    plan_id: "1",
    planName: "20-80 Standard Plan",
    projectName: "Skyline Heights",
    milestone_sequence: 1,
    milestone_name: "Booking Amount",
    milestone_percentage: 10,
    days_from_previous: 0,
    amount_type: "Percentage",
    expected_days_from_booking: 0,
  },
  {
    milestone_id: "2",
    plan_id: "1",
    planName: "20-80 Standard Plan",
    projectName: "Skyline Heights",
    milestone_sequence: 2,
    milestone_name: "On Agreement",
    milestone_percentage: 10,
    days_from_previous: 30,
    amount_type: "Percentage",
    expected_days_from_booking: 30,
  },
  {
    milestone_id: "3",
    plan_id: "1",
    planName: "20-80 Standard Plan",
    projectName: "Skyline Heights",
    milestone_sequence: 3,
    milestone_name: "On Foundation",
    milestone_percentage: 15,
    days_from_previous: 60,
    amount_type: "Percentage",
    expected_days_from_booking: 90,
  },
  {
    milestone_id: "4",
    plan_id: "2",
    planName: "30-70 Fast Track",
    projectName: "Skyline Heights",
    milestone_sequence: 1,
    milestone_name: "Booking Amount",
    milestone_percentage: 10,
    days_from_previous: 0,
    amount_type: "Percentage",
    expected_days_from_booking: 0,
  },
  {
    milestone_id: "5",
    plan_id: "2",
    planName: "30-70 Fast Track",
    projectName: "Skyline Heights",
    milestone_sequence: 2,
    milestone_name: "On Agreement",
    milestone_percentage: 20,
    days_from_previous: 15,
    amount_type: "Percentage",
    expected_days_from_booking: 15,
  },
];

const paymentPlans = [
  { id: "all", name: "All Plans" },
  { id: "1", name: "20-80 Standard Plan - Skyline Heights" },
  { id: "2", name: "30-70 Fast Track - Skyline Heights" },
];

export function PaymentMilestonesList() {
  const router = useRouter();
  const [milestones] = useState<PaymentMilestone[]>(initialMilestones);
  const [selectedPlan, setSelectedPlan] = useState("all");

  const filteredMilestones =
    selectedPlan === "all"
      ? milestones
      : milestones.filter((m) => m.plan_id === selectedPlan);

  const columns = [
    {
      key: "milestone_sequence",
      header: "Seq.",
      width: "80px",
      sortable: true,
      cellClassName: "text-center font-medium",
      headerClassName: "text-center",
    },
    {
      key: "milestone_name",
      header: "Milestone Name",
      width: "200px",
      sortable: true,
      filterable: true,
      render: (row: PaymentMilestone) => (
        <span className="font-medium">{row.milestone_name}</span>
      ),
    },
    {
      key: "planName",
      header: "Payment Plan",
      width: "220px",
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
      key: "milestone_percentage",
      header: "Percentage",
      width: "120px",
      sortable: true,
      cellClassName: "text-center",
      headerClassName: "text-center",
      render: (row: PaymentMilestone) => `${row.milestone_percentage}%`,
    },
    {
      key: "days_from_previous",
      header: "Days from Previous",
      width: "150px",
      sortable: true,
      cellClassName: "text-center",
      headerClassName: "text-center",
      render: (row: PaymentMilestone) => `${row.days_from_previous} days`,
    },
    {
      key: "expected_days_from_booking",
      header: "Days from Booking",
      width: "150px",
      sortable: true,
      cellClassName: "text-center",
      headerClassName: "text-center",
      render: (row: PaymentMilestone) =>
        `${row.expected_days_from_booking} days`,
    },
    {
      key: "actions",
      header: "Actions",
      width: "100px",
      sortable: false,
      hiddenFromToggle: true,
      cellClassName: "text-right",
      headerClassName: "text-right",
      render: (row: PaymentMilestone) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(
                `/settings/payments/payment-milestones/edit/${row.milestone_id}`,
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
          <h2 className="text-xl font-semibold">Payment Milestones</h2>
          <p className="text-sm text-muted-foreground">
            Manage payment milestones for payment plans
          </p>
        </div>
        <Button
          onClick={() =>
            router.push("/settings/payments/payment-milestones/create")
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Milestone
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-medium">Filter by Plan:</label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <CommonTable
        data={filteredMilestones}
        columns={columns}
        searchPlaceholder="Search milestones..."
        emptyMessage="No payment milestones found"
        emptyIcon={<Milestone className="w-12 h-12" />}
        emptyAction={
          <Button
            onClick={() =>
              router.push("/settings/payments/payment-milestones/create")
            }
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Milestone
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
        getRowId={(row) => row.milestone_id}
      />
    </div>
  );
}
