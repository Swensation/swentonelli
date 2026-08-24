import { getLunchForDates } from "@/lib/lunch";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const lunchData = getLunchForDates(targetDate);
    return NextResponse.json(lunchData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("API /api/lunch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch school lunch menu" },
      { status: 500 }
    );
  }
}

