import type { EventType, Gender } from "@prisma/client";
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
