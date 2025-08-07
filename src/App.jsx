import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import BrowseAssets from "./components/BrowseAssets";
import Holdings from "./components/Holdings";
import Transactions from "./components/Transactions";
import Dashboard from "./components/Dashboard";
import SignIn from "./components/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  Receipt, 
  ArrowLeftFromLine, 
  ArrowRightFromLine,
  BarChart3,
  Settings,
  LogOut,
  Moon,
  Sun,
  CircleDollarSign,
  BellRing
} from "lucide-react";

function MainApp() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <LayoutDashboard />,
      color: "from-blue-500 to-indigo-600",
      component: <Dashboard />
    },
    {
      id: "browse",
      name: "Browse Assets",
      icon: <Search />,
      color: "from-emerald-500 to-green-600",
      component: <BrowseAssets />
    },
    {
      id: "holdings",
      name: "Holdings",
      icon: <Briefcase />,
      color: "from-amber-500 to-orange-600",
      component: <Holdings />
    },
    {
      id: "transactions",
      name: "Transactions",
      icon: <Receipt />,
      color: "from-purple-500 to-violet-600",
      component: <Transactions />
    }
  ];

  // Find the active component
  const activeComponent = navigationItems.find(item => item.id === activePage)?.component || <Dashboard />;

  return (
    <div className="flex h-screen bg-background dark:bg-background bg-dark-pattern">
      {/* Premium Sidebar */}
      <motion.div 
        initial={{ width: sidebarCollapsed ? 80 : 280 }}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen bg-card dark:bg-card border-r shadow-lg flex flex-col z-30 relative overflow-hidden card-premium"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary/5 rounded-full translate-y-20 -translate-x-20"></div>
        
        {/* Logo Area */}
        <div className="p-5 flex items-center justify-between border-b dark:border-gray-800 relative z-10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-md">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent tracking-tight">
                  FinTrack
                </span>
                <span className="text-xs text-muted-foreground">Financial Portal</span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-md mx-auto">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="h-8 w-8 rounded-full hover:bg-muted dark:hover:bg-muted flex items-center justify-center transition-colors"
          >
            {sidebarCollapsed ? (
              <ArrowRightFromLine className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ArrowLeftFromLine className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* User profile section */}
        {!sidebarCollapsed && (
          <div className="mt-5 px-5 mb-5">
            <div className="p-3 rounded-xl bg-accent/30 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{user?.username || 'User'}</span>
                <span className="text-xs text-muted-foreground">Account Manager</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 pt-2 px-3 overflow-y-auto scrollbar-thin">
          <div className="mb-2 px-2">
            <h3 className={cn(
              "text-xs uppercase tracking-wider text-muted-foreground font-medium",
              sidebarCollapsed && "text-center"
            )}>
              {sidebarCollapsed ? "Menu" : "Menu"}
            </h3>
          </div>
          <ul className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActivePage(item.id)}
                    className={cn(
                      "flex items-center w-full p-2.5 rounded-xl transition-all duration-200 font-medium",
                      isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-md` 
                        : "hover:bg-accent/50 text-foreground"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-6 w-6",
                      isActive ? "text-white" : `text-muted-foreground`
                    )}>
                      {item.icon}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="ml-3 whitespace-nowrap overflow-hidden">
                        {item.name}
                      </span>
                    )}
                    {isActive && !sidebarCollapsed && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="h-2 w-2 rounded-full bg-white ml-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          
          {!sidebarCollapsed && (
            <div className="mt-8 mb-2 px-2">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Account</h3>
            </div>
          )}
          
          <ul className="space-y-1.5">
            <li>
              <button className="flex items-center w-full p-2.5 rounded-xl transition-all duration-200 hover:bg-accent/50 text-foreground">
                <div className="flex items-center justify-center h-6 w-6 text-muted-foreground">
                  <CircleDollarSign className="h-[1.2rem] w-[1.2rem]" />
                </div>
                {!sidebarCollapsed && (
                  <span className="ml-3 whitespace-nowrap overflow-hidden">
                    Billing
                  </span>
                )}
              </button>
            </li>
            
            <li>
              <button className="flex items-center w-full p-2.5 rounded-xl transition-all duration-200 hover:bg-accent/50 text-foreground relative">
                <div className="flex items-center justify-center h-6 w-6 text-muted-foreground">
                  <BellRing className="h-[1.2rem] w-[1.2rem]" />
                </div>
                {!sidebarCollapsed && (
                  <span className="ml-3 whitespace-nowrap overflow-hidden">
                    Notifications
                  </span>
                )}
                {showNotification && (
                  <span className="absolute right-3 top-2.5 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* Bottom Area with Theme Toggle */}
        <div className="mt-auto border-t p-4 space-y-2 dark:border-gray-800">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center w-full p-2.5 rounded-xl transition-all duration-200 hover:bg-accent/50 text-foreground"
          >
            <div className="flex items-center justify-center h-6 w-6 text-muted-foreground">
              {theme === 'dark' ? 
                <Sun className="h-[1.2rem] w-[1.2rem] text-amber-400" /> : 
                <Moon className="h-[1.2rem] w-[1.2rem] text-primary" />
              }
            </div>
            {!sidebarCollapsed && (
              <span className="ml-3">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            )}
          </button>
          
          <button
            className="flex items-center w-full p-2.5 rounded-xl transition-all duration-200 hover:bg-accent/50 text-foreground"
          >
            <div className="flex items-center justify-center h-6 w-6 text-muted-foreground">
              <Settings className="h-[1.2rem] w-[1.2rem]" />
            </div>
            {!sidebarCollapsed && (
              <span className="ml-3">Settings</span>
            )}
          </button>
          
          <button
            onClick={logout}
            className="flex items-center w-full p-2.5 rounded-xl transition-all duration-200 hover:bg-destructive/10 text-destructive"
          >
            <div className="flex items-center justify-center h-6 w-6 text-destructive">
              <LogOut className="h-[1.2rem] w-[1.2rem]" />
            </div>
            {!sidebarCollapsed && (
              <span className="ml-3">Sign Out</span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
        <div className="h-full">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activePage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeComponent}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background dark:bg-background">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/signin" element={user ? <Navigate to="/" /> : <SignIn />} />
      <Route path="/" element={
        <ProtectedRoute>
          <MainApp />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={user ? "/" : "/signin"} />} />
    </Routes>
  );
}

export default App;