import React, { useRef } from 'react';
import { Upload, FileText, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { NavigationAction, ViewState } from '../types';

interface HomeProps {
  onNavigate: (action: NavigationAction) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onNavigate({ view: ViewState.ANALYSIS, file });
    }
  };

  return (
    <>
    <div className="max-w-[1200px] mx-auto p-8 space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Pantalla de Inicio</h1>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        <div className="flex-1 space-y-6 z-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Analiza tus Datos de Osciloscopio con Precisión.
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Convierte archivos CSV en información valiosa con nuestra avanzada herramienta de análisis y asistente virtual impulsado por IA.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              onClick={handleFileUpload}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg"
              icon={<Upload className="w-5 h-5" />}
            >
              Cargar Nuevo Documento CSV
            </Button>
          </div>
        </div>

        {/* Illustration Placeholder */}
        <div className="flex-1 w-full max-w-md relative z-10">
          <div className="aspect-[4/3] bg-white rounded-2xl shadow-lg border border-slate-200 p-4 flex items-center justify-center relative overflow-hidden">
             {/* Simple CSS Oscilloscope Graphic */}
             <div className="w-full h-full bg-slate-900 rounded-lg relative overflow-hidden flex flex-col">
                <div className="flex-1 relative">
                    {/* Grid */}
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="border border-slate-800/50"></div>
                        ))}
                    </div>
                    {/* Sine Wave */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <path d="M0 50 Q 25 0, 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50" fill="none" stroke="#0ea5e9" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                    </svg>
                </div>
                <div className="h-12 bg-slate-800 flex items-center justify-between px-4">
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full border border-slate-600 bg-slate-700"></div>
                        <div className="w-8 h-8 rounded-full border border-slate-600 bg-slate-700"></div>
                    </div>
                    <div className="w-24 h-6 bg-green-900/50 rounded border border-green-800/50"></div>
                </div>
             </div>
             
             {/* Floating Labels */}
             <div className="absolute -top-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-slate-100 animate-bounce" style={{animationDuration: '3s'}}>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-1">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded-full"></div>
                </div>
                <div className="h-2 w-16 bg-slate-200 rounded"></div>
             </div>
          </div>
        </div>
      </div>

    </div>
    <input
      ref={fileInputRef}
      type="file"
      accept=".csv"
      onChange={handleFileChange}
      style={{ display: 'none' }}
    />
    </>
  );
};