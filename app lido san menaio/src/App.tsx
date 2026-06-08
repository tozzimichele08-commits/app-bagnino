import { useState } from 'react';
import { ShieldCheck, LifeBuoy, Waves } from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { OwnerView } from './components/OwnerView';
import { LifeguardView } from './components/LifeguardView';

export default function App() {
  const [role, setRole] = useState<'bagnino' | 'titolare'>('bagnino');
  const { tasks, connected, addTask, toggleTask, deleteTask } = useTasks();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">Lido San Menaio <span className="text-blue-400">Sync</span></span>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setRole('bagnino')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                role === 'bagnino' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              Bagnino
            </button>
            <button
              onClick={() => setRole('titolare')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                role === 'titolare' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Titolare
            </button>
          </div>
        </div>
        {!connected && (
          <div className="bg-amber-500/20 text-amber-300 text-xs text-center py-1.5 font-medium flex items-center justify-center gap-2 border-t border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Server non raggiungibile. Riprovo...
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 transition-all duration-300">
        {role === 'bagnino' ? (
          <LifeguardView tasks={tasks} toggleTask={toggleTask} />
        ) : (
          <OwnerView 
            tasks={tasks} 
            addTask={addTask} 
            toggleTask={toggleTask} 
            deleteTask={deleteTask} 
          />
        )}
      </main>
    </div>
  );
}
