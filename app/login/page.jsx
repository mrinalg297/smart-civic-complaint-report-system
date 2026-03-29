"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { FooterSection } from "@/components/sections/footer-section";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("LOGIN CLICKED");
    const fakeName = "Mrinal";

    sessionStorage.setItem("user", JSON.stringify({
      name: fakeName
    }));

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#FAF7F2" }}>
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 pt-32">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#E8E0D4] shadow-sm transform transition-all duration-300">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1C1C1E] mb-2" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>Welcome Back</h1>
            <p className="text-[#6B6B6B] text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>Sign in to your account to submit a report</p>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-[#6B6B6B] uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-[#E8E0D4] outline-none focus:border-[#F5A623] transition-colors"
                style={{ background: "#FAF7F2", fontFamily: "'DM Sans', sans-serif" }}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B6B6B] uppercase tracking-[0.12em] mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-[#E8E0D4] outline-none focus:border-[#F5A623] transition-colors"
                style={{ background: "#FAF7F2", fontFamily: "'DM Sans', sans-serif" }}
                placeholder="••••••••"
                required
              />
              <div className="text-right mt-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-[#F5A623] hover:underline"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={() => alert("Password reset feature coming soon")}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              className="mt-6 w-full py-4 text-white rounded-xl text-sm uppercase tracking-[0.08em] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
              style={{ background: "#1C1C1E", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}
            >
              Sign In <span className="ml-2 font-mono">→</span>
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-[#6B6B6B]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Don't have an account? <a href="/signup" className="font-bold hover:underline" style={{ color: "#F5A623" }}>Sign up</a>
          </div>
        </div>
      </div>
      <FooterSection />
    </main>
  );
}
