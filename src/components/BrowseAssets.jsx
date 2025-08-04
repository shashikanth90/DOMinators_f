import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, SortAsc, SortDesc, ChevronDown, 
  Info, ShoppingCart, ArrowUpDown, X, Check
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
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

export default function BrowseAssets() {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  
  const assetTypes = ['All', 'Stock', 'Mutual Fund', 'Bond', 'Cash', 'Other'];
  
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/assets/get-all`);        setAssets(response.data);
        setFilteredAssets(response.data);
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssets();
  }, []);
  
  useEffect(() => {
    let result = [...assets];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (activeFilter !== 'All') {
      result = result.filter(asset => asset.type === activeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredAssets(result);
  }, [assets, searchQuery, activeFilter, sortConfig]);
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };
  
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
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Browse Assets</h1>
        <p className="text-gray-500">Discover and invest in a wide range of financial instruments</p>
      </motion.div>
      
      {/* Search, filters and sorting */}
      <motion.div 
        className="mb-8 space-y-4"
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
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
              {assetTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSort('name')} className="flex justify-between">
                Name
                {sortConfig.key === 'name' && (
                  sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('price')} className="flex justify-between">
                Price
                {sortConfig.key === 'price' && (
                  sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('created_at')} className="flex justify-between">
                Date Added
                {sortConfig.key === 'created_at' && (
                  sortConfig.direction === 'ascending' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Active filters display */}
        <div className="flex flex-wrap gap-2">
          {activeFilter !== 'All' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>{activeFilter}</span>
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setActiveFilter('All')}
              />
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>Search: {searchQuery}</span>
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
        className="mb-4 flex justify-between items-center"
      >
        <p className="text-sm text-gray-500">
          {loading ? 'Loading assets...' : `Showing ${filteredAssets.length} of ${assets.length} assets`}
        </p>
      </motion.div>
      
      {/* Assets grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-8 w-1/3 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredAssets.length === 0 ? (
              <motion.div 
                className="col-span-full text-center py-12"
                variants={fadeVariants}
              >
                <p className="text-lg text-gray-500">No assets found matching your criteria</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('All');
                  }}
                >
                  Clear filters
                </Button>
              </motion.div>
            ) : (
              filteredAssets.map((asset) => (
                <motion.div 
                  key={asset.id}
                  variants={cardVariants}
                  whileHover="hover"
                  layoutId={`asset-${asset.id}`}
                >
                  <Card className="overflow-hidden h-full">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-2">{asset.name}</h3>
                          <Badge className="mt-2" variant="outline">{asset.type}</Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex gap-2 items-center">
                              <Info className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex gap-2 items-center">
                              <ShoppingCart className="h-4 w-4" />
                              Buy Asset
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="mt-6">
                        <span className="text-sm text-gray-500">Current Price</span>
                        <p className="text-2xl font-bold">${parseFloat(asset.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="bg-muted/50 px-6 py-3">
                      <div className="text-xs text-gray-500 w-full flex justify-between">
                        <span>Added {new Date(asset.created_at).toLocaleDateString()}</span>
                        <span>ID: {asset.id}</span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}