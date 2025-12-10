import React from 'react';
import { Upload, FileText, CheckCircle2, Clock } from 'lucide-react';
import { FileInfo } from '../types';

interface SidebarLeftProps {
  files: FileInfo[];
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ files }) => {
  return (
    <div className="w-full lg:w-72 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h3 className="font-bold text-slate-800">Carga de Datos CSV</h3>
      </div>
      
      <div className="p-4 border-b border-slate-100">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all">
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-xs text-slate-600 font-medium">Arrastrar y soltar archivos CSV aquí</p>
          <p className="text-[10px] text-slate-400 mt-1">o hacer clic para seleccionar</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {files.map((file) => (
          <div 
            key={file.id} 
            className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-slate-100 p-2 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-sm text-slate-700 truncate font-medium">{file.name}</span>
            </div>
            
            <div className="shrink-0">
               {file.status === 'ready' ? (
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                   <CheckCircle2 className="w-3 h-3 mr-1" />
                   Listo
                 </span>
               ) : (
                 <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                   <Clock className="w-3 h-3 mr-1" />
                   Procesando
                 </span>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};