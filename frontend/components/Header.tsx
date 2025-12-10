import React from 'react';
import { Activity, User, Settings, FileText, Home, Download } from 'lucide-react';
import { NavigationAction, ViewState, AnalysisData } from '../types';
import jsPDF from 'jspdf';

interface HeaderProps {
  onNavigate: (action: NavigationAction) => void;
  activeView: string;
  analysisData?: AnalysisData | null;
}

const generatePDF = (analysisData: AnalysisData) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('Reporte de Análisis TDR', 20, 30);

  let y = 50;
  doc.setFontSize(12);

  // Add analysis data fields
  const fields = [
    { label: 'Longitud del cable (metros)', value: analysisData.length_meters },
    { label: 'Error porcentual', value: analysisData.error_percent },
    { label: 'Factor de velocidad', value: analysisData.velocity_factor },
    { label: 'VSWR', value: analysisData.vswr },
    { label: 'Coeficiente de reflexión', value: analysisData.reflection_coefficient },
    { label: 'Beta', value: analysisData.beta },
    { label: 'Alpha', value: analysisData.alpha },
    { label: 'Impedancia característica Z0 (Ω)', value: analysisData.Z0 },
    { label: 'Tipo de carga', value: analysisData.load_type },
    { label: 'Valor de carga', value: analysisData.load_value },
  ];

  fields.forEach(field => {
    doc.text(`${field.label}: ${field.value}`, 20, y);
    y += 10;
  });

  // Add TDR plot image
  if (analysisData.tdr_plot_base64) {
    const imgData = `data:image/png;base64,${analysisData.tdr_plot_base64}`;
    doc.addImage(imgData, 'PNG', 20, y + 10, 170, 100);
  }

  doc.save('reporte-tdr.pdf');
};

export const Header: React.FC<HeaderProps> = ({ onNavigate, activeView, analysisData }) => {
  const navItemClass = (isActive: boolean) => 
    `flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'text-white bg-slate-800' 
        : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate({ view: ViewState.HOME })}>
          <Activity className="w-6 h-6 text-blue-400" />
          <span className="text-lg font-bold tracking-tight">OscilloData Lab</span>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          <button
            className={navItemClass(activeView === 'HOME')}
            onClick={() => onNavigate({ view: ViewState.HOME })}
          >
            <Home className="w-4 h-4" />
            <span>Inicio</span>
          </button>
          <button
            className={navItemClass(activeView === 'ANALYSIS')}
            onClick={() => onNavigate({ view: ViewState.ANALYSIS })}
          >
            <Activity className="w-4 h-4" />
            <span>Análisis</span>
          </button>
        </nav>

        <div className="flex items-center space-x-3">
          {analysisData && (
            <button
              className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-600 cursor-pointer transition-colors"
              onClick={() => generatePDF(analysisData)}
              title="Descargar reporte PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-600 cursor-pointer transition-colors">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};