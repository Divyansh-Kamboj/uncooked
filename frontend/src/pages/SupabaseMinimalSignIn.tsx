import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

console.log("SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL);
console.log("SUPABASE_ANON_KEY", import.meta.env.VITE_SUPABASE_ANON_KEY);
export default function SupabaseMinimalSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    console.log("[MinimalSignIn] Attempting sign in...");
    try {
      const promise = supabase.auth.signInWithPassword({ email, password });
      // Add a timeout to catch hangs
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout after 10s")), 10000)
      );
      const res = await Promise.race([promise, timeout]);
      console.log("[MinimalSignIn] Result:", res);
      setResult(res);
    } catch (err) {
      console.error("[MinimalSignIn] Error:", err);
      setResult(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h2 className="text-xl mb-4">Minimal Supabase Email/Password Sign-In</h2>
      <form onSubmit={handleSignIn} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <pre className="mt-4 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
        {result ? JSON.stringify(result, null, 2) : ""}
      </pre>
    </div>
  );
}
