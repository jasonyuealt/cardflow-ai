/**
 * 主页 - 移动端风格改造
 */

import React, { useState, useRef, useEffect } from 'react';
import { useModulesStore } from '../store/modules-store';
import { ModuleRenderer } from '../modules/ModuleRenderer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CardSkeleton } from '../components/card/CardSkeleton';

export const HomePage: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const { modules, loading, error, loadModules, reset } = useModulesStore();
  const topRef = useRef<HTMLDivElement>(null); // 改为 topRef

  // 当有新内容加载完成时，自动滚动到顶部
  useEffect(() => {
    if (!loading && modules.length > 0 && topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, modules.length]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim()) return;

    // 收起键盘
    (document.activeElement as HTMLElement)?.blur();

    // 立即重置状态，清除旧卡片
    reset();

    // 稍微延迟加载，让 UI 有机会先渲染空状态
    setTimeout(async () => {
      await loadModules(userInput.trim());
    }, 0);

    setUserInput('');
  };

  const handleReset = () => {
    reset();
    setUserInput('');
  };

  return (
    <div className="relative flex flex-col h-screen sm:h-[calc(100vh-2rem)] max-w-md mx-auto overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 shadow-2xl sm:rounded-[32px] sm:my-4 sm:border-[8px] sm:border-white transition-all duration-300">

      {/* 顶部状态栏模拟 */}
      <header className="flex-none px-6 pt-6 pb-4 flex justify-between items-center z-10 bg-transparent">
        <div className="flex items-center gap-4 h-10">
          {/* 仅当有内容时显示返回按钮 */}
          {modules.length > 0 && (
            <button
              onClick={handleReset}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all active:scale-95 text-slate-600"
              title="返回"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
        </div>
        <div className="text-sm font-semibold text-slate-500 tracking-wide uppercase">CardFlow</div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20 ring-2 ring-white">
          AI
        </div>
      </header>

      {/* 主内容区 */}
      <main 
        className={`flex-1 py-2 no-scrollbar scroll-smooth transition-all duration-500 ${
          modules.length > 0 ? 'overflow-y-auto' : 'overflow-hidden flex flex-col justify-center'
        }`}
      >
        <div className={`space-y-3 pb-24 min-h-full ${modules.length === 0 ? 'flex flex-col justify-center' : ''}`}>
          <div ref={topRef} /> {/* 顶部锚点 */}

          {/* 欢迎/空状态 */}
          {modules.length === 0 && !loading && !error && (
            <div className="flex flex-col items-center justify-center w-full px-6 -mt-20">
              <div className="w-24 h-24 rounded-full bg-white shadow-xl shadow-blue-100 flex items-center justify-center mb-8 ring-1 ring-slate-100">
                <span className="text-4xl animate-pulse">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Plan your next trip</h2>
              <p className="text-slate-500 max-w-[260px] leading-relaxed">
                Tell me where you want to go, and I'll organize everything for you.
              </p>

              {/* 快速建议 */}
              <div className="mt-10 grid grid-cols-1 gap-3 w-full max-w-xs">
                {[
                  "订明天北京到上海的机票",
                  "查询上海的天气",
                  "推荐外滩附近的酒店"
                ].map((text) => (
                  <button
                    key={text}
                    onClick={() => { setUserInput(text); handleSubmit(); }}
                    className="text-left px-5 py-4 rounded-2xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-98 text-sm text-slate-600 border border-slate-100"
                  >
                    "{text}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 模块列表 */}
          {modules.map((module) => (
            <div key={module.instanceId} className="animate-slide-up">
              <ModuleRenderer module={module} />
            </div>
          ))}

          {/* 加载状态 */}
          {loading && (
            <div className="animate-fade-in space-y-4 px-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="p-4 mx-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-center text-sm">
              {error}
              <button onClick={() => loadModules(userInput)} className="block mx-auto mt-2 text-red-400 underline">重试</button>
            </div>
          )}

        </div>
      </main>

      {/* 底部输入栏 */}
      <div className="flex-none p-4 pb-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-20">
        <div className="relative glass-input rounded-[2rem] p-1.5 flex items-center gap-2 shadow-xl ring-1 ring-slate-200/50 bg-white/80">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <span className="text-xl font-light">+</span>
          </button>

          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ask Natural..."
            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 h-10 px-2 font-medium"
            disabled={loading}
          />

          <button
            onClick={() => handleSubmit()}
            disabled={!userInput.trim() || loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${userInput.trim()
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 rotate-0 scale-100'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed scale-95'
              }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={userInput.trim() ? '' : 'opacity-50'}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {/* 底部 Home Indicator */}
        <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto mt-4 opacity-50"></div>
      </div>
    </div>
  );
};
