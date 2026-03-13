import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { MessageSquare, Upload, Brain, Network, Mic, Users, ArrowRight, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const Landing = () => {
  const { t } = useTranslation();

  const features = [
    { icon: MessageSquare, title: t('feature_chat'), desc: t('feature_chat_desc') },
    { icon: Upload, title: t('feature_upload'), desc: t('feature_upload_desc') },
    { icon: Brain, title: t('feature_insights'), desc: t('feature_insights_desc') },
    { icon: Network, title: t('feature_graph'), desc: t('feature_graph_desc') },
    { icon: Mic, title: t('feature_voice'), desc: t('feature_voice_desc') },
    { icon: Users, title: t('feature_multi'), desc: t('feature_multi_desc') },
  ];

  const steps = [
    { num: '01', title: t('step1'), desc: t('step1_desc') },
    { num: '02', title: t('step2'), desc: t('step2_desc') },
    { num: '03', title: t('step3'), desc: t('step3_desc') },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="font-display text-2xl font-bold gradient-text">LUMI</Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">{t('login')}</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary">{t('get_started')}</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-32 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
          className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> AI-Powered Personal Knowledge
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl md:text-8xl font-display font-bold gradient-text mb-4">{t('hero_title')}</motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-muted-foreground mb-3 font-display">{t('hero_subtitle')}</motion.p>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
          className="text-muted-foreground max-w-2xl mb-10 leading-relaxed">{t('hero_desc')}</motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}
          className="flex gap-4">
          <Link to="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary gap-2 px-8">
              {t('get_started')} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="border-border/50 text-foreground hover:bg-secondary">{t('login')}</Button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto" id="features">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
          className="text-3xl md:text-4xl font-display font-bold text-center mb-16 gradient-text">{t('features')}</motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
              className="glass rounded-xl p-6 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-primary transition-all">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-6 py-20 max-w-4xl mx-auto" id="how">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
          className="text-3xl md:text-4xl font-display font-bold text-center mb-16 gradient-text">{t('how_it_works')}</motion.h2>
        <div className="space-y-12">
          {steps.map((s, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
              className="flex gap-6 items-start">
              <div className="text-4xl font-display font-bold gradient-text shrink-0">{s.num}</div>
              <div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto" id="pricing">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
          className="text-3xl md:text-4xl font-display font-bold text-center mb-16 gradient-text">{t('pricing')}</motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
            className="glass rounded-2xl p-8 text-center">
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">{t('basic_plan')}</h3>
            <div className="text-4xl font-display font-bold text-foreground mb-1">₹400<span className="text-lg text-muted-foreground">{t('per_month')}</span></div>
            <p className="text-muted-foreground mb-6">1 {t('profile_limit')}</p>
            <Link to="/signup"><Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">{t('get_started')}</Button></Link>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}
            className="glass rounded-2xl p-8 text-center border-primary/30 glow-primary">
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">{t('premium_plan')}</h3>
            <div className="text-4xl font-display font-bold gradient-text mb-1">₹1000<span className="text-lg text-muted-foreground">{t('per_month')}</span></div>
            <p className="text-muted-foreground mb-6">4 {t('profiles_limit')}</p>
            <Link to="/signup"><Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{t('get_started')}</Button></Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8 px-6 text-center">
        <p className="text-muted-foreground text-sm">© 2026 LUMI. Your AI that thinks like you.</p>
      </footer>
    </div>
  );
};

export default Landing;
