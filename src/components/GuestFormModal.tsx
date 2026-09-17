"use client";

import { useState } from "react";
import type { Gender } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { GENDER_LABELS, GENDERS } from "@/lib/types";
import type { GuestData } from "./guest-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type GuestFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: GuestData;
  onSubmit: (data: {
    name: string;
    gender: Gender;
    mustPay: boolean;
    hasPaid: boolean;
    amount: number | null;
    comments: string | null;
  }) => Promise<void>;
};

export default function GuestFormModal({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: GuestFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [gender, setGender] = useState<Gender>(initial?.gender ?? "OTHER");
  const [mustPay, setMustPay] = useState(initial?.mustPay ?? false);
  const [hasPaid, setHasPaid] = useState(initial?.hasPaid ?? false);
  const [amount, setAmount] = useState(
    initial?.amount != null ? String(initial.amount) : ""
  );
  const [comments, setComments] = useState(initial?.comments ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetToInitial(nextOpen: boolean) {
    if (nextOpen) {
      setName(initial?.name ?? "");
      setGender(initial?.gender ?? "OTHER");
      setMustPay(initial?.mustPay ?? false);
      setHasPaid(initial?.hasPaid ?? false);
      setAmount(initial?.amount != null ? String(initial.amount) : "");
      setComments(initial?.comments ?? "");
      setError(null);
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        gender,
        mustPay,
        hasPaid,
        amount: amount.trim() ? Number(amount) : null,
        comments: comments.trim() || null,
      });
      onOpenChange(false);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={resetToInitial}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit guest" : "Add guest"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-name">Name</Label>
            <Input
              id="guest-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Guest name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-gender">Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
              <SelectTrigger id="guest-gender" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {GENDER_LABELS[g]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="guest-must-pay" className="font-normal">
                Must pay
              </Label>
              <Switch
                id="guest-must-pay"
                checked={mustPay}
                onCheckedChange={setMustPay}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="guest-has-paid" className="font-normal">
                Has paid
              </Label>
              <Switch
                id="guest-has-paid"
                checked={hasPaid}
                onCheckedChange={setHasPaid}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-amount">
              Amount <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="guest-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="guest-comments">
              Comments <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="guest-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-16"
              placeholder="Allergies, +1, etc."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => resetToInitial(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
