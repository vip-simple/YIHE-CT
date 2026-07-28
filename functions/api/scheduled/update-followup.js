// 定时任务 API 端点：每周一更新跟进时间
import { jsonResponse } from '../../utils/db.js';

export async function onRequestPost(context) {
  try {
    const { DB } = context.env;

    // 获取本周一的日期（YYYY-MM-DD）
    const today = new Date();
    const day = today.getDay() || 7; // 周日为 7
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + 1);
    const thisMonday = monday.toISOString().split('T')[0];

    // 需要更新的跟进状态
    const targetStatuses = ['跟进中', '已约', '重点跟踪'];

    // 先查询会更新哪些客户（用于日志）
    const checkResult = await DB.prepare(`
      SELECT id, name, follow_up_status, next_follow_up_time
      FROM customers
      WHERE next_follow_up_time < ?
        AND follow_up_status IN (${targetStatuses.map(() => '?').join(',')})
      ORDER BY follow_up_status, name
    `).bind(
      new Date().toISOString().split('T')[0],
      ...targetStatuses
    ).all();

    // 执行更新
    const result = await DB.prepare(`
      UPDATE customers
      SET next_follow_up_time = ?
      WHERE next_follow_up_time < ?
        AND follow_up_status IN (${targetStatuses.map(() => '?').join(',')})
    `).bind(
      thisMonday,
      new Date().toISOString().split('T')[0],
      ...targetStatuses
    ).run();

    console.log(`定时任务完成：更新了 ${result.meta.changes} 个客户的跟进时间`);

    return jsonResponse({
      success: true,
      message: `已更新 ${result.meta.changes} 个客户的跟进时间到 ${thisMonday}`,
      updatedCount: result.meta.changes,
      thisMonday,
      affectedCustomers: checkResult.results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('定时任务执行失败:', error);
    return jsonResponse({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
}
