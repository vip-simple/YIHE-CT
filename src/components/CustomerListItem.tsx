import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Customer } from '@/types';
import { getStatusColor, getCustomerStatusColor, formatMoney, formatDate } from '@/api/feishu';

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
      className="bg-white rounded-2xl p-5 shadow border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
            {index + 1}
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-slate-900">{customer.name}</span>
              {customer.customerNumber > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-medium">
                  #{customer.customerNumber}
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.followUpStatus)}`}>
                {customer.followUpStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {customer.customerStatus && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerStatusColor(customer.customerStatus)}`}>
                  {customer.customerStatus}
                </span>
              )}
              <span className="text-sm text-slate-400">预计投资 <span className="font-semibold text-slate-700">{formatMoney(customer.expectedInvestmentAmount)}</span></span>
            </div>
          </div>
        </div>
        {(onEdit || onAddRecord) && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleMenuClick}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
              aria-label="操作"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      编辑
                    </button>
                  )}
                  {onAddRecord && (
                    <button
                      onClick={handleAddRecord}
                      className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      新增跟进记录
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">最近跟进 · {formatDate(customer.lastFollowUpTime)}</p>
            <p className="text-sm text-slate-700 leading-relaxed">{customer.lastFollowUpContent}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">下次跟进 · <span className="text-emerald-600 font-medium">{formatDate(customer.nextFollowUpTime)}</span></p>
            <p className="text-sm text-slate-700 leading-relaxed">{customer.nextFollowUpContent}</p>
          </div>
        </div>

        {customer.attentionItems && (
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">关注事项</p>
              <p className="text-sm text-slate-700 leading-relaxed">{customer.attentionItems}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
