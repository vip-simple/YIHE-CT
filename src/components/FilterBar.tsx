import type { FilterOptions } from '@/types';

interface FilterBarProps {
  filter: FilterOptions;
  onFilterChange: (filter: FilterOptions) => void;
  statuses: string[];
}

export function FilterBar({ filter, onFilterChange, statuses }: FilterBarProps) {
  const toggleStatus = (status: string) => {
    const current = filter.selectedStatuses;
    if (current.includes(status)) {
      onFilterChange({ ...filter, selectedStatuses: current.filter((s) => s !== status) });
    } else {
      onFilterChange({ ...filter, selectedStatuses: [...current, status] });
    }
  };

  const clearAllStatuses = () => {
    onFilterChange({ ...filter, selectedStatuses: [] });
  };

  return (
    <div className="bg-white px-4 py-4 shadow-sm border-b border-slate-100">
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={filter.searchName}
            onChange={(e) => onFilterChange({ ...filter, searchName: e.target.value })}
            placeholder="搜索客户姓名或编号"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 font-medium">状态筛选</span>
        {filter.selectedStatuses.length > 0 && (
          <button
            onClick={clearAllStatuses}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            清除全部
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter.selectedStatuses.includes(status)
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={filter.showOnlyWithAttention}
          onChange={(e) => onFilterChange({ ...filter, showOnlyWithAttention: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className="text-xs text-slate-500">仅看有重点关注事项</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer mb-3">
        <input
          type="checkbox"
          checked={filter.enableDateFilter}
          onChange={(e) => onFilterChange({ ...filter, enableDateFilter: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className="text-xs text-slate-500">日期筛选</span>
      </label>
      <div className="flex gap-3" style={{ opacity: filter.enableDateFilter ? 1 : 0.5, pointerEvents: filter.enableDateFilter ? 'auto' : 'none' }}>
        <div className="flex-1">
          <label className="text-xs text-slate-400 mb-1 block">开始日期</label>
          <input
            type="date"
            value={filter.dateRange.start}
            onChange={(e) =>
              onFilterChange({ ...filter, dateRange: { ...filter.dateRange, start: e.target.value } })
            }
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-400 mb-1 block">结束日期</label>
          <input
            type="date"
            value={filter.dateRange.end}
            onChange={(e) =>
              onFilterChange({ ...filter, dateRange: { ...filter.dateRange, end: e.target.value } })
            }
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>
    </div>
  );
}