import { jsonResponse } from '../utils/db.js';

// 重置所有数据
export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    await DB.prepare('DELETE FROM follow_up_records').run();
    await DB.prepare('DELETE FROM customers').run();
    // 重置自增 ID
    await DB.prepare("DELETE FROM sqlite_sequence WHERE name IN ('customers', 'follow_up_records')").run();
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error resetting data:', error);
    return jsonResponse({ error: 'Failed to reset data' }, 500);
  }
}
