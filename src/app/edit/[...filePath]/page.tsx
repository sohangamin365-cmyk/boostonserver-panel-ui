'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { FaSpinner, FaSave } from 'react-icons/fa';

export default function EditFilePage() {
  const params = useParams();
  const filePathArray = Array.isArray(params.filePath) ? params.filePath : [params.filePath];
  const filePath = filePathArray.join('/');

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) return;

    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/files/content', {
          params: { p: filePath },
          headers: { 'x-api-key': 'bsp-agent-secret-key-c4a5b6d7e8f9' },
        });
        setContent(response.data.content);
        setError(null);
      } catch (err) {
        setError('Failed to fetch file content.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [filePath]);

  const handleSave = async () => {
    try {
        setSaving(true);
        setSuccessMessage(null);
        setError(null);
        await axios.post('http://localhost:3001/api/files/save', 
            { content }, 
            {
                params: { p: filePath },
                headers: { 'x-api-key': 'bsp-agent-secret-key-c4a5b6d7e8f9' },
            }
        );
        setSuccessMessage('File saved successfully!');
    } catch (err) {
        setError('Failed to save file.');
        console.error(err);
    } finally {
        setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-200 truncate">Edit: {filePath}</h1>
            <Link href="/files" className="text-cyan-400 hover:text-cyan-300 whitespace-nowrap">&#8592; Back to Files</Link>
        </div>

        <div className="bg-gray-800/50 rounded-lg shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center p-24">
              <FaSpinner className="animate-spin text-4xl text-cyan-400" />
            </div>
          ) : error ? (
            <div className="text-red-400 p-24 text-center">{error}</div>
          ) : (
            <textarea
              className="w-full h-[60vh] p-4 bg-gray-900 text-gray-300 font-mono rounded-md border border-gray-700 focus:ring-cyan-400 focus:border-cyan-400"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}
        </div>
        <div className="mt-6 flex items-center justify-end">
            {successMessage && <span className="text-green-400 mr-4">{successMessage}</span>}
            {error && <span className="text-red-400 mr-4">{error}</span>}
            <button 
                onClick={handleSave}
                disabled={loading || saving}
                className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {saving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
        </div>
      </div>
    </div>
  );
}
