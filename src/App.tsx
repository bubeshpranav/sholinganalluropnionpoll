/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, type FormEvent } from 'react';
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
import { PARTIES, AGE_RANGES, OCCUPATIONS, type Party } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper function for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [view, setView] = useState<'home' | 'poll' | 'dashboard' | 'success'>('home');
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [formData, setFormData] = useState<{
    age: string;
    occupation: string;
    otherPartyName?: string;
  }>({
    age: '',
    occupation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<any[]>([]);

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
    setView('poll');
  };

  const getPartyDisplayName = (vote: any) => {
    if (vote.party === 'Others') return vote.otherPartyName || 'Other';
    const party = PARTIES.find(p => p.id === vote.party);
    if (party) return party.subLabel;
    // Legacy support
    if (vote.party === 'NDA Alliance') return 'ADMK';
    if (vote.party === 'INDIA Alliance') return 'DMK';
    return vote.party;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedParty || !formData.age || !formData.occupation) {
      setError('Please fill in all fields');
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
        occupation: formData.occupation,
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

      <main className="pt-20 pb-12 px-4 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                  Tamil Nadu
                </h1>
                <p className="text-xl font-medium tracking-widest text-yellow-400 uppercase">
                  South / தெற்கு Zone
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
                      "w-full p-8 rounded-2xl flex items-center justify-between text-left transition-all shadow-xl border-2 border-white/10 relative overflow-hidden group min-h-[140px]",
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
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center relative z-10">
                      <ChevronRight size={24} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'poll' && (
            <motion.div
              key="poll"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 bg-white/10 p-8 rounded-3xl backdrop-blur-xl border border-white/20"
            >
              <button 
                onClick={() => setView('home')}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} /> Back
              </button>

              <div className="space-y-6">
                <h2 className="text-3xl font-black uppercase leading-tight italic">
                  One last step...
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {selectedParty === 'Others' && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-yellow-400">
                        Specify Party Name
                      </label>
                      <input 
                        type="text"
                        placeholder="Type party name..."
                        required
                        className="w-full p-4 rounded-xl bg-black/40 border-2 border-white/10 focus:border-yellow-400 outline-none transition-all"
                        value={formData.otherPartyName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, otherPartyName: e.target.value }))}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-yellow-400">
                      Select Age Group
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {AGE_RANGES.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, age: range }))}
                          className={cn(
                            "p-3 rounded-lg text-sm font-bold border-2 transition-all",
                            formData.age === range 
                              ? "bg-yellow-400 text-black border-yellow-400" 
                              : "bg-white/5 border-white/10 hover:border-white/30"
                          )}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-yellow-400">
                      Occupation / Business Type
                    </label>
                    <select
                      required
                      className="w-full p-4 rounded-xl bg-black/40 border-2 border-white/10 focus:border-yellow-400 outline-none transition-all appearance-none cursor-pointer font-bold"
                      value={formData.occupation}
                      onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    >
                      <option value="" disabled className="bg-zinc-800">Select your occupation</option>
                      {OCCUPATIONS.map((occ) => (
                        <option key={occ} value={occ} className="bg-zinc-800 italic">{occ}</option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/20 border border-red-500 flex items-center gap-3 text-sm font-bold">
                      <AlertCircle size={18} /> {error}
                    </div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={isSubmitting}
                    className="w-full p-5 bg-yellow-400 text-black font-black uppercase tracking-tighter text-xl rounded-2xl shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={24} /> Submitting...
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
                    setFormData({ age: '', occupation: '' });
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
                            contentStyle={{ background: '#18181b', border: '1px solid #ffffff20', borderRadius: '12px' }}
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
                  <div className="grid md:grid-cols-2 gap-6">
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
                              contentStyle={{ background: '#18181b', border: '1px solid #ffffff20', borderRadius: '12px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-black/30 p-6 rounded-3xl border border-white/10 space-y-4 overflow-hidden">
                      <h3 className="text-lg font-black uppercase tracking-widest text-yellow-400">
                        Top Occupations
                      </h3>
                      <div className="space-y-3">
                        {OCCUPATIONS
                          .map(occ => ({
                            name: occ,
                            count: votes.filter(v => v.occupation === occ).length
                          }))
                          .filter(o => o.count > 0)
                          .sort((a, b) => b.count - a.count)
                          .slice(0, 5)
                          .map((o, i) => (
                            <div key={i} className="flex flex-col gap-1">
                              <div className="flex justify-between text-xs font-bold px-1">
                                <span className="truncate opacity-80">{o.name}</span>
                                <span className="text-yellow-400 border-b border-yellow-400/30">{o.count}</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(o.count / votes.length) * 100}%` }}
                                  className="h-full bg-yellow-400"
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Log (Optional but good for transparency) */}
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
                          <span className="opacity-50 italic">{v.age} • {v.occupation}</span>
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
