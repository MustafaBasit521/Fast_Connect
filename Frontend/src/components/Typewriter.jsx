import { useState, useEffect } from "react"

function Typewriter({ text, typeSpeed = 100, deleteSpeed = 50, pauseAfterType = 1500, pauseAfterDelete = 500 }) {
  const [displayed, setDisplayed] = useState("")
  const [phase, setPhase] = useState("typing")

  useEffect(() => {
    let timeout

    if (phase === "typing") {
      if (displayed.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayed(text.slice(0, displayed.length + 1))
        }, typeSpeed)
      } else {
        timeout = setTimeout(() => setPhase("deleting"), pauseAfterType)
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(text.slice(0, displayed.length - 1))
        }, deleteSpeed)
      } else {
        timeout = setTimeout(() => setPhase("typing"), pauseAfterDelete)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayed, phase, text, typeSpeed, deleteSpeed, pauseAfterType, pauseAfterDelete])

  return <span className="typewriter">{displayed}</span>
}

export default Typewriter
