/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  FileCode, 
  Search, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Terminal as TerminalIcon,
  MessageSquareCode,
  Layout,
  Plus,
  Files,
  Boxes,
  Menu,
  X,
  Code2,
  Bug,
  Ghost,
  Save,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { INITIAL_FILES, type FileItem, type Message, type Extension } from './types';
import { chatWithAI } from './services/aiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState(files[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'explorer' | 'search' | 'ai' | 'extensions' | 'debug'>('explorer');
  const [panelOpen, setPanelOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Welcome to CodeMobile Terminal', 'Type "help" for a list of commands']);
  const editorRef = useRef<any>(null);

  const extensions: Extension[] = [
    { id: '1', name: 'ESLint', description: 'JavaScript linting', enabled: true, version: '2.4.2', icon: 'Code2' },
    { id: '2', name: 'Prettier', description: 'Code formatter', enabled: true, version: '3.0.0', icon: 'Ghost' },
    { id: '3', name: 'GitLens', description: 'Supercharge Git', enabled: false, version: '14.0.0', icon: 'Layout' },
    { id: '4', name: 'Tailwind CSS', description: 'Intelligent Tailwind tooling', enabled: true, version: '0.10.0', icon: 'Boxes' },
  ];

  const activeFile = files.find(f => f.id === activeFileId) || files[0];


  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const insertText = (text: string) => {
    if (!editorRef.current) return;
    const selection = editorRef.current.getSelection();
    const id = { major: 1, minor: 1 };
    const op = { identifier: id, range: selection, text: text, forceMoveMarkers: true };
    editorRef.current.executeEdits("my-source", [op]);
    editorRef.current.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: value } : f));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAiLoading(true);

    const response = await chatWithAI([...messages, userMsg], activeFile.content);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsAiLoading(false);
  };

  const runCode = () => {
    setPanelOpen(true);
    setTerminalOutput(prev => [...prev, `> Executing ${activeFile.name}...`, `Hello from ${activeFile.name}! Execution successful.`]);
  };

  return (
    <div className="flex h-screen w-full bg-sleek-bg text-sleek-text font-sans selection:bg-[#264f78] overflow-hidden">
      {/* Activity Bar (Side Rail) */}
      <div className="w-12 md:w-16 flex flex-col items-center py-4 border-r border-sleek-border gap-4 bg-sleek-activity z-50">
        <ActivityIcon 
          icon={Files} 
          active={activeSidebarTab === 'explorer'} 
          onClick={() => { setActiveSidebarTab('explorer'); setSidebarOpen(true); }}
          label="Explorer"
        />
        <ActivityIcon 
          icon={Search} 
          active={activeSidebarTab === 'search'} 
          onClick={() => { setActiveSidebarTab('search'); setSidebarOpen(true); }}
          label="Search"
        />
        <ActivityIcon 
          icon={MessageSquareCode} 
          active={activeSidebarTab === 'ai'} 
          onClick={() => { setActiveSidebarTab('ai'); setSidebarOpen(true); }}
          label="Copilot AI"
        />
        <ActivityIcon 
          icon={Boxes} 
          active={activeSidebarTab === 'extensions'} 
          onClick={() => { setActiveSidebarTab('extensions'); setSidebarOpen(true); }}
          label="Extensions"
        />
        <ActivityIcon 
          icon={Bug} 
          active={activeSidebarTab === 'debug'} 
          onClick={() => { setActiveSidebarTab('debug'); setSidebarOpen(true); }}
          label="Run & Debug"
        />
        <div className="mt-auto">
          <ActivityIcon icon={Settings} active={false} onClick={() => {}} label="Settings" />
        </div>
      </div>

      {/* Sidebar Content */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: window.innerWidth < 768 ? '100vw' : 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className={cn(
              "border-r border-sleek-border bg-sleek-sidebar flex flex-col z-40 overflow-hidden",
              window.innerWidth < 768 && "absolute inset-0 left-12 md:left-16"
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-sleek-border">
              <span className="text-[11px] uppercase tracking-wider font-bold opacity-50">
                {activeSidebarTab === 'explorer' ? 'Explorer' : 
                 activeSidebarTab === 'ai' ? 'Copilot AI' : 
                 activeSidebarTab === 'extensions' ? 'Extensions' : 
                 activeSidebarTab === 'debug' ? 'Debug Console' : 'Search'}
              </span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-[#37373d] rounded text-sleek-text-muted hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
              {activeSidebarTab === 'explorer' && (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center justify-between px-2 py-1 mb-2">
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">MOBILE-IDE</span>
                    <Plus size={14} className="cursor-pointer opacity-50 hover:opacity-100" />
                  </div>
                  {files.map(file => (
                    <FileRow 
                      key={file.id} 
                      file={file} 
                      active={file.id === activeFileId} 
                      onClick={() => {
                        setActiveFileId(file.id);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }} 
                    />
                  ))}
                </div>
              )}

              {activeSidebarTab === 'extensions' && (
                <div className="space-y-2 mt-2">
                  {extensions.map(ext => (
                    <div key={ext.id} className="p-3 border border-sleek-border rounded-sm bg-sleek-bg hover:bg-[#2a2d2e] transition-colors relative group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-sleek-sidebar rounded-sm">
                          <Boxes size={20} className="text-[#007acc]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-sleek-text truncate">{ext.name}</h4>
                          <p className="text-[10px] text-sleek-text-muted truncate leading-tight mt-0.5">{ext.description}</p>
                        </div>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          ext.enabled ? "bg-[#3fb950]" : "bg-sleek-text-muted"
                        )} />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[9px] font-mono opacity-40">v{ext.version}</span>
                        <button className="text-[9px] font-bold uppercase tracking-widest text-sleek-accent hover:underline">Manage</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSidebarTab === 'debug' && (
                <div className="py-10 text-center text-sleek-text-muted italic text-xs font-mono px-4">
                  <Bug size={32} className="mx-auto mb-4 opacity-50" />
                  Select a logic configuration to start...
                </div>
              )}

              {activeSidebarTab === 'search' && (
                <div className="space-y-4 py-4 px-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    <input 
                      type="text" 
                      placeholder="Search across files..." 
                      className="w-full bg-[#1e1e1e] border border-sleek-border rounded py-1.5 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-sleek-accent"
                    />
                  </div>
                  <div className="text-[10px] opacity-40 italic">0 results found</div>
                </div>
              )}

              {activeSidebarTab === 'ai' && (
                <div className="flex flex-col h-full py-2">
                  <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar">
                    {messages.length === 0 && (
                      <div className="text-center py-10 px-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
                          <MessageSquareCode />
                        </div>
                        <h3 className="text-xs font-bold mb-1">Copilot AI Agent</h3>
                        <p className="text-[10px] opacity-50 italic font-mono leading-relaxed">
                          Extracting patterns... suggest code fixes or ask for new features.
                        </p>
                      </div>
                    )}
                    {messages.map((m, i) => (
                      <div key={i} className={cn(
                        "p-3 rounded-sm text-xs leading-relaxed font-mono animate-in fade-in slide-in-from-bottom-2",
                        m.role === 'user' ? "bg-sleek-accent text-white ml-4 shadow-md" : "bg-sleek-sidebar border border-sleek-border mr-4 shadow-xl"
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] opacity-50 uppercase tracking-tighter">
                            {m.role === 'user' ? <Code2 size={10} /> : <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-purple-400 to-blue-400" />}
                          </span>
                          <span className={cn("text-[9px] uppercase tracking-tighter", m.role === 'user' ? "text-white/70" : "opacity-50")}>
                            {m.role === 'user' ? 'ME' : 'COPILOT'}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="flex items-center gap-2 px-2">
                        <Loader2 className="animate-spin text-sleek-accent" size={14} />
                        <span className="text-[10px] font-mono opacity-50">AI is thinking...</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-2 p-2 border-t border-sleek-border bg-sleek-sidebar">
                    <div className="bg-sleek-bg border border-[#454545] rounded-lg px-3 py-2 flex flex-col">
                      <textarea 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder="Ask Copilot..."
                        className="w-full bg-transparent text-xs outline-none border-none resize-none h-16 font-mono custom-scrollbar"
                      />
                      <div className="flex justify-between items-center mt-1">
                         <span className="text-[9px] opacity-30 italic">Gemini Advanced</span>
                         <button 
                          onClick={handleSendMessage}
                          disabled={isAiLoading || !inputValue.trim()}
                          className="text-sleek-accent hover:text-white disabled:opacity-30 transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Breadcrumbs & Tabs Bar */}
        <div className="flex items-center justify-between bg-sleek-sidebar border-b border-sleek-border h-9 px-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex items-center h-full">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="p-1.5 hover:bg-[#37373d] rounded transition-colors mr-2"
              >
                <Menu size={14} />
              </button>
            )}
            <div className="flex items-center h-full px-3 py-2 bg-sleek-bg text-xs border-t-2 border-sleek-accent cursor-default gap-2">
              <span className="text-[#e06c75] font-mono text-[10px] font-bold">JS</span>
              <span className="text-[11px]">{activeFile.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 text-sleek-text-muted">
            <button className="hover:text-white transition-colors"><Save size={14} /></button>
            <button 
              onClick={runCode}
              className="text-[#61afef] hover:text-[#72baff] transition-all"
            >
              <Play size={14} />
            </button>
          </div>
        </div>

        {/* Editor Wrapper */}
        <div className="flex-1 relative bg-sleek-bg">
          <Editor
            height="100%"
            theme="vs-dark"
            path={activeFile.name}
            defaultLanguage={activeFile.language}
            defaultValue={activeFile.content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 16, bottom: 64 },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              renderLineHighlight: 'all',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
              },
              fixedOverflowWidgets: true,
              lineNumbersMinChars: 3,
              backgroundColor: '#1e1e1e',
            }}
          />

          {/* Mobile Tool Bar (The "Cheat Sheet") */}
          <div className="absolute bottom-0 left-0 right-0 h-11 bg-sleek-sidebar/90 backdrop-blur-md border-t border-sleek-border flex items-center px-4 gap-3 overflow-x-auto scrollbar-hide select-none md:hidden z-10">
            <MobileTool label="Tab" onClick={() => insertText('  ')} />
            <div className="w-[1px] h-4 bg-sleek-border" />
            <MobileTool label="{" onClick={() => insertText('{}')} />
            <MobileTool label="(" onClick={() => insertText('()')} />
            <MobileTool label=";" onClick={() => insertText(';')} />
            <MobileTool label="=" onClick={() => insertText('=')} />
            <MobileTool label="/" onClick={() => insertText('/')} />
            <MobileTool label=">" onClick={() => insertText('>')} />
          </div>
        </div>

        {/* Bottom Panel (Terminal) */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: 180 }}
              exit={{ height: 0 }}
              className="bg-sleek-bg border-t border-sleek-border overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-1 text-[11px] font-bold text-sleek-text-muted border-b border-sleek-border">
                <div className="flex gap-6">
                  <span className="text-white border-b border-white py-1 cursor-pointer">TERMINAL</span>
                  <span className="hover:text-white transition-colors cursor-pointer py-1">DEBUG CONSOLE</span>
                  <span className="hover:text-white transition-colors cursor-pointer py-1">PROBLEMS</span>
                </div>
                <button onClick={() => setPanelOpen(false)} className="hover:text-white">
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar bg-sleek-bg">
                {terminalOutput.map((line, i) => (
                  <div key={i} className="mb-0.5">
                    <span className="text-[#61afef] mr-2">➜</span>
                    <span className={cn(line.startsWith('>') ? 'text-sleek-text' : 'text-[#6a9955]')}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Status Bar */}
        <div className="h-6 bg-sleek-accent text-white flex items-center justify-between px-3 text-[11px] shrink-0 select-none z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 cursor-pointer hover:bg-white/10 px-2 h-full transition-colors" onClick={() => setPanelOpen(!panelOpen)}>
               main*
            </div>
            <div className="flex items-center gap-1"><span className="font-bold">0</span> errors <span className="font-bold ml-1">0</span> warnings</div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">UTF-8</span>
            <span>{activeFile.language.toUpperCase()}</span>
            <div className="flex items-center gap-1"><Ghost size={12} fill="currentColor" /> Copilot</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon({ icon: Icon, active, onClick, label }: { icon: any, active: boolean, onClick: () => void, label: string }) {
  return (
    <div 
      className={cn(
        "relative p-2 cursor-pointer transition-all hover:text-white group",
        active ? "text-white" : "text-[#8b949e]"
      )}
      onClick={onClick}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 1.5} />
      {active && <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-white rounded-full translate-x-[-12px] md:translate-x-[-16px]" />}
      <div className="absolute left-full ml-2 px-2 py-1 bg-[#161b22] border border-[#30363d] rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 pointer-events-none translate-x-[-10px] group-hover:translate-x-0 transition-all z-[60] whitespace-nowrap shadow-2xl">
        {label}
      </div>
    </div>
  );
}

function FileRow({ file, active, onClick }: { file: FileItem, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-xs transition-colors group",
        active ? "bg-[#21262d] text-white" : "text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]"
      )}
    >
      <FileCode size={14} className={cn(active ? "text-[#388bfd]" : "text-[#8b949e]")} />
      <span className={cn("font-mono truncate flex-1", active && "font-bold")}>{file.name}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-[#388bfd]" />}
    </div>
  );
}

function MobileTool({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="shrink-0 px-3 py-1 bg-[#21262d] text-[#c9d1d9] text-xs font-mono font-bold rounded border border-[#30363d] active:bg-[#388bfd] active:text-white transition-colors"
    >
      {label}
    </button>
  );
}

