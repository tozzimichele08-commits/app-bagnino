import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import { createClient } from "@supabase/supabase-js";

const PORT = 3000;

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  assignee: 'Michele' | 'Angelo' | 'Entrambi';
  priority: 'Bassa' | 'Media' | 'Alta';
}

// In-memory fallback if Supabase is not configured
let fallbackTasks: Task[] = [
  { id: '1', text: 'Apri ombrellone 2', completed: false, createdAt: Date.now() - 60000, assignee: 'Entrambi', priority: 'Media' },
  { id: '2', text: 'Chiudi ombrellone 5', completed: true, createdAt: Date.now() - 360000, completedAt: Date.now() - 300000, assignee: 'Michele', priority: 'Bassa' },
  { id: '3', text: "Dai delle sdraio all'ombrellone 8", completed: false, createdAt: Date.now(), assignee: 'Angelo', priority: 'Alta' },
];

const envSupabaseUrl = process.env.SUPABASE_URL;
const supabaseUrl = (envSupabaseUrl && envSupabaseUrl.startsWith("http")) ? envSupabaseUrl : "https://wjlukusfezyzxzgwcuzj.supabase.co";
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseUrl.startsWith("http") && supabaseKey && supabaseKey.length > 10) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
  }
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/tasks", async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('tasks').select('*').order('createdAt', { ascending: true });
        if (error) {
          console.error("Supabase fetch error:", error);
          // Fallback to local memory if supabase table is missing or errors
          return res.json({ tasks: fallbackTasks });
        }
        return res.json({ tasks: data });
      } catch (e) {
        console.error(e);
        return res.json({ tasks: fallbackTasks });
      }
    }
    // Fallback
    res.json({ tasks: fallbackTasks });
  });

  app.post("/api/tasks", async (req, res) => {
    const { text, assignee, priority } = req.body;
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      text: text || '',
      completed: false,
      createdAt: Date.now(),
      assignee: assignee || 'Entrambi',
      priority: priority || 'Media'
    };
    
    if (supabase) {
      try {
        const { error } = await supabase.from('tasks').insert([newTask]);
        if (error) {
          console.error("Supabase insert error:", error);
          fallbackTasks.push(newTask);
        }
      } catch (e) {
        console.error(e);
        fallbackTasks.push(newTask);
      }
    } else {
      fallbackTasks.push(newTask);
    }
    
    res.json({ task: newTask });
  });

  app.put("/api/tasks/:id/toggle", async (req, res) => {
    const { id } = req.params;
    
    if (supabase) {
      try {
        const { data: fetchResult, error: fetchErr } = await supabase.from('tasks').select('*').eq('id', id).single();
        if (fetchErr || !fetchResult) {
          // fallback
          const task = fallbackTasks.find(t => t.id === id);
          if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? Date.now() : undefined;
            return res.json({ task });
          }
          return res.status(404).json({ error: "Task not found" });
        }
        
        const completed = !fetchResult.completed;
        const completedAt = completed ? Date.now() : null;
        
        const { error } = await supabase.from('tasks').update({ completed, completedAt }).eq('id', id);
        if (error) {
          console.error("Supabase update error:", error);
        }
        
        const updatedTask = { ...fetchResult, completed, completedAt };
        return res.json({ task: updatedTask });
      } catch (e) {
        console.error(e);
        // fallback
        const task = fallbackTasks.find(t => t.id === id);
        if (task) {
          task.completed = !task.completed;
          task.completedAt = task.completed ? Date.now() : undefined;
          return res.json({ task });
        }
        return res.status(500).json({ error: "Internal server error" });
      }
    } else {
      const task = fallbackTasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? Date.now() : undefined;
        res.json({ task });
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    
    if (supabase) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) {
          console.error("Supabase delete error:", error);
        }
        fallbackTasks = fallbackTasks.filter(t => t.id !== id);
        return res.json({ success: true });
      } catch (e) {
        console.error(e);
        fallbackTasks = fallbackTasks.filter(t => t.id !== id);
        return res.json({ success: true });
      }
    } else {
      fallbackTasks = fallbackTasks.filter(t => t.id !== id);
      res.json({ success: true });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
