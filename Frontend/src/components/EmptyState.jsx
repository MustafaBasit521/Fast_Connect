import React from 'react';

export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="post-card flex flex-col items-center justify-center p-10 text-center rounded-lg mt-4">
      <Icon className="w-10 h-10 mb-4" strokeWidth={1.5} style={{ color: "var(--color-muted)" }} />
      <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>{title}</h3>
      <p className="text-sm max-w-sm" style={{ color: "var(--color-muted)" }}>{message}</p>
    </div>
  );
}
