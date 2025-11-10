import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Send, Link as LinkIcon, Unlink, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TelegramConnection {
  id: string;
  telegram_user_id: string;
  chat_id: string;
  username: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  connected_at: string;
  notification_count: number;
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [telegramConnection, setTelegramConnection] = useState<TelegramConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTelegramConnection();
    }
  }, [user]);

  async function fetchTelegramConnection() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('telegram_connections')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setTelegramConnection(data);
    } catch (error) {
      console.error('Error fetching Telegram connection:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Apakah Anda yakin ingin disconnect Telegram? Anda tidak akan menerima notifikasi lagi.')) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('disconnect-telegram', {
        body: { user_id: user?.id }
      });

      if (error) throw error;

      setTelegramConnection(null);
      alert('Telegram berhasil di-disconnect');
    } catch (error: any) {
      console.error('Error disconnecting Telegram:', error);
      alert('Gagal disconnect Telegram: ' + error.message);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border p-6 md:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-2xl md:text-3xl font-bold text-primary">
            Kalshiwatch
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              to="/watchlist" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Watchlist
            </Link>
            <Link 
              to="/alerts" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Alerts
            </Link>
            <button
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Pengaturan</h1>
          <p className="text-muted-foreground">
            Kelola akun dan preferensi notifikasi Anda
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informasi Akun</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user?.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* Telegram Integration */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Send className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Telegram Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  Terima alert real-time di Telegram
                </p>
              </div>
            </div>
            {telegramConnection && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Connected
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : telegramConnection ? (
            <div className="space-y-4">
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {telegramConnection.first_name} {telegramConnection.last_name}
                    </p>
                    {telegramConnection.username && (
                      <p className="text-sm text-muted-foreground">
                        @{telegramConnection.username}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Connected sejak {new Date(telegramConnection.connected_at).toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {telegramConnection.notification_count} notifikasi terkirim
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm"
                  >
                    <Unlink className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <Bell className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-500 font-medium mb-1">Notifikasi Aktif</p>
                    <p className="text-muted-foreground">
                      Anda akan menerima alert real-time untuk semua trader yang Anda watch. 
                      Kelola preferensi notifikasi di halaman Alerts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Hubungkan akun Telegram Anda untuk menerima notifikasi real-time tentang aktivitas trading.
                </p>
              </div>

              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-semibold transition-colors"
              >
                <LinkIcon className="w-5 h-5" />
                Connect Telegram
              </button>

              {showInstructions && (
                <div className="bg-background border border-border rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Cara Menghubungkan Telegram:</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span>
                        Buka Telegram dan cari bot <strong className="font-mono">@KalshiwatchBot</strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <span>
                        Klik <strong>Start</strong> atau kirim pesan <strong>/start</strong>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <span>
                        Bot akan memberikan link verifikasi. Klik link tersebut untuk menghubungkan akun
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <span>
                        Setelah terhubung, Anda akan menerima konfirmasi dan mulai menerima notifikasi
                      </span>
                    </li>
                  </ol>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-blue-500">Catatan:</strong> Fitur Telegram Bot sedang dalam proses konfigurasi. 
                      Silakan hubungi administrator untuk mendapatkan akses.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
