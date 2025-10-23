import React from "react";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-screen-md mx-auto px-3 py-2 flex items-center gap-3">
        <img src="/logo.jpg" alt="Калинково" className="h-9 w-auto" />
        <div className="flex-1">
          <h1 className="text-xl font-bold">Карщик</h1>
          <p className="text-xs text-slate-500">
            Быстрый ввод операций. Работает офлайн.
          </p>
        </div>
      </div>
    </header>
  );
}
