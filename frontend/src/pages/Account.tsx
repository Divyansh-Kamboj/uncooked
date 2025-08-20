import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, ArrowLeft, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Account = () => {
  const { user, logout } = useAuth0();
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.sub) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("plan, email")
            .eq("id", user.sub)
            .single();
          
          if (error) {
            console.error('Error fetching user data:', error);
            toast({
              title: "Error",
              description: "Failed to load user data",
              variant: "destructive"
            });
          } else {
            setPlan(data?.plan || null);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user, toast]);

  const handleResetPassword = () => {
    // Redirect to Auth0's password reset page
    window.location.href = `https://${import.meta.env.VITE_AUTH0_DOMAIN}/login?reset=1`;
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-xl text-orange-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="absolute top-6 left-6 text-orange-700 hover:bg-orange-100 px-4 py-2 rounded-lg"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <div className="max-w-2xl mx-auto pt-24 px-6 pb-12">
        <h1 className="text-3xl font-bold text-orange-800 mb-8">My Account</h1>

        {/* Profile Card */}
        <Card className="bg-white backdrop-blur-sm border-orange-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-200 flex items-center justify-center">
                <User className="h-10 w-10 text-orange-700" />
              </div>
            </div>
            <CardTitle className="text-2xl text-orange-800">Your Profile</CardTitle>
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
                value={user?.email || ''}
                disabled
                className="bg-gray-100 border border-gray-300"
              />
            </div>

            {/* Reset Password */}
            <div className="space-y-2">
              <Label className="text-orange-800 font-medium">Password</Label>
              <Button
                onClick={handleResetPassword}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Key className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
              <p className="text-sm text-orange-600">
                Click to reset your password
              </p>
            </div>

            {/* Plan */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-orange-800 font-medium">Current Plan</Label>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={plan === 'uncooked' ? 'default' : 'secondary'}
                    className={plan === 'uncooked'
                      ? 'bg-orange-600 text-white'
                      : plan === 'nerd'
                      ? 'bg-blue-600 text-white'
                      : 'bg-orange-100 text-orange-800'}
                  >
                    {plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free'}
                  </Badge>
                  {plan !== 'uncooked' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate('/pricing')}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </div>
              </div>

              {/* Billing Information */}
              <div className="space-y-2">
                <Label className="text-orange-800 font-medium">Billing Information</Label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Card ending in</span>
                    <span className="font-medium">•••• 4242</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Expires</span>
                    <span>••/••</span>
                  </div>
                </div>
              </div>

              {/* Plan End Date */}
              <div className="space-y-2">
                <Label className="text-orange-800 font-medium">Plan ends on</Label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Next billing date</span>
                    <span className="font-medium">December 31, 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="pt-4 border-t border-orange-200">
              <Button
                onClick={() => logout()}
                variant="default"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
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