import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      toast.success('Check your email for reset instructions');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <AnimatedBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 w-full max-w-md relative z-10">
        <Link to="/" className="block text-center mb-6">
          <h1 className="text-3xl font-display font-bold gradient-text">LUMI</h1>
        </Link>
        <h2 className="text-xl font-display font-semibold text-foreground text-center mb-6">{t('reset_password')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground" required />
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
            {loading ? '...' : t('reset_password')}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">{t('login')}</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
