function Particles({ count = 25, color = "255, 255, 255" }) {
  const particles = Array.from({ length: count })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => {
        const left = Math.random() * 100
        const size = 2 + Math.random() * 6
        const duration = 8 + Math.random() * 8
        const delay = Math.random() * 10
        const opacity = 0.3 + Math.random() * 0.5

        return (
          <span
            key={i}
            className="particle"
            style={{
              left: `${left}%`,
              bottom: 0,
              width: `${size}px`,
              height: `${size}px`,
              background: `rgba(${color}, ${opacity})`,
              boxShadow: size > 5 ? `0 0 ${size}px rgba(${color}, 0.5)` : "none",
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}

export default Particles
