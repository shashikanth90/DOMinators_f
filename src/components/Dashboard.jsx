import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';
import ReactApexChart from 'react-apexcharts';
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
  BarChart
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
  const [portfolioData, setPortfolioData] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1M');
  const [performanceTab, setPerformanceTab] = useState('value');
  const [settlementsBalance, setSettlementsBalance] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch portfolio summary
        const portfolioResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/portfolio/summary`);
        setPortfolioData(portfolioResponse.data);
        
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
        console.log('Settlements Response:', settlementsResponse.data);
        if (settlementsResponse.data && settlementsResponse.data.length > 0) {
          setSettlementsBalance(parseFloat(settlementsResponse.data[0].amount));
          console.log('Settlements Balance:', settlementsResponse.data[0].amount);
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
      }
    };
    
    fetchDashboardData();
  }, []);
  
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
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
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
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
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
            color: '#3b82f6',
            opacity: 0.8
          },
          {
            offset: 100,
            color: '#818cf8',
            opacity: 0.2
          }
        ]
      }
    },
    grid: {
      borderColor: '#e0e0e0',
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
          colors: '#64748b',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => { 
          return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        },
        style: {
          colors: '#64748b',
          fontFamily: 'Inter, sans-serif'
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
      theme: 'light'
    },
    colors: ['#3b82f6']
  };
  
  const portfolioChartSeries = [
    {
      name: 'Portfolio Value',
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
      height: 320
    },
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'],
    labels: portfolioData?.asset_allocation?.map(item => item.name) || [],
    legend: {
      position: 'bottom',
      fontFamily: 'Inter, sans-serif'
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
              formatter: () => '100%'
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
      }
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
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
        </div>
        <p className="text-gray-500">Your investment summary and performance overview</p>
      </motion.div>
      
      {/* Summary Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {/* Total Portfolio Value Card */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="overflow-hidden border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                Total Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">
                    ${portfolioData?.total_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {getPerformanceChange(portfolioData?.daily_change)}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 text-xs text-gray-500">
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
          <Card className={`overflow-hidden border-t-4 ${portfolioData?.profit_loss >= 0 ? 'border-t-emerald-500' : 'border-t-rose-500'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                {portfolioData?.profit_loss >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                )}
                Total Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <div className={`text-3xl font-bold ${portfolioData?.profit_loss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {portfolioData?.profit_loss >= 0 ? '+' : ''}
                    ${Math.abs(portfolioData?.profit_loss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center gap-1 ${portfolioData?.profit_loss_percentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {portfolioData?.profit_loss_percentage >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>
                      {portfolioData?.profit_loss_percentage >= 0 ? '+' : ''}
                      {portfolioData?.profit_loss_percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 text-xs text-gray-500">
              {loading ? (
                <Skeleton className="h-4 w-28" />
              ) : (
                <div>Since initial investment</div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Holdings Count Card */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="overflow-hidden border-t-4 border-t-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-500" />
                Total Holdings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">{portfolioData?.holdings_count}</div>
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    Assets
                  </Badge>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 text-xs text-gray-500">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <div className="flex items-center gap-1">
                  <span>Diversification score:</span>
                  <span className="font-medium text-amber-600">Good</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
        
        {/* Transactions Card */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="overflow-hidden border-t-4 border-t-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">{portfolioData?.transactions_count}</div>
                  <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                    Transactions
                  </Badge>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 text-xs text-gray-500">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last 30 days</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>

        {/* Settlements Balance Card */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="overflow-hidden border-t-4 border-t-teal-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <BadgeDollarSign className="h-4 w-4 text-teal-500" />
                Cash Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-36" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">
                    ${settlementsBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 text-xs text-gray-500">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Available for investment</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Performance Chart */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible" 
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                Portfolio Performance
              </CardTitle>
              <div className="flex bg-muted rounded-lg p-0.5">
                {['1W', '1M', '3M', '1Y', 'ALL'].map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "secondary" : "ghost"}
                    size="sm"
                    className="text-xs rounded-md h-7"
                    onClick={() => setTimeframe(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
            <CardDescription>
              Performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[350px] w-full flex items-center justify-center bg-muted/30 rounded-lg">
                <Skeleton className="h-full w-full" />
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
          <CardFooter className="flex justify-between text-sm text-muted-foreground border-t pt-4">
            <div className="flex gap-4">
              <div>
                <span className="block text-gray-500">Starting:</span>
                <span className="font-medium">
                  ${historicalData[0]?.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500">Current:</span>
                <span className="font-medium">
                  ${historicalData[historicalData.length-1]?.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500">Change:</span>
                {(() => {
                  if (historicalData.length < 2) return <span className="font-medium">0.00%</span>;
                  
                  const start = parseFloat(historicalData[0].value);
                  const end = parseFloat(historicalData[historicalData.length-1].value);
                  const change = ((end - start) / start) * 100;
                  const isPositive = change >= 0;
                  
                  return (
                    <span className={`font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  );
                })()}
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Asset Allocation */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                Asset Allocation
              </CardTitle>
              <CardDescription>
                Distribution of your investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[320px] flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-full" />
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
          </Card>
        </motion.div>
        
        {/* Top Holdings & Recent Transactions */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="col-span-1 lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <Tabs defaultValue="holdings" className="w-full">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">
                    Portfolio Breakdown
                  </CardTitle>
                  <TabsList className="grid grid-cols-2 w-[300px]">
                    <TabsTrigger value="holdings" className="text-xs">
                      <Package className="h-4 w-4 mr-2" />
                      Top Holdings
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="text-xs">
                      <Activity className="h-4 w-4 mr-2" />
                      Recent Activity
                    </TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription className="mt-1">
                  Your top assets and recent transactions
                </CardDescription>
                
                <TabsContent value="holdings" className="mt-4 p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Purchase Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <TableRow key={`skeleton-${i}`}>
                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : topHoldings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p>No holdings found</p>
                            <p className="text-sm">Add some assets to your portfolio</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        topHoldings.map((holding, index) => (
                          <motion.tr
                            key={holding.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b"
                          >
                            <TableCell className="font-medium">{holding.name}</TableCell>
                            <TableCell className="text-right font-semibold text-emerald-600">
                              ${parseFloat(holding.total_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right">{parseFloat(holding.quantity).toLocaleString()}</TableCell>
                            <TableCell className="text-right">{holding.purchase_date_formatted}</TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {!loading && topHoldings.length > 0 && (
                    <div className="flex justify-end p-4">
                      <Button variant="ghost" size="sm" className="text-xs">
                        View All Holdings
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="transactions" className="mt-4 p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <TableRow key={`skeleton-${i}`}>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : recentTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            <Activity className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p>No transactions found</p>
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
                            className="border-b"
                          >
                            <TableCell>
                              <Badge variant="outline" className={`
                                ${transaction.type === 'Investment' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}
                                ${transaction.type === 'Withdrawal' ? 'bg-rose-100 text-rose-700 border-rose-200' : ''}
                                ${transaction.type === 'Income' ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                                ${transaction.type === 'Expense' ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                              `}>
                                {transaction.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {transaction.description || 'No description'}
                            </TableCell>
                            <TableCell>{transaction.date_formatted}</TableCell>
                            <TableCell className="text-right">
                              <span className={`font-semibold ${
                                transaction.type === 'Withdrawal' || transaction.type === 'Expense' ? 'text-rose-600' : 'text-emerald-600'
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
                    <div className="flex justify-end p-4">
                      <Button variant="ghost" size="sm" className="text-xs">
                        View All Transactions
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
      
      {/* Portfolio Stats */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5 text-blue-500" />
              Portfolio Insights
            </CardTitle>
            <CardDescription>
              Key statistics about your investments
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Total Invested</p>
              {loading ? (
                <Skeleton className="h-7 w-28 mt-1" />
              ) : (
                <p className="text-xl font-bold mt-1">
                  ${portfolioData?.total_invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Weekly Change</p>
              {loading ? (
                <Skeleton className="h-7 w-28 mt-1" />
              ) : (
                <div className="flex items-center gap-1 mt-1">
                  <p className={`text-xl font-bold ${portfolioData?.weekly_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {portfolioData?.weekly_change >= 0 ? '+' : ''}
                    {portfolioData?.weekly_change}%
                  </p>
                  {portfolioData?.weekly_change >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-rose-600" />
                  )}
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Monthly Change</p>
              {loading ? (
                <Skeleton className="h-7 w-28 mt-1" />
              ) : (
                <div className="flex items-center gap-1 mt-1">
                  <p className={`text-xl font-bold ${portfolioData?.monthly_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {portfolioData?.monthly_change >= 0 ? '+' : ''}
                    {portfolioData?.monthly_change}%
                  </p>
                  {portfolioData?.monthly_change >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-rose-600" />
                  )}
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Yearly Change</p>
              {loading ? (
                <Skeleton className="h-7 w-28 mt-1" />
              ) : (
                <div className="flex items-center gap-1 mt-1">
                  <p className={`text-xl font-bold ${portfolioData?.yearly_change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {portfolioData?.yearly_change >= 0 ? '+' : ''}
                    {portfolioData?.yearly_change}%
                  </p>
                  {portfolioData?.yearly_change >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-rose-600" />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}