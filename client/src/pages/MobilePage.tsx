import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const API_BASE_URL = window.location.origin;

// Flying Parcels Animation Component
const FlyingParcels = () => {
  const parcelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createParcel = () => {
      if (!parcelsRef.current) return;

      const parcel = document.createElement('div');
      parcel.textContent = '📦';
      parcel.style.cssText = `
        position: absolute;
        font-size: 24px;
        pointer-events: none;
        z-index: 1;
        left: ${Math.random() * window.innerWidth}px;
        top: -50px;
        animation: fall 8s linear forwards;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      `;

      parcelsRef.current.appendChild(parcel);

      setTimeout(() => {
        if (parcel.parentNode) {
          parcel.parentNode.removeChild(parcel);
        }
      }, 8000);
    };

    const interval = setInterval(createParcel, 1500);

    // Add CSS animation if not already added
    if (!document.querySelector('#parcel-animation')) {
      const style = document.createElement('style');
      style.id = 'parcel-animation';
      style.textContent = `
        @keyframes fall {
          to {
            transform: translateY(${window.innerHeight + 100}px);
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div ref={parcelsRef} className="fixed inset-0 pointer-events-none z-10" />
  );
};

export default function MobilePage() {
  const [, setLocation] = useLocation();
  const [currentScreen, setCurrentScreen] = useState<
    'login' | 'register' | 'otp' | 'success'
  >('login');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterData>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [otpCode, setOtpCode] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkExistingToken();
  }, []);

  const checkExistingToken = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch(
          `${API_BASE_URL}/api/mobile/auth/verify-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('authToken');
    } finally {
      setInitializing(false);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      alert('გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('authToken', result.token);
        setUser(result.user);
        setIsLoggedIn(true);
      } else {
        alert('შეცდომა: ' + (result.message || 'შესვლა ვერ მოხერხდა'));
      }
    } catch (error) {
      alert('ქსელის შეცდომა');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (
      !registerForm.username ||
      !registerForm.email ||
      !registerForm.phone ||
      !registerForm.password ||
      !registerForm.confirmPassword
    ) {
      alert('გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      alert('პაროლები არ ემთხვევა');
      return;
    }

    if (!registerForm.terms) {
      alert('გთხოვთ დაეთანხმოთ წესებს და პირობებს');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });

      const result = await response.json();
      if (response.ok) {
        setPendingPhone(registerForm.phone);
        setCurrentScreen('otp');
        alert('ვერიფიკაციის კოდი გაიგზავნა თქვენს ტელეფონზე');
      } else {
        alert('შეცდომა: ' + (result.message || 'რეგისტრაცია ვერ მოხერხდა'));
      }
    } catch (error) {
      alert('ქსელის შეცდომა');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otpCode || otpCode.length !== 6) {
      alert('გთხოვთ შეიყვანოთ 6-ნიშნა კოდი');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/mobile/auth/verify-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: pendingPhone, code: otpCode }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setCurrentScreen('success');
        setTimeout(() => {
          setCurrentScreen('login');
          setOtpCode('');
          setPendingPhone('');
          setRegisterForm({
            username: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            terms: false,
          });
        }, 3000);
      } else {
        alert('შეცდომა: ' + (result.message || 'ვერიფიკაციის კოდი არასწორია'));
      }
    } catch (error) {
      alert('ქსელის შეცდომა');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsLoggedIn(false);
  };

  // Loading screen
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <img
            src="https://gamoiwere.ge/assets/Asset%2023@4x-DOSuFs2H.png"
            alt="GAMOIWERE"
            className="w-48 h-24 mx-auto mb-4 object-contain filter drop-shadow-lg"
          />
          <p
            className="text-white text-lg font-medium"
            style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
          >
            იტვირთება...
          </p>
        </div>
      </div>
    );
  }

  // Success screen for logged in users
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="text-center">
          <img
            src="https://gamoiwere.ge/assets/Asset%2023@4x-DOSuFs2H.png"
            alt="GAMOIWERE"
            className="w-48 h-24 mx-auto mb-8 object-contain filter drop-shadow-lg"
          />

          <h1
            className="text-white text-3xl font-bold mb-4"
            style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
          >
            მოგესალმებით!
          </h1>
          <p className="text-purple-200 text-xl mb-8">
            {user?.full_name || user?.username}
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-center">
            <p className="text-green-300 text-lg mb-2">
              ✓ წარმატებით შეხვედით სისტემაში
            </p>
            <p className="text-purple-200">
              თქვენ ახლა გაქვთ წვდომა ყველა ფუნქციაზე
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-medium hover:bg-white/30 transition-all duration-200"
          >
            გასვლა
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 relative overflow-hidden">
      {/* Flying Parcels Animation */}
      <FlyingParcels />

      <div className="min-h-screen flex items-center justify-center p-4 relative z-20">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-12">
            <img
              src="https://gamoiwere.ge/assets/Asset%2023@4x-DOSuFs2H.png"
              alt="GAMOIWERE"
              className="w-64 h-32 mx-auto mb-4 object-contain filter drop-shadow-lg"
            />
            <p
              className="text-white text-lg font-medium"
              style={{ letterSpacing: '2px' }}
            >
              იშოპინგე მარტივად
            </p>
          </div>

          {/* Login Form */}
          {currentScreen === 'login' && (
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="მომხმარებლის სახელი ან ელ-ფოსტა"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{ letterSpacing: '1px' }}
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="პაროლი"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{ letterSpacing: '1px' }}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-white text-purple-700 p-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all duration-200 disabled:opacity-50"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                {loading ? 'შესვლა...' : 'შესვლა'}
              </button>

              <button
                onClick={() => setCurrentScreen('register')}
                className="w-full text-white text-center py-2 hover:text-purple-200 transition-colors duration-200"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                არ გაქვთ ანგარიში? რეგისტრაცია
              </button>
            </div>
          )}

          {/* Register Form */}
          {currentScreen === 'register' && (
            <div className="space-y-4">
              <h2
                className="text-white text-2xl font-bold text-center mb-6"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                რეგისტრაცია
              </h2>

              <input
                type="text"
                placeholder="მომხმარებლის სახელი"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, username: e.target.value })
                }
                className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                style={{ letterSpacing: '1px' }}
              />

              <input
                type="email"
                placeholder="ელ-ფოსტა"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
                className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                style={{ letterSpacing: '1px' }}
              />

              <input
                type="tel"
                placeholder="ტელეფონის ნომერი (+995555123456)"
                value={registerForm.phone}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, phone: e.target.value })
                }
                className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                style={{ letterSpacing: '1px' }}
              />

              <input
                type="password"
                placeholder="პაროლი"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                style={{ letterSpacing: '1px' }}
              />

              <input
                type="password"
                placeholder="პაროლის დადასტურება"
                value={registerForm.confirmPassword}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                style={{ letterSpacing: '1px' }}
              />

              <label className="flex items-center space-x-3 text-white">
                <input
                  type="checkbox"
                  checked={registerForm.terms}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      terms: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                />
                <span style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}>
                  ვეთანხმები წესებს და პირობებს
                </span>
              </label>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-white text-purple-700 p-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all duration-200 disabled:opacity-50"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                {loading ? 'რეგისტრაცია...' : 'რეგისტრაცია'}
              </button>

              <button
                onClick={() => setCurrentScreen('login')}
                className="w-full text-white text-center py-2 hover:text-purple-200 transition-colors duration-200"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                უკან დაბრუნება
              </button>
            </div>
          )}

          {/* OTP Verification */}
          {currentScreen === 'otp' && (
            <div className="space-y-6">
              <h2
                className="text-white text-2xl font-bold text-center mb-6"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                ვერიფიკაციის კოდი
              </h2>

              <p
                className="text-purple-200 text-center mb-6"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                შეიყვანეთ კოდი რომელიც გაიგზავნა ნომერზე {pendingPhone}
              </p>

              <input
                type="text"
                placeholder="6-ნიშნა კოდი"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30 text-center text-2xl tracking-widest"
                style={{ fontFamily: 'monospace' }}
                maxLength={6}
              />

              <button
                onClick={handleOtpVerification}
                disabled={loading}
                className="w-full bg-white text-purple-700 p-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all duration-200 disabled:opacity-50"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                {loading ? 'ვერიფიკაცია...' : 'ვერიფიკაცია'}
              </button>

              <button
                onClick={() => setCurrentScreen('register')}
                className="w-full text-white text-center py-2 hover:text-purple-200 transition-colors duration-200"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                უკან დაბრუნება
              </button>
            </div>
          )}

          {/* Success Screen */}
          {currentScreen === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-4xl">✓</span>
              </div>
              <h2
                className="text-white text-2xl font-bold"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                რეგისტრაცია წარმატებულია!
              </h2>
              <p
                className="text-purple-200"
                style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
              >
                თქვენი ანგარიში შეიქმნა. ახლა შეგიძლიათ შეხვიდეთ სისტემაში.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8">
            <p
              className="text-purple-200 text-sm"
              style={{ fontFamily: 'MarkGEOCAPS-Regular, sans-serif' }}
            >
              © 2025 GAMOIWERE.GE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
