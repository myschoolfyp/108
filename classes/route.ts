import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const mongoUri = "mongodb://localhost:27017/myschool";

export async function GET() {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();
    const classes = await db.collection("classes").find().toArray();
    return NextResponse.json(classes);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db();

    const data = await request.json();

    // Validate class name (letters only, max 15 characters)
    const classNameRegex = /^[A-Za-z\s]{1,15}$/;
    if (!classNameRegex.test(data.className)) {
      return NextResponse.json(
        { message: "Class name must contain only letters and be up to 15 characters" },
        { status: 400 }
      );
    }

    // Check if class name already exists
    const existingClass = await db.collection("classes").findOne({
      className: data.className,
    });

    if (existingClass) {
      return NextResponse.json(
        { message: "Class name already exists" },
        { status: 400 }
      );
    }

    // Validate stream for classes 9 and 10
    if (["Class 9", "Class 10"].includes(data.classLevel)) {
      if (!["Arts", "Science", "Computer"].includes(data.stream)) {
        return NextResponse.json(
          { message: "Invalid stream for class level 9 or 10" },
          { status: 400 }
        );
      }
    } else {
      // Set stream to "General" for classes below 9
      data.stream = "General";
    }

    // Insert the new class with additional fields
    const result = await db.collection("classes").insertOne({
      classLevel: data.classLevel,
      className: data.className,
      stream: data.stream,
      students: data.students || [], // Array of student IDs
      courses: data.courses || [], // Array of course names
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}