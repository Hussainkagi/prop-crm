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
    companyType: string;
    incorporationDate: string;
    companyEmail: string;
    contactPersonName: string;
    contactPersonMobile: string;
    companyPhoneNumber: string;
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
          <Label htmlFor="companyType">
            Company Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.companyType}
            onValueChange={(value) => onChange("companyType", value)}
          >
            <SelectTrigger id="companyType">
              <SelectValue placeholder="Select company type" />
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
          <Label htmlFor="incorporationDate">
            Incorporation Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="incorporationDate"
            type="date"
            value={data.incorporationDate}
            onChange={(e) => onChange("incorporationDate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyEmail">
            Company Email ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="companyEmail"
            type="email"
            value={data.companyEmail}
            onChange={(e) => onChange("companyEmail", e.target.value)}
            placeholder="company@example.com"
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
          <Label htmlFor="contactPersonMobile">
            Contact Person Mobile <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input value="+971" disabled className="w-20 bg-muted" />
            <Input
              id="contactPersonMobile"
              type="tel"
              value={data.contactPersonMobile}
              onChange={(e) => onChange("contactPersonMobile", e.target.value)}
              placeholder="50 123 4567"
              className="flex-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyPhoneNumber">
            Company Phone Number <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input value="+971" disabled className="w-20 bg-muted" />
            <Input
              id="companyPhoneNumber"
              type="tel"
              value={data.companyPhoneNumber}
              onChange={(e) => onChange("companyPhoneNumber", e.target.value)}
              placeholder="4 123 4567"
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
