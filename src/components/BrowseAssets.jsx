import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, SortAsc, SortDesc, ChevronDown, 
  Info, ShoppingCart, ArrowUpDown, X, Check, Lock,
  DollarSign, Wallet, AlertCircle, CheckCircle2, Plus, Minus
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  
  // Buy asset modal states
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [purchaseResult, setPurchaseResult] = useState({ success: false, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  // User data - account balance will be fetched from API
  const [userData, setUserData] = useState({
    accountBalance: 0,
    securityPin: '1234'
  });
  
  const assetTypes = ['All', 'Stock', 'Mutual Fund', 'Bond', 'Cash', 'Other'];
  
  // Function to fetch account balance
  const fetchAccountBalance = async () => {
    try {
      const settlementsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/settlements/viewBalance`);
      console.log('Settlements Response:', settlementsResponse.data);
      if (settlementsResponse.data && settlementsResponse.data.length > 0) {
        setUserData(prev => ({
          ...prev,
          accountBalance: parseFloat(settlementsResponse.data[0].amount)
        }));
        console.log('Settlements Balance:', settlementsResponse.data[0].amount);
      }
    } catch (error) {
      console.error('Error fetching account balance:', error);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch assets
        const assetsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/assets/get-all`);
        setAssets(assetsResponse.data);
        setFilteredAssets(assetsResponse.data);
        
        // Fetch account balance
        await fetchAccountBalance();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    let result = [...assets];
    
    if (searchQuery) {
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeFilter !== 'All') {
      result = result.filter(asset => asset.type === activeFilter);
    }
    
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

  const handleBuyAsset = (asset) => {
    setSelectedAsset(asset);
    setQuantity(1);
    setShowBuyModal(true);
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => {
      const newQuantity = prev + change;
      return newQuantity < 1 ? 1 : newQuantity;
    });
  };

  const getTotalPrice = () => {
    if (!selectedAsset) return 0;
    return parseFloat(selectedAsset.price) * quantity;
  };

  const handleProceedToBuy = async () => {
    if (!selectedAsset) return;
    
    setIsProcessing(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/holdings/buy`, {
        asset_id: selectedAsset.id,
        quantity: quantity
      });
      
      console.log('Purchase Response:', response.data);
      
      // If purchase is successful, refresh account balance
      await fetchAccountBalance();
      
      setPurchaseResult({
        success: true,
        message: `Successfully purchased ${quantity} ${quantity > 1 ? 'units' : 'unit'} of ${selectedAsset.name}`
      });
      
      setShowBuyModal(false);
      setShowResultModal(true);
    } catch (error) {
      console.error('Error making purchase:', error);
      
      let errorMessage = 'Purchase failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setPurchaseResult({
        success: false,
        message: errorMessage
      });
      
      setShowBuyModal(false);
      setShowResultModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePinSubmit = async () => {
    if (!pin) {
      setPinError('Please enter your security PIN');
      return;
    }

    if (pin !== userData.securityPin) {
      setPinError('Invalid PIN. Please try again.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const totalPrice = getTotalPrice();
      
      if (userData.accountBalance >= totalPrice) {
        // Successful purchase
        setUserData(prev => ({
          ...prev,
          accountBalance: prev.accountBalance - totalPrice
        }));
        
        setPurchaseResult({
          success: true,
          message: `Successfully purchased ${quantity} ${quantity > 1 ? 'units' : 'unit'} of ${selectedAsset.name} for ${totalPrice.toFixed(2)}`
        });
      } else {
        // Insufficient funds
        setPurchaseResult({
          success: false,
          message: 'Purchase failed: Insufficient account balance'
        });
      }
      
      setIsProcessing(false);
      setShowPinModal(false);
      setShowResultModal(true);
    }, 1500);
  };

  const closeAllModals = () => {
    setShowBuyModal(false);
    setShowPinModal(false);
    setShowResultModal(false);
    setSelectedAsset(null);
    setQuantity(1);
    setPin('');
    setPinError('');
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Assets</h1>
            <p className="text-gray-500">Discover and invest in a wide range of financial instruments</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Account Balance</p>
            <p className="text-2xl font-bold text-green-600">
              ${userData.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
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
                            <DropdownMenuItem 
                              className="flex gap-2 items-center"
                              onClick={() => handleBuyAsset(asset)}
                            >
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

      {/* Buy Asset Modal */}
      <Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Purchase Asset
            </DialogTitle>
            <DialogDescription>
              Review the details before proceeding with your purchase.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAsset && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold">{selectedAsset.name}</h4>
                <Badge variant="outline" className="mt-1">{selectedAsset.type}</Badge>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Unit Price
                </span>
                <span className="font-semibold">
                  ${parseFloat(selectedAsset.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b">
                <span>Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-t bg-muted/30 rounded-lg px-4">
                <span className="font-semibold">Total Price</span>
                <span className="text-xl font-bold text-green-600">
                  ${getTotalPrice().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span>Available Balance: ${userData.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBuyModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProceedToBuy}
              disabled={isProcessing || !selectedAsset || userData.accountBalance < getTotalPrice()}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Confirm Purchase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security PIN Modal */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Verification
            </DialogTitle>
            <DialogDescription>
              Please enter your security PIN to complete the purchase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter your security PIN"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError('');
                }}
                className={pinError ? 'border-red-500' : ''}
                maxLength={4}
              />
              {pinError && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {pinError}
                </p>
              )}
            </div>
            
            {selectedAsset && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="flex justify-between">
                  <span>Asset:</span>
                  <span className="font-semibold">{selectedAsset.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-semibold">{quantity}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span>Total Amount:</span>
                  <span className="font-bold text-green-600">
                    ${getTotalPrice().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPinModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePinSubmit}
              disabled={isProcessing || !pin}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Confirm Purchase
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {purchaseResult.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              {purchaseResult.success ? 'Purchase Successful' : 'Purchase Failed'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className={`text-center ${purchaseResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {purchaseResult.message}
            </p>
            
            {purchaseResult.success && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  Your updated account balance: <span className="font-semibold">${userData.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={closeAllModals} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}