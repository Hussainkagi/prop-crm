"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CustomerFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    alternatePhone: string;
  };
  kycInfo: {
    panNumber: string;
    aadharNumber: string;
  };
  address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pincode: string;
  };
  employmentInfo: {
    occupation: string;
    annualIncome: string;
  };
  propertyDetails: {
    project: string;
    propertyType: string;
    propertySize: string;
    unitNumber: string;
    floorNumber: string;
  };
  paymentPlan: {
    plan: string;
    totalAmount: string;
    bookingAmount: string;
    bookingDate: string;
  };
}

interface RegisterCustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  onCancel: () => void;
}

// Hardcoded project data
const projectsData = {
  "Skyline Heights - Powai, Mumbai": {
    propertyTypes: ["1 BHK", "2 BHK", "3 BHK"],
    sizes: {
      "1 BHK": ["650 sq.ft", "750 sq.ft"],
      "2 BHK": ["1050 sq.ft", "1200 sq.ft"],
      "3 BHK": ["1450 sq.ft", "1650 sq.ft"],
    },
    units: {
      "1 BHK": ["A-101", "A-102", "B-201", "B-202"],
      "2 BHK": ["A-301", "A-302", "B-401", "B-402"],
      "3 BHK": ["A-501", "A-502", "B-601", "B-602"],
    },
    paymentPlans: [
      {
        name: "20-80 Plan",
        description: "20% down payment, balance in 36 monthly installments",
        downPayment: "20%",
      },
      {
        name: "30-70 Plan",
        description: "30% down payment, balance in 24 monthly installments",
        downPayment: "30%",
      },
    ],
  },
};

export function RegisterCustomerForm({
  onSubmit,
  onCancel,
}: RegisterCustomerFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CustomerFormData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      alternatePhone: "",
    },
    kycInfo: {
      panNumber: "",
      aadharNumber: "",
    },
    address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
    },
    employmentInfo: {
      occupation: "",
      annualIncome: "",
    },
    propertyDetails: {
      project: "",
      propertyType: "",
      propertySize: "",
      unitNumber: "",
      floorNumber: "",
    },
    paymentPlan: {
      plan: "",
      totalAmount: "",
      bookingAmount: "",
      bookingDate: "",
    },
  });

  const selectedProject = formData.propertyDetails.project;
  const selectedPropertyType = formData.propertyDetails.propertyType;

  const availableSizes =
    selectedProject && selectedPropertyType
      ? projectsData[selectedProject as keyof typeof projectsData]?.sizes[
          selectedPropertyType as keyof (typeof projectsData)["Skyline Heights - Powai, Mumbai"]["sizes"]
        ] || []
      : [];

  const availableUnits =
    selectedProject && selectedPropertyType
      ? projectsData[selectedProject as keyof typeof projectsData]?.units[
          selectedPropertyType as keyof (typeof projectsData)["Skyline Heights - Powai, Mumbai"]["units"]
        ] || []
      : [];

  const availablePaymentPlans = selectedProject
    ? projectsData[selectedProject as keyof typeof projectsData]
        ?.paymentPlans || []
    : [];

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const updatePersonalInfo = (
    field: keyof CustomerFormData["personalInfo"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const updateKycInfo = (
    field: keyof CustomerFormData["kycInfo"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      kycInfo: { ...prev.kycInfo, [field]: value },
    }));
  };

  const updateAddress = (
    field: keyof CustomerFormData["address"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const updateEmploymentInfo = (
    field: keyof CustomerFormData["employmentInfo"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      employmentInfo: { ...prev.employmentInfo, [field]: value },
    }));
  };

  const updatePropertyDetails = (
    field: keyof CustomerFormData["propertyDetails"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      propertyDetails: { ...prev.propertyDetails, [field]: value },
    }));

    // Reset dependent fields when project or property type changes
    if (field === "project") {
      setFormData((prev) => ({
        ...prev,
        propertyDetails: {
          ...prev.propertyDetails,
          project: value,
          propertyType: "",
          propertySize: "",
          unitNumber: "",
          floorNumber: "",
        },
      }));
    } else if (field === "propertyType") {
      setFormData((prev) => ({
        ...prev,
        propertyDetails: {
          ...prev.propertyDetails,
          propertyType: value,
          propertySize: "",
          unitNumber: "",
        },
      }));
    }
  };

  const updatePaymentPlan = (
    field: keyof CustomerFormData["paymentPlan"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      paymentPlan: { ...prev.paymentPlan, [field]: value },
    }));
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              👤
            </span>
            {step === 1 && "Register New Customer"}
            {step === 2 && "Property Purchase Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.personalInfo.firstName}
                      onChange={(e) =>
                        updatePersonalInfo("firstName", e.target.value)
                      }
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.personalInfo.lastName}
                      onChange={(e) =>
                        updatePersonalInfo("lastName", e.target.value)
                      }
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) =>
                        updatePersonalInfo("email", e.target.value)
                      }
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.personalInfo.phone}
                      onChange={(e) =>
                        updatePersonalInfo("phone", e.target.value)
                      }
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    value={formData.personalInfo.alternatePhone}
                    onChange={(e) =>
                      updatePersonalInfo("alternatePhone", e.target.value)
                    }
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* KYC Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">KYC Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number *</Label>
                    <Input
                      id="panNumber"
                      value={formData.kycInfo.panNumber}
                      onChange={(e) =>
                        updateKycInfo("panNumber", e.target.value)
                      }
                      placeholder="ABCDE1234F"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                    <Input
                      id="aadharNumber"
                      value={formData.kycInfo.aadharNumber}
                      onChange={(e) =>
                        updateKycInfo("aadharNumber", e.target.value)
                      }
                      placeholder="1234 5678 9012"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="font-semibold">Address</h3>
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={formData.address.addressLine1}
                    onChange={(e) =>
                      updateAddress("addressLine1", e.target.value)
                    }
                    placeholder="Enter address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={formData.address.addressLine2}
                    onChange={(e) =>
                      updateAddress("addressLine2", e.target.value)
                    }
                    placeholder="Enter address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => updateAddress("city", e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => updateAddress("state", e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.address.pincode}
                    onChange={(e) => updateAddress("pincode", e.target.value)}
                    placeholder="Enter pincode"
                  />
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Employment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation *</Label>
                    <Input
                      id="occupation"
                      value={formData.employmentInfo.occupation}
                      onChange={(e) =>
                        updateEmploymentInfo("occupation", e.target.value)
                      }
                      placeholder="Enter occupation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">Annual Income *</Label>
                    <Input
                      id="annualIncome"
                      value={formData.employmentInfo.annualIncome}
                      onChange={(e) =>
                        updateEmploymentInfo("annualIncome", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={handleNext}>Next: Property Details</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Select Project */}
              <div className="space-y-4">
                <h3 className="font-semibold">Select Project</h3>
                <div className="space-y-2">
                  <Label htmlFor="project">Project *</Label>
                  <Select
                    value={formData.propertyDetails.project}
                    onValueChange={(value) =>
                      updatePropertyDetails("project", value)
                    }
                  >
                    <SelectTrigger id="project">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Skyline Heights - Powai, Mumbai">
                        Skyline Heights - Powai, Mumbai
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Property Details - Show only after project selection */}
              {selectedProject && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Property Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Property Type *</Label>
                      <Select
                        value={formData.propertyDetails.propertyType}
                        onValueChange={(value) =>
                          updatePropertyDetails("propertyType", value)
                        }
                      >
                        <SelectTrigger id="propertyType">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectsData[
                            selectedProject as keyof typeof projectsData
                          ]?.propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertySize">Property Size *</Label>
                      <Select
                        value={formData.propertyDetails.propertySize}
                        onValueChange={(value) =>
                          updatePropertyDetails("propertySize", value)
                        }
                        disabled={!selectedPropertyType}
                      >
                        <SelectTrigger id="propertySize">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unitNumber">Unit Number *</Label>
                      <Select
                        value={formData.propertyDetails.unitNumber}
                        onValueChange={(value) =>
                          updatePropertyDetails("unitNumber", value)
                        }
                        disabled={!selectedPropertyType}
                      >
                        <SelectTrigger id="unitNumber">
                          <SelectValue placeholder="A-101" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floorNumber">Floor Number</Label>
                      <Input
                        id="floorNumber"
                        value={formData.propertyDetails.floorNumber}
                        onChange={(e) =>
                          updatePropertyDetails("floorNumber", e.target.value)
                        }
                        placeholder="Enter.."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Select Payment Plan - Show only after project selection */}
              {selectedProject && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Select Payment Plan</h3>
                  <div className="space-y-3">
                    {availablePaymentPlans.map((plan) => (
                      <div
                        key={plan.name}
                        className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                          formData.paymentPlan.plan === plan.name
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => updatePaymentPlan("plan", plan.name)}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            checked={formData.paymentPlan.plan === plan.name}
                            onChange={() =>
                              updatePaymentPlan("plan", plan.name)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{plan.name}</div>
                            <div className="text-sm text-gray-600">
                              {plan.description}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Down Payment: {plan.downPayment}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Details - Show only after project selection */}
              {selectedProject && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Financial Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalAmount">Total Amount *</Label>
                      <Input
                        id="totalAmount"
                        value={formData.paymentPlan.totalAmount}
                        onChange={(e) =>
                          updatePaymentPlan("totalAmount", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookingAmount">Booking Amount *</Label>
                      <Input
                        id="bookingAmount"
                        value={formData.paymentPlan.bookingAmount}
                        onChange={(e) =>
                          updatePaymentPlan("bookingAmount", e.target.value)
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bookingDate">Booking Date *</Label>
                    <Input
                      id="bookingDate"
                      type="date"
                      value={formData.paymentPlan.bookingDate}
                      onChange={(e) =>
                        updatePaymentPlan("bookingDate", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Register Customer</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
