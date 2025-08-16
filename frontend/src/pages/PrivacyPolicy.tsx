import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
          <h1 className="text-3xl font-bold text-orange-800">Privacy Policy</h1>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600">Last updated: January 2025</p>
          </div>

          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">1. Introduction</h3>
              <p className="leading-relaxed">
                At Uncooked ("we," "our," or "us"), we are committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you use our A Level mathematics learning platform.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">2. Information We Collect</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-semibold text-orange-700 mb-2">Personal Information</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name and email address</li>
                    <li>Account credentials</li>
                    <li>Payment information (processed securely by third-party providers)</li>
                    <li>Profile information and preferences</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-orange-700 mb-2">Usage Information</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Questions attempted and completed</li>
                    <li>Time spent on different topics</li>
                    <li>Performance metrics and progress</li>
                    <li>AI explanation usage patterns</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-orange-700 mb-2">Technical Information</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Usage analytics and cookies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">3. How We Use Your Information</h3>
              <div className="space-y-3">
                <p className="leading-relaxed">We use the collected information for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Providing and maintaining our service</li>
                  <li>Personalizing your learning experience</li>
                  <li>Processing payments and managing subscriptions</li>
                  <li>Improving our platform and content</li>
                  <li>Providing customer support</li>
                  <li>Sending important updates and notifications</li>
                  <li>Analyzing usage patterns to enhance features</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">4. Information Sharing</h3>
              <p className="leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. 
                We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With trusted service providers who assist in operating our platform</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">5. Data Security</h3>
              <p className="leading-relaxed">
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. These 
                measures include encryption, secure servers, and regular security assessments.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">6. Cookies and Tracking</h3>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, 
                analyze usage patterns, and provide personalized content. You can control 
                cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">7. Third-Party Services</h3>
              <p className="leading-relaxed">
                Our platform may integrate with third-party services such as payment processors, 
                analytics providers, and authentication services. These services have their own 
                privacy policies, and we encourage you to review them.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">8. Data Retention</h3>
              <p className="leading-relaxed">
                We retain your personal information for as long as necessary to provide our 
                services and comply with legal obligations. You may request deletion of your 
                account and associated data at any time.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">9. Your Rights</h3>
              <p className="leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your information</li>
                <li>Withdraw consent at any time</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">10. Children's Privacy</h3>
              <p className="leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not 
                knowingly collect personal information from children under 13. If you are a 
                parent or guardian and believe your child has provided us with personal 
                information, please contact us immediately.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">11. International Transfers</h3>
              <p className="leading-relaxed">
                Your information may be transferred to and processed in countries other than 
                your own. We ensure that such transfers comply with applicable data protection 
                laws and implement appropriate safeguards.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">12. Changes to This Policy</h3>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of 
                any material changes by posting the new policy on our website and updating 
                the "Last updated" date.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">13. Contact Us</h3>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us at:
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

export default PrivacyPolicy;
