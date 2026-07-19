import { jsonResponse, parseRequestBody, sha256, createToken } from '../../utils/db.js';

// 登录
export async function onRequestPost(context) {
  try {
    const { DB } = context.env;
    const body = await parseRequestBody(context.request);
    if (!body || !body.username || !body.password) {
      return jsonResponse({ error: '用户名和密码不能为空' }, 400);
    }

    const passwordHash = await sha256(body.password);
    const user = await DB.prepare(
      'SELECT * FROM users WHERE username = ? AND password_hash = ?'
    ).bind(body.username, passwordHash).first();

    if (!user) {
      return jsonResponse({ error: '用户名或密码错误' }, 401);
    }

    const token = createToken(user);
    return jsonResponse({
      token,
      user: {
        id: String(user.id),
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return jsonResponse({ error: '登录失败' }, 500);
  }
}
