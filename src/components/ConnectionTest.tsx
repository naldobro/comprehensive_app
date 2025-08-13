import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const ConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
        
        // Test basic connection
        const { data, error } = await supabase
          .from('topics')
          .select('count(*)')
          .limit(1);

        if (error) {
          console.error('Supabase connection error:', error);
          setErrorMessage(error.message);
          setConnectionStatus('error');
        } else {
          console.log('Supabase connection successful:', data);
          setConnectionStatus('success');
        }
      } catch (err) {
        console.error('Connection test failed:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
        setConnectionStatus('error');
      }
    };

    testConnection();
  }, []);

  if (connectionStatus === 'testing') {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <p className="text-blue-800">Testing database connection...</p>
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
        <p className="text-red-800 font-medium">Database Connection Error:</p>
        <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
        <p className="text-red-600 text-xs mt-2">
          Check your environment variables and Supabase configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
      <p className="text-green-800">✅ Database connection successful!</p>
    </div>
  );
};