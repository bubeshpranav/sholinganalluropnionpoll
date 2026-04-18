/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type FormEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  ChevronRight, 
  ChevronLeft, 
  BarChart3, 
  Home, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { db } from './lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  onSnapshot, 
  orderBy 
} from 'firebase/firestore';
import { PARTIES, AGE_RANGES, type Party } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper function for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [view, setView] = useState<'home' | 'dashboard' | 'success'>('home');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [formData, setFormData] = useState<{
    age: string;
    otherPartyName?: string;
  }>({
    age: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<any[]>([]);

  const ageSectionRef = useRef<HTMLDivElement>(null);

  // Fetch votes for dashboard
  useEffect(() => {
    const q = query(collection(db, 'votes'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const voteData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVotes(voteData);
    });
    return () => unsubscribe();
  }, []);

  const handlePartySelect = (party: Party) => {
    setSelectedParty(party);
    setError(null);
    
    // Smooth scroll to age section
    setTimeout(() => {
      ageSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const getPartyDisplayName = (vote: any) => {
    if (vote.party === 'Others') return vote.otherPartyName || 'Others';
    const party = PARTIES.find(p => p.id === vote.party);
    if (party) return party.subLabel;
    // Legacy support
    if (vote.party === 'NDA Alliance') return 'ADMK';
    if (vote.party === 'INDIA Alliance') return 'DMK';
    return vote.party;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedParty || !formData.age) {
      setError('Please select your party and age');
      return;
    }

    if (selectedParty === 'Others' && !formData.otherPartyName) {
      setError('Please specify the party name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'votes'), {
        party: selectedParty,
        otherPartyName: formData.otherPartyName || null,
        age: formData.age,
        timestamp: serverTimestamp(),
      });
      setView('success');
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-700 text-white font-sans selection:bg-yellow-400 selection:text-red-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex justify-between items-center bg-black/20 backdrop-blur-md">
        <button 
          onClick={() => setView('home')}
          className="flex items-center gap-2 font-bold tracking-tighter text-xl uppercase"
        >
          TN 2026
        </button>
        <button 
          onClick={() => setView(view === 'dashboard' ? 'home' : 'dashboard')}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {view === 'dashboard' ? <Home size={20} /> : <BarChart3 size={20} />}
        </button>
      </nav>

      {/* Top Right Logo */}
      <div className="fixed top-14 right-4 z-40 w-32 md:w-48 pointer-events-none select-none overflow-hidden rounded-xl">
        <img 
          src="https://res.cloudinary.com/dhjfoibdf/image/upload/q_auto/f_auto/v1776521632/3218f156-db49-413c-bc4c-7319a17a097a_azxc8m.png" 
          alt="Arasiyal Kalam" 
          className="w-full h-auto object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
          referrerPolicy="no-referrer"
        />
      </div>

      <main className="pt-20 pb-12 px-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              <div className="text-center space-y-2">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                  Tamil Nadu
                </h1>
                <p className="text-xl font-black tracking-widest text-yellow-400 uppercase">
                  Sholinganallur Constituency
                </p>
                <div className="inline-block px-8 py-2 bg-yellow-400 text-black font-black rounded-full skew-x-[-12deg] shadow-[4px_4px_0px_#000]">
                  <span className="block skew-x-[12deg]">OPINION POLL</span>
                </div>
              </div>

              <div className="space-y-4">
                {PARTIES.map((party) => (
                  <motion.button
                    key={party.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePartySelect(party.id)}
                    className={cn(
                      "w-full p-8 rounded-2xl flex items-center justify-between text-left transition-all shadow-xl border-2 relative overflow-hidden group min-h-[140px]",
                      selectedParty === party.id ? "border-yellow-400 ring-4 ring-yellow-400/20" : "border-white/10",
                      party.color
                    )}
                    style={party.bgImage ? { 
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${party.bgImage})`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center' 
                    } : {}}
                  >
                    <div className="space-y-1 relative z-10">
                      <h3 className="text-2xl font-bold tracking-tight leading-tight">
                        {party.label}
                      </h3>
                      <p className="text-sm font-semibold opacity-80 uppercase tracking-widest text-yellow-400">
                        {party.subLabel}
                      </p>
                    </div>
                    {selectedParty === party.id ? (
                      <div className="w-12 h-12 rounded-xl bg-yellow-400 text-black flex items-center justify-center relative z-10">
                        <CheckCircle2 size={24} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center relative z-10 transition-transform group-hover:translate-x-1">
                        <ChevronRight size={24} />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div 
                ref={ageSectionRef}
                className={cn(
                  "p-8 rounded-3xl bg-black/40 border-2 transition-all duration-500 backdrop-blur-xl space-y-8",
                  selectedParty ? "opacity-100 translate-y-0 border-white/20" : "opacity-30 pointer-events-none translate-y-10 border-transparent text-white/20"
                )}
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase italic leading-tight">
                    One last step...
                  </h2>
                  <p className="text-sm font-bold text-white/50 uppercase tracking-widest">
                    Selected Party: <span className="text-yellow-400 font-black">{selectedParty ? getPartyDisplayName({ party: selectedParty }) : 'None'}</span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {selectedParty === 'Others' && (
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-yellow-400 flex items-center gap-2">
                        <AlertCircle size={14} /> Specify Party Name
                      </label>
                      <input 
                        type="text"
                        placeholder="Type party name..."
                        required
                        className="w-full p-4 rounded-xl bg-black/40 border-2 border-white/10 focus:border-yellow-400 outline-none transition-all placeholder:italic"
                        value={formData.otherPartyName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, otherPartyName: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-yellow-400">
                      Select Age Group
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {AGE_RANGES.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, age: range }))}
                          className={cn(
                            "p-4 rounded-xl text-sm font-bold border-2 transition-all",
                            formData.age === range 
                              ? "bg-yellow-400 text-black border-yellow-400 shadow-lg scale-105" 
                              : "bg-white/5 border-white/10 hover:border-white/30"
                          )}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/20 border border-red-500 flex items-center gap-3 text-sm font-bold animate-pulse">
                      <AlertCircle size={18} /> {error}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting || !selectedParty}
                    className="w-full p-6 bg-yellow-400 text-black font-black uppercase tracking-tighter text-2xl rounded-2xl shadow-[6px_6px_0px_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={28} /> Processing...
                      </>
                    ) : (
                      'Cast My Vote'
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}


          {view === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 bg-zinc-900/50 p-12 rounded-[3rem] border-4 border-yellow-400/50 backdrop-blur-3xl"
            >
              <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                <CheckCircle2 size={48} className="text-black" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black uppercase italic leading-none">
                  Vote Registered!
                </h2>
                <p className="text-white/60 font-medium">
                  Thank you for participating in the opinion poll. Your voice matters for 2026.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setView('dashboard')}
                  className="p-5 bg-white text-black font-black uppercase rounded-2xl hover:bg-yellow-400 transition-colors"
                >
                  View Live Results
                </button>
                <button 
                  onClick={() => {
                    setView('home');
                    setFormData({ age: '' });
                    setSelectedParty(null);
                  }}
                  className="text-sm font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                >
                  Back to Poll
                </button>
              </div>
            </motion.div>
          )}

          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-4xl font-black uppercase leading-none italic">
                  Live Results
                </h2>
                <p className="text-sm font-bold tracking-widest text-yellow-400 uppercase opacity-70">
                  Total Votes Cast: {votes.length}
                </p>
              </div>

              {votes.length === 0 ? (
                <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/10 italic opacity-50">
                  Waiting for data...
                </div>
              ) : (
                <div className="grid gap-6">
                  {/* Party Distribution */}
                  <div className="bg-black/30 p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-yellow-400">
                      Party Distribution
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={PARTIES.map(p => ({
                            name: p.subLabel,
                            votes: votes.filter(v => 
                              v.party === p.id || 
                              (p.id === 'ADMK' && v.party === 'NDA Alliance') || 
                              (p.id === 'DMK' && v.party === 'INDIA Alliance')
                            ).length
                          }))}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#ffffff80', fontSize: 10, fontWeight: 700 }}
                            width={100}
                          />
                          <Tooltip 
                            cursor={{ fill: '#ffffff05' }}
                            contentStyle={{ background: '#18181b', border: '1px solid #ffffff20', borderRadius: '12px', padding: '12px' }}
                            itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
                            labelStyle={{ color: '#ffffff', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}
                          />
                          <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                            {PARTIES.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color.includes('green') ? '#166534' : entry.color.includes('red') ? '#7f1d1d' : entry.color.includes('orange') ? '#ea580c' : '#facc15'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Demographics */}
                  <div className="bg-black/30 p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-yellow-400">
                      Age Groups
                    </h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={AGE_RANGES.map(range => ({
                              name: range,
                              value: votes.filter(v => v.age === range).length
                            })).filter(d => d.value > 0)}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[...Array(6)].map((_, i) => (
                              <Cell key={i} fill={`hsl(${i * 60}, 70%, 50%)`} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#18181b', border: '1px solid #ffffff20', borderRadius: '12px', padding: '12px' }}
                            itemStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
                            labelStyle={{ color: '#ffffff', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Detailed Log */}
                  <div className="bg-black/30 p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-yellow-400">
                      Recent Activity
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {votes.slice(0, 10).map((v) => (
                        <div key={v.id} className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] flex justify-between items-center group hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_5px_#facc15]" />
                            <span className="font-black uppercase tracking-widest">{getPartyDisplayName(v)}</span>
                          </div>
                          <span className="opacity-50 italic">{v.age}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Styled Scrollbar for data logs */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(250, 204, 21, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(250, 204, 21, 0.4);
        }
      `}</style>
    </div>
  );
}
