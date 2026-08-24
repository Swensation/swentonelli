import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAdminDashboardData();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Failed to generate admin housekeeping data:", err);
    return NextResponse.json(
      { error: "Failed to generate admin data", details: err.message },
      { status: 500 }
    );
  }
}

