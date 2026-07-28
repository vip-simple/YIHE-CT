// 每周一早上 1 点更新跟进时间的定时任务
export default {
  async scheduled(event, env, ctx) {
    try {
      const { DB } = env;

      // 获取本周一的日期（YYYY-MM-DD）
      const today = new Date();
      const day = today.getDay() || 7; // 周日为 7
      const monday = new Date(today);
      monday.setDate(today.getDate() - day + 1);
      const thisMonday = monday.toISOString().split('T')[0];

      // 需要更新的跟进状态
      const targetStatuses = ['跟进中', '已约', '重点跟踪'];

      // 更新符合条件的客户
      const result = await DB.prepare(`
        UPDATE customers
        SET next_follow_up_time = ?
        WHERE next_follow_up_time < ?
          AND follow_up_status IN (${targetStatuses.map(() => '?').join(',')})
      `).bind(
        thisMonday,
        new Date().toISOString().split('T')[0], // 今天的日期
        ...targetStatuses
      ).run();

      console.log(`定时任务完成：更新了 ${result.meta.changes} 个客户的跟进时间`);

    } catch (error) {
      console.error('定时任务执行失败:', error);
    }
  }
};
