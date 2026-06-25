import React from 'react';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import Script from 'next/script';

const poppins = Poppins({
  weight: ['300', '400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function LandingPage() {
  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossOrigin="anonymous"
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        .hover-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-card:hover { transform: translateY(-10px); box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important; }
        .hero-section { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
        .text-gradient { background: -webkit-linear-gradient(#fff, #e0e7ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}} />

      <div className={poppins.className} style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <nav className="navbar navbar-expand-lg navbar-dark hero-section">
          <div className="container py-2">
            <Link className="navbar-brand fw-bold fs-4" href="/">
              🚀 SMM Hub
            </Link>
            <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto align-items-center">
                <li className="nav-item">
                  <Link href="/auth/login" className="btn btn-outline-light rounded-pill px-4 fw-semibold">
                    Masuk
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <header className="hero-section text-white text-center d-flex align-items-center position-relative" style={{ minHeight: '80vh', overflow: 'hidden' }}>
          <div className="container position-relative z-1">
            <h1 className="display-3 fw-bold mb-4 text-gradient">Dominasi Sosial Media Anda</h1>
            <p className="lead mb-5 mx-auto" style={{ fontWeight: 300, maxWidth: '700px', fontSize: '1.25rem' }}>
              Platform SMM Panel terbaik dan termurah. Dilengkapi dengan fitur Multi API Order untuk memastikan pesanan Anda diproses dengan cepat, aman, dan stabil.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link href="/auth/login" className="btn btn-light btn-lg rounded-pill px-5 py-3 fw-bold shadow-lg" style={{ color: '#4f46e5', transition: 'all 0.3s' }}>
                Mulai Sekarang
              </Link>
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: '400px', height: '400px', top: '-10%', left: '-5%', filter: 'blur(50px)' }}></div>
          <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: '500px', height: '500px', bottom: '-20%', right: '-10%', filter: 'blur(60px)' }}></div>
        </header>

        <section className="py-5 bg-white">
          <div className="container py-5">
            <div className="text-center mb-5">
              <h2 className="fw-bold text-dark mb-3">Kenapa Memilih SMM Hub?</h2>
              <p className="text-muted lead">Layanan premium dengan harga paling terjangkau.</p>
            </div>
            
            <div className="row text-center g-4 mt-2">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100 py-5 px-4 hover-card" style={{ borderRadius: '1.25rem' }}>
                  <div className="card-body">
                    <div className="display-4 mb-4" style={{ color: '#4f46e5' }}>⚡</div>
                    <h4 className="fw-bold mb-3">Proses Super Cepat</h4>
                    <p className="text-muted mb-0">Pesanan dikerjakan secara otomatis dan instan oleh server berkinerja tinggi kami.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100 py-5 px-4 hover-card" style={{ borderRadius: '1.25rem' }}>
                  <div className="card-body">
                    <div className="display-4 mb-4" style={{ color: '#4f46e5' }}>🔗</div>
                    <h4 className="fw-bold mb-3">Multi API Order</h4>
                    <p className="text-muted mb-0">Terhubung dengan banyak provider API, kami mencarikan layanan terbaik dan paling stabil.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100 py-5 px-4 hover-card" style={{ borderRadius: '1.25rem' }}>
                  <div className="card-body">
                    <div className="display-4 mb-4" style={{ color: '#4f46e5' }}>🛡️</div>
                    <h4 className="fw-bold mb-3">Aman & Terpercaya</h4>
                    <p className="text-muted mb-0">Keamanan data terjamin. Tim support kami siap sedia membantu Anda 24/7 tanpa henti.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-dark text-white text-center py-4 mt-auto">
          <div className="container">
            <p className="mb-0 text-white-50" style={{ fontSize: '0.9rem' }}>
              &copy; {new Date().getFullYear()} SMM Hub. All rights reserved. Built with ❤️
            </p>
          </div>
        </footer>

        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmxc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous" />
      </div>
    </>
  );
}
