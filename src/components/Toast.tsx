'use client';

import React from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
  const color = type === 'error' ? 'var(--error)' : 'var(--primary)';

  return (
    <div className={`toast-notification glass-panel toast-${type}`}>
      <span className="material-symbols-outlined" style={{ color, fontSize: '20px' }}>{icon}</span>
      <span className="font-body-md" style={{ color: 'var(--on-surface)' }}>{message}</span>
      <button onClick={onClose} style={{ marginLeft: 'auto', display: 'flex', color: 'var(--on-surface-variant)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
      </button>
    </div>
  );
}
