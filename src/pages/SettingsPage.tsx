import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Camera, 
  Lock,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState(user?.displayName || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile({ displayName: name });
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast('Profile update failed', 'error');
    } finally {
      setIsUpdating(false);
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
            { label: 'Profile Control', icon: User, active: true },
            { label: 'Security & Keys', icon: Shield },
            { label: 'Notifications', icon: Bell },
            { label: 'Storage & API', icon: Database },
          ].map((item, i) => (
            <button 
              key={i}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-display font-bold transition-all border
                ${item.active 
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
          {/* Profile Section */}
          <section className="glass p-6 border-white/5 space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan to-purple overflow-hidden border-2 border-white/10 group-hover:border-cyan/50 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.2)]">
                   {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-display font-bold text-bg-base">{user?.displayName?.[0] || 'O'}</span>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full glass bg-white/10 border border-white/20 text-white hover:text-cyan transition-colors shadow-lg">
                  <Camera size={14} />
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold text-white">Public Profile</h3>
                <p className="text-xs text-text-muted font-body">Avatar and name are visible across the system.</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-bold text-text-muted tracking-[0.2em] pl-1">Display Handle</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input font-body"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono font-bold text-text-muted tracking-[0.2em] pl-1">Email Node</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled
                    className="glass-input font-mono opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={isUpdating || name === user?.displayName}
                  className="btn btn-primary px-8"
                >
                  {isUpdating ? 'Saving...' : 'Update Settings'}
                </button>
              </div>
            </form>
          </section>

          {/* Account Danger Zone */}
          <section className="glass p-6 bg-danger/5 border border-danger/20 space-y-4">
            <div className="flex items-center gap-3 text-danger">
              <Lock size={18} />
              <h3 className="text-sm font-display font-bold uppercase tracking-[0.2em]">Strict Security Zone</h3>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-display font-bold text-white">Decommission Account</p>
                <p className="text-xs text-text-muted font-body">Permanently delete all analysis data and operative profile.</p>
              </div>
              <button className="btn bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white py-2 px-4 text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all">
                Delete
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
