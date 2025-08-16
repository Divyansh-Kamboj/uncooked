import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-orange-400">🔥 Uncooked</h3>
              <p className="text-gray-300 mt-2">
                Your A Level answers, uncooked and explained.
              </p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transform your A Level mathematics learning with AI-powered explanations 
              that reveal the thinking behind every solution. Join thousands of students 
              mastering complex concepts with our innovative approach.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-orange-400 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/pricing" 
                  className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold text-orange-400 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/terms-and-conditions" 
                  className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/refund-policy" 
                  className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} Uncooked. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a 
                href="mailto:uncookeddr@gmail.com" 
                className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
              >
                uncookeddr@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
