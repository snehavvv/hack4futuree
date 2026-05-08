import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { KineticText } from '../components/KineticText';
import { RevealText } from '../components/RevealText';
import { FeatureCard } from '../components/FeatureCard';
import { ScrollytellingSection } from '../components/ScrollytellingSection';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // Hero Parallax values - Enhanced for cinematic depth
  const heroY = useTransform(scrollY, [0, 800], [0, 150]);
  const heroScale = useTransform(scrollY, [0, 800], [1, 0.9]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  
  // Benchmarks Parallax
  const benchmarksY = useTransform(scrollY, [1200, 2000], [150, 0]);
  const benchmarksOpacity = useTransform(scrollY, [1200, 1600], [0, 1]);

  return (
    <div className="bg-bg-base text-text-primary selection:bg-white selection:text-bg-primary overflow-x-hidden pt-20">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-[80px] flex items-center justify-between px-8 md:px-20 z-[100] bg-bg-base/80 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="SquintScale Logo" className="w-10 h-10 object-contain shadow-glow-premium rounded-xl" />
          <span className="text-2xl font-display font-medium tracking-tight text-text-primary uppercase font-bold">Squint<span className="opacity-60">Scale</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
          <a href="#features" className="hover:text-text-primary transition-all">Features</a>
          <a href="#benchmarks" className="hover:text-text-primary transition-all">Benchmarks</a>
          <a href="#compliance" className="hover:text-text-primary transition-all">Compliance</a>
        </div>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <button onClick={() => navigate('/login')} className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-text-primary">Login</button>
          <button onClick={() => navigate('/register')} className="btn btn-primary px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-grain">
        {/* Modern Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white blur-[150px] opacity-10"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.05, 0.1, 0.05],
              x: [0, -50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white blur-[120px] opacity-5"
          />
        </div>
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="container mx-auto px-6 relative z-10 pt-20 pb-12 grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-12 lg:gap-24"
        >
          {/* Left Hero Content */}
          <div className="text-center lg:text-left space-y-6 flex flex-col items-center lg:items-start relative z-30 max-w-[500px] lg:mr-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-white/5 text-text-muted text-[10px] font-bold uppercase tracking-[0.4em] mb-4"
            >
              <LucideIcons.ShieldCheck size={12} className="text-text-muted" /> AI-powered design intelligence
            </motion.div>
            
             <div className="overflow-hidden py-4 cursor-none" data-cursor="SCALE">
               <h1 className="text-6xl md:text-8xl lg:text-[5vw] xl:text-[7rem] font-display font-black text-text-primary tracking-tighter max-w-[12ch] mx-auto lg:mx-0 leading-[0.9] uppercase flex justify-center lg:justify-start flex-wrap gap-x-4">
                 <KineticText text="DESIGN FOR THE UNKNOWN" highlightWords={['UNKNOWN']} />
               </h1>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 2, delay: 1.5 }}
                className="text-text-muted block mt-2 uppercase font-mono tracking-widest text-sm text-center lg:text-left"
              >
                Visual.
              </motion.span>
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-xl md:text-2xl text-text-secondary max-w-2xl font-body font-light leading-relaxed opacity-80"
            >
              Scale your digital experiences through the eyes of diverse users. Human-centric accessibility at neural speeds.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 1 }}
              className="flex flex-col sm:flex-row items-center gap-6 pt-4"
            >
              <button 
                onClick={() => navigate('/upload')} 
                data-cursor="INITIATE"
                className="btn btn-primary px-10 py-5 text-xs font-black uppercase tracking-[0.4em] rounded-full group flex items-center gap-4 shadow-glow-premium hover:scale-[1.02] transition-all"
              >
                System Analysis <LucideIcons.ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
              </button>
              <button 
                className="flex items-center gap-4 px-10 py-5 text-xs font-black uppercase tracking-[0.4em] rounded-full glass border-white/5 hover:border-white/20 transition-all text-text-primary group"
                data-cursor="DEMO"
              >
                System Demo <LucideIcons.Play size={16} className="text-text-muted group-hover:text-text-primary transition-colors" />
              </button>
            </motion.div>
          </div>

          {/* Right Hero Card */}
          <div className="flex justify-center lg:justify-end relative z-20">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative group perspective-[2000px] flex justify-center w-full max-w-xl"
            >
              <div className="absolute -inset-40 bg-white/[0.015] blur-[150px] rounded-full pointer-events-none" />
              <motion.div 
                className="glass p-1 text-center relative border-white/10 group-hover:border-white/30 transition-all duration-700 shadow-panel-premium group-hover:shadow-[0_0_80px_rgba(0,255,255,0.1)] rounded-[60px] overflow-hidden animate-scan hover:rotate-1 hover:scale-[1.02]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-bg-surface/50 p-6 lg:p-10 rounded-[58px] border border-white/5 bg-dot-grid relative overflow-hidden flex flex-col font-mono justify-center min-h-[280px] w-[85vw] md:w-[600px] max-w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent z-10" />
                  
                  {/* Floating abstract UI elements representing 'design intelligence' */}
                  <div className="relative z-20 w-full text-left">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-white/10" />
                        <div className="w-3 h-3 rounded-full bg-white/10" />
                        <div className="w-3 h-3 rounded-full bg-white/10" />
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-text-muted font-mono flex items-center gap-2">
                        <LucideIcons.Activity size={12} className="animate-pulse" />
                        Neural Setup Active
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="text-[10px] text-text-muted tracking-widest uppercase">Processing Visual Assets</div>
                        <motion.div 
                          initial={{ width: "0%" }}
                          whileInView={{ width: "100%" }}
                          transition={{ duration: 2.5, ease: "circOut" }}
                          className="h-2 bg-text-primary rounded-full relative overflow-hidden"
                        >
                          <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                        </motion.div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="h-20 bg-white/[0.03] rounded-2xl border border-white/10 col-span-2 relative overflow-hidden p-4 flex flex-col justify-end">
                           <div className="h-2 w-1/3 bg-white/20 rounded-full mb-2" />
                           <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                        </div>
                        <div className="h-20 bg-white/[0.03] rounded-2xl border border-white/10 flex items-center justify-center p-4">
                          <LucideIcons.ScanEye className="text-text-muted opacity-50" size={28} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-radial-at-c from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-12 left-12 flex flex-col gap-6 text-[10px] font-mono tracking-[0.5em] uppercase text-text-muted vertical-text"
        >
          <span>Scroll to uncover</span>
        </motion.div>
      </section>

      {/* Scrollytelling Text Reveal Section (Replaces Horizontal Scroll) */}
      <section id="features" className="relative h-[100vh] bg-bg-surface overflow-x-hidden transition-colors duration-1000">
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
          {/* Background Revealed Text - Pinned to Left */}
          <div className="absolute inset-0 flex items-center justify-start pl-[5vw] pointer-events-none opacity-20">
             <RevealText 
                text="REALITY SIMULATION." 
                className="text-[12vw] font-display font-black tracking-tighter leading-none text-text-primary uppercase text-left max-w-min"
             />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-b from-bg-surface via-transparent to-bg-surface pointer-events-none z-10" />

          {/* Cards floating up beside/over the text */}
          <div className="container mx-auto flex flex-col lg:flex-row items-center justify-end relative z-20 gap-12 lg:gap-32">
             <div className="w-full lg:w-[40%] text-center lg:text-left">
                <p className="text-xl md:text-3xl text-text-secondary leading-relaxed font-body font-light glass p-8 rounded-3xl border-white/10 shadow-2xl backdrop-blur-md">
                  Contrast ratios are only half the battle. Squint Scale simulates cataracts, glare, and age-related vision loss to give you a true perspective on readability.
                </p>
             </div>

             <div className="w-full lg:w-[50%] flex flex-col gap-10">
               {[
                  { title: "Neural Blur Matrix", desc: "Simulate myopia and presbyopia with high-precision neural filters.", icon: LucideIcons.Layers, color: "from-blue-500/20 to-purple-500/20" },
                  { title: "Environmental Exposure", desc: "Test UI durability against varying ambient light conditions.", icon: LucideIcons.Zap, color: "from-yellow-500/20 to-orange-500/20" },
                  { title: "Chromatic Fidelity", desc: "Deuteranopia and protanopia real-time perception filters.", icon: LucideIcons.Palette, color: "from-emerald-500/20 to-cyan-500/20" }
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    viewport={{ margin: "-10%" }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    key={i} 
                    className={`flex flex-col md:flex-row gap-8 p-8 glass bg-gradient-to-br ${item.color} border-white/10 hover:border-white/30 transition-all group rounded-[40px] shadow-2xl cursor-none relative overflow-hidden`} 
                    data-cursor="EXPLORE"
                  >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="w-16 h-16 rounded-[1.5rem] bg-bg-surface/50 flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:scale-110 transition-transform duration-700 shadow-inner z-10">
                      <item.icon size={24} className="text-text-primary" />
                    </div>
                    <div className="flex flex-col justify-center z-10">
                      <h4 className="text-2xl font-display font-bold text-text-primary mb-2">{item.title}</h4>
                      <p className="text-lg text-text-secondary leading-normal font-body font-light opacity-80">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="benchmarks" className="py-40 relative bg-white/[0.01] border-y border-white/5 overflow-hidden">
        <motion.div 
          style={{ y: benchmarksY, opacity: benchmarksOpacity }}
          className="container mx-auto px-6 relative z-10 text-center"
        >
          <div className="max-w-3xl mx-auto space-y-6 mb-24">
            <h2 className="text-5xl font-display font-bold tracking-tight text-text-primary uppercase">Precision Standards.</h2>
            <p className="text-lg text-text-muted font-body font-light tracking-wide uppercase font-bold opacity-60">Engineered for WCAG 2.2 Level AAA compliance.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { label: "Neural Checks", value: "80+" },
              { label: "Vision Presets", value: "24" },
              { label: "Contrast Fidelity", value: "0.001" },
              { label: "Latency", value: "<80ms" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10, 
                  boxShadow: "0 0 40px -10px rgba(255, 255, 255, 0.15)",
                  borderColor: "rgba(255, 255, 255, 0.3)" 
                }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
                className="text-center p-12 glass bg-white/[0.01] border-white/5 transition-colors rounded-[32px] cursor-none relative overflow-hidden group"
                data-cursor="INSPECT"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <motion.div 
                  className="text-5xl md:text-6xl font-mono font-bold text-text-primary mb-4 tracking-tighter relative z-10"
                  whileHover={{ scale: 1.1, textShadow: "0 0 20px rgba(255,255,255,0.4)" }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-text-muted group-hover:text-text-primary transition-colors duration-300 relative z-10">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <ScrollytellingSection mode="vertical">
        <div className="container mx-auto px-6 py-40 flex flex-col lg:flex-row gap-20">
          {/* Left Side: Sticky Text */}
          <div className="lg:w-1/2 lg:sticky lg:top-40 h-fit space-y-12">
            <RevealText 
              text="EMPATHY AT SCALE. AI DESIGN INTELLIGENCE FOR THE MODERN WEB."
              className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.85] uppercase"
            />
            <p className="text-2xl text-text-secondary font-body font-light opacity-60 max-w-md">
              Our neural simulation engine bridges the gap between design intent and human perception.
            </p>
          </div>

          {/* Right Side: Stacking 3D Cards */}
          <div className="lg:w-1/2 flex flex-col gap-32 py-20">
            {[
              { 
                title: "Realtime Validation", 
                desc: "Our distributed neural networks analyze contrast and sizing faster than you can hit save.",
                icon: <LucideIcons.Zap size={32} />
              },
              { 
                title: "WCAG 2.2 Ready", 
                desc: "Stay ahead of compliance. Automated reporting maps your UI against the latest global standards.",
                icon: <LucideIcons.ShieldCheck size={32} />
              },
              { 
                title: "Color Physiology", 
                desc: "See through the eyes of a diverse user base with 24 high-fidelity vision simulations.",
                icon: <LucideIcons.Eye size={32} />
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100, rotateX: 45, scale: 0.8 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0, 
                  rotateX: 0, 
                  scale: 1,
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                }}
                viewport={{ margin: "-100px" }}
                className="w-full h-[450px]"
              >
                <FeatureCard 
                  title={card.title}
                  description={card.desc}
                  icon={card.icon}
                  className="w-full"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollytellingSection>

      {/* Neural Integration Matrix & Frameworks Marquee */}
      <section id="compliance" className="py-40 relative bg-bg-base overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 mb-32">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-24 cursor-none" data-cursor="MATRIX">
            <h2 className="text-5xl lg:text-6xl font-display font-bold tracking-tight text-text-primary uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">Global Matrix.</h2>
            <p className="text-lg text-text-muted font-body font-light tracking-wide uppercase opacity-60">Universal compliance. Framework agnostic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "WCAG 2.2 AAA", desc: "Automated checks against the latest W3C guidelines.", icon: LucideIcons.Globe },
              { title: "ADA Compliance", desc: "Reduce legal risk with comprehensive visual auditing.", icon: LucideIcons.Scale },
              { title: "EN 301 549", desc: "European standards integration for public sector tech.", icon: LucideIcons.FileCheck },
              { title: "Section 508", desc: "Federal-grade accessibility screening engine.", icon: LucideIcons.Landmark }
            ].map((card, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1, duration: 0.6 }}
                 viewport={{ once: true, margin: "-100px" }}
                 whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.2)" }}
                 className="p-8 glass bg-white/[0.01] border-white/5 rounded-[32px] group text-left cursor-none transition-colors"
                 data-cursor="SYNC"
               >
                 <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center text-text-muted mb-6 group-hover:text-text-primary group-hover:bg-white/10 transition-all duration-500 shadow-glow-premium">
                   <card.icon size={24} />
                 </div>
                 <h4 className="text-xl font-display font-bold text-text-primary mb-3 uppercase tracking-tight">{card.title}</h4>
                 <p className="text-sm text-text-secondary leading-relaxed font-body font-light opacity-60 group-hover:opacity-100 transition-opacity">{card.desc}</p>
               </motion.div>
            ))}
          </div>
        </div>

        {/* Infinite Frameworks Marquee - Forced Dark Mode Row */}
        <div className="relative flex overflow-x-hidden !bg-black border-y border-white/10 py-12 group cursor-none !text-white" data-cursor="SWIPE">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none" />
          <motion.div 
            animate={{ x: ["0%", "-50%"] }} 
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap min-w-max items-center gap-20 px-8 hover:[animation-play-state:paused]"
          >
            {[...Array(2)].map((_, containerIndex) => (
              <React.Fragment key={containerIndex}>
                {[
                  "React", "Next.js", "Vue", "Nuxt", "SvelteKit", "Angular", "Astro", "Solid", "Qwik", "HTML5", "Remix"
                ].map((tech, i) => (
                  <div key={`${containerIndex}-${i}`} className="flex items-center gap-6 opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-300">
                    <LucideIcons.Hexagon size={28} className="text-white/50" />
                    <span className="text-3xl font-display font-black uppercase tracking-widest text-white text-glow-premium">{tech}</span>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative overflow-hidden text-center">
        <div className="container mx-auto px-6 space-y-12 relative z-10 flex flex-col items-center">
          <h2 className="text-7xl md:text-8xl font-display font-bold text-text-primary tracking-tight leading-tight uppercase">
            Initiate <br /> <span className="text-text-muted opacity-50">Simulation</span>.
          </h2>
          <RevealText 
            text="Empower your design workflow with AI-driven accessibility intelligence. Free for individual innovators."
            className="text-2xl text-text-secondary max-w-2xl mx-auto font-body font-light justify-center text-center pb-8"
          />
          <button onClick={() => navigate('/register')} className="btn btn-primary px-16 py-8 text-sm font-black uppercase tracking-[0.4em] rounded-3xl shadow-2xl hover:scale-[1.02] transition-all">
            Enter System Access
          </button>
        </div>
      </section>

      {/* Footer Restyled */}
      <footer className="pt-32 pb-16 border-t border-white/10 bg-bg-base relative overflow-hidden bg-grain">
        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-0" />
        <div className="container mx-auto px-8 flex flex-col items-center text-center gap-20 relative z-10">
          <div className="flex flex-col items-center gap-8 w-full cursor-none" data-cursor="CONNECT">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-24 h-24 bg-transparent rounded-3xl flex items-center justify-center shadow-glow-premium mb-4"
            >
              <img src="/logo.png" alt="SquintScale Logo" className="w-full h-full object-contain" />
            </motion.div>
            <h2 className="text-6xl md:text-[8rem] font-display font-black tracking-tighter text-text-primary uppercase leading-none mix-blend-difference hover:text-white transition-colors duration-500">
              Squint<span className="text-text-muted opacity-40">Scale</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-10 md:gap-20 text-xs md:text-sm font-mono font-black uppercase tracking-[0.4em] text-text-muted mt-8">
            <a href="#features" className="hover:text-text-primary hover:scale-110 transition-transform">Intelligence</a>
            <a href="#compliance" className="hover:text-text-primary hover:scale-110 transition-transform">Architecture</a>
            <a href="#benchmarks" className="hover:text-text-primary hover:scale-110 transition-transform">Compliance</a>
            <a href="#" className="hover:text-text-primary hover:scale-110 transition-transform">Manifesto</a>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-10" />

          <div className="flex flex-col md:flex-row justify-between w-full items-center gap-8 opacity-60">
            <p className="text-[10px] md:text-xs text-text-muted font-mono tracking-[0.2em] uppercase font-bold hover:text-white transition-colors">© 2026 SQUINTSCALE.IO / NEURAL INTERFACE PROTOTYPE.</p>
            <p className="text-[10px] md:text-xs text-text-muted font-mono tracking-[0.2em] uppercase font-bold text-right hover:text-white transition-colors">Built for the future of visual accessibility.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
