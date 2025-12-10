import React from 'react';
import { AnalysisData } from '../types';

interface AnalysisMetricsProps {
  analysisData: AnalysisData;
}

export const AnalysisMetrics: React.FC<AnalysisMetricsProps> = ({ analysisData }) => {
  const metrics = [
    { label: 'Longitud (metros)', value: analysisData.length_meters.toFixed(3), unit: 'm' },
    { label: 'Error porcentual', value: analysisData.error_percent.toFixed(2), unit: '%' },
    { label: 'Factor de velocidad', value: analysisData.velocity_factor.toFixed(3), unit: '' },
    { label: 'VSWR', value: analysisData.vswr.toFixed(3), unit: '' },
    { label: 'Coeficiente de reflexión', value: analysisData.reflection_coefficient.toFixed(3), unit: '' },
    { label: 'Beta', value: analysisData.beta.toFixed(3), unit: 'rad/m' },
    { label: 'Alpha', value: analysisData.alpha.toFixed(3), unit: 'Np/m' },
    { label: 'Impedancia característica (Z0)', value: analysisData.Z0.toFixed(1), unit: 'Ω' },
    { label: 'Tipo de carga', value: analysisData.load_type, unit: '' },
    { label: 'Valor de carga', value: analysisData.load_value.toFixed(1), unit: 'Ω' },
  ];

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Métricas de Análisis</h3>
        <div className="grid grid-cols-1 gap-3">
          {metrics.map((metric, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
              <span className="text-sm font-medium text-slate-600">{metric.label}:</span>
              <span className="text-sm font-bold text-slate-800">
                {metric.value} {metric.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {analysisData.tdr_plot_base64 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h4 className="text-md font-semibold text-slate-800 mb-3">Gráfico TDR</h4>
          <img
            src={`data:image/png;base64,${analysisData.tdr_plot_base64}`}
            alt="TDR Plot"
            className="w-full h-auto rounded border border-slate-200"
          />
        </div>
      )}
    </div>
  );
};