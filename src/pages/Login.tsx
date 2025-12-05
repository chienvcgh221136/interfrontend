import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Zap, ArrowLeft, User, Shield } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('user');
  
  // User login state
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Admin login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUsername || !userPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setUserLoading(true);
    try {
      const response = await authApi.userLogin({
        username: userUsername,
        password: userPassword,
      });

      const { token, username } = response.data;
      const decoded: any = jwtDecode(token);
      
      login(token, {
        id: decoded.id,
        username: username,
        role: 'user',
      });

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setUserLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setAdminLoading(true);
    try {
      const response = await authApi.adminLogin({
        username: adminUsername,
        password: adminPassword,
      });

      const { token, username } = response.data;
      const decoded: any = jwtDecode(token);
      
      login(token, {
        id: decoded.id,
        username: username,
        role: 'admin',
      });

      toast.success('Welcome back, Admin!');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      
      // For Google login, we'll use the email as username
      // In a real app, you'd send this to your backend to handle
      toast.success(`Welcome, ${decoded.name}!`);
      
      // Create a mock user for demo purposes
      // In production, you'd call your backend's Google auth endpoint
      login(credentialResponse.credential, {
        id: decoded.sub,
        username: decoded.email,
        role: 'user',
      });

      navigate('/dashboard');
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LinkShort</span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back
          </h1>
          <p className="text-lg text-white/80">
            Sign in to access your dashboard and manage your links.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 border border-white/20 rounded-full" />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] border border-white/10 rounded-full" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">LinkShort</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">Sign in</h2>
          <p className="text-muted-foreground mb-8">
            Choose your account type to continue
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                User
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user" className="space-y-6">
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-username">Username</Label>
                  <Input
                    id="user-username"
                    placeholder="Enter your username"
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Enter your password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={userLoading}
                >
                  {userLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {GOOGLE_CLIENT_ID && (
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google login failed')}
                      theme="outline"
                      size="large"
                      width="100%"
                    />
                  </div>
                </GoogleOAuthProvider>
              )}

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  Admin accounts are pre-configured. Contact your system administrator if you need access.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Admin Username</Label>
                  <Input
                    id="admin-username"
                    placeholder="Enter admin username"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-purple hover:bg-purple-light text-white"
                  disabled={adminLoading}
                >
                  {adminLoading ? 'Signing in...' : 'Sign in as Admin'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
