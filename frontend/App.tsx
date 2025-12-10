import React, { useState } from 'react';
import { DataPoint } from './types';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { ChartSection } from './components/ChartSection';
import { DataTable } from './components/DataTable';
import { SidebarRight } from './components/SidebarRight';
import { BotpressChat } from './components/BotpressChat';
import { ViewState, AnalysisData, NavigationAction } from './types';
import { generateMockData, MOCK_FILES, MOCK_METRICS } from './constants';
import { analyzeTDR } from './services/analysisService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [settings, setSettings] = useState({
    showGrid: true,
    showPoints: false,
    lowPassFilter: false,
  });
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cableLength, setCableLength] = useState(1.5);
  const [z0Expected, setZ0Expected] = useState(50);
  const [data, setData] = useState<DataPoint[]>(() => generateMockData());

  const handleNavigate = async (action: NavigationAction) => {
    if (action.file) {
      setIsLoading(true);
      setError(null);
      try {
        const analysisResult = await analyzeTDR(action.file, cableLength, z0Expected);
        console.log('Analysis result:', analysisResult);
        console.log('Waveform data:', analysisResult.waveform);
        setAnalysisData(analysisResult);
        setData(analysisResult.waveform);
        setCurrentView(action.view);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error analyzing file');
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentView(action.view);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const analysisResult = await analyzeTDR(file, cableLength, z0Expected);
      console.log('Analysis result:', analysisResult);
      console.log('Waveform data:', analysisResult.waveform);
      setAnalysisData(analysisResult);
      setData(analysisResult.waveform);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing file');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900">
      <Header onNavigate={handleNavigate} activeView={currentView} analysisData={analysisData} />

      <main className="flex-1 overflow-hidden">
        {currentView === ViewState.HOME ? (
          <Home onNavigate={handleNavigate} />
        ) : (
          <div className="h-[calc(100vh-3.5rem)] p-4 flex flex-col gap-4">
             {/* Breadcrumbs */}
            <div className="flex items-center text-xs text-slate-500 space-x-2 px-1">
               <span className="cursor-pointer hover:text-blue-600" onClick={() => handleNavigate({ view: ViewState.HOME })}>Desktop</span>
               <span>{'>'}</span>
               <span className="font-medium text-slate-700">Datos caso aplicacion</span>
            </div>

            <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">

              {/* Center Content */}
              <div className="col-span-3 flex flex-col gap-4 h-full min-h-0">
                {/* File Upload Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <h3 className="font-bold text-sm text-slate-800 mb-4">Upload CSV for Analysis</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Select CSV File</label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cable Length (m)</label>
                        <input
                          type="number"
                          value={cableLength}
                          onChange={(e) => setCableLength(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-md p-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Z0 Expected (Ω)</label>
                        <input
                          type="number"
                          value={z0Expected}
                          onChange={(e) => setZ0Expected(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-md p-2 text-sm"
                        />
                      </div>
                    </div>
                    {isLoading && <div className="text-sm text-blue-600">Analyzing...</div>}
                    {error && <div className="text-sm text-red-600">{error}</div>}
                  </div>
                </div>
                <div className="flex-[5] min-h-0" ref={(el) => {
                  if (el) console.log('ChartSection container height:', el.clientHeight);
                }}>
                  <ChartSection data={data} settings={settings} analysisData={analysisData} />
                </div>
                <div className="flex-[4] min-h-0" ref={(el) => {
                  if (el) console.log('DataTable container height:', el.clientHeight);
                }}>
                  <DataTable analysisData={analysisData} />
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="col-span-1">
                <SidebarRight analysisData={analysisData} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Botpress Chat Integration */}
      <BotpressChat />
    </div>
  );
};

export default App;