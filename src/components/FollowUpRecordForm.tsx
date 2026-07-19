import { useState } from 'react';
import type { Customer, FollowUpRecord } from '@/types';
import { createFollowUpRecord } from '@/api/feishu';

interface FollowUpRecordFormProps {
  customer: Customer;
  onClose: () => void;
  onSaved: () => void;
}

function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function FollowUpRecordForm({ customer, onClose, onSaved }: FollowUpRecordFormProps) {
  const [form, setForm] = useState<Partial<FollowUpRecord>>({
    followUpTime: getToday(),
    followUpContent: '',
    nextFollowUpContent: '',
    nextFollowUpTime: '',
    operator: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof FollowUpRecord, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.followUpContent || !form.followUpContent.trim()) {
      setError('跟进内容不能为空');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await createFollowUpRecord(customer.id, {
        ...form,
        customerId: customer.id,
        customerNumber: customer.customerNumber,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      onSaved();
    } catch {
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-slate-900">新增跟进记录</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                {customer.name.charAt(0)}
              </span>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{customer.name}</p>
                <p className="text-xs text-slate-500">
                  #{customer.customerNumber} · {customer.followUpStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="跟进时间 *">
              <input
                type="date"
                value={form.followUpTime || ''}
                onChange={(e) => handleChange('followUpTime', e.target.value)}
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
          </div>

          <Field label="跟进内容 *" full>
            <textarea
              value={form.followUpContent || ''}
              onChange={(e) => handleChange('followUpContent', e.target.value)}
              className="input"
              rows={5}
              placeholder="请输入本次跟进内容"
              autoFocus
            />
          </Field>

          <Field label="下次跟进内容" full>
            <textarea
              value={form.nextFollowUpContent || ''}
              onChange={(e) => handleChange('nextFollowUpContent', e.target.value)}
              className="input"
              rows={3}
              placeholder="请输入下次跟进计划"
            />
          </Field>

          <Field label="操作人">
            <input
              type="text"
              value={form.operator || ''}
              onChange={(e) => handleChange('operator', e.target.value)}
              className="input"
              placeholder="可选"
            />
          </Field>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm py-2 px-3 rounded-lg">{error}</div>
          )}
        </form>

        <div className="px-5 py-3 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-300"
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
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
