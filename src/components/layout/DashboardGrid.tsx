"use client";

import { CalendarWidget } from "@/components/widgets/CalendarWidget/CalendarWidget";

export function DashboardGrid() {
  return (
    <main className="w-full pb-8">
      {/* Google Calendar Widget: Full Width for maximum horizontal real estate */}
      <section className="w-full min-h-[750px]">
        <CalendarWidget />
      </section>
    </main>
  );
}


