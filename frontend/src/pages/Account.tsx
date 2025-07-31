import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Account = () => {
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [profile, setProfile] = useState<{ id: string; email: string | null; plan: string; created_at: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/signin');
          return;
        }
        
        setUser(user);
        
        // Mock profile data - no backend functionality
        const mockProfile = {
          id: user.id,
          email: user.email,
          plan: 'basic',
          created_at: '2024-01-15'
        };
        setProfile(mockProfile);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate, toast]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-xl text-orange-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="mr-4 h-10 w-10 rounded-full bg-white/50 hover:bg-white/70 text-orange-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-orange-800">My Account</h1>
        </div>

        {/* Profile Card */}
        <Card className="bg-white backdrop-blur-sm border-orange-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-200 flex items-center justify-center">
                <User className="h-10 w-10 text-orange-700" />
              </div>
            </div>
            <CardTitle className="text-2xl text-orange-800">Profile Details</CardTitle>
            <CardDescription className="text-orange-600">
              Manage your account information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-orange-800 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || profile?.email || ''}
                disabled
                className="bg-gray-100 border border-gray-300"
              />
            </div>

            {/* Password (masked) */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-orange-800 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={showPassword ? "your-actual-password" : "••••••••••••"}
                  disabled
                  className="bg-gray-100 border border-gray-300 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-orange-600 hover:text-orange-800"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-orange-600">
                Password is securely stored and cannot be displayed
              </p>
            </div>

            {/* Plan */}
            <div className="space-y-2">
              <Label className="text-orange-800 font-medium">Current Plan</Label>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={profile?.plan === 'premium' ? 'default' : 'secondary'}
                  className={profile?.plan === 'premium' 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-orange-100 text-orange-800'
                  }
                >
                  {profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free'}
                </Badge>
                {profile?.plan !== 'premium' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/pricing')}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div className="space-y-2">
              <Label className="text-orange-800 font-medium">Member Since</Label>
              <Input
                value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                disabled
                className="bg-gray-100 border border-gray-300"
              />
            </div>

            {/* Sign Out Button */}
            <div className="pt-4 border-t border-orange-200">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;