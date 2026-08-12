import React from 'react';

export function EmptyState({ icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border rounded-lg mt-4" style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-primary, #ffb703)" }}>{title}</h3>
      <p className="text-sm max-w-sm" style={{ color: "var(--color-muted, #9ca3af)" }}>{message}</p>
    </div>
  );
}
