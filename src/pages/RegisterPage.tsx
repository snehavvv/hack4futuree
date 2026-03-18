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
        navigate('/dashboard');
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
        <div className="z-10 max-w-2xl">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-6xl lg:text-8xl xl:text-[7rem] font-display font-black leading-[0.9] mb-10 uppercase tracking-tighter mix-blend-plus-lighter">
            Join the <br/><span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">Future</span>
          </motion.h1>
          <p className="text-text-secondary text-2xl lg:text-3xl font-body font-light mb-16 opacity-70 leading-relaxed max-w-xl">Register your profile in the SquintScale network to unlock advanced intelligence.</p>
          <div className="space-y-10">
            <motion.div whileHover={{ scale: 1.05, x: 10 }} className="flex items-center gap-8 cursor-none data-cursor='01'">
              <div className="w-16 h-16 rounded-[24px] glass flex items-center justify-center text-text-primary shadow-glow-premium font-display font-black uppercase text-sm border-white/10">01</div>
              <div><h3 className="font-display font-black uppercase text-base tracking-tight mb-1 text-text-primary text-glow">Global Standards</h3><p className="text-[11px] text-text-muted font-technical uppercase tracking-[0.2em] opacity-50">Aligned with WCAG 2.2</p></div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, x: 10 }} className="flex items-center gap-8 cursor-none data-cursor='02'">
              <div className="w-16 h-16 rounded-[24px] glass flex items-center justify-center text-text-primary shadow-glow-premium font-display font-black uppercase text-sm border-white/10">02</div>
              <div><h3 className="font-display font-black uppercase text-base tracking-tight mb-1 text-text-primary text-glow">Neural Simulation</h3><p className="text-[11px] text-text-muted font-technical uppercase tracking-[0.2em] opacity-50">8+ Vision intelligence modes</p></div>
            </motion.div>
          </div>
        </div>
        <div className="z-10 flex items-center gap-6 text-[10px] text-text-muted font-technical font-black uppercase tracking-[0.4em] opacity-30">
          <span>SEC_LEVEL_3</span>
          <span className="opacity-40">|</span>
          <span>ENCRYPTION_READY</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 lg:p-24 relative z-10">
        <div className="w-full max-w-xl space-y-12">
          {confirmEmail ? (
            <div className="space-y-8">
              <div className="text-center md:text-left space-y-4">
                <h2 className="text-5xl font-display font-black uppercase tracking-tighter">Check Email</h2>
                <p className="text-text-secondary text-xl font-body font-light opacity-60 leading-relaxed">
                  We sent a confirmation link to <span className="text-text-primary font-bold">{email}</span>. <br/>Check your terminal to activate your operative profile.
                </p>
              </div>
              <Link to="/login" className="w-full h-20 glass bg-white/[0.05] border-white/10 hover:border-white/20 rounded-3xl font-display font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 group transition-all">
                Return to Login <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center md:text-left space-y-4 mb-4">
                <h2 className="text-5xl lg:text-6xl font-display font-black uppercase tracking-tighter">Initialize</h2>
                <p className="text-text-secondary text-xl font-body font-light opacity-60">Register within the SquintScale network.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[11px] font-technical font-black uppercase tracking-[0.4em] text-text-muted ml-2 opacity-50">Operative Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent Smith" className="w-full h-16 lg:h-20 glass bg-white/[0.01] border-white/10 hover:border-white/20 rounded-3xl py-4 px-8 focus:border-white/40 focus:bg-white/[0.02] outline-none transition-all font-body text-lg shadow-inner cursor-none" required />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-technical font-black uppercase tracking-[0.4em] text-text-muted ml-2 opacity-50">Email Terminal</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@agency.ai" className="w-full h-16 lg:h-20 glass bg-white/[0.01] border-white/10 hover:border-white/20 rounded-3xl py-4 px-8 focus:border-white/40 focus:bg-white/[0.02] outline-none transition-all font-body text-lg shadow-inner cursor-none" required />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-technical font-black uppercase tracking-[0.4em] text-text-muted ml-2 opacity-50">Access Key</label>
                  <div className="relative group">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-16 lg:h-20 glass bg-white/[0.01] border-white/10 hover:border-white/20 rounded-3xl py-4 px-8 focus:border-white/40 focus:bg-white/[0.02] outline-none transition-all font-body text-lg shadow-inner cursor-none" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-none"><Eye size={24} /></button>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full h-20 mt-4 btn btn-primary rounded-3xl font-display font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 group shadow-panel-premium hover:scale-[1.02] transition-all cursor-none">
                  Initialize Profile <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </form>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10 opacity-50"></div></div>
              </div>
              <p className="text-center text-sm text-text-muted font-body font-light opacity-80 pt-4">Already have credentials? <Link to="/login" className="text-text-primary font-black hover:underline uppercase tracking-widest ml-1 cursor-none">Sign In</Link></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};