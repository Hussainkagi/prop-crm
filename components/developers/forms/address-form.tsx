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

interface AddressFormProps {
  data: {
    corrAddressLine1: string;
    corrAddressLine2: string;
    corrCity: string;
    corrState: string;
    corrPincode: string;
    corrCountry: string;
    corrLandmark: string;
    addressType: string;
  };
  onChange: (field: string, value: string) => void;
}

export function AddressForm({ data, onChange }: AddressFormProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">Address Information</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="addressType">
            Address Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.addressType}
            onValueChange={(value) => onChange("addressType", value)}
          >
            <SelectTrigger id="addressType">
              <SelectValue placeholder="Select address type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Corresponding">Correspondence</SelectItem>
              <SelectItem value="Permanent">Permanent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="corrAddressLine1">
            Address Line 1 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="corrAddressLine1"
            value={data.corrAddressLine1}
            onChange={(e) => onChange("corrAddressLine1", e.target.value)}
            placeholder="Enter address line 1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="corrAddressLine2">Address Line 2</Label>
          <Input
            id="corrAddressLine2"
            value={data.corrAddressLine2}
            onChange={(e) => onChange("corrAddressLine2", e.target.value)}
            placeholder="Enter address line 2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="corrLandmark">Landmark</Label>
          <Input
            id="corrLandmark"
            value={data.corrLandmark}
            onChange={(e) => onChange("corrLandmark", e.target.value)}
            placeholder="Enter nearby landmark"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="corrCity">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="corrCity"
              value={data.corrCity}
              onChange={(e) => onChange("corrCity", e.target.value)}
              placeholder="Enter city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="corrState">
              State <span className="text-destructive">*</span>
            </Label>
            <Input
              id="corrState"
              value={data.corrState}
              onChange={(e) => onChange("corrState", e.target.value)}
              placeholder="Enter state"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="corrPincode">
              Pincode <span className="text-destructive">*</span>
            </Label>
            <Input
              id="corrPincode"
              value={data.corrPincode}
              onChange={(e) => onChange("corrPincode", e.target.value)}
              placeholder="400001"
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="corrCountry">
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              id="corrCountry"
              value={data.corrCountry}
              onChange={(e) => onChange("corrCountry", e.target.value)}
              placeholder="UAE"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
