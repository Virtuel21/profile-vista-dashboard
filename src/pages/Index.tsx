
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { ListingsView } from "@/components/dashboard/ListingsView";
import { ReviewsView } from "@/components/dashboard/ReviewsView";
import { ReportsView } from "@/components/dashboard/ReportsView";
import { SettingsView } from "@/components/dashboard/SettingsView";

type DashboardView = 'dashboard' | 'listings' | 'reviews' | 'reports' | 'settings';

const Index = () => {
  const [activeView, setActiveView] = useState<DashboardView>('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardHome />;
      case 'listings':
        return <ListingsView />;
      case 'reviews':
        return <ReviewsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar activeView={activeView} onViewChange={setActiveView} />
          <main className="flex-1 p-6">
            {renderView()}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
