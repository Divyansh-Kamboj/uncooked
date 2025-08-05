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
    <div className="flex justify-center items-center min-h-screen">
      <SignIn afterSignUpUrl="/pricing" signUpUrl="/signup" />
    </div>
  );
};

export default SignInPage;