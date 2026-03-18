import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      addToast('Welcome back to SquintScale', 'success');
      navigate('/upload');
    } catch (error: any) {
      addToast(error?.message || 'Invalid credentials', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    try {
      await signIn('guest@example.com', 'password');
      addToast('Logged in as Guest Explorer', 'info');
      navigate('/upload');
    } catch (error) {
      addToast('Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-primary text-white overflow-hidden font-body">
      <div className="hidden md:flex md:w-1/2 relative bg-bg-secondary p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 to-transparent pointer-events-none" />
        <div className="z-10 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-text-primary shadow-glow-premium flex items-center justify-center font-display font-black text-bg-primary">S</div>
            <span className="text-2xl font-display font-black tracking-tighter uppercase">SQUINT<span className="opacity-20">SCALE</span></span>
          </div>
        </div>
        <div className="z-10 max-w-md">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl lg:text-7xl font-display font-black leading-[0.95] mb-8 uppercase tracking-tighter">
            Initialize <br/><span className="opacity-20">Intelligence</span>
          </motion.h1>
          <p className="text-text-secondary text-xl font-body font-light mb-12 opacity-60">Continue perfecting digital accessibility with SquintScale's neural simulation engine.</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="glass p-6 rounded-3xl border-white/5 bg-white/[0.01]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-text-primary mb-4 shadow-glow-premium"><Lock size={22} /></div>
              <h3 className="font-display font-black uppercase text-xs tracking-tight mb-1">Encrypted</h3>
              <p className="text-[10px] text-text-muted font-technical uppercase tracking-widest opacity-40">Privacy protocol active</p>
            </div>
            <div className="glass p-6 rounded-3xl border-white/5 bg-white/[0.01]">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-text-primary mb-4 shadow-glow-premium"><LogIn size={22} /></div>
              <h3 className="font-display font-black uppercase text-xs tracking-tight mb-1">Synchronized</h3>
              <p className="text-[10px] text-text-muted font-technical uppercase tracking-widest opacity-40">Neural sync ready</p>
            </div>
          </div>
        </div>
        <div className="z-10 flex items-center gap-6 text-[10px] text-text-muted font-technical font-black uppercase tracking-[0.4em] opacity-30">
          <span>v2.2.0-SAAS</span>
          <span className="opacity-40">|</span>
          <span>OPERATIVE_READY</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-4xl font-display font-black uppercase tracking-tighter">Sign In</h2>
            <p className="text-text-secondary text-lg font-body font-light opacity-60">Enter your credentials to access the hub.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <label className="text-[9px] font-technical font-black uppercase tracking-[0.4em] ml-1 text-[#444444] dark:text-[#AAAAAA]">Email Terminal</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@agency.ai" className="w-full h-14 rounded-2xl py-3 px-6 outline-none transition-all font-body text-sm bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-[#F0F0F0] border border-[#D0D0D0] dark:border-[#3A3A3A] focus:border-[#0A0A0A] dark:focus:border-[#F0F0F0] placeholder-[#888888] dark:placeholder-[#555555]" required />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[9px] font-technical font-black uppercase tracking-[0.4em] text-[#444444] dark:text-[#AAAAAA]">Neural Link</label>
                <Link to="#" className="text-[9px] font-technical font-black uppercase tracking-[0.2em] text-text-primary opacity-40 hover:opacity-100">Reset</Link>
              </div>
              <div className="relative group">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-14 rounded-2xl py-3 px-6 outline-none transition-all font-body text-sm bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-[#F0F0F0] border border-[#D0D0D0] dark:border-[#3A3A3A] focus:border-[#0A0A0A] dark:focus:border-[#F0F0F0] placeholder-[#888888] dark:placeholder-[#555555]" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] dark:text-[#888888] transition-colors"><Eye size={18} /></button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-2xl font-display font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 group shadow-panel-premium bg-[#0A0A0A] dark:bg-[#FFFFFF] text-white dark:text-[#0A0A0A] hover:bg-[#2A2A2A] dark:hover:bg-[#E0E0E0] transition-colors">
              Initiate Session <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5 opacity-50"></div></div>
            <div className="relative flex justify-center text-[9px] font-technical font-black uppercase tracking-[0.4em] opacity-30"><span className="bg-bg-primary px-6">Bypass Mode</span></div>
          </div>
          <button type="button" onClick={handleGuestLogin} className="w-full h-14 glass bg-white/[0.01] hover:bg-white/[0.03] border-white/5 rounded-2xl font-display font-black uppercase tracking-[0.2em] text-[10px] transition-all">Guest Access</button>
          <p className="text-center text-[11px] text-text-muted font-body font-light opacity-60">New operative? <Link to="/register" className="text-text-primary font-black hover:underline uppercase tracking-widest ml-1">Create Access</Link></p>
        </div>
      </div>
    </div>
  );
};