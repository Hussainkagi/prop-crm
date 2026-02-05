"use client";

import React from "react";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyInfoForm } from "./forms/company-info-form";
import { KycDocumentsForm } from "./forms/kyc-documents-form";
import { AddressForm } from "./forms/address-form";

interface RegisterDeveloperFormProps {
  onSubmit: (data: DeveloperFormData) => void;
  onCancel: () => void;
}

export interface DeveloperFormData {
  companyInfo: {
    companyName: string;
    companyType: string;
    panNumber: string;
    gstNumber: string;
    incorporationDate: string;
  };
  kycDocuments: {
    pan: boolean;
    gst: boolean;
    incorporation: boolean;
    addressProof: boolean;
  };
  address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

const initialFormData: DeveloperFormData = {
  companyInfo: {
    companyName: "",
    companyType: "private-limited",
    panNumber: "",
    gstNumber: "",
    incorporationDate: "",
  },
  kycDocuments: {
    pan: false,
    gst: false,
    incorporation: false,
    addressProof: false,
  },
  address: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
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

  const handleKycChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      kycDocuments: { ...prev.kycDocuments, [field]: value },
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
            <KycDocumentsForm
              data={formData.kycDocuments}
              onChange={handleKycChange}
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
