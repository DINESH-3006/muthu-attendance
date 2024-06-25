const mongoose = require('mongoose');
const {
    Employee,
    Attendance
    }=require("./schema");
const express=require('express')
const bodyParser=require('body-parser');
const app=express();
app.use(bodyParser.json());


mongoose.connect('mongodb://localhost:27017/employee');

app.get("/",(req,res)=>{
    res.send("Dinesh");
})

// FOR ADDING EMPLOYEES
app.post('/create', async (req, res) => {
    const { name, role, phone, email } = req.body;
  
    try {
      const employee = new Employee({
        name,
        role,
        phone,
        email
      });
  
      await employee.save();
      console.log('Employee created successfully');
  
      res.status(201).json({ message: 'Employee created successfully' });
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// FOR ADDING ATTENDANCE
  app.post('/add-attendance', async (req, res) => {
    const { email, date, status, reason } = req.body;
  
    try {
      const employee = await Employee.findOne({ email });
  
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      const attendance = new Attendance({
        employeeId: employee._id,
        date,
        status,
        reason
      });

      await attendance.save();
  
      employee.attendance.push(attendance._id);
      await employee.save();
  
      res.status(201).json({ message: 'Attendance added successfully' });
    } catch (error) {
      console.error('Error adding attendance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// FOR GETTING PRESENT & ABSENT OF EMPLOYEE
  app.get('/details', async (req, res) => {
    const { email } = req.body;
  
    try {
      const employee = await Employee.findOne({ email })
      console.log(employee);
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      const totalAttendanceRecords = employee.attendance.length;
      const populatedAttendance = [];
      let present=0;
      for (let objectId of employee.attendance) {
        const attendanceRecord = await Attendance.findById(objectId);
  
        if (attendanceRecord) {
          populatedAttendance.push(attendanceRecord);
          if(attendanceRecord.status)present++;
        }
      }
  
  
      console.log('Populated Attendance:', populatedAttendance.length);

      const response = {
        name: employee.name,
        role: employee.role,
        phone: employee.phone,
        totalAttendanceRecords,
        present
      };
  
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ATTENDANCE COUNT FOR TODAY
  app.get('/attendance-count', async (req, res) => {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
  
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(today.getUTCDate() + 1);
  
      const totalToday = await Attendance.countDocuments({
        date: { $gte: today, $lt: tomorrow }
      });
  
      const presentToday = await Attendance.countDocuments({
        date: { $gte: today, $lt: tomorrow },
        status: true
      });

      const response = {
        totalToday,
        presentToday
      };
  
      res.json(response);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

app.listen(3001,()=>{
    console.log("Listening");
})

 

  

  


