import React from 'react';
import { AnalysisData } from '../types';

interface DataTableProps {
  analysisData: AnalysisData | null;
}

export const DataTable: React.FC<DataTableProps> = ({ analysisData }) => {
  console.log('DataTable received analysisData:', analysisData);
  if (!analysisData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-800">Métricas de Análisis</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-500">
          No hay datos de análisis disponibles
        </div>
      </div>
    );
  }

  console.log('DataTable metrics values:');
  console.log('reflection_coefficient:', analysisData.reflection_coefficient);
  console.log('beta:', analysisData.beta);
  console.log('alpha:', analysisData.alpha);
  console.log('Z0:', analysisData.Z0);
  console.log('load_type:', analysisData.load_type);
  console.log('load_value:', analysisData.load_value);

  // Función para formatear valores pequeños en notación científica
  const formatValue = (value: number, unit: string, useScientific: boolean = false) => {
    if (useScientific && Math.abs(value) < 0.01 && Math.abs(value) > 0) {
      return `${value.toExponential(3)} ${unit}`;
    }
    return `${value.toFixed(3)} ${unit}`;
  };

  const metrics = [
    { key: 'length_meters', label: 'Longitud', value: `${analysisData.length_meters.toFixed(2)} m` },
    { key: 'error_percent', label: 'Error', value: `${analysisData.error_percent.toFixed(2)} %` },
    { key: 'velocity_factor', label: 'Factor de Velocidad', value: `${analysisData.velocity_factor.toFixed(2)} %` },
    { key: 'vswr', label: 'VSWR', value: analysisData.vswr.toFixed(3) },
    { key: 'reflection_coefficient', label: 'Coeficiente de Reflexión', value: analysisData.reflection_coefficient.toFixed(4) },
    { key: 'beta', label: 'Beta', value: formatValue(analysisData.beta, 'rad/m', true) },
    { key: 'alpha', label: 'Alpha', value: formatValue(analysisData.alpha, 'Np/m', true) },
    { key: 'Z0', label: 'Impedancia Característica', value: `${analysisData.Z0.toFixed(1)} Ω` },
    { key: 'load_type', label: 'Tipo de Carga', value: analysisData.load_type },
    { key: 'load_value', label: 'Valor de Carga', value: `${analysisData.load_value.toFixed(1)} Ω` },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-bold text-sm text-slate-800">Métricas de Análisis</h3>
      </div>
      <div className="flex-1 overflow-auto" ref={(el) => {
        if (el) console.log('DataTable table container height:', el.clientHeight);
      }}>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 font-semibold text-slate-600 border-b border-slate-200 w-1/2">Parámetro</th>
              <th className="px-4 py-2 font-semibold text-blue-600 border-b border-slate-200 w-1/2">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {metrics.map((metric, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-slate-700 font-medium">{metric.label}</td>
                <td className="px-4 py-2 text-slate-600 font-mono text-sm">{metric.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};