import { useState } from "react";
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import BrowseAssets from "./components/BrowseAssets";
import Holdings from "./components/Holdings";
import Transactions from "./components/Transactions";
import Dashboard from "./components/Dashboard";
import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  Receipt, 
  ArrowLeftFromLine, 
  ArrowRightFromLine,
  BarChart3,
  Settings
} from "lucide-react";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div 
        initial={{ width: sidebarCollapsed ? 80 : 240 }}
        animate={{ width: sidebarCollapsed ? 80 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen bg-white border-r shadow-sm flex flex-col z-30"
      >
        {/* Logo Area */}
        <div className="p-4 flex items-center justify-between border-b">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                FinTrack
              </span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            {sidebarCollapsed ? (
              <ArrowRightFromLine className="h-4 w-4 text-gray-500" />
            ) : (
              <ArrowLeftFromLine className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 pt-6">
          <ul className="space-y-2 px-3">
            {navigationItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActivePage(item.id)}
                    className={cn(
                      "flex items-center w-full p-2.5 rounded-lg transition-all duration-200",
                      isActive 
                        ? `bg-gradient-to-r ${item.color} text-white font-medium` 
                        : "hover:bg-gray-100 text-gray-600"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-6 w-6",
                      isActive ? "text-white" : `text-gray-500 group-hover:text-${item.color.split("-")[1]}-500`
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
        </nav>

        {/* Bottom Area */}
        <div className="mt-auto border-t p-4">
          <button
            className="flex items-center w-full p-2.5 rounded-lg transition-all duration-200 hover:bg-gray-100 text-gray-600"
          >
            <div className="flex items-center justify-center h-6 w-6 text-gray-500">
              <Settings />
            </div>
            {!sidebarCollapsed && (
              <span className="ml-3">Settings</span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-full">
          {activeComponent}
        </div>
      </div>
    </div>
  )
}

export default App;