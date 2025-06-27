import React, { useRef, useState, useCallback, useEffect } from 'react';
import './App.css';

// Bell SVG as a React component
const BellIcon = ({ color }: { color: string }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="notification-bell">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

function getMedianLuminance(image: HTMLImageElement, x: number, y: number, w: number, h: number): number {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 255;
  ctx.drawImage(image, x, y, w, h, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const luminances: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    luminances.push(lum);
  }
  luminances.sort((a, b) => a - b);
  const mid = Math.floor(luminances.length / 2);
  return luminances.length % 2 !== 0
    ? luminances[mid]
    : (luminances[mid - 1] + luminances[mid]) / 2;
}

const App: React.FC = () => {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [bellColor, setBellColor] = useState<string>('#222');
  const [dragActive, setDragActive] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Handle drop
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setBgUrl(url);
    }
  }, []);

  // Drag events
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  // When bgUrl changes, analyze the area under the bell
  useEffect(() => {
    if (!bgUrl) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = bgUrl;
    img.onload = () => {
      imgRef.current = img;
      // Bell is 32x32, top right, with 24px margin
      const w = 32, h = 32, margin = 24;
      const x = img.width - w - margin;
      const y = margin;
      const lum = getMedianLuminance(img, Math.max(x,0), Math.max(y,0), w, h);
      setBellColor(lum > 128 ? '#222' : '#fff');
    };
  }, [bgUrl]);

  return (
    <div
      className="App bg-container"
      style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : {}}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {dragActive && <div className="drag-overlay">Drop image here</div>}
      <div className="content-placeholder">
        <p>Drag and drop an image anywhere to set as background.</p>
      </div>
      <div className="notification-bell-container">
        <BellIcon color={bellColor} />
      </div>
    </div>
  );
};

export default App;
