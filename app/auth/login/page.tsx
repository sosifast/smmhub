"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Poppins } from 'next/font/google';
import Script from 'next/script';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

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
        setError("Email atau password tidak valid.");
        setIsLoading(false);
        return;
      }

      if (user.status !== "Active") {
        setError("Akun Anda sedang tidak aktif. Silakan hubungi dukungan.");
        setIsLoading(false);
        return;
      }

      // Login success! Save session in localStorage
      localStorage.setItem("smmhub_session", JSON.stringify(user));
      setSuccess(true);
      setIsLoading(false);

      // Wait a moment for success animation then navigate
      setTimeout(() => {
        router.push("/admin");
      }, 800);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak terduga.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossOrigin="anonymous"
      />
      <style dangerouslySetInnerHTML={{__html: `
        body { background-color: #f8f9fa; }
        .login-card { border-radius: 1.5rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); border: none; }
        .form-control { border-radius: 0.75rem; padding: 0.75rem 1.25rem; border: 1px solid #e2e8f0; box-shadow: none; }
        .form-control:focus { border-color: #667eea; box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.15); }
        .btn-primary-custom { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 0.75rem; padding: 0.75rem; font-weight: 600; transition: all 0.3s; }
        .btn-primary-custom:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(118, 75, 162, 0.4); }
        .text-gradient { background: -webkit-linear-gradient(#667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}} />

      <main className={`${poppins.className} d-flex align-items-center min-vh-100 py-5`} style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card login-card bg-white p-4 p-md-5 mx-auto w-100">
                {success ? (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#10b981" className="bi bi-check-circle-fill mx-auto" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                      </svg>
                    </div>
                    <h3 className="fw-bold text-dark mb-2">Login Berhasil!</h3>
                    <p className="text-muted">Mengarahkan Anda ke dashboard...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-5">
                      <h2 className="fw-bold text-gradient mb-2">SMM Hub</h2>
                      <p className="text-muted" style={{ fontSize: '0.95rem' }}>Selamat datang kembali! Silakan masuk ke akun Anda.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                      {error && (
                        <div className="alert alert-danger d-flex align-items-center py-2 px-3 border-0 rounded-3 mb-4" role="alert" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-circle-fill me-2" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                          </svg>
                          <small>{error}</small>
                        </div>
                      )}

                      <div className="mb-4">
                        <label htmlFor="email" className="form-label text-secondary fw-semibold small mb-2">Alamat Email</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          id="email" 
                          placeholder="nama@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label htmlFor="password" className="form-label text-secondary fw-semibold small mb-0">Kata Sandi</label>
                          <a href="#" className="small text-decoration-none fw-medium" style={{ color: '#667eea' }}>Lupa sandi?</a>
                        </div>
                        <div className="input-group">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            className="form-control border-end-0" 
                            id="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            required
                            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                          />
                          <span 
                            className="input-group-text bg-white border-start-0 text-muted" 
                            style={{ borderTopRightRadius: '0.75rem', borderBottomRightRadius: '0.75rem', cursor: 'pointer' }}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486z"/>
                                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                                <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                              </svg>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4 form-check">
                        <input 
                          type="checkbox" 
                          className="form-check-input" 
                          id="rememberMe" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={isLoading}
                        />
                        <label className="form-check-label text-muted small" htmlFor="rememberMe">Ingat saya selama 30 hari</label>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary text-white w-100 btn-primary-custom d-flex justify-content-center align-items-center mt-2"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sedang Masuk...
                          </>
                        ) : "Masuk"}
                      </button>
                    </form>

                    <div className="text-center mt-5">
                      <p className="text-muted small mb-0">
                        Belum punya akun? <a href="#" className="text-decoration-none fw-bold" style={{ color: '#667eea' }}>Daftar gratis</a>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmxc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous" />
      </main>
    </>
  );
}
