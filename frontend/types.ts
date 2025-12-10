export interface DataPoint {
  time: number;
  ch1: number;
}

export interface FileInfo {
  id: string;
  name: string;
  status: 'ready' | 'processing' | 'error';
  date: string;
}

export interface AnalysisMetrics {
  ch1: {
    rms: number;
    freq: number;
    peakToPeak: number;
  };
}

export enum ViewState {
  HOME = 'HOME',
  ANALYSIS = 'ANALYSIS',
}

export interface NavigationAction {
  view: ViewState;
  file?: File;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AnalysisData {
  length_meters: number;
  error_percent: number;
  velocity_factor: number;
  vswr: number;
  reflection_coefficient: number;
  beta: number;
  alpha: number;
  Z0: number;
  load_type: string;
  load_value: number;
  tdr_plot_base64: string;
  waveform: DataPoint[];
}