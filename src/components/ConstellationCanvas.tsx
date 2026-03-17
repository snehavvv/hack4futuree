import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  active: boolean;
}

const ConstellationCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const shootingStar = useRef<ShootingStar>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    length: 0,
    opacity: 0,
    active: false,
  });

  const initParticles = (width: number, height: number) => {
    const p: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      p.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    particles.current = p;
  };

  const triggerShootingStar = (width: number, height: number) => {
    if (shootingStar.current.active) return;

    shootingStar.current = {
      x: Math.random() * width,
      y: Math.random() * (height / 2),
      vx: Math.random() * 10 + 10,
      vy: Math.random() * 5 + 2,
      length: Math.random() * 80 + 40,
      opacity: 1,
      active: true,
    };

    setTimeout(() => {
      triggerShootingStar(width, height);
    }, Math.random() * 4000 + 4000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();
    triggerShootingStar(canvas.width, canvas.height);

    const draw = (time: number) => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const starColor = isLight ? 'rgba(43, 43, 43, ' : 'rgba(245, 245, 245, ';
      const lineColor = isLight ? 'rgba(179, 179, 179, ' : 'rgba(82, 82, 82, ';

      // Particles
      particles.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const pulse = (Math.sin(time * p.pulseSpeed + p.pulsePhase) + 1) / 2;
        const currentOpacity = p.opacity * (0.3 + pulse * 0.4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${starColor}${isLight ? currentOpacity * 0.2 : currentOpacity * 0.6})`;
        ctx.fill();

        // Lines
        for (let j = i + 1; j < particles.current.length; j++) {
          const p2 = particles.current[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineOpacity = (1 - dist / 100) * 0.08;
            ctx.strokeStyle = `${lineColor}${lineOpacity})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      });

      // Shooting Star
      if (shootingStar.current.active) {
        const ss = shootingStar.current;
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx, ss.y - ss.vy);
        gradient.addColorStop(0, `${starColor}${ss.opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 1.5, ss.y - ss.vy * 1.5);
        ctx.stroke();

        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.opacity -= 0.02;

        if (ss.opacity <= 0 || ss.x > canvas.width || ss.y > canvas.height) {
          ss.active = false;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ConstellationCanvas;
