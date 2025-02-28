import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contactNumber: { type: String, required: true },
  profilePicture: { type: String },
  cnic: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\d{13}$/.test(v);
      },
      message: 'CNIC must be 13 digits without dashes',
    },
  },
  department: {
    type: String,
    required: true,
    enum: ['Arts', 'Maths', 'Chem', 'Physics', 'English', 'Urdu', 'Islamiat', 'History'],
  },
});

export default mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema);