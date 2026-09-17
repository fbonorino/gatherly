import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.create({
    data: {
      name: "Sarah's 30th Birthday BBQ",
      type: "BIRTHDAY",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      location: "Backyard, 123 Maple St",
      notes: "Bring your own drinks. Grill starts at 4pm.",
      guests: {
        create: [
          {
            name: "Alex Johnson",
            gender: "MALE",
            mustPay: true,
            hasPaid: true,
            amount: 15,
            comments: "Vegetarian",
          },
          {
            name: "Maria Gomez",
            gender: "FEMALE",
            mustPay: true,
            hasPaid: false,
            amount: 15,
          },
          {
            name: "Sam Lee",
            gender: "OTHER",
            mustPay: false,
            hasPaid: false,
          },
          {
            name: "Priya Patel",
            gender: "FEMALE",
            mustPay: true,
            hasPaid: true,
            amount: 15,
          },
          {
            name: "Diego Fernandez",
            gender: "MALE",
            mustPay: true,
            hasPaid: false,
            amount: 15,
            comments: "Bringing +1",
          },
        ],
      },
    },
  });

  console.log(`Seeded event ${event.name} with 5 guests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
