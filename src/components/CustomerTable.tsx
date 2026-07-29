import type { Customer } from '@/types';
import { useNavigate } from 'react-router-dom';
import { getStatusColor, getCustomerStatusColor, formatDate } from '@/api/feishu';

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const navigate = useNavigate();

  const handleCustomerClick = (customer: Customer) => {
    navigate(`/customer/${customer.id}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-1 py-0.5 text-left text-[8px] font-medium text-slate-600 w-4">#</th>
            <th className="px-1 py-0.5 text-left text-[8px] font-medium text-slate-600 w-16">姓名</th>
            <th className="px-1 py-0.5 text-left text-[8px] font-medium text-slate-600 w-12">状态</th>
            <th className="px-1 py-0.5 text-left text-[8px] font-medium text-slate-600">最近跟进</th>
            <th className="px-1 py-0.5 text-left text-[8px] font-medium text-slate-600">下次跟进</th>
            <th className="px-1 py-0.5 text-left text-[8px] font-medium text-slate-600">关注</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr
              key={customer.id}
              onClick={() => handleCustomerClick(customer)}
              className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
            >
              <td className="px-1 py-0 text-[8px] text-slate-500 whitespace-nowrap">
                {index + 1}
              </td>
              <td className="px-1 py-0">
                <div className="flex flex-col gap-0 max-w-16">
                  <span className="text-xs font-medium text-slate-900 break-words">{customer.name}</span>
                  {customer.customerNumber > 0 && (
                    <span className="text-[8px] text-slate-500">#{customer.customerNumber}</span>
                  )}
                </div>
              </td>
              <td className="px-1 py-0">
                <div className="flex flex-col gap-0">
                  <span className={`px-1 py-0.5 rounded text-[8px] font-medium ${getStatusColor(customer.followUpStatus)}`}>
                    {customer.followUpStatus}
                  </span>
                  {customer.customerStatus && (
                    <span className={`px-1 py-0.5 rounded text-[8px] font-medium ${getCustomerStatusColor(customer.customerStatus)}`}>
                      {customer.customerStatus}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-1 py-0 text-[10px] text-slate-600">
                <div className="flex flex-col gap-0">
                  <div className="text-[8px] text-blue-600">{formatDate(customer.lastFollowUpTime)}</div>
                  <div className="text-[10px] leading-tight">{customer.lastFollowUpContent}</div>
                </div>
              </td>
              <td className="px-1 py-0 text-[10px] text-slate-600">
                <div className="flex flex-col gap-0">
                  <div className="text-[8px] text-emerald-600 font-medium">{formatDate(customer.nextFollowUpTime)}</div>
                  <div className="text-[10px] leading-tight">{customer.nextFollowUpContent}</div>
                </div>
              </td>
              <td className="px-1 py-0 text-[10px] text-slate-600">
                <div className="text-[10px] text-amber-600 leading-tight">
                  {customer.attentionItems}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}