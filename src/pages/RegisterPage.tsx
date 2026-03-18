import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { confirmEmail: needsConfirmation } = await signUp(email, password, name);
      if (needsConfirmation) {
        setConfirmEmail(true);
        addToast('Check your email to confirm your account', 'info');
      } else {
        addToast('Account initialized successfully', 'success');
        navigate('/upload');
      }
    } catch (error: any) {
      addToast(error?.message || 'Registration failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-primary text-white overflow-hidden font-body">
      <div className="hidden md:flex md:w-1/2 relative bg-bg-secondary p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple/20 to-transparent pointer-events-none" />
        <div className="z-10 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-text-primary shadow-glow-premium flex items-center justify-center font-display font-black text-bg-primary">S</div>
            <span className="text-2xl font-display font-black tracking-tighter uppercase">SQUINT<span className="opacity-20">SCALE</span></span>
          </div>
        </div>
        <div className="z-10 max-w-md">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl lg:text-7xl font-display font-black leading-[0.95] mb-8 uppercase tracking-tighter">
            Join the <br/><span className="opacity-20 text-white">Future</span>
          </motion.h1>
          <p className="text-text-secondary text-xl font-body font-light mb-12 opacity-60">Register your profile in the SquintScale network to unlock advanced intelligence.</p>
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-text-primary shadow-glow-premium font-display font-black uppercase text-xs">01</div>
              <div><h3 className="font-display font-black uppercase text-sm tracking-tight mb-1 text-text-primary">Global Standards</h3><p className="text-[10px] text-text-muted font-technical uppercase tracking-widest opacity-40">Aligned with WCAG 2.2</p></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-text-primary shadow-glow-premium font-display font-black uppercase text-xs">02</div>
              <div><h3 className="font-display font-black uppercase text-sm tracking-tight mb-1 text-text-primary">Neural Simulation</h3><p className="text-[10px] text-text-muted font-technical uppercase tracking-widest opacity-40">8+ Vision intelligence modes</p></div>
            </div>
          </div>
        </div>
        <div className="z-10 flex items-center gap-6 text-[10px] text-text-muted font-technical font-black uppercase tracking-[0.4em] opacity-30">
          <span>SEC_LEVEL_3</span>
          <span className="opacity-40">|</span>
          <span>ENCRYPTION_READY</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm space-y-8">
          {confirmEmail ? (
            <>
              <div className="text-center md:text-left space-y-4">
                <h2 className="text-4xl font-display font-black uppercase tracking-tighter">Check Email</h2>
                <p className="text-text-secondary text-lg font-body font-light opacity-60">
                  We sent a confirmation link to <span className="text-text-primary font-semibold">{email}</span>. Click the link in the email to activate your account.
                </p>
              </div>
              <Link to="/login" className="w-full h-16 btn btn-primary rounded-2xl font-display font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 group shadow-panel-premium">
                Return to Login <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </>
          ) : (
            <>
              <div className="text-center md:text-left space-y-4">
                <h2 className="text-4xl font-display font-black uppercase tracking-tighter">Initialize</h2>
                <p className="text-text-secondary text-lg font-body font-light opacity-60">Register within the SquintScale network.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <label className="text-[9px] font-technical font-black uppercase tracking-[0.4em] ml-1 text-[#444444] dark:text-[#AAAAAA]">Operative Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent Smith" className="w-full h-14 rounded-2xl py-3 px-6 outline-none transition-all font-body text-sm bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-[#F0F0F0] border border-[#D0D0D0] dark:border-[#3A3A3A] focus:border-[#0A0A0A] dark:focus:border-[#F0F0F0] placeholder-[#888888] dark:placeholder-[#555555]" required />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-technical font-black uppercase tracking-[0.4em] ml-1 text-[#444444] dark:text-[#AAAAAA]">Email Terminal</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@agency.ai" className="w-full h-14 rounded-2xl py-3 px-6 outline-none transition-all font-body text-sm bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-[#F0F0F0] border border-[#D0D0D0] dark:border-[#3A3A3A] focus:border-[#0A0A0A] dark:focus:border-[#F0F0F0] placeholder-[#888888] dark:placeholder-[#555555]" required />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-technical font-black uppercase tracking-[0.4em] ml-1 text-[#444444] dark:text-[#AAAAAA]">Access Key</label>
                  <div className="relative group">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-14 rounded-2xl py-3 px-6 outline-none transition-all font-body text-sm bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-[#F0F0F0] border border-[#D0D0D0] dark:border-[#3A3A3A] focus:border-[#0A0A0A] dark:focus:border-[#F0F0F0] placeholder-[#888888] dark:placeholder-[#555555]" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[#666666] dark:text-[#888888] transition-colors"><Eye size={18} /></button>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-2xl font-display font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 group shadow-panel-premium bg-[#0A0A0A] dark:bg-[#FFFFFF] text-white dark:text-[#0A0A0A] hover:bg-[#2A2A2A] dark:hover:bg-[#E0E0E0] transition-colors">
                  Initialize Profile <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </form>
              <p className="text-center text-[11px] text-text-muted font-body font-light opacity-60">Already have credentials? <Link to="/login" className="text-text-primary font-black hover:underline uppercase tracking-widest ml-1">Sign In</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};