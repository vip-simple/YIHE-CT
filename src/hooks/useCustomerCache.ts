import type { Customer, FollowUpRecord } from '@/types';

const CACHE_KEY = 'customer_detail_cache';

// 缓存数据结构
interface CustomerCache {
  [customerId: string]: {
    customer: Customer;
    records: FollowUpRecord[];
    timestamp: number;
  };
}

// 获取所有缓存
function getAllCache(): CustomerCache {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

// 保存所有缓存
function saveAllCache(cache: CustomerCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('保存缓存失败:', error);
  }
}

// 获取单个客户缓存
export function getCustomerCache(customerId: string): { customer: Customer; records: FollowUpRecord[] } | null {
  const cache = getAllCache();
  const cached = cache[customerId];

  if (!cached) return null;

  // 缓存有效期1小时
  const now = Date.now();
  if (now - cached.timestamp > 60 * 60 * 1000) {
    // 缓存过期，删除
    removeCustomerCache(customerId);
    return null;
  }

  return { customer: cached.customer, records: cached.records };
}

// 保存单个客户缓存
export function saveCustomerCache(customerId: string, customer: Customer, records: FollowUpRecord[]) {
  const cache = getAllCache();
  cache[customerId] = {
    customer,
    records,
    timestamp: Date.now(),
  };
  saveAllCache(cache);
}

// 更新单个客户的缓存（只更新客户信息，不更新记录）
export function updateCustomerCache(customerId: string, updates: Partial<Customer>) {
  const cache = getAllCache();
  if (cache[customerId]) {
    cache[customerId].customer = {
      ...cache[customerId].customer,
      ...updates,
    };
    cache[customerId].timestamp = Date.now();
    saveAllCache(cache);
  }
}

// 删除单个客户缓存
export function removeCustomerCache(customerId: string) {
  const cache = getAllCache();
  delete cache[customerId];
  saveAllCache(cache);
}

// 清空所有缓存
export function clearAllCustomerCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('清空缓存失败:', error);
  }
}