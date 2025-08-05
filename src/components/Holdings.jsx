import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { format } from 'date-fns';
import {
  Search,
  SortAsc,
  SortDesc,
  ChevronDown,
  Info,
  X,
  ArrowUpDown,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Package,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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

export default function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [filteredHoldings, setFilteredHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetDetails, setAssetDetails] = useState(null);
  const [assetDetailsLoading, setAssetDetailsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [assetPrices, setAssetPrices] = useState({});

    // Update the useEffect hook for fetching prices
  useEffect(() => {
    const fetchHoldings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holdings`);
        const data = response.data;
        
        // Calculate total value for each holding
        const holdingsWithValue = data.map(holding => ({
          ...holding,
          total_value: (parseFloat(holding.quantity) * parseFloat(holding.purchase_price)).toFixed(2),
          purchase_date_formatted: format(new Date(holding.purchase_date), 'MMM dd, yyyy')
        }));
        
        setHoldings(holdingsWithValue);
        setFilteredHoldings(holdingsWithValue);
        
        // Fetch all asset prices for the table view
        if (data.length > 0) {
          // Get unique asset IDs - make sure to use the same ID field you use in openAssetDetails
          const assetIds = [...new Set(data.map(holding => holding.id))]; // Changed from asset_id to id
          
          try {
            const pricesPromises = assetIds.map(assetId => 
              axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/assets/get/${assetId}`)
            );
            
            const priceResponses = await Promise.all(pricesPromises);
            const pricesMap = {};
            
            priceResponses.forEach(response => {
              if (response.data && response.data.id) {
                pricesMap[response.data.id] = parseFloat(response.data.price);
              }
            });
            
            setAssetPrices(pricesMap);
          } catch (priceError) {
            console.error('Error fetching asset prices:', priceError);
          }
        }
      } catch (error) {
        console.error('Error fetching holdings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHoldings();
  }, []);
  
  // Fetch holdings data
  useEffect(() => {
    const fetchHoldings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/holdings`);
        const data = response.data;
        
        // Calculate total value for each holding
        const holdingsWithValue = data.map(holding => ({
          ...holding,
          total_value: (parseFloat(holding.quantity) * parseFloat(holding.purchase_price)).toFixed(2),
          purchase_date_formatted: format(new Date(holding.purchase_date), 'MMM dd, yyyy')
        }));
        
        setHoldings(holdingsWithValue);
        setFilteredHoldings(holdingsWithValue);
      } catch (error) {
        console.error('Error fetching holdings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHoldings();
  }, []);
  
  // Filter and sort holdings
  useEffect(() => {
    let result = [...holdings];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(holding => 
        holding.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle numeric sorting
      if (sortConfig.key === 'purchase_price' || sortConfig.key === 'quantity' || sortConfig.key === 'total_value') {
        return sortConfig.direction === 'ascending' 
          ? parseFloat(aValue) - parseFloat(bValue) 
          : parseFloat(bValue) - parseFloat(aValue);
      }
      
      // Handle date sorting
      if (sortConfig.key === 'purchase_date') {
        return sortConfig.direction === 'ascending' 
          ? new Date(aValue) - new Date(bValue) 
          : new Date(bValue) - new Date(aValue);
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
    
    setFilteredHoldings(result);
  }, [holdings, searchQuery, sortConfig]);
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };
  
  // Open asset details modal
  const openAssetDetails = async (holding) => {
    setSelectedAsset(holding);
    setAssetDetailsLoading(true);
    setAssetDetails(null);
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/assets/get/${holding.id}`);
      setAssetDetails(response.data);
    } catch (error) {
      console.error('Error fetching asset details:', error);
    } finally {
      setAssetDetailsLoading(false);
    }
  };
  
  // Close asset details modal
  const closeAssetDetails = () => {
    setSelectedAsset(null);
    setAssetDetails(null);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };
  
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  // Chart options for asset comparison
  const getChartOptions = (holding, currentAsset) => {
    const purchasePrice = parseFloat(holding.purchase_price);
    const currentPrice = parseFloat(currentAsset.price);
    const priceDifference = currentPrice - purchasePrice;
    const percentChange = ((priceDifference / purchasePrice) * 100).toFixed(2);
    const isPositive = priceDifference >= 0;
    
    return {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 8,
          distributed: true
        },
      },
      dataLabels: {
        enabled: false
      },
      colors: [
        isPositive ? '#22c55e' : '#ef4444', 
        '#3b82f6'
      ],
      xaxis: {
        categories: ['Purchase Price', 'Current Price'],
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: '$ Price'
        },
        labels: {
          formatter: (val) => `$${val.toFixed(2)}`
        }
      },
      tooltip: {
        y: {
          formatter: (val) => `$${val.toFixed(2)}`
        }
      },
      title: {
        text: `Price Comparison (${isPositive ? '+' : ''}${percentChange}%)`,
        align: 'center',
        style: {
          fontSize: '16px',
          color: isPositive ? '#22c55e' : '#ef4444'
        }
      }
    };
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Your Holdings</h1>
        <p className="text-gray-500">Track and manage your investment portfolio</p>
      </motion.div>
      
      {/* Tabs for switching view modes */}
      <motion.div 
        initial="hidden"
        animate="visible" 
        variants={fadeVariants}
        className="mb-6"
      >
        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Card View</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Table View</span>
            </TabsTrigger>
          </TabsList>

          
        {/* Search, filters and sorting */}
        <motion.div 
          className="my-4 space-y-4"
          initial="hidden"
          animate="visible"
          variants={fadeVariants}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search holdings..."
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
                <DropdownMenuItem onClick={() => handleSort('name')} className="flex justify-between">
                  Asset Name
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('purchase_price')} className="flex justify-between">
                  Purchase Price
                  {sortConfig.key === 'purchase_price' && (
                    sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('quantity')} className="flex justify-between">
                  Quantity
                  {sortConfig.key === 'quantity' && (
                    sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('total_value')} className="flex justify-between">
                  Total Value
                  {sortConfig.key === 'total_value' && (
                    sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('purchase_date')} className="flex justify-between">
                  Purchase Date
                  {sortConfig.key === 'purchase_date' && (
                    sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
          
          {/* TabsContent moved inside Tabs component */}
          <TabsContent value="cards" className="mt-4 p-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-6" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-2/5" />
                    </div>
                    <div className="flex justify-end mt-6">
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              filteredHoldings.length === 0 ? (
                <motion.div 
                  className="text-center py-12 border rounded-lg"
                  variants={fadeVariants}
                >
                  <p className="text-lg text-gray-500 mb-2">No holdings found</p>
                  <p className="text-sm text-gray-400">
                    {searchQuery ? 'Try adjusting your search query' : 'Add some assets to your portfolio'}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear search
                    </Button>
                  )}
                </motion.div>
              ) : (
                <AnimatePresence>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredHoldings.map((holding) => (
                      <motion.div 
                        key={holding.id}
                        variants={cardVariants}
                        whileHover="hover"
                        layoutId={`holding-${holding.id}`}
                      >
                        <Card className="overflow-hidden h-full">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-semibold line-clamp-2">{holding.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="pb-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Package className="h-3.5 w-3.5" /> Quantity
                                </span>
                                <p className="font-medium">{parseFloat(holding.quantity).toLocaleString()}</p>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <DollarSign className="h-3.5 w-3.5" /> Price
                                </span>
                                <p className="font-medium">${parseFloat(holding.purchase_price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" /> Purchase Date
                                </span>
                                <p className="font-medium">{holding.purchase_date_formatted}</p>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <DollarSign className="h-3.5 w-3.5" /> Total Value
                                </span>
                                <p className="font-semibold text-emerald-600">${parseFloat(holding.total_value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0">
                            <Button 
                              className="w-full"
                              variant="outline"
                              onClick={() => openAssetDetails(holding)}
                            >
                              <Info className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )
            )}
          </TabsContent>
          
          <TabsContent value="table" className="mt-4 p-0">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div 
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => handleSort('name')}
                        >
                          Asset
                          {sortConfig.key === 'name' && (
                            sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div 
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => handleSort('quantity')}
                        >
                          Quantity
                          {sortConfig.key === 'quantity' && (
                            sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div 
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => handleSort('purchase_price')}
                        >
                          Purchase Price
                          {sortConfig.key === 'purchase_price' && (
                            sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div 
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          Current Price
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div 
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          Profit/Loss
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div 
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => handleSort('purchase_date')}
                        >
                          Purchase Date
                          {sortConfig.key === 'purchase_date' && (
                            sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <div 
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => handleSort('total_value')}
                        >
                          Total Value
                          {sortConfig.key === 'total_value' && (
                            sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <Skeleton className="h-5 w-32" />
                          </td>
                          <td className="p-4 align-middle">
                            <Skeleton className="h-5 w-16" />
                          </td>
                          <td className="p-4 align-middle">
                            <Skeleton className="h-5 w-20" />
                          </td>
                          <td className="p-4 align-middle">
                            <Skeleton className="h-5 w-20" />
                          </td>
                          <td className="p-4 align-middle">
                            <Skeleton className="h-5 w-28" />
                          </td>
                          <td className="p-4 align-middle">
                            <Skeleton className="h-5 w-24" />
                          </td>
                          <td className="p-4 align-middle">
                            <Skeleton className="h-5 w-20" />
                          </td>
                          <td className="p-4 align-middle text-right">
                            <Skeleton className="h-9 w-24 ml-auto" />
                          </td>
                        </tr>
                      ))
                    ) : filteredHoldings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-gray-500">
                          No holdings found. {searchQuery && 'Try adjusting your search query.'}
                        </td>
                      </tr>
                    ) : (
                      filteredHoldings.map((holding) => {
                        // Use purchase price as fallback instead of 0 to avoid showing -100% loss
                        const currentPrice = assetPrices[holding.id] || parseFloat(holding.purchase_price);
                        const purchasePrice = parseFloat(holding.purchase_price);
                        const profitLoss = (currentPrice - purchasePrice) * parseFloat(holding.quantity);
                        const profitLossPercent = ((currentPrice - purchasePrice) / purchasePrice * 100).toFixed(2);
                        const isPositive = profitLoss >= 0;
                        
                        return (
                          <tr key={holding.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{holding.name}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <span>{parseFloat(holding.quantity).toLocaleString()}</span>
                            </td>
                            <td className="p-4 align-middle">
                              <span>${parseFloat(purchasePrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </td>
                            <td className="p-4 align-middle">
                              <span>${parseFloat(currentPrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </td>
                            <td className="p-4 align-middle">
                              <span className={`font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                ${Math.abs(profitLoss).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                                ({isPositive ? '+' : '-'}{Math.abs(profitLossPercent)}%)
                              </span>
                            </td>
                            <td className="p-4 align-middle">
                              <span>{holding.purchase_date_formatted}</span>
                            </td>
                            <td className="p-4 align-middle">
                              <span>${parseFloat(holding.total_value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </td>
                            <td className="p-4 align-middle text-right">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => openAssetDetails(holding)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
      
      {/* Results summary */}
      <motion.div 
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        className="mb-6 flex justify-between items-center"
      >
        <p className="text-sm text-gray-500">
          {loading ? 'Loading holdings...' : `Showing ${filteredHoldings.length} of ${holdings.length} holdings`}
        </p>
        
        {holdings.length > 0 && !loading && (
          <Badge variant="outline" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>Total Portfolio: ${holdings.reduce((total, holding) => total + parseFloat(holding.total_value), 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </Badge>
        )}
      </motion.div>
      
      {/* Asset Details Modal */}
      <Dialog open={selectedAsset !== null} onOpenChange={(open) => !open && closeAssetDetails()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedAsset?.name}</DialogTitle>
            <DialogDescription>
              Detailed information about your holding
            </DialogDescription>
          </DialogHeader>
          
          {assetDetailsLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-[350px] w-full rounded-md" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ) : assetDetails ? (
            <div className="py-4">
              {/* Price Comparison Chart */}
              <div className="mb-6 bg-muted/30 p-4 rounded-lg">
                <ReactApexChart 
                  options={getChartOptions(selectedAsset, assetDetails)}
                  series={[{
                    name: "Price",
                    data: [
                      parseFloat(selectedAsset.purchase_price),
                      parseFloat(assetDetails.price)
                    ]
                  }]}
                  type="bar"
                  height={350}
                />
              </div>
              
              {/* Asset Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Purchase Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Purchase Price:</span>
                      <span className="font-medium">${parseFloat(selectedAsset.purchase_price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Purchase Date:</span>
                      <span className="font-medium">{selectedAsset.purchase_date_formatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Quantity:</span>
                      <span className="font-medium">{parseFloat(selectedAsset.quantity).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Cost:</span>
                      <span className="font-medium">${parseFloat(selectedAsset.total_value).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Current Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Price:</span>
                      <span className="font-medium">${parseFloat(assetDetails.price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Asset Type:</span>
                      <span className="font-medium">{assetDetails.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Current Value:</span>
                      <span className="font-medium">${(parseFloat(selectedAsset.quantity) * parseFloat(assetDetails.price)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between">
                      {(() => {
                        const priceDiff = parseFloat(assetDetails.price) - parseFloat(selectedAsset.purchase_price);
                        const percentChange = ((priceDiff / parseFloat(selectedAsset.purchase_price)) * 100).toFixed(2);
                        const isPositive = priceDiff >= 0;
                        
                        return (
                          <>
                            <span className="text-sm">Profit/Loss:</span>
                            <span className={`font-medium flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                              {isPositive ? '+' : ''}{percentChange}% (${(priceDiff * parseFloat(selectedAsset.quantity)).toFixed(2)})
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              <p>Failed to load asset details. Please try again.</p>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={closeAssetDetails}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}