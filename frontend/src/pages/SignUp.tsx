import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

console.log("SignUp page loaded!");

const SignUpPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="w-full max-w-md">
        <SignUp
          afterSignUpUrl="#/pricing"
          redirectUrl="#/dashboard"
          appearance={{
            elements: {
              card: "bg-white shadow-lg rounded-xl p-8",
              formButtonPrimary: "bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded",
            },
          }}
        />
        {/* Terms & Conditions Consent Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By signing up, you agree to our{" "}
            <Link 
              to="#/terms-and-conditions" 
              className="text-orange-600 hover:text-orange-700 underline"
              target="_blank"
            >
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link 
              to="#/privacy-policy" 
              className="text-orange-600 hover:text-orange-700 underline"
              target="_blank"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
