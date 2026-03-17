import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AnalysisResult, SimulationPreset } from '../types';
import { runAnalysis, saveAnalysis } from '../lib/analysisEngine';
import { useToast } from '../components/Toast';

export function useAnalysis() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const startAnalysis = useCallback(async (
    imageSource: File | string, 
    preset: SimulationPreset = 'default'
  ) => {
    setStatus('processing');
    setProgress(0);
    setProgressLabel('Initializing analysis...');

    try {
      let imageUrl: string;
      let fileName: string | undefined;

      if (imageSource instanceof File) {
        imageUrl = await fileToDataUrl(imageSource);
        fileName = imageSource.name;
      } else {
        imageUrl = imageSource;
        fileName = 'remote-image';
      }

      const analysisResult = await runAnalysis(
        imageUrl, 
        preset, 
        fileName,
        (stage, p) => {
          setProgressLabel(stage);
          setProgress(p);
        }
      );

      setResult(analysisResult);
      saveAnalysis(analysisResult);
      setStatus('complete');
      addToast('Analysis complete!', 'success');
      
      // Navigate to results after a short delay
      setTimeout(() => {
        navigate(`/results/${analysisResult.jobId}`);
      }, 500);

      return analysisResult;
    } catch (error) {
      console.error('Analysis failed:', error);
      setStatus('failed');
      addToast('Analysis failed. Please try again.', 'error');
      throw error;
    }
  }, [navigate, addToast]);

  return {
    status,
    progress,
    progressLabel,
    result,
    startAnalysis,
    reset: () => {
      setStatus('idle');
      setProgress(0);
      setResult(null);
    }
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
