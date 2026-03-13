import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Login = () => {
  const { t } = useTranslation();
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/profiles');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <AnimatedBackground />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-8 w-full max-w-md relative z-10">
        <Link to="/" className="block text-center mb-6">
          <h1 className="text-3xl font-display font-bold gradient-text">LUMI</h1>
        </Link>
        <h2 className="text-xl font-display font-semibold text-foreground text-center mb-6">{t('login')}</h2>

        <Button onClick={signInWithGoogle} variant="outline" className="w-full mb-4 border-border/50 text-foreground hover:bg-secondary gap-2">
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          {t('sign_in_google')}
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">{t('or')}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground" required />
          <Input type="password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)}
            className="bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground" required />
          <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
            {loading ? '...' : t('login')}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/forgot-password" className="text-primary hover:underline">{t('forgot_password')}</Link>
        </div>
        <div className="mt-2 text-center text-sm text-muted-foreground">
          {t('no_account')} <Link to="/signup" className="text-primary hover:underline">{t('signup')}</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
