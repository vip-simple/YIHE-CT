import { jsonResponse, mapCustomer, parseRequestBody } from '../../utils/db.js';

// 获取单个客户
export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const { id } = context.params;
    const row = await DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).first();
    if (!row) return jsonResponse({ error: 'Not found' }, 404);
    return jsonResponse(mapCustomer(row));
  } catch (error) {
    console.error('Error fetching customer:', error);
    return jsonResponse({ error: 'Failed to fetch customer' }, 500);
  }
}

// 更新客户
export async function onRequestPut(context) {
  try {
    const { DB } = context.env;
    const { id } = context.params;
    const body = await parseRequestBody(context.request);
    if (!body) return jsonResponse({ error: 'Invalid body' }, 400);

    await DB.prepare(`
      UPDATE customers SET
        name = ?, follow_up_status = ?, customer_status = ?,
        expected_investment_amount = ?,
        total_asset_scale = ?, financial_preference = ?,
        family_situation = ?, occupation_info = ?, hobbies = ?,
        last_follow_up_time = ?, last_follow_up_content = ?,
        next_follow_up_content = ?, next_follow_up_time = ?,
        attention_items = ?, trusted_person = ?, beneficiary = ?,
        customer_source = ?, referrer = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.name || '',
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
      body.referrer || '',
      id
    ).run();

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error updating customer:', error);
    return jsonResponse({ error: 'Failed to update customer' }, 500);
  }
}

// 快速更新下次跟进时间（PATCH方法）
export async function onRequestPatch(context) {
  try {
    const { DB } = context.env;
    const { id } = context.params;
    const body = await parseRequestBody(context.request);
    if (!body) return jsonResponse({ error: 'Invalid body' }, 400);

    // 只更新下次跟进时间，不影响其他字段
    if (body.hasOwnProperty('nextFollowUpTime')) {
      await DB.prepare(`
        UPDATE customers SET
          next_follow_up_time = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(body.nextFollowUpTime || null, id).run();
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error updating next follow-up time:', error);
    return jsonResponse({ error: 'Failed to update next follow-up time' }, 500);
  }
}

// 删除客户
export async function onRequestDelete(context) {
  try {
    const { DB } = context.env;
    const { id } = context.params;
    await DB.prepare('DELETE FROM customers WHERE id = ?').bind(id).run();
    await DB.prepare('DELETE FROM follow_up_records WHERE customer_id = ?').bind(id).run();
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return jsonResponse({ error: 'Failed to delete customer' }, 500);
  }
}
