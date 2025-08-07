import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Lock, 
  User, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight, 
  CreditCard,
  BarChart4,
  PiggyBank,
  LineChart,
  BadgeDollarSign,
  Briefcase
} from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1 
      }
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

  const bubbleVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 10, delay: 0.2 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel - Login form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <motion.div 
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center">
              <BadgeDollarSign className="h-8 w-8 mr-2 text-primary" />
              <span>Investo</span>
            </h1>
            <p className="text-gray-500">Sign in to access your financial dashboard</p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <User className="h-5 w-5" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Password</label>
                      <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                    </div> */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 rounded-md p-3 text-sm flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
              {/* <CardFooter className="text-center text-sm text-gray-500">
                Don't have an account? <span className="text-primary ml-1">Contact administrator</span>
              </CardFooter> */}
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Right panel - Financial imagery */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/90 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTE4IDEzNy4zYzAtMjEuNC0xMS41LTM4LjUtNDBDLTUgODMuOC01OC41IDY0LjgtNTguNSA0NS41YzAtMTkuMyAxMjEuMi0xNi42IDE1OC41IDguOSA0MS40IDI3LjkgNDUgNTIuNiA0MyA4My45LTEuOSAyOC43LTEwLjQgMzkuMy0yNS41IDU2LjQtMTYuMSAxOC4xLTMwLjMgMjkuNC00NC45IDM1LjgtMTYuMyA3LjItMjcuOSAxMC41LTQyLjcgMTAuNXMtMzMuNC00LjMtNDkuNy05Yy0xNC45LTQuMy0zMy41LTktNTAuMy0xNS40LTE1LjctNi4xLTI3LjUtMTQuOS0yOS45LTI3LjdDLTQuMSAxNzIuMiAzMCAxNzIuMyA3OCAxNjkuOWMyNi4yLTEuMyA0MC4xLTExIDQwLjEtMzIuNnoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMikiIC8+Cjwvc3ZnPg==')] bg-cover opacity-70"></div>
        
        {/* Floating icons */}
        <motion.div 
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
          className="absolute top-1/4 left-1/4 bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-white/20"
        >
          <BarChart4 className="h-10 w-10 text-white" />
        </motion.div>
        
        <motion.div 
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="absolute top-2/3 left-1/3 bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-white/20"
        >
          <PiggyBank className="h-8 w-8 text-white" />
        </motion.div>
        
        <motion.div 
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          className="absolute top-1/3 right-1/10 bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-white/20"
        >
          <LineChart className="h-9 w-9 text-white" />
        </motion.div>
        
        <motion.div 
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
          className="absolute top-1/6 right-1/3 bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-white/20"
        >
          <Briefcase className="h-7 w-7 text-white" />
        </motion.div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="text-center text-white p-8 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold mb-6">Track Your Financial Journey</h1>
            <p className="text-xl opacity-90 mb-8">Gain insights, monitor performance, and make informed decisions with our comprehensive portfolio management tools.</p>
            <div className="flex gap-2 items-center justify-center text-sm font-medium">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <CreditCard className="h-4 w-4" />
                <span>Asset Tracking</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <LineChart className="h-4 w-4" />
                <span>Performance Analytics</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}