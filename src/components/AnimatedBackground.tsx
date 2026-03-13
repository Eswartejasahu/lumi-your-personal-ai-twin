import { motion } from 'framer-motion';

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
}));

export const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {/* Gradient orbs */}
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
      style={{ background: 'hsl(250, 90%, 65%)', top: '-10%', left: '-10%' }}
      animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
      style={{ background: 'hsl(280, 80%, 65%)', bottom: '-5%', right: '-5%' }}
      animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]"
      style={{ background: 'hsl(190, 90%, 55%)', top: '40%', right: '20%' }}
      animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Floating particles */}
    {particles.map((p) => (
      <motion.div
        key={p.id}
        className="absolute rounded-full bg-primary/30"
        style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
        animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
      />
    ))}
  </div>
);
