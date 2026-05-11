import { useEffect, useRef } from 'react';

// Desde los más densos (oscuros) a los más ligeros (claros)
const ASCII_CHARS = "@%#*+=-:. ";

export const AsciiBackground = ({ imageUrl }: { imageUrl: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let resizeTimeout: NodeJS.Timeout;

    const renderAscii = () => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        // Obtenemos dimensiones actuales de la pantalla
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        // Ajustamos la resolución real del canvas (considerando pantallas de alta densidad si es necesario, pero para ASCII 1x es mejor)
        canvas.width = winW;
        canvas.height = winH;

        const fontSize = 14; 
        const charWidth = fontSize * 0.6; // ancho aproximado de fuente monospace
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.textBaseline = 'top';
        
        const cols = Math.floor(winW / charWidth);
        const rows = Math.floor(winH / fontSize);

        // Canvas temporal para escalar la imagen a la cuadrícula ASCII
        const offscreen = document.createElement('canvas');
        offscreen.width = cols;
        offscreen.height = rows;
        const oCtx = offscreen.getContext('2d');
        if (!oCtx) return;

        // Calculamos object-fit: cover
        const imgRatio = img.width / img.height;
        const canvasRatio = cols / rows;
        let renderW = cols;
        let renderH = rows;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
          renderW = rows * imgRatio;
          offsetX = (cols - renderW) / 2;
        } else {
          renderH = cols / imgRatio;
          offsetY = (rows - renderH) / 2;
        }

        // Dibujamos la foto escalada en el canvas pequeño
        oCtx.drawImage(img, offsetX, offsetY, renderW, renderH);
        const pixels = oCtx.getImageData(0, 0, cols, rows).data;

        // Limpiamos el canvas visible
        ctx.clearRect(0, 0, winW, winH);

        // Iteramos sobre los píxeles (que equivalen a nuestros bloques de caracteres)
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const offset = (y * cols + x) * 4;
            const r = pixels[offset];
            const g = pixels[offset + 1];
            const b = pixels[offset + 2];
            
            // Calculamos luminancia para elegir el carácter
            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const charIndex = Math.floor((luminance / 255) * (ASCII_CHARS.length - 1));
            const char = ASCII_CHARS[charIndex];

            // Dibujamos el texto CON SU COLOR ORIGINAL, ajustando opacidad para que sea fondo
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
            ctx.fillText(char, x * charWidth, y * fontSize);
          }
        }
      };
      img.src = imageUrl;
    };

    renderAscii();

    // Redibujar si cambia el tamaño de la ventana
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(renderAscii, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        background: 'var(--bg-color)',
        pointerEvents: 'none'
      }}
    />
  );
};
