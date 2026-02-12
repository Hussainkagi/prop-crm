"use client";

import React from "react";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyInfoForm } from "./forms/company-info-form";
import { AddressForm } from "./forms/address-form";

interface RegisterDeveloperFormProps {
  onSubmit: (data: DeveloperFormData) => void;
  onCancel: () => void;
}

export interface DeveloperFormData {
  companyInfo: {
    companyName: string;
    registrationType: string;
    registrationNumber: string;
    contactPersonName: string;
    mobilePrimary: string;
    mobileAlternate: string;
    emailPrimary: string;
    emailAlternate: string;
    websiteUrl: string;
    yearsInBusiness: string;
    totalProjectsCompleted: string;
    reraRegistrationNumber: string;
    creditRating: string;
  };
  address: {
    corrAddressLine1: string;
    corrAddressLine2: string;
    corrCity: string;
    corrState: string;
    corrPincode: string;
    corrCountry: string;
    corrLandmark: string;
    addressType: string;
  };
}

const initialFormData: DeveloperFormData = {
  companyInfo: {
    companyName: "",
    registrationType: "",
    registrationNumber: "",
    contactPersonName: "",
    mobilePrimary: "",
    mobileAlternate: "",
    emailPrimary: "",
    emailAlternate: "",
    websiteUrl: "",
    yearsInBusiness: "",
    totalProjectsCompleted: "",
    reraRegistrationNumber: "",
    creditRating: "",
  },
  address: {
    corrAddressLine1: "",
    corrAddressLine2: "",
    corrCity: "",
    corrState: "",
    corrPincode: "",
    corrCountry: "UAE",
    corrLandmark: "",
    addressType: "Corresponding",
  },
};

export function RegisterDeveloperForm({
  onSubmit,
  onCancel,
}: RegisterDeveloperFormProps) {
  const [formData, setFormData] = useState<DeveloperFormData>(initialFormData);

  const handleCompanyInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [field]: value },
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Register New Developer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <CompanyInfoForm
              data={formData.companyInfo}
              onChange={handleCompanyInfoChange}
            />

            <AddressForm
              data={formData.address}
              onChange={handleAddressChange}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Register Developer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
