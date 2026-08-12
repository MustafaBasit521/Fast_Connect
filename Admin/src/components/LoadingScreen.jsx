function LoadingScreen() {
  return (
    <div className="loader-overlay">
      <div className="pulse-box">
        <div className="pulse-ring-1"></div>
        <div className="pulse-ring-2"></div>
        <div className="pulse-logo">FC</div>
      </div>
      <div className="pulse-tagline">Admin Portal</div>
    </div>
  )
}

export default LoadingScreen
