import { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AppSidebar, getNavItemsForRole, getMobileNavItemsForRole } from "@/components/sidebar/AppSidebar";
import { AppMobileNav } from "@/components/AppMobileNav";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationPanel } from "@/components/notification-panel";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { userPosition } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const sidebarItems = getNavItemsForRole(userPosition);
  const mobileNavItems = getMobileNavItemsForRole(userPosition);

  return (
    <div className="flex flex-col h-screen md:flex-row bg-background text-foreground">
      {/* Desktop Sidebar */}
      <AppSidebar items={sidebarItems} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 p-4 flex justify-between items-center border-b border-border bg-card">
          <span className="font-semibold text-sm text-foreground">Oracle PRS</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-foreground" />
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children ?? <Outlet />}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <AppMobileNav items={mobileNavItems} isModalOpen={isNotificationOpen} />

      {/* Notification Panel Overlay */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
