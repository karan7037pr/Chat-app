import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('token')
  if (token) return <Navigate to="/chat" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatPlaceholder /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function ChatPlaceholder() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafaf9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Instrument Sans', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '13px', letterSpacing: '0.15em', color: '#9ca3af', marginBottom: '12px' }}>
          LOGGED IN AS
        </div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#0a0a0a', marginBottom: '4px' }}>
          {user.username}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
          {user.email}
        </div>
        <div style={{
          padding: '12px 20px',
          background: '#f3f4f6',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#374151',
          maxWidth: '400px',
          wordBreak: 'break-all',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '6px' }}>JWT TOKEN</div>
          {localStorage.getItem('token')}
        </div>
        <button onClick={handleLogout} style={{
          padding: '10px 24px',
          background: 'transparent',
          border: '1.5px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '13px',
          cursor: 'pointer',
          color: '#6b7280',
          fontFamily: 'inherit'
        }}>
          Sign out
        </button>
      </div>
    </div>
  )
}