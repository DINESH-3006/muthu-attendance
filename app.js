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
  
// last seven days records 
  app.get('/last-week-records',async (req,res)=> {
    const now = new Date();
    now.setUTCHours(0);
    now.setUTCMinutes(0);
    now.setUTCSeconds(0);
    now.setUTCMilliseconds(0);
    const last_seven_days = []
    for(let i = 0;i<7;i++){
      let date = new Date(now - i * 24 * 60 * 60 * 1000)
      last_seven_days.push(date)
    }
    console.log(last_seven_days)
    const result = []
    for(var index = 0;index<last_seven_days.length;index++){
      const attendanceRecord = await Attendance.find({date : last_seven_days[index]});
      numberOfPresent = 0;
      attendanceRecord.forEach(item => {
        if(item.status) numberOfPresent++;
      })
      result.push({
        date : last_seven_days[index],
        day : 7 - index,
        totalPresent : numberOfPresent
      })
    }
    res.json({
      result
    })
  });


  // Fetching monthly based attendance records 
  app.post('/get-month-details', async (req, res) => {
    const { email, month, year } = req.body;

    try {
        const employee = await Employee.findOne({ email }).populate('attendance');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const attendanceRecords = await Attendance.find({
            employeeId: employee._id,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        const result = attendanceRecords.map(record => ({
            date: record.date,
            status: record.status
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// For Getting all attendance records of a particular person 
app.post('/get-all-records',async (req,res)=>{
    const {email}=req.body;

    try{
      const employee=await Employee.findOne({email}).populate('attendance');

    if(!employee){
      return res.status(404).json({ message: 'Employee not found' });
    }

    const attendanceRecords=await Attendance.find({
      employeeId:employee._id,
    }).sort({date:1});

    const response=attendanceRecords.map(record=>({
        date:record.date,
        status:record.status
    }));

    res.json(response);
    }
    catch(error){
      res.status(500).json({ message: 'Server error', error });
    }  
});

app.listen(3001,()=>{
    console.log("Listening");
})

 

  

  


