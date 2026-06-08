import { useState } from 'react';
import { Send, Trash2, CheckCircle2, Circle, Users, User, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Assignee, Priority } from '../types';
import { cn } from '../utils';

interface OwnerViewProps {
  tasks: Task[];
  addTask: (text: string, assignee: Assignee, priority: Priority) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

export function OwnerView({ tasks, addTask, toggleTask, deleteTask }: OwnerViewProps) {
  const [newTask, setNewTask] = useState('');
  const [assignee, setAssignee] = useState<Assignee>('Entrambi');
  const [priority, setPriority] = useState<Priority>('Media');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(newTask.trim(), assignee, priority);
      setNewTask('');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt);
  const pendingCount = tasks.filter(t => !t.completed).length;

  const PRIORITY_COLORS = {
    Bassa: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Media: 'bg-amber-100 text-amber-700 border-amber-200',
    Alta: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Input Section */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex-none relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
        <h2 className="text-xl font-bold text-slate-800 mb-5">Nuovo Ordine</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Bagnino Assegnato
            </label>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5">
              {(['Entrambi', 'Michele', 'Angelo'] as Assignee[]).map((opt) => {
                const isActive = assignee === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAssignee(opt)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer relative z-10",
                      isActive ? "text-blue-700" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="ownerAssigneeTab"
                        className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {opt === 'Entrambi' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    {opt}
                  </button>
                );
              })}
            </div>

            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Priorità
            </label>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5">
              {(['Bassa', 'Media', 'Alta'] as Priority[]).map((opt) => {
                const isActive = priority === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setPriority(opt)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer relative z-10",
                      isActive ? (
                        opt === 'Bassa' ? 'text-emerald-700' :
                        opt === 'Media' ? 'text-amber-700' :
                        'text-rose-700'
                      ) : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="ownerPriorityTab"
                        className={cn(
                          "absolute inset-0 rounded-xl shadow-sm -z-10",
                          opt === 'Bassa' ? 'bg-emerald-100 border border-emerald-200' :
                          opt === 'Media' ? 'bg-amber-100 border border-amber-200' :
                          'bg-rose-100 border border-rose-200'
                        )}
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {opt === 'Alta' && <AlertCircle className="w-4 h-4" />}
                    {opt}
                  </button>
                );
              })}
            </div>
            
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Descrizione</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="es. Apri ombrellone 12..."
                className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 text-slate-800 font-medium text-lg"
              />
              <button
                type="submit"
                disabled={!newTask.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-2xl shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 disabled:active:scale-100"
              >
                <Send className="w-5 h-5 mr-1" /> Invia
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* List Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <header className="p-6 border-b border-slate-100 flex justify-between items-center flex-none bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tutti gli Ordini</h2>
            <p className="text-sm font-medium text-slate-500">{pendingCount} {pendingCount === 1 ? 'ordine' : 'ordini'} in sospeso</p>
          </div>
        </header>

        <div className="p-6">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedTasks.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10 bg-slate-50 rounded-2xl text-slate-400 text-sm font-medium border border-dashed border-slate-200"
                >
                  Nessun ordine presente.<br/>Scrivine uno per iniziare.
                </motion.div>
              ) : (
                sortedTasks.map(task => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    key={task.id} 
                    className={cn(
                      "flex items-center p-4 border rounded-2xl group transition-all hover:shadow-md relative overflow-hidden",
                      task.completed ? "bg-slate-50 border-slate-100/80 grayscale hover:grayscale-0" : "bg-white border-slate-200"
                    )}
                  >
                    {!task.completed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300 group-hover:bg-blue-400 transition-colors"></div>}
                    <div 
                      className="flex items-center gap-4 flex-1 cursor-pointer pl-1"
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-sm", task.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-slate-400 hover:border-blue-500 hover:text-blue-500 group-hover:border-blue-400")}>
                        {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-bold text-lg uppercase tracking-wide italic transition-all leading-tight mb-1 drop-shadow-sm", 
                          task.completed ? "text-slate-500 line-through drop-shadow-none" : "text-slate-800"
                        )}>
                          {task.text}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border",
                            task.completed ? "bg-slate-200 text-slate-500 border-slate-300" : (task.assignee === 'Entrambi' ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-blue-100 text-blue-700 border-blue-200")
                          )}>
                            {task.assignee === 'Entrambi' ? <Users className="w-3.5 h-3.5"/> : <User className="w-3.5 h-3.5"/>}
                            {task.assignee}
                          </div>
                          {!task.completed && (
                            <div className={cn(
                              "inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm border",
                              PRIORITY_COLORS[task.priority]
                            )}>
                              {task.priority === 'Alta' && <AlertCircle className="w-3.5 h-3.5"/>}
                              {task.priority}
                            </div>
                          )}
                          {task.completed && task.completedAt && (
                            <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 px-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="w-12 h-12 rounded-full flex items-center justify-center text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer shrink-0 ml-3 group-hover:text-rose-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
