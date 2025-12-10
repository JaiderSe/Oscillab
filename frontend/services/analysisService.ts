import { AnalysisData } from '../types';

export const analyzeTDR = async (
  file: File,
  cableLength: number,
  z0Expected: number = 50
): Promise<AnalysisData> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('cable_length', cableLength.toString());
  formData.append('z0_expected', z0Expected.toString());

  console.log('Sending request to backend...');
  console.log('File:', file.name, 'Size:', file.size);
  console.log('Cable length:', cableLength, 'Z0 expected:', z0Expected);

  try {
    const response = await fetch('/api/analyze-tdr', {
      method: 'POST',
      body: formData,
      // Add headers to ensure proper content type
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data: AnalysisData = await response.json();
    console.log('Analysis data from backend:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing TDR:', error);
    console.error('Error type:', error.constructor.name);
    throw error;
  }
};