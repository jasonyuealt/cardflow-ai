/**
 * 布局渲染器 - 根据布局类型渲染对应的横向滑动布局
 * 遵循通用 UI 协议，不包含业务逻辑
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
        return <HorizontalScrollableList module={module} />;
    }
  };

  return (
    <div className="module-card w-full mb-6">
      {module.reason && (
        <div className="px-1 mb-2 text-sm text-slate-500 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
          {module.reason}
        </div>
      )}
      
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
const SCROLL_CONTAINER_CLASS = "horizontal-scroll-container flex overflow-x-scroll snap-x snap-mandatory scrollbar-hide w-full gap-3 !px-6 scroll-px-6 py-1";
const CARD_WRAPPER_CLASS = "flex-shrink-0 snap-start w-[85%] sm:w-[300px]";
const CARD_BASE_CLASS = "p-4 bg-white h-full rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col relative overflow-hidden transition-all hover:shadow-md";

// 1. 横向滑动列表布局 (通用)
const HorizontalScrollableList: React.FC<{ module: ModuleInstance }> = ({ module }) => {
  const { data } = module;
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="p-4 text-center text-gray-400 text-sm">暂无数据</div>;
  }

  return (
    <div ref={scrollRef} className={SCROLL_CONTAINER_CLASS}>
      {data.map((item: any, index: number) => (
        <div key={item.id || index} className={CARD_WRAPPER_CLASS}>
          <div className={CARD_BASE_CLASS}>
            {/* Hero Section: Icon or Image */}
            <div className="flex items-center mb-3">
              {item.hero && (
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl mr-3 border border-slate-100 shrink-0 overflow-hidden">
                  {item.hero.type === 'image' ? (
                    <img src={item.hero.value} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{item.hero.value || '📦'}</span>
                  )}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-slate-800 truncate leading-tight">
                  {item.title || '无标题'}
                </div>
                {item.subtitle && (
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{item.subtitle}</div>
                )}
              </div>
            </div>

            {/* Details List */}
            <div className="text-sm text-slate-600 mb-3 flex-1">
              {item.details && Array.isArray(item.details) && (
                <div className="flex flex-wrap gap-1">
                  {item.details.map((detail: string, i: number) => (
                    <span key={i} className="bg-slate-50 px-2 py-1 rounded text-xs text-slate-600 border border-slate-100">
                      {detail}
                    </span>
                  ))}
                </div>
              )}
              {/* Fallback description if no details */}
              {!item.details && item.description && (
                <p className="line-clamp-2 leading-relaxed text-xs">{item.description}</p>
              )}
            </div>

            {/* Footer: Highlight & Actions */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
              {item.highlight && (
                <div className={`text-lg font-bold ${
                  item.highlight.color === 'danger' ? 'text-red-600' : 
                  item.highlight.color === 'success' ? 'text-green-600' : 
                  'text-blue-600'
                }`}>
                  {item.highlight.value}
                </div>
              )}
              
              {item.actions && item.actions.length > 0 && (
                <button className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-auto">
                  {item.actions[0].label}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. 信息展示布局
const InfoDisplay: React.FC<{ module: ModuleInstance }> = ({ module }) => {
  const { data } = module;
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="p-4 text-center text-gray-400 text-sm">暂无信息</div>;
  }

  return (
    <div ref={scrollRef} className={SCROLL_CONTAINER_CLASS}>
      {data.map((item: any, index: number) => (
        <div key={index} className={CARD_WRAPPER_CLASS}>
          <div className={CARD_BASE_CLASS}>
            <div className="text-base font-bold text-slate-800 mb-2 line-clamp-1">{item.title}</div>
            <div className="text-sm text-slate-500 mb-3 leading-relaxed line-clamp-3 flex-1">
              {item.summary}
            </div>
            
            {item.metadata && (
              <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-slate-50">
                {item.metadata.map((meta: any, i: number) => (
                  <div key={i} className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    {meta.label}: {meta.value}
                  </div>
                ))}
              </div>
            )}

            {item.link && (
              <div className="mt-2 text-xs text-blue-500 truncate">
                {item.footer || '查看更多'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// 3. 交互操作布局
const InteractiveAction: React.FC<{ module: ModuleInstance }> = ({ module }) => {
  const { data } = module;
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="p-4 text-center text-gray-400 text-sm">暂无操作</div>;
  }

  return (
    <div ref={scrollRef} className={SCROLL_CONTAINER_CLASS}>
      {data.map((item: any, index: number) => (
        <div key={index} className={CARD_WRAPPER_CLASS}>
          <div className={`${CARD_BASE_CLASS} flex-row items-center gap-3`}>
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl border border-slate-100 shrink-0">
              {item.icon || '⚡'}
            </div>
            <div className="flex-1 min-w-0 py-1">
              <div className="text-base font-bold text-slate-800 truncate">{item.label}</div>
              {item.description && (
                <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</div>
              )}
              {item.status && (
                 <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                   {item.status}
                 </div>
              )}
            </div>
            {item.primaryAction && (
              <button className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 shrink-0">
                {item.primaryAction.label || '执行'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// 4. 地图视图布局
const MapViewHorizontal: React.FC<{ module: ModuleInstance }> = ({ module }) => {
  const { data } = module;
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="p-4 text-center text-gray-400 text-sm">暂无地点</div>;
  }

  return (
    <div ref={scrollRef} className={SCROLL_CONTAINER_CLASS}>
      {data.map((item: any, index: number) => (
        <div key={index} className={CARD_WRAPPER_CLASS}>
          <div className={CARD_BASE_CLASS}>
            <div className="w-full h-24 bg-slate-100 rounded-xl mb-3 flex items-center justify-center text-3xl relative overflow-hidden shrink-0">
              <span className="relative z-10">📍</span>
              {/* 这里可以放地图图片 */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100 opacity-50"></div>
            </div>
            <div className="text-base font-bold text-slate-800 mb-1 truncate">{item.title}</div>
            <div className="flex items-center justify-between mt-auto w-full">
              <div className="text-xs text-slate-500 truncate max-w-[65%]">{item.address}</div>
              {item.distance && (
                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
                  {item.distance}
                </div>
              )}
            </div>
            {item.tags && (
              <div className="mt-2 flex gap-1 overflow-hidden">
                 {item.tags.map((tag: string, i: number) => (
                   <span key={i} className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-400">{tag}</span>
                 ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
