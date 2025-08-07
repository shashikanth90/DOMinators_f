import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import ReactApexChart from 'react-apexcharts';
import { useTheme } from "../context/ThemeContext";
import {
  DollarSign,
  BarChart2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Clock,
  Package,
  PieChart,
  Activity,
  Calendar,
  ChevronRight,
  BadgeDollarSign,
  LayoutDashboard,
  BarChart,
  ChevronUp,
  ChevronDown,
  Info,
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const { theme } = useTheme();
  const [portfolioData, setPortfolioData] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1M');
  const [performanceTab, setPerformanceTab] = useState('value');
  const [settlementsBalance, setSettlementsBalance] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch portfolio summary
        const portfolioResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/portfolio/summary`);
        setPortfolioData(portfolioResponse.data);

        // Fetch net worth history data
        const networthResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/networth/get-networth`);
        
        if (networthResponse.data && networthResponse.data.length > 0) {
          // Process the networth data and update the portfolio data
          const historyData = networthResponse.data.map(item => ({
            date: format(new Date(item.date), 'yyyy-MM-dd'),
            value: parseFloat(item.total)
          })).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

          setPortfolioData(prevData => ({
            ...prevData,
            history: historyData,
            // Calculate changes based on actual data
            daily_change: calculatePercentageChange(historyData, 1),
            weekly_change: calculatePercentageChange(historyData, 7),
            monthly_change: calculatePercentageChange(historyData, 30),
            yearly_change: calculatePercentageChange(historyData, 365),
            total_value: historyData.length > 0 ? historyData[historyData.length - 1].value : 0
          }));
        }
        
        // Fetch holdings
        const holdingsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holdings`);
        
        // Process holdings data with calculated values
        const processedHoldings = holdingsResponse.data.map(holding => ({
          ...holding,
          total_value: parseFloat(holding.quantity) * parseFloat(holding.purchase_price),
          purchase_date_formatted: format(new Date(holding.purchase_date), 'MMM dd, yyyy')
        }));
        
        setHoldings(processedHoldings);
        
        // Fetch recent transactions
        const transactionsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/transactions/get-all-transactions`);
        
        // Process transactions data
        const processedTransactions = transactionsResponse.data.map(transaction => ({
          ...transaction,
          date_formatted: format(new Date(transaction.date), 'MMM dd, yyyy')
        }));
        
        setTransactions(processedTransactions);

        // settlements balance
        const settlementsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/settlements/viewBalance`);
        if (settlementsResponse.data && settlementsResponse.data.length > 0) {
          setSettlementsBalance(parseFloat(settlementsResponse.data[0].amount));
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use fallback mock data for demo purposes
        setPortfolioData({
          total_value: 124650.75,
          total_invested: 110000,
          profit_loss: 14650.75,
          profit_loss_percentage: 13.32,
          holdings_count: 12,
          transactions_count: 24,
          daily_change: 1.2,
          weekly_change: 2.8,
          monthly_change: -0.5,
          yearly_change: 8.4,
          history: generateMockHistoryData(),
          asset_allocation: [
            { name: 'Stocks', value: 65 },
            { name: 'Bonds', value: 15 },
            { name: 'Crypto', value: 12 },
            { name: 'Cash', value: 8 }
          ]
        });
        
        // Generate mock holdings if API failed
        if (holdings.length === 0) {
          setHoldings(generateMockHoldings());
        }
        
        // Generate mock transactions if API failed
        if (transactions.length === 0) {
          setTransactions(generateMockTransactions());
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchDashboardData();
  }, [refreshing]);

  // Refresh data handler
  const handleRefresh = () => {
    setRefreshing(true);
  };

  // Helper function to calculate percentage change over periods
  const calculatePercentageChange = (data, days) => {
    if (!data || data.length < 2) return 0;
    
    const latestValue = data[data.length - 1].value;
    
    // Find the value 'days' days ago, or the earliest available
    let compareIndex = 0;
    const compareDate = subDays(new Date(), days);
    
    for (let i = 0; i < data.length; i++) {
      if (new Date(data[i].date) >= compareDate) {
        compareIndex = i;
        break;
      }
    }
    
    const previousValue = data[compareIndex].value;
    if (previousValue === 0) return 0;
    
    return ((latestValue - previousValue) / previousValue * 100).toFixed(2);
  };
  
  // Generate mock data for demo purposes
  const generateMockHistoryData = () => {
    const today = new Date();
    const data = [];
    
    for (let i = 90; i >= 0; i--) {
      const date = subDays(today, i);
      const formattedDate = format(date, 'yyyy-MM-dd');
      const value = 100000 + Math.random() * 30000 + (90 - i) * 200;
      
      data.push({
        date: formattedDate,
        value: value.toFixed(2)
      });
    }
    
    return data;
  };
  
  const generateMockHoldings = () => {
    return [
      { id: 1, name: 'Apple Inc.', purchase_price: '196.50', quantity: '10', purchase_date: '2024-12-15', total_value: 1965, purchase_date_formatted: 'Dec 15, 2024' },
      { id: 2, name: 'Microsoft', purchase_price: '320.75', quantity: '5', purchase_date: '2024-11-22', total_value: 1603.75, purchase_date_formatted: 'Nov 22, 2024' },
      { id: 3, name: 'Tesla', purchase_price: '225.40', quantity: '8', purchase_date: '2025-01-05', total_value: 1803.2, purchase_date_formatted: 'Jan 05, 2025' },
      { id: 4, name: 'Amazon', purchase_price: '178.92', quantity: '12', purchase_date: '2024-10-18', total_value: 2147.04, purchase_date_formatted: 'Oct 18, 2024' },
      { id: 5, name: 'Google', purchase_price: '142.35', quantity: '15', purchase_date: '2025-02-10', total_value: 2135.25, purchase_date_formatted: 'Feb 10, 2025' }
    ];
  };
  
  const generateMockTransactions = () => {
    return [
      { id: 1, type: 'Investment', holding_id: 1, amount: '1965.00', date: '2024-12-15', date_formatted: 'Dec 15, 2024', description: 'Purchased 10 units of Apple Inc.' },
      { id: 2, type: 'Investment', holding_id: 2, amount: '1603.75', date: '2024-11-22', date_formatted: 'Nov 22, 2024', description: 'Purchased 5 units of Microsoft' },
      { id: 3, type: 'Withdrawal', holding_id: 3, amount: '650.20', date: '2025-01-15', date_formatted: 'Jan 15, 2025', description: 'Partial withdrawal from Tesla holdings' },
      { id: 4, type: 'Income', holding_id: 2, amount: '25.00', date: '2025-01-10', date_formatted: 'Jan 10, 2025', description: 'Dividend payment from Microsoft' },
      { id: 5, type: 'Investment', holding_id: 4, amount: '2147.04', date: '2024-10-18', date_formatted: 'Oct 18, 2024', description: 'Purchased 12 units of Amazon' }
    ];
  };
  
  // Filter historical data based on selected timeframe
  const getTimeframeData = () => {
    if (!portfolioData?.history) return [];
    
    const today = new Date();
    let startDate;
    
    switch (timeframe) {
      case '1W':
        startDate = subDays(today, 7);
        break;
      case '1M':
        startDate = subDays(today, 30);
        break;
      case '3M':
        startDate = subDays(today, 90);
        break;
      case '1Y':
        startDate = subDays(today, 365);
        break;
      case 'ALL':
      default:
        return portfolioData.history;
    }
    
    return portfolioData.history.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  };
  
  // Calculate portfolio metrics
  const getPortfolioMetrics = () => {
    if (!holdings.length) return { totalValue: 0, totalHoldings: 0 };
    
    const totalValue = holdings.reduce((sum, holding) => sum + parseFloat(holding.total_value), 0);
    
    return {
      totalValue,
      totalHoldings: holdings.length
    };
  };
  
  const metrics = getPortfolioMetrics();
  
  // Sort holdings by value for top holdings section
  const topHoldings = [...holdings].sort((a, b) => b.total_value - a.total_value).slice(0, 5);
  
  // Filter recent transactions
  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  
  // Get historical data for charts
  const historicalData = getTimeframeData();
  
  // Calculate performance metrics
  const getPerformanceChange = (change) => {
    const isPositive = parseFloat(change) >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        <span>{isPositive ? '+' : ''}{change}%</span>
      </div>
    );
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  // Chart options
  const portfolioChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      background: 'transparent',
      fontFamily: 'Poppins, sans-serif',
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      lineCap: 'round',
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: theme === 'dark' ? '#6366f1' : '#3b82f6',
            opacity: 0.8
          },
          {
            offset: 100,
            color: theme === 'dark' ? '#4f46e5' : '#818cf8',
            opacity: 0.2
          }
        ]
      }
    },
    grid: {
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    },
    xaxis: {
      type: 'datetime',
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: theme === 'dark' ? 'rgba(255,255,255,0.6)' : '#64748b',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => { 
          return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        },
        style: {
          colors: theme === 'dark' ? 'rgba(255,255,255,0.6)' : '#64748b',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400
        }
      }
    },
    tooltip: {
      x: {
        format: 'MMM dd, yyyy'
      },
      y: {
        formatter: (value) => { 
          return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      },
      theme: theme === 'dark' ? 'dark' : 'light',
      style: {
        fontFamily: 'Poppins, sans-serif',
      }
    },
    colors: [theme === 'dark' ? '#6366f1' : '#3b82f6'],
    markers: {
      size: 0,
      strokeWidth: 2,
      strokeOpacity: 0.9,
      strokeColors: theme === 'dark' ? ['#6366f1'] : ['#3b82f6'],
      fillOpacity: 1,
      discrete: [],
      shape: "circle",
      radius: 4,
      showNullDataPoints: true,
      hover: {
        size: 8,
      }
    },
  };
  
  const portfolioChartSeries = [
    {
      name: "Portfolio Value",
      data: historicalData.map(item => ({
        x: new Date(item.date).getTime(),
        y: parseFloat(item.value)
      }))
    }
  ];
  
  // Asset allocation chart options
  const allocationChartOptions = {
    chart: {
      type: 'donut',
      height: 320,
      fontFamily: 'Poppins, sans-serif',
      background: 'transparent',
    },
    colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981'],
    labels: portfolioData?.asset_allocation?.map(item => item.name) || [],
    legend: {
      position: 'bottom',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: 500,
      labels: {
        colors: theme === 'dark' ? 'rgba(255,255,255,0.8)' : undefined
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => '100%',
              color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : undefined
            },
            value: {
              color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : undefined
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}%`
      },
      theme: theme === 'dark' ? 'dark' : 'light',
    },
    stroke: {
      width: 2
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 280
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    ]
  };
  
  const allocationChartSeries = portfolioData?.asset_allocation?.map(item => item.value) || [];
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header Section with Premium Design */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        className="mb-6 flex justify-between items-start"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              Financial Dashboard
            </span>
            <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 animate-pulse"></div>
          </h1>
          <p className="text-muted-foreground font-light">Your investment summary and performance overview</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1.5 h-9 border-dashed"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          {/* <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-1.5 h-9 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </Button> */}
        </div>
      </motion.div>
      
      {/* Premium Summary Cards with Enhanced Design */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6"
      >
        {/* Total Portfolio Value Card */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg dark:shadow-primary/5 bg-card relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <DollarSign className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                Total Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-9 w-44 mt-1" />
              ) : (
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-3xl font-bold">
                    ${portfolioData?.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {getPerformanceChange(portfolioData?.daily_change)}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last updated: Today, {format(new Date(), 'h:mm a')}</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Profit/Loss Card */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg dark:shadow-primary/5 bg-card relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  {portfolioData?.profit_loss >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                  )}
                </div>
                Total Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-9 w-44 mt-1" />
              ) : (
                <div className="flex items-center gap-3 mt-1">
                  <div className={`text-3xl font-bold ${portfolioData?.profit_loss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {portfolioData?.profit_loss >= 0 ? '+' : ''}
                    ${Math.abs(portfolioData?.profit_loss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center gap-1 ${portfolioData?.profit_loss_percentage >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {portfolioData?.profit_loss_percentage >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {portfolioData?.profit_loss_percentage >= 0 ? '+' : ''}
                      {portfolioData?.profit_loss_percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-28" />
              ) : (
                <div>Since initial investment</div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Cash Balance Card */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg dark:shadow-primary/5 bg-card relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BadgeDollarSign className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                Available Cash
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-9 w-44 mt-1" />
              ) : (
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-3xl font-bold">
                    ${settlementsBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Ready for investment</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Growth Analytics Card */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg dark:shadow-primary/5 bg-card relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <BarChart2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                Growth Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-9 w-full mt-1" />
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="text-center p-1.5 bg-muted/50 dark:bg-muted/20 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">Weekly</div>
                    <div className={`text-sm font-semibold flex items-center justify-center ${
                      portfolioData?.weekly_change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {portfolioData?.weekly_change >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {portfolioData?.weekly_change}%
                    </div>
                  </div>
                  <div className="text-center p-1.5 bg-muted/50 dark:bg-muted/20 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">Monthly</div>
                    <div className={`text-sm font-semibold flex items-center justify-center ${
                      portfolioData?.monthly_change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {portfolioData?.monthly_change >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {portfolioData?.monthly_change}%
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Performance overview</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Premium Performance Chart with Enhanced Features */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible" 
        className="mb-6"
      >
        <Card className="overflow-hidden border-0 shadow-md dark:shadow-lg dark:shadow-primary/5">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <BarChart2 className="h-4 w-4 text-white" />
                  </div>
                  Portfolio Performance
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Track your portfolio's growth trajectory
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-muted/70 dark:bg-muted/20 rounded-lg p-1">
                  {['1W', '1M', '3M', '1Y', 'ALL'].map((period) => (
                    <Button
                      key={period}
                      variant={timeframe === period ? "default" : "ghost"}
                      size="sm"
                      className={`text-xs font-medium rounded-md h-7 ${
                        timeframe === period ? 'bg-card shadow-sm dark:text-foreground' : ''
                      }`}
                      onClick={() => setTimeframe(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="h-[350px] w-full flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                  <span className="text-sm text-muted-foreground">Loading chart data...</span>
                </div>
              </div>
            ) : (
              <div className="h-[350px]">
                <ReactApexChart
                  options={portfolioChartOptions}
                  series={portfolioChartSeries}
                  type="area"
                  height={350}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between text-sm border-t border-border/50 pt-4">
            <div className="flex flex-wrap gap-6">
              <div>
                <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Starting Value</span>
                <span className="font-semibold text-lg">
                  ${historicalData.length > 0 ? parseFloat(historicalData[0].value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Current Value</span>
                <span className="font-semibold text-lg">
                  ${historicalData.length > 0 ? parseFloat(historicalData[historicalData.length-1].value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Total Change</span>
                {(() => {
                  if (historicalData.length < 2) return <span className="font-semibold text-lg">0.00%</span>;
                  
                  const start = parseFloat(historicalData[0].value);
                  const end = parseFloat(historicalData[historicalData.length-1].value);
                  const change = ((end - start) / start) * 100;
                  const isPositive = change >= 0;
                  
                  return (
                    <span className={`font-semibold text-lg flex items-center gap-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                      {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  );
                })()}
              </div>
            </div>
            <div>
              <Button variant="outline" size="sm" className="h-8">
                <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                <span>Detailed Analysis</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Two Column Layout with Premium Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Asset Allocation with Premium Design */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="col-span-1"
        >
          <Card className="h-full border-0 shadow-md dark:shadow-lg dark:shadow-primary/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 to-indigo-600"></div>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center mb-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <PieChart className="h-3.5 w-3.5 text-white" />
                  </div>
                  Asset Allocation
                </CardTitle>
                <Badge variant="outline" className="font-normal border-0 bg-muted/80 dark:bg-muted/30">
                  <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                  Premium
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground">
                Distribution of your investment portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? (
                <div className="h-[320px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
                    <span className="text-sm text-muted-foreground">Loading allocation data...</span>
                  </div>
                </div>
              ) : (
                <div className="h-[320px]">
                  <ReactApexChart
                    options={allocationChartOptions}
                    series={allocationChartSeries}
                    type="donut"
                    height={320}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-3">
              <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                <span>View Detailed Asset Breakdown</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Top Holdings & Recent Transactions with Premium Design */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="col-span-1 lg:col-span-2"
        >
          <Card className="h-full border-0 shadow-md dark:shadow-lg dark:shadow-primary/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>
            <CardHeader>
              <Tabs defaultValue="holdings" className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                      <Briefcase className="h-3.5 w-3.5 text-white" />
                    </div>
                    Portfolio Breakdown
                  </CardTitle>
                  <TabsList className="grid grid-cols-2 w-[240px] h-8 bg-muted/70 dark:bg-muted/20 rounded-lg p-0.5">
                    <TabsTrigger value="holdings" className="text-xs rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm h-7">
                      <Package className="h-3.5 w-3.5 mr-1.5" />
                      Top Holdings
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="text-xs rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm h-7">
                      <Activity className="h-3.5 w-3.5 mr-1.5" />
                      Recent Activity
                    </TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription className="text-muted-foreground">
                  Your top assets and latest transactions
                </CardDescription>
                
                <TabsContent value="holdings" className="mt-4 p-0 space-y-0">
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50 dark:bg-muted/20">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="h-9 text-xs font-medium">Asset</TableHead>
                          <TableHead className="h-9 text-xs font-medium text-right">Value</TableHead>
                          <TableHead className="h-9 text-xs font-medium text-right">Quantity</TableHead>
                          <TableHead className="h-9 text-xs font-medium text-right">Purchase Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array(5).fill(0).map((_, i) => (
                            <TableRow key={`skeleton-${i}`} className="hover:bg-muted/30">
                              <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                            </TableRow>
                          ))
                        ) : topHoldings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                              <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                              <p className="font-medium mb-1">No holdings found</p>
                              <p className="text-sm">Add assets to your portfolio to track them here</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          topHoldings.map((holding, index) => (
                            <motion.tr
                              key={holding.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-b border-border/50 hover:bg-muted/30"
                            >
                              <TableCell className="font-medium">{holding.name}</TableCell>
                              <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-500">
                                ${parseFloat(holding.total_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell className="text-right">{parseFloat(holding.quantity).toLocaleString()}</TableCell>
                              <TableCell className="text-right text-muted-foreground">{holding.purchase_date_formatted}</TableCell>
                            </motion.tr>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    {!loading && topHoldings.length > 0 && (
                      <div className="flex justify-center p-3 border-t border-border/50">
                        <Button variant="ghost" size="sm" className="text-xs h-8">
                          View All Holdings
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="transactions" className="mt-4 p-0 space-y-0">
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50 dark:bg-muted/20">
                        <TableRow className="hover:bg-transparent border-none">
                          <TableHead className="h-9 text-xs font-medium">Type</TableHead>
                          <TableHead className="h-9 text-xs font-medium">Description</TableHead>
                          <TableHead className="h-9 text-xs font-medium">Date</TableHead>
                          <TableHead className="h-9 text-xs font-medium text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array(5).fill(0).map((_, i) => (
                            <TableRow key={`skeleton-${i}`} className="hover:bg-muted/30">
                              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            </TableRow>
                          ))
                        ) : recentTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                              <Activity className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                              <p className="font-medium mb-1">No transactions found</p>
                              <p className="text-sm">Your recent activity will appear here</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentTransactions.map((transaction, index) => (
                            <motion.tr
                              key={transaction.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-b border-border/50 hover:bg-muted/30"
                            >
                              <TableCell>
                                <Badge variant="outline" className={`
                                  font-normal text-xs
                                  ${transaction.type === 'Investment' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/30' : ''}
                                  ${transaction.type === 'Withdrawal' ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/30' : ''}
                                  ${transaction.type === 'Income' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30' : ''}
                                  ${transaction.type === 'Expense' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30' : ''}
                                `}>
                                  {transaction.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[180px] truncate">
                                {transaction.description || 'No description'}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">{transaction.date_formatted}</TableCell>
                              <TableCell className="text-right">
                                <span className={`font-semibold ${
                                  transaction.type === 'Withdrawal' || transaction.type === 'Expense' ? 'text-rose-600 dark:text-rose-500' : 'text-emerald-600 dark:text-emerald-500'
                                }`}>
                                  ${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    {!loading && recentTransactions.length > 0 && (
                      <div className="flex justify-center p-3 border-t border-border/50">
                        <Button variant="ghost" size="sm" className="text-xs h-8">
                          View All Transactions
                          <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
      
      {/* Portfolio Insights with Premium Design */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <Card className="border-0 shadow-md dark:shadow-lg dark:shadow-primary/5 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYTVhNWE1IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIGQ9Ik0zMDAgNjAwTDMwMCAwIi8+CiAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYTVhNWE1IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIGQ9Ik02MDAgMzAwTDAgMzAwIi8+Cjwvc3ZnPg==')] bg-center opacity-50"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <BadgeDollarSign className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold">Portfolio Insights</CardTitle>
            </div>
            <CardDescription>
              Key statistics and financial metrics about your investments
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/70 dark:bg-gray-900/50 shadow-sm rounded-xl p-4 border border-border/30 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground font-medium">Total Invested</p>
                {loading ? (
                  <Skeleton className="h-8 w-28 mt-2" />
                ) : (
                  <div className="flex items-center mt-2">
                    <p className="text-xl font-semibold">
                      ${portfolioData?.total_invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-white/70 dark:bg-gray-900/50 shadow-sm rounded-xl p-4 border border-border/30 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground font-medium">Weekly Change</p>
                {loading ? (
                  <Skeleton className="h-8 w-28 mt-2" />
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <p className={`text-xl font-semibold ${portfolioData?.weekly_change >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                      {portfolioData?.weekly_change >= 0 ? '+' : ''}
                      {portfolioData?.weekly_change}%
                    </p>
                    {portfolioData?.weekly_change >= 0 ? (
                      <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-rose-600 dark:text-rose-500" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-white/70 dark:bg-gray-900/50 shadow-sm rounded-xl p-4 border border-border/30 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground font-medium">Monthly Change</p>
                {loading ? (
                  <Skeleton className="h-8 w-28 mt-2" />
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <p className={`text-xl font-semibold ${portfolioData?.monthly_change >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                      {portfolioData?.monthly_change >= 0 ? '+' : ''}
                      {portfolioData?.monthly_change}%
                    </p>
                    {portfolioData?.monthly_change >= 0 ? (
                      <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-rose-600 dark:text-rose-500" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-white/70 dark:bg-gray-900/50 shadow-sm rounded-xl p-4 border border-border/30 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground font-medium">Yearly Change</p>
                {loading ? (
                  <Skeleton className="h-8 w-28 mt-2" />
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <p className={`text-xl font-semibold ${portfolioData?.yearly_change >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                      {portfolioData?.yearly_change >= 0 ? '+' : ''}
                      {portfolioData?.yearly_change}%
                    </p>
                    {portfolioData?.yearly_change >= 0 ? (
                      <ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-rose-600 dark:text-rose-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/30 pt-3 relative z-10">
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
            >
              Generate Detailed Analytics Report
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}