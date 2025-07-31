import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type PlanType = 'basic' | 'nerd' | 'uncooked' | null;

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
  const [showPriceAnimation, setShowPriceAnimation] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPriceAnimation(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const plans = [
    {
      id: 'basic' as const,
      name: 'Basic',
      price: 'Free',
      features: [
        '10 questions a day',
        '5 AI explanations a day',
        'Access to all papers'
      ]
    },
    {
      id: 'uncooked' as const,
      name: 'Uncooked',
      price: '₹ 1500',
      isHighlighted: true,
      features: [
        'Unlimited questions',
        'Unlimited AI explanations',
        'Access to all papers'
      ]
    },
    {
      id: 'nerd' as const,
      name: 'Nerd',
      price: '₹ 750',
      features: [
        '20 questions a day',
        '10 AI explanations a day',
        'Access to all papers'
      ]
    }
  ];

  const handlePlanSelect = (planId: PlanType) => {
    setSelectedPlan(planId);
  };

  const handleChoosePlan = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to select a plan.",
          variant: "destructive",
        });
        navigate('/signin');
        return;
      }

      // Mock plan update - no backend functionality
      console.log('Plan update simulated:', selectedPlan);

      toast({
        title: "Plan updated successfully!",
        description: `You are now on the ${selectedPlan} plan.`,
      });

      // Small delay to ensure database update is processed before navigation
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      {/* Back to home indicator */}
      <button 
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-foreground/70 hover:text-foreground transition-colors duration-300"
      >
        ← Back to Home
      </button>

      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg md:text-xl text-foreground/90">
          Unlock your potential with the perfect subscription
        </p>
      </div>

      {/* Pricing Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-12 items-end">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`pricing-card relative cursor-pointer transition-all duration-300 ${
              selectedPlan === plan.id 
                ? 'pricing-card-selected' 
                : 'pricing-card-default'
            } ${plan.isHighlighted ? 'pricing-card-highlighted' : ''} ${
              plan.isHighlighted ? 'mt-8' : ''
            }`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {/* Highlight badge for Uncooked plan */}
            {plan.isHighlighted && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center animate-[bounce_1.5s_ease-in-out_infinite]">
                  25% off!
                </div>
              </div>
            )}

            {/* Plan Name */}
            <div className="text-center mb-6 pt-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              
              {/* Price */}
              <div className="pricing-price">
                {plan.id === 'uncooked' ? (
                  <div className="relative text-center h-16 flex flex-col items-center justify-center">
                    {/* New Price - Fades in */}
                    <div 
                      className={`absolute transition-all duration-[6000ms] ease-in-out ${
                        showPriceAnimation 
                          ? 'opacity-0 transform translate-y-2' 
                          : 'opacity-100 transform translate-y-0'
                      }`}
                    >
                      ₹ 1500
                    </div>
                    
                    {/* Old Price - Strikes through, shrinks and moves down */}
                    <div 
                      className={`absolute transition-all duration-[5000ms] ease-in-out ${
                        showPriceAnimation 
                          ? 'opacity-100 transform translate-y-0' 
                          : 'opacity-60 transform translate-y-6 text-xs line-through text-gray-500'
                      }`}
                    >
                      ₹ 2000
                    </div>
                  </div>
                ) : (
                  plan.price
                )}
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Selection Indicator */}
            {selectedPlan === plan.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-accent-foreground" />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Choose Plan Button */}
      <Button
        onClick={handleChoosePlan}
        disabled={!selectedPlan || loading}
        className="pricing-choose-button"
        size="lg"
      >
        {loading ? "Updating Plan..." : "Choose Plan"}
      </Button>
    </div>
  );
};

export default Pricing;