"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeveloperCard, type Developer } from "./developer-card";
import {
  RegisterDeveloperForm,
  type DeveloperFormData,
} from "./register-developer-form";

const initialDevelopers: Developer[] = [
  {
    id: "1",
    companyName: "Skyline Builders Pvt Ltd",
    companyType: "Private Limited",
    pan: "AABCS1234F",
    gst: "27AABCS1234F1Z5",
    contact: "Rajesh Kumar",
    phone: "+91 9876543210",
    location: "Mumbai, Maharashtra",
    kycStatus: "VERIFIED",
    status: "ACTIVE",
  },
];

function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>(initialDevelopers);
  const [showForm, setShowForm] = useState(false);

  const handleRegister = (data: DeveloperFormData) => {
    const newDeveloper: Developer = {
      id: Date.now().toString(),
      companyName: data.companyInfo.companyName,
      companyType: data.companyInfo.companyType,
      pan: data.companyInfo.panNumber,
      gst: data.companyInfo.gstNumber,
      contact: "New Contact",
      phone: "+91 0000000000",
      location: `${data.address.city}, ${data.address.state}`,
      kycStatus: "PENDING",
      status: "ACTIVE",
    };
    setDevelopers((prev) => [...prev, newDeveloper]);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Developer Management</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Register New Developer
          </Button>
        )}
      </div>

      {showForm ? (
        <RegisterDeveloperForm
          onSubmit={handleRegister}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div className="space-y-4">
          {developers.map((developer) => (
            <DeveloperCard key={developer.id} developer={developer} />
          ))}
          {developers.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No developers registered yet. Click the button above to register a
              new developer.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DevelopersPage;
