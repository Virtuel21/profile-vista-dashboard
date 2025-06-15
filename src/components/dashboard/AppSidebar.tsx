
import { Home, MapPin, Star, BarChart3, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type DashboardView = 'dashboard' | 'listings' | 'reviews' | 'reports' | 'settings';

interface AppSidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    view: 'dashboard' as DashboardView,
  },
  {
    title: "Listings",
    icon: MapPin,
    view: 'listings' as DashboardView,
  },
  {
    title: "Reviews",
    icon: Star,
    view: 'reviews' as DashboardView,
  },
  {
    title: "Reports",
    icon: BarChart3,
    view: 'reports' as DashboardView,
  },
  {
    title: "Settings",
    icon: Settings,
    view: 'settings' as DashboardView,
  },
];

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-white/20 bg-white/10 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">GMB Dashboard</h1>
            <p className="text-sm text-slate-600">Business Manager</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.view}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.view)}
                    isActive={activeView === item.view}
                    className={`transition-all duration-300 rounded-2xl ${
                      activeView === item.view
                        ? 'bg-white/20 backdrop-blur-sm text-blue-700 shadow-lg'
                        : 'text-slate-700 hover:bg-white/10 hover:text-blue-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
