import { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from '@/components/Header';
import { FilterBar } from '@/components/FilterBar';
import { CustomerList } from '@/components/CustomerList';
import { CustomerForm } from '@/components/CustomerForm';
import { FollowUpRecordForm } from '@/components/FollowUpRecordForm';
import { fetchCustomers, getThisWeekRange, exportToExcel, importFromExcel, uploadToD1 } from '@/api/feishu';
import type { Customer, FilterOptions } from '@/types';

// 筛选条件本地存储 key
const FILTER_STORAGE_KEY = 'yihe_filter';

// 从 sessionStorage 读取筛选条件，没有则用默认值
function loadInitialFilter(): FilterOptions {
  try {
    const saved = sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    searchName: '',
    selectedStatuses: [],
    dateRange: getThisWeekRange(),
    enableDateFilter: true,
    hasAttentionItems: false,
    showOnlyWithAttention: false,
  };
}

export function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [recordCustomer, setRecordCustomer] = useState<Customer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<FilterOptions>(loadInitialFilter);

  // 筛选条件变化时保存到 sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filter));
    } catch {}
  }, [filter]);

  const loadCustomers = async () => {
    setLoading(true);
    const data = await fetchCustomers();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleExport = async () => {
    if (customers.length === 0) {
      alert('没有数据可导出');
      return;
    }
    await exportToExcel(customers);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg('正在解析 Excel...');
    try {
      const { customers: importCustomers, records } = await importFromExcel(file);
      setImportMsg(`正在上传 ${importCustomers.length} 个客户和 ${records.length} 条跟进记录...`);
      await uploadToD1(importCustomers, records);
      setImportMsg(`导入完成：${importCustomers.length} 个客户，${records.length} 条跟进记录`);
      await loadCustomers();
      setTimeout(() => setImportMsg(''), 5000);
    } catch (err) {
      setImportMsg('导入失败：' + (err as Error).message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 新增
  const handleAdd = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  // 编辑
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  // 新增跟进记录
  const handleAddRecord = (customer: Customer) => {
    setRecordCustomer(customer);
    setRecordFormOpen(true);
  };

  // 跟进记录保存成功后
  const handleRecordSaved = async () => {
    setRecordFormOpen(false);
    setRecordCustomer(null);
    await loadCustomers();
  };

  // 表单保存成功后
  const handleSaved = async () => {
    setFormOpen(false);
    setEditingCustomer(null);
    await loadCustomers();
  };

  const statuses = ['重点跟踪', '已约', '跟进中', '暂时先不跟', '已放弃'];

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      if (filter.searchName) {
        const keyword = filter.searchName.toLowerCase();
        const nameMatch = customer.name.toLowerCase().includes(keyword);
        const numberMatch = String(customer.customerNumber).includes(keyword);
        if (!nameMatch && !numberMatch) {
          return false;
        }
      }
      if (filter.selectedStatuses.length > 0 && !filter.selectedStatuses.includes(customer.followUpStatus)) {
        return false;
      }
      if (filter.showOnlyWithAttention) {
        if (!customer.attentionItems) {
          return false;
        }
      }
      if (filter.enableDateFilter) {
        if (!customer.nextFollowUpTime) {
          return false;
        }
        const nextTime = new Date(customer.nextFollowUpTime);
        const start = new Date(filter.dateRange.start);
        const end = new Date(filter.dateRange.end);
        return nextTime >= start && nextTime <= end;
      }
      return true;
    });
  }, [customers, filter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="YIHE CT- List" />
      <FilterBar filter={filter} onFilterChange={setFilter} statuses={statuses} />
      <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-500">
        <span>共 <span className="font-semibold text-slate-700">{filteredCustomers.length}</span> 位客户</span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            + 新增客户
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={handleExport}
            disabled={loading || customers.length === 0}
            className="text-blue-600 hover:text-blue-800 disabled:text-slate-300 font-medium"
          >
            导出 Excel
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={handleImportClick}
            disabled={importing}
            className="text-blue-600 hover:text-blue-800 disabled:text-slate-300 font-medium"
          >
            {importing ? '导入中...' : '导入 Excel'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      {importMsg && (
        <div className="px-4 py-2 mx-4 mb-2 bg-blue-50 text-blue-700 text-sm rounded-lg">
          {importMsg}
        </div>
      )}
      <div className="px-4 pb-2 text-xs text-slate-400">
        按姓名 A-Z 排序
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <CustomerList
          customers={filteredCustomers}
          onEdit={handleEdit}
          onAddRecord={handleAddRecord}
        />
      )}

      {formOpen && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => {
            setFormOpen(false);
            setEditingCustomer(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {recordFormOpen && recordCustomer && (
        <FollowUpRecordForm
          customer={recordCustomer}
          onClose={() => {
            setRecordFormOpen(false);
            setRecordCustomer(null);
          }}
          onSaved={handleRecordSaved}
        />
      )}
    </div>
  );
}
