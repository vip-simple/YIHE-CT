import type { Customer } from '@/types';
import { useNavigate } from 'react-router-dom';
import { getStatusColor, getCustomerStatusColor } from '@/api/feishu';
import { QuickFollowUpEdit } from './QuickFollowUpEdit';

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

interface CustomerTableProps {
  customers: Customer[];
  onCustomerClick?: (customer: Customer) => void;
  onQuickUpdate?: (customerId: string, updates: Partial<Customer>) => void;
}

export function CustomerTable({ customers, onCustomerClick, onQuickUpdate }: CustomerTableProps) {
  const navigate = useNavigate();

  const handleCustomerClick = (customer: Customer) => {
    // console.log('CustomerTable.handleCustomerClick called for:', customer.name);
    if (onCustomerClick) {
      onCustomerClick(customer);
    } else {
      navigate(`/customer/${customer.id}`);
    }
  };

  return (
    <div className="h-[70vh] flex flex-col">
      {/* 固定表头 */}
      <div className="flex-shrink-0">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-2 py-0.5 text-left text-[8px] font-medium text-slate-600 w-5">#</th>
              <th className="px-2 py-0.5 text-left text-[8px] font-medium text-slate-600 w-18">姓名</th>
              <th className="px-2 py-0.5 text-left text-[8px] font-medium text-slate-600 w-14">状态</th>
              <th className="px-2 py-0.5 text-left text-[8px] font-medium text-slate-600">最近跟进</th>
              <th className="px-2 py-0.5 text-left text-[8px] font-medium text-slate-600">下次跟进</th>
              <th className="px-2 py-0.5 text-left text-[8px] font-medium text-slate-600">关注</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* 可滚动的表格内容 */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {customers.map((customer, index) => (
              <tr
                key={customer.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="px-1 text-[10px] text-slate-500 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="px-1 py-0">
                  <div
                    onClick={() => handleCustomerClick(customer)}
                    className="flex flex-col gap-0 max-w-16 cursor-pointer hover:text-blue-600"
                  >
                    <span className="text-sm font-medium text-slate-900 break-words">{customer.name}</span>
                    {customer.customerNumber > 0 && (
                      <span className="text-[10px] text-slate-500">
                      #{customer.customerNumber}
                      {customer.expectedInvestmentAmount > 0 && (
                        <span className="text-green-500"> ${customer.expectedInvestmentAmount}</span>
                      )}
                      {customer.expectedInvestmentAmount === 0 && (
                        <span> -</span>
                      )}
                    </span>
                    )}
                  </div>
                </td>
                <td className="px-0 py-0">
                  <div className="flex flex-wrap">
                    <span className={`px-1 py-0.2 rounded text-[8px] font-medium whitespace-nowrap ${getStatusColor(customer.followUpStatus)}`}>
                      {customer.followUpStatus}
                    </span>
                    {customer.customerStatus && (
                      <span className={`px-1 py-0.2 rounded text-[8px] font-medium whitespace-nowrap ${getCustomerStatusColor(customer.customerStatus)}`}>
                        {customer.customerStatus}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-0 text-[8px] text-slate-600">
                  <div className="flex flex-col gap-0">
                    <div className="text-[8px] text-blue-600">{formatMonthDay(customer.lastFollowUpTime)}</div>
                    <div  onClick={() => handleCustomerClick(customer)} className="text-[8px] leading-tight">{customer.lastFollowUpContent}</div>
                  </div>
                </td>
                <td className="px-2 py-0 text-[8px] text-slate-600">
                  <div className="flex flex-col gap-0">
                    <QuickFollowUpEdit
                      customerId={customer.id}
                      currentDate={customer.nextFollowUpTime}
                      onQuickUpdate={onQuickUpdate}
                    />
                    <div
                      className="text-[8px] leading-tight cursor-pointer hover:text-blue-600 min-h-3"
                    >
                      {customer.nextFollowUpContent}
                    </div>
                  </div>
                </td>
                <td className="px-2 py-0 text-[8px] text-slate-600">
                  <div className="text-[8px] text-amber-600 leading-tight">
                    {customer.attentionItems}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}