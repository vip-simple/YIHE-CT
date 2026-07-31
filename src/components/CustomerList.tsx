import { useState, useEffect, useRef, memo } from 'react';
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

function CustomerList({ customers, onEdit, onAddRecord, onCustomerClick, onQuickUpdate }: CustomerListProps) {
  // console.log('CustomerList rendered, onCustomerClick:', typeof onCustomerClick);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [displayCount, setDisplayCount] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  // 当客户列表长度发生重大变化时（如重新加载），才重置显示数量
  const prevLengthRef = useRef<number>(0);
  useEffect(() => {
    const currentLength = customers.length;
    const prevLength = prevLengthRef.current;

    // 只有当列表长度完全不同时（比如从0到有数据，或数据量完全变化），才重置
    if (prevLength === 0 || Math.abs(currentLength - prevLength) > 10) {
      setDisplayCount(DEFAULT_PAGE_SIZE);
    }
    prevLengthRef.current = currentLength;
  }, [customers.length]);

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
    <div className="h-[70vh] flex flex-col px-2 pb-2">
      {/* 头部控制区域 */}
      <div className="flex-shrink-0 flex items-center justify-between mb-1 py-0.5">
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

      {/* 可滚动的内容区域 */}
      <div className="flex-1 overflow-y-auto">
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
          <div className="h-full flex flex-col">
            <CustomerTable
              customers={displayedCustomers}
              onCustomerClick={onCustomerClick}
              onQuickUpdate={onQuickUpdate}
            />
          </div>
        )}
      </div>

      {/* 固定在底部的按钮区域 */}
      {hasMore && (
        <div className="flex-shrink-0 px-2 py-1  flex justify-center">
          <button
            onClick={handleShowMore}
            className="px-3 py-1 text-[10px] text-slate-600 hover:text-blue-600 underline decoration-blue-600 underline-offset-2 hover:border-blue-300 transition-colors"
          >
            查看更多 +{Math.min(DEFAULT_PAGE_SIZE, sortedCustomers.length - displayCount)}
          </button>
          {sortedCustomers.length - displayCount > DEFAULT_PAGE_SIZE && (
            <button
              onClick={handleShowAll}
              className="ml-2 px-2 py-1 text-[10px] text-slate-500 hover:text-blue-600 underline decoration-blue-600 underline-offset-2 transition-colors"
            >
              全部
            </button>
          )}
        </div>
      )}
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