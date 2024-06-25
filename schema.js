const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    attendance: [{type: mongoose.Schema.Types.ObjectId,ref: 'Employee'}]
  });
  
  const Employee = mongoose.model('Employee', employeeSchema);
  

const AttendanceSchema = new mongoose.Schema({
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,ref: 'Employee',
    },
    date: {
      type: Date,
    },
    status: {
      type: Boolean,
    },
    reason: {
      type: String,enum: ['Paid Leave', 'Absent', 'Present'],
    }
  });
  
  const Attendance = mongoose.model('Attendance', AttendanceSchema);
  
  module.exports = { Employee, Attendance };