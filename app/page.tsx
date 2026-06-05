"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if user table is completely empty to auto-provision default admin
      const { count, error: countError } = await supabase
        .from("user")
        .select("*", { count: "exact", head: true });

      if (countError) {
        throw new Error(countError.message);
      }

      if (count === 0) {
        const { error: insertError } = await supabase.from("user").insert({
          full_name: "Administrator",
          email: "admin@smmhub.com",
          password: "admin123",
          level: "Admin",
          status: "Active"
        });
        if (insertError) {
          console.error("Auto-provision default admin failed:", insertError);
        }
      }

      // 2. Perform database query to authenticate
      const { data: user, error: loginError } = await supabase
        .from("user")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .maybeSingle();

      if (loginError) {
        throw new Error(loginError.message);
      }

      if (!user) {
        setError("Invalid email or password.");
        setIsLoading(false);
        return;
      }

      if (user.status !== "Active") {
        setError("Your account is currently inactive. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Login success! Save session in localStorage
      localStorage.setItem("smmhub_session", JSON.stringify(user));
      setSuccess(true);
      setIsLoading(false);

      // Wait a moment for success animation then navigate
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };


  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#09090b] px-4 py-12 text-zinc-100 font-sans">
      {/* Decorative Animated Background Orbs */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-violet-600/20 blur-[80px] md:blur-[120px] pointer-events-none animate-pulse duration-[6000ms]"
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-indigo-600/20 blur-[80px] md:blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"
        aria-hidden="true"
      />

      {/* Grid Pattern Overlay for Texture */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Glassmorphic Card Container */}
      <div className="relative w-full max-w-md p-8 md:p-10 rounded-2xl border border-white/[0.08] bg-white/[0.01] backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.02]">
        
        {/* Glow Effect Top Border */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" aria-hidden="true" />
        
        {/* Success View */}
        {success ? (
          <div className="flex flex-col items-center text-center py-8 animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Login Successful!</h2>
            <p className="text-sm text-zinc-400 mb-6">Redirecting you to the dashboard...</p>
            <button
              onClick={() => setSuccess(false)}
              className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
            >
              Go back to login
            </button>
          </div>
        ) : (
          <>
            {/* Logo and Greeting */}
            <div className="flex flex-col items-center mb-8 text-center">
              <img src="/logo.png" alt="SMMHub Logo" className="h-14 w-auto object-contain rounded-xl mb-4 transform hover:scale-105 transition-transform duration-300" />
              <p className="mt-1.5 text-sm text-zinc-400">Welcome back! Access your workspace.</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 animate-shake">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 group-focus-within:text-violet-400 transition-colors pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("Reset password function placeholder."); }}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 group-focus-within:text-violet-400 transition-colors pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all duration-200"
                  />
                  <button
                    id="login-toggle-password"
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <label id="login-remember-me-label" htmlFor="login-remember-me" className="flex items-center cursor-pointer select-none">
                  <div className="relative">
                    <input
                      id="login-remember-me"
                      type="checkbox"
                      disabled={isLoading}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center ${rememberMe ? "bg-violet-600 border-violet-500 shadow-sm shadow-violet-500/40" : "border-white/20 bg-white/[0.02]"}`}>
                      {rememberMe && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-2.5 text-sm text-zinc-400 hover:text-zinc-300 transition-colors">Remember me for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-button"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>


            {/* Footer */}
            <p className="mt-8 text-center text-sm text-zinc-500">
              Don't have an account?{" "}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); alert("Register page placeholder."); }}
                className="font-medium text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
              >
                Sign up for free
              </a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
