"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import { toast } from "sonner";
import type { Gender, RsvpStatus } from "@prisma/client";
import {
  GENDER_LABELS,
  GENDERS,
  RSVP_STATUS_LABELS,
  RSVP_STATUSES,
} from "@/lib/types";
import { resolveRsvpStatus } from "@/lib/rsvp";
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
  updateGuestRsvpStatus,
  updateGuestMustPay,
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
  const [rsvpFilter, setRsvpFilter] = useState<RsvpStatus | "ALL">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestData | undefined>();

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (genderFilter !== "ALL" && g.gender !== genderFilter) return false;
      if (rsvpFilter !== "ALL" && g.rsvpStatus !== rsvpFilter) return false;
      if (paymentFilter === "PAID" && !g.hasPaid) return false;
      if (paymentFilter === "PENDING" && g.hasPaid) return false;
      return true;
    });
  }, [guests, search, genderFilter, rsvpFilter, paymentFilter]);

  const hasActiveFilters =
    search !== "" ||
    genderFilter !== "ALL" ||
    rsvpFilter !== "ALL" ||
    paymentFilter !== "ALL";

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (genderFilter !== "ALL") params.set("gender", genderFilter);
    if (rsvpFilter !== "ALL") params.set("rsvp", rsvpFilter);
    if (paymentFilter !== "ALL") params.set("payment", paymentFilter);
    const qs = params.toString();
    return `/events/${eventId}/export${qs ? `?${qs}` : ""}`;
  }, [eventId, search, genderFilter, rsvpFilter, paymentFilter]);

  function openAddModal() {
    setEditingGuest(undefined);
    setModalOpen(true);
  }

  function openEditModal(guest: GuestData) {
    setEditingGuest(guest);
    setModalOpen(true);
  }

  async function handleTogglePaid(guestId: string, hasPaid: boolean) {
    const previous = guests.find((g) => g.id === guestId);
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId
          ? { ...g, hasPaid, rsvpStatus: resolveRsvpStatus(hasPaid, g.rsvpStatus) }
          : g
      )
    );
    try {
      await toggleGuestPaid(guestId, eventId, hasPaid);
      toast.success(hasPaid ? "Marked as paid" : "Marked as pending");
    } catch {
      if (previous) {
        setGuests((prev) =>
          prev.map((g) => (g.id === guestId ? previous : g))
        );
      }
      toast.error("Couldn't update payment status");
    }
  }

  async function handleRsvpChange(guestId: string, rsvpStatus: RsvpStatus) {
    const previous = guests.find((g) => g.id === guestId);
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, rsvpStatus } : g))
    );
    try {
      await updateGuestRsvpStatus(guestId, eventId, rsvpStatus);
      toast.success("RSVP updated");
    } catch {
      if (previous) {
        setGuests((prev) =>
          prev.map((g) => (g.id === guestId ? previous : g))
        );
      }
      toast.error("Couldn't update RSVP");
    }
  }

  async function handleMustPayChange(guestId: string, mustPay: boolean) {
    const previous = guests.find((g) => g.id === guestId);
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, mustPay } : g))
    );
    try {
      await updateGuestMustPay(guestId, eventId, mustPay);
      toast.success(mustPay ? "Marked as must pay" : "Marked as no payment due");
    } catch {
      if (previous) {
        setGuests((prev) =>
          prev.map((g) => (g.id === guestId ? previous : g))
        );
      }
      toast.error("Couldn't update payment requirement");
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
    rsvpStatus: RsvpStatus;
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

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 lg:flex-1 min-w-0">
          <div className="relative min-w-0 lg:max-w-xs">
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
            <SelectTrigger className="w-full lg:w-44">
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
            value={rsvpFilter}
            onValueChange={(v) => setRsvpFilter(v as RsvpStatus | "ALL")}
          >
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All RSVP status</SelectItem>
              {RSVP_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {RSVP_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={paymentFilter}
            onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}
          >
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All payment status</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1 lg:flex-none"
            variant="outline"
            render={<a href={exportHref} />}
          >
            <Download />
            Export CSV
          </Button>
          <Button className="flex-1 lg:flex-none" onClick={openAddModal}>
            <Plus />
            Add guest
          </Button>
        </div>
      </div>

      <p className="text-sm text-zinc-400 break-words">
        {hasActiveFilters
          ? `Showing ${filteredGuests.length} of ${guests.length} guests`
          : `${guests.length} guests`}
      </p>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden space-y-2">
        {filteredGuests.map((guest) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            onTogglePaid={handleTogglePaid}
            onRsvpChange={handleRsvpChange}
            onMustPayChange={handleMustPayChange}
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
        <Table className="min-w-[660px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>RSVP</TableHead>
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
                onRsvpChange={handleRsvpChange}
                onMustPayChange={handleMustPayChange}
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
