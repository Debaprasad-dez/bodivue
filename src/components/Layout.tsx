
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHealth } from "../contexts/HealthContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Home, Coffee, Salad, LineChart } from "lucide-react";
import logo from '../assets/bodivueLogo.png'

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { healthData, toggleDarkMode } = useHealth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home className="w-4 h-4" /> },
    { path: "/tips", label: "Health Tips", icon: <Coffee className="w-4 h-4" /> },
    { path: "/diet", label: "Diet Planner", icon: <Salad className="w-4 h-4" /> },
    { path: "/progress", label: "Progress", icon: <LineChart className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-10 flex justify-between items-center px-4 py-3 bg-white dark:bg-card border-b border-border md:hidden">
        
      <img src={logo} style={{width: '180px'}} alt="" />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="ml-auto text-foreground"
        >
          {healthData.settings.darkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 border-r border-border bg-background dark:bg-card">
        <div className="flex items-center justify-center h-16 border-b border-border">
        <img src={logo} style={{width: '180px'}} alt="" />
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                className={`w-full justify-start ${
                  location.pathname === item.path
                    ? "bg-health-teal text-white"
                    : "hover:bg-health-lightTeal hover:text-health-teal"
                }`}
                onClick={() => navigate(item.path)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full flex items-center"
            onClick={toggleDarkMode}
          >
            {healthData.settings.darkMode ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Dark Mode
              </>
            )}
          </Button>
        </div>
        <div className="border-border border-t p-4 text-center text-xs text-white bg-health-teal ">
        © 2025 Debaprasad.
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 pb-16 md:pb-0">
        <div className="p-4 md:p-6">{children}</div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background dark:bg-card z-10 drop-shadow-[-4px_4px_10px_rgba(13,148,136,0.5)]">
        <div className="grid grid-cols-4 my-3 ">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`flex flex-col items-center justify-center py-4 ${
                location.pathname === item.path
                  ? "text-health-teal  focus:bg-background"
                  : "text-muted-foreground hover:bg-white"
              }`}
              onClick={() => navigate(item.path)}
            >
              <div className={`mb-0 mt-2 ${
                location.pathname === item.path
                  ? "drop-shadow-[0px_0px_12px_rgba(13,148,136,0.8)] "
                  : ""
              } `}>{item.icon}</div>
              <span className="text-[10px]">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Layout;
