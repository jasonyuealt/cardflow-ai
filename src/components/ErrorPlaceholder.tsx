/**
 * 错误占位符组件
 */

import React from 'react';

interface ErrorPlaceholderProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorPlaceholder: React.FC<ErrorPlaceholderProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-red-600 text-4xl mb-3">⚠️</div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">出错了</h3>
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          重试
        </button>
      )}
    </div>
  );
};

