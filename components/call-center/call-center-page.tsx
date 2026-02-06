"use client";

import { useState } from "react";
import { Calendar, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PrioritizedCustomerCard,
  type Customer,
} from "./PriorityCard/priority-card";
import { CallDialog, type CallData } from "./forms/call-log-form";
import CustomersPage from "./AllCustomer/customer";

const prioritizedCustomers: Customer[] = [
  {
    id: "1",
    name: "Priya Patel",
    phone: "+91 9876543213",
    unit: "B-805",
    priority: "HIGH",
    totalDue: "₹5,500,000",
    nextDue: "₹222,222",
    dueDate: "30/1/2026",
    status: "7d overdue",
    daysOverdue: 7,
    paymentProgress: 45,
    amountPaid: "₹4,500,000",
    totalAmount: "₹10,000,000",
  },
  {
    id: "2",
    name: "Amit Sharma",
    phone: "+91 9876543211",
    unit: "A-1205",
    priority: "HIGH",
    totalDue: "₹6,500,000",
    nextDue: "₹333,333",
    dueDate: "5/2/2026",
    status: "1d overdue",
    daysOverdue: 1,
    paymentProgress: 57,
    amountPaid: "₹8,500,000",
    totalAmount: "₹15,000,000",
  },
  {
    id: "3",
    name: "Rajesh Kumar",
    phone: "+91 9876543212",
    unit: "C-304",
    priority: "MEDIUM",
    totalDue: "₹3,200,000",
    nextDue: "₹150,000",
    dueDate: "10/2/2026",
    status: "Due soon",
    daysOverdue: 0,
    paymentProgress: 68,
    amountPaid: "₹5,800,000",
    totalAmount: "₹9,000,000",
  },
];

const todayFollowUps: Customer[] = [
  {
    id: "4",
    name: "Sneha Gupta",
    phone: "+91 9876543214",
    unit: "D-602",
    priority: "HIGH",
    totalDue: "₹4,200,000",
    nextDue: "₹280,000",
    dueDate: "6/2/2026",
    status: "Follow-up scheduled",
    daysOverdue: 0,
    paymentProgress: 52,
    amountPaid: "₹3,800,000",
    totalAmount: "₹8,000,000",
  },
  {
    id: "5",
    name: "Vikram Mehta",
    phone: "+91 9876543215",
    unit: "E-1108",
    priority: "MEDIUM",
    totalDue: "₹2,800,000",
    nextDue: "₹175,000",
    dueDate: "8/2/2026",
    status: "Payment promised",
    daysOverdue: 0,
    paymentProgress: 72,
    amountPaid: "₹7,200,000",
    totalAmount: "₹10,000,000",
  },
  {
    id: "6",
    name: "Anjali Desai",
    phone: "+91 9876543216",
    unit: "F-405",
    priority: "MEDIUM",
    totalDue: "₹1,900,000",
    nextDue: "₹120,000",
    dueDate: "12/2/2026",
    status: "Requested callback",
    daysOverdue: 0,
    paymentProgress: 65,
    amountPaid: "₹3,100,000",
    totalAmount: "₹5,000,000",
  },
];

function CallCenterPage() {
  const [activeTab, setActiveTab] = useState<
    "followups" | "prioritized" | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("overdue");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  const handleCallClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCallDialogOpen(true);
  };

  const handleCallComplete = (callData: CallData) => {
    console.log("Call completed:", callData);
    // Here you would typically:
    // 1. Save the call data to your backend
    // 2. Update the customer's status
    // 3. Add to follow-ups if scheduled
    // 4. Show a success message
    setIsCallDialogOpen(false);
    setSelectedCustomer(null);
  };

  const handleCloseDialog = () => {
    setIsCallDialogOpen(false);
    setSelectedCustomer(null);
  };

  const filteredCustomers = prioritizedCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.unit.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredFollowUps = todayFollowUps.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.unit.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
          className={
            activeTab === "all" ? "bg-orange-500 hover:bg-orange-600" : ""
          }
        >
          <Users className="mr-2 h-4 w-4" />
          All Customer
        </Button>
        <Button
          variant={activeTab === "followups" ? "default" : "outline"}
          onClick={() => setActiveTab("followups")}
          className={
            activeTab === "followups" ? "bg-orange-500 hover:bg-orange-600" : ""
          }
        >
          <Calendar className="mr-2 h-4 w-4" />
          Today's Follow-ups
        </Button>
        <Button
          variant={activeTab === "prioritized" ? "default" : "outline"}
          onClick={() => setActiveTab("prioritized")}
          className={
            activeTab === "prioritized"
              ? "bg-orange-500 hover:bg-orange-600"
              : ""
          }
        >
          <Users className="mr-2 h-4 w-4" />
          Prioritized Customer List
        </Button>
      </div>

      {activeTab === "followups" ? (
        filteredFollowUps.length === 0 ? (
          <div className="flex h-[500px] items-center justify-center">
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-muted-foreground">
                    No follow-ups scheduled for today
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You're all caught up! 🎉
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Thursday, 5 February 2026
                </p>
              </div>
              <div className="ml-12 flex h-[400px] w-px border-l" />
              <div className="ml-12 flex h-full items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2">
                  <span className="text-2xl text-muted-foreground">i</span>
                </div>
                <p className="ml-4 text-sm text-muted-foreground">
                  Select a follow-up to view details
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <h2 className="text-lg font-semibold">
                  Today's Follow-ups ({filteredFollowUps.length})
                </h2>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search follow-ups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Sort by: Priority</SelectItem>
                    <SelectItem value="amount">Sort by: Amount Due</SelectItem>
                    <SelectItem value="name">Sort by: Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredFollowUps.map((customer) => (
                <PrioritizedCustomerCard
                  key={customer.id}
                  customer={customer}
                  onCallClick={handleCallClick}
                />
              ))}
            </div>
          </div>
        )
      ) : activeTab === "prioritized" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-lg font-semibold">
                Prioritized Customer List ({filteredCustomers.length})
              </h2>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[250px]"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overdue">Sort by: Overdue Days</SelectItem>
                  <SelectItem value="amount">Sort by: Amount Due</SelectItem>
                  <SelectItem value="name">Sort by: Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <PrioritizedCustomerCard
                key={customer.id}
                customer={customer}
                onCallClick={handleCallClick}
              />
            ))}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No customers found matching your search.
            </div>
          )}
        </div>
      ) : (
        <CustomersPage />
      )}

      <CallDialog
        isOpen={isCallDialogOpen}
        onClose={handleCloseDialog}
        customer={selectedCustomer}
        onComplete={handleCallComplete}
      />
    </div>
  );
}

export default CallCenterPage;
