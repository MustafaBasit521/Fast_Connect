// Inline (not <img>) on purpose — an <img src="/logo.svg"> can't be recolored with
// currentColor, so it would look wrong on the dark panel/dark theme. Inlined here, the
// icon + wordmark both use currentColor and pick up whatever text color is active.
function Logo({ className = "h-8 w-auto" }) {
  return (
    <svg viewBox="0 0 320 80" className={className} xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" transform="translate(10, 5)">
        <path d="M 42,18 C 30,18 22,26 22,38 C 22,54 36,64 42,68 C 48,64 50,58 50,54" />
        <path d="M 40,28 C 32,28 29,33 29,40 C 29,50 38,57 42,59" />

        <line x1="28" y1="23" x2="18" y2="15" />
        <circle cx="18" cy="15" r="4" fill="currentColor" />

        <line x1="42" y1="18" x2="42" y2="8" />
        <circle cx="42" cy="8" r="4" fill="currentColor" />

        <line x1="52" y1="24" x2="60" y2="16" />
        <circle cx="60" cy="16" r="4" fill="currentColor" />

        <line x1="22" y1="38" x2="10" y2="38" />
        <circle cx="10" cy="38" r="4" fill="currentColor" />

        <line x1="26" y1="52" x2="16" y2="60" />
        <circle cx="16" cy="60" r="4" fill="currentColor" />
      </g>

      <text x="85" y="48" fill="currentColor" fontFamily="Inter, system-ui, -apple-system, sans-serif" fontSize="26" letterSpacing="0.5">
        <tspan fontWeight="700">FAST </tspan>
        <tspan fontWeight="400" opacity="0.75">Connect</tspan>
      </text>
    </svg>
  )
}

export default Logo
