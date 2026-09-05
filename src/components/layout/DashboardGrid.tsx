"use client";

import { useDashboard } from "@/context/DashboardContext";
import { CalendarWidget } from "@/components/widgets/CalendarWidget/CalendarWidget";
import { HouseSystemsWidget } from "@/components/widgets/HouseSystemsWidget/HouseSystemsWidget";

export function DashboardGrid() {
  const { activeTab } = useDashboard();

  return (
    <main className="w-full pb-8">
      {/* Dynamic Peer Presentation: Family Calendar or 10 Bullard Lane Smart Systems */}
      <section className="w-full min-h-[750px]">
        {activeTab === "calendar" ? (
          <CalendarWidget />
        ) : (
          <HouseSystemsWidget />
        )}
      </section>
    </main>
  );
}


