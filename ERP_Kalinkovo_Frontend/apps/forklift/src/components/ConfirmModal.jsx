import React from 'react';

export default function ConfirmModal({ open, title='Подтвердите', children, onCancel, onConfirm, confirmText='ОК'}){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel}/>
      <div className="relative z-50 w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-5 border border-brand-100 shadow-lg">
        <div className="text-lg font-semibold text-brand-800 mb-2">{title}</div>
        <div className="text-brand-800/90 mb-4">{children}</div>
        <div className="flex gap-3 justify-end">
          <button className="px-4 py-2 rounded-xl2 border border-brand-200" onClick={onCancel}>Отмена</button>
          <button className="px-4 py-2 rounded-xl2 bg-brand-600 text-white" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
