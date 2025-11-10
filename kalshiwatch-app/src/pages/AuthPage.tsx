import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (showResetPassword) {
        // Password reset flow
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`
        });
        if (error) throw error;
        
        setSuccessMessage('Email reset password telah dikirim! Silakan cek inbox Anda.');
        setEmail('');
        setShowResetPassword(false);
      } else if (isLogin) {
        // Login flow
        const result = await signIn(email, password);
        
        // Check if email is not confirmed
        if (result.data?.user && !result.data.user.email_confirmed_at) {
          setError('Email belum diverifikasi. Silakan cek inbox Anda untuk link verifikasi.');
          setLoading(false);
          return;
        }
        
        navigate('/watchlist');
      } else {
        // Signup flow
        await signUp(email, password);
        setSuccessMessage('Akun berhasil dibuat! Silakan cek email Anda untuk verifikasi.');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      // Improve error messages
      let errorMessage = err.message || 'Terjadi kesalahan';
      
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Email atau password salah. Pastikan akun sudah diverifikasi.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Email belum diverifikasi. Silakan cek inbox Anda.';
      } else if (errorMessage.includes('User already registered')) {
        errorMessage = 'Email sudah terdaftar. Gunakan form Login atau reset password.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6 md:p-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Kalshiwatch
            </h1>
            <p className="text-muted-foreground">
              {showResetPassword ? 'Reset password Anda' : isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru'}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="nama@email.com"
                />
              </div>

              {!showResetPassword && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Memproses...' : showResetPassword ? 'Kirim Email Reset' : isLogin ? 'Masuk' : 'Daftar'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm space-y-2">
              {!showResetPassword && (
                <>
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-primary hover:underline block w-full"
                  >
                    {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk di sini'}
                  </button>
                  
                  {isLogin && (
                    <button
                      onClick={() => {
                        setShowResetPassword(true);
                        setError('');
                        setSuccessMessage('');
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Lupa password?
                    </button>
                  )}
                </>
              )}

              {showResetPassword && (
                <button
                  onClick={() => {
                    setShowResetPassword(false);
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-primary hover:underline"
                >
                  Kembali ke Login
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
