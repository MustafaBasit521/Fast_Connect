import { Link } from "react-router-dom"

function LegalLayout({ title, children }) {
  return (
    <div className="min-h-screen p-6 md:p-12" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <Link to="/feed" className="text-sm" style={{ color: "var(--color-accent)" }}>← Back to FAST Connect</Link>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex flex-col gap-4 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default LegalLayout
