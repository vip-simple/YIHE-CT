import { jsonResponse, parseRequestBody } from '../../../utils/db.js';

// 快速更新下次跟进时间
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