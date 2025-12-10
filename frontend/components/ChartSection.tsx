import React from 'react';
import { DataPoint, AnalysisData } from '../types';

interface ChartSectionProps {
  data: DataPoint[];
  settings: {
    showGrid: boolean;
    showPoints: boolean;
  };
  analysisData?: AnalysisData | null;
}

export const ChartSection: React.FC<ChartSectionProps> = ({ data, settings, analysisData }) => {
    console.log('ChartSection received data:', data, 'type:', typeof data, 'isArray:', Array.isArray(data));
    // Handle undefined or null data
    const safeData = Array.isArray(data) ? data : [];
    console.log('safeData:', safeData, 'length:', safeData?.length);
    console.log('ChartSection rendering with data length:', safeData.length);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-auto">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">
          Visualización de Ondas
        </h2>
      </div>

      <div className="flex-1 p-4" ref={(el) => {
        if (el) {
          console.log('ChartSection container dimensions:', el.clientWidth, 'x', el.clientHeight);
        }
      }}>
        {analysisData?.tdr_plot_base64 ? (
          <img
            src={`data:image/png;base64,${analysisData.tdr_plot_base64}`}
            alt="TDR Plot"
            className="w-full h-full object-contain"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              const container = img.parentElement;
              if (container) {
                const containerAspect = container.clientWidth / container.clientHeight;
                const imageAspect = img.naturalWidth / img.naturalHeight;
                console.log('TDR image loaded, natural dimensions:', img.naturalWidth, 'x', img.naturalHeight, 'display size:', img.clientWidth, 'x', img.clientHeight);
                console.log('Container aspect ratio:', containerAspect, 'Image aspect ratio:', imageAspect);
                console.log('Potential cropping detected:', containerAspect !== imageAspect ? 'Yes, aspect ratios differ' : 'No, aspect ratios match');
                console.log('Image scaling check - natural vs display width:', img.naturalWidth > img.clientWidth ? 'Image scaled down in width' : 'Image fits in width');
                console.log('Image scaling check - natural vs display height:', img.naturalHeight > img.clientHeight ? 'Image scaled down in height' : 'Image fits in height');
                console.log('Container overflow check - scrollWidth vs clientWidth:', container.scrollWidth > container.clientWidth ? 'Horizontal overflow' : 'No horizontal overflow');
                console.log('Container overflow check - scrollHeight vs clientHeight:', container.scrollHeight > container.clientHeight ? 'Vertical overflow' : 'No vertical overflow');
              }
            }}
            onError={() => console.log('TDR image failed to load')}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">No hay datos disponibles</div>
              <div className="text-sm">Cargando datos o esperando selección...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};