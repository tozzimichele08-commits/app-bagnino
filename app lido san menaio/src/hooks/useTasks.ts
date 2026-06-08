import { useState, useEffect, useCallback } from 'react';
import { Task, Assignee, Priority } from '../types';
import { supabase } from '../supabaseClient';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [connected, setConnected] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('tasks').select('*').order('createdAt', { ascending: true });
        if (error) {
          console.error("Supabase fetch error:", error);
          setConnected(false);
          return;
        }
        
        setTasks(prev => {
          if (prev.length > 0 && prev.length < (data || []).length) {
            playNotificationSound();
          }
          return data || [];
        });
        setConnected(true);
      } catch (e) {
        console.error(e);
        setConnected(false);
      }
    } else {
      // Fallback to local storage
      const localTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      setTasks(localTasks);
      setConnected(true);
    }
  }, []);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchTasks();
    
    if (supabase) {
      // Configurazione realtime di Supabase
      const channel = supabase
        .channel('tasks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
          },
          (payload) => {
            console.log('Cambio rilevato nel DB!', payload);
            fetchTasks();
          }
        )
        .subscribe();

      // Manteniamo anche un poll periodico più lento per sicurezza
      const interval = setInterval(fetchTasks, 5000);
      return () => {
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    } else {
      const interval = setInterval(fetchTasks, 3000);
      return () => clearInterval(interval);
    }
  }, [fetchTasks]);

  useEffect(() => {
    if (!supabase) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = useCallback(async (text: string, assignee: Assignee, priority: Priority) => {
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      assignee,
      priority,
      completed: false,
      createdAt: Date.now()
    };
    
    setTasks(prev => [...prev, newTask]);

    if (supabase) {
      try {
        await supabase.from('tasks').insert([newTask]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    const now = Date.now();
    let currentTask: Task | null = null;
    
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        currentTask = { ...t, completed: !t.completed, completedAt: !t.completed ? now : undefined };
        return currentTask;
      }
      return t;
    }));

    if (supabase && currentTask) {
      try {
        await supabase.from('tasks').update({ 
          completed: (currentTask as Task).completed, 
          completedAt: (currentTask as Task).completedAt 
        }).eq('id', id);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return { tasks, connected, addTask, toggleTask, deleteTask };
}
