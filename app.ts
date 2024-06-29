import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors"

const prisma = new PrismaClient();
const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Dinesh");
});

app.post("/create", async (req, res) => {
  const { name, userRole, email } = req.body;
  
  try {
    const user = await prisma.user.create({
      data: { name, userRole, email },
    });

    res
      .status(201)
      .json({ message: "user created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// FOR ADDING ATTENDANCE
app.post("/add-attendance", async (req, res) => {
  const { email, date, status, reason } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        date: new Date(date),
        status:status==='true',
        reason,
      },
    });

    res
      .status(201)
      .json({ message: "Attendance added successfully", attendance });
  } catch (error) {
    console.error("Error adding attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// FOR GETTING PRESENT & ABSENT OF user
app.post("/details", async (req, res) => {

  const { email } = req.body;
  console.log(email)

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { attendance: true },
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const totalAttendanceRecords = user.attendance.length;
    const present = user.attendance.filter((att) => att.status).length;

    const response = {
      name: user.name,
      role: user.userRole,
      totalAttendanceRecords,
      present,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ATTENDANCE COUNT FOR TODAY
app.get("/attendance-count", async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    const totalToday = await prisma.attendance.count({
      where: {
        date: { gte: today, lt: tomorrow },
      },
    });

    const presentToday = await prisma.attendance.count({
      where: {
        date: { gte: today, lt: tomorrow },
        status: true,
      },
    });

    const response = {
      totalToday,
      presentToday,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// last seven days records
app.get("/last-week-records", async (req, res) => {
  try {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);

    const lastSevenDays = [];
    for (let i = 0; i < 7; i++) {
      let date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      lastSevenDays.push(date);
    }

    const result = await Promise.all(
      lastSevenDays.map(async (date, index) => {
        const attendanceRecords = await prisma.attendance.findMany({
          where: { date: date },
        });

        const totalPresent = attendanceRecords.filter(
          (record) => record.status
        ).length;

        return {
          date,
          day: 7 - index,
          totalPresent,
        };
      })
    );

    res.json({ result });
  } catch (error) {
    console.error("Error fetching last week records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetching monthly based attendance records
app.post("/get-month-details", async (req, res) => {
  const { email, month, year } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { attendance: true },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    });

    const result = attendanceRecords.map((record) => ({
      date: record.date,
      status: record.status,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching month details:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// For Getting all attendance records of a particular person
app.post("/get-all-records", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { attendance: true },
    });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });

    const response = attendanceRecords.map((record) => ({
      date: record.date,
      status: record.status,
    }));

    res.json(response);
  } catch (error) {
    console.error("Error fetching all records:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.listen(3001, () => {
  console.log("Listening on port 3001");
});
