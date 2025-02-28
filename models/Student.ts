
import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { 
    type: String, 
    unique: true,
    required: true 
  },
  password: { type: String, required: true },
  contactNumber: { type: String, required: true },
  profilePicture: { type: String },
  classLevel: { type: Number, required: true },
  classType: { type: String, required: true },
  rollNo: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{9}$/.test(v);
      },
      message: 'Roll number must be 9 digits'
    }
  }
});

export default mongoose.models.Student || 
  mongoose.model('Student', StudentSchema, 'students');
