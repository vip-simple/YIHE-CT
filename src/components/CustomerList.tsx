import { useState, useEffect } from 'react';
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

const DEFAULT_PAGE_SIZE = 20; // 默认显示数量

export function CustomerList({ customers, onEdit, onAddRecord, onCustomerClick, onQuickUpdate }: CustomerListProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [displayCount, setDisplayCount] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  // 当客户列表变化时，重置显示数量
  useEffect(() => {
    setDisplayCount(DEFAULT_PAGE_SIZE);
  }, [customers]);

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

  const sortedCustomers = [...customers].sort((a, b) => {
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

  if (sortOrder === 'desc') {
    sortedCustomers.reverse();
  }

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleShowMore = () => {
    setDisplayCount((prev) => prev + DEFAULT_PAGE_SIZE);
  };

  const handleShowAll = () => {
    setDisplayCount(sortedCustomers.length);
  };

  const displayedCustomers = sortedCustomers.slice(0, displayCount);
  const hasMore = displayCount < sortedCustomers.length;

  return (
    <div className="px-2 pb-2">
      <div className="flex items-center justify-between mb-1 py-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">显示 {displayedCustomers.length}/{sortedCustomers.length} 位</span>
          <button
            onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
            className="text-[10px] text-blue-600 hover:text-blue-800"
          >
            {viewMode === 'card' ? '表格' : '卡片'}
          </button>
        </div>
        <button
          onClick={toggleSort}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-700 transition-colors"
        >
          <span>排序</span>
          <svg className={`w-3 h-3 ${sortOrder === 'asc' ? 'text-blue-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <svg className={`w-3 h-3 ${sortOrder === 'desc' ? 'text-blue-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {viewMode === 'card' ? (
        <div className="space-y-1.5">
          {displayedCustomers.map((customer, index) => (
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
        <CustomerTable
          customers={displayedCustomers}
          onCustomerClick={onCustomerClick}
          onQuickUpdate={onQuickUpdate}
        />
      )}

      {hasMore && (
        <div className="mt-2 flex justify-center">
          <button
            onClick={handleShowMore}
            className="px-3 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors"
          >
            查看更多 +{Math.min(DEFAULT_PAGE_SIZE, sortedCustomers.length - displayCount)}
          </button>
          {sortedCustomers.length - displayCount > DEFAULT_PAGE_SIZE && (
            <button
              onClick={handleShowAll}
              className="ml-2 px-2 py-1 text-[10px] text-slate-500 hover:text-blue-600 transition-colors"
            >
              全部
            </button>
          )}
        </div>
      )}
    </div>
  );
}