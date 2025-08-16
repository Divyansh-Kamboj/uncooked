import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
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
          <h1 className="text-3xl font-bold text-orange-800">Terms & Conditions</h1>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600">Last updated: January 2025</p>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">1. Acceptance of Terms</h3>
              <p className="leading-relaxed">
                By accessing and using Uncooked ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use 
                this service.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">2. Description of Service</h3>
              <p className="leading-relaxed">
                Uncooked provides A Level mathematics practice questions with AI-powered explanations. 
                The service includes access to question banks, step-by-step solutions, and personalized 
                learning features through our web platform.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">3. User Accounts</h3>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  To access certain features of the Service, you must create an account. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information during registration</li>
                  <li>Notifying us immediately of any unauthorized use of your account</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">4. Subscription Plans</h3>
              <div className="space-y-3">
                <p className="leading-relaxed">
                  We offer the following subscription plans:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Free Plan:</strong> Limited access to questions and explanations</li>
                  <li><strong>Nerd Tier (₹750/month):</strong> Enhanced access with daily limits</li>
                  <li><strong>Uncooked Tier (₹1,500/month):</strong> Unlimited access to all features</li>
                </ul>
                <p className="leading-relaxed">
                  Subscriptions automatically renew unless cancelled before the renewal date. 
                  You may cancel your subscription at any time through your account settings.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">5. Acceptable Use</h3>
              <div className="space-y-3">
                <p className="leading-relaxed">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the Service for any unlawful purpose</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Share your account credentials with others</li>
                  <li>Reproduce, distribute, or create derivative works from our content</li>
                  <li>Use automated tools to access the Service</li>
                  <li>Interfere with or disrupt the Service</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">6. Intellectual Property</h3>
              <p className="leading-relaxed">
                All content on Uncooked, including but not limited to questions, explanations, 
                graphics, and software, is owned by us or our licensors and is protected by 
                copyright and other intellectual property laws. You may not copy, reproduce, 
                distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">7. Privacy Policy</h3>
              <p className="leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also 
                governs your use of the Service, to understand our practices.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">8. Disclaimers</h3>
              <p className="leading-relaxed">
                The Service is provided "as is" without warranties of any kind. We do not 
                guarantee that the Service will be uninterrupted, secure, or error-free. 
                While we strive for accuracy, we do not warrant that the content is complete, 
                accurate, or up-to-date.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">9. Limitation of Liability</h3>
              <p className="leading-relaxed">
                In no event shall Uncooked be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising out of or relating to your use of 
                the Service.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">10. Termination</h3>
              <p className="leading-relaxed">
                We may terminate or suspend your account and access to the Service at any time, 
                with or without cause, with or without notice. Upon termination, your right to 
                use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">11. Changes to Terms</h3>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users 
                of any material changes via email or through the Service. Your continued use 
                of the Service after such modifications constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">12. Governing Law</h3>
              <p className="leading-relaxed">
                These terms shall be governed by and construed in accordance with the laws of 
                India. Any disputes arising from these terms or your use of the Service shall 
                be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">13. Contact Information</h3>
              <p className="leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="bg-orange-50 p-4 rounded-lg mt-3">
                <p className="font-semibold">Email:</p>
                <p>uncookeddr@gmail.com</p>
                <p className="font-semibold mt-2">Address:</p>
                <p>Uncooked Education Pvt. Ltd.<br />
                [Your Business Address]<br />
                India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
