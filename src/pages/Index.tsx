import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { ListingsView } from "@/components/dashboard/ListingsView";
import { ReviewsView } from "@/components/dashboard/ReviewsView";
import { ReportsView } from "@/components/dashboard/ReportsView";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { useAuth } from "@/components/auth/AuthProvider";
import { RealDataDashboard } from "@/components/dashboard/RealDataDashboard";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type DashboardView = 'dashboard' | 'listings' | 'reviews' | 'reports' | 'settings';

const Index = () => {
  const [activeView, setActiveView] = useState<DashboardView>('dashboard');
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <RealDataDashboard />;
      case 'listings':
        return <ListingsView />;
      case 'reviews':
        return <ReviewsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <RealDataDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar activeView={activeView} onViewChange={setActiveView} />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">Welcome back, {user.email}</span>
              </div>
              <Button 
                onClick={signOut}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
            {renderView()}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
