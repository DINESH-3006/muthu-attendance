import { PrismaClient, Reason } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function generateFakeAttendanceData() {
  const email = "athesh85@gmail.com";

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("User not found");
      return;
    }

    const fakeAttendanceRecords = [];

    for (let i = 0; i < 10; i++) {
      const date = faker.date.past();
      const status = faker.datatype.boolean();
      const reason = faker.helpers.arrayElement(Object.values(Reason));

      fakeAttendanceRecords.push({
        userId: user.id,
        date,
        status,
        reason,
      });
    }

    await prisma.attendance.createMany({
      data: fakeAttendanceRecords,
    });

    console.log("10 fake attendance records created successfully");
  } catch (error) {
    console.error("Error generating fake attendance data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Call the function
generateFakeAttendanceData();
