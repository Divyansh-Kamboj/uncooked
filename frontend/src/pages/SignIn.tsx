import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SignInPage = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <SignIn 
        afterSignUpUrl="/pricing" 
        signUpUrl="/signup"
        appearance={{
          elements: {
            card: "bg-white shadow-lg rounded-xl p-8",
            formButtonPrimary: "bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded",
          },
        }}
      />
    </div>
  );
};

export default SignInPage;