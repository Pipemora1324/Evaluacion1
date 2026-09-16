'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [inp, setInp] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Validar aislamiento de origen para SharedArrayBuffer
    if (typeof SharedArrayBuffer === 'undefined') {
      setErrorMsg('SharedArrayBuffer no está habilitado. Verifica next.config.ts.');
      return;
    }

    const TOTAL_CHANNELS = 27;
    const HISTORY_SIZE = 120000;

    const sharedBuffer = new SharedArrayBuffer(TOTAL_CHANNELS * HISTORY_SIZE * 4);
    const dataArray = new Float32Array(sharedBuffer);

    const stateBuffer = new SharedArrayBuffer(TOTAL_CHANNELS * 4);
    const stateArray = new Int32Array(stateBuffer);

    const worker = new Worker('/worker.js');
    worker.postMessage({ type: 'INIT', sharedBuffer, stateBuffer });

    const ws = new WebSocket('ws://localhost:3000');
    ws.binaryType = 'arraybuffer';
    ws.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        worker.postMessage(event.data, [event.data]);
      }
    };

    // Medición de latencia INP adaptada para TypeScript
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const performanceEntry = entry as any;
            if (performanceEntry.interactionId) {
              setInp(Math.round(performanceEntry.duration));
            }
          }
        });
        observer.observe({ type: 'event', buffered: true } as PerformanceObserverInit);
      } catch (e) {
        // Ignorar si el navegador no admite esta métrica
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 50;

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const chHeight = canvas.height / TOTAL_CHANNELS;

      for (let ch = 0; ch < TOTAL_CHANNELS; ch++) {
        ctx.beginPath();
        ctx.strokeStyle = ch % 3 === 2 ? '#00ff00' : '#00aaff';

        const writePos = Atomics.load(stateArray, ch);
        const offset = ch * HISTORY_SIZE;

        for (let x = 0; x < canvas.width; x++) {
          const sampleIdx = (writePos - canvas.width + x + HISTORY_SIZE) % HISTORY_SIZE;
          const val = dataArray[offset + sampleIdx];
          const y = (ch * chHeight) + (chHeight / 2) - (val / 10);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      worker.terminate();
      ws.close();
    };
  }, []);

  if (errorMsg) {
    return (
      <main style={{ padding: '20px', color: '#ff4444', backgroundColor: '#121212', height: '100vh' }}>
        <h2>Error de Configuración</h2>
        <p>{errorMsg}</p>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: '#121212', height: '100vh', color: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', background: '#1e1e1e' }}>
        <span>CONSOLA SISMO-VOLCÁNICA</span>
        <span>INP: {inp} ms</span>
      </div>
      <canvas ref={canvasRef} />
    </main>
  );
}