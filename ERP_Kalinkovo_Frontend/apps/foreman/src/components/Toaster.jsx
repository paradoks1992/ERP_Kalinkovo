// src/components/Toaster.jsx
import React from 'react';
const Ctx = React.createContext(null);

export function ToasterProvider({ children }){
  const [items, setItems] = React.useState([]);
  const push = React.useCallback((type,text,ms=3000)=>{
    const id = crypto.randomUUID();
    setItems(v=>[...v,{id,type,text}]);
    setTimeout(()=>setItems(v=>v.filter(i=>i.id!==id)), ms);
  },[]);
  const api = React.useMemo(()=>({
    success:t=>push('success',t),
    error:t=>push('error',t,5000),
    info:t=>push('info',t),
  }),[push]);
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {items.map(i=>(
          <div key={i.id}
               className={`px-4 py-3 rounded-xl2 shadow border text-sm bg-white ${
                 i.type==='success'?'border-emerald-200 text-emerald-800':
                 i.type==='error'?'border-rose-200 text-rose-800':'border-brand-200 text-brand-800'}`}>
            {i.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export function useToaster(){
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useToaster must be used within ToasterProvider');
  return ctx;
}
