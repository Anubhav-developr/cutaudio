import { useEffect, useState } from "react";
import { AudioLines } from "lucide-react";
import "./Startup.css";

export default function Startup({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const duration = 2800;

    let frame;

    const animate = (now) => {
      const elapsed = now - start;
      const value = Math.min(100, (elapsed / duration) * 100);

      setProgress(Math.floor(value));

      if (value < 100) {
        frame = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setExiting(true);

          setTimeout(() => {
            onComplete?.();
          }, 650);
        }, 250);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  return (
    <div className={`startup ${exiting ? "startup-exit" : ""}`}>
      <div className="startup-glow glow-one" />
      <div className="startup-glow glow-two" />

      {/* Animated equalizer background */}
      <div className="startup-equalizer">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="equalizer-bar"
            style={{
              animationDelay: `${i * 0.035}s`,
              height: `${20 + Math.random() * 80}%`,
            }}
          />
        ))}
      </div>

      {/* Main logo */}
      <div className="startup-content">
        <div className="startup-logo">
          <div className="logo-orbit orbit-one" />
          <div className="logo-orbit orbit-two" />

          <div className="startup-logo-inner">
            <img src="/icon.svg" alt="AudioTrim" />
          </div>

          <div className="logo-spark spark-one" />
          <div className="logo-spark spark-two" />
        </div>

        <div className="startup-title">
          <h1>
            Audio<span>Trim</span>
          </h1>
          <div className="startup-subtitle">
            <AudioLines size={13} />
            <span>YOUR AUDIO. YOUR CANVAS.</span>
          </div>
        </div>

        {/* Waveform animation */}
        <div className="startup-wave">
          {Array.from({ length: 72 }).map((_, i) => (
            <div
              key={i}
              className="startup-wave-bar"
              style={{
                animationDelay: `${i * 0.018}s`,
                height: `${12 + Math.abs(Math.sin(i * 0.4)) * 75}%`,
              }}
            />
          ))}
        </div>

        {/* Loading */}
        <div className="startup-loading">
          <div className="loading-info">
            <span>INITIALISING AUDIO ENGINE</span>
            <span className="loading-percent">{progress}%</span>
          </div>

          <div className="loading-track">
            <div className="loading-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="startup-footer">
        <span>PRECISION AUDIO EDITING</span>
        <span>BUILT WITH ♥</span>
      </div>
    </div>
  );
}
