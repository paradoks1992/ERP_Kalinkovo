// src/context/TaskContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  listAssignedTasks,
  acceptTask,
  completeTask,
  progressTask,
} from "@/lib/api";
import { useQueueStore } from "@/state/useQueueStore.js";

const TaskCtx = createContext(null);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const { setLastMessage } = useQueueStore();

  const load = async () => {
    try {
      const list = await listAssignedTasks();
      setTasks(list || []);
      if (activeTask) {
        const fresh = (list || []).find((t) => t.id === activeTask.id);
        setActiveTask(fresh || null);
      }
    } catch (e) {
      setLastMessage("Не удалось загрузить задачи: " + (e?.message || ""));
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const value = {
    tasks,
    activeTask,
    setActiveTask,
    refresh: load,
    async accept(taskId) {
      await acceptTask(taskId);
      setLastMessage("Задача принята");
      await load();
    },
    async complete(taskId) {
      await completeTask(taskId);
      setLastMessage("Задача выполнена");
      await load();
    },
    async progress(taskId, qty, comment) {
      await progressTask(taskId, qty, comment);
      await load();
    },
  };

  return <TaskCtx.Provider value={value}>{children}</TaskCtx.Provider>;
}

export const useTasks = () => useContext(TaskCtx);
