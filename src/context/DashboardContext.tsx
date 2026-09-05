"use client";

import React, { createContext, useContext, useState } from "react";
import { addDays, isSameDay, startOfDay } from "date-fns";

interface DashboardContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  goToToday: () => void;
  goToTomorrow: () => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
  isToday: boolean;
  isTomorrow: boolean;
  activeTab: "calendar" | "house";
  setActiveTab: (tab: "calendar" | "house") => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [activeTab, setActiveTab] = useState<"calendar" | "house">("calendar");

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const isToday = isSameDay(selectedDate, today);
  const isTomorrow = isSameDay(selectedDate, tomorrow);

  const goToToday = () => setSelectedDate(today);
  const goToTomorrow = () => setSelectedDate(tomorrow);
  const goToPrevDay = () => setSelectedDate((prev) => addDays(prev, -1));
  const goToNextDay = () => setSelectedDate((prev) => addDays(prev, 1));

  return (
    <DashboardContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        goToToday,
        goToTomorrow,
        goToPrevDay,
        goToNextDay,
        isToday,
        isTomorrow,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

