import { CheckCircle2, Circle, User, Users, AlertCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Assignee, Priority } from '../types';
import { cn } from '../utils';

interface LifeguardViewProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
}

const TABS: { id: Assignee; label: string; icon: React.ElementType }[] = [
  { id: 'Entrambi', label: 'Tutti', icon: Users },
  { id: 'Michele', label: 'Michele', icon: User },
  { id: 'Angelo', label: 'Angelo', icon: User },
];

const PRIORITY_COLORS = {
  Bassa: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Media: 'bg-amber-100 text-amber-700 border-amber-200',
  Alta: 'bg-rose-100 text-rose-700 border-rose-200',
};

export function LifeguardView({ tasks, toggleTask }: LifeguardViewProps) {
  const [activeTab, setActiveTab] = useState<Assignee>('Entrambi');

  const filteredTasks = tasks.filter(t => activeTab === 'Entrambi' ? true : (t.assignee === activeTab || t.assignee === 'Entrambi'));

  const pendingTasks = filteredTasks.filter(t => !t.completed).sort((a, b) => {
    // Ordina per priorità prima: Alta > Media > Bassa
    const pWeight = { Alta: 3, Media: 2, Bassa: 1 };
    if (pWeight[a.priority] !== pWeight[b.priority]) {
      return pWeight[b.priority] - pWeight[a.priority];
    }
    return a.createdAt - b.createdAt;
  });
  const completedTasks = filteredTasks.filter(t => t.completed).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Tab Selector with Sliding Indicator */}
      <div className="bg-slate-200/50 p-1.5 rounded-2xl flex gap-1 items-center relative isolation-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-colors cursor-pointer font-semibold text-sm relative z-10",
                isActive ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 mb-1" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Container matching sleek theme main area */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <header className="p-6 border-b border-slate-100 flex justify-between items-center flex-none bg-gradient-to-r from-white to-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Ordini Bagnino</h2>
            <p className="text-sm font-medium text-slate-500">{pendingTasks.length} {pendingTasks.length === 1 ? 'compito in sospeso' : 'compiti in sospeso'}</p>
          </div>
        </header>

        <div className="p-6 space-y-4">
          <AnimatePresence mode="popLayout">
            {pendingTasks.length === 0 && completedTasks.length === 0 && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl p-8 text-center shadow-sm flex flex-col items-center justify-center"
              >
                <span className="text-5xl block mb-4">🏖️</span>
                <p className="font-bold text-lg text-slate-700">Tutto fatto!</p>
                <p className="text-sm">Goditi il sole e il mare.</p>
              </motion.div>
            )}

            {pendingTasks.map((task) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                key={task.id}
                className="flex items-center p-5 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-2xl group transition-all hover:shadow-md cursor-pointer active:scale-[0.98] relative overflow-hidden"
                onClick={() => toggleTask(task.id)}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" style={{ backgroundColor: task.priority === 'Alta' ? '#fb7185' : task.priority === 'Media' ? '#fbbf24' : '#34d399' }}></div>
                <div className="flex-1 pl-2">
                  <h3 className="font-bold text-slate-800 text-lg uppercase tracking-wide italic leading-tight mb-2 drop-shadow-sm">{task.text}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border",
                      task.assignee === 'Entrambi' ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-100 text-blue-700 border-blue-200"
                    )}>
                      {task.assignee === 'Entrambi' ? <Users className="w-3.5 h-3.5"/> : <User className="w-3.5 h-3.5"/>}
                      {task.assignee}
                    </div>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border",
                      PRIORITY_COLORS[task.priority]
                    )}>
                      {task.priority === 'Alta' && <AlertCircle className="w-3.5 h-3.5"/>}
                      {task.priority}
                    </div>
                  </div>
                </div>
                <button className="w-12 h-12 rounded-full border-2 border-blue-400 flex items-center justify-center text-blue-500 bg-white shadow-sm hover:bg-blue-500 hover:text-white transition-all shrink-0 ml-4 group-hover:scale-110">
                  <CheckCircle2 className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            ))}

            {completedTasks.map((task) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 0.6, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                key={task.id}
                className="flex items-center p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:opacity-100 transition-all cursor-pointer grayscale hover:grayscale-0"
                onClick={() => toggleTask(task.id)}
              >
                <div className="flex-1">
                  <h3 className="font-bold text-slate-600 text-lg uppercase tracking-wide italic line-through leading-tight mb-2">{task.text}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md bg-slate-200 text-slate-600 border border-slate-300">
                      {task.assignee === 'Entrambi' ? <Users className="w-3.5 h-3.5"/> : <User className="w-3.5 h-3.5"/>}
                      {task.assignee}
                    </div>
                    {task.completedAt && (
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 px-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 ml-4 shadow-sm">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 className="w-7 h-7" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
