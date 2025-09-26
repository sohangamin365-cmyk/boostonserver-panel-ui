'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaFile, FaFolder, FaSpinner, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import Link from 'next/link';

interface FileData { name: string; isDirectory: boolean; }

const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: { 'x-api-key': 'bsp-agent-secret-key-c4a5b6d7e8f9' }
});

export default function FileManagerPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileData[]>([]);
  const [currentPath, setCurrentPath] = useState('.');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (path: string) => {
    try {
      setLoading(true);
      const response = await api.get('/files/list', { params: { p: path } });
      setFiles(response.data.files);
      setCurrentPath(response.data.path);
      setError(null);
    } catch (err) {
      setError('Failed to fetch files. Is the agent running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, fetchFiles]);

  const handleItemClick = (file: FileData) => {
    const newPath = currentPath === '.' ? file.name : `${currentPath}/${file.name}`;
    if (file.isDirectory) setCurrentPath(newPath);
    else router.push(`/edit/${newPath}`);
  };

  const handleCreate = async (type: 'file' | 'folder') => {
    const name = window.prompt(`Enter the name for the new ${type}:`);
    if (!name) return;
    setIsProcessing(true);
    const newPath = currentPath === '.' ? name : `${currentPath}/${name}`;
    try {
      await api.post('/files/create', { type }, { params: { p: newPath } });
      fetchFiles(currentPath);
    } catch (err) { setError(`Failed to create ${type}.`); console.error(err); }
    finally { setIsProcessing(false); }
  };

  const handleDelete = async (itemName: string) => {
    if (!window.confirm(`Are you sure you want to delete '${itemName}'?`)) return;
    setIsProcessing(true);
    const itemPath = currentPath === '.' ? itemName : `${currentPath}/${itemName}`;
    try {
      await api.delete('/files/delete', { params: { p: itemPath } });
      fetchFiles(currentPath);
    } catch (err) { setError('Failed to delete item.'); console.error(err); }
    finally { setIsProcessing(false); }
  };

  const handleRename = async (oldName: string) => {
    const newName = window.prompt(`Enter the new name for '${oldName}':`, oldName);
    if (!newName || newName === oldName) return;
    setIsProcessing(true);
    const oldPath = currentPath === '.' ? oldName : `${currentPath}/${oldName}`;
    try {
      await api.post('/files/rename', { newName }, { params: { p: oldPath } });
      fetchFiles(currentPath);
    } catch (err) { setError('Failed to rename item.'); console.error(err); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-200">File Manager</h1>
            <Link href="/" className="text-cyan-400 hover:text-cyan-300">&#8592; Back to Dashboard</Link>
        </div>
        <div className="text-gray-400 mb-4">Current Path: {currentPath}</div>

        <div className="bg-gray-800/50 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-6 border-b border-gray-700 pb-4">
                <button onClick={() => handleCreate('file')} disabled={isProcessing} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded disabled:opacity-50"><FaPlus/>New File</button>
                <button onClick={() => handleCreate('folder')} disabled={isProcessing} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-3 py-2 rounded disabled:opacity-50"><FaPlus/>New Folder</button>
            </div>

          {loading ? <div className="text-center p-12"><FaSpinner className="animate-spin text-4xl mx-auto"/></div> : 
           error ? <div className="text-red-400 p-12 text-center">{error}</div> : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700"><th className="p-3">Name</th><th className="p-3 w-40 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {currentPath !== '.' && (
                    <tr className="hover:bg-gray-700/50"><td className="p-3 cursor-pointer" onClick={() => setCurrentPath(currentPath.substring(0, currentPath.lastIndexOf('/')) || '.') }><div className="flex items-center gap-2"><FaFolder className="text-cyan-400"/>..</div></td><td></td></tr>
                )}
                {files.map((file) => (
                  <tr key={file.name} className="hover:bg-gray-700/50">
                    <td className="p-3 cursor-pointer" onClick={() => handleItemClick(file)}><div className="flex items-center gap-2">{file.isDirectory ? <FaFolder className="text-cyan-400"/> : <FaFile className="text-gray-500"/>}{file.name}</div></td>
                    <td className="p-3 text-right">
                        <button onClick={() => handleRename(file.name)} disabled={isProcessing} className="p-2 hover:text-yellow-400 disabled:opacity-50"><FaEdit/></button>
                        <button onClick={() => handleDelete(file.name)} disabled={isProcessing} className="p-2 hover:text-red-40f00 disabled:opacity-50"><FaTrash/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
