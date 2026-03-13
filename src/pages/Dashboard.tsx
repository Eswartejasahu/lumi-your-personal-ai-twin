import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import ReactMarkdown from 'react-markdown';
import {
  MessageSquare, Upload, Brain, Network, Settings, LogOut, Send, Mic, MicOff,
  FileText, Camera, X, Menu, User, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Message { role: 'user' | 'assistant'; content: string; }

type Tab = 'chat' | 'upload' | 'insights' | 'graph' | 'settings';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const profileId = localStorage.getItem('lumi_profile_id');
  const [tab, setTab] = useState<Tab>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Upload
  const [documents, setDocuments] = useState<{ id: string; name: string; created_at: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (!profileId) navigate('/profiles');
  }, [user, profileId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => { if (profileId) loadDocuments(); }, [profileId]);

  const loadDocuments = async () => {
    const { data } = await supabase.from('documents').select('*').eq('profile_id', profileId!).order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  // AI Chat
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: docs } = await supabase.from('documents').select('content, name').eq('profile_id', profileId!);
      const context = docs?.map(d => `[${d.name}]: ${d.content}`).join('\n\n') || '';

      const allMessages = [...messages, userMsg];
      const systemPrompt = context
        ? `You are LUMI, a personal AI assistant. Answer ONLY based on the user's uploaded documents. Here is the user's document content:\n\n${context}\n\nIf the question cannot be answered from these documents, say so politely.`
        : `You are LUMI, a personal AI assistant. The user hasn't uploaded any documents yet. Encourage them to upload documents so you can help answer questions based on their content.`;

      const resp = await supabase.functions.invoke('chat', {
        body: { messages: allMessages, systemPrompt },
      });

      if (resp.error) throw new Error(resp.error.message);

      const data = resp.data;
      if (typeof data === 'string') {
        const lines = data.split('\n');
        let assistantContent = '';
        for (const line of lines) {
          if (line.startsWith('data: ') && line.slice(6).trim() !== '[DONE]') {
            try {
              const parsed = JSON.parse(line.slice(6));
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) assistantContent += content;
            } catch {}
          }
        }
        if (assistantContent) {
          setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
        }
      } else if (data?.choices?.[0]?.message?.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
      } else if (data?.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I received your message but couldn\'t generate a response. Please try again.' }]);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice input
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Speech recognition not supported'); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  // File upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !profileId) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const { error } = await supabase.from('documents').insert({
          profile_id: profileId,
          user_id: user!.id,
          name: file.name,
          content: text,
          file_type: file.type || 'text/plain',
        });
        if (error) throw error;
        toast.success(`Uploaded: ${file.name}`);
      } catch (err: any) {
        toast.error(`Failed: ${file.name} - ${err.message}`);
      }
    }
    await loadDocuments();
    setUploading(false);
  };

  const deleteDoc = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    await loadDocuments();
  };

  const sidebarItems: { icon: typeof MessageSquare; label: string; tab: Tab }[] = [
    { icon: MessageSquare, label: t('chat'), tab: 'chat' },
    { icon: Upload, label: t('upload'), tab: 'upload' },
    { icon: Brain, label: t('insights'), tab: 'insights' },
    { icon: Network, label: t('knowledge_graph'), tab: 'graph' },
    { icon: Settings, label: t('settings'), tab: 'settings' },
  ];

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="h-full flex flex-col border-r border-border/30 bg-sidebar overflow-hidden shrink-0">
            <div className="p-4 flex items-center justify-between">
              <h1 className="text-xl font-display font-bold gradient-text">LUMI</h1>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-muted-foreground h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
              {sidebarItems.map((item) => (
                <button key={item.tab} onClick={() => setTab(item.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${tab === item.tab ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-border/30 space-y-2">
              <LanguageSwitcher />
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="truncate flex-1">{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }}
                className="w-full justify-start text-muted-foreground hover:text-destructive gap-2">
                <LogOut className="h-4 w-4" /> {t('logout')}
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-3 px-4 border-b border-border/30 shrink-0">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="text-muted-foreground h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h2 className="font-display font-semibold text-foreground capitalize">
            {tab === 'chat' ? t('chat') : tab === 'upload' ? t('upload') : tab === 'insights' ? t('insights') : tab === 'graph' ? t('knowledge_graph') : t('settings')}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/profiles')} className="ml-auto text-muted-foreground text-xs">
            {t('profiles')}
          </Button>
        </header>

        <div className="flex-1 overflow-hidden">
          {tab === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-2xl font-display font-bold gradient-text mb-2">LUMI</h3>
                      <p className="text-muted-foreground text-sm">{t('type_message')}</p>
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'glass text-foreground rounded-bl-md'}`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="glass px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-border/30">
                <div className="flex gap-2 items-center max-w-3xl mx-auto">
                  <Button variant="ghost" size="icon"
                    className={`shrink-0 ${isRecording ? 'text-destructive' : 'text-muted-foreground'}`}
                    onClick={toggleRecording}>
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  <Input value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={t('type_message')}
                    className="bg-secondary/50 border-border/30 text-foreground placeholder:text-muted-foreground" />
                  <Button size="icon" onClick={sendMessage} disabled={isLoading || !input.trim()}
                    className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="p-6 max-w-3xl mx-auto overflow-y-auto h-full">
              <div className="glass rounded-2xl p-8 text-center mb-6 cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFileUpload(e.dataTransfer.files); }}>
                <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-foreground font-medium mb-1">{t('drag_drop')}</p>
                <p className="text-muted-foreground text-sm">{t('supported')}</p>
                {uploading && <p className="text-primary mt-2 text-sm">{t('processing')}</p>}
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.txt,.docx,.doc,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => handleFileUpload(e.target.files)} className="hidden" />
              </div>

              <div className="flex gap-2 mb-6">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-border/30 text-foreground gap-2">
                  <FileText className="h-4 w-4" /> Files
                </Button>
                <Button variant="outline" size="sm" className="border-border/30 text-foreground gap-2"
                  onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.capture = 'environment'; i.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files); i.click(); }}>
                  <Camera className="h-4 w-4" /> Camera
                </Button>
              </div>

              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/20">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <span className="flex-1 text-sm text-foreground truncate">{doc.name}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteDoc(doc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'insights' && (
            <div className="p-6 flex items-center justify-center h-full">
              <div className="text-center">
                <Brain className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">{t('insights')}</h3>
                <p className="text-muted-foreground text-sm">Upload documents to see insights about your knowledge base.</p>
              </div>
            </div>
          )}

          {tab === 'graph' && (
            <div className="p-6 flex items-center justify-center h-full">
              <div className="text-center">
                <Network className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">{t('knowledge_graph')}</h3>
                <p className="text-muted-foreground text-sm">Upload documents to visualize your knowledge connections.</p>
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="p-6 max-w-lg mx-auto space-y-6 overflow-y-auto h-full">
              <div className="glass rounded-xl p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">{t('language')}</h3>
                <LanguageSwitcher />
              </div>
              <div className="glass rounded-xl p-6">
                <h3 className="font-display font-semibold text-foreground mb-4">{t('profiles')}</h3>
                <Button variant="outline" onClick={() => navigate('/profiles')} className="border-border/30 text-foreground">
                  Manage Profiles
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
