"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentPlansList } from "@/components/paymentplans/paymentplanlist/paymentplan";
import { PaymentMilestonesList } from "@/components/paymentplans/paymentmilestonelist/milestone";

export default function PaymentPlansPage() {
  const [activeTab, setActiveTab] = useState("plans");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment Configuration</h1>
        <p className="text-muted-foreground">
          Manage payment plans and milestones
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Payment Plans</TabsTrigger>
          <TabsTrigger value="milestones">Payment Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <PaymentPlansList />
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <PaymentMilestonesList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
