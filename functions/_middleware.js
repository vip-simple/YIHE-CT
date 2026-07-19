import { jsonResponse, getUserFromRequest } from './utils/db.js';

// 鉴权中间件：除 /api/auth/* 外，所有 /api/* 请求都需要登录
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // 放行：登录/初始化接口、非 /api 路径、OPTIONS 预检
  if (
    path.startsWith('/api/auth/') ||
    !path.startsWith('/api/') ||
    context.request.method === 'OPTIONS'
  ) {
    return context.next();
  }

  const user = getUserFromRequest(context.request);
  if (!user) {
    return jsonResponse({ error: '未登录或登录已过期' }, 401);
  }

  // 把用户信息挂到 context.data 上，供后续处理器使用
  context.data = context.data || {};
  context.data.user = user;

  return context.next();
}
