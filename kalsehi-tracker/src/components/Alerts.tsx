import { useState, useEffect } from 'react';
import { AlertSetting } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Plus, Trash2, Edit } from 'lucide-react';

export function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertSetting | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    market_ticker: '',
    alert_type: 'price_above' as 'price_above' | 'price_below' | 'volume_threshold' | 'status_change',
    threshold_value: 0,
    is_enabled: true
  });

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alert_settings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAlert = async () => {
    if (!user || !formData.market_ticker.trim()) return;

    try {
      if (editingAlert) {
        // Update existing alert
        const { error } = await supabase
          .from('alert_settings')
          .update({
            market_ticker: formData.market_ticker.toUpperCase(),
            alert_type: formData.alert_type,
            threshold_value: formData.threshold_value,
            is_enabled: formData.is_enabled,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAlert.id);

        if (error) throw error;
      } else {
        // Create new alert
        const { error } = await supabase
          .from('alert_settings')
          .insert({
            user_id: user.id,
            market_ticker: formData.market_ticker.toUpperCase(),
            alert_type: formData.alert_type,
            threshold_value: formData.threshold_value,
            is_enabled: formData.is_enabled
          });

        if (error) throw error;
      }

      resetForm();
      loadAlerts();
    } catch (error: any) {
      console.error('Error saving alert:', error);
      alert('Gagal menyimpan alert: ' + error.message);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alert_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAlerts();
    } catch (error: any) {
      console.error('Error deleting alert:', error);
    }
  };

  const toggleAlert = async (alert: AlertSetting) => {
    try {
      const { error } = await supabase
        .from('alert_settings')
        .update({ is_enabled: !alert.is_enabled })
        .eq('id', alert.id);

      if (error) throw error;
      loadAlerts();
    } catch (error: any) {
      console.error('Error toggling alert:', error);
    }
  };

  const startEdit = (alert: AlertSetting) => {
    setEditingAlert(alert);
    setFormData({
      market_ticker: alert.market_ticker,
      alert_type: alert.alert_type,
      threshold_value: alert.threshold_value,
      is_enabled: alert.is_enabled
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      market_ticker: '',
      alert_type: 'price_above',
      threshold_value: 0,
      is_enabled: true
    });
    setEditingAlert(null);
    setShowAddModal(false);
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'price_above': 'Harga Di Atas',
      'price_below': 'Harga Di Bawah',
      'volume_threshold': 'Volume Mencapai',
      'status_change': 'Perubahan Status'
    };
    return labels[type] || type;
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-white">
            Login Diperlukan
          </h3>
          <p className="mt-2 text-gray-400">
            Silakan login untuk mengatur alert
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Alerts</h1>
            <p className="mt-2 text-gray-400">
              Atur notifikasi untuk perubahan market
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Tambah Alert
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Memuat alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-white">
              Belum Ada Alert
            </h3>
            <p className="mt-2 text-gray-400">
              Tambahkan alert untuk mendapat notifikasi
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 ${
                  alert.is_enabled
                    ? 'border-gray-800 bg-gray-900'
                    : 'border-gray-800 bg-gray-900 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {alert.market_ticker}
                      </h3>
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        alert.is_enabled
                          ? 'bg-green-900 text-green-300'
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {alert.is_enabled ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      {getAlertTypeLabel(alert.alert_type)}: {alert.threshold_value}
                    </p>
                    {alert.last_triggered_at && (
                      <p className="mt-2 text-xs text-gray-500">
                        Terakhir triggered: {new Date(alert.last_triggered_at).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleAlert(alert)}
                      className="rounded-md bg-gray-800 px-3 py-1 text-sm text-white hover:bg-gray-700"
                    >
                      {alert.is_enabled ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => startEdit(alert)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="w-full max-w-md rounded-lg bg-gray-900 p-6">
              <h2 className="mb-4 text-xl font-bold text-white">
                {editingAlert ? 'Edit Alert' : 'Tambah Alert'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Market Ticker
                  </label>
                  <input
                    type="text"
                    value={formData.market_ticker}
                    onChange={(e) => setFormData({ ...formData, market_ticker: e.target.value })}
                    placeholder="Contoh: INXD-24DEC31"
                    className="mt-1 w-full rounded-md bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Tipe Alert
                  </label>
                  <select
                    value={formData.alert_type}
                    onChange={(e) => setFormData({ ...formData, alert_type: e.target.value as any })}
                    className="mt-1 w-full rounded-md bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="price_above">Harga Di Atas</option>
                    <option value="price_below">Harga Di Bawah</option>
                    <option value="volume_threshold">Volume Mencapai</option>
                    <option value="status_change">Perubahan Status</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Threshold Value
                  </label>
                  <input
                    type="number"
                    value={formData.threshold_value}
                    onChange={(e) => setFormData({ ...formData, threshold_value: parseFloat(e.target.value) })}
                    className="mt-1 w-full rounded-md bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_enabled}
                    onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                    className="h-4 w-4 rounded bg-gray-800"
                  />
                  <label className="text-sm text-gray-300">
                    Aktifkan alert
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveAlert}
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    {editingAlert ? 'Update' : 'Tambah'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-700"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
