import React, { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { useAuth } from '../context/AuthContext';
import ProjectManagerModal from './ProjectManagerModal';
import { 
  Download, Copy, Image as ImageIcon, Heart, Repeat2, MessageCircle, 
  Bookmark, Share, MoreHorizontal, CheckCircle2, ShieldCheck, 
  Sun, Moon, Plus, Trash2, Sparkles, BarChart2, Folder, Save, AlertCircle
} from 'lucide-react';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
];

export default function TwitterGenerator() {
  const { user, recordExport, setUpgradeModalOpen } = useAuth();
  const [theme, setTheme] = useState('black');
  
  // Author State
  const [name, setName] = useState('Arka Narendra');
  const [handle, setHandle] = useState('arkanrd_');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATARS[1]);
  const [badge, setBadge] = useState('blue');

  // Main Tweet State
  const [tweetText, setTweetText] = useState('kalau emang ga pernah ada niatan buat stay, kenapa dari awal harus bikin nyaman? cape banget tau ga.');
  const [tweetTime, setTweetTime] = useState('11:42 PM');
  const [tweetDate, setTweetDate] = useState('Sep 2, 2026');
  const [client, setClient] = useState('Twitter for iPhone');
  const [mediaUrl, setMediaUrl] = useState('');

  // Metrics
  const [views, setViews] = useState('142.5K');
  const [replies, setReplies] = useState('324');
  const [reposts, setReposts] = useState('1,240');
  const [likes, setLikes] = useState('18.6K');
  const [bookmarks, setBookmarks] = useState('942');
  const [isLiked, setIsLiked] = useState(true);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Thread Replies
  const [repliesList, setRepliesList] = useState([
    {
      id: 'r_1',
      name: 'Nara 🌸',
      handle: 'narayaaa',
      avatarUrl: DEFAULT_AVATARS[0],
      badge: 'none',
      text: 'semangat ka arka, you deserve better! 🥺🤍',
      time: '11:44 PM',
      likes: '42'
    }
  ]);

  const [activeTab, setActiveTab] = useState('main');
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [quotaWarning, setQuotaWarning] = useState('');
  const tweetPreviewRef = useRef(null);

  const handleAddReply = () => {
    setRepliesList([
      ...repliesList,
      {
        id: Date.now().toString(),
        name: 'User Reply',
        handle: 'userhandle',
        avatarUrl: DEFAULT_AVATARS[2],
        badge: 'none',
        text: 'Balasan tweet di sini...',
        time: '11:45 PM',
        likes: '12'
      }
    ]);
  };

  const handleUpdateReply = (id, field, value) => {
    setRepliesList(repliesList.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleDeleteReply = (id) => {
    setRepliesList(repliesList.filter(r => r.id !== id));
  };

  const handleDownloadImage = async () => {
    if (!tweetPreviewRef.current) return;
    setQuotaWarning('');

    const check = await recordExport(`Tweet @${handle}`, 'twitter');
    if (!check.success) {
      setQuotaWarning(check.error);
      setUpgradeModalOpen(true);
      return;
    }

    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(tweetPreviewRef.current, {
        pixelRatio: 3,
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `AU_Tweet_${handle}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Gagal mendownload tweet image. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    if (!tweetPreviewRef.current) return;
    setIsExporting(true);
    try {
      const blob = await htmlToImage.toBlob(tweetPreviewRef.current, { pixelRatio: 2.5 });
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
      }
    } catch (err) {
      console.error('Clipboard copy failed', err);
      alert('Browser tidak mengizinkan direct clipboard copy, gunakan Download PNG.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLoadProjectData = (type, data) => {
    if (data.name) setName(data.name);
    if (data.handle) setHandle(data.handle);
    if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
    if (data.tweetText) setTweetText(data.tweetText);
    if (data.repliesList) setRepliesList(data.repliesList);
    if (data.theme) setTheme(data.theme);
  };

  const currentProjectData = {
    name,
    handle,
    avatarUrl,
    badge,
    tweetText,
    tweetTime,
    tweetDate,
    client,
    mediaUrl,
    views,
    reposts,
    likes,
    bookmarks,
    repliesList,
    theme
  };

  const bgStyles = {
    black: 'bg-black text-[#e7e9ea] border-[#2f3336]',
    dim: 'bg-[#15202b] text-[#f7f9f9] border-[#38444d]',
    light: 'bg-white text-[#0f1419] border-[#eff3f4]'
  };

  const subTextStyles = {
    black: 'text-[#71767b]',
    dim: 'text-[#8b98a5]',
    light: 'text-[#536471]'
  };

  const borderStyles = {
    black: 'border-[#2f3336]',
    dim: 'border-[#38444d]',
    light: 'border-[#eff3f4]'
  };

  const renderBadge = (badgeType) => {
    if (badgeType === 'blue') {
      return (
        <svg viewBox="0 0 22 22" className="w-4 h-4 fill-[#1d9bf0] inline-block shrink-0">
          <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.136 2.136 5.425-5.425 1.293 1.302-6.718 6.717z"/>
        </svg>
      );
    }
    if (badgeType === 'gold') {
      return (
        <svg viewBox="0 0 22 22" className="w-4 h-4 fill-[#e2b714] inline-block shrink-0">
          <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.136 2.136 5.425-5.425 1.293 1.302-6.718 6.717z"/>
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
      
      {/* LEFT PANEL */}
      <div className="w-full lg:w-[460px] xl:w-[480px] border-r border-neutral-800 bg-[#13171d] flex flex-col h-full overflow-hidden">
        
        {/* Top Header */}
        <div className="p-3 border-b border-neutral-800 flex items-center justify-between bg-[#161b22]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProjectModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-semibold transition"
            >
              <Folder className="w-3.5 h-3.5 text-[#1d9bf0]" />
              <span>Cerita Saya</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setTheme('black')}
              className={`px-2 py-0.5 text-[11px] rounded font-medium ${theme === 'black' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
            >
              Black
            </button>
            <button
              onClick={() => setTheme('dim')}
              className={`px-2 py-0.5 text-[11px] rounded font-medium ${theme === 'dim' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
            >
              Dim
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-2 py-0.5 text-[11px] rounded font-medium ${theme === 'light' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
            >
              Light
            </button>
          </div>
        </div>

        {/* Quota Banner */}
        {quotaWarning && (
          <div className="p-2.5 bg-red-500/10 border-b border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{quotaWarning}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800 bg-[#161b22]/50 px-3 pt-2 gap-1">
          <button 
            onClick={() => setActiveTab('main')}
            className={`flex-1 py-2 text-xs font-semibold rounded-t-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'main' 
                ? 'bg-[#1e242e] text-white border-t-2 border-[#1d9bf0]' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Tweet Content
          </button>
          <button 
            onClick={() => setActiveTab('replies')}
            className={`flex-1 py-2 text-xs font-semibold rounded-t-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'replies' 
                ? 'bg-[#1e242e] text-white border-t-2 border-[#1d9bf0]' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Thread ({repliesList.length})
          </button>
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-2 text-xs font-semibold rounded-t-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'metrics' 
                ? 'bg-[#1e242e] text-white border-t-2 border-[#1d9bf0]' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Metrics
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'main' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2.5">
                <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Author Profile</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#1d9bf0]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Username / Handle</label>
                    <div className="flex items-center bg-neutral-950 border border-neutral-700 rounded-lg px-2">
                      <span className="text-xs text-neutral-500">@</span>
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                        className="w-full bg-transparent p-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Verified Badge</label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#1d9bf0]"
                    >
                      <option value="blue">Blue (Twitter Blue)</option>
                      <option value="gold">Gold (Organization)</option>
                      <option value="none">Tanpa Badge</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Preset Avatar</label>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {DEFAULT_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAvatarUrl(url)}
                          className={`w-7 h-7 rounded-full overflow-hidden border transition ${
                            avatarUrl === url ? 'border-[#1d9bf0] scale-110' : 'border-transparent opacity-60'
                          }`}
                        >
                          <img src={url} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Custom Avatar URL</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-[#1d9bf0]"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2.5">
                <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Tweet Text</h3>
                <textarea
                  rows={4}
                  value={tweetText}
                  onChange={(e) => setTweetText(e.target.value)}
                  placeholder="What is happening?!"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#1d9bf0] leading-relaxed resize-none"
                />

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Attachment Image URL (Opsional)</label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#1d9bf0]"
                  />
                </div>
              </div>

              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2.5">
                <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Date & Source</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Time</label>
                    <input
                      type="text"
                      value={tweetTime}
                      onChange={(e) => setTweetTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Date</label>
                    <input
                      type="text"
                      value={tweetDate}
                      onChange={(e) => setTweetDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Client</label>
                    <select
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Twitter for iPhone">iPhone</option>
                      <option value="Twitter for Android">Android</option>
                      <option value="Twitter Web App">Web App</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'replies' && (
            <div className="space-y-3">
              <button
                onClick={handleAddReply}
                className="w-full py-2 bg-[#1d9bf0]/20 hover:bg-[#1d9bf0]/30 text-[#1d9bf0] border border-[#1d9bf0]/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                + Tambah Balasan Thread
              </button>

              <div className="space-y-2.5">
                {repliesList.map((rep, idx) => (
                  <div key={rep.id} className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-300">Reply #{idx + 1}</span>
                      <button
                        onClick={() => handleDeleteReply(rep.id)}
                        className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={rep.name}
                        onChange={(e) => handleUpdateReply(rep.id, 'name', e.target.value)}
                        placeholder="Nama"
                        className="bg-neutral-950 border border-neutral-700 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={rep.handle}
                        onChange={(e) => handleUpdateReply(rep.id, 'handle', e.target.value)}
                        placeholder="handle (tanpa @)"
                        className="bg-neutral-950 border border-neutral-700 rounded-lg p-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={rep.text}
                      onChange={(e) => handleUpdateReply(rep.id, 'text', e.target.value)}
                      placeholder="Isi balasan tweet..."
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none resize-none"
                    />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={rep.time}
                        onChange={(e) => handleUpdateReply(rep.id, 'time', e.target.value)}
                        placeholder="Jam (11:45 PM)"
                        className="bg-neutral-950 border border-neutral-700 rounded p-1 text-neutral-200"
                      />
                      <input
                        type="text"
                        value={rep.likes}
                        onChange={(e) => handleUpdateReply(rep.id, 'likes', e.target.value)}
                        placeholder="Likes (42)"
                        className="bg-neutral-950 border border-neutral-700 rounded p-1 text-neutral-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="p-3.5 bg-neutral-900/80 rounded-xl border border-neutral-800 space-y-3">
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Engagement Metrics</h3>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Views</label>
                  <input
                    type="text"
                    value={views}
                    onChange={(e) => setViews(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Likes</label>
                  <input
                    type="text"
                    value={likes}
                    onChange={(e) => setLikes(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Reposts (Retweets)</label>
                  <input
                    type="text"
                    value={reposts}
                    onChange={(e) => setReposts(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Bookmarks</label>
                  <input
                    type="text"
                    value={bookmarks}
                    onChange={(e) => setBookmarks(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLiked}
                    onChange={(e) => setIsLiked(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-700 text-[#f91880] focus:ring-0"
                  />
                  <span className="text-neutral-300">Status Active Liked (Pink Heart)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-neutral-800 bg-[#161b22] flex items-center gap-2">
          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex-1 py-2.5 px-4 bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#1d9bf0]/20 transition active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Download PNG High-Res'}
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

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-[#090b0e] p-4 lg:p-8 flex items-center justify-center overflow-y-auto">
        <div className="flex flex-col items-center max-w-full">
          <div className="mb-3 text-[11px] font-medium text-neutral-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1d9bf0] animate-pulse"></span>
            <span>Live X (Twitter) Preview</span>
          </div>

          <div 
            ref={tweetPreviewRef}
            className={`w-[480px] max-w-full rounded-2xl border p-4 shadow-2xl transition-all duration-200 ${bgStyles[theme]}`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          >
            {/* MAIN TWEET HEADER */}
            <div className="flex items-center justify-between mb-3 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-black/10">
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[15px] leading-tight hover:underline cursor-pointer">
                      {name}
                    </span>
                    {renderBadge(badge)}
                  </div>
                  <span className={`text-[13px] leading-tight ${subTextStyles[theme]}`}>
                    @{handle}
                  </span>
                </div>
              </div>

              <div className={`p-1.5 rounded-full hover:bg-neutral-800/40 cursor-pointer ${subTextStyles[theme]}`}>
                <MoreHorizontal className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* MAIN TWEET CONTENT */}
            <div className="text-[15.5px] leading-relaxed whitespace-pre-wrap break-words mb-3">
              {tweetText}
            </div>

            {mediaUrl && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-neutral-700/50 max-h-80">
                <img src={mediaUrl} alt="tweet media" className="w-full h-full object-cover" />
              </div>
            )}

            {/* TIMESTAMP & SOURCE */}
            <div className={`py-2 border-b text-[13px] flex items-center gap-1.5 ${borderStyles[theme]} ${subTextStyles[theme]}`}>
              <span>{tweetTime}</span>
              <span>·</span>
              <span>{tweetDate}</span>
              <span>·</span>
              <span className="text-[#1d9bf0] font-medium">{client}</span>
            </div>

            {/* ENGAGEMENT METRICS BAR */}
            <div className={`py-2.5 border-b text-[13px] flex items-center gap-4 ${borderStyles[theme]}`}>
              <div className="flex items-center gap-1">
                <span className="font-bold">{reposts}</span>
                <span className={subTextStyles[theme]}>Reposts</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">{likes}</span>
                <span className={subTextStyles[theme]}>Likes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">{bookmarks}</span>
                <span className={subTextStyles[theme]}>Bookmarks</span>
              </div>
            </div>

            {/* TWEET ACTIONS ICON BAR */}
            <div className={`py-2 border-b flex items-center justify-around select-none ${borderStyles[theme]} ${subTextStyles[theme]}`}>
              <div className="flex items-center gap-1.5 hover:text-[#1d9bf0] cursor-pointer">
                <MessageCircle className="w-4.5 h-4.5" />
                <span className="text-xs">{replies}</span>
              </div>
              <div className={`flex items-center gap-1.5 cursor-pointer ${isRetweeted ? 'text-[#00ba7c]' : 'hover:text-[#00ba7c]'}`}>
                <Repeat2 className="w-4.5 h-4.5" />
                <span className="text-xs">{reposts}</span>
              </div>
              <div className={`flex items-center gap-1.5 cursor-pointer ${isLiked ? 'text-[#f91880]' : 'hover:text-[#f91880]'}`}>
                <Heart className={`w-4.5 h-4.5 ${isLiked ? 'fill-[#f91880]' : ''}`} />
                <span className="text-xs">{likes}</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[#1d9bf0] cursor-pointer">
                <BarChart2 className="w-4.5 h-4.5" />
                <span className="text-xs">{views}</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[#1d9bf0] cursor-pointer">
                <Bookmark className={`w-4.5 h-4.5 ${isBookmarked ? 'fill-[#1d9bf0] text-[#1d9bf0]' : ''}`} />
              </div>
              <div className="hover:text-[#1d9bf0] cursor-pointer">
                <Share className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* THREAD REPLIES */}
            {repliesList.length > 0 && (
              <div className="pt-3 space-y-3">
                {repliesList.map((reply) => (
                  <div key={reply.id} className="flex gap-3 relative">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-black/10 z-10">
                      <img src={reply.avatarUrl} alt={reply.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-[13.5px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[13.5px] leading-tight">{reply.name}</span>
                        <span className={`text-[12px] ${subTextStyles[theme]}`}>@{reply.handle}</span>
                        <span className={`text-[12px] ${subTextStyles[theme]}`}>·</span>
                        <span className={`text-[12px] ${subTextStyles[theme]}`}>{reply.time}</span>
                      </div>
                      <div className="mt-0.5 whitespace-pre-wrap break-words leading-relaxed">
                        {reply.text}
                      </div>
                      <div className={`mt-1.5 flex items-center gap-4 text-[11px] ${subTextStyles[theme]}`}>
                        <div className="flex items-center gap-1 hover:text-[#f91880] cursor-pointer">
                          <Heart className="w-3.5 h-3.5" />
                          <span>{reply.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showWatermark && (
              <div className={`mt-3 pt-2 text-center text-[9px] border-t ${borderStyles[theme]} ${subTextStyles[theme]} tracking-wider`}>
                AUinAja • auinaja.vercel.app
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CLOUD PROJECT MANAGER MODAL */}
      <ProjectManagerModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        currentType="twitter"
        currentData={currentProjectData}
        onLoadProject={handleLoadProjectData}
      />

    </div>
  );
}
