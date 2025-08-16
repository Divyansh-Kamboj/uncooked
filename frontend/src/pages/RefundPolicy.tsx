import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4 h-10 w-10 rounded-full bg-white/50 hover:bg-white/70 text-orange-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-orange-800">Refund Policy</h1>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600">Last updated: January 2025</p>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">1. Overview</h3>
              <p className="leading-relaxed">
                At Uncooked, we want you to be completely satisfied with your subscription. 
                This refund policy outlines the circumstances under which refunds may be 
                provided and the process for requesting them.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">2. Refund Eligibility</h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Eligible for Refund</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Technical issues preventing service access within 7 days of purchase</li>
                    <li>• Duplicate charges or billing errors</li>
                    <li>• Service unavailability for more than 24 hours</li>
                    <li>• Cancellation within 24 hours of initial subscription</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Not Eligible for Refund</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Change of mind after 24 hours of subscription</li>
                    <li>• Failure to use the service</li>
                    <li>• Account suspension due to policy violations</li>
                    <li>• Expired subscriptions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">3. Refund Process</h3>
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Step 1: Contact Support</h4>
                  <p className="text-sm text-orange-700">
                    Email us at support@uncooked.com with your refund request. Include your 
                    account email and reason for the refund.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Step 2: Review Process</h4>
                  <p className="text-sm text-orange-700">
                    Our team will review your request within 2-3 business days and may ask 
                    for additional information.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Step 3: Refund Processing</h4>
                  <p className="text-sm text-orange-700">
                    If approved, refunds will be processed within 5-10 business days to your 
                    original payment method.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">4. Refund Amounts</h3>
              <div className="space-y-3">
                <p className="leading-relaxed">Refund amounts are calculated as follows:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Full Refund:</strong> 100% of the subscription amount for eligible cases</li>
                  <li><strong>Partial Refund:</strong> Pro-rated amount based on unused days for technical issues</li>
                  <li><strong>Processing Fees:</strong> May be deducted for payment processing costs</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">5. Cancellation Policy</h3>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  You may cancel your subscription at any time through your account settings. 
                  Cancellation will take effect at the end of your current billing period.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>No refunds for partial months after cancellation</li>
                  <li>Access continues until the end of the paid period</li>
                  <li>You can reactivate your subscription at any time</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">6. Special Circumstances</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-semibold text-orange-700 mb-2">Technical Issues</h4>
                  <p className="text-sm text-gray-600">
                    If you experience technical difficulties that prevent you from accessing 
                    our service, we will work with you to resolve the issue. If the problem 
                    persists for more than 24 hours, you may be eligible for a refund.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-orange-700 mb-2">Service Unavailability</h4>
                  <p className="text-sm text-gray-600">
                    In the rare event that our service is unavailable for an extended period, 
                    we may offer credits or refunds to affected users.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">7. Payment Method Refunds</h3>
              <p className="leading-relaxed">
                Refunds will be processed to the original payment method used for the purchase. 
                Processing times may vary depending on your payment provider:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                <li><strong>Digital Wallets:</strong> 3-7 business days</li>
                <li><strong>Bank Transfers:</strong> 7-14 business days</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">8. Disputes and Appeals</h3>
              <p className="leading-relaxed">
                If your refund request is denied and you believe this decision is incorrect, 
                you may appeal by contacting our support team with additional information 
                or documentation supporting your case.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">9. Contact Information</h3>
              <p className="leading-relaxed">
                For refund requests or questions about this policy, please contact us:
              </p>
              <div className="bg-orange-50 p-4 rounded-lg mt-3">
                <p className="font-semibold">Email:</p>
                <p>uncookeddr@gmail.com</p>
                <p className="font-semibold mt-2">Response Time:</p>
                <p>Within 24-48 hours during business days</p>
                <p className="font-semibold mt-2">Business Hours:</p>
                <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">10. Policy Updates</h3>
              <p className="leading-relaxed">
                We reserve the right to modify this refund policy at any time. Changes will 
                be effective immediately upon posting. Continued use of our service after 
                changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
