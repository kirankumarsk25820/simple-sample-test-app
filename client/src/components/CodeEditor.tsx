import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme?: string;
}

export default function CodeEditor({ value, onChange, language, theme = 'vs-dark' }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<any>(null);

  useEffect(() => {
    // Load Monaco Editor dynamically
    if (typeof window !== 'undefined' && !monacoRef.current) {
      // Create script elements for Monaco Editor
      const loader = document.createElement('script');
      loader.src = 'https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js';
      
      loader.onload = () => {
        // @ts-ignore
        window.require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });
        // @ts-ignore
        window.require(['vs/editor/editor.main'], () => {
          if (editorRef.current) {
            // @ts-ignore
            monacoRef.current = window.monaco.editor.create(editorRef.current, {
              value: value,
              language: getMonacoLanguage(language),
              theme: theme,
              automaticLayout: true,
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              selectOnLineNumbers: true,
            });

            monacoRef.current.onDidChangeModelContent(() => {
              onChange(monacoRef.current.getValue());
            });
          }
        });
      };

      document.head.appendChild(loader);
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose();
        monacoRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (monacoRef.current && monacoRef.current.getValue() !== value) {
      monacoRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (monacoRef.current) {
      // @ts-ignore
      window.monaco.editor.setModelLanguage(monacoRef.current.getModel(), getMonacoLanguage(language));
    }
  }, [language]);

  const getMonacoLanguage = (lang: string) => {
    const languageMap: Record<string, string> = {
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      javascript: 'javascript',
    };
    return languageMap[lang] || 'plaintext';
  };

  return (
    <div 
      ref={editorRef} 
      className="h-full w-full"
      style={{ minHeight: '400px' }}
    />
  );
}
