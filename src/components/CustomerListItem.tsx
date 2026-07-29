import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Customer } from '@/types';
import { getStatusColor, getCustomerStatusColor, formatDate } from '@/api/feishu';

interface CustomerListItemProps {
  customer: Customer;
  index: number;
  onEdit?: (customer: Customer) => void;
  onAddRecord?: (customer: Customer) => void;
}

export function CustomerListItem({ customer, index, onEdit, onAddRecord }: CustomerListItemProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((v) => !v);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onEdit?.(customer);
  };

  const handleAddRecord = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onAddRecord?.(customer);
  };

  return (
    <div
      onClick={() => navigate(`/customer/${customer.id}`)}
      className="bg-white rounded-lg p-2 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shrink-0">
            {index + 1}
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {customer.name.charAt(0)}
          </div>
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">{customer.name}</span>
            {customer.customerNumber > 0 && (
              <span className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 text-[8px] font-medium shrink-0">
                #{customer.customerNumber}
              </span>
            )}
            <span className={`px-1 py-0.5 rounded text-[8px] font-medium shrink-0 ${getStatusColor(customer.followUpStatus)}`}>
              {customer.followUpStatus}
            </span>
            {customer.customerStatus && (
              <span className={`px-1 py-0.5 rounded text-[8px] font-medium shrink-0 ${getCustomerStatusColor(customer.customerStatus)}`}>
                {customer.customerStatus}
              </span>
            )}
          </div>
        </div>
        {(onEdit || onAddRecord) && (
          <div className="relative shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleMenuClick}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
              aria-label="操作"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-3 py-1.5 text-[10px] text-slate-700 hover:bg-slate-50"
                    >
                      编辑
                    </button>
                  )}
                  {onAddRecord && (
                    <button
                      onClick={handleAddRecord}
                      className="w-full text-left px-3 py-1.5 text-[10px] text-blue-600 hover:bg-blue-50"
                    >
                      跟进记录
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-start gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-2 h-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] text-blue-600">{formatDate(customer.lastFollowUpTime)}</p>
            <p className="text-[10px] leading-tight">{customer.lastFollowUpContent}</p>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-2 h-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] text-emerald-600 font-medium">{formatDate(customer.nextFollowUpTime)}</p>
            <p className="text-[10px] leading-tight">{customer.nextFollowUpContent}</p>
          </div>
        </div>

        {customer.attentionItems && (
          <div className="flex items-start gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-2 h-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-amber-600 leading-tight">{customer.attentionItems}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
