"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonTable from "@/components/organism/commonTable";

export interface Customer {
  id: string;
  customerName: string;
  project: string;
  unitNo: string;
  paymentPlan: string;
  unitAmount: number;
  buyingDate: string;
  dueStartDate: string;
  monthlyPreferredDueDate: string;
  dueAmount: number;
  nextDueDate: string;
  status: "CURRENT" | "OVERDUE" | "PAID" | "PARTIAL";
  remarks?: string;
  totalPaid: number;
  remainingAmount: number;
}

const dummyCustomers: Customer[] = [
  {
    id: "1",
    customerName: "Abhay",
    project: "Emaar",
    unitNo: "B506",
    paymentPlan: "20:60:20",
    unitAmount: 500000,
    buyingDate: "2026-01-05",
    dueStartDate: "2026-02-10",
    monthlyPreferredDueDate: "10th",
    dueAmount: 5000,
    nextDueDate: "2026-02-10",
    status: "CURRENT",
    remarks: "Initial payment done",
    totalPaid: 100000,
    remainingAmount: 400000,
  },
  {
    id: "2",
    customerName: "Priya Sharma",
    project: "Lodha Paradise",
    unitNo: "A302",
    paymentPlan: "30:40:30",
    unitAmount: 750000,
    buyingDate: "2025-12-15",
    dueStartDate: "2026-01-15",
    monthlyPreferredDueDate: "15th",
    dueAmount: 8000,
    nextDueDate: "2026-02-15",
    status: "OVERDUE",
    remarks: "Payment delayed by 5 days",
    totalPaid: 225000,
    remainingAmount: 525000,
  },
  {
    id: "3",
    customerName: "Rahul Verma",
    project: "Godrej Sky",
    unitNo: "C101",
    paymentPlan: "25:50:25",
    unitAmount: 600000,
    buyingDate: "2025-11-20",
    dueStartDate: "2025-12-20",
    monthlyPreferredDueDate: "20th",
    dueAmount: 6000,
    nextDueDate: "2026-03-20",
    status: "CURRENT",
    totalPaid: 150000,
    remainingAmount: 450000,
  },
  {
    id: "4",
    customerName: "Sneha Patel",
    project: "Prestige Heights",
    unitNo: "D205",
    paymentPlan: "20:60:20",
    unitAmount: 850000,
    buyingDate: "2025-10-10",
    dueStartDate: "2025-11-10",
    monthlyPreferredDueDate: "10th",
    dueAmount: 7000,
    nextDueDate: "2026-02-10",
    status: "PARTIAL",
    remarks: "Partial payment received",
    totalPaid: 170000,
    remainingAmount: 680000,
  },
  {
    id: "5",
    customerName: "Amit Kumar",
    project: "Oberoi Garden",
    unitNo: "E404",
    paymentPlan: "15:70:15",
    unitAmount: 950000,
    buyingDate: "2025-09-01",
    dueStartDate: "2025-10-01",
    monthlyPreferredDueDate: "1st",
    dueAmount: 9500,
    nextDueDate: "2026-03-01",
    status: "CURRENT",
    totalPaid: 142500,
    remainingAmount: 807500,
  },
];

function CustomersPage() {
  const [customers] = useState<Customer[]>(dummyCustomers);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: Customer["status"]) => {
    const statusConfig = {
      CURRENT:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      PAID: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      PARTIAL:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]}`}
      >
        {status}
      </span>
    );
  };

  const columns: any[] = [
    {
      key: "customerName",
      header: "Customer Name",
      sortable: true,
      searchable: true,
      filterable: true,
      render: (row: any) => (
        <div className="font-medium text-foreground">{row.customerName}</div>
      ),
    },
    {
      key: "project",
      header: "Project",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "unitNo",
      header: "Unit",
      sortable: true,
      searchable: true,
      render: (row: any) => (
        <span className="font-mono text-sm">{row.unitNo}</span>
      ),
    },
    {
      key: "dueAmount",
      header: "Due Amount",
      sortable: true,
      render: (row: any) => (
        <div className="flex items-center gap-1 font-semibold text-foreground">
          <IndianRupee className="w-3 h-3" />
          {formatCurrency(row.dueAmount).replace("₹", "")}
        </div>
      ),
    },
    {
      key: "nextDueDate",
      header: "Due Date",
      sortable: true,
      render: (row: any) => (
        <span className="text-sm">{formatDate(row.nextDueDate)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      render: (row: any) => getStatusBadge(row.status),
    },
    {
      key: "remarks",
      header: "Remarks",
      searchable: true,
      render: (row: any) => (
        <span className="text-sm text-muted-foreground">
          {row.remarks || "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      hiddenFromToggle: true,
      sortable: false,
      render: (row: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/call-center/${row.id}`);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
      ),
    },
  ];

  const handleRowClick = (customer: Customer) => {
    router.push(`/customers/${customer.id}`);
  };

  return (
    <div className="space-y-2 p-2">
      <div className="flex items-end justify-end">
        {/* <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer payments and track payment history
          </p>
        </div> */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add New Customer
          </Button>
        )}
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Customers</div>
          <div className="text-2xl font-bold mt-1">{customers.length}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Current</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {customers.filter((c) => c.status === "CURRENT").length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Overdue</div>
          <div className="text-2xl font-bold mt-1 text-red-600">
            {customers.filter((c) => c.status === "OVERDUE").length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Receivable</div>
          <div className="text-2xl font-bold mt-1">
            {formatCurrency(
              customers.reduce((sum, c) => sum + c.remainingAmount, 0),
            )}
          </div>
        </div>
      </div> */}

      {showForm ? (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>
          <p className="text-muted-foreground">
            Customer registration form will go here...
          </p>
          <Button
            variant="outline"
            onClick={() => setShowForm(false)}
            className="mt-4"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <CommonTable
          data={customers}
          columns={columns}
          loading={false}
          striped
          hover
          showPagination
          showSearch
          searchPlaceholder="Search customers..."
          emptyMessage="No customers found"
          perPage={10}
          sortable
          showColumnToggle
          showPerPageSelector
          exportable
          selectableRows
          onRowClick={handleRowClick}
          rowClickable
        />
      )}
    </div>
  );
}

export default CustomersPage;
