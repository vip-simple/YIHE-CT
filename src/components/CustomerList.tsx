import { useState, memo } from 'react';
import type { Customer } from '@/types';
import { CustomerListItem } from './CustomerListItem';
import { CustomerTable } from './CustomerTable';

interface CustomerListProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
  onAddRecord?: (customer: Customer) => void;
  onCustomerClick?: (customer: Customer) => void;
  onQuickUpdate?: (customerId: string, updates: Partial<Customer>) => void;
}

function CustomerList({ customers, onEdit, onAddRecord, onCustomerClick, onQuickUpdate }: CustomerListProps) {
  // console.log('CustomerList rendered, onCustomerClick:', typeof onCustomerClick);
  const [sortField, setSortField] = useState<'name' | 'lastFollowUpTime'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  if (customers.length === 0) {
    return (
      <div className="mt-8 mx-4 p-8 text-center">
        <div className="text-slate-300 mb-4">
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-slate-500 text-lg">暂无符合条件的客户</p>
        <p className="text-slate-400 text-sm mt-2">请调整筛选条件</p>
      </div>
    );
  }

  // 解析时间字符串，无法解析的按 0 处理
  const parseTime = (value: string) => {
    if (!value) return 0;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    if (sortField === 'lastFollowUpTime') {
      // 最近沟通时间排序，无沟通时间的始终排在最后
      const timeA = parseTime(a.lastFollowUpTime);
      const timeB = parseTime(b.lastFollowUpTime);
      if (!timeA && !timeB) return 0;
      if (!timeA) return 1;
      if (!timeB) return -1;
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
    const nameA = a.name.trim();
    const nameB = b.name.trim();

    const firstCharA = nameA.charAt(0);
    const firstCharB = nameB.charAt(0);

    const isChineseA = /[\u4e00-\u9fa5]/.test(firstCharA);
    const isChineseB = /[\u4e00-\u9fa5]/.test(firstCharB);

    if (!isChineseA && isChineseB) {
      return -1;
    }
    if (isChineseA && !isChineseB) {
      return 1;
    }

    return nameA.localeCompare(nameB, 'zh-Hans-CN', { usage: 'sort' });
  });

  // 姓名排序降序时整体反转（保持原有行为）
  if (sortField === 'name' && sortOrder === 'desc') {
    sortedCustomers.reverse();
  }

  return (
    <div className="h-[85vh] flex flex-col px-2 pb-2">
      {/* 头部控制区域 */}
      <div className="flex-shrink-0 flex items-center justify-between mb-1 py-0.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
            className="text-[10px] text-blue-600 hover:text-blue-800"
          >
            {viewMode === 'card' ? '表格' : '卡片'}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSortField('name')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
              sortField === 'name'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            姓名排序
          </button>
          <button
            onClick={() => setSortField('lastFollowUpTime')}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
              sortField === 'lastFollowUpTime'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            最近沟通时间排序
          </button>
          <span className="text-slate-300 mx-0.5">|</span>
          <button
            onClick={() => setSortOrder('asc')}
            className={`px-1 py-0.5 rounded text-[10px] font-medium transition-colors ${
              sortOrder === 'asc'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            升序
          </button>
          <button
            onClick={() => setSortOrder('desc')}
            className={`px-1 py-0.5 rounded text-[10px] font-medium transition-colors ${
              sortOrder === 'desc'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            降序
          </button>
        </div>
      </div>

      {/* 可滚动的内容区域 */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'card' ? (
          <div className="space-y-1.5">
            {sortedCustomers.map((customer, index) => (
              <CustomerListItem
                key={customer.id}
                customer={customer}
                index={index}
                onCustomerClick={onCustomerClick}
                onEdit={onEdit}
                onAddRecord={onAddRecord}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <CustomerTable
              customers={sortedCustomers}
              onCustomerClick={onCustomerClick}
              onQuickUpdate={onQuickUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 使用 memo 避免不必要的重新渲染，并导出
const MemoizedCustomerList = memo(CustomerList, (prevProps, nextProps) => {
  // 只在关键数据变化时才重新渲染
  return (
    prevProps.customers === nextProps.customers &&
    prevProps.onCustomerClick === nextProps.onCustomerClick &&
    prevProps.onQuickUpdate === nextProps.onQuickUpdate
  );
});

export { MemoizedCustomerList as CustomerList };