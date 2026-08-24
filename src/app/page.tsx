import { Header } from "@/components/layout/Header";
import { DashboardGrid } from "@/components/layout/DashboardGrid";
import { DashboardProvider } from "@/context/DashboardContext";

export default function HomePage() {
  return (
    <DashboardProvider>
      <div className="flex flex-col min-h-full">
        <Header />
        <DashboardGrid />
      </div>
    </DashboardProvider>
  );
}
