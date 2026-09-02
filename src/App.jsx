import React, { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { 
  Download, Copy, Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, 
  Mic, Check, CheckCheck, Phone, Video, MoreVertical, ChevronLeft, 
  Smile, Paperclip, Camera, Battery, Wifi, Signal, Sparkles, RefreshCw,
  Sun, Moon, Smartphone, Settings, FileText, CheckCircle2
} from 'lucide-react';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
];

export default function App() {
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [device, setDevice] = useState('ios'); // 'ios' | 'android'
  
  // Header Settings
  const [contactName, setContactName] = useState('Arka Narendra ❤️');
  const [contactStatus, setContactStatus] = useState('online');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATARS[1]);
  const [statusBarTime, setStatusBarTime] = useState('21:42');
  const [batteryLevel, setBatteryLevel] = useState(78);
  const [showWatermark, setShowWatermark] = useState(true);

  // Script text for bulk parser
  const [scriptModalOpen, setScriptModalOpen] = useState(false);
  const [rawScript, setRawScript] = useState(
`[B]: Kamu udah tidur belum?
[A]: Belum nih kak, lagi ngerjain revisian skripsi :(
[B]: Mau martabak telur ga? Aku lagi di depan komplek kamu nih
[A]: SERIUSAN KAK? 😭❤️
[B]: Iyaa, turun gih, aku tunggu 5 menit lagi ya.`);

  // Chat Messages
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'system',
      text: 'HARI INI',
      time: ''
    },
    {
      id: '2',
      type: 'receiver', // left (B / contact)
      text: 'Kamu udah tidur belum?',
      time: '21:40',
      status: 'read',
      isVoice: false
    },
    {
      id: '3',
      type: 'sender', // right (A / user)
      text: 'Belum nih kak, lagi ngerjain revisian skripsi :(',
      time: '21:41',
      status: 'read',
      isVoice: false
    },
    {
      id: '4',
      type: 'receiver',
      text: 'Mau martabak telur ga? Aku lagi di depan komplek kamu nih',
      time: '21:41',
      status: 'read',
      isVoice: false
    },
    {
      id: '5',
      type: 'sender',
      text: 'SERIUSAN KAK? 😭❤️',
      time: '21:42',
      status: 'read',
      isVoice: false
    },
    {
      id: '6',
      type: 'receiver',
      text: 'Iyaa, turun gih, aku tunggu 5 menit lagi ya.',
      time: '21:42',
      status: 'read',
      isVoice: false
    }
  ]);

  const [activeTab, setActiveTab] = useState('messages'); // 'messages' | 'settings' | 'script'
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const chatPreviewRef = useRef(null);

  // Add a new message
  const handleAddMessage = (type = 'sender') => {
    const newMessage = {
      id: Date.now().toString(),
      type: type,
      text: type === 'system' ? 'KEMARIN' : 'Pesan baru...',
      time: '21:43',
      status: 'read',
      isVoice: false,
      voiceDuration: '0:15',
      imageUrl: ''
    };
    setMessages([...messages, newMessage]);
  };

  // Update existing message
  const handleUpdateMessage = (id, field, value) => {
    setMessages(messages.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  // Delete message
  const handleDeleteMessage = (id) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  // Move message position
  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= messages.length) return;
    const updated = [...messages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setMessages(updated);
  };

  // Bulk Script Parser
  const handleParseScript = () => {
    const lines = rawScript.split('\n').filter(l => l.trim().length > 0);
    const parsed = [];
    
    // Add date separator
    parsed.push({
      id: 's_0',
      type: 'system',
      text: 'HARI INI',
      time: ''
    });

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      let type = 'sender';
      let text = trimmed;

      if (trimmed.startsWith('[A]:') || trimmed.startsWith('A:') || trimmed.startsWith('Me:')) {
        type = 'sender';
        text = trimmed.replace(/^(\[A\]:|A:|Me:)/, '').trim();
      } else if (trimmed.startsWith('[B]:') || trimmed.startsWith('B:') || trimmed.startsWith('Him:') || trimmed.startsWith('Her:')) {
        type = 'receiver';
        text = trimmed.replace(/^(\[B\]:|B:|Him:|Her:)/, '').trim();
      } else if (trimmed.startsWith('[System]:') || trimmed.startsWith('Date:')) {
        type = 'system';
        text = trimmed.replace(/^(\[System\]:|Date:)/, '').trim();
      }

      parsed.push({
        id: `gen_${Date.now()}_${idx}`,
        type,
        text,
        time: statusBarTime,
        status: 'read',
        isVoice: false
      });
    });

    if (parsed.length > 0) {
      setMessages(parsed);
      setScriptModalOpen(false);
    }
  };

  // Export High-Res Image
  const handleDownloadImage = async () => {
    if (!chatPreviewRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(chatPreviewRef.current, {
        pixelRatio: 3,
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `AU_WhatsApp_${contactName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Gagal mendownload gambar. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!chatPreviewRef.current) return;
    setIsExporting(true);
    try {
      const blob = await htmlToImage.toBlob(chatPreviewRef.current, { pixelRatio: 2.5 });
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      }
    } catch (err) {
      console.error('Clipboard copy failed', err);
      alert('Browser tidak mengizinkan direct clipboard paste, silakan gunakan tombol Download Image.');
    } finally {
      setIsExporting(false);
    }
  };

  // Theme styles
  const isDark = theme === 'dark';
  const bgChat = isDark ? '#0b141a' : '#efeae2';
  const bgHeader = isDark ? '#1f2c34' : '#f0f2f5';
  const textHeader = isDark ? 'text-neutral-100' : 'text-neutral-900';
  const textSub = isDark ? 'text-neutral-400' : 'text-neutral-500';
  const senderBubble = isDark ? '#005c4b' : '#d9fdd3';
  const receiverBubble = isDark ? '#202c33' : '#ffffff';
  const textBubble = isDark ? 'text-[#e9edef]' : 'text-[#111b21]';
  const timeBubble = isDark ? 'text-[#8696a0]' : 'text-[#667781]';

  return (
    <div className="min-h-screen bg-[#0d0f12] text-neutral-200 flex flex-col lg:flex-row font-sans">
      
      {/* LEFT PANEL: Controls & Editor */}
      <div className="w-full lg:w-[460px] xl:w-[500px] border-r border-neutral-800/80 bg-[#13171d] flex flex-col h-screen overflow-hidden">
        {/* Top Branding Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-[#161b22]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-bold text-lg">
              💬
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                AU Studio <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold uppercase">WhatsApp</span>
              </h1>
              <p className="text-xs text-neutral-400">TikTok & Twitter AU Fake Chat Generator</p>
            </div>
          </div>

          <button 
            onClick={() => setScriptModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI / Paste Script</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-[#161b22]/50 px-3 pt-2 gap-1">
          <button 
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-2 text-xs font-semibold rounded-t-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'messages' 
                ? 'bg-[#1e242e] text-white border-t-2 border-emerald-500' 
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Messages ({messages.length})
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-xs font-semibold rounded-t-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'settings' 
                ? 'bg-[#1e242e] text-white border-t-2 border-emerald-500' 
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Profile & Display
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'messages' && (
            <div className="space-y-3">
              {/* Quick Add Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAddMessage('receiver')}
                  className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium border border-neutral-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-neutral-400" />
                  + Lawan Bicara
                </button>
                <button
                  onClick={() => handleAddMessage('sender')}
                  className="py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-xs font-medium border border-emerald-500/40 flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  + Saya (Hijau)
                </button>
                <button
                  onClick={() => handleAddMessage('system')}
                  className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium border border-neutral-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-neutral-400" />
                  + Divider Tgl
                </button>
              </div>

              {/* Message List */}
              <div className="space-y-2.5 pt-2">
                {messages.map((msg, index) => (
                  <div 
                    key={msg.id}
                    className={`p-3 rounded-xl border transition ${
                      msg.type === 'sender' 
                        ? 'bg-[#182a24] border-emerald-800/40' 
                        : msg.type === 'receiver'
                        ? 'bg-[#1a212a] border-neutral-800'
                        : 'bg-[#14171c] border-neutral-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={msg.type}
                          onChange={(e) => handleUpdateMessage(msg.id, 'type', e.target.value)}
                          className="bg-neutral-900 border border-neutral-700 text-[11px] rounded px-2 py-0.5 text-neutral-200 focus:outline-none focus:border-emerald-500 font-medium"
                        >
                          <option value="receiver">Lawan Bicara (Kiri)</option>
                          <option value="sender">Saya (Kanan)</option>
                          <option value="system">Date / System Notice</option>
                        </select>

                        {msg.type !== 'system' && (
                          <div className="flex items-center gap-1 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-700">
                            <input
                              type="text"
                              value={msg.time}
                              onChange={(e) => handleUpdateMessage(msg.id, 'time', e.target.value)}
                              placeholder="21:40"
                              className="w-11 bg-transparent text-[11px] text-neutral-300 focus:outline-none text-center"
                            />
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        {msg.type === 'sender' && (
                          <button
                            onClick={() => {
                              const nextStatus = msg.status === 'read' ? 'delivered' : msg.status === 'delivered' ? 'sent' : 'read';
                              handleUpdateMessage(msg.id, 'status', nextStatus);
                            }}
                            title="Toggle Read Status"
                            className="p-1 hover:bg-neutral-700 rounded text-neutral-400 hover:text-emerald-400"
                          >
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-neutral-400" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-neutral-400" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleMove(index, -1)}
                          disabled={index === 0}
                          className="p-1 hover:bg-neutral-700 disabled:opacity-30 rounded text-neutral-400"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 1)}
                          disabled={index === messages.length - 1}
                          className="p-1 hover:bg-neutral-700 disabled:opacity-30 rounded text-neutral-400"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Message Content Edit */}
                    <textarea
                      rows={msg.type === 'system' ? 1 : 2}
                      value={msg.text}
                      onChange={(e) => handleUpdateMessage(msg.id, 'text', e.target.value)}
                      placeholder={msg.type === 'system' ? 'Contoh: HARI INI' : 'Ketik isi pesan di sini...'}
                      className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-lg p-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                    />

                    {/* Image / Voice Attachment Toggles */}
                    {msg.type !== 'system' && (
                      <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 cursor-pointer hover:text-neutral-200">
                            <input
                              type="checkbox"
                              checked={!!msg.isVoice}
                              onChange={(e) => handleUpdateMessage(msg.id, 'isVoice', e.target.checked)}
                              className="rounded bg-neutral-900 border-neutral-700 text-emerald-500 focus:ring-0"
                            />
                            <Mic className="w-3 h-3 text-emerald-400" />
                            <span>Voice Note</span>
                          </label>

                          {msg.isVoice && (
                            <input
                              type="text"
                              value={msg.voiceDuration || '0:15'}
                              onChange={(e) => handleUpdateMessage(msg.id, 'voiceDuration', e.target.value)}
                              placeholder="0:15"
                              className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-center text-neutral-200"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <ImageIcon className="w-3 h-3 text-neutral-400" />
                          <input
                            type="text"
                            value={msg.imageUrl || ''}
                            onChange={(e) => handleUpdateMessage(msg.id, 'imageUrl', e.target.value)}
                            placeholder="Image URL (opsional)"
                            className="w-32 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-[10px] text-neutral-300 placeholder-neutral-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Profile Config */}
              <div className="p-3.5 bg-neutral-900/70 rounded-xl border border-neutral-800 space-y-3">
                <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Profil Kontak</h3>
                
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Nama Kontak</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Status Subtitle (online / typing... / jam)</label>
                  <input
                    type="text"
                    value={contactStatus}
                    onChange={(e) => setContactStatus(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Avatar Preset / URL</label>
                  <div className="flex items-center gap-2 mb-2">
                    {DEFAULT_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAvatarUrl(url)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${
                          avatarUrl === url ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Atau masukkan custom Image URL avatar"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Status Bar & Theme */}
              <div className="p-3.5 bg-neutral-900/70 rounded-xl border border-neutral-800 space-y-3">
                <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Tampilan & Status Bar</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Jam HP (Status Bar)</label>
                    <input
                      type="text"
                      value={statusBarTime}
                      onChange={(e) => setStatusBarTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Baterai ({batteryLevel}%)</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={batteryLevel}
                      onChange={(e) => setBatteryLevel(Number(e.target.value))}
                      className="w-full accent-emerald-500 mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Tema Mode</label>
                    <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex-1 py-1 text-xs font-medium rounded flex items-center justify-center gap-1.5 ${
                          theme === 'dark' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Moon className="w-3 h-3" /> Dark
                      </button>
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex-1 py-1 text-xs font-medium rounded flex items-center justify-center gap-1.5 ${
                          theme === 'light' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Sun className="w-3 h-3" /> Light
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Style Device</label>
                    <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                      <button
                        onClick={() => setDevice('ios')}
                        className={`flex-1 py-1 text-xs font-medium rounded flex items-center justify-center gap-1.5 ${
                          device === 'ios' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" /> iOS
                      </button>
                      <button
                        onClick={() => setDevice('android')}
                        className={`flex-1 py-1 text-xs font-medium rounded flex items-center justify-center gap-1.5 ${
                          device === 'android' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Android
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                      className="rounded bg-neutral-950 border-neutral-700 text-emerald-500 focus:ring-0"
                    />
                    <span>Tampilkan Watermark AU Studio kecil di footer</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-neutral-800 bg-[#161b22] flex items-center gap-2">
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating Image...' : 'Download PNG High-Res'}
          </button>

          <button
            onClick={handleCopyImage}
            disabled={isExporting}
            className="p-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            title="Copy to Clipboard"
          >
            {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-300" />}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Live Interactive Preview */}
      <div className="flex-1 bg-[#090b0e] p-4 lg:p-8 flex items-center justify-center overflow-y-auto">
        <div className="flex flex-col items-center max-w-full">
          
          {/* Preview Tag */}
          <div className="mb-3 text-[11px] font-medium text-neutral-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Screen Preview (Pixel-Perfect WhatsApp Engine)</span>
          </div>

          {/* MOCKUP PHONE FRAME */}
          <div 
            ref={chatPreviewRef}
            className="w-[375px] max-w-full rounded-[40px] shadow-2xl overflow-hidden border-[6px] border-[#222831] relative flex flex-col transition-all duration-200"
            style={{ 
              backgroundColor: bgChat,
              minHeight: '680px',
              backgroundImage: isDark 
                ? 'radial-gradient(#15202b 1px, transparent 1px)' 
                : 'radial-gradient(#d1d7db 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* STATUS BAR */}
            <div 
              className="px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold select-none"
              style={{ backgroundColor: bgHeader, color: isDark ? '#ffffff' : '#000000' }}
            >
              <span>{statusBarTime}</span>
              
              {/* Dynamic Island / Notch Mockup for iOS */}
              {device === 'ios' && (
                <div className="w-24 h-4 bg-black rounded-full mx-auto -mt-1 flex items-center justify-end px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111111] border border-neutral-800"></div>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-0.5 font-normal text-[10px]">
                  <span>{batteryLevel}%</span>
                  <Battery className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* WHATSAPP HEADER */}
            <div 
              className="px-3 py-2.5 flex items-center justify-between border-b shadow-xs select-none"
              style={{ 
                backgroundColor: bgHeader, 
                borderColor: isDark ? '#233138' : '#e9edef' 
              }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <ChevronLeft className="w-6 h-6 cursor-pointer" style={{ color: isDark ? '#00a884' : '#008069' }} />
                
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-black/10">
                  <img src={avatarUrl} alt={contactName} className="w-full h-full object-cover" />
                </div>

                {/* Name & Status */}
                <div className="flex flex-col truncate">
                  <span className={`font-semibold text-[14px] leading-tight truncate ${textHeader}`}>
                    {contactName}
                  </span>
                  <span className={`text-[11px] font-normal leading-tight ${
                    contactStatus.toLowerCase().includes('online') || contactStatus.toLowerCase().includes('typing')
                      ? 'text-emerald-500 font-medium' 
                      : textSub
                  }`}>
                    {contactStatus}
                  </span>
                </div>
              </div>

              {/* Header Action Icons */}
              <div className="flex items-center gap-4 pr-1" style={{ color: isDark ? '#aebac1' : '#54656f' }}>
                <Video className="w-5 h-5 cursor-pointer hover:opacity-80" />
                <Phone className="w-4.5 h-4.5 cursor-pointer hover:opacity-80" />
                <MoreVertical className="w-4.5 h-4.5 cursor-pointer hover:opacity-80" />
              </div>
            </div>

            {/* CHAT MESSAGES BODY */}
            <div className="flex-1 p-3.5 space-y-2 overflow-y-auto">
              {messages.map((msg) => {
                // System Date Separator
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-3 select-none">
                      <div 
                        className="px-3 py-1 rounded-lg text-[11px] font-medium shadow-xs uppercase tracking-wide"
                        style={{
                          backgroundColor: isDark ? '#182229' : '#ffffff',
                          color: isDark ? '#8696a0' : '#54656f'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                const isSender = msg.type === 'sender';

                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-1.5 shadow-sm text-[13.5px] relative group ${
                        isSender 
                          ? 'rounded-tr-xs' 
                          : 'rounded-tl-xs'
                      }`}
                      style={{
                        backgroundColor: isSender ? senderBubble : receiverBubble,
                        color: isDark ? '#e9edef' : '#111b21',
                      }}
                    >
                      {/* Image Preview if Attached */}
                      {msg.imageUrl && (
                        <div className="mb-1.5 rounded-lg overflow-hidden max-h-56">
                          <img src={msg.imageUrl} alt="attachment" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Voice Note Layout */}
                      {msg.isVoice ? (
                        <div className="flex items-center gap-2.5 py-1 min-w-[180px]">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isSender ? 'bg-emerald-600 text-white' : 'bg-neutral-600 text-white'
                          }`}>
                            <Mic className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="h-1.5 bg-neutral-500/40 rounded-full w-full overflow-hidden mb-1">
                              <div className="h-full bg-emerald-500 w-2/5 rounded-full"></div>
                            </div>
                            <span className={`text-[10px] ${timeBubble}`}>{msg.voiceDuration || '0:15'}</span>
                          </div>
                        </div>
                      ) : (
                        /* Text Content */
                        <div className="break-words whitespace-pre-wrap leading-relaxed pr-12">
                          {msg.text}
                        </div>
                      )}

                      {/* Timestamp & Read Receipt */}
                      <div className={`absolute bottom-1 right-2 flex items-center gap-1 text-[10.5px] select-none ${timeBubble}`}>
                        <span>{msg.time}</span>
                        {isSender && (
                          <span>
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-neutral-400" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-neutral-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FOOTER INPUT BAR */}
            <div 
              className="p-2 px-3 flex items-center gap-2 select-none border-t"
              style={{ 
                backgroundColor: bgHeader, 
                borderColor: isDark ? '#233138' : '#e9edef' 
              }}
            >
              <Smile className="w-5 h-5 cursor-pointer" style={{ color: isDark ? '#8696a0' : '#54656f' }} />
              <Paperclip className="w-5 h-5 cursor-pointer" style={{ color: isDark ? '#8696a0' : '#54656f' }} />
              
              <div 
                className="flex-1 rounded-2xl px-3 py-1.5 text-xs flex items-center justify-between"
                style={{
                  backgroundColor: isDark ? '#2a3942' : '#ffffff',
                  color: isDark ? '#8696a0' : '#54656f'
                }}
              >
                <span>Ketik pesan</span>
                <Camera className="w-4 h-4 opacity-70" />
              </div>

              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white cursor-pointer shadow-md">
                <Mic className="w-4 h-4" />
              </div>
            </div>

            {/* Optional Small AU Studio Watermark */}
            {showWatermark && (
              <div className="py-1 text-center bg-black/40 text-[9px] text-neutral-400 tracking-wider">
                Generated with AU Studio
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SCRIPT PARSER MODAL */}
      {scriptModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-neutral-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Paste Dialog Script AU
              </h2>
              <button 
                onClick={() => setScriptModalOpen(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Format: 
              <br/><code className="text-emerald-400 font-mono">[A]:</code> untuk chat Kamu (Kanan - Hijau)
              <br/><code className="text-blue-400 font-mono">[B]:</code> untuk chat Lawan Bicara (Kiri - Abu)
            </p>

            <textarea
              rows={8}
              value={rawScript}
              onChange={(e) => setRawScript(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs text-neutral-100 font-mono focus:outline-none focus:border-emerald-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setScriptModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-xl text-neutral-300"
              >
                Batal
              </button>
              <button
                onClick={handleParseScript}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-xs font-bold rounded-xl text-neutral-950 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Convert Jadi Chat Bubble
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
