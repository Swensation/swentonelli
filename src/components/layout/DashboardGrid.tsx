"use client";

import { CalendarWidget } from "@/components/widgets/CalendarWidget/CalendarWidget";
import { LunchWidget } from "@/components/widgets/LunchWidget/LunchWidget";

export function DashboardGrid() {
  return (
    <main className="w-full pb-8 space-y-6">
      {/* Google Calendar Widget: Full Width for maximum horizontal real estate */}
      <section className="w-full min-h-[750px]">
        <CalendarWidget />
      </section>

      {/* School Lunch Menu Widget */}
      <section className="w-full">
        <LunchWidget />
      </section>
    </main>
  );
}

