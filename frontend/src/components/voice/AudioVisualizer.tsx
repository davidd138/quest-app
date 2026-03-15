'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  isSpeaking: boolean;
  size?: number;
  className?: string;
}

const BAR_COUNT = 32;
const MIN_BAR_HEIGHT = 2;

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyserNode,
  isSpeaking,
  size = 160,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    ctx.clearRect(0, 0, width, height);

    let dataArray = dataArrayRef.current;

    if (analyserNode && !dataArray) {
      dataArray = new Uint8Array(analyserNode.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      dataArrayRef.current = dataArray;
    }

    if (analyserNode && dataArray) {
      analyserNode.getByteFrequencyData(dataArray);
    }

    const hasData = analyserNode && dataArray;

    for (let i = 0; i < BAR_COUNT; i++) {
      const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;

      let barHeight: number;
      if (hasData && dataArray) {
        const dataIndex = Math.floor((i / BAR_COUNT) * dataArray.length);
        barHeight = (dataArray[dataIndex] / 255) * radius * 0.6 + MIN_BAR_HEIGHT;
      } else {
        // CSS-style fallback animation
        const time = Date.now() / 1000;
        const wave = Math.sin(time * 2 + i * 0.4) * 0.5 + 0.5;
        barHeight = wave * radius * 0.2 + MIN_BAR_HEIGHT;
      }

      const x1 = centerX + Math.cos(angle) * (radius * 0.4);
      const y1 = centerY + Math.sin(angle) * (radius * 0.4);
      const x2 = centerX + Math.cos(angle) * (radius * 0.4 + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius * 0.4 + barHeight);

      // Color: violet for user, emerald for AI
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      if (isSpeaking) {
        gradient.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
        gradient.addColorStop(1, 'rgba(52, 211, 153, 0.9)');
      } else {
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.9)');
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient as unknown as string;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = isSpeaking
      ? 'rgba(52, 211, 153, 0.08)'
      : 'rgba(139, 92, 246, 0.08)';
    ctx.fill();
    ctx.strokeStyle = isSpeaking
      ? 'rgba(52, 211, 153, 0.3)'
      : 'rgba(139, 92, 246, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    animationRef.current = requestAnimationFrame(draw);
  }, [analyserNode, isSpeaking]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationRef.current);
      dataArrayRef.current = null;
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

export default AudioVisualizer;
