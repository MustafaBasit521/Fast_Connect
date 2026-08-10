function Fireflies({ count = 12 }) {
  const flies = Array.from({ length: count })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {flies.map((_, i) => {
        const left = Math.random() * 100
        const top = Math.random() * 100
        const delay = Math.random() * 6

        return (
          <span
            key={i}
            className="firefly"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}

export default Fireflies
