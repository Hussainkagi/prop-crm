"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddressFormProps {
  data: {
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    pincode: string
    country: string
  }
  onChange: (field: string, value: string) => void
}

export function AddressForm({ data, onChange }: AddressFormProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Correspondence Address</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="addressLine1">
            Address Line 1 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="addressLine1"
            value={data.addressLine1}
            onChange={(e) => onChange("addressLine1", e.target.value)}
            placeholder="Enter address line 1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input
            id="addressLine2"
            value={data.addressLine2}
            onChange={(e) => onChange("addressLine2", e.target.value)}
            placeholder="Enter address line 2"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="Enter city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">
              State <span className="text-destructive">*</span>
            </Label>
            <Input
              id="state"
              value={data.state}
              onChange={(e) => onChange("state", e.target.value)}
              placeholder="Enter state"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">
              Pincode <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pincode"
              value={data.pincode}
              onChange={(e) => onChange("pincode", e.target.value)}
              placeholder="400001"
              maxLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => onChange("country", e.target.value)}
              placeholder="India"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
