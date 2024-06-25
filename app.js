const mongoose = require('mongoose');
const {
    Employee,
    Attendance
    }=require("./schema");
const express=require('express')
// const cors=require('cors');
const bodyParser=require('body-parser');

const app=express();
// app.use(cors);
app.use(bodyParser.json());


mongoose.connect('mongodb://localhost:27017/employee');

app.get("/",(req,res)=>{
    res.send("Dinesh");
})

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


  app.post('/add-attendance', async (req, res) => {
    const { email, date, status, reason } = req.body;
  
    try {
      // Step 1: Find the employee based on the provided email
      const employee = await Employee.findOne({ email });
  
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      // Step 2: Create a new attendance record
      const attendance = new Attendance({
        employeeId: employee._id,
        date,
        status,
        reason
      });
  
      // Step 3: Save the attendance record
      await attendance.save();
  
      // Step 4: Update the employee document to include the attendance record ID
      employee.attendance.push(attendance._id);
      await employee.save();
  
      res.status(201).json({ message: 'Attendance added successfully' });
    } catch (error) {
      console.error('Error adding attendance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


  app.get('/details', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Find the employee by email and populate the 'attendance' field with actual attendance records
      const employee = await Employee.findOne({ email })
      console.log(employee);
      
      // const attend=await Attendance.find(employee._id)
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
  
      // Get the total attendance records and count of present days
      const totalAttendanceRecords = employee.attendance.length;
      const populatedAttendance = [];
      let present=0;

      // Iterate over each attendance ObjectId and populate the record
      for (let objectId of employee.attendance) {
        const attendanceRecord = await Attendance.findById(objectId);
  
        if (attendanceRecord) {
          populatedAttendance.push(attendanceRecord);
          if(attendanceRecord.status)present++;
        }
      }
  
      // Log the populated attendance records for debugging
      console.log('Populated Attendance:', populatedAttendance.length);

  
      // Construct the response
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

app.listen(3001,()=>{
    console.log("Listening");
})

 

  

  


