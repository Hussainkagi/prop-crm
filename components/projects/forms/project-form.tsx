"use client";

import { useState } from "react";
import { Building, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface ProjectFormData {
  projectInfo: {
    name: string;
    developer: string;
    location: string;
    type: string;
  };
  details: {
    totalValue: string;
    totalUnits: string;
    launchDate: string;
    expectedCompletion: string;
  };
  amenities: string[];
  propertyTypes: Array<{
    type: string;
    sizes: string;
    count: string;
  }>;
  selectedPaymentPlan: string;
}

interface RegisterProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
}

export function RegisterProjectForm({
  onSubmit,
  onCancel,
}: RegisterProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    projectInfo: {
      name: "",
      developer: "",
      location: "",
      type: "residential",
    },
    details: {
      totalUnits: "",
      launchDate: "",
      expectedCompletion: "",
      totalValue: "",
    },
    amenities: [],
    propertyTypes: [],
    selectedPaymentPlan: "",
  });

  const [currentAmenity, setCurrentAmenity] = useState("");
  const [currentPropertyType, setCurrentPropertyType] = useState({
    type: "",
    sizes: "",
    count: "",
  });

  const paymentPlans = [
    {
      id: "20-80",
      name: "20-80 Plan",
      description: "20% down payment, balance in 36 monthly installments",
      downPayment: "20%",
    },
    {
      id: "30-70",
      name: "30-70 Plan",
      description: "30% down payment, balance in 24 monthly installments",
      downPayment: "30%",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addAmenity = () => {
    if (currentAmenity.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, currentAmenity.trim()],
      }));
      setCurrentAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const addPropertyType = () => {
    if (
      currentPropertyType.type &&
      currentPropertyType.sizes &&
      currentPropertyType.count
    ) {
      setFormData((prev) => ({
        ...prev,
        propertyTypes: [...prev.propertyTypes, currentPropertyType],
      }));
      setCurrentPropertyType({ type: "", sizes: "", count: "" });
    }
  };

  const removePropertyType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-2">
        <Building className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold">Add New Project</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Building className="h-4 w-4" />
              Project Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="developer">Developer *</Label>
                <Select
                  value={formData.projectInfo.developer}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, developer: value },
                    }))
                  }
                >
                  <SelectTrigger id="developer">
                    <SelectValue placeholder="Select Developer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skyline">
                      Skyline Builders Pvt Ltd
                    </SelectItem>
                    <SelectItem value="other">Other Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={formData.projectInfo.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectInfo: {
                        ...prev.projectInfo,
                        name: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.projectInfo.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectInfo: {
                        ...prev.projectInfo,
                        location: e.target.value,
                      },
                    }))
                  }
                  placeholder="Enter location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type *</Label>
                <Select
                  value={formData.projectInfo.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectInfo: { ...prev.projectInfo, type: value },
                    }))
                  }
                >
                  <SelectTrigger id="projectType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="mixed">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalUnits">Total Units *</Label>
                <Input
                  id="totalUnits"
                  type="number"
                  value={formData.details.totalUnits}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      details: { ...prev.details, totalUnits: e.target.value },
                    }))
                  }
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="launchDate">Launch Date *</Label>
                <Input
                  id="launchDate"
                  type="date"
                  value={formData.details.launchDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      details: { ...prev.details, launchDate: e.target.value },
                    }))
                  }
                  placeholder="dd/mm/yyyy"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedCompletion">
                  Expected Completion *
                </Label>
                <Input
                  id="expectedCompletion"
                  type="date"
                  value={formData.details.expectedCompletion}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      details: {
                        ...prev.details,
                        expectedCompletion: e.target.value,
                      },
                    }))
                  }
                  placeholder="dd/mm/yyyy"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Amenities</h3>

            <div className="flex gap-2">
              <Input
                value={currentAmenity}
                onChange={(e) => setCurrentAmenity(e.target.value)}
                placeholder="Enter amenity (e.g., Swimming Pool)"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addAmenity())
                }
                className="flex-1"
              />
              <Button
                type="button"
                onClick={addAmenity}
                size="icon"
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.amenities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-sm"
                  >
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Property Types</h3>

            <div className="flex gap-2">
              <Input
                placeholder="Type (Flat/Villa)"
                value={currentPropertyType.type}
                onChange={(e) =>
                  setCurrentPropertyType((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className="flex-1"
              />
              <Input
                placeholder="Sizes (1BHK, 2BHK)"
                value={currentPropertyType.sizes}
                onChange={(e) =>
                  setCurrentPropertyType((prev) => ({
                    ...prev,
                    sizes: e.target.value,
                  }))
                }
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="0"
                value={currentPropertyType.count}
                onChange={(e) =>
                  setCurrentPropertyType((prev) => ({
                    ...prev,
                    count: e.target.value,
                  }))
                }
                className="w-24"
              />
              <Button
                type="button"
                onClick={addPropertyType}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.propertyTypes.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.propertyTypes.map((pt, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="text-sm">
                      {pt.type}: {pt.sizes} ({pt.count} units)
                    </span>
                    <button
                      type="button"
                      onClick={() => removePropertyType(index)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">
              Select Payment Plan
            </h3>

            <RadioGroup
              value={formData.selectedPaymentPlan}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, selectedPaymentPlan: value }))
              }
              className="space-y-3"
            >
              {paymentPlans.map((plan) => (
                <label
                  key={plan.id}
                  htmlFor={plan.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <RadioGroupItem
                    value={plan.id}
                    id={plan.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {plan.description}
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      Down Payment: {plan.downPayment}
                    </div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Project</Button>
        </div>
      </form>
    </div>
  );
}
