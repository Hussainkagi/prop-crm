"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, User, Phone, Mail, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterCustomerFlow } from "./forms/customer-form";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  project: string;
  unitNumber: string;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  status: "REGULAR" | "DEFAULTER" | "CLEARED";
  nextDueDate: string;
}

interface ApiCustomer {
  customer_id: number;
  developer_id: number;
  plan_id: number | null;
  salutation: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  mobile_primary: string;
  mobile_alternate: string;
  whatsapp_number: string;
  email_primary: string;
  email_alternate: string;
  gender: string;
  nationality: string;
  corr_city: string;
  corr_state: string;
  customer_status: string;
  created_at: string;
  updated_at: string;
}

function mapApiCustomerToCustomer(apiCustomer: ApiCustomer): Customer {
  const fullName = [
    apiCustomer.salutation,
    apiCustomer.first_name,
    apiCustomer.middle_name,
    apiCustomer.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: String(apiCustomer.customer_id),
    name: fullName,
    email: apiCustomer.email_primary,
    phone: apiCustomer.mobile_primary,
    project: "—",
    unitNumber: "—",
    totalAmount: "—",
    paidAmount: "—",
    dueAmount: "—",
    status:
      apiCustomer.customer_status === "Active"
        ? "REGULAR"
        : apiCustomer.customer_status === "Defaulter"
          ? "DEFAULTER"
          : "CLEARED",
    nextDueDate: "—",
  };
}

function CustomerCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("crm_access_token")
        : null;

    const [data] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/customers?page=1&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      )
        .then((res) => {
          if (!res.ok)
            throw new Error(`Error ${res.status}: ${res.statusText}`);
          return res.json();
        })
        .catch((err: Error) => {
          setError(err.message || "Failed to fetch customers");
          return null;
        }),
      new Promise((resolve) => setTimeout(resolve, 400)),
    ]);

    if (data?.success && Array.isArray(data.data)) {
      setCustomers(data.data.map(mapApiCustomerToCustomer));
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleComplete = (customerId: number) => {
    setShowForm(false);
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Register New Customer
          </Button>
        )}
      </div>

      {showForm ? (
        <RegisterCustomerFlow
          apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}
          onComplete={handleComplete}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
              <button
                onClick={fetchCustomers}
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              <>
                <CustomerCardSkeleton />
                <CustomerCardSkeleton />
                <CustomerCardSkeleton />
              </>
            ) : (
              customers.map((customer) => (
                <Card
                  key={customer.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {customer.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {customer.project} - {customer.unitNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            customer.status === "REGULAR"
                              ? "default"
                              : customer.status === "DEFAULTER"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {customer.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{customer.email}</span>
                        </div>
                      </div>
                      <div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total</p>
                            <p className="font-medium">
                              {customer.totalAmount}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Paid</p>
                            <p className="font-medium text-green-600">
                              {customer.paidAmount}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Due</p>
                            <p className="font-medium text-red-600">
                              {customer.dueAmount}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Next Due: {customer.nextDueDate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {!isLoading && customers.length === 0 && !error && (
            <div className="py-12 text-center text-muted-foreground">
              No customers registered yet. Click the button above to register a
              new customer.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CustomersPage;
