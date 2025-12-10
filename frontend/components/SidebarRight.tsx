import React from 'react';
import { AnalysisData } from '../types';
import { AnalysisMetrics } from './AnalysisMetrics';

interface SidebarRightProps {
  analysisData: AnalysisData;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({ analysisData }) => {
  return (
    <div className="space-y-4 h-full flex flex-col overflow-hidden">
      {/* Analysis Metrics */}
      <AnalysisMetrics analysisData={analysisData} />
    </div>
  );
};