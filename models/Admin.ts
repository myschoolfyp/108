import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  cnic: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^\d{13}$/.test(v);
      },
      message: 'CNIC must be 13 digits without dashes'
    }
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  contactNumber: { type: String, required: true },
  profilePicture: { type: String },
});

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema, 'admins');