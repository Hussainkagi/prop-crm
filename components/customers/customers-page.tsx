"use client";

import { useState } from "react";
import { Plus, User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RegisterCustomerForm,
  type CustomerFormData,
} from "./forms/customer-form";

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

const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "Amit Sharma",
    email: "amit.sharma@email.com",
    phone: "+91 9876543210",
    project: "Skyline Heights",
    unitNumber: "A-501",
    totalAmount: "₹85,00,000",
    paidAmount: "₹65,00,000",
    dueAmount: "₹20,00,000",
    status: "REGULAR",
    nextDueDate: "2026-03-15",
  },
  {
    id: "2",
    name: "Priya Patel",
    email: "priya.patel@email.com",
    phone: "+91 9876543211",
    project: "Skyline Heights",
    unitNumber: "B-302",
    totalAmount: "₹72,00,000",
    paidAmount: "₹45,00,000",
    dueAmount: "₹27,00,000",
    status: "DEFAULTER",
    nextDueDate: "2026-02-01",
  },
];

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [showForm, setShowForm] = useState(false);

  const handleRegister = (data: CustomerFormData) => {
    const totalAmountNum = parseFloat(data.paymentPlan.totalAmount) || 0;
    const bookingAmountNum = parseFloat(data.paymentPlan.bookingAmount) || 0;
    const dueAmount = totalAmountNum - bookingAmountNum;

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: `${data.personalInfo.firstName} ${data.personalInfo.lastName}`,
      email: data.personalInfo.email,
      phone: data.personalInfo.phone,
      project: data.propertyDetails.project.split(" - ")[0], // Extract just "Skyline Heights"
      unitNumber: data.propertyDetails.unitNumber,
      totalAmount: `₹${totalAmountNum.toLocaleString("en-IN")}`,
      paidAmount: `₹${bookingAmountNum.toLocaleString("en-IN")}`,
      dueAmount: `₹${dueAmount.toLocaleString("en-IN")}`,
      status: "REGULAR",
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
    setCustomers((prev) => [...prev, newCustomer]);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Register New Customer
          </Button>
        )}
      </div>

      {showForm ? (
        <RegisterCustomerForm
          onSubmit={handleRegister}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <div className="space-y-4">
            {customers.map((customer) => (
              <Card key={customer.id}>
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
                          <p className="font-medium">{customer.totalAmount}</p>
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
            ))}
          </div>

          {customers.length === 0 && (
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
