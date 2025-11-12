import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Bell, BellOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Alert {
  id: string;
  trader_wallet: string;
  alert_type: string;
  threshold: number;
  telegram_chat_id: string;
  is_active: boolean;
  created_at: string;
  trader_name?: string;
}

export default function AlertsPage() {
  const { user, signOut } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [traderWallet, setTraderWallet] = useState('');
  const [alertType, setAlertType] = useState('trade');
  const [threshold, setThreshold] = useState('1000');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAlerts();
    }
  }, [user]);

  async function fetchAlerts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch trader names
      if (data && data.length > 0) {
        const wallets = [...new Set(data.map(a => a.trader_wallet))];
        const { data: traders } = await supabase
          .from('traders')
          .select('wallet_address, name')
          .in('wallet_address', wallets);

        const alertsWithNames = data.map(alert => ({
          ...alert,
          trader_name: traders?.find(t => t.wallet_address === alert.trader_wallet)?.name || 'Unknown'
        }));

        setAlerts(alertsWithNames);
      } else {
        setAlerts(data || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAlert(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);

    try {
      const { error } = await supabase
        .from('alerts')
        .insert({
          user_id: user?.id,
          trader_wallet: traderWallet,
          alert_type: alertType,
          threshold: parseFloat(threshold),
          telegram_chat_id: telegramChatId || null,
          is_active: true
        });

      if (error) throw error;

      // Reset form
      setTraderWallet('');
      setAlertType('trade');
      setThreshold('1000');
      setTelegramChatId('');
      setShowAddForm(false);

      // Refresh alerts
      fetchAlerts();
    } catch (error: any) {
      console.error('Error adding alert:', error);
      alert('Failed to add alert: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleAlert(alertId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);

      if (error) throw error;

      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_active: !currentStatus } : alert
      ));
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  }

  async function handleDeleteAlert(alertId: string) {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      // Update local state
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  }

  const alertTypeLabels: Record<string, string> = {
    'trade': 'Trade Baru',
    'profit': 'Profit Threshold',
    'loss': 'Loss Threshold',
    'volume': 'Volume Threshold'
  };

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
              to="/settings" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
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

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Alert Saya</h1>
            <p className="text-muted-foreground">
              Manage notifications for traders you monitor
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tambah Alert
          </button>
        </div>

        {showAddForm && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Tambah Alert Baru</h3>
            <form onSubmit={handleAddAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Wallet Address Trader
                </label>
                <input
                  type="text"
                  value={traderWallet}
                  onChange={(e) => setTraderWallet(e.target.value)}
                  required
                  placeholder="0x..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipe Alert
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="trade">Trade Baru</option>
                  <option value="profit">Profit Threshold</option>
                  <option value="loss">Loss Threshold</option>
                  <option value="volume">Volume Threshold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Threshold ($)
                </label>
                <input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  required
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Telegram Chat ID (opsional)
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="Leave empty if not using Telegram"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save Alert'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-background hover:bg-muted border border-border rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No alerts created yet
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-block bg-primary hover:bg-primary-hover text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Buat Alert Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="bg-card border border-border rounded-lg p-6 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {alert.is_active ? (
                      <Bell className="w-5 h-5 text-primary" />
                    ) : (
                      <BellOff className="w-5 h-5 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold">{alert.trader_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${alert.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {alert.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Tipe: {alertTypeLabels[alert.alert_type] || alert.alert_type}</p>
                    <p>Threshold: ${alert.threshold.toLocaleString()}</p>
                    {alert.telegram_chat_id && (
                      <p>Telegram: {alert.telegram_chat_id}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                    className="px-4 py-2 bg-background hover:bg-muted border border-border rounded-lg transition-colors"
                  >
                    {alert.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
