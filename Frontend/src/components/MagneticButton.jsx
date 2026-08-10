import { useRef } from "react"

function MagneticButton({ children, className = "", ...props }) {
  const ref = useRef(null)

  function handleMouseMove(e) {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) * 0.2
    const deltaY = (e.clientY - centerY) * 0.2

    el.style.transform = `translate(${deltaX}px, ${deltaY}px)`
  }

  function handleMouseLeave() {
    if (ref.current) ref.current.style.transform = "translate(0, 0)"
  }

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-btn rounded px-4 py-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default MagneticButton
