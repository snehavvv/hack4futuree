import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ 
  score, 
  size = 200, 
  strokeWidth = 12 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Motion values for number counting
  const count = useMotionValue(0);
  const roundedCount = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, score, { 
      duration: 1.5, 
      ease: "easeOut",
      delay: 0.2
    });
    return controls.stop;
  }, [score, count]);

  const getColor = () => {
    return 'var(--accent-primary)';
  };

  // Particle configuration for high scores (Silver/Dimond sparkle)
  const particles = Array.from({ length: 12 });

  return (
    <motion.div 
      className="relative flex flex-col items-center justify-center cursor-default group" 
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Sparkle Burst for High Scores */}
      {score >= 80 && particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full z-20 bg-white"
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ 
            x: Math.cos(i * (Math.PI / 6)) * (size / 1.5),
            y: Math.sin(i * (Math.PI / 6)) * (size / 1.5),
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{ 
            duration: 2, 
            delay: i * 0.1,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
      ))}

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--border-glass)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - ((score || 0) / 100) * circumference }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          className="transition-all duration-500 group-hover:opacity-80"
          style={{ filter: `drop-shadow(0 0 8px rgba(var(--accent-primary-rgb, 255,255,255), 0.2))` }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline">
          <motion.span 
            className="text-6xl font-mono font-bold tracking-tighter"
            style={{ color: 'var(--text-primary)' }}
          >
            {roundedCount}
          </motion.span>
        </div>
        <motion.span 
          className="text-[11px] uppercase font-display font-black tracking-[0.4em] text-text-muted mt-4 group-hover:text-text-primary transition-colors opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.8 }}
        >
          Intelligence Rank
        </motion.span>
      </div>

      {score < 50 && (
        <motion.div 
          className="absolute inset-0 rounded-full border border-white/5"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};
