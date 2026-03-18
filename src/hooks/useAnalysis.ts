import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/apiClient';
import { useToast } from '../components/Toast';

interface PollingResponse {
  analysis_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error_reason?: string | null;
}

export function useAnalysis() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  // Keeping result in state is mostly legacy now that we navigate to /results
  // But we store the ID just in case.
  const [result, setResult] = useState<any | null>(null);
  
  const navigate = useNavigate();
  const { addToast } = useToast();
  const pollingRef = useRef<number | null>(null);

  const startAnalysis = useCallback(async (
    imageSource: File | string, 
    preset: string = 'combined',
    wcagLevel: string = 'AA'
  ) => {
    // Prevent overlapping analyses
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
    }

    setStatus('processing');
    setProgress(10);
    setProgressLabel('Uploading to secure cloud...');

    try {
      let analysisId: string;

      if (imageSource instanceof File) {
        // Upload File
        const formData = new FormData();
        formData.append('file', imageSource);
        formData.append('wcag_level', wcagLevel);
        formData.append('simulation_preset', preset);

        const { data } = await apiClient.post('/analyses/upload', formData);
        analysisId = data.analysis_id;
      } else {
        // Send URL
        const { data } = await apiClient.post('/analyses/url', {
          url: imageSource,
          wcag_level: wcagLevel,
          simulation_preset: preset,
        });
        analysisId = data.analysis_id;
      }

      setResult({ jobId: analysisId });
      setProgress(40);
      setProgressLabel('Initializing neural analysis...');
      
      // Start polling
      startPolling(analysisId);

    } catch (error: any) {
      console.error('Analysis failed to start:', error);
      setStatus('failed');
      const msg = error.response?.data?.detail || 'Analysis pipeline failed to start. Please try again.';
      addToast(msg, 'error');
    }
  }, [addToast]);

  const startPolling = useCallback((analysisId: string) => {
    // Clear any existing poll
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
    }

    let localProgress = 40;

    pollingRef.current = window.setInterval(async () => {
      try {
        const { data } = await apiClient.get<PollingResponse>(`/analyses/${analysisId}/status`);
        
        if (data.status === 'processing') {
             // Fake incremental progress while processing to keep user engaged
             localProgress = Math.min(localProgress + 5, 95);
             setProgress(localProgress);
             setProgressLabel('Running cognitive vision simulations...');
        } 
        else if (data.status === 'completed') {
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          setProgress(100);
          setProgressLabel('Analysis complete!');
          setStatus('complete');
          addToast('Analysis complete!', 'success');
          
          setTimeout(() => {
            navigate(`/results/${analysisId}`);
          }, 800);
        } 
        else if (data.status === 'failed') {
          if (pollingRef.current) window.clearInterval(pollingRef.current);
          setStatus('failed');
          addToast(data.error_reason || 'Backend analysis job failed.', 'error');
        }
      } catch (err) {
        // Suppress network errors during polling (just retry next tick), unless it's a 4xx
        console.error('Polling error', err);
      }
    }, 2000);
  }, [navigate, addToast]);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
    }
  }, []);

  return {
    status,
    progress,
    progressLabel,
    result,
    startAnalysis,
    reset
  };
}
