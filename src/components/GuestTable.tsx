"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { Gender } from "@prisma/client";
import { GENDER_LABELS, GENDERS } from "@/lib/types";
import type { GuestData } from "./guest-types";
import GuestRow from "./GuestRow";
import GuestCard from "./GuestCard";
import GuestFormModal from "./GuestFormModal";
import SummaryBar from "./SummaryBar";
import {
  createGuest,
  updateGuest,
  deleteGuest,
  toggleGuestPaid,
} from "@/app/actions/guests";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaymentFilter = "ALL" | "PAID" | "PENDING";

export default function GuestTable({
  eventId,
  initialGuests,
}: {
  eventId: string;
  initialGuests: GuestData[];
}) {
  const [guests, setGuests] = useState(initialGuests);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<Gender | "ALL">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestData | undefined>();

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (genderFilter !== "ALL" && g.gender !== genderFilter) return false;
      if (paymentFilter === "PAID" && !g.hasPaid) return false;
      if (paymentFilter === "PENDING" && g.hasPaid) return false;
      return true;
    });
  }, [guests, search, genderFilter, paymentFilter]);

  function openAddModal() {
    setEditingGuest(undefined);
    setModalOpen(true);
  }

  function openEditModal(guest: GuestData) {
    setEditingGuest(guest);
    setModalOpen(true);
  }

  async function handleTogglePaid(guestId: string, hasPaid: boolean) {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, hasPaid } : g))
    );
    try {
      await toggleGuestPaid(guestId, eventId, hasPaid);
      toast.success(hasPaid ? "Marked as paid" : "Marked as pending");
    } catch {
      setGuests((prev) =>
        prev.map((g) => (g.id === guestId ? { ...g, hasPaid: !hasPaid } : g))
      );
      toast.error("Couldn't update payment status");
    }
  }

  async function handleDelete(guestId: string) {
    const prev = guests;
    const guest = guests.find((g) => g.id === guestId);
    setGuests((p) => p.filter((g) => g.id !== guestId));
    try {
      await deleteGuest(guestId, eventId);
      toast.success(guest ? `${guest.name} removed` : "Guest removed");
    } catch {
      setGuests(prev);
      toast.error("Couldn't remove guest");
    }
  }

  async function handleSubmit(data: {
    name: string;
    gender: Gender;
    mustPay: boolean;
    hasPaid: boolean;
    amount: number | null;
    comments: string | null;
  }) {
    if (editingGuest) {
      const updated = await updateGuest(editingGuest.id, {
        eventId,
        ...data,
      });
      setGuests((prev) =>
        prev.map((g) => (g.id === updated.id ? { ...g, ...data } : g))
      );
      toast.success("Guest updated");
    } else {
      const created = await createGuest({ eventId, ...data });
      setGuests((prev) => [...prev, { ...created, eventId }]);
      toast.success("Guest added");
    }
  }

  return (
    <div className="space-y-6">
      <SummaryBar guests={guests} />

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="pl-8"
            />
          </div>
          <Select
            value={genderFilter}
            onValueChange={(v) => setGenderFilter(v as Gender | "ALL")}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All genders</SelectItem>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>
                  {GENDER_LABELS[g]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={paymentFilter}
            onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All payment status</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openAddModal}>
          <Plus />
          Add guest
        </Button>
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-2">
        {filteredGuests.map((guest) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            onTogglePaid={handleTogglePaid}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        ))}
        {filteredGuests.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm border border-border rounded-lg">
            No guests match your filters.
          </p>
        )}
      </div>

      {/* Desktop/tablet: table */}
      <div className="hidden sm:block border border-border rounded-lg overflow-x-auto">
        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="text-center">Must pay</TableHead>
              <TableHead className="text-center">Paid</TableHead>
              <TableHead>Comments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuests.map((guest, index) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                index={index}
                onTogglePaid={handleTogglePaid}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
        {filteredGuests.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No guests match your filters.
          </p>
        )}
      </div>

      <GuestFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editingGuest}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
