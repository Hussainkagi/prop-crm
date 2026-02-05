"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface KycDocumentsFormProps {
  data: {
    pan: boolean
    gst: boolean
    incorporation: boolean
    addressProof: boolean
  }
  onChange: (field: string, value: boolean) => void
}

export function KycDocumentsForm({ data, onChange }: KycDocumentsFormProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="font-semibold">KYC Documents</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="kyc-pan"
            checked={data.pan}
            onCheckedChange={(checked) => onChange("pan", checked as boolean)}
          />
          <Label htmlFor="kyc-pan" className="cursor-pointer">
            Pan
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="kyc-gst"
            checked={data.gst}
            onCheckedChange={(checked) => onChange("gst", checked as boolean)}
          />
          <Label htmlFor="kyc-gst" className="cursor-pointer">
            Gst
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="kyc-incorporation"
            checked={data.incorporation}
            onCheckedChange={(checked) => onChange("incorporation", checked as boolean)}
          />
          <Label htmlFor="kyc-incorporation" className="cursor-pointer">
            Incorporation
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="kyc-address"
            checked={data.addressProof}
            onCheckedChange={(checked) => onChange("addressProof", checked as boolean)}
          />
          <Label htmlFor="kyc-address" className="cursor-pointer">
            Address Proof
          </Label>
        </div>
      </div>
    </div>
  )
}
