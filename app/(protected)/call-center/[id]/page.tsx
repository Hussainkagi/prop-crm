"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Building,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CommonTable from "@/components/organism/commonTable";

interface PaymentHistory {
  id: string;
  sNo: number;
  dueDate: string;
  dueAmount: number;
  duePercentage?: number;
  paymentReceived: boolean;
  receivedDate?: string;
  receivedAmount?: number;
  remarks?: string;
}

interface CustomerDetails {
  id: string;
  customerName: string;
  project: string;
  unitNo: string;
  paymentPlan: string;
  unitAmount: number;
  buyingDate: string;
  dueStartDate: string;
  monthlyPreferredDueDate: string;
  status: "CURRENT" | "OVERDUE" | "PAID" | "PARTIAL";
  contactNumber: string;
  email: string;
  address: string;
  totalPaid: number;
  remainingAmount: number;
  paymentHistory: PaymentHistory[];
}

// Dummy data matching the screenshot
const dummyCustomerDetails: CustomerDetails = {
  id: "1",
  customerName: "Abhay",
  project: "Emaar",
  unitNo: "B506",
  paymentPlan: "20:60:20",
  unitAmount: 500000,
  buyingDate: "2026-01-05",
  dueStartDate: "2026-02-10",
  monthlyPreferredDueDate: "10th",
  status: "CURRENT",
  contactNumber: "+91 9876543210",
  email: "abhay@example.com",
  address: "Mumbai, Maharashtra",
  totalPaid: 100000,
  remainingAmount: 400000,
  paymentHistory: [
    {
      id: "1",
      sNo: 1,
      dueDate: "2026-01-05",
      dueAmount: 100000,
      duePercentage: 20,
      paymentReceived: true,
      receivedDate: "2026-01-05",
      receivedAmount: 100000,
      remarks: "initial Payment",
    },
    {
      id: "2",
      sNo: 2,
      dueDate: "2026-02-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "3",
      sNo: 3,
      dueDate: "2026-03-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "4",
      sNo: 4,
      dueDate: "2026-04-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "5",
      sNo: 5,
      dueDate: "2026-05-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "6",
      sNo: 6,
      dueDate: "2026-06-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "7",
      sNo: 7,
      dueDate: "2026-07-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "8",
      sNo: 8,
      dueDate: "2026-08-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "9",
      sNo: 9,
      dueDate: "2026-09-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "10",
      sNo: 10,
      dueDate: "2026-10-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "11",
      sNo: 11,
      dueDate: "2026-11-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "12",
      sNo: 12,
      dueDate: "2026-12-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "13",
      sNo: 13,
      dueDate: "2027-01-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "14",
      sNo: 14,
      dueDate: "2027-02-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "15",
      sNo: 15,
      dueDate: "2027-03-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "16",
      sNo: 16,
      dueDate: "2027-04-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
    {
      id: "17",
      sNo: 17,
      dueDate: "2027-05-10",
      dueAmount: 5000,
      paymentReceived: false,
    },
  ],
};
function CustomerDetailPage({ customerId }: { customerId: string }) {
  const [customer] = useState<CustomerDetails>(dummyCustomerDetails);
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

  const getStatusBadge = (status: CustomerDetails["status"]) => {
    const statusConfig = {
      CURRENT: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        icon: CheckCircle,
      },
      OVERDUE: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: AlertCircle,
      },
      PAID: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        icon: CheckCircle,
      },
      PARTIAL: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        icon: Clock,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} flex items-center gap-1 w-fit`}
      >
        <Icon className="w-4 h-4" />
        {status}
      </span>
    );
  };

  const paymentColumns: any[] = [
    {
      key: "sNo",
      header: "S No",
      width: "80px",
      sortable: true,
    },
    {
      key: "dueDate",
      header: "Due Date",
      sortable: true,
      render: (row: any) => formatDate(row.dueDate),
    },
    {
      key: "dueAmount",
      header: "Due Amount",
      sortable: true,
      render: (row: any) => (
        <div className="flex items-center gap-1 font-semibold">
          <IndianRupee className="w-3 h-3" />
          {formatCurrency(row.dueAmount).replace("₹", "")}
        </div>
      ),
    },
    {
      key: "duePercentage",
      header: "Due %",
      width: "100px",
      sortable: true,
      render: (row: any) => (row.duePercentage ? `${row.duePercentage}%` : "-"),
    },
    {
      key: "paymentReceived",
      header: "Payment Status",
      filterable: true,
      render: (row: any) =>
        row.paymentReceived ? (
          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
            Yes
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 rounded-full text-xs font-medium">
            No
          </span>
        ),
    },
    {
      key: "receivedDate",
      header: "Received Date",
      render: (row: any) =>
        row.receivedDate ? formatDate(row.receivedDate) : "-",
    },
    {
      key: "receivedAmount",
      header: "Received Amount",
      render: (row: any) =>
        row.receivedAmount ? (
          <div className="flex items-center gap-1 font-semibold text-green-600">
            <IndianRupee className="w-3 h-3" />
            {formatCurrency(row.receivedAmount).replace("₹", "")}
          </div>
        ) : (
          "-"
        ),
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
  ];

  const completionPercentage = (customer.totalPaid / customer.unitAmount) * 100;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{customer.customerName}</h1>
            <p className="text-muted-foreground mt-1">Customer Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Send className="w-4 h-4 mr-2" />
            Send Reminder
          </Button>
        </div>
      </div>

      {/* Customer Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Project</p>
              <p className="text-2xl font-bold mt-1">{customer.project}</p>
            </div>
            <Building className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unit Number</p>
              <p className="text-2xl font-bold mt-1 font-mono">
                {customer.unitNo}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unit Amount</p>
              <p className="text-2xl font-bold mt-1">
                {formatCurrency(customer.unitAmount)}
              </p>
            </div>
            <IndianRupee className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-2">{getStatusBadge(customer.status)}</div>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Customer Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Customer Name</span>
              <span className="font-medium">{customer.customerName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Contact Number</span>
              <span className="font-medium">{customer.contactNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{customer.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium">{customer.address}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Payment Plan</span>
              <span className="font-medium">{customer.paymentPlan}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Buying Date</span>
              <span className="font-medium">
                {formatDate(customer.buyingDate)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Due Start Date</span>
              <span className="font-medium">
                {formatDate(customer.dueStartDate)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Preferred Due Date</span>
              <span className="font-medium">
                {customer.monthlyPreferredDueDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Progress</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(customer.totalPaid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(customer.remainingAmount)}
              </p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium">
                {completionPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold">Payment History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete payment schedule and history
          </p>
        </div>
        <div className="p-6">
          <CommonTable
            data={customer.paymentHistory}
            columns={paymentColumns}
            loading={false}
            striped
            hover
            showPagination
            showSearch
            searchPlaceholder="Search payment history..."
            emptyMessage="No payment history found"
            perPage={10}
            sortable
            showColumnToggle
            showPerPageSelector
            exportable
            rowClickable={false}
          />
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailPage;
