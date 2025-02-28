import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Course from "@/models/Courses"; // Import Course model

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

    if (action === "fetchCourses") {
      const courses = await Course.find().exec();
      return NextResponse.json(courses);
    }

    return NextResponse.json(
      { error: "Invalid action parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}