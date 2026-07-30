import { useState } from 'react';
import { updateNextFollowUpTime } from '@/api/feishu';
import type { Customer } from '@/types';

interface QuickFollowUpEditProps {
  customerId: string;
  currentDate: string;
  onQuickUpdate?: (customerId: string, updates: Partial<Customer>) => void;
}

// 格式化日期为 月/日 格式
function formatMonthDay(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  } catch {
    return '-';
  }
}

export function QuickFollowUpEdit({ customerId, currentDate, onQuickUpdate }: QuickFollowUpEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempDate, setTempDate] = useState(currentDate || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpen = () => {
    setTempDate(currentDate || '');
    setIsOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateNextFollowUpTime(customerId, tempDate);
      // 只更新这一条数据，不刷新整个列表
      onQuickUpdate?.(customerId, { nextFollowUpTime: tempDate });
      setIsOpen(false);
    } catch (error) {
      alert('更新失败');
      console.error('更新下次跟进时间失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    // 只是清空输入框，不保存
    setTempDate('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setTempDate(currentDate || '');
  };

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={handleOpen}
        className="text-emerald-600 hover:text-emerald-800 text-[8px] inline-flex items-center gap-0.5"
      >
        {formatMonthDay(currentDate)}
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 模态框 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2" onClick={handleClose}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* 头部 */}
            <div className="flex-shrink-0 px-3 py-2 flex justify-between items-center border-b border-slate-200 bg-white">
              <h3 className="text-sm font-bold text-slate-800">修改下次跟进时间</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold px-2"
              >
                ×
              </button>
            </div>

            {/* 内容 */}
            <div className="p-3 space-y-2">
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">选择日期</label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded px-2 py-1.5"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  disabled={isSaving}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs py-1.5 px-3 rounded disabled:opacity-50"
                >
                  清空
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5 px-3 rounded disabled:opacity-50"
                >
                  {isSaving ? '保存中' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}