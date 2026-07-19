import type { Customer, FollowUpRecord } from '@/types';
import * as XLSX from 'xlsx';

// 获取认证头（带 token 时附加 Authorization）
function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// 检查响应：401 则清除 token 跳转登录
function checkAuth(response: Response) {
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const response = await fetch('/api/customers', { headers: getAuthHeaders() });
    checkAuth(response);
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

export async function fetchFollowUpRecords(customerId: string): Promise<FollowUpRecord[]> {
  try {
    const response = await fetch(`/api/follow-up-records/${customerId}`, { headers: getAuthHeaders() });
    checkAuth(response);
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

// 获取单个客户
export async function fetchCustomer(id: string): Promise<Customer | null> {
  try {
    const response = await fetch(`/api/customers/${id}`, { headers: getAuthHeaders() });
    checkAuth(response);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// 新增跟进记录
export async function createFollowUpRecord(customerId: string, record: Partial<FollowUpRecord>): Promise<{ id?: string; recordNumber?: number; error?: string }> {
  const response = await fetch(`/api/follow-up-records/${customerId}`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(record),
  });
  checkAuth(response);
  const data = await response.json();
  if (!response.ok) return { error: data.error || '新增跟进记录失败' };
  return { id: String(data.id), recordNumber: data.recordNumber };
}

// 新增客户
export async function createCustomer(customer: Partial<Customer>): Promise<{ id?: string; error?: string }> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(customer),
  });
  checkAuth(response);
  const data = await response.json();
  if (!response.ok) return { error: data.error || '新增失败' };
  return { id: String(data.id) };
}

// 更新客户
export async function updateCustomer(id: string, customer: Partial<Customer>): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(customer),
  });
  checkAuth(response);
  const data = await response.json();
  if (!response.ok) return { success: false, error: data.error || '更新失败' };
  return { success: true };
}

// 删除客户
export async function deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  checkAuth(response);
  const data = await response.json();
  if (!response.ok) return { success: false, error: data.error || '删除失败' };
  return { success: true };
}

// 导出所有客户和跟进记录为 Excel
export async function exportToExcel(customers: Customer[]): Promise<void> {
  // 获取所有跟进记录
  const allRecords: FollowUpRecord[] = [];
  for (const c of customers) {
    const records = await fetchFollowUpRecords(c.id);
    allRecords.push(...records);
  }

  const wb = XLSX.utils.book_new();

  // 客户表
  const customerData = customers.map((c, i) => ({
    '序号': i + 1,
    '编号': c.customerNumber,
    '客户姓名': c.name,
    '跟进状态': c.followUpStatus,
    '客户状态': c.customerStatus,
    '预计投资金额': c.expectedInvestmentAmount,
    '预计总资产规模': c.totalAssetScale,
    '理财偏好': c.financialPreference,
    '家庭情况': c.familySituation,
    '职业信息': c.occupationInfo,
    '爱好': c.hobbies,
    '最近一次沟通时间': c.lastFollowUpTime,
    '跟进内容': c.lastFollowUpContent,
    '下次跟进内容': c.nextFollowUpContent,
    '下次跟进时间': c.nextFollowUpTime,
    '关注事项': c.attentionItems,
    '信任人': c.trustedPerson,
    '受益人': c.beneficiary,
    '客户来源': c.customerSource,
    '推荐人': c.referrer,
  }));
  const wsCustomers = XLSX.utils.json_to_sheet(customerData);
  XLSX.utils.book_append_sheet(wb, wsCustomers, '客户列表');

  // 跟进记录表
  const recordData = allRecords.map((r) => ({
    '跟进编号': r.recordNumber,
    '客户姓名': customers.find((c) => c.id === r.customerId)?.name || '',
    '跟进时间': r.followUpTime,
    '跟进内容': r.followUpContent,
  }));
  const wsRecords = XLSX.utils.json_to_sheet(recordData);
  XLSX.utils.book_append_sheet(wb, wsRecords, '跟进记录');

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `YIHE_CT_${date}.xlsx`);
}

// 列名映射：精确适配 YIHE CT 20260323.xlsx 的列名
const CUSTOMER_FIELD_ALIASES: Record<keyof Customer, string[]> = {
  id: [],
  customerNumber: ['编号', '客户编号', '客户ID'],
  name: ['客户姓名', '姓名', '客户名'],
  followUpStatus: ['跟进状态', '跟踪状态'],
  customerStatus: ['客户状态'],
  expectedInvestmentAmount: ['预计投资金额', '投资金额', '金额'],
  totalAssetScale: ['预估总资产规模', '预计总资产规模', '总资产规模', '总资产'],
  financialPreference: ['理财偏好', '偏好'],
  familySituation: ['家庭情况', '家庭'],
  occupationInfo: ['职业信息', '职业'],
  hobbies: ['爱好', '兴趣'],
  lastFollowUpTime: ['最近一次沟通时间', '最近跟进时间', '最近沟通时间'],
  lastFollowUpContent: ['跟进内容', '最近跟进内容', '最近沟通内容'],
  nextFollowUpContent: ['下次跟进内容', '下次沟通内容'],
  nextFollowUpTime: ['下次跟进时间', '下次沟通时间'],
  attentionItems: ['关注事项', '重点关注事项'],
  trustedPerson: ['信任人'],
  beneficiary: ['受益人'],
  customerSource: ['客户来源', '来源'],
  referrer: ['推荐人'],
};

const RECORD_FIELD_ALIASES = {
  customerName: ['客户姓名', '客户信息', '姓名'],
  customerNumber: ['编号', '客户编号', '客户ID'],
  followUpTime: ['跟进时间', '沟通时间'],
  followUpContent: ['跟进内容', '沟通内容'],
};

// 把 Excel 日期序列号（如 46128）或字符串转成 YYYY-MM-DD
function normalizeDate(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  // 数字：Excel 序列号（自 1899-12-30 起算）
  if (typeof value === 'number') {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(epoch.getTime() + value * 86400000);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // 字符串：尝试解析
  const s = String(value).trim();
  if (!s) return '';
  // 已经是 YYYY-MM-DD 或 YYYY/MM/DD
  const m1 = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m1) {
    return `${m1[1]}-${m1[2].padStart(2, '0')}-${m1[3].padStart(2, '0')}`;
  }
  return s;
}

// 从行里按候选列名查找值（精确匹配优先，再尝试包含匹配）
function pickColumn(row: Record<string, unknown>, candidates: string[]): unknown {
  // 1. 精确匹配
  for (const c of candidates) {
    if (row[c] !== undefined && row[c] !== null) return row[c];
  }
  // 2. 包含匹配（列名包含候选 或 候选包含列名）
  for (const key of Object.keys(row)) {
    for (const c of candidates) {
      if (key.includes(c) || c.includes(key)) {
        const v = row[key];
        if (v !== undefined && v !== null) return v;
      }
    }
  }
  return '';
}

// 从 Excel 导入客户数据
export async function importFromExcel(file: File): Promise<{ customers: Customer[]; records: FollowUpRecord[] }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });

  const customers: Customer[] = [];
  const records: FollowUpRecord[] = [];

  const sheetNames = wb.SheetNames;

  // 按名称查找客户表和跟进记录表（兼容多种命名）
  const customerSheetName =
    sheetNames.find((n) => /客户信息|客户列表|客户$/i.test(n)) || sheetNames[0];
  const recordSheetName =
    sheetNames.find((n) => /跟进记录|跟进|记录/i.test(n) && n !== customerSheetName);

  // 解析客户表
  const wsCustomers = customerSheetName ? wb.Sheets[customerSheetName] : null;
  if (wsCustomers) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wsCustomers);
    rows.forEach((row, i) => {
      const name = String(pickColumn(row, CUSTOMER_FIELD_ALIASES.name) ?? '').trim();
      // 跳过空名行
      if (!name) return;

      customers.push({
        id: String(i + 1),
        // 保留 Excel 中的原编号；后端会优先使用传入的编号
        customerNumber: Number(pickColumn(row, CUSTOMER_FIELD_ALIASES.customerNumber) ?? 0) || 0,
        name,
        followUpStatus: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.followUpStatus) ?? '').trim(),
        customerStatus: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.customerStatus) ?? '').trim(),
        expectedInvestmentAmount: Number(pickColumn(row, CUSTOMER_FIELD_ALIASES.expectedInvestmentAmount) ?? 0) || 0,
        totalAssetScale: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.totalAssetScale) ?? '').trim(),
        financialPreference: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.financialPreference) ?? '').trim(),
        familySituation: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.familySituation) ?? '').trim(),
        occupationInfo: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.occupationInfo) ?? '').trim(),
        hobbies: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.hobbies) ?? '').trim(),
        lastFollowUpTime: normalizeDate(pickColumn(row, CUSTOMER_FIELD_ALIASES.lastFollowUpTime)),
        lastFollowUpContent: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.lastFollowUpContent) ?? '').trim(),
        nextFollowUpContent: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.nextFollowUpContent) ?? '').trim(),
        nextFollowUpTime: normalizeDate(pickColumn(row, CUSTOMER_FIELD_ALIASES.nextFollowUpTime)),
        attentionItems: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.attentionItems) ?? '').trim(),
        trustedPerson: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.trustedPerson) ?? '').trim(),
        beneficiary: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.beneficiary) ?? '').trim(),
        customerSource: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.customerSource) ?? '').trim(),
        referrer: String(pickColumn(row, CUSTOMER_FIELD_ALIASES.referrer) ?? '').trim(),
      });
    });
  }

  // 解析跟进记录表
  const wsRecords = recordSheetName ? wb.Sheets[recordSheetName] : null;
  if (wsRecords) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wsRecords);

    // 用编号建立客户索引，方便快速查找（编号唯一，不会重名）
    const customerByNumber = new Map<number, Customer>();
    for (const c of customers) {
      if (c.customerNumber) {
        customerByNumber.set(c.customerNumber, c);
      }
    }

    rows.forEach((row, i) => {
      const customerName = String(pickColumn(row, RECORD_FIELD_ALIASES.customerName) ?? '').trim();
      const content = String(pickColumn(row, RECORD_FIELD_ALIASES.followUpContent) ?? '').trim();
      const recordCustomerNumber = Number(pickColumn(row, RECORD_FIELD_ALIASES.customerNumber) ?? 0) || 0;

      // 客户名和内容都为空的行跳过
      if (!customerName && !content) return;

      // 优先用客户编号关联（编号不会重复，姓名可能重复）
      let customer: Customer | undefined;
      if (recordCustomerNumber > 0) {
        customer = customerByNumber.get(recordCustomerNumber);
      }
      // 编号找不到时用姓名兜底
      if (!customer && customerName) {
        customer = customers.find((c) => c.name === customerName);
      }

      records.push({
        id: `r${i + 1}`,
        customerId: customer?.id || '',
        customerNumber: recordCustomerNumber,
        recordNumber: 0,
        followUpTime: normalizeDate(pickColumn(row, RECORD_FIELD_ALIASES.followUpTime)),
        followUpContent: content,
        nextFollowUpContent: '',
        nextFollowUpTime: '',
        operator: '',
      });
    });
  }

  // 解析失败时给出明确的错误信息，方便排查
  if (customers.length === 0) {
    const firstSheet = customerSheetName ? wb.Sheets[customerSheetName] : null;
    const firstRow = firstSheet ? XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet)[0] : null;
    const headerKeys = firstRow ? Object.keys(firstRow) : [];
    throw new Error(
      `未解析到任何客户。Sheet 名: [${sheetNames.join(', ')}]；` +
      `使用的客户表: ${customerSheetName || '无'}；` +
      `列名: [${headerKeys.join(', ')}]。` +
      `请确认 Excel 第一个 Sheet 是客户表，且至少包含"客户姓名"列。`
    );
  }

  return { customers, records };
}

// 批量上传到 D1
export async function uploadToD1(customers: Customer[], records: FollowUpRecord[]): Promise<void> {
  const headers = getAuthHeaders({ 'Content-Type': 'application/json' });

  // 先清空旧数据
  await fetch('/api/reset', { method: 'POST', headers });

  // 上传客户，并建立「客户编号 → 真实数据库 ID」的映射
  const numberToIdMap = new Map<number, string>();
  for (const c of customers) {
    console.log('上传客户:', c.name, '| 编号:', c.customerNumber);
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers,
      body: JSON.stringify(c),
    });
    const data = await res.json();
    if (data && data.id && c.customerNumber) {
      numberToIdMap.set(c.customerNumber, String(data.id));
    }
  }

  // 上传跟进记录：用跟进记录中的客户编号找到对应客户的真实 ID
  for (const r of records) {
    if (!r.customerNumber) continue;
    const realCustomerId = numberToIdMap.get(r.customerNumber);
    if (!realCustomerId) continue;
    await fetch(`/api/follow-up-records/${realCustomerId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(r),
    });
  }
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    '待跟进': 'bg-orange-100 text-orange-800',
    '跟进中': 'bg-blue-100 text-blue-800',
    '已完成': 'bg-green-100 text-green-800',
    '延期': 'bg-red-100 text-red-800',
    '暂时先不跟': 'bg-gray-100 text-gray-600',
    '已放弃': 'bg-red-50 text-red-700',
    '重点跟踪': 'bg-amber-100 text-amber-800',
    '已约': 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getCustomerStatusColor(status: string): string {
  const colors: Record<string, string> = {
    '潜在': 'bg-yellow-100 text-yellow-800',
    '意向': 'bg-purple-100 text-purple-800',
    '待成交': 'bg-amber-100 text-amber-800',
    '成交': 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function formatMoney(amount: number): string {
  if (amount >= 10000) {
    return (amount / 10000).toFixed(0) + '万';
  }
  return amount.toLocaleString();
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function getThisWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(now.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}