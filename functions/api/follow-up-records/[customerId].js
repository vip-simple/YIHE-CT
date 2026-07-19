import { jsonResponse, mapFollowUpRecord, parseRequestBody } from '../../utils/db.js';

// 获取客户的跟进记录
export async function onRequestGet(context) {
  try {
    const { DB } = context.env;
    const { customerId } = context.params;
    const { results } = await DB.prepare(
      'SELECT * FROM follow_up_records WHERE customer_id = ? ORDER BY follow_up_time DESC'
    ).bind(customerId).all();
    return jsonResponse(results.map(mapFollowUpRecord));
  } catch (error) {
    console.error('Error fetching follow-up records:', error);
    return jsonResponse({ error: 'Failed to fetch follow-up records' }, 500);
  }
}

// 新增跟进记录
export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    const { customerId } = context.params;
    const body = await parseRequestBody(context.request);
    if (!body) return jsonResponse({ error: 'Invalid body' }, 400);

    // 自动计算该客户的下一个跟进编号（从 1 开始）
    const maxRow = await DB.prepare(
      'SELECT MAX(record_number) AS max_no FROM follow_up_records WHERE customer_id = ?'
    ).bind(customerId).first();
    const nextNumber = (maxRow && maxRow.max_no ? maxRow.max_no : 0) + 1;

    const result = await DB.prepare(`
      INSERT INTO follow_up_records (
        customer_id, customer_number, record_number, follow_up_time, follow_up_content,
        next_follow_up_content, next_follow_up_time, operator
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      customerId,
      Number(body.customerNumber) || 0,
      nextNumber,
      body.followUpTime || '',
      body.followUpContent || '',
      body.nextFollowUpContent || '',
      body.nextFollowUpTime || '',
      body.operator || ''
    ).run();

    // 同步更新客户表：最近跟进时间、最近跟进内容、下次跟进内容
    // 说明：本次跟进就是"最近跟进"；记录中规划的下次跟进也同步到客户表
    await DB.prepare(`
      UPDATE customers SET
        last_follow_up_time = ?,
        last_follow_up_content = ?,
        next_follow_up_content = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.followUpTime || '',
      body.followUpContent || '',
      body.nextFollowUpContent || '',
      customerId
    ).run();

    return jsonResponse({ id: result.meta.last_row_id, recordNumber: nextNumber, success: true });
  } catch (error) {
    console.error('Error creating follow-up record:', error);
    return jsonResponse({ error: 'Failed to create follow-up record' }, 500);
  }
}
