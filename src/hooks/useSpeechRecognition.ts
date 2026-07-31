import { useState, useEffect, useRef, useCallback } from 'react';

export type SpeechLanguage = 'pt-BR' | 'en-US';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition(options?: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SpeechLanguage>('pt-BR');
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<any>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignora erro se já estiver parado
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      optionsRef.current?.onError?.('Reconhecimento de voz não é suportado neste navegador.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = selectedLang;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let accumulatedText = '';

      // Percorre TODOS os resultados da sessão atual (do índice 0 até o final)
      for (let i = 0; i < event.results.length; i++) {
        accumulatedText += event.results[i][0].transcript;
      }

      setTranscript(accumulatedText);

      if (optionsRef.current?.onResult) {
        const isFinal = Boolean(event.results[event.results.length - 1]?.isFinal);
        optionsRef.current.onResult(accumulatedText, isFinal);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('[SpeechRecognition Error]', event.error);
      if (event.error !== 'no-speech') {
        optionsRef.current?.onError?.(event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Erro ao iniciar reconhecimento de voz:', err);
      setIsListening(false);
    }
  }, [selectedLang]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const changeLanguage = useCallback(
    (lang: SpeechLanguage) => {
      setSelectedLang(lang);
      if (isListening) {
        stopListening();
      }
    },
    [isListening, stopListening]
  );

  return {
    isListening,
    isSupported,
    selectedLang,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    changeLanguage,
  };
}
