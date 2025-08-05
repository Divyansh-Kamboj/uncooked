import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <SignUp
        afterSignUpUrl="/pricing"
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

export default SignUpPage;
