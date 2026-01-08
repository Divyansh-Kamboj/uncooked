import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isSignedIn, navigate]);

  const handleStart = () => navigate("/signin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ff7800]">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-white font-extrabold text-[72px] leading-none">Uncooked</h1>
          <span className="text-[64px] select-none">🔥</span>
        </div>

        <p className="mt-4 text-white text-lg">Be prepared to be roasted!</p>

        <div className="mt-6">
          <button onClick={handleStart} className="text-white text-sm opacity-95">click to start</button>
        </div>
      </div>
    </div>
  );
};

export default Index;
