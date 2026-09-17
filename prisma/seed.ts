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
            rsvpStatus: "CONFIRMED",
            amount: 15,
            comments: "Vegetarian",
          },
          {
            name: "Maria Gomez",
            gender: "FEMALE",
            mustPay: true,
            hasPaid: false,
            rsvpStatus: "PENDING",
            amount: 15,
          },
          {
            name: "Sam Lee",
            gender: "OTHER",
            mustPay: false,
            hasPaid: false,
            rsvpStatus: "DECLINED",
          },
          {
            name: "Priya Patel",
            gender: "FEMALE",
            mustPay: true,
            hasPaid: true,
            rsvpStatus: "CONFIRMED",
            amount: 15,
          },
          {
            name: "Diego Fernandez",
            gender: "MALE",
            mustPay: true,
            hasPaid: false,
            rsvpStatus: "PENDING",
            amount: 15,
            comments: "Bringing +1",
          },
        ],
      },
      expenses: {
        create: [
          {
            description: "Burgers, hot dogs & sides",
            category: "FOOD",
            amount: 85,
            paidBy: "Sarah",
          },
          {
            description: "Beer & soda run",
            category: "DRINKS",
            amount: 40,
          },
          {
            description: "Bluetooth speaker rental",
            category: "ENTERTAINMENT",
            amount: 20,
            paidBy: "Alex",
          },
        ],
      },
    },
  });

  console.log(
    `Seeded event ${event.name} with 5 guests and 3 expenses.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
