"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankStatement } from "@/components/settings/bankstatement";
import { CreditScore } from "@/components/settings/creditscore";
import { BankStatementRecords } from "@/components/settings/bankstatementrecords";
import CustomerStatmentRecord from "@/components/settings/bankStatementByCust";

export default function StatementPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Statements</h1>
          <p className="text-gray-600 mt-2">
            Manage and view your payment statements
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Bank Statement</TabsTrigger>
            <TabsTrigger value="history">User Credit Score</TabsTrigger>
            <TabsTrigger value="records">Bank Statement Records</TabsTrigger>
            <TabsTrigger value="customer">Customer Records</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <BankStatement />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <CreditScore />
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <BankStatementRecords />
          </TabsContent>
          <TabsContent value="customer" className="space-y-4">
            <CustomerStatmentRecord />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
