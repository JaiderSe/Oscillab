import { DataPoint, FileInfo, AnalysisMetrics } from './types';

export const generateMockData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  const points = 100;
  for (let i = 0; i < points; i++) {
    const time = i * 0.02; // 0.02ms steps
    // Sine wave with some noise for realism
    const ch1 = 3 * Math.sin(2 * Math.PI * 5 * time) + (Math.random() * 0.1);
    data.push({ time, ch1 });
  }
  return data;
};

export const MOCK_FILES: FileInfo[] = [
  { id: '1', name: 'mediciones_lab_v4.csv', status: 'ready', date: '2024-05-23' },
  { id: '2', name: 'datos_canal1_2024-05-22.csv', status: 'ready', date: '2024-05-22' },
  { id: '3', name: 'datos_canal2_2024-05-22.csv', status: 'ready', date: '2024-05-22' },
  { id: '4', name: 'analisis_frecuencia_alta.csv', status: 'processing', date: '2024-05-23' },
  { id: '5', name: 'test_ruido_blanco.csv', status: 'processing', date: '2024-05-23' },
];

export const MOCK_METRICS: AnalysisMetrics = {
  ch1: {
    rms: 3.54,
    freq: 1.00,
    peakToPeak: 10.02
  }
};