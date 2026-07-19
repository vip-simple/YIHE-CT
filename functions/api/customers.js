import { jsonResponse, mapCustomer, parseRequestBody } from '../utils/db.js';

// 获取客户列表
export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const { results } = await DB.prepare('SELECT * FROM customers ORDER BY id').all();
    return jsonResponse(results.map(mapCustomer));
  } catch (error) {
    console.error('Error fetching customers:', error);
    return jsonResponse({ error: 'Failed to fetch customers' }, 500);
  }
}

// 新增客户
export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    const body = await parseRequestBody(context.request);
    if (!body) return jsonResponse({ error: 'Invalid body' }, 400);

    // 编号规则：
    // - 如果请求体传入了 customerNumber（如 Excel 导入），则使用传入值
    // - 否则取当前最大值 + 1（从 1 开始）
    let nextNumber;
    const inputNumber = Number(body.customerNumber);
    if (inputNumber && inputNumber > 0) {
      nextNumber = inputNumber;
    } else {
      const maxRow = await DB.prepare('SELECT MAX(customer_number) AS max_num FROM customers').first();
      nextNumber = (maxRow && maxRow.max_num) ? maxRow.max_num + 1 : 1;
    }

    const stmt = DB.prepare(`
      INSERT INTO customers (
        name, customer_number, follow_up_status, customer_status,
        expected_investment_amount, total_asset_scale, financial_preference,
        family_situation, occupation_info, hobbies,
        last_follow_up_time, last_follow_up_content,
        next_follow_up_content, next_follow_up_time,
        attention_items, trusted_person, beneficiary,
        customer_source, referrer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      body.name || '',
      nextNumber,
      body.followUpStatus || '',
      body.customerStatus || '',
      body.expectedInvestmentAmount || 0,
      body.totalAssetScale || '',
      body.financialPreference || '',
      body.familySituation || '',
      body.occupationInfo || '',
      body.hobbies || '',
      body.lastFollowUpTime || '',
      body.lastFollowUpContent || '',
      body.nextFollowUpContent || '',
      body.nextFollowUpTime || '',
      body.attentionItems || '',
      body.trustedPerson || '',
      body.beneficiary || '',
      body.customerSource || '',
      body.referrer || ''
    ).run();

    return jsonResponse({ id: result.meta.last_row_id, customerNumber: nextNumber, success: true });
  } catch (error) {
    console.error('Error creating customer:', error);
    return jsonResponse({ error: 'Failed to create customer' }, 500);
  }
}
