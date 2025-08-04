import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  Search,
  SortAsc,
  SortDesc,
  ChevronDown,
  Filter,
  X,
  ArrowUpDown,
  Calendar,
  DollarSign,
  Tag,
  Info,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Receipt
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
  const [viewMode, setViewMode] = useState('table');
  const [dateRange, setDateRange] = useState('all');
  
  const transactionTypes = ['All', 'Investment', 'Withdrawal', 'Income', 'Expense'];
  
  // Define type colors and icons
  const typeConfig = {
    Investment: {
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      badgeColor: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800',
      icon: <ArrowUpRight className="h-3.5 w-3.5" />
    },
    Withdrawal: {
      color: 'bg-rose-100 text-rose-700 border-rose-200',
      badgeColor: 'bg-rose-100 hover:bg-rose-200 text-rose-800',
      icon: <ArrowDownRight className="h-3.5 w-3.5" />
    },
    Income: {
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      badgeColor: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
      icon: <TrendingUp className="h-3.5 w-3.5" />
    },
    Expense: {
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      badgeColor: 'bg-amber-100 hover:bg-amber-200 text-amber-800',
      icon: <TrendingDown className="h-3.5 w-3.5" />
    }
  };
  
  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/transactions/get-all-transactions`);
        
        // Process and format dates
        const formattedTransactions = response.data.map(transaction => ({
          ...transaction,
          date_formatted: format(parseISO(transaction.date), 'MMM dd, yyyy'),
          created_at_formatted: format(parseISO(transaction.created_at), 'MMM dd, yyyy HH:mm'),
          amount_formatted: parseFloat(transaction.amount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
          })
        }));
        
        setTransactions(formattedTransactions);
        setFilteredTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...transactions];
    
    // Apply type filter
    if (activeFilter !== 'All') {
      result = result.filter(transaction => transaction.type === activeFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(transaction => 
        transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.amount_formatted.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case 'last7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'last30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'last90days':
          startDate.setDate(now.getDate() - 90);
          break;
        case 'thisYear':
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          break;
      }
      
      if (dateRange !== 'all') {
        result = result.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= startDate && transactionDate <= now;
        });
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle date sorting
      if (sortConfig.key === 'date' || sortConfig.key === 'created_at') {
        return sortConfig.direction === 'ascending' 
          ? new Date(aValue) - new Date(bValue) 
          : new Date(bValue) - new Date(aValue);
      }
      
      // Handle amount sorting
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'ascending' 
          ? parseFloat(aValue) - parseFloat(bValue) 
          : parseFloat(bValue) - parseFloat(aValue);
      }
      
      // Default string sorting
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredTransactions(result);
  }, [transactions, searchQuery, activeFilter, sortConfig, dateRange]);
  
  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    hover: { 
      y: -2,
      boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08)",
      transition: { type: 'spring', stiffness: 500, damping: 20 }
    }
  };
  
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };
  
  // Get transaction summary
  const getTransactionSummary = () => {
    const summary = {
      total: 0,
      investment: 0,
      withdrawal: 0,
      income: 0,
      expense: 0,
      count: filteredTransactions.length
    };
    
    filteredTransactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      
      if (transaction.type === 'Investment') {
        summary.investment += amount;
      } else if (transaction.type === 'Withdrawal') {
        summary.withdrawal += amount;
      } else if (transaction.type === 'Income') {
        summary.income += amount;
      } else if (transaction.type === 'Expense') {
        summary.expense += amount;
      }
      
      summary.total += amount;
    });
    
    return summary;
  };
  
  const summary = getTransactionSummary();
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
        <p className="text-gray-500">Track and review your financial activities</p>
      </motion.div>
      
      {/* Summary Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={itemVariants} className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-indigo-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Total Activity</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {summary.total.toLocaleString('en-US', { 
                  style: 'currency', 
                  currency: 'USD',
                  maximumFractionDigits: 0
                })}
              </h3>
            </div>
            <div className="p-2 bg-indigo-100 rounded-full">
              <Receipt className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{summary.count} transactions</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="rounded-lg bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Investments</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {summary.investment.toLocaleString('en-US', { 
                  style: 'currency', 
                  currency: 'USD',
                  maximumFractionDigits: 0
                })}
              </h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full">
              <ArrowUpRight className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Capital allocations</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="rounded-lg bg-gradient-to-br from-rose-50 to-red-100 border border-rose-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-rose-600 font-medium">Withdrawals</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {summary.withdrawal.toLocaleString('en-US', { 
                  style: 'currency', 
                  currency: 'USD',
                  maximumFractionDigits: 0
                })}
              </h3>
            </div>
            <div className="p-2 bg-rose-100 rounded-full">
              <ArrowDownRight className="h-5 w-5 text-rose-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Capital retrievals</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="rounded-lg bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-amber-600 font-medium">Net Flow</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {(summary.investment + summary.income - summary.withdrawal - summary.expense).toLocaleString('en-US', { 
                  style: 'currency', 
                  currency: 'USD',
                  maximumFractionDigits: 0
                })}
              </h3>
            </div>
            <div className="p-2 bg-amber-100 rounded-full">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total cash flow</p>
        </motion.div>
      </motion.div>
      
      {/* View mode selector */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        className="mb-6"
      >
        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>Table View</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Card View</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>
      
      {/* Filters Section */}
      <motion.div 
        className="mb-8 space-y-4"
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
          </div>
          
          {/* Type Filter */}
          <Select
            value={activeFilter}
            onValueChange={setActiveFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {transactionTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type === 'All' ? 'All Types' : (
                    <div className="flex items-center gap-2">
                      {type !== 'All' && typeConfig[type].icon}
                      <span>{type}</span>
                    </div>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Date Filter */}
          <Select
            value={dateRange}
            onValueChange={setDateRange}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Date range" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Sort Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-[180px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Sort by</span>
                </div>
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Sort options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSort('date')} className="flex justify-between">
                Date
                {sortConfig.key === 'date' && (
                  sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('amount')} className="flex justify-between">
                Amount
                {sortConfig.key === 'amount' && (
                  sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('type')} className="flex justify-between">
                Type
                {sortConfig.key === 'type' && (
                  sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Active filters display */}
        <div className="flex flex-wrap gap-2">
          {activeFilter !== 'All' && (
            <Badge 
              variant="secondary" 
              className={`flex items-center gap-1 ${typeConfig[activeFilter]?.badgeColor || ''}`}
            >
              {typeConfig[activeFilter]?.icon}
              <span>{activeFilter}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setActiveFilter('All')}
              />
            </Badge>
          )}
          {dateRange !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                {dateRange === 'last7days' ? 'Last 7 Days' :
                 dateRange === 'last30days' ? 'Last 30 Days' :
                 dateRange === 'last90days' ? 'Last 90 Days' : 'This Year'}
              </span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setDateRange('all')}
              />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              <span>{searchQuery}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearchQuery('')}
              />
            </Badge>
          )}
        </div>
      </motion.div>
      
      {/* Results summary */}
      <motion.div 
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <p className="text-sm text-gray-500">
          {loading ? 'Loading transactions...' : `Showing ${filteredTransactions.length} of ${transactions.length} transactions`}
        </p>
      </motion.div>
      
      {/* Transactions List */}
      <Tabs value={viewMode} className="w-full">
        <TabsContent value="table" className="mt-0 p-0">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors w-[180px]"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      {sortConfig.key === 'date' && (
                        sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {sortConfig.key === 'type' && (
                        sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-1 justify-end">
                      Amount
                      {sortConfig.key === 'amount' && (
                        sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-4">
                        <Receipt className="h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-gray-500 text-sm">No transactions found</p>
                        {(searchQuery || activeFilter !== 'All' || dateRange !== 'all') && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => {
                              setSearchQuery('');
                              setActiveFilter('All');
                              setDateRange('all');
                            }}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      className="border-b hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{transaction.date_formatted}</span>
                          <span className="text-xs text-gray-500">
                            ID: {transaction.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`flex items-center gap-1 ${typeConfig[transaction.type]?.color}`}
                          variant="outline"
                        >
                          {typeConfig[transaction.type]?.icon}
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="text-left cursor-default max-w-[400px]">
                              <p className="truncate">
                                {transaction.description || 'No description'}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{transaction.description || 'No description'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${
                          transaction.type === 'Withdrawal' || transaction.type === 'Expense' ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {transaction.amount_formatted}
                        </span>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="cards" className="mt-0 p-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <motion.div 
              className="text-center py-12 border rounded-lg"
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
            >
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 mb-2">No transactions found</p>
              <p className="text-sm text-gray-400">
                Try adjusting your filters
              </p>
              {(searchQuery || activeFilter !== 'All' || dateRange !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('All');
                    setDateRange('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTransactions.map(transaction => (
                <motion.div
                  key={transaction.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className="border rounded-lg overflow-hidden"
                >
                  <div className={`${typeConfig[transaction.type]?.color} py-3 px-4 flex justify-between items-center`}>
                    <div className="flex items-center gap-2">
                      {typeConfig[transaction.type]?.icon}
                      <span className="font-medium">{transaction.type}</span>
                    </div>
                    <span className={`text-lg font-semibold ${
                      transaction.type === 'Withdrawal' || transaction.type === 'Expense' ? 'text-rose-700' : 'text-emerald-700'
                    }`}>
                      {transaction.amount_formatted}
                    </span>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="mb-3">
                      <h3 className="font-medium line-clamp-1">{transaction.description || 'No description'}</h3>
                      <p className="text-sm text-gray-500">Holding ID: {transaction.holding_id}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {transaction.date_formatted}
                      </span>
                      <span className="text-xs text-gray-400">ID: {transaction.id}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}