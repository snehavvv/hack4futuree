import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Bell, 
  Camera, 
  Lock,
  Database,
  Trash2,
  Copy,
  CheckCircle2,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabaseClient';
import apiClient from '../lib/apiClient';

type TabType = 'profile' | 'security' | 'notifications' | 'storage';

export const SettingsPage: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Profile State
  const [name, setName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState({
    analysis_complete: true,
    weekly_digest: false,
    product_updates: true,
    security_alerts: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Storage State
  const [analysisCount, setAnalysisCount] = useState<number | null>(null);
  const [isClearingAnalyses, setIsClearingAnalyses] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Decommission State
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    // Load notifications from localStorage
    const saved = localStorage.getItem('squintscale_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    }

    // Fetch analysis count
    if (user) {
      supabase.from('analyses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .then(({ count }) => setAnalysisCount(count));
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsUpdating(true);
    try {
      await updateProfile({ displayName: name });
      addToast('Profile updated', 'success');
    } catch (err) {
      addToast('Profile update failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      addToast('Uploading avatar...', 'info');
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      await updateProfile({ avatarUrl: publicUrl });
      addToast('Avatar updated', 'success');
    } catch (err: any) {
      addToast(err.message || 'Avatar upload failed', 'error');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      addToast('Password updated successfully', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast(err.message || 'Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      addToast('Sign out failed', 'error');
    }
  };

  const saveNotifications = (newPrefs?: typeof notifications) => {
    setIsSavingNotifications(true);
    const prefs = newPrefs || notifications;
    localStorage.setItem('squintscale_notifications', JSON.stringify(prefs));
    setTimeout(() => {
      setIsSavingNotifications(false);
      addToast('Preferences saved', 'success');
    }, 500);
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    localStorage.setItem('squintscale_notifications', JSON.stringify(next));
  };

  const handleClearAnalyses = async () => {
    if (!confirm('This will permanently delete ALL your analysis history. Are you sure?')) return;
    
    setIsClearingAnalyses(true);
    try {
      const { data, error } = await supabase.from('analyses').select('id').eq('user_id', user?.id);
      if (error) throw error;

      if (data && data.length > 0) {
        for (const a of data) {
          await apiClient.delete(`/analyses/${a.id}`);
        }
      }
      setAnalysisCount(0);
      addToast('All analyses deleted', 'info');
    } catch (err) {
      addToast('Failed to clear analyses', 'error');
    } finally {
      setIsClearingAnalyses(false);
    }
  };

  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    
    setIsDeletingAccount(true);
    try {
      await apiClient.delete('/user/account');
      await signOut();
      navigate('/login');
    } catch (err) {
      addToast('Account decommission failed', 'error');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-white mb-2">Account Settings</h1>
        <p className="text-text-muted font-body">Manage your operative profile and system preferences.</p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Navigation */}
        <div className="md:col-span-4 space-y-2">
          {[
            { id: 'profile' as const, label: 'Profile Control', icon: User },
            { id: 'security' as const, label: 'Security & Keys', icon: Shield },
            { id: 'notifications' as const, label: 'Notifications', icon: Bell },
            { id: 'storage' as const, label: 'Storage & API', icon: Database },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-display font-bold transition-all border
                ${activeTab === item.id 
                  ? 'glass bg-cyan/10 text-cyan border-cyan/20 shadow-[0_0_20px_rgba(0,229,255,0.1)]' 
                  : 'text-text-muted hover:bg-white/5 hover:text-text-primary border-transparent'}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-8 space-y-8">
          {activeTab === 'profile' && (
            <section className="glass p-8 border-white/5 space-y-8">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan to-purple overflow-hidden border-2 border-white/10 group-hover:border-cyan/50 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-display font-bold text-bg-base">{user?.displayName?.[0] || 'O'}</span>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2.5 rounded-full glass bg-white/10 border border-white/20 text-white hover:text-cyan transition-colors shadow-lg"
                  >
                    <Camera size={16} />
                  </button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-bold text-white uppercase tracking-tight">Public Profile</h3>
                  <p className="text-xs text-text-muted font-body opacity-60">Your avatar and handle are visible across the telemetry system.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6 pt-4">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono font-black text-text-muted tracking-[0.3em] pl-1 opacity-50">Display Handle</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-input font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-mono font-black text-text-muted tracking-[0.3em] pl-1 opacity-50">Email Node</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled
                      className="glass-input font-mono opacity-30 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    disabled={isUpdating || name === user?.displayName}
                    className="btn btn-primary px-10 py-4 text-xs font-black uppercase tracking-[0.2em] shadow-glow-accent"
                  >
                    {isUpdating ? 'Synchronizing...' : 'Update Settings'}
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="space-y-8">
              <div className="glass p-8 border-white/5 space-y-8">
                <div className="flex items-center gap-4 text-white">
                  <Lock size={20} className="text-cyan" />
                  <h3 className="text-xl font-display font-bold uppercase tracking-tight">Access Control</h3>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono font-black text-text-muted tracking-[0.3em] pl-1 opacity-50">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="glass-input"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono font-black text-text-muted tracking-[0.3em] pl-1 opacity-50">Confirm Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="glass-input"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  {passwordError && <p className="text-xs text-danger font-mono font-bold uppercase tracking-tighter">{passwordError}</p>}
                  
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isUpdatingPassword || !newPassword}
                      className="btn btn-primary px-10 py-4 text-xs font-black uppercase tracking-[0.2em]"
                    >
                      {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="glass p-8 border-white/5 space-y-6">
                 <div className="flex items-center gap-4 text-white">
                    <RefreshCw size={20} className="text-purple" />
                    <h3 className="text-xl font-display font-bold uppercase tracking-tight">Active Sessions</h3>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Current Terminal</p>
                    <p className="text-xs text-text-muted opacity-60">{user?.email}</p>
                  </div>
                  <button 
                    onClick={handleLogoutAllDevices}
                    className="flex items-center gap-3 px-5 py-3 rounded-xl glass border-white/10 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-all"
                  >
                    <LogOut size={16} /> Sign out devices
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="glass p-8 border-white/5 space-y-8">
              <div className="flex items-center gap-4 text-white">
                <Bell size={20} className="text-cyan" />
                <h3 className="text-xl font-display font-bold uppercase tracking-tight">Signal Preferences</h3>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'analysis_complete', title: 'Analysis Complete', desc: 'Notify when your analysis finishes processing.' },
                  { id: 'weekly_digest', title: 'Weekly Digest', desc: 'Summary of your analysis history each week.' },
                  { id: 'product_updates', title: 'Product Updates', desc: 'New features and system improvements.' },
                  { id: 'security_alerts', title: 'Security Alerts', desc: 'Unusual login activity on your account.' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs text-text-muted opacity-50">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => handleToggleNotification(item.id as any)}
                      className={`
                        w-12 h-6 rounded-full p-1 transition-all duration-300
                        ${notifications[item.id as keyof typeof notifications] ? 'bg-cyan' : 'bg-white/10'}
                      `}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${notifications[item.id as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => saveNotifications()}
                  disabled={isSavingNotifications}
                  className="btn btn-primary px-10 py-4 text-xs font-black uppercase tracking-[0.2em]"
                >
                  {isSavingNotifications ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </section>
          )}

          {activeTab === 'storage' && (
            <section className="space-y-8">
              <div className="glass p-8 border-white/5 space-y-8">
                <div className="flex items-center gap-4 text-white">
                  <Database size={20} className="text-cyan" />
                  <h3 className="text-xl font-display font-bold uppercase tracking-tight">System Storage</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                   <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
                      <p className="text-3xl font-display font-black text-white">{analysisCount ?? '--'}</p>
                      <p className="text-[10px] font-mono font-black text-text-muted uppercase tracking-[0.2em] opacity-50">Analyses Stored</p>
                   </div>
                   <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-4">
                      <button 
                        onClick={handleClearAnalyses}
                        disabled={isClearingAnalyses || analysisCount === 0}
                        className="flex items-center gap-3 px-6 py-4 rounded-xl bg-danger/10 border border-danger/20 text-danger hover:bg-danger hover:text-white transition-all text-xs font-black uppercase tracking-widest disabled:opacity-30"
                      >
                        <Trash2 size={16} /> {isClearingAnalyses ? 'Purging...' : 'Clear Archives'}
                      </button>
                   </div>
                </div>
              </div>

              <div className="glass p-8 border-white/5 space-y-6">
                <div className="flex items-center gap-4 text-white">
                  <Lock size={20} className="text-purple" />
                  <h3 className="text-xl font-display font-bold uppercase tracking-tight">API Integration</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-text-muted opacity-60">Use your unique identifier for direct API access and integration.</p>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                    <code className="text-[10px] font-mono text-cyan truncate flex-1">{user?.id}</code>
                    <button 
                      onClick={handleCopyUserId}
                      className="p-2.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-cyan transition-all"
                    >
                      {copiedId ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Account Danger Zone */}
          <section className="glass p-8 bg-danger/5 border border-danger/20 space-y-6">
            <div className="flex items-center gap-4 text-danger">
              <Lock size={20} />
              <h3 className="text-xl font-display font-bold uppercase tracking-tight">Decommission Zone</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-bold text-white">Delete operative profile and all data history.</p>
                <p className="text-xs text-text-muted opacity-60 leading-relaxed font-body">This will permanently delete your account, all results, and uploaded images. Type <span className="text-danger font-mono font-black">DELETE</span> below to confirm.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="TYPE 'DELETE' TO CONFIRM"
                  className="glass-input flex-1 font-mono text-xs uppercase tracking-[0.2em] border-danger/20 focus:border-danger/50 bg-danger/5 text-danger"
                />
                <button 
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteConfirm !== 'DELETE'}
                  className="btn bg-danger text-white py-4 px-10 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,59,48,0.2)] disabled:opacity-30 disabled:grayscale transition-all"
                >
                  {isDeletingAccount ? 'Purging Core...' : 'Decommission'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
