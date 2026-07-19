import { jsonResponse, parseRequestBody, sha256 } from '../../utils/db.js';

// 初始化默认管理员账户（仅在首次使用时调用）
export async function onRequestPost(context) {
  try {
    const { DB } = context.env;

    // 检查是否已有用户
    const existing = await DB.prepare('SELECT COUNT(*) as count FROM users').first();
    if (existing.count > 0) {
      return jsonResponse({ error: '已存在用户，如需重置请先清空 users 表' }, 400);
    }

    // 创建默认管理员
    const passwordHash = await sha256('admin123');
    await DB.prepare(`
      INSERT INTO users (username, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).bind('admin', passwordHash, '管理员', 'admin').run();

    return jsonResponse({ success: true, message: '默认管理员已创建，用户名: admin，密码: admin123' });
  } catch (error) {
    console.error('Error initializing admin:', error);
    return jsonResponse({ error: '初始化失败' }, 500);
  }
}
