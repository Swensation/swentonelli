"use client";

import { CalendarWidget } from "@/components/widgets/CalendarWidget/CalendarWidget";
import { LunchWidget } from "@/components/widgets/LunchWidget/LunchWidget";

export function DashboardGrid() {
  return (
    <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full pb-8">
      {/* Google Calendar Widget: Left Column (lg: 7 cols) */}
      <section className="lg:col-span-7 h-[700px] md:h-[750px]">
        <CalendarWidget />
      </section>

      {/* School Lunch Widget: Right Column (lg: 5 cols) */}
      <section className="lg:col-span-5 h-[700px] md:h-[750px]">
        <LunchWidget />
      </section>
    </main>
  );
}
