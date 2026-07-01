import { Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import { supabase } from './lib/supabase'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { darkMode } = useTheme()
  const { language } = useLanguage()
  const location = useLocation()

  // ============================================================
  // TRANSLATIONS
  // ============================================================
  const translations = {
    loading: { en: 'Loading...', ms: 'Memuatkan...' },
    checking_auth: { en: 'Checking authentication...', ms: 'Memeriksa pengesahan...' },
    unauthorized: { en: 'Unauthorized Access', ms: 'Akses Tidak Dibenarkan' },
    redirecting: { en: 'Redirecting...', ms: 'Mengalihkan...' },
  }

  const t = (key) => {
    if (!translations[key]) return key
    return language === 'en' ? translations[key].en : translations[key].ms
  }

  // ============================================================
  // THEME COLORS
  // ============================================================
  const bgColor = darkMode ? '#0a0a16' : '#f1f5f9'
  const textColor = darkMode ? '#e8edf5' : '#1e293b'
  const textMuted = darkMode ? '#94a3b8' : '#64748b'
  const cardBg = darkMode ? 'rgba(20, 20, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const borderColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.5)'

  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${borderColor}`,
    boxShadow: darkMode 
      ? '0 8px 40px rgba(0,0,0,0.5)' 
      : '0 8px 40px rgba(0,0,0,0.06)'
  }

  // ============================================================
  // 🔥 PERMISSIONS MAP
  // ============================================================
  const getRequiredPermission = (path) => {
    const pageMap = {
      '/staff': 'pos',
      '/kitchen': 'kitchen',
      '/dashboard': 'admin',
      '/admin-report': 'admin',
      '/manage-menu': 'admin',
      '/manage-categories': 'admin',
      '/manage-staff': 'admin',
      '/manage-tables': 'admin',
      '/table-qrs': 'admin',
      '/manage-settings': 'admin',
    }
    return pageMap[path] || null
  }

  // ============================================================
  // CHECK AUTH
  // ============================================================
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      
      const savedAuth = sessionStorage.getItem('staffAuth')
      
      if (savedAuth) {
        try {
          const auth = JSON.parse(savedAuth)
          setUser(auth)
          setLoading(false)
          return
        } catch (e) {
          console.warn('Failed to parse staffAuth:', e)
          sessionStorage.removeItem('staffAuth')
        }
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: staffData } = await supabase
            .from('staff')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()
          
          if (staffData) {
            const userData = {
              id: staffData.id,
              username: staffData.username,
              name: staffData.name || 'User',
              role: staffData.role || 'staff',
              permissions: staffData.permissions || 'pos',
              login_method: staffData.login_method || 'email_password'
            }
            setUser(userData)
            sessionStorage.setItem('staffAuth', JSON.stringify(userData))
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.warn('Supabase auth check failed:', error)
        setUser(null)
      }
      
      setLoading(false)
    }
    
    checkAuth()

    const handleStorageChange = (e) => {
      if (e.key === 'staffAuth') {
        const savedAuth = sessionStorage.getItem('staffAuth')
        if (savedAuth) {
          try {
            setUser(JSON.parse(savedAuth))
          } catch (e) {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: bgColor,
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="spinner-protected"></div>
        <p style={{ 
          color: textMuted, 
          fontSize: '14px',
          fontWeight: '500',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          {t('checking_auth')}
        </p>
        <style>
          {`
            .spinner-protected {
              width: 48px;
              height: 48px;
              border: 4px solid rgba(59,130,246,0.15);
              border-top-color: #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
      </div>
    )
  }

  // ============================================================
  // NOT AUTHENTICATED
  // ============================================================
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // ============================================================
  // 🔥 PERMISSION CHECK (UTAMA)
  // ============================================================
  const currentPath = location.pathname
  
  // Admin can access everything
  if (user.role === 'admin') {
    return children
  }

  // 🔥 Check by permissions
  const requiredPerm = getRequiredPermission(currentPath)
  
  // If no permission required, allow access
  if (!requiredPerm) {
    return children
  }

  const userPerms = user.permissions || 'pos'
  
  // 🔥 Check if user has the required permission
  const hasPermission = userPerms === requiredPerm || userPerms === 'both'
  
  if (!hasPermission) {
    // Redirect based on permissions
    const redirectMap = {
      pos: '/staff',
      kitchen: '/kitchen',
      both: '/staff'
    }
    const redirectPath = redirectMap[userPerms] || '/staff'
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: bgColor,
        flexDirection: 'column',
        gap: '16px',
        padding: '20px'
      }}>
        <div style={{ 
          ...glassEffect,
          borderRadius: '28px',
          padding: '40px',
          maxWidth: '420px',
          width: '90%',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 24px rgba(239,68,68,0.3)'
          }}>
            <span style={{ fontSize: '32px' }}>🚫</span>
          </div>
          
          <h2 style={{ 
            color: textColor, 
            fontSize: '22px', 
            fontWeight: 'bold',
            margin: '0 0 8px 0'
          }}>
            {t('unauthorized')}
          </h2>
          
          <p style={{ 
            color: textMuted, 
            fontSize: '14px',
            margin: '0 0 20px 0'
          }}>
            {language === 'bm' 
              ? `Anda tidak mempunyai akses ke halaman ini. Mengalihkan...`
              : `You don't have access to this page. Redirecting...`
            }
          </p>
          
          <div style={{ 
            width: '100%', 
            height: '4px', 
            background: darkMode ? 'rgba(71,85,105,0.3)' : 'rgba(203,213,225,0.3)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              borderRadius: '2px',
              animation: 'progressBar 1.5s ease-in-out infinite'
            }} />
          </div>
          
          <p style={{ 
            color: textMuted, 
            fontSize: '12px',
            marginTop: '12px'
          }}>
            {t('redirecting')}
          </p>
        </div>
        
        <style>
          {`
            @keyframes progressBar {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}
        </style>
        
        <Navigate to={redirectPath} replace />
      </div>
    )
  }

  // ============================================================
  // AUTHORIZED
  // ============================================================
  return children
}

export default ProtectedRoute