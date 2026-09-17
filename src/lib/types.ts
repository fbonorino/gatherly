import type { EventType, ExpenseCategory, Gender, RsvpStatus } from "@prisma/client";
import { Cake, Heart, PartyPopper, Briefcase, Sparkles, type LucideIcon } from "lucide-react";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  BIRTHDAY: "Birthday",
  WEDDING: "Wedding",
  BACHELOR_BACHELORETTE: "Bachelor/Bachelorette",
  CORPORATE: "Corporate",
  OTHER: "Other",
};

export const EVENT_TYPES: EventType[] = [
  "BIRTHDAY",
  "WEDDING",
  "BACHELOR_BACHELORETTE",
  "CORPORATE",
  "OTHER",
];

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export const GENDERS: Gender[] = ["MALE", "FEMALE", "OTHER"];

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
};

export const RSVP_STATUSES: RsvpStatus[] = ["PENDING", "CONFIRMED", "DECLINED"];

export const RSVP_STATUS_BADGE_CLASSES: Record<RsvpStatus, string> = {
  PENDING: "bg-zinc-500/20 text-zinc-400",
  CONFIRMED: "bg-emerald-500/20 text-emerald-400",
  DECLINED: "bg-rose-500/20 text-rose-400",
};

export function eventDisplayType(type: EventType, customType?: string | null) {
  if (type === "OTHER" && customType) return customType;
  return EVENT_TYPE_LABELS[type];
}

export const EVENT_TYPE_ICONS: Record<EventType, LucideIcon> = {
  BIRTHDAY: Cake,
  WEDDING: Heart,
  BACHELOR_BACHELORETTE: PartyPopper,
  CORPORATE: Briefcase,
  OTHER: Sparkles,
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  FOOD: "Food",
  DRINKS: "Drinks",
  VENUE: "Venue",
  ENTERTAINMENT: "Entertainment",
  DECOR: "Decor",
  OTHER: "Other",
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "FOOD",
  "DRINKS",
  "VENUE",
  "ENTERTAINMENT",
  "DECOR",
  "OTHER",
];

// Subtle badge colors, one distinct hue per category, matching the
// bg-{color}-500/20 text-{color}-400 style used by the Paid/Pending badges.
export const EXPENSE_CATEGORY_BADGE_CLASSES: Record<ExpenseCategory, string> = {
  FOOD: "bg-orange-500/20 text-orange-400",
  DRINKS: "bg-sky-500/20 text-sky-400",
  VENUE: "bg-violet-500/20 text-violet-400",
  ENTERTAINMENT: "bg-pink-500/20 text-pink-400",
  DECOR: "bg-teal-500/20 text-teal-400",
  OTHER: "bg-zinc-500/20 text-zinc-400",
};
