import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, type LucideIcon } from "lucide-react";
import { useLogout } from "@/context/AuthContext";
import type { NavItem } from "@/components/sidebar/AppSidebar";

interface AppMobileNavProps {
  items: NavItem[];
  isModalOpen?: boolean;
}

export function AppMobileNav({ items, isModalOpen = false }: AppMobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [isVisible, setIsVisible] = useState(true);

  const navItemsWithLogout: Array<
    | { id: string; label: string; icon: LucideIcon; path: string; action?: undefined }
    | { id: string; label: string; icon: LucideIcon; action: () => void; path?: undefined }
  > = [
    ...items.map((item) => ({ ...item, action: undefined as undefined })),
    { id: "logout", label: "Logout", icon: LogOut, action: handleLogout, path: undefined },
  ];

  const getCurrentPage = () => {
    const path = location.pathname;
    const matchedItem = items.find((item) => path === item.path);
    if (matchedItem) return matchedItem.id;
    // Fuzzy match: find item whose path best matches the current pathname
    const partialMatch = items.find((item) => path.startsWith(item.path));
    return partialMatch?.id ?? items[0]?.id ?? "";
  };

  useEffect(() => {
    const scrollContainer =
      document.querySelector('[class*="overflow-y-auto"]') || window;
    let lastScrollYRef = 0;

    const handleScroll = () => {
      const currentScrollY =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      if (currentScrollY < lastScrollYRef) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
        setIsVisible(false);
      }
      lastScrollYRef = currentScrollY;
    };

    (scrollContainer as HTMLElement | Window).addEventListener("scroll", handleScroll, { passive: true });
    return () =>
      (scrollContainer as HTMLElement | Window).removeEventListener("scroll", handleScroll);
  }, []);

  const currentPage = getCurrentPage();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-3 border-t border-border bg-card transition-transform duration-300 ${
        isVisible && !isModalOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {navItemsWithLogout.map((item) => {
        const isActive = !item.action && currentPage === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.action) {
                item.action();
              } else if (item.path) {
                navigate(item.path);
              }
            }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px] ${
              isActive
                ? "bg-foreground text-background"
                : item.action
                  ? "text-destructive hover:bg-accent"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
