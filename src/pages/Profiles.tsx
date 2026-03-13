import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Edit2, Check, X, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  created_at: string;
}

const Profiles = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadProfiles();
  }, [user]);

  const loadProfiles = async () => {
    const { data } = await supabase.from('profiles' as any).select('*').eq('user_id', user!.id).order('created_at');
    setProfiles((data as any) || []);
  };

  const createProfile = async () => {
    if (!newName.trim()) return;
    // Free plan limit: 1 profile
    if (profiles.length >= 4) { toast.error('Maximum profiles reached'); return; }
    setCreating(true);
    const { error } = await supabase.from('profiles' as any).insert({ name: newName.trim(), user_id: user!.id } as any);
    if (error) toast.error(error.message);
    else { setNewName(''); await loadProfiles(); }
    setCreating(false);
  };

  const deleteProfile = async (id: string) => {
    const { error } = await supabase.from('profiles' as any).delete().eq('id', id);
    if (error) toast.error(error.message);
    else await loadProfiles();
  };

  const renameProfile = async (id: string) => {
    if (!editName.trim()) return;
    const { error } = await supabase.from('profiles' as any).update({ name: editName.trim() } as any).eq('id', id);
    if (error) toast.error(error.message);
    else { setEditingId(null); await loadProfiles(); }
  };

  const selectProfile = (id: string) => {
    localStorage.setItem('lumi_profile_id', id);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative px-4 py-8">
      <AnimatedBackground />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold gradient-text">LUMI</h1>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }} className="text-muted-foreground gap-2">
            <LogOut className="h-4 w-4" /> {t('logout')}
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8">
          <h2 className="text-xl font-display font-semibold text-foreground mb-6">{t('select_profile')}</h2>

          <div className="space-y-3 mb-6">
            {profiles.map((p) => (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/30 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => !editingId && selectProfile(p.id)}>
                {editingId === p.id ? (
                  <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus
                      className="bg-background/50 border-border/30 text-foreground h-8" />
                    <Button size="icon" variant="ghost" onClick={() => renameProfile(p.id)} className="h-8 w-8 text-primary">
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8 text-muted-foreground">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-display font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 font-medium text-foreground">{p.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => { setEditingId(p.id); setEditName(p.name); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteProfile(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input placeholder={t('create_profile')} value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProfile()}
              className="bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground" />
            <Button onClick={createProfile} disabled={creating} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" /> {t('create_profile')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profiles;
