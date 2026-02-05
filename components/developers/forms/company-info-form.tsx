"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CompanyInfoFormProps {
  data: {
    companyName: string
    companyType: string
    panNumber: string
    gstNumber: string
    incorporationDate: string
  }
  onChange: (field: string, value: string) => void
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
          <Select value={data.companyType} onValueChange={(value) => onChange("companyType", value)}>
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
          <Label htmlFor="panNumber">
            PAN Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="panNumber"
            value={data.panNumber}
            onChange={(e) => onChange("panNumber", e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            maxLength={10}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gstNumber">
            GST Number <span className="text-destructive">*</span>
          </Label>
          <Input
            id="gstNumber"
            value={data.gstNumber}
            onChange={(e) => onChange("gstNumber", e.target.value.toUpperCase())}
            placeholder="22ABCDE1234F1Z5"
            maxLength={15}
          />
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
      </div>
    </div>
  )
}
