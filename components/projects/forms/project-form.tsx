"use client";

import { useState } from "react";
import { Building, X, Plus, MapPin } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export interface ProjectFormData {
  // Basic Information
  developer_id: string;
  project_name: string;
  project_type: string;
  project_category: string;
  rera_registration_number: string;

  // Address Information
  project_address_line1: string;
  project_address_line2: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  latitude: string;
  longitude: string;

  // Project Details
  total_land_area: string;
  land_area_unit: string;
  total_built_up_area: string;
  number_of_towers: string;
  total_units: string;

  // Dates
  launch_date: string;
  expected_completion_date: string;
  actual_completion_date: string;

  // Status
  project_status: string;
  possession_status: string;
  construction_stage_percentage: string;

  // Amenities (stored as array, will be converted to JSON)
  amenities: string[];

  // Payment Plan
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
    developer_id: "",
    project_name: "",
    project_type: "Residential",
    project_category: "",
    rera_registration_number: "",
    project_address_line1: "",
    project_address_line2: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    latitude: "",
    longitude: "",
    total_land_area: "",
    land_area_unit: "sq.ft",
    total_built_up_area: "",
    number_of_towers: "",
    total_units: "",
    launch_date: "",
    expected_completion_date: "",
    actual_completion_date: "",
    project_status: "Under Construction",
    possession_status: "Not Started",
    construction_stage_percentage: "",
    amenities: [],
    selectedPaymentPlan: "",
  });

  const [currentAmenity, setCurrentAmenity] = useState("");

  const projectTypes = ["Residential", "Commercial", "Mixed Use"];
  const projectCategories = [
    "Luxury",
    "Mid-Range",
    "Affordable",
    "Premium",
    "Budget",
  ];
  const landAreaUnits = ["sq.ft", "sq.m", "acres", "hectares"];
  const projectStatuses = [
    "Planning",
    "Under Construction",
    "Completed",
    "On Hold",
    "Cancelled",
  ];
  const possessionStatuses = [
    "Not Started",
    "Ready to Move",
    "Under Construction",
    "Possession Given",
  ];

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
    {
      id: "40-60",
      name: "40-60 Plan",
      description: "40% down payment, balance in 18 monthly installments",
      downPayment: "40%",
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

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-2">
        <Building className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold">Add New Project</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Building className="h-4 w-4" />
              Basic Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="developer_id">Developer *</Label>
                <Select
                  value={formData.developer_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, developer_id: value }))
                  }
                >
                  <SelectTrigger id="developer_id">
                    <SelectValue placeholder="Select Developer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Skyline Builders Pvt Ltd</SelectItem>
                    <SelectItem value="2">Green Valley Developers</SelectItem>
                    <SelectItem value="3">Metro Properties</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  value={formData.project_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_name: e.target.value,
                    }))
                  }
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_type">Project Type *</Label>
                <Select
                  value={formData.project_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, project_type: value }))
                  }
                >
                  <SelectTrigger id="project_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_category">Project Category</Label>
                <Select
                  value={formData.project_category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_category: value,
                    }))
                  }
                >
                  <SelectTrigger id="project_category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="rera_registration_number">
                  RERA Registration Number *
                </Label>
                <Input
                  id="rera_registration_number"
                  value={formData.rera_registration_number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rera_registration_number: e.target.value,
                    }))
                  }
                  placeholder="Enter RERA registration number"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <MapPin className="h-4 w-4" />
              Address Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project_address_line1">Address Line 1 *</Label>
                <Input
                  id="project_address_line1"
                  value={formData.project_address_line1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_address_line1: e.target.value,
                    }))
                  }
                  placeholder="Street address, building number"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project_address_line2">Address Line 2</Label>
                <Input
                  id="project_address_line2"
                  value={formData.project_address_line2}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_address_line2: e.target.value,
                    }))
                  }
                  placeholder="Apartment, suite, unit, floor, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locality">Locality *</Label>
                <Input
                  id="locality"
                  value={formData.locality}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      locality: e.target.value,
                    }))
                  }
                  placeholder="Area/Locality"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="City"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, state: e.target.value }))
                  }
                  placeholder="State"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pincode: e.target.value,
                    }))
                  }
                  placeholder="Pincode"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={formData.landmark}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      landmark: e.target.value,
                    }))
                  }
                  placeholder="Nearby landmark"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.00000001"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      latitude: e.target.value,
                    }))
                  }
                  placeholder="0.00000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.00000001"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      longitude: e.target.value,
                    }))
                  }
                  placeholder="0.00000000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Project Details</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="total_land_area">Total Land Area</Label>
                <div className="flex gap-2">
                  <Input
                    id="total_land_area"
                    type="number"
                    step="0.01"
                    value={formData.total_land_area}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        total_land_area: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                    className="flex-1"
                  />
                  <Select
                    value={formData.land_area_unit}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        land_area_unit: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {landAreaUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_built_up_area">
                  Total Built-up Area (sq.ft)
                </Label>
                <Input
                  id="total_built_up_area"
                  type="number"
                  step="0.01"
                  value={formData.total_built_up_area}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      total_built_up_area: e.target.value,
                    }))
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number_of_towers">
                  Number of Towers/Blocks
                </Label>
                <Input
                  id="number_of_towers"
                  type="number"
                  value={formData.number_of_towers}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      number_of_towers: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_units">Total Units *</Label>
                <Input
                  id="total_units"
                  type="number"
                  value={formData.total_units}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      total_units: e.target.value,
                    }))
                  }
                  placeholder="0"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates & Status */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Dates & Status</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="launch_date">Launch Date *</Label>
                <Input
                  id="launch_date"
                  type="date"
                  value={formData.launch_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      launch_date: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_completion_date">
                  Expected Completion Date *
                </Label>
                <Input
                  id="expected_completion_date"
                  type="date"
                  value={formData.expected_completion_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expected_completion_date: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual_completion_date">
                  Actual Completion Date
                </Label>
                <Input
                  id="actual_completion_date"
                  type="date"
                  value={formData.actual_completion_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      actual_completion_date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_status">Project Status *</Label>
                <Select
                  value={formData.project_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, project_status: value }))
                  }
                >
                  <SelectTrigger id="project_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="possession_status">Possession Status</Label>
                <Select
                  value={formData.possession_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      possession_status: value,
                    }))
                  }
                >
                  <SelectTrigger id="possession_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {possessionStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="construction_stage_percentage">
                  Construction Stage (%)
                </Label>
                <Input
                  id="construction_stage_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.construction_stage_percentage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      construction_stage_percentage: e.target.value,
                    }))
                  }
                  placeholder="0-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 text-base font-semibold">Amenities</h3>

            <div className="flex gap-2">
              <Input
                value={currentAmenity}
                onChange={(e) => setCurrentAmenity(e.target.value)}
                placeholder="Enter amenity (e.g., Swimming Pool, Gym, Club House)"
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

        {/* Payment Plan */}
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
