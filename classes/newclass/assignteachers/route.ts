import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ClassModel from "@/models/Class";
import TeacherModel from "@/models/Teacher";

// Connect to MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const department = searchParams.get("department");

    if (action === "fetchClasses") {
      // Fetch all classes excluding students array
      const classes = await ClassModel.find({}, { students: 0 }).exec();
      return NextResponse.json(classes);
    }

    if (action === "fetchTeachers" && department) {
      // Fetch teachers filtered by department
      const teachers = await TeacherModel.find({ department })
        .select("firstName lastName department")
        .exec();
      return NextResponse.json(teachers);
    }

    return NextResponse.json(
      { error: "Invalid action or missing parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
    try {
      await connectToDatabase();
      const { className, teachers } = await request.json();
  
      // Validate input
      if (!className || !teachers || !Array.isArray(teachers)) {
        return NextResponse.json(
          { error: "Invalid input data" },
          { status: 400 }
        );
      }
  
      // Update the class with the new teachers array
      const updatedClass = await ClassModel.findOneAndUpdate(
        { className },
        { $set: { teachers } }, // Ensure this matches the schema
        { new: true }
      );
  
      if (!updatedClass) {
        return NextResponse.json(
          { error: "Class not found" },
          { status: 404 }
        );
      }
  
      console.log("Updated Class:", updatedClass); // Debug log
  
      return NextResponse.json({
        success: true,
        message: "Teachers assigned successfully!",
        updatedClass,
      });
    } catch (error) {
      console.error("Error in POST handler:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }