import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { FollowUpRecordItem } from '@/components/FollowUpRecordItem';
import { CustomerForm } from '@/components/CustomerForm';
import { FollowUpRecordForm } from '@/components/FollowUpRecordForm';
import { fetchCustomer, fetchFollowUpRecords, deleteCustomer, getStatusColor, getCustomerStatusColor, formatMoney } from '@/api/feishu';
import type { Customer, FollowUpRecord } from '@/types';

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [records, setRecords] = useState<FollowUpRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [recordFormOpen, setRecordFormOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const c = await fetchCustomer(id);
    setCustomer(c);
    if (c) {
      const followUpRecords = await fetchFollowUpRecords(c.id);
      setRecords(followUpRecords);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleEdit = () => {
    setFormOpen(true);
  };

  const handleAddRecord = () => {
    setRecordFormOpen(true);
  };

  const handleRecordSaved = async () => {
    setRecordFormOpen(false);
    await loadData();
  };

  const handleDelete = async () => {
    if (!customer) return;
    if (!confirm(`确定要删除客户「${customer.name}」吗？\n该客户的全部跟进记录也会一并删除。`)) return;
    const res = await deleteCustomer(customer.id);
    if (res.success) {
      navigate('/');
    } else {
      alert(res.error || '删除失败');
    }
  };

  const handleSaved = async () => {
    setFormOpen(false);
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title="YIHE CT -Detail" showBack />
        <div className="flex justify-center items-center h-40">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title="YIHE CT -Detail" showBack />
        <div className="flex justify-center items-center h-40">
          <p className="text-slate-500">客户不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="YIHE CT -Detail" showBack />

      {/* 顶部操作按钮：仅编辑 */}
      <div className="px-4 mt-3">
        <button
          onClick={handleEdit}
          className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          编辑客户
        </button>
      </div>

      
      <div className="bg-white mx-4 mt-4 rounded-2xl shadow border border-slate-100 overflow-hidden">
        <div className="px-5 py-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-2xl">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-slate-900">{customer.name}</h2>
                {customer.customerNumber > 0 && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-medium">
                    #{customer.customerNumber}
                  </span>
                )}
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(customer.followUpStatus)}`}>
                {customer.followUpStatus}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">客户状态</p>
              {customer.customerStatus ? (
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerStatusColor(customer.customerStatus)}`}>
                  {customer.customerStatus}
                </span>
              ) : (
                <p className="text-sm text-slate-400">-</p>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">预计投资</p>
              <p className="text-lg font-bold text-slate-900">{formatMoney(customer.expectedInvestmentAmount)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">最近跟进</p>
              <p className="text-sm font-medium text-slate-700">{customer.lastFollowUpTime || '-'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">下次跟进</p>
              <p className="text-sm font-medium text-emerald-600">{customer.nextFollowUpTime || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white mx-4 mt-3 rounded-2xl shadow border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">跟进信息</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-start">
            <p className="text-xs text-slate-400 w-20 shrink-0 pt-0.5">最近跟进内容</p>
            <p className="text-sm text-slate-700 flex-1">{customer.lastFollowUpContent || '-'}</p>
          </div>
          <div className="flex items-start">
            <p className="text-xs text-slate-400 w-20 shrink-0 pt-0.5">下次跟进内容</p>
            <p className="text-sm text-slate-700 flex-1">{customer.nextFollowUpContent || '-'}</p>
          </div>
          <div className="flex items-start">
            <p className="text-xs text-slate-400 w-20 shrink-0 pt-0.5">关注事项</p>
            <p className="text-sm text-slate-700 flex-1">{customer.attentionItems || '-'}</p>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-3 pb-8">
        <div className="px-1 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">历史跟进记录</h3>
          <button
            onClick={handleAddRecord}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + 新增跟进记录
          </button>
        </div>
        <div className="space-y-3">
          {records.length === 0 ? (
            <div className="bg-white rounded-2xl shadow border border-slate-100 p-8 text-center">
              <p className="text-slate-400">暂无跟进记录</p>
            </div>
          ) : (
            records.map((record) => (
              <FollowUpRecordItem key={record.id} record={record} />
            ))
          )}
        </div>
      </div>

      <div className="bg-white mx-4 mt-3 mb-8 rounded-2xl shadow border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">客户资料</h3>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">信任人</p>
            <p className="text-sm font-medium text-slate-700">{customer.trustedPerson || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">受益人</p>
            <p className="text-sm font-medium text-slate-700">{customer.beneficiary || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">客户来源</p>
            <p className="text-sm font-medium text-slate-700">{customer.customerSource || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">推荐人</p>
            <p className="text-sm font-medium text-slate-700">{customer.referrer || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">预计总资产规模</p>
            <p className="text-sm font-medium text-slate-700">{customer.totalAssetScale || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">理财偏好</p>
            <p className="text-sm font-medium text-slate-700">{customer.financialPreference || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">家庭信息</p>
            <p className="text-sm font-medium text-slate-700">{customer.familySituation || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">职业信息</p>
            <p className="text-sm font-medium text-slate-700">{customer.occupationInfo || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-400 mb-1">爱好</p>
            <p className="text-sm font-medium text-slate-700">{customer.hobbies || '-'}</p>
          </div>
        </div>
      </div>

      {/* 底部删除按钮（危险操作，单独放置） */}
      <div className="px-4 pb-8 mt-2">
        <button
          onClick={handleDelete}
          className="w-full py-2.5 rounded-lg bg-white text-red-600 text-sm font-medium border border-red-200 hover:bg-red-50"
        >
          删除客户
        </button>
        <p className="text-xs text-slate-400 text-center mt-2">删除后无法恢复，该客户的全部跟进记录也会一并删除</p>
      </div>

      {formOpen && (
        <CustomerForm
          customer={customer}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {recordFormOpen && (
        <FollowUpRecordForm
          customer={customer}
          onClose={() => setRecordFormOpen(false)}
          onSaved={handleRecordSaved}
        />
      )}
    </div>
  );
}
