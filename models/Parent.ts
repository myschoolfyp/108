
import mongoose from 'mongoose';

const ParentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
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
});

export default mongoose.models.Parent || 
  mongoose.model('Parent', ParentSchema, 'parents');
