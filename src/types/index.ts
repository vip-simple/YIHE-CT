export interface Customer {
  id: string;
  name: string;
  customerNumber: number;
  followUpStatus: string;
  customerStatus: string;
  expectedInvestmentAmount: number;
  totalAssetScale: string;
  financialPreference: string;
  familySituation: string;
  occupationInfo: string;
  hobbies: string;
  lastFollowUpTime: string;
  lastFollowUpContent: string;
  nextFollowUpContent: string;
  nextFollowUpTime: string;
  attentionItems: string;
  trustedPerson: string;
  beneficiary: string;
  customerSource: string;
  referrer: string;
}

export interface FollowUpRecord {
  id: string;
  customerId: string;
  customerNumber: number;
  recordNumber: number;
  followUpTime: string;
  followUpContent: string;
  nextFollowUpContent: string;
  nextFollowUpTime: string;
  operator: string;
}

export interface FilterOptions {
  searchName: string;
  selectedStatuses: string[];
  dateRange: { start: string; end: string };
  enableDateFilter: boolean;
  hasAttentionItems: boolean;
  showOnlyWithAttention: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}