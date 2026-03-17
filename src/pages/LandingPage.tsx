import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { ThemeToggle } from '../components/ThemeToggle';
import { KineticText } from '../components/KineticText';
import { RevealText } from '../components/RevealText';
import { FeatureCard } from '../components/FeatureCard';
import { ScrollytellingSection } from '../components/ScrollytellingSection';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // Hero Parallax values - Enhanced for cinematic depth
  const heroY = useTransform(scrollY, [0, 800], [0, 300]);
  const heroScale = useTransform(scrollY, [0, 800], [1, 0.85]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  
  // Horizontal Scroll Section Parallax
  const horizontalScrollRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: horizontalScrollRef });
  const xTransform = useTransform(scrollYProgress, [0, 1], ["0%", "-55%"]);
  
  // Benchmarks Parallax
  const benchmarksY = useTransform(scrollY, [1200, 2000], [150, 0]);
  const benchmarksOpacity = useTransform(scrollY, [1200, 1600], [0, 1]);

  return (
    <div className="bg-bg-base text-text-primary selection:bg-white selection:text-bg-primary overflow-x-hidden pt-20">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-[80px] flex items-center justify-between px-8 md:px-20 z-[100] bg-bg-base/80 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-text-primary rounded-xl flex items-center justify-center shadow-2xl">
            <LucideIcons.Eye size={24} className="text-bg-primary" />
          </div>
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
          className="container mx-auto px-6 text-center space-y-10 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-white/5 text-text-muted text-[10px] font-bold uppercase tracking-[0.4em] mb-4"
          >
            <LucideIcons.ShieldCheck size={12} className="text-text-muted" /> AI-powered design intelligence
          </motion.div>
          
          <div className="overflow-hidden py-4 cursor-none" data-cursor="SCALE">
            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-display font-black text-text-primary tracking-tighter max-w-[15ch] mx-auto leading-[0.9] uppercase flex justify-center flex-wrap gap-x-4">
              <KineticText text="DESIGN FOR THE UNKNOWN" highlightWords={['UNKNOWN']} />
            </h1>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 2, delay: 1.5 }}
              className="text-text-muted block mt-4 uppercase font-mono tracking-widest text-sm"
            >
              Visual.
            </motion.span>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto font-body font-light leading-relaxed opacity-80"
          >
            Scale your digital experiences through the eyes of diverse users. Human-centric accessibility at neural speeds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
          >
            <button 
              onClick={() => navigate('/upload')} 
              data-cursor="INITIATE"
              className="btn btn-primary px-14 py-7 text-xs font-black uppercase tracking-[0.4em] rounded-full group flex items-center gap-4 shadow-glow-premium hover:scale-[1.02] transition-all"
            >
              Start Analysis <LucideIcons.ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
            </button>
            <button 
              className="flex items-center gap-4 px-14 py-7 text-xs font-black uppercase tracking-[0.4em] rounded-full glass border-white/5 hover:border-white/20 transition-all text-text-primary group"
              data-cursor="DEMO"
            >
              System Demo <LucideIcons.Play size={16} className="text-text-muted group-hover:text-text-primary transition-colors" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="pt-40 flex justify-center"
          >
            <div className="relative group perspective-[2000px]">
              <div className="absolute -inset-40 bg-white/[0.015] blur-[150px] rounded-full pointer-events-none" />
              <motion.div 
                className="glass p-1 text-center relative border-white/10 group-hover:border-white/20 transition-all duration-1000 shadow-panel-premium rounded-[60px] overflow-hidden animate-scan"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="bg-bg-surface/50 p-24 rounded-[58px] border border-white/5 bg-dot-grid">
                  <ScoreGauge score={92} size={420} />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-radial-at-c from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              </motion.div>
            </div>
          </motion.div>
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

      {/* Pinned Horizontal Scrollytelling Section */}
      <section ref={horizontalScrollRef} className="relative h-[200vh] bg-bg-surface">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div 
            style={{ x: xTransform }} 
            className="flex gap-32 pl-[10vw] pr-[30vw] min-w-max"
          >
            {/* Horizontal Slide 1 */}
            <div className="w-[80vw] lg:w-[40vw] flex flex-col justify-center space-y-10">
              <KineticText 
                el="h2"
                text="REALITY SIMULATION." 
                className="text-6xl lg:text-8xl font-display font-black tracking-tight leading-tight text-text-primary uppercase"
                highlightWords={['SIMULATION.']}
              />
              <p className="text-xl text-text-secondary leading-relaxed font-body font-light max-w-lg">
                Contrast ratios are only half the battle. Squint Scale simulates cataracts, glare, and age-related vision loss to give you a true perspective on readability.
              </p>
            </div>

            {/* Horizontal Slide 2 */}
            <div className="w-[80vw] lg:w-[60vw] flex flex-col justify-center">
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { title: "Neural Blur Matrix", desc: "Simulate myopia and presbyopia with high-precision neural filters.", icon: LucideIcons.Layers },
                  { title: "Environmental Exposure", desc: "Test UI durability against varying ambient light conditions.", icon: LucideIcons.Zap },
                  { title: "Chromatic Fidelity", desc: "Deuteranopia and protanopia real-time perception filters.", icon: LucideIcons.Palette }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8 p-10 glass bg-white/[0.01] border-white/5 hover:border-white/20 transition-all group rounded-[40px] cursor-none" data-cursor="EXPLORE">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:bg-text-primary transition-all duration-700">
                      <item.icon size={32} className="text-text-muted group-hover:text-bg-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-display font-bold text-text-primary mb-3">{item.title}</h4>
                      <p className="text-lg text-text-secondary leading-relaxed font-body font-light opacity-60 group-hover:opacity-100 transition-opacity">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Horizontal Slide 3 */}
            <div className="w-[80vw] lg:w-[50vw] flex items-center justify-center">
              <div className="relative w-full cursor-none" data-cursor="VIEW SYS">
                <div className="absolute -inset-10 bg-white/[0.02] blur-[100px]" />
                <div className="glass p-6 relative overflow-hidden group rounded-[48px] border-white/10 shadow-panel-premium">
                  <img 
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=90" 
                    alt="System Preview" 
                    className="rounded-[32px] w-full h-[600px] object-cover filter brightness-[0.6] group-hover:brightness-100 transition-all duration-1000 object-center"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 bg-bg-base/20 backdrop-blur-sm pointer-events-none">
                    <div className="glass p-12 scale-90 rounded-[40px] border-white/20 shadow-2xl">
                      <ScoreGauge score={42} size={180} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-12 glass bg-white/[0.01] border-white/5 hover:border-white/20 transition-all rounded-[32px]"
              >
                <div className="text-5xl md:text-6xl font-mono font-bold text-text-primary mb-4 tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Embedded Neednap Scrollytelling Enhancements */}
      <ScrollytellingSection>
        {/* Intro Text revealed on scroll */}
        <div className="w-[90vw] lg:w-[50vw] flex flex-col justify-center">
          <RevealText 
            text="EMPATHY AT SCALE. AI DESIGN INTELLIGENCE FOR THE MODERN WEB."
            className="text-5xl lg:text-7xl font-display font-black tracking-tight leading-tight uppercase mb-8"
          />
        </div>

        {/* Feature Cards */}
        <div className="w-[80vw] lg:w-[35vw] flex items-center justify-center">
          <FeatureCard 
            title="Realtime Validation"
            description="Our distributed neural networks analyze contrast and sizing faster than you can hit save."
            icon={<LucideIcons.Zap size={32} />}
          />
        </div>

        <div className="w-[80vw] lg:w-[35vw] flex items-center justify-center">
          <FeatureCard 
            title="WCAG 2.2 Ready"
            description="Stay ahead of compliance. Automated reporting maps your UI against the latest global standards."
            icon={<LucideIcons.ShieldCheck size={32} />}
          />
        </div>
        
        <div className="w-[80vw] lg:w-[35vw] flex items-center justify-center">
          <FeatureCard 
            title="Color Physiology"
            description="See through the eyes of a diverse user base with 24 high-fidelity vision simulations."
            icon={<LucideIcons.Eye size={32} />}
          />
        </div>
      </ScrollytellingSection>

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

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 bg-bg-base relative overflow-hidden bg-grain">
        <div className="container mx-auto px-8 flex flex-col items-center text-center gap-16 relative z-10">
          <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 bg-text-primary rounded-2xl flex items-center justify-center shadow-2xl mb-4">
              <LucideIcons.Eye size={24} className="text-bg-primary" />
            </div>
            <h2 className="text-4xl font-display font-bold tracking-tighter text-text-primary uppercase">
              Squint<span className="opacity-40">Scale</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-mono font-black uppercase tracking-[0.4em] text-text-muted">
            <a href="#" className="hover:text-text-primary transition-colors">Intelligence</a>
            <a href="#" className="hover:text-text-primary transition-colors">Architecture</a>
            <a href="#" className="hover:text-text-primary transition-colors">Compliance</a>
            <a href="#" className="hover:text-text-primary transition-colors">Manifesto</a>
          </div>

          <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col md:flex-row justify-between w-full items-center gap-8 opacity-40">
            <p className="text-[10px] text-text-muted font-mono tracking-[0.2em] uppercase font-bold">© 2026 SQUINTSCALE.IO / NEURAL INTERFACE PROTOTYPE.</p>
            <p className="text-[10px] text-text-muted font-mono tracking-[0.2em] uppercase font-bold text-right">Built for the future of visual accessibility.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
