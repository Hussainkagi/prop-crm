"use client";

import { useState } from "react";
import { X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Customer } from "../PriorityCard/priority-card";

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onComplete: (callData: CallData) => void;
}

export interface CallData {
  customerId: string;
  callType: string;
  callOutcome: string;
  customerResponse: string;
  callNotes: string;
  paymentCollected: boolean;
  paymentAmount?: string;
  paymentMode?: string;
  referenceNumber?: string;
  scheduleFollowup: boolean;
  followupDate?: string;
  followupPriority?: string;
  followupReason?: string;
}

export function CallDialog({
  isOpen,
  onClose,
  customer,
  onComplete,
}: CallDialogProps) {
  const [formData, setFormData] = useState<Partial<CallData>>({
    callType: "Payment Reminder",
    callOutcome: "Completed",
    customerResponse: "Promised to Pay",
    callNotes: "",
    paymentCollected: false,
    scheduleFollowup: false,
  });

  const handleComplete = () => {
    if (!customer) return;

    const callData: CallData = {
      customerId: customer.id,
      callType: formData.callType || "Payment Reminder",
      callOutcome: formData.callOutcome || "Completed",
      customerResponse: formData.customerResponse || "Promised to Pay",
      callNotes: formData.callNotes || "",
      paymentCollected: formData.paymentCollected || false,
      paymentAmount: formData.paymentAmount,
      paymentMode: formData.paymentMode,
      referenceNumber: formData.referenceNumber,
      scheduleFollowup: formData.scheduleFollowup || false,
      followupDate: formData.followupDate,
      followupPriority: formData.followupPriority,
      followupReason: formData.followupReason,
    };

    onComplete(callData);

    // Reset form
    setFormData({
      callType: "Payment Reminder",
      callOutcome: "Completed",
      customerResponse: "Promised to Pay",
      callNotes: "",
      paymentCollected: false,
      scheduleFollowup: false,
    });
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      callType: "Payment Reminder",
      callOutcome: "Completed",
      customerResponse: "Promised to Pay",
      callNotes: "",
      paymentCollected: false,
      scheduleFollowup: false,
    });
    onClose();
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-green-600 text-white -m-6 mb-0 p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-white">
                  Call in Progress
                </DialogTitle>
                <p className="text-sm text-green-100">{customer.name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="text-white hover:bg-green-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Phone:</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Unit:</p>
                <p className="font-medium">{customer.unit}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Due:</p>
                <p className="font-medium text-red-600">{customer.totalDue}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Next Due:</p>
                <p className="font-medium text-red-600">{customer.nextDue}</p>
              </div>
            </div>
          </div>

          {/* Call Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Call Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="callType">Call Type</Label>
                <Select
                  value={formData.callType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, callType: value }))
                  }
                >
                  <SelectTrigger id="callType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payment Reminder">
                      Payment Reminder
                    </SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Query Resolution">
                      Query Resolution
                    </SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="callOutcome">Call Outcome</Label>
                <Select
                  value={formData.callOutcome}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, callOutcome: value }))
                  }
                >
                  <SelectTrigger id="callOutcome">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="No Answer">No Answer</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Disconnected">Disconnected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerResponse">Customer Response</Label>
              <Select
                value={formData.customerResponse}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, customerResponse: value }))
                }
              >
                <SelectTrigger id="customerResponse">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Promised to Pay">
                    Promised to Pay
                  </SelectItem>
                  <SelectItem value="Already Paid">Already Paid</SelectItem>
                  <SelectItem value="Will Pay Soon">Will Pay Soon</SelectItem>
                  <SelectItem value="Requested Extension">
                    Requested Extension
                  </SelectItem>
                  <SelectItem value="Disputed Amount">
                    Disputed Amount
                  </SelectItem>
                  <SelectItem value="Financial Difficulty">
                    Financial Difficulty
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="callNotes">📝 Call Notes</Label>
              <Textarea
                id="callNotes"
                value={formData.callNotes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    callNotes: e.target.value,
                  }))
                }
                placeholder="Enter detailed notes about the conversation..."
                rows={4}
              />
            </div>
          </div>

          {/* Payment Collected */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="paymentCollected"
                checked={formData.paymentCollected}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentCollected: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="paymentCollected" className="font-semibold">
                💵 Payment Collected
              </Label>
            </div>

            {formData.paymentCollected && (
              <div className="space-y-4 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Amount *</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={formData.paymentAmount || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentAmount: e.target.value,
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMode">Payment Mode *</Label>
                    <Select
                      value={formData.paymentMode}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, paymentMode: value }))
                      }
                    >
                      <SelectTrigger id="paymentMode">
                        <SelectValue placeholder="Online/UPI" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online/UPI">Online/UPI</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Bank Transfer">
                          Bank Transfer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenceNumber">Reference Number</Label>
                  <Input
                    id="referenceNumber"
                    value={formData.referenceNumber || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        referenceNumber: e.target.value,
                      }))
                    }
                    placeholder="TXN/REF"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Schedule Follow-up */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="scheduleFollowup"
                checked={formData.scheduleFollowup}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduleFollowup: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="scheduleFollowup" className="font-semibold">
                📅 Schedule Follow-up
              </Label>
            </div>

            {formData.scheduleFollowup && (
              <div className="space-y-4 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="followupDate">Follow-up Date *</Label>
                    <Input
                      id="followupDate"
                      type="date"
                      value={formData.followupDate || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          followupDate: e.target.value,
                        }))
                      }
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="followupPriority">Priority *</Label>
                    <Select
                      value={formData.followupPriority}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          followupPriority: value,
                        }))
                      }
                    >
                      <SelectTrigger id="followupPriority">
                        <SelectValue placeholder="Medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followupReason">Follow-up Reason *</Label>
                  <Textarea
                    id="followupReason"
                    value={formData.followupReason || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        followupReason: e.target.value,
                      }))
                    }
                    placeholder="Please fill out this field."
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              ✕ Cancel Call
            </Button>
            <Button
              onClick={handleComplete}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              ✓ Complete Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
