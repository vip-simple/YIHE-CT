// 共享工具函数
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function parseRequestBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// 简单的 SHA-256 哈希
export async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 验证 token（base64 编码，支持中文）
export function createToken(user) {
  const payload = { id: user.id, username: user.username, name: user.name, role: user.role };
  const json = JSON.stringify(payload);
  // 处理 UTF-8 字符（中文等），避免 btoa() 报错
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

export function parseToken(token) {
  try {
    const binary = atob(token);
    // 还原 UTF-8
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// 从请求中获取用户信息
export function getUserFromRequest(request) {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  return parseToken(token);
}

// 客户行转对象
export function mapCustomer(row) {
  return {
    id: String(row.id),
    name: row.name || '',
    customerNumber: Number(row.customer_number) || 0,
    followUpStatus: row.follow_up_status || '',
    customerStatus: row.customer_status || '',
    expectedInvestmentAmount: row.expected_investment_amount || 0,
    totalAssetScale: row.total_asset_scale || '',
    financialPreference: row.financial_preference || '',
    familySituation: row.family_situation || '',
    occupationInfo: row.occupation_info || '',
    hobbies: row.hobbies || '',
    lastFollowUpTime: row.last_follow_up_time || '',
    lastFollowUpContent: row.last_follow_up_content || '',
    nextFollowUpContent: row.next_follow_up_content || '',
    nextFollowUpTime: row.next_follow_up_time || '',
    attentionItems: row.attention_items || '',
    trustedPerson: row.trusted_person || '',
    beneficiary: row.beneficiary || '',
    customerSource: row.customer_source || '',
    referrer: row.referrer || '',
  };
}

// 跟进记录行转对象
export function mapFollowUpRecord(row) {
  return {
    id: String(row.id),
    customerId: String(row.customer_id),
    customerNumber: Number(row.customer_number) || 0,
    recordNumber: row.record_number || 1,
    followUpTime: row.follow_up_time || '',
    followUpContent: row.follow_up_content || '',
    nextFollowUpContent: row.next_follow_up_content || '',
    nextFollowUpTime: row.next_follow_up_time || '',
    operator: row.operator || '',
  };
}
