import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GENDER_LABELS } from "@/lib/types";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { guests: { orderBy: { createdAt: "asc" } } },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const header = [
    "Name",
    "Gender",
    "Must Pay",
    "Paid",
    "Amount",
    "Comments",
  ];
  const rows = event.guests.map((g) => [
    g.name,
    GENDER_LABELS[g.gender],
    g.mustPay ? "Yes" : "No",
    g.hasPaid ? "Yes" : "No",
    g.amount != null ? String(g.amount) : "",
    g.comments ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => csvEscape(String(cell))).join(","))
    .join("\n");

  const filename = `${event.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-guests.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
