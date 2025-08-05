import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Account = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [plan, setPlan] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      supabase
        .from("users")
        .select("plan")
        .eq("id", user.id)
        .single()
        .then(({ data }) => setPlan(data?.plan || null));
    }
  }, [user]);

  if (!user) {
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

        {/* P Card */}
        <Card className="bg-white backdrop-blur-sm border-orange-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-200 flex items-center justify-center">
                <User className="h-10 w-10 text-orange-700" />
              </div>
            </div>
            <CardTitle className="text-2xl text-orange-800">P Details</CardTitle>
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
                value={user?.primaryEmailAddress?.emailAddress || ''}
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
                Password cannot be displayed
              </p>
            </div>

            {/* Plan */}
            <div className="space-y-2">
              <Label className="text-orange-800 font-medium">Current Plan</Label>
              <div className="flex items-center space-x-2">
                <Badge
  variant={plan === 'uncooked' ? 'default' : 'secondary'}
  className={plan === 'uncooked'
    ? 'bg-orange-600 text-white'
    : 'bg-orange-100 text-orange-800'}
>
  {plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free'}
</Badge>
{plan !== 'uncooked' && (
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
              {/* Paid status removed: Add back if you fetch it from Supabase */}
            </div>

            {/* Member Since */}
            {/* Member Since removed: Add back if you fetch it from Supabase */}

            {/* Sign Out Button */}
            <div className="pt-4 border-t border-orange-200">
              <Button
                onClick={() => signOut()}
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