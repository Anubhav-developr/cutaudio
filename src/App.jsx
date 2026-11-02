import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Play,
  Pause,
  Scissors,
  Download,
  Music2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Volume2,
} from "lucide-react";
import "./App.css";

export default function App() {
  const [viewStart, setViewStart] = useState(0);
  const [viewEnd, setViewEnd] = useState(0);
  const [buffer, setBuffer] = useState(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [filename, setFilename] = useState("");
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);
  const sourceRef = useRef(null);
  const contextRef = useRef(null);
  const animationRef = useRef(null);
  const dragRef = useRef(null);
  const startRef = useRef(0);
  const endRef = useRef(0);
  const durationRef = useRef(0);
  const playheadRef = useRef(0);
  const playingRef = useRef(false);
  const offsetRef = useRef(0);
  const startedAtRef = useRef(0);

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return "00:00.000";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 1000);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
  };

  const stopAudio = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);

    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {}
      sourceRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    stopAudio();
    setLoading(true);

    try {
      const ctx = new AudioContext();
      contextRef.current = ctx;

      const decoded = await ctx.decodeAudioData(await file.arrayBuffer());

      setBuffer(decoded);
      setDuration(decoded.duration);
      setStart(0);
      setEnd(decoded.duration);
      setCurrentTime(0);
      setFilename(file.name);

      startRef.current = 0;
      endRef.current = decoded.duration;
      durationRef.current = decoded.duration;
      playheadRef.current = 0;
      offsetRef.current = 0;
      setZoom(1);
      setViewStart(0);
      setViewEnd(decoded.duration);
    } catch (err) {
      console.error(err);
      alert("Audio could not be loaded. Try another audio file.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // Keep refs synchronized
  useEffect(() => {
    startRef.current = start;
    endRef.current = end;
    durationRef.current = duration;
  }, [start, end, duration]);

  // Convert time to canvas X position
  const timeToX = (time, width) =>
    ((time - viewStart) / (viewEnd - viewStart)) * width;

  const xToTime = (x, width) =>
    Math.max(
      viewStart,
      Math.min(viewEnd, viewStart + (x / width) * (viewEnd - viewStart)),
    );

  // Draw waveform, selection, handles, and playhead
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !buffer) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const mid = height / 2;
    const data = buffer.getChannelData(0);
    const visibleStartSample = Math.floor(viewStart * buffer.sampleRate);
    const visibleEndSample = Math.floor(viewEnd * buffer.sampleRate);

    const samplesPerPixel = Math.max(
      1,
      Math.floor((visibleEndSample - visibleStartSample) / width),
    );

    const sx = timeToX(startRef.current, width);
    const ex = timeToX(endRef.current, width);

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#100e18";
    ctx.fillRect(0, 0, width, height);

    // Waveform
    for (let x = 0; x < width; x++) {
      const index = visibleStartSample + Math.floor(x * samplesPerPixel);
      let min = 1;
      let max = -1;

      for (let j = 0; j < samplesPerPixel; j++) {
        const val = data[index + j] || 0;
        if (val < min) min = val;
        if (val > max) max = val;
      }

      const selected = x >= sx && x <= ex;

      ctx.strokeStyle = selected ? "#a78bfa" : "#494158";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, mid + min * mid * 0.9);
      ctx.lineTo(x, mid + max * mid * 0.9);
      ctx.stroke();
    }

    // Dim unselected areas
    ctx.fillStyle = "rgba(8,7,12,0.55)";
    ctx.fillRect(0, 0, sx, height);
    ctx.fillRect(ex, 0, width - ex, height);

    // Selected region border
    ctx.fillStyle = "rgba(139,92,246,0.08)";
    ctx.fillRect(sx, 0, ex - sx, height);

    // Selection boundaries
    ctx.strokeStyle = "#c4b5fd";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
    ctx.moveTo(ex, 0);
    ctx.lineTo(ex, height);
    ctx.stroke();

    // Handle caps
    [sx, ex].forEach((x) => {
      ctx.fillStyle = "#a78bfa";
      ctx.beginPath();
      ctx.roundRect(x - 4, 0, 8, height, 4);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(x - 1, height / 2 - 12, 2, 24, 2);
      ctx.fill();
    });

    // Playhead line
    const px = timeToX(playheadRef.current, width);

    ctx.strokeStyle = "#fb7185";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, height);
    ctx.stroke();

    // Playhead top marker
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.moveTo(px - 6, 0);
    ctx.lineTo(px + 6, 0);
    ctx.lineTo(px, 10);
    ctx.closePath();
    ctx.fill();

    // Current time bubble
    const label = formatTime(playheadRef.current);
    ctx.font = "bold 10px monospace";
    const textWidth = ctx.measureText(label).width + 12;
    const bubbleX = Math.min(
      Math.max(px - textWidth / 2, 2),
      width - textWidth - 2,
    );

    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.roundRect(bubbleX, 14, textWidth, 19, 5);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(label, bubbleX + textWidth / 2, 27);
  }, [buffer, duration, start, end, currentTime, zoom, viewStart, viewEnd]);

  // Redraw whenever selection or zoom changes
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform, start, end, currentTime, zoom]);

  // Handle resize
  useEffect(() => {
    const onResize = () => drawWaveform();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawWaveform]);

  // Mouse / touch position
  const getCanvasTime = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return xToTime(x, rect.width);
  };

  // Direct waveform interaction
  const handlePointerDown = (e) => {
    if (!buffer) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    const sx = timeToX(start, width);
    const ex = timeToX(end, width);
    const px = timeToX(currentTime, width);

    const distanceStart = Math.abs(x - sx);
    const distanceEnd = Math.abs(x - ex);
    const distancePlayhead = Math.abs(x - px);

    let mode = "seek";

    if (distanceStart < 14) mode = "start";
    else if (distanceEnd < 14) mode = "end";
    else if (distancePlayhead < 12) mode = "playhead";
    else {
      const t = getCanvasTime(e);
      playheadRef.current = t;
      offsetRef.current = t;
      setCurrentTime(t);
    }

    dragRef.current = mode;
    canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current || !buffer) return;

    const t = getCanvasTime(e);
    const minGap = 0.05;

    if (dragRef.current === "start") {
      const value = Math.max(0, Math.min(t, endRef.current - minGap));
      startRef.current = value;
      setStart(value);
    } else if (dragRef.current === "end") {
      const value = Math.min(duration, Math.max(t, startRef.current + minGap));
      endRef.current = value;
      setEnd(value);
    } else if (dragRef.current === "playhead") {
      playheadRef.current = t;
      offsetRef.current = t;
      setCurrentTime(t);
    } else if (dragRef.current === "seek") {
      playheadRef.current = t;
      offsetRef.current = t;
      setCurrentTime(t);
    }
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  // Playback animation
  const animate = () => {
    if (!playingRef.current || !contextRef.current) return;

    const ctx = contextRef.current;
    const now = ctx.currentTime;
    const elapsed = now - startedAtRef.current;
    const next = offsetRef.current + elapsed;

    if (next >= endRef.current) {
      playheadRef.current = startRef.current;
      setCurrentTime(startRef.current);
      stopAudio();
      drawWaveform();
      return;
    }

    playheadRef.current = next;
    setCurrentTime(next);
    drawWaveform();

    animationRef.current = requestAnimationFrame(animate);
  };

  // Start playback from playhead
  const togglePlay = async () => {
    if (!buffer) return;

    if (playing) {
      stopAudio();
      return;
    }

    let ctx = contextRef.current;
    if (!ctx || ctx.state === "closed") {
      ctx = new AudioContext();
      contextRef.current = ctx;
    }

    if (ctx.state === "suspended") await ctx.resume();

    let offset = playheadRef.current;

    if (offset < startRef.current || offset >= endRef.current) {
      offset = startRef.current;
    }

    offsetRef.current = offset;
    startedAtRef.current = ctx.currentTime;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0, offset, endRef.current - offset);

    sourceRef.current = source;
    playingRef.current = true;
    setPlaying(true);

    source.onended = () => {
      if (!playingRef.current) return;

      playingRef.current = false;
      setPlaying(false);
      sourceRef.current = null;
      playheadRef.current = startRef.current;
      offsetRef.current = startRef.current;
      setCurrentTime(startRef.current);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      drawWaveform();
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Export trimmed audio as WAV
  const exportAudio = () => {
    if (!buffer) return;

    const sampleRate = buffer.sampleRate;
    const from = Math.floor(start * sampleRate);
    const to = Math.floor(end * sampleRate);
    const length = to - from;
    const channels = buffer.numberOfChannels;

    if (length <= 0) return;

    const out = new AudioBuffer({
      numberOfChannels: channels,
      length,
      sampleRate,
    });

    for (let ch = 0; ch < channels; ch++) {
      out.getChannelData(ch).set(buffer.getChannelData(ch).subarray(from, to));
    }

    const blob = encodeWAV(out);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${filename.replace(/\.[^/.]+$/, "")}_trimmed.wav`;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // WAV encoding
  const encodeWAV = (audioBuffer) => {
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const frames = audioBuffer.length;
    const size = frames * channels * 2;

    const ab = new ArrayBuffer(44 + size);
    const view = new DataView(ab);

    const write = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    write(0, "RIFF");
    view.setUint32(4, 36 + size, true);
    write(8, "WAVE");
    write(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true);
    write(36, "data");
    view.setUint32(40, size, true);

    let offset = 44;

    for (let i = 0; i < frames; i++) {
      for (let ch = 0; ch < channels; ch++) {
        let sample = audioBuffer.getChannelData(ch)[i];
        sample = Math.max(-1, Math.min(1, sample));

        view.setInt16(
          offset,
          sample < 0 ? sample * 32768 : sample * 32767,
          true,
        );

        offset += 2;
      }
    }

    return new Blob([ab], { type: "audio/wav" });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (
        e.code === "Space" &&
        buffer &&
        !["INPUT", "BUTTON"].includes(e.target.tagName)
      ) {
        e.preventDefault();
        togglePlay();
      }

      if (e.key === "Escape") stopAudio();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [buffer, playing]);

  const resetTrim = () => {
    stopAudio();
    setStart(0);
    setEnd(duration);
    setCurrentTime(0);
    startRef.current = 0;
    endRef.current = duration;
    playheadRef.current = 0;
    offsetRef.current = 0;
  };

  const zoomIn = () => {
    const currentRange = viewEnd - viewStart;
    const newRange = Math.max(duration / 100, currentRange / 1.5);
    const center = (viewStart + viewEnd) / 2;

    setViewStart(Math.max(0, center - newRange / 2));
    setViewEnd(Math.min(duration, center + newRange / 2));
  };



const zoomOut = () => {
  const currentRange = viewEnd - viewStart;

  if (currentRange >= duration) return;

  const newRange = Math.min(duration, currentRange * 1.5);

  const center = (viewStart + viewEnd) / 2;

  let left = center - newRange / 2;
  let right = center + newRange / 2;

  if (left < 0) {
    right = Math.min(duration, right - left);
    left = 0;
  }

  if (right > duration) {
    left = Math.max(0, left - (right - duration));
    right = duration;
  }

  setViewStart(left);
  setViewEnd(right);
};


  const resetZoom = () => {
    setViewStart(0);
    setViewEnd(duration);
  };

  const selectAll = () => {
    setStart(0);
    setEnd(duration);
    startRef.current = 0;
    endRef.current = duration;
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (contextRef.current && contextRef.current.state !== "closed") {
        contextRef.current.close();
      }
    };
  }, [stopAudio]);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="logo">
            <Scissors size={22} />
          </div>
          <span>
            Audio<span className="brand-accent">Trim</span>
          </span>
        </div>
        <span className="header-tag">100% PRIVATE · LOCAL</span>
      </header>

      <main className="main">
        <div className="hero">
          <div className="hero-badge">✦ AUDIO STUDIO</div>
          <h1>
            Trim audio.
            <br />
            <span>Keep what matters.</span>
          </h1>
          <p>Precision audio cutting, made simple.</p>
        </div>

        {!buffer ? (
          <label className="upload-card">
            <input
              type="file"
              accept="audio/*"
              hidden
              onChange={handleUpload}
            />
            <div className="upload-icon">
              <Upload size={30} />
            </div>
            <h3>{loading ? "Processing audio..." : "Drop your audio here"}</h3>
            <p>MP3, WAV, OGG, M4A, FLAC and more</p>
            <span className="upload-btn">
              <Upload size={17} /> Choose audio file
            </span>
            <span className="privacy-note">
              Your files never leave your device
            </span>
          </label>
        ) : (
          <section className="editor">
            <div className="file-info">
              <div className="file-icon">
                <Music2 size={22} />
              </div>
              <div className="file-details">
                <strong>{filename}</strong>
                <span>
                  {formatTime(duration)} ·{" "}
                  {(buffer.sampleRate / 1000).toFixed(1)} kHz
                </span>
              </div>
              <label className="change-file">
                Change
                <input
                  type="file"
                  accept="audio/*"
                  hidden
                  onChange={handleUpload}
                />
              </label>
            </div>

            <div className="wave-toolbar">
              <span className="wave-label">WAVEFORM EDITOR</span>
              <div className="zoom-tools">
                <button
                  onClick={zoomOut}
                  disabled={viewEnd - viewStart >= duration}
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <span>{(duration / (viewEnd - viewStart)).toFixed(1)}×</span>
                <button onClick={zoomIn} disabled={zoom >= 8} title="Zoom in">
                  <ZoomIn size={16} />
                </button>
                <button onClick={resetZoom} title="Fit entire audio">
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>

            <div className="timeline-scroll">
              <input
                type="range"
                min={0}
                max={Math.max(0, duration - (viewEnd - viewStart))}
                step={0.01}
                value={viewStart}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setViewStart(value);
                  setViewEnd(value + (viewEnd - viewStart));
                }}
              />
            </div>

            <div className="wave-container">
              <canvas
                ref={canvasRef}
                className="waveform"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              />
              <div className="wave-times">
                <span>0:00</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* <div className="trim-controls">
              <div className="control-heading">
                <span>
                  <Scissors size={16} /> TRIM SELECTION
                </span>
                <button onClick={resetTrim}>
                  <RotateCcw size={14} /> Reset
                </button>
              </div>

              <div className="range-block">
                <div className="range-label">
                  <span>Start time</span>
                  <strong>{formatTime(start)}</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.001}
                  value={start}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v < end - 0.05) setStart(v);
                  }}
                />
              </div>

              <div className="range-block">
                <div className="range-label">
                  <span>End time</span>
                  <strong>{formatTime(end)}</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={0.001}
                  value={end}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v > start + 0.05) setEnd(v);
                  }}
                />
              </div>

              <div className="selection-info">
                <Volume2 size={16} />
                <span>Selected duration</span>
                <strong>{formatTime(end - start)}</strong>
              </div>
            </div> */}

            <div className="action-buttons">
              <button className="play-btn" onClick={togglePlay}>
                {playing ? <Pause size={18} /> : <Play size={18} />}
                {playing ? "Pause preview" : "Preview selection"}
                <span className="shortcut">SPACE</span>
              </button>
              <button className="export-btn" onClick={exportAudio}>
                <Download size={18} /> Export WAV
              </button>
            </div>

            <div className="editor-tip">
              <span>💡</span> Drag the purple handles to trim. Click anywhere on
              the waveform to seek.
            </div>

            <button
              className="remove-audio"
              onClick={() => {
                stopAudio();
                setBuffer(null);
                setFilename("");
                setDuration(0);
              }}
            >
              Remove audio & start over
            </button>
          </section>
        )}
      </main>

      <footer>
        <span>AudioTrim © 2026</span>
        <span>
          <span className="status-dot" /> Processing happens locally
        </span>
      </footer>
    </div>
  );
}
