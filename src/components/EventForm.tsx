"use client";

import { useState } from "react";
import type { EventType } from "@prisma/client";
import { CalendarIcon } from "lucide-react";
import { EVENT_TYPE_LABELS, EVENT_TYPES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EventFormProps = {
  action: (formData: FormData) => void;
  defaultValues?: {
    name: string;
    type: EventType;
    customType?: string | null;
    date: Date;
    location?: string | null;
    notes?: string | null;
  };
  submitLabel: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toTimeValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventForm({
  action,
  defaultValues,
  submitLabel,
}: EventFormProps) {
  const [type, setType] = useState<EventType>(defaultValues?.type ?? "BIRTHDAY");
  const [date, setDate] = useState<Date | undefined>(defaultValues?.date);
  const [time, setTime] = useState(
    defaultValues ? toTimeValue(defaultValues.date) : "18:00"
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const combinedDateTime =
    date != null
      ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
          date.getDate()
        )}T${time || "00:00"}`
      : "";

  return (
    <form action={action} className="flex flex-col gap-6 max-w-lg">
      <input type="hidden" name="date" value={combinedDateTime} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Event name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name}
          placeholder="Sarah's 30th Birthday"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as EventType)}
          name="type"
        >
          <SelectTrigger id="type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {type === "OTHER" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="customType">Custom type</Label>
          <Input
            id="customType"
            name="customType"
            defaultValue={defaultValues?.customType ?? ""}
            placeholder="e.g. Housewarming"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Date</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start font-normal"
                />
              }
            >
              <CalendarIcon className="size-4 text-muted-foreground" />
              {date
                ? date.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Pick a date"}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setCalendarOpen(false);
                }}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="location">
          Location <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="location"
          name="location"
          defaultValue={defaultValues?.location ?? ""}
          placeholder="123 Maple St"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">
          Notes <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ""}
          className="min-h-24"
          placeholder="Anything worth remembering..."
        />
      </div>

      <Button type="submit" size="lg" className="mt-2 self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
