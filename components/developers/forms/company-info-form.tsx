"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompanyInfoFormProps {
  data: {
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
  onChange: (field: string, value: string) => void;
}

export function CompanyInfoForm({ data, onChange }: CompanyInfoFormProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Company Information</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">
            Company Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyName"
            value={data.companyName}
            onChange={(e) => onChange("companyName", e.target.value)}
            placeholder="Enter company name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationType">Registration Type</Label>
          <Select
            value={data.registrationType}
            onValueChange={(value) => onChange("registrationType", value)}
          >
            <SelectTrigger id="registrationType">
              <SelectValue placeholder="Select registration type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private-limited">Private Limited</SelectItem>
              <SelectItem value="public-limited">Public Limited</SelectItem>
              <SelectItem value="llp">LLP</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="proprietorship">Proprietorship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            value={data.registrationNumber}
            onChange={(e) => onChange("registrationNumber", e.target.value)}
            placeholder="Enter registration number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reraRegistrationNumber">
            RERA Registration Number
          </Label>
          <Input
            id="reraRegistrationNumber"
            value={data.reraRegistrationNumber}
            onChange={(e) => onChange("reraRegistrationNumber", e.target.value)}
            placeholder="Enter RERA number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPersonName">
            Contact Person Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contactPersonName"
            value={data.contactPersonName}
            onChange={(e) => onChange("contactPersonName", e.target.value)}
            placeholder="Enter contact person name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobilePrimary">
            Primary Mobile <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input value="+971" disabled className="w-20 bg-muted" />
            <Input
              id="mobilePrimary"
              type="tel"
              value={data.mobilePrimary}
              onChange={(e) => onChange("mobilePrimary", e.target.value)}
              placeholder="50 123 4567"
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobileAlternate">Alternate Mobile</Label>
          <div className="flex gap-2">
            <Input value="+971" disabled className="w-20 bg-muted" />
            <Input
              id="mobileAlternate"
              type="tel"
              value={data.mobileAlternate}
              onChange={(e) => onChange("mobileAlternate", e.target.value)}
              placeholder="50 123 4567"
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="emailPrimary">
            Primary Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="emailPrimary"
            type="email"
            value={data.emailPrimary}
            onChange={(e) => onChange("emailPrimary", e.target.value)}
            placeholder="primary@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emailAlternate">Alternate Email</Label>
          <Input
            id="emailAlternate"
            type="email"
            value={data.emailAlternate}
            onChange={(e) => onChange("emailAlternate", e.target.value)}
            placeholder="alternate@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input
            id="websiteUrl"
            type="url"
            value={data.websiteUrl}
            onChange={(e) => onChange("websiteUrl", e.target.value)}
            placeholder="https://www.example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsInBusiness">Years in Business</Label>
          <Input
            id="yearsInBusiness"
            type="number"
            value={data.yearsInBusiness}
            onChange={(e) => onChange("yearsInBusiness", e.target.value)}
            placeholder="5"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalProjectsCompleted">
            Total Projects Completed
          </Label>
          <Input
            id="totalProjectsCompleted"
            type="number"
            value={data.totalProjectsCompleted}
            onChange={(e) => onChange("totalProjectsCompleted", e.target.value)}
            placeholder="10"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="creditRating">Credit Rating</Label>
          <Select
            value={data.creditRating}
            onValueChange={(value) => onChange("creditRating", value)}
          >
            <SelectTrigger id="creditRating">
              <SelectValue placeholder="Select credit rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AAA">AAA</SelectItem>
              <SelectItem value="AA">AA</SelectItem>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="BBB">BBB</SelectItem>
              <SelectItem value="BB">BB</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
