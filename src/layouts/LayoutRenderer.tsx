/**
 * 布局渲染器 - 根据布局类型渲染对应的横向滑动布局
 * 每个模块都是独立的横向滑动卡片，统一显示完整内容，左右滚动
 */

import React, { useRef } from 'react';
import { ModuleInstance } from '../../shared/types';

interface LayoutRendererProps {
  module: ModuleInstance;
}

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({ module }) => {
  const { style } = module;

  // 根据布局类型渲染对应的布局
  const renderLayout = () => {
    switch (style.layout) {
      case 'horizontal-scrollable-list':
        return <HorizontalScrollableList module={module} />;
      case 'info-display':
        return <InfoDisplay module={module} />;
      case 'interactive-action':
        return <InteractiveAction module={module} />;
      case 'map-view-horizontal':
        return <MapViewHorizontal module={module} />;
      default:
        // 默认为列表
        return <HorizontalScrollableList module={module} />;
    }
  };

  return (
    <div className="module-card w-full">
      {module.loading ? (
        <div className="p-4 text-center text-gray-400 text-sm">加载中...</div>
      ) : module.error ? (
        <div className="p-4 text-center text-red-400 text-sm">{module.error}</div>
      ) : (
        renderLayout()
      )}
    </div>
  );
};

// 通用样式常量
// !px-6 强制设置左右内边距，防止贴边
// scroll-px-6 确保 snap 对齐时考虑到 padding，避免第一个元素贴边
const SCROLL_CONTAINER_CLASS = "horizontal-scroll-container flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide w-full gap-3 !px-6 scroll-px-6 py-1";
// 85% 宽度让右侧露出一点，暗示可滑动
const CARD_WRAPPER_CLASS = "flex-shrink-0 snap-start w-[85%] sm:w-[300px]";
const CARD_BASE_CLASS = "p-4 bg-white h-full rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col relative overflow-hidden";

// 横向滑动列表布局
const HorizontalScrollableList: React.FC<{ module: ModuleInstance }> = ({ module }) => {
  const { data } = module;
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-400 text-sm">暂无数据</div>;
  }

  // 获取航空公司logo（简化版，使用emoji）
  const getAirlineLogo = (airline: string) => {
    const logos: Record<string, string> = {
      '南方航空': '✈️',
      '东方航空': '✈️',
      '中国国航': '✈️',
      '海南航空': '✈️',
      '四川航空': '✈️',
    };
    return logos[airline] || '✈️';
  };

  return (
    <div 
      ref={scrollRef}
      className={SCROLL_CONTAINER_CLASS}
    >
      {data.map((item: any, index: number) => (
        <div key={index} className={CARD_WRAPPER_CLASS}>
          <div className={CARD_BASE_CLASS}>
            {/* 顶部信息：Logo/Icon + 标题 */}
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl mr-3 border border-slate-100 shrink-0">
                {item.airline ? getAirlineLogo(item.airline) : (item.icon || '📦')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-slate-800 truncate leading-tight">
                  {item.flightNumber || item.title || item.name}
                </div>
                {item.airline && (
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{item.airline}</div>
                )}
              </div>
            </div>

            {/* 中间主要内容 */}
            <div className="text-sm text-slate-600 mb-3 flex-1">
              {item.departure && item.arrival ? (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg w-full justify-between">
                  <span className="text-base font-bold text-slate-700">{item.departure}</span>
                  <div className="h-[1px] w-8 bg-slate-300 relative top-[1px]"></div>
                  <span className="text-base font-bold text-slate-700">{item.arrival}</span>
                </div>
              ) : (
                <p className="line-clamp-2 leading-relaxed">{item.description || item.subTitle}</p>
              )}
            </div>

            {/* 底部价格/操作 */}
            {item.price && (
              <div className="text-xl font-bold text-blue-600 flex items-baseline mt-auto">
                {typeof item.price === 'number' ? (
                  <>
                    <span className="text-sm font-semibold text-blue-600/80 mr-0.5">¥</span>
                    {item.price}
                  </>
                ) : item.price}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// 信息展示布局
const InfoDisplay: React.FC<{ module: ModuleInstance }> = ({ module }) => {
  const { data } = module;
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-400 text-sm">暂无信息</div>;
  }

  return (
    <div 
      ref={scrollRef}
      className={SCROLL_CONTAINER_CLASS}
    >
      {data.map((item: any, index: number) => (
        <div key={index} className={CARD_WRAPPER_CLASS}>
          <div className={CARD_BASE_CLASS}>
            <div className="text-base font-bold text-slate-800 mb-2 line-clamp-1">{item.title}</div>
            <div className="text-sm text-slate-500 mb-3 leading-relaxed line-clamp-3 flex-1">{item.summary}</div>
            <div className="flex items-center gap-2 mt-auto">
              <div className="w-1 h-1 rounded-full bg-blue-500"></div>
              <div className="text-xs text-slate-400 font-medium uppercase truncate">{item.source} · {item.time}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 交互操作布局
const InteractiveAction: React.FC<{ module: ModuleInstance }> = ({ module }) => {
  const { data } = module;
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-400 text-sm">暂无操作</div>;
  }

  return (
    <div 
      ref={scrollRef}
      className={SCROLL_CONTAINER_CLASS}
    >
      {data.map((item: any, index: number) => (
        <div key={index} className={CARD_WRAPPER_CLASS}>
          <div className={`${CARD_BASE_CLASS} flex-row items-center gap-4`}>
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-100 shrink-0">
              {item.icon || '🔧'}
            </div>
            <div className="flex-1 min-w-0 py-1">
              <div className="text-base font-bold text-slate-800 truncate">{item.name}</div>
              <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 地图视图布局
const MapViewHorizontal: React.FC<{ module: ModuleInstance }> = ({ module }) => {
  const { data } = module;
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-400 text-sm">暂无地点</div>;
  }

  return (
    <div 
      ref={scrollRef}
      className={SCROLL_CONTAINER_CLASS}
    >
      {data.map((item: any, index: number) => (
        <div key={index} className={CARD_WRAPPER_CLASS}>
          <div className={CARD_BASE_CLASS}>
            <div className="w-full h-24 bg-slate-100 rounded-xl mb-3 flex items-center justify-center text-3xl relative overflow-hidden shrink-0">
              <span className="relative z-10">🗺️</span>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/5"></div>
            </div>
            <div className="text-base font-bold text-slate-800 mb-1 truncate">{item.name}</div>
            <div className="flex items-center justify-between mt-auto w-full">
              <div className="text-xs text-slate-500 truncate max-w-[65%]">{item.address}</div>
              <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
                {item.distance}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
