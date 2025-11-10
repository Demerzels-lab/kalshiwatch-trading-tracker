import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Send, Link as LinkIcon, Unlink, Bell, Users, User, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TelegramConnection {
  id: string;
  telegram_user_id: string;
  chat_id: string;
  username: string;
  first_name: string;
  last_name: string;
  chat_type: string;
  group_title: string | null;
  is_active: boolean;
  connected_at: string;
  notification_count: number;
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [telegramConnections, setTelegramConnections] = useState<TelegramConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showGroupInstructions, setShowGroupInstructions] = useState(false);
  const [groupChatId, setGroupChatId] = useState('');
  const [groupTitle, setGroupTitle] = useState('');
  const [connectingGroup, setConnectingGroup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const BOT_USERNAME = '@kalshiwatch_bot';

  useEffect(() => {
    if (user) {
      fetchTelegramConnections();
    }
  }, [user]);

  async function fetchTelegramConnections() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('telegram_connections')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('connected_at', { ascending: false });

      if (error) throw error;
      setTelegramConnections(data || []);
    } catch (error) {
      console.error('Error fetching Telegram connections:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect(connectionId: string, chatType: string, chatId: string) {
    const confirmMsg = chatType === 'private'
      ? 'Apakah Anda yakin ingin disconnect Telegram personal chat? Anda tidak akan menerima notifikasi lagi.'
      : 'Apakah Anda yakin ingin disconnect grup Telegram ini?';

    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('disconnect-telegram', {
        body: { user_id: user?.id, chat_id: chatId }
      });

      if (error) throw error;

      // Remove from local state
      setTelegramConnections(prev => prev.filter(conn => conn.id !== connectionId));
      alert('Telegram berhasil di-disconnect');
    } catch (error: any) {
      console.error('Error disconnecting Telegram:', error);
      alert('Gagal disconnect Telegram: ' + error.message);
    }
  }

  async function handleConnectGroup() {
    if (!groupChatId.trim()) {
      alert('Silakan masukkan Chat ID grup');
      return;
    }

    try {
      setConnectingGroup(true);
      
      const { error } = await supabase.functions.invoke('connect-telegram', {
        body: {
          user_id: user?.id,
          chat_id: groupChatId.trim(),
          chat_type: 'group',
          group_title: groupTitle.trim() || 'Telegram Group',
          telegram_user_id: null,
          username: null,
          first_name: null,
          last_name: null
        }
      });

      if (error) throw error;

      alert('Grup berhasil terhubung! Bot akan mengirim pesan konfirmasi ke grup.');
      setGroupChatId('');
      setGroupTitle('');
      setShowGroupInstructions(false);
      fetchTelegramConnections();
    } catch (error: any) {
      console.error('Error connecting group:', error);
      alert('Gagal menghubungkan grup: ' + error.message);
    } finally {
      setConnectingGroup(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  const personalConnections = telegramConnections.filter(c => c.chat_type === 'private');
  const groupConnections = telegramConnections.filter(c => c.chat_type !== 'private');

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

        {/* Telegram Personal Connection */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Telegram Personal Chat</h2>
                <p className="text-sm text-muted-foreground">
                  Notifikasi personal langsung ke chat Anda
                </p>
              </div>
            </div>
            {personalConnections.length > 0 && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                Connected
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : personalConnections.length > 0 ? (
            <div className="space-y-4">
              {personalConnections.map(conn => (
                <div key={conn.id} className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {conn.first_name} {conn.last_name}
                      </p>
                      {conn.username && (
                        <p className="text-sm text-muted-foreground">
                          @{conn.username}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Connected sejak {new Date(conn.connected_at).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conn.notification_count} notifikasi terkirim
                      </p>
                    </div>
                    <button
                      onClick={() => handleDisconnect(conn.id, conn.chat_type, conn.chat_id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm"
                    >
                      <Unlink className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Hubungkan akun Telegram personal Anda untuk menerima notifikasi langsung.
                </p>
              </div>

              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-semibold transition-colors"
              >
                <LinkIcon className="w-5 h-5" />
                Connect Personal Chat
              </button>

              {showInstructions && (
                <div className="bg-background border border-border rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Cara Menghubungkan Personal Chat:</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <span>
                        Buka Telegram dan cari bot <strong className="font-mono">{BOT_USERNAME}</strong>
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
                        Bot akan memberikan instruksi untuk menghubungkan akun Anda
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
                      <strong className="text-blue-500">Catatan:</strong> Pastikan Bot Token sudah dikonfigurasi oleh administrator.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Telegram Group Connections */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Telegram Group Chats</h2>
                <p className="text-sm text-muted-foreground">
                  Notifikasi ke grup Telegram Anda
                </p>
              </div>
            </div>
            {groupConnections.length > 0 && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {groupConnections.length} Connected
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {groupConnections.map(conn => (
                <div key={conn.id} className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium">{conn.group_title || 'Telegram Group'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Chat ID: {conn.chat_id}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Connected sejak {new Date(conn.connected_at).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conn.notification_count} notifikasi terkirim
                      </p>
                    </div>
                    <button
                      onClick={() => handleDisconnect(conn.id, conn.chat_type, conn.chat_id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm"
                    >
                      <Unlink className="w-4 h-4" />
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-4 mt-4">
                <button
                  onClick={() => setShowGroupInstructions(!showGroupInstructions)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-semibold transition-colors"
                >
                  <LinkIcon className="w-5 h-5" />
                  Connect New Group
                </button>

                {showGroupInstructions && (
                  <div className="bg-background border border-border rounded-lg p-6 space-y-4 mt-4">
                    <h3 className="font-semibold text-lg">Cara Menghubungkan Grup Telegram:</h3>
                    
                    <ol className="space-y-3 text-sm">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          1
                        </span>
                        <span>
                          Tambahkan bot <strong className="font-mono">{BOT_USERNAME}</strong> ke grup Telegram Anda
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          2
                        </span>
                        <span>
                          Di grup, kirim perintah <strong>/connect_kalshiwatch</strong>
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          3
                        </span>
                        <span>
                          Bot akan menampilkan Chat ID grup. Salin Chat ID tersebut
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          4
                        </span>
                        <span>
                          Masukkan Chat ID dan nama grup di form di bawah, lalu klik Connect
                        </span>
                      </li>
                    </ol>

                    <div className="space-y-3 mt-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Chat ID Grup <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={groupChatId}
                            onChange={(e) => setGroupChatId(e.target.value)}
                            placeholder="contoh: -1001234567890"
                            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Chat ID biasanya dimulai dengan tanda minus (-)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Nama Grup (opsional)
                        </label>
                        <input
                          type="text"
                          value={groupTitle}
                          onChange={(e) => setGroupTitle(e.target.value)}
                          placeholder="Trading Group"
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <button
                        onClick={handleConnectGroup}
                        disabled={connectingGroup || !groupChatId.trim()}
                        className="w-full px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {connectingGroup ? 'Menghubungkan...' : 'Connect Group'}
                      </button>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-blue-500">Tips:</strong> Pastikan bot sudah menjadi member grup dan memiliki permission untuk mengirim pesan.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
