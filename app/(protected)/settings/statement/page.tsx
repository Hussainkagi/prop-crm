"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankStatement } from "@/components/settings/bankstatement";
import { CreditScore } from "@/components/settings/creditscore";

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
            <TabsTrigger value="overview">Bank Statment</TabsTrigger>
            <TabsTrigger value="history">User Credit Score</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <BankStatement />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <CreditScore />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
