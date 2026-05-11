import { useEffect, useState } from 'react';

const ASCII_CHARS = " .`-_':,;^=+/\"|)\\<>)iv%xclrs{*}I?!][1taeo7zjLunT#JCwfy325Fp6mqSghVd4EgXPGZbYkOA&8U$@HwNRKBMQW";

export const AsciiBackground = ({ imageUrl }: { imageUrl: string }) => {
  const [ascii, setAscii] = useState<string>('');

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const cols = 100; // Resolution of ASCII art
      const scale = cols / img.width;
      const rows = Math.floor(img.height * scale * 0.45); // Aspect ratio correction for monospace fonts
      
      canvas.width = cols;
      canvas.height = rows;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0, cols, rows);
      const pixels = ctx.getImageData(0, 0, cols, rows).data;
      
      let asciiStr = '';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const offset = (y * cols + x) * 4;
          const r = pixels[offset];
          const g = pixels[offset + 1];
          const b = pixels[offset + 2];
          
          const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          const charIndex = Math.floor((luminance / 255) * (ASCII_CHARS.length - 1));
          asciiStr += ASCII_CHARS[charIndex];
        }
        asciiStr += '\n';
      }
      setAscii(asciiStr);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -2,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color)',
    }}>
      <pre className="primary-gradient-text" style={{
        fontFamily: 'monospace',
        fontSize: '10px',
        lineHeight: '10px',
        letterSpacing: '2px',
        textAlign: 'center',
        margin: 0,
        opacity: 0.15, // Subtle aesthetic
        whiteSpace: 'pre',
        userSelect: 'none',
        transform: 'scale(1.2)' // Slight zoom
      }}>
        {ascii}
      </pre>
    </div>
  );
};
