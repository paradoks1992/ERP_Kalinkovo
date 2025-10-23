// src/App.jsx
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import CreateOrder from './pages/CreateOrder';
import Orders from './pages/Orders';
import { ToasterProvider } from './components/Toaster';
import LoadingBar from './components/LoadingBar';
import { useOrdersStore } from './state/useOrdersStore';

export default function App(){
  const nav = useNavigate();
  const loading = useOrdersStore(s => s.loading);

  return (
    <ToasterProvider>
      <LoadingBar active={loading} />
      <div className="min-h-full bg-brand-50">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
            <div className="text-xl font-semibold text-brand-800">Менеджер</div>
            <nav className="ml-auto flex gap-3">
              <button onClick={()=>nav('/')} className="px-3 py-1.5 rounded-lg border border-brand-200 bg-white hover:bg-brand-50">Задачи</button>
              <button onClick={()=>nav('/new')} className="px-3 py-1.5 rounded-lg bg-brand-600 text-white">Новая задача</button>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Routes>
            <Route path="/" element={<Orders/>}/>
            <Route path="/new" element={<CreateOrder/>}/>
            <Route path="*" element={<div className="text-brand-700">Страница не найдена. <Link to="/" className="underline">Назад</Link></div>}/>
          </Routes>
        </main>
      </div>
    </ToasterProvider>
  );
}
