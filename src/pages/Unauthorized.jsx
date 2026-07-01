// src/pages/Unauthorized.jsx
import { Link } from 'react-router-dom'

function Unauthorized() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f1f5f9',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ fontSize: '64px' }}>🚫</div>
      <h1 style={{ color: '#1e293b' }}>Access Denied</h1>
      <p style={{ color: '#64748b' }}>You don't have permission to view this page.</p>
      <Link to="/login" style={{
        background: '#3b82f6',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '40px',
        textDecoration: 'none',
        fontWeight: 'bold'
      }}>
        Back to Login
      </Link>
    </div>
  )
}

export default Unauthorized