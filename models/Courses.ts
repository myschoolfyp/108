import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  educationLevel: { type: String, required: true },
  classLevel: { type: String, required: true },
  courses: { type: [String], required: true }
});

export default mongoose.models.Course || mongoose.model('Course', CourseSchema, 'courses');