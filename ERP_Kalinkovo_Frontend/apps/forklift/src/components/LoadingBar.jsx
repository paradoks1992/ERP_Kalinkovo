// src/components/LoadingBar.jsx
import React from 'react';
export default function LoadingBar({ active }){
  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      <div className={`h-1 bg-brand-600 transition-all duration-300 ${active?'w-full opacity-100':'w-0 opacity-0'}`}
           style={{ boxShadow:'0 0 6px rgba(62,143,77,.6)' }}/>
    </div>
  );
}
