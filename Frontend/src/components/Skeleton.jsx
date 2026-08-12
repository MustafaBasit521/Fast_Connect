import React from 'react';

export function PostSkeleton() {
  return (
    <div className="post-card border rounded-lg p-4 mb-4 flex flex-col gap-3 animate-pulse" style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full" style={{ backgroundColor: "var(--color-border)" }}></div>
        <div className="h-4 rounded w-1/3" style={{ backgroundColor: "var(--color-border)" }}></div>
      </div>
      <div className="h-3 rounded w-full mt-2" style={{ backgroundColor: "var(--color-border)" }}></div>
      <div className="h-3 rounded w-5/6" style={{ backgroundColor: "var(--color-border)" }}></div>
      <div className="h-32 rounded w-full mt-3" style={{ backgroundColor: "var(--color-border)" }}></div>
    </div>
  );
}
