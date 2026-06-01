"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // Insert new member user into Supabase 'user' table
      const { error: insertError } = await supabase
        .from("user")
        .insert({
          full_name: fullName,
          email: email,
          password: password,
          level: "Member", // Defaults to standard Member account
          status: "Active"  // Default active
        });

      if (insertError) {
        // PostgreSQL unique violation error code: 23505
        if (insertError.code === "23505") {
          setError("This email address is already registered.");
        } else {
          throw insertError;
        }
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      // Redirect to login page after brief success animation
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
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
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Account Created!</h2>
            <p className="text-sm text-zinc-400">Your registration is complete. Redirecting you to login...</p>
          </div>
        ) : (
          <>
            {/* Logo and Greeting */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30 mb-4 transform hover:rotate-12 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Register Account</h1>
              <p className="mt-1.5 text-sm text-zinc-400">Join SMMHub today and configure your workspace.</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 animate-shake">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Full Name
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 group-focus-within:text-violet-400 transition-colors pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    disabled={isLoading}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Email Address Input */}
              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 group-focus-within:text-violet-400 transition-colors pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 group-focus-within:text-violet-400 transition-colors pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all duration-200"
                  />
                  <button
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

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="reg-confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Confirm Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 group-focus-within:text-violet-400 transition-colors pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/"
                className="font-medium text-violet-400 hover:text-violet-300 underline underline-offset-4 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
