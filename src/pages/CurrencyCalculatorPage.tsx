/**
 * FEDERAL EXPRESS BRASIL
 * Page: Currency Calculator
 * 
 * Página dedicada para calculadora de conversão de moedas
 */

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CurrencyCalculator from '@/components/CurrencyCalculator';
import { supabase } from '@/utils/supabase';

export default function CurrencyCalculatorPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Verificar autenticação
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || '');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || '');
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigateToHome = () => {
    window.location.href = '/';
  };

  const handleNavigateToLogin = () => {
    window.location.href = '/login';
  };

  const handleNavigateToRegister = () => {
    window.location.href = '/register';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-[#FFFFFF] to-[#EFF6FF]">
      {/* Header Original */}
      <Header
        onNavigateToHome={handleNavigateToHome}
        onNavigateToLogin={handleNavigateToLogin}
        onNavigateToRegister={handleNavigateToRegister}
        currentPage="home"
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
      />

      {/* Main Content */}
      <main className="pt-8 pb-16 px-4">
        <CurrencyCalculator />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 bg-white border-t border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto text-center text-sm text-[#6B7280]">
          <p className="mb-2">
            © {new Date().getFullYear()} Federal Express Brasil - Soluções Migratórias
          </p>
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <a href="/" className="hover:text-[#0A4B9E] transition-colors">
              Home
            </a>
            <span>•</span>
            <a href="/login" className="hover:text-[#0A4B9E] transition-colors">
              Login
            </a>
            <span>•</span>
            <a href="/register" className="hover:text-[#0A4B9E] transition-colors">
              Cadastrar
            </a>
            <span>•</span>
            <a
              href="https://www.exchangerate-api.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0A4B9E] transition-colors"
            >
              API de Câmbio
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

