import { NextResponse } from "next/server";
import { fetchLiveHouseSystemsData } from "@/lib/houseSystems";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchLiveHouseSystemsData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("API /api/house-systems error:", error);
    return NextResponse.json(
      { error: "Failed to fetch house systems data" },
      { status: 500 }
    );
  }
}

