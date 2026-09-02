import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Folder, Save, Trash2, DownloadCloud, Plus, X, Clock, MessageSquare, Twitter } from 'lucide-react';

export default function ProjectManagerModal({ 
  isOpen, 
  onClose, 
  currentType, 
  currentData, 
  onLoadProject 
}) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch projects from Neon
  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchProjects();
    }
  }, [isOpen, user]);

  // Save Current Project
  const handleSaveCurrent = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menyimpan cerita ke Cloud.');
      return;
    }
    if (!saveTitle.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: saveTitle.trim(),
          type: currentType,
          data: currentData
        })
      });

      if (res.ok) {
        setSaveTitle('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        await fetchProjects();
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Project
  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus cerita ini?')) return;
    try {
      const res = await fetch(`/api/projects/${id}?userId=${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12161f] border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl">
        
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cerita Saya (Cloud Projects)</h2>
              <p className="text-[11px] text-neutral-400">Tersimpan aman di Neon PostgreSQL Database</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Save Current Section */}
        <form onSubmit={handleSaveCurrent} className="my-4 p-3.5 bg-neutral-900/90 rounded-2xl border border-neutral-800 flex gap-2">
          <input
            type="text"
            value={saveTitle}
            onChange={(e) => setSaveTitle(e.target.value)}
            placeholder="Beri judul untuk cerita ini (misal: AU Arka Episode 1)..."
            className="flex-1 bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !saveTitle.trim()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveSuccess ? 'Tersimpan! ✓' : 'Simpan Cerita'}</span>
          </button>
        </form>

        {/* Project List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              Belum ada cerita yang tersimpan. Simpan draft cerita kamu di atas!
            </div>
          ) : (
            projects.map((proj) => (
              <div 
                key={proj.id}
                className="p-3 bg-neutral-900/60 hover:bg-neutral-900 rounded-xl border border-neutral-800/80 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    proj.type === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#1d9bf0]/10 text-[#1d9bf0]'
                  }`}>
                    {proj.type === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> : <Twitter className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-neutral-200 truncate group-hover:text-white">{proj.title}</h4>
                    <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onLoadProject(proj.type, proj.data);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-emerald-500 hover:text-neutral-950 text-neutral-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Muat</span>
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                    title="Hapus Cerita"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
