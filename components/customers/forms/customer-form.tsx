"use client";

import { useState } from "react";
import { CustomerBasicInfoForm } from "./parts/basic";
import { CustomerPropertyPlanForm } from "./parts/property";

type FlowStep = "basic" | "property" | "done";

interface RegisterCustomerFlowProps {
  /** Base URL for the API, e.g. "https://api.example.com" */
  apiBaseUrl: string;
  onComplete: (customerId: number) => void;
  onCancel: () => void;
}

export function RegisterCustomerFlow({
  apiBaseUrl,
  onComplete,
  onCancel,
}: RegisterCustomerFlowProps) {
  const [step, setStep] = useState<FlowStep>("basic");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [developerId, setDeveloperId] = useState<number | null>(null);

  const handleBasicSuccess = (id: number, devId: number) => {
    setCustomerId(id);
    setDeveloperId(devId);
    setStep("property");
  };

  const handlePropertySuccess = () => {
    if (customerId !== null) {
      onComplete(customerId);
    }
  };

  const handleSkip = () => {
    if (customerId !== null) {
      onComplete(customerId);
    }
  };

  if (step === "basic") {
    return (
      <CustomerBasicInfoForm
        apiBaseUrl={apiBaseUrl}
        onSuccess={handleBasicSuccess}
        onCancel={onCancel}
      />
    );
  }

  if (step === "property" && customerId !== null && developerId !== null) {
    return (
      <CustomerPropertyPlanForm
        apiBaseUrl={apiBaseUrl}
        customerId={customerId}
        developerId={developerId}
        onSuccess={handlePropertySuccess}
        onSkip={handleSkip}
      />
    );
  }

  return null;
}
