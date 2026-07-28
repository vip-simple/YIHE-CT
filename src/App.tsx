import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { CustomerDetail } from '@/pages/CustomerDetail';
import { Login } from '@/pages/Login';

// 路由守卫：未登录则跳转到登录页
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// API 路径检查器
function ApiPathHandler({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // 如果是 API 路径，不渲染任何内容（让请求发送到后端）
  if (location.pathname.startsWith('/api/')) {
    return null;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <ApiPathHandler>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/:id"
            element={
              <ProtectedRoute>
                <CustomerDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ApiPathHandler>
    </BrowserRouter>
  );
}

export default App;
