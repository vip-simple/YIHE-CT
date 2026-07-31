import { useState, useEffect } from 'react';
import type { Customer } from '@/types';
import { createCustomer, updateCustomer, createFollowUpRecord } from '@/api/feishu';

interface CustomerFormProps {
  customer?: Customer | null; // 传入则编辑，不传则新增
  onClose: () => void;
  onSaved: (updatedCustomer?: Customer) => void;
}

const FOLLOW_UP_STATUSES = ['重点跟踪', '已约', '跟进中', '暂时不跟', '已放弃'];
const CUSTOMER_STATUSES = ['潜在', '意向', '成交'];

// 获取今天的日期（YYYY-MM-DD）
function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 获取下周一的日期（YYYY-MM-DD）
function getNextMonday(): string {
  const d = new Date();
  const day = d.getDay(); // 0=周日, 1=周一, ...
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day2 = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day2}`;
}

// 新增客户的默认值
function getEmptyForm(): Partial<Customer> {
  return {
    name: '',
    followUpStatus: '跟进中',
    customerStatus: '潜在',
    expectedInvestmentAmount: 0,
    totalAssetScale: '',
    financialPreference: '',
    familySituation: '',
    occupationInfo: '',
    hobbies: '',
    lastFollowUpTime: getToday(),
    lastFollowUpContent: '',
    nextFollowUpContent: '',
    nextFollowUpTime: getNextMonday(),
    attentionItems: '',
    trustedPerson: '',
    beneficiary: '',
    customerSource: '',
    referrer: '',
  };
}

export function CustomerForm({ customer, onClose, onSaved }: CustomerFormProps) {
  const [form, setForm] = useState<Partial<Customer>>(getEmptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setForm({ ...customer });
    } else {
      setForm(getEmptyForm());
    }
  }, [customer]);

  const isEdit = !!customer;

  const handleChange = (field: keyof Customer, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('CustomerForm.handleSubmit called, saving:', saving);
    e.preventDefault();
    // 防止重复提交
    if (saving) {
      console.log('CustomerForm: 已经在保存中，忽略此次调用');
      return;
    }
    if (!form.name || !form.name.trim()) {
      setError('客户姓名不能为空');
      return;
    }
    setSaving(true);
    setError('');
    try {
      console.log('CustomerForm: 开始保存, isEdit:', isEdit, 'customer:', customer);
      if (isEdit && customer) {
        console.log('CustomerForm: 进入编辑分支');
        // 编辑客户
        const res = await updateCustomer(customer.id, form);
        if (!res.success) {
          setError(res.error || '更新失败');
          return;
        }
        // 返回更新后的客户数据
        const updatedCustomer = { ...customer, ...form };
        console.log('CustomerForm: 编辑模式，准备调用 onSaved，参数:', updatedCustomer);
        onSaved(updatedCustomer);
        console.log('CustomerForm: 编辑模式，onSaved 调用完成');
      } else {
        console.log('CustomerForm: 进入新增分支');
        // 新增客户
        const res = await createCustomer(form);
        if (res.error || !res.id) {
          setError(res.error || '新增失败');
          return;
        }
        const newCustomerId = res.id;

        // 如果填写了「最近跟进内容」或「下次跟进内容」，自动新增一条跟进记录
        // 跟进记录的 follow_up_content = 最近跟进内容
        // 跟进记录的 next_follow_up_content = 下次跟进内容
        // 跟进记录的 next_follow_up_time = 下次跟进时间（表单中填写）
        const hasContent = (form.lastFollowUpContent && form.lastFollowUpContent.trim())
                          || (form.nextFollowUpContent && form.nextFollowUpContent.trim());
        if (hasContent) {
          const recordRes = await createFollowUpRecord(newCustomerId, {
            customerId: newCustomerId,
            followUpTime: form.lastFollowUpTime || getToday(),
            followUpContent: form.lastFollowUpContent || '',
            nextFollowUpContent: form.nextFollowUpContent || '',
            nextFollowUpTime: form.nextFollowUpTime || '',
            operator: '',
          });
          if (recordRes.error) {
            // 跟进记录创建失败不阻塞，仅提示
            console.warn('自动创建跟进记录失败:', recordRes.error);
          }
        }
        console.log('CustomerForm: 新增模式，准备调用 onSaved，无参数');
        onSaved();
        console.log('CustomerForm: 新增模式，onSaved 调用完成');
      }
    } catch {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-xs text-slate-900">{isEdit ? '编辑客户' : '新增客户'}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-0.5"
            aria-label="关闭"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {/* 基础信息 */}
          <div className="grid grid-cols-2 gap-2">
            <Field label="客户姓名 *">
              <input
                type="text"
                value={form.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="input"
                placeholder="请输入姓名"
                autoFocus
              />
            </Field>
            <Field label="编号">
              <input
                type="text"
                value={isEdit && customer?.customerNumber ? `#${customer.customerNumber}（自动生成）` : '保存后自动生成'}
                className="input bg-slate-50 text-slate-400"
                disabled
              />
            </Field>
            <Field label="跟进状态">
              <select
                value={form.followUpStatus || ''}
                onChange={(e) => handleChange('followUpStatus', e.target.value)}
                className="input"
              >
                <option value="">请选择</option>
                {FOLLOW_UP_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="客户状态">
              <select
                value={form.customerStatus || ''}
                onChange={(e) => handleChange('customerStatus', e.target.value)}
                className="input"
              >
                <option value="">请选择</option>
                {CUSTOMER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="预计投资金额">
              <input
                type="number"
                value={form.expectedInvestmentAmount ?? 0}
                onChange={(e) => handleChange('expectedInvestmentAmount', Number(e.target.value) || 0)}
                className="input"
                placeholder="0"
              />
            </Field>
            <Field label="预计总资产规模">
              <input
                type="text"
                value={form.totalAssetScale || ''}
                onChange={(e) => handleChange('totalAssetScale', e.target.value)}
                className="input"
                placeholder="如 500万"
              />
            </Field>
          </div>

          {/* 跟进信息 */}
          <div className="pt-1.5 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 mb-1.5">跟进信息</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="最近跟进时间">
                <input
                  type="date"
                  value={form.lastFollowUpTime || ''}
                  onChange={(e) => handleChange('lastFollowUpTime', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="下次跟进时间">
                <input
                  type="date"
                  value={form.nextFollowUpTime || ''}
                  onChange={(e) => handleChange('nextFollowUpTime', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="最近跟进内容" full>
                <textarea
                  value={form.lastFollowUpContent || ''}
                  onChange={(e) => handleChange('lastFollowUpContent', e.target.value)}
                  className="input"
                  rows={2}
                  placeholder="请输入最近一次跟进内容"
                />
              </Field>
              <Field label="下次跟进内容" full>
                <textarea
                  value={form.nextFollowUpContent || ''}
                  onChange={(e) => handleChange('nextFollowUpContent', e.target.value)}
                  className="input"
                  rows={2}
                  placeholder="请输入下次跟进内容"
                />
              </Field>
              <Field label="关注事项" full>
                <textarea
                  value={form.attentionItems || ''}
                  onChange={(e) => handleChange('attentionItems', e.target.value)}
                  className="input"
                  rows={2}
                  placeholder="需要重点关注的事项"
                />
              </Field>
            </div>
          </div>

          {/* 客户资料 */}
          <div className="pt-1.5 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 mb-1.5">客户资料</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="信任人">
                <input
                  type="text"
                  value={form.trustedPerson || ''}
                  onChange={(e) => handleChange('trustedPerson', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="受益人">
                <input
                  type="text"
                  value={form.beneficiary || ''}
                  onChange={(e) => handleChange('beneficiary', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="客户来源">
                <input
                  type="text"
                  value={form.customerSource || ''}
                  onChange={(e) => handleChange('customerSource', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="推荐人">
                <input
                  type="text"
                  value={form.referrer || ''}
                  onChange={(e) => handleChange('referrer', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="理财偏好">
                <input
                  type="text"
                  value={form.financialPreference || ''}
                  onChange={(e) => handleChange('financialPreference', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="家庭信息">
                <input
                  type="text"
                  value={form.familySituation || ''}
                  onChange={(e) => handleChange('familySituation', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="职业信息">
                <input
                  type="text"
                  value={form.occupationInfo || ''}
                  onChange={(e) => handleChange('occupationInfo', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="爱好">
                <input
                  type="text"
                  value={form.hobbies || ''}
                  onChange={(e) => handleChange('hobbies', e.target.value)}
                  className="input"
                />
              </Field>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-[10px] py-1 px-2 rounded">{error}</div>
          )}
        </form>

        {/* 底部按钮 */}
        <div className="px-3 py-2 border-t border-slate-100 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-1.5 rounded border border-slate-200 text-slate-600 text-[10px] font-medium hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-1.5 rounded bg-blue-600 text-white text-[10px] font-medium hover:bg-blue-700 disabled:bg-blue-300"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block text-[10px] text-slate-500 mb-0.5">{label}</label>
      {children}
    </div>
  );
}
