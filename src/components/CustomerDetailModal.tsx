import { useEffect, useState } from 'react';
import type { Customer, FollowUpRecord } from '@/types';
import { fetchCustomer, fetchFollowUpRecords, deleteCustomer, getStatusColor, getCustomerStatusColor, formatMoney } from '@/api/feishu';
import { CustomerForm } from './CustomerForm';
import { FollowUpRecordForm } from './FollowUpRecordForm';
import { FollowUpRecordItem } from './FollowUpRecordItem';
import { getCustomerCache, saveCustomerCache } from '@/hooks/useCustomerCache';

interface CustomerDetailModalProps {
  customerId: string | null;
  onClose: () => void;
  onUpdate?: (updatedCustomer?: Customer) => void;
}

export function CustomerDetailModal({ customerId, onClose, onUpdate }: CustomerDetailModalProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [records, setRecords] = useState<FollowUpRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [recordFormOpen, setRecordFormOpen] = useState(false);

  useEffect(() => {
    if (customerId) {
      loadCustomerDetail(customerId);
    }
  }, [customerId]);

  const loadCustomerDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // 先检查缓存
      const cached = getCustomerCache(id);
      if (cached) {
        // 使用缓存数据，立即显示
        setCustomer(cached.customer);
        setRecords(cached.records);
        setLoading(false);
        return;
      }

      // 缓存未命中，从API获取
      const c = await fetchCustomer(id);
      setCustomer(c);
      if (c) {
        const followUpRecords = await fetchFollowUpRecords(c.id);
        setRecords(followUpRecords);

        // 保存到缓存
        saveCustomerCache(id, c, followUpRecords);
      }
    } catch (err) {
      setError('加载客户详情失败');
      console.error('加载客户详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFormOpen(true);
  };

  const handleAddRecord = () => {
    setRecordFormOpen(true);
  };

  const handleRecordSaved = async (updatedCustomer?: Customer) => {
    setRecordFormOpen(false);
    if (updatedCustomer && customer?.id) {
      // 更新客户信息
      setCustomer(updatedCustomer);

      // 重新加载跟进记录列表，显示新添加的记录
      const recordRes = await fetchFollowUpRecords(customer.id);
      setRecords(recordRes);

      // 更新缓存
      saveCustomerCache(customer.id, updatedCustomer, recordRes);

      // 只更新列表中的这一条数据，不刷新整个列表
      onUpdate?.(updatedCustomer);
    } else if (customer?.id) {
      // 如果没有返回更新的客户信息，则重新加载
      await loadCustomerDetail(customer.id);
      onUpdate?.();
    }
  };

  const handleDelete = async () => {
    if (!customer) return;
    if (!confirm(`确定要删除客户「${customer.name}」吗？\n该客户的全部跟进记录也会一并删除。`)) return;

    const res = await deleteCustomer(customer.id);
    if (res.success) {
      onUpdate?.();
      onClose();
    } else {
      alert(res.error || '删除失败');
    }
  };

  const handleSaved = async (updatedCustomer?: Customer) => {
    console.log('CustomerDetailModal.handleSaved called, updatedCustomer:', updatedCustomer);
    setFormOpen(false);
    if (updatedCustomer && customer?.id) {
      // 直接更新数据和缓存，不重新加载
      setCustomer(updatedCustomer);
      saveCustomerCache(customer.id, updatedCustomer, records);
      console.log('CustomerDetailModal: Updating list with customer:', updatedCustomer);
      onUpdate?.(updatedCustomer);
      return; // 添加 return 防止继续执行
    }
    // 只有在没有 updatedCustomer 且没有 customer.id 时才重新加载
    if (!updatedCustomer && !customer?.id && customerId) {
      console.log('CustomerDetailModal: No updated customer and no customer.id, reloading list');
      await loadCustomerDetail(customerId);
      onUpdate?.();
    }
  };

  if (!customerId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="flex-shrink-0 px-3 py-2 flex items-center justify-between border-b border-slate-200 bg-white">
          <button
            onClick={onClose}
            className="text-blue-600 text-[10px] font-medium"
          >
            关闭
          </button>
          <button
            onClick={handleEdit}
            className="px-3 py-1 rounded bg-blue-600 text-white text-[10px] font-medium hover:bg-blue-700"
          >
            编辑客户
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {loading && (
            <div className="flex justify-center items-center h-20">
              <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-xs mb-3">
              {error}
            </div>
          )}

          {!loading && !error && customer && (
            <div className="space-y-0">
              {/* 客户基本信息 */}
              <div className="bg-white mx-2 mt-2 rounded-lg shadow border border-slate-100 overflow-hidden">
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <h2 className="text-sm font-bold text-slate-900">{customer.name}</h2>
                        {customer.customerNumber > 0 && (
                          <span className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 text-[8px] font-medium">
                            #{customer.customerNumber}
                          </span>
                        )}
                      </div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-medium ${getStatusColor(customer.followUpStatus)}`}>
                        {customer.followUpStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                    <div className="text-center">
                      <p className="text-[8px] text-slate-400 mb-0.5">客户状态</p>
                      {customer.customerStatus ? (
                        <span className={`inline-block px-1 py-0.5 rounded text-[8px] font-medium ${getCustomerStatusColor(customer.customerStatus)}`}>
                          {customer.customerStatus}
                        </span>
                      ) : (
                        <p className="text-[10px] text-slate-400">-</p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-slate-400 mb-0.5">预计投资</p>
                      <p className="text-xs font-bold text-slate-900">{formatMoney(customer.expectedInvestmentAmount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-slate-400 mb-0.5">最近跟进</p>
                      <p className="text-[10px] font-medium text-blue-600">{customer.lastFollowUpTime || '-'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] text-slate-400 mb-0.5">下次跟进</p>
                      <p className="text-[10px] font-medium text-emerald-600">{customer.nextFollowUpTime || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 跟进信息 */}
              <div className="bg-white mx-2 mt-1.5 rounded-lg shadow border border-slate-100 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <h3 className="font-semibold text-[10px] text-slate-900">跟进信息</h3>
                </div>
                <div className="px-3 py-1.5 space-y-1">
                  <div className="flex items-start">
                    <p className="text-[8px] text-slate-400 w-12 shrink-0">最近跟进</p>
                    <p className="text-[10px] text-slate-600 flex-1">{customer.lastFollowUpContent || '-'}</p>
                  </div>
                  <div className="flex items-start">
                    <p className="text-[8px] text-slate-400 w-12 shrink-0">下次跟进</p>
                    <p className="text-[10px] text-slate-600 flex-1">{customer.nextFollowUpContent || '-'}</p>
                  </div>
                  <div className="flex items-start">
                    <p className="text-[8px] text-slate-400 w-12 shrink-0">关注事项</p>
                    <p className="text-[10px] text-slate-600 flex-1">{customer.attentionItems || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 历史跟进记录 */}
              <div className="mx-2 mt-1.5 pb-2">
                <div className="px-1 py-1.5 flex items-center justify-between">
                  <h3 className="font-semibold text-[10px] text-slate-900">历史跟进记录</h3>
                  <button
                    onClick={handleAddRecord}
                    className="text-blue-600 hover:text-blue-800 text-[10px] font-medium"
                  >
                    + 新增记录
                  </button>
                </div>
                <div className="space-y-1.5">
                  {records.length === 0 ? (
                    <div className="bg-white rounded-lg shadow border border-slate-100 p-4 text-center">
                      <p className="text-slate-400 text-[10px]">暂无跟进记录</p>
                    </div>
                  ) : (
                    records.map((record) => (
                      <FollowUpRecordItem key={record.id} record={record} />
                    ))
                  )}
                </div>
              </div>

              {/* 客户资料 */}
              <div className="bg-white mx-2 mt-1.5 mb-2 rounded-lg shadow border border-slate-100 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <h3 className="font-semibold text-[10px] text-slate-900">客户资料</h3>
                </div>
                <div className="px-3 py-1.5 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[8px] text-slate-400 mb-0.5">信任人</p>
                    <p className="text-[10px] font-medium text-slate-700">{customer.trustedPerson || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 mb-0.5">受益人</p>
                    <p className="text-[10px] font-medium text-slate-700">{customer.beneficiary || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 mb-0.5">客户来源</p>
                    <p className="text-[10px] font-medium text-slate-700">{customer.customerSource || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 mb-0.5">推荐人</p>
                    <p className="text-[10px] font-medium text-slate-700">{customer.referrer || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 mb-0.5">预计总资产规模</p>
                    <p className="text-[10px] font-medium text-slate-700">{customer.totalAssetScale || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 mb-0.5">理财偏好</p>
                    <p className="text-[10px] font-medium text-slate-700">{customer.financialPreference || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 mb-0.5">家庭信息</p>
                    <p className="text-[10px] font-medium text-slate-700">{customer.familySituation || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400 mb-0.5">职业信息</p>
                    <p className="text-[10px] font-medium text-slate-700">{customer.occupationInfo || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[8px] text-slate-400 mb-0.5">爱好</p>
                    <p className="text-[10px] font-medium text-slate-700">{customer.hobbies || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 底部删除按钮 */}
              <div className="px-3 pb-4 mt-1.5">
                <button
                  onClick={handleDelete}
                  className="w-full py-1.5 rounded bg-white text-red-600 text-[10px] font-medium border border-red-200 hover:bg-red-50"
                >
                  删除客户
                </button>
                <p className="text-[8px] text-slate-400 text-center mt-1">删除后无法恢复，该客户的全部跟进记录也会一并删除</p>
              </div>
            </div>
          )}
        </div>

        {/* 编辑表单 */}
        {formOpen && customer && (
          <CustomerForm
            customer={customer}
            onClose={() => setFormOpen(false)}
            onSaved={handleSaved}
          />
        )}

        {/* 添加跟进记录表单 */}
        {recordFormOpen && customer && (
          <FollowUpRecordForm
            customer={customer}
            onClose={() => setRecordFormOpen(false)}
            onSaved={handleRecordSaved}
          />
        )}
      </div>
    </div>
  );
}