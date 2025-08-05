import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth-options";
import { staffService } from "@/services/staffService";

// Get department by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or superadmin
    const userRole = session.user?.role;
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse department ID
    const departmentId = parseInt(params.id);

    if (isNaN(departmentId)) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    // Get department by ID
    const department = await staffService.getDepartmentById(departmentId);

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Update department
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or superadmin
    const userRole = session.user?.role;
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse department ID and request body
    const departmentId = parseInt(params.id);

    if (isNaN(departmentId)) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 }
      );
    }

    // Update department
    const updatedDepartment = await staffService.updateDepartment(
      departmentId,
      body
    );

    return NextResponse.json(updatedDepartment);
  } catch (error: unknown) {
    console.error("Error updating department:", error);

    if (typeof error === "object" && error !== null && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Department not found" },
          { status: 404 }
        );
      }

      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Department with this name already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Delete department
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or superadmin
    const userRole = session.user?.role;
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse department ID
    const departmentId = parseInt(params.id);

    if (isNaN(departmentId)) {
      return NextResponse.json(
        { error: "Invalid department ID" },
        { status: 400 }
      );
    }

    // Delete department
    await staffService.deleteDepartment(departmentId);

    return NextResponse.json({ message: "Department deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting department:", error);

    if (typeof error === "object" && error !== null && "code" in error) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Department not found" },
          { status: 404 }
        );
      }
    }

    if (typeof error === "object" && error !== null && "message" in error) {
      const errorMessage = error.message;
      if (
        typeof errorMessage === "string" &&
        errorMessage.includes("Cannot delete department")
      ) {
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
      return NextResponse.json(
        { error: String(errorMessage) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
