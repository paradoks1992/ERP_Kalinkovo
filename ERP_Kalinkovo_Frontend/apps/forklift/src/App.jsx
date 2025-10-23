// src/App.jsx
import React from "react";
import { Routes, Route, useNavigate, Link } from "react-router-dom";
import SelectOperationPage from "./pages/SelectOperationPage";
import InboundForm from "./pages/InboundForm";
import OutboundForm from "./pages/OutboundForm";
import { ToasterProvider } from "./components/Toaster";
import LoadingBar from "./components/LoadingBar";
import StatusBar from "./components/StatusBar";
import { TaskProvider } from "./context/TaskContext";
import "./index.css";

export default function App() {
  const nav = useNavigate();
  const [loading] = React.useState(false);

  return (
    <ToasterProvider>
      <TaskProvider>
        <LoadingBar active={loading} />
        <div className="min-h-full bg-brand-50">
          <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
            <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-4">
              <div className="text-xl font-semibold text-brand-800">Карщик</div>
              <nav className="ml-auto flex gap-3">
                <button
                  onClick={() => nav("/")}
                  className="px-3 py-1.5 rounded-lg border border-brand-200 bg-white hover:bg-brand-50"
                >
                  Операции
                </button>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-3xl px-4 py-6">
            <Routes>
              <Route path="/" element={<SelectOperationPage />} />
              <Route path="/inbound" element={<InboundForm />} />
              <Route path="/outbound" element={<OutboundForm />} />
              <Route
                path="*"
                element={
                  <div className="text-brand-700">
                    Страница не найдена.{" "}
                    <Link to="/" className="underline">
                      Назад
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>

          <footer className="mx-auto max-w-3xl px-4 pb-6">
            <StatusBar />
          </footer>
        </div>
      </TaskProvider>
    </ToasterProvider>
  );
}
