import { useState, useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import toast from 'react-hot-toast'
import { supabase } from './lib/supabase'
import { useNavigate } from 'react-router-dom'

function Login() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { language, setLanguage } = useLanguage()
  const navigate = useNavigate()
  
  // ===== EMAIL LOGIN STATE =====
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // ===== PIN LOGIN STATE =====
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  
  // ===== LOGIN METHOD =====
  const [loginMethod, setLoginMethod] = useState('email') // 'email' or 'pin'
  
  // ===== RESTAURANT SETTINGS =====
  const [restaurantName, setRestaurantName] = useState('Restoran Kita')
  const [restaurantLogo, setRestaurantLogo] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  
  // Login page text settings from database
  const [loginWelcomeText, setLoginWelcomeText] = useState('Welcome Back!')
  const [loginSubtitleText, setLoginSubtitleText] = useState('Please sign in to continue')
  const [loginBrandingText, setLoginBrandingText] = useState('POS System for Small & Medium Restaurants')
  const [loginFooterText, setLoginFooterText] = useState('© 2024 Restoran Kita • POS System')

  // ============================================================
  // COMPLETE TRANSLATIONS
  // ============================================================
  const translations = {
    // Login Page
    login_title: { en: 'POS System for Small & Medium Restaurants', ms: 'Sistem POS untuk Restoran Kecil & Sederhana' },
    email: { en: 'Email', ms: 'Emel' },
    password: { en: 'Password', ms: 'Kata Laluan' },
    pin: { en: 'PIN', ms: 'PIN' },
    username: { en: 'Username', ms: 'Nama Pengguna' },
    enter_email: { en: 'Enter email address', ms: 'Masukkan alamat emel' },
    enter_password: { en: 'Enter password', ms: 'Masukkan kata laluan' },
    enter_username: { en: 'Enter username', ms: 'Masukkan nama pengguna' },
    enter_pin: { en: 'Enter PIN', ms: 'Masukkan PIN' },
    login: { en: 'Login', ms: 'Log Masuk' },
    logging_in: { en: 'Logging in...', ms: 'Log masuk...' },
    english: { en: 'Bahasa Melayu', ms: 'English' },
    email_login: { en: 'Email Login', ms: 'Log Masuk Emel' },
    pin_login: { en: 'PIN Login', ms: 'Log Masuk PIN' },
    switch_to_email: { en: 'Login with Email', ms: 'Log Masuk dengan Emel' },
    switch_to_pin: { en: 'Login with PIN', ms: 'Log Masuk dengan PIN' },
    staff_login: { en: 'Staff Login', ms: 'Log Masuk Staff' },
    
    // Error Messages
    enter_credentials: { en: 'Please enter email and password', ms: 'Sila masukkan emel dan kata laluan' },
    enter_pin_credentials: { en: 'Please enter username and PIN', ms: 'Sila masukkan nama pengguna dan PIN' },
    invalid_credentials: { en: 'Invalid email or password', ms: 'Emel atau kata laluan salah' },
    invalid_pin: { en: 'Invalid username or PIN', ms: 'Nama pengguna atau PIN salah' },
    login_error: { en: 'Login error. Please try again.', ms: 'Ralat log masuk. Sila cuba lagi.' },
    welcome: { en: 'Welcome', ms: 'Selamat datang' },
    staff_not_found: { en: 'Staff not found', ms: 'Staff tidak dijumpai' },
    pin_login_disabled: { en: 'This account requires email+password login', ms: 'Akaun ini memerlukan log masuk emel+kata laluan' },
    
    // Footer
    powered_by: { en: 'Powered by', ms: 'Dikuasakan oleh' },
    all_rights_reserved: { en: 'All rights reserved', ms: 'Hak cipta terpelihara' },
  }

  const t = (key) => {
    if (!translations[key]) return key
    return language === 'en' ? translations[key].en : translations[key].ms
  }

  // ============================================================
  // CHECK MOBILE
  // ============================================================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ============================================================
  // THEME COLORS - BLUE THEME
  // ============================================================
  const bgColor = darkMode ? '#0a0a16' : '#eef2ff'
  const cardBg = darkMode ? 'rgba(20, 20, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const textColor = darkMode ? '#f1f5f9' : '#0f172a'
  const textMuted = darkMode ? '#94a3b8' : '#475569'
  const borderColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.4)'
  const inputBg = darkMode ? '#1a1a30' : '#ffffff'
  const inputBorder = darkMode ? '#334155' : '#cbd5e1'
  
  // BLUE THEME GRADIENTS
  const primaryGradient = 'linear-gradient(135deg, #2563eb, #1d4ed8, #1e40af)'
  const primaryGlow = 'rgba(37, 99, 235, 0.4)'
  const secondaryGradient = 'linear-gradient(145deg, #1e293b, #0f172a, #0a0a16)'
  
  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(24px)',
    border: `1px solid ${borderColor}`,
    boxShadow: darkMode 
      ? '0 25px 60px -12px rgba(0,0,0,0.7)' 
      : '0 25px 60px -12px rgba(37, 99, 235, 0.15)'
  }

  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    loadRestaurantInfo()
    loadLoginSettings()
    
    // Check if already logged in
    const savedAuth = sessionStorage.getItem('staffAuth')
    if (savedAuth) {
      try {
        const user = JSON.parse(savedAuth)
        if (user.role) {
          const redirectMap = {
            admin: '/dashboard',
            manager: '/dashboard',
            staff: '/staff',
            cashier: '/staff',
            kitchen: '/kitchen'
          }
          navigate(redirectMap[user.role] || '/staff')
        }
      } catch (e) {}
    }
  }, [])

  async function loadRestaurantInfo() {
    try {
      const { data: nameData } = await supabase.from('settings').select('value').eq('key', 'restaurant_name').single()
      if (nameData) setRestaurantName(nameData.value)
      const { data: logoData } = await supabase.from('settings').select('value').eq('key', 'logo_url').single()
      if (logoData && logoData.value) setRestaurantLogo(logoData.value)
    } catch (err) {
      console.error('Error loading restaurant info:', err)
    }
  }

  async function loadLoginSettings() {
    try {
      const { data: welcomeData } = await supabase.from('settings').select('value').eq('key', 'login_welcome_text').single()
      if (welcomeData) setLoginWelcomeText(welcomeData.value)
      
      const { data: subtitleData } = await supabase.from('settings').select('value').eq('key', 'login_subtitle_text').single()
      if (subtitleData) setLoginSubtitleText(subtitleData.value)
      
      const { data: brandingData } = await supabase.from('settings').select('value').eq('key', 'login_branding_text').single()
      if (brandingData) setLoginBrandingText(brandingData.value)
      
      const { data: footerData } = await supabase.from('settings').select('value').eq('key', 'login_footer_text').single()
      if (footerData) setLoginFooterText(footerData.value)
    } catch (err) {
      console.error('Error loading login settings:', err)
    }
  }

  // ============================================================
  // HANDLE EMAIL LOGIN - SUPABASE AUTH
  // ============================================================
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error(t('enter_credentials'))
      return
    }

    setLoading(true)

    try {
      // 🔐 Login with Supabase Auth using EMAIL
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      if (error) {
        console.error('Auth error:', error)
        toast.error(t('invalid_credentials'))
        setLoading(false)
        return
      }

      // ✅ Get staff details using auth_id - 🔥 TAMBAH permissions
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, username, name, role, permissions, login_method')
        .eq('auth_id', data.user.id)
        .single()

      if (staffError) {
        console.error('Staff fetch error:', staffError)
        toast.error(t('login_error'))
        setLoading(false)
        return
      }

      // 📦 Prepare user data - 🔥 TAMBAH permissions
      const userData = {
        id: staffData.id,
        email: data.user.email,
        username: staffData.username,
        name: staffData.name || staffData.username || 'Staff',
        role: staffData.role || 'staff',
        permissions: staffData.permissions || 'pos',
        login_method: staffData.login_method || 'email_password'
      }
      
      // 💾 Save to sessionStorage
      sessionStorage.setItem('staffAuth', JSON.stringify(userData))
      
      toast.success(`${t('welcome')}, ${userData.name}!`)
      
      // 🚀 Redirect based on role
      setTimeout(() => {
        const redirectMap = {
          admin: '/dashboard',
          manager: '/dashboard',
          staff: '/staff',
          cashier: '/staff',
          kitchen: '/kitchen'
        }
        navigate(redirectMap[userData.role] || '/staff')
      }, 500)

    } catch (err) {
      console.error('Login error:', err)
      toast.error(t('login_error'))
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // HANDLE PIN LOGIN
  // ============================================================
  const handlePinLogin = async (e) => {
    e.preventDefault()
    
    if (!username || !pin) {
      toast.error(t('enter_pin_credentials'))
      return
    }

    setPinLoading(true)

    try {
      // 🔐 Get staff by username - 🔥 TAMBAH permissions
      const { data: staffData, error } = await supabase
        .from('staff')
        .select('id, username, name, role, permissions, pin, login_method')
        .eq('username', username.toLowerCase().trim())
        .single()

      if (error || !staffData) {
        console.error('Staff fetch error:', error)
        toast.error(t('staff_not_found'))
        setPinLoading(false)
        return
      }

      // ✅ Check if login method is PIN
      if (staffData.login_method !== 'pin') {
        toast.error(t('pin_login_disabled'))
        setPinLoading(false)
        return
      }

      // ✅ Verify PIN
      if (staffData.pin !== pin.trim()) {
        toast.error(t('invalid_pin'))
        setPinLoading(false)
        return
      }

      // 📦 Prepare user data - 🔥 TAMBAH permissions
      const userData = {
        id: staffData.id,
        username: staffData.username,
        name: staffData.name || staffData.username || 'Staff',
        role: staffData.role || 'staff',
        permissions: staffData.permissions || 'pos',
        login_method: 'pin'
      }
      
      // 💾 Save to sessionStorage
      sessionStorage.setItem('staffAuth', JSON.stringify(userData))
      
      toast.success(`${t('welcome')}, ${userData.name}!`)
      
      // 🚀 Redirect based on role
      setTimeout(() => {
        const redirectMap = {
          admin: '/dashboard',
          manager: '/dashboard',
          staff: '/staff',
          cashier: '/staff',
          kitchen: '/kitchen'
        }
        navigate(redirectMap[userData.role] || '/staff')
      }, 500)

    } catch (err) {
      console.error('PIN login error:', err)
      toast.error(t('login_error'))
    } finally {
      setPinLoading(false)
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: bgColor, 
      padding: isMobile ? '12px' : '20px',
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      
      {/* ===== ANIMATED BACKGROUND ===== */}
      <div style={{ 
        position: 'absolute', 
        top: '-30%', 
        right: '-20%', 
        width: isMobile ? '300px' : '600px', 
        height: isMobile ? '300px' : '600px', 
        background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0) 70%)', 
        borderRadius: '50%', 
        animation: 'float1 8s ease-in-out infinite' 
      }} />
      <div style={{ 
        position: 'absolute', 
        bottom: '-30%', 
        left: '-20%', 
        width: isMobile ? '250px' : '500px', 
        height: isMobile ? '250px' : '500px', 
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0) 70%)', 
        borderRadius: '50%', 
        animation: 'float2 6s ease-in-out infinite reverse' 
      }} />
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '400px' : '800px', 
        height: isMobile ? '400px' : '800px', 
        background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, rgba(99,102,241,0) 70%)', 
        borderRadius: '50%', 
        animation: 'float3 10s ease-in-out infinite' 
      }} />

      {/* ===== MAIN CONTAINER ===== */}
      <div style={{ 
        ...glassEffect, 
        borderRadius: isMobile ? '24px' : '40px', 
        maxWidth: isMobile ? '100%' : '1100px', 
        width: '100%', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        overflow: 'hidden', 
        animation: 'slideUp 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)' 
      }}>
        
        {/* ===== LEFT SIDE - BRANDING ===== */}
        {!isMobile && (
          <div style={{ 
            flex: 1, 
            background: secondaryGradient, 
            padding: '48px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            textAlign: 'center', 
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative elements */}
            <div style={{ 
              position: 'absolute', 
              top: '-50%', 
              right: '-50%', 
              width: '200%', 
              height: '200%', 
              background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)',
              borderRadius: '50%'
            }} />
            
            {/* Blue accent line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: primaryGradient
            }} />
            
            <div style={{ 
              width: '130px', 
              height: '130px', 
              background: 'rgba(37,99,235,0.1)', 
              borderRadius: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '32px', 
              backdropFilter: 'blur(10px)', 
              border: '1px solid rgba(37,99,235,0.2)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.15)',
              position: 'relative',
              zIndex: 1
            }}>
              {restaurantLogo ? 
                <img src={restaurantLogo} alt={restaurantName} style={{ 
                  width: '80px', 
                  height: '80px', 
                  objectFit: 'contain', 
                  borderRadius: '16px' 
                }} /> : 
                <span style={{ fontSize: '64px' }}>🏪</span>
              }
            </div>
            
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              marginBottom: '12px', 
              letterSpacing: '-0.5px',
              position: 'relative',
              zIndex: 1,
              background: primaryGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {restaurantName}
            </h1>
            
            <p style={{ 
              fontSize: '14px', 
              opacity: 0.7, 
              marginBottom: '32px', 
              maxWidth: '280px',
              position: 'relative',
              zIndex: 1,
              lineHeight: '1.6'
            }}>
              {t('login_title')}
            </p>
            
            <div style={{ 
              width: '60%', 
              height: '1px', 
              background: 'rgba(37,99,235,0.2)', 
              margin: '20px auto',
              position: 'relative',
              zIndex: 1
            }} />
            
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.5,
              position: 'relative',
              zIndex: 1
            }}>
              ⭐ {loginBrandingText}
            </div>

            {/* Decorative dots */}
            <div style={{ 
              position: 'absolute', 
              bottom: '40px', 
              left: '40px',
              display: 'flex',
              gap: '8px',
              opacity: 0.3
            }}>
              <span style={{ width: '6px', height: '6px', background: '#2563eb', borderRadius: '50%' }} />
              <span style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }} />
              <span style={{ width: '6px', height: '6px', background: '#60a5fa', borderRadius: '50%' }} />
            </div>
          </div>
        )}
        
        {/* ===== MOBILE LOGO ===== */}
        {isMobile && (
          <div style={{ 
            textAlign: 'center', 
            padding: '24px 24px 0 24px',
            borderBottom: `1px solid ${borderColor}`
          }}>
            <div style={{ 
              width: '72px', 
              height: '72px', 
              background: primaryGradient, 
              borderRadius: '22px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 12px auto',
              boxShadow: '0 8px 24px rgba(37,99,235,0.3)'
            }}>
              {restaurantLogo ? 
                <img src={restaurantLogo} alt={restaurantName} style={{ 
                  width: '50px', 
                  height: '50px', 
                  objectFit: 'contain', 
                  borderRadius: '12px' 
                }} /> : 
                <span style={{ fontSize: '40px' }}>🏪</span>
              }
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              margin: 0, 
              color: textColor,
              background: primaryGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {restaurantName}
            </h1>
            <p style={{ 
              fontSize: '11px', 
              color: textMuted, 
              marginTop: '4px' 
            }}>
              {t('login_title')}
            </p>
          </div>
        )}
        
        {/* ===== RIGHT SIDE - LOGIN FORM ===== */}
        <div style={{ 
          flex: 1, 
          padding: isMobile ? '24px' : '48px', 
          background: 'transparent' 
        }}>
          
          {/* ===== TOP TOGGLES ===== */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: '10px', 
            marginBottom: isMobile ? '16px' : '32px' 
          }}>
            {/* 🔥 LOGIN METHOD TOGGLE */}
            <div style={{ 
              display: 'flex', 
              background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              borderRadius: '40px',
              padding: '4px',
              border: `1px solid ${borderColor}`
            }}>
              <button
                onClick={() => setLoginMethod('email')}
                style={{
                  padding: isMobile ? '6px 14px' : '8px 20px',
                  borderRadius: '40px',
                  border: 'none',
                  background: loginMethod === 'email' ? primaryGradient : 'transparent',
                  color: loginMethod === 'email' ? 'white' : textColor,
                  cursor: 'pointer',
                  fontWeight: loginMethod === 'email' ? 'bold' : '500',
                  fontSize: isMobile ? '10px' : '12px',
                  transition: 'all 0.3s'
                }}
              >
                📧 {t('email_login')}
              </button>
              <button
                onClick={() => setLoginMethod('pin')}
                style={{
                  padding: isMobile ? '6px 14px' : '8px 20px',
                  borderRadius: '40px',
                  border: 'none',
                  background: loginMethod === 'pin' ? primaryGradient : 'transparent',
                  color: loginMethod === 'pin' ? 'white' : textColor,
                  cursor: 'pointer',
                  fontWeight: loginMethod === 'pin' ? 'bold' : '500',
                  fontSize: isMobile ? '10px' : '12px',
                  transition: 'all 0.3s'
                }}
              >
                🔢 {t('pin_login')}
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={toggleDarkMode} 
                style={{ 
                  background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', 
                  color: textColor, 
                  padding: '8px', 
                  border: `1px solid ${borderColor}`, 
                  borderRadius: '40px', 
                  cursor: 'pointer', 
                  width: '40px', 
                  height: '40px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              <button 
                onClick={() => setLanguage(language === 'bm' ? 'en' : 'bm')} 
                style={{ 
                  background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', 
                  color: textColor, 
                  padding: '8px 18px', 
                  border: `1px solid ${borderColor}`, 
                  borderRadius: '40px', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {language === 'bm' ? '🇺🇸 EN' : '🇲🇾 BM'}
              </button>
            </div>
          </div>
          
          {/* ===== WELCOME TEXT ===== */}
          <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
            <h2 style={{ 
              margin: 0, 
              color: textColor, 
              fontSize: isMobile ? '24px' : '28px', 
              fontWeight: 'bold', 
              letterSpacing: '-0.5px' 
            }}>
              {loginWelcomeText}
            </h2>
            <p style={{ 
              color: textMuted, 
              fontSize: '14px', 
              marginTop: '6px' 
            }}>
              {loginMethod === 'email' ? loginSubtitleText : t('staff_login')}
            </p>
          </div>

          {/* ========================================================== */}
          {/* 🔥 EMAIL LOGIN FORM */}
          {/* ========================================================== */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: textColor, 
                  fontSize: '13px' 
                }}>
                  📧 {t('email')}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    fontSize: '16px', 
                    color: textMuted,
                    opacity: 0.6
                  }}>
                    📧
                  </span>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder={t('enter_email')} 
                    autoComplete="email" 
                    style={{ 
                      width: '100%', 
                      padding: isMobile ? '14px 16px 14px 48px' : '16px 16px 16px 48px', 
                      borderRadius: '24px', 
                      border: `1px solid ${inputBorder}`, 
                      background: inputBg, 
                      color: textColor, 
                      fontSize: isMobile ? '14px' : '15px', 
                      outline: 'none', 
                      transition: 'all 0.25s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => { 
                      e.currentTarget.style.borderColor = '#2563eb'; 
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.12)' 
                    }}
                    onBlur={e => { 
                      e.currentTarget.style.borderColor = inputBorder; 
                      e.currentTarget.style.boxShadow = 'none' 
                    }} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: textColor, 
                  fontSize: '13px' 
                }}>
                  🔒 {t('password')}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    fontSize: '16px', 
                    color: textMuted,
                    opacity: 0.6
                  }}>
                    🔑
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder={t('enter_password')} 
                    autoComplete="current-password"
                    style={{ 
                      width: '100%', 
                      padding: isMobile ? '14px 16px 14px 48px' : '16px 16px 16px 48px', 
                      paddingRight: '50px', 
                      borderRadius: '24px', 
                      border: `1px solid ${inputBorder}`, 
                      background: inputBg, 
                      color: textColor, 
                      fontSize: isMobile ? '14px' : '15px', 
                      outline: 'none', 
                      transition: 'all 0.25s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => { 
                      e.currentTarget.style.borderColor = '#2563eb'; 
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.12)' 
                    }}
                    onBlur={e => { 
                      e.currentTarget.style.borderColor = inputBorder; 
                      e.currentTarget.style.boxShadow = 'none' 
                    }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{ 
                      position: 'absolute', 
                      right: '16px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '18px', 
                      color: textMuted, 
                      padding: '4px',
                      opacity: 0.7,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  padding: isMobile ? '14px' : '16px', 
                  background: primaryGradient, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '60px', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 'bold', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  opacity: loading ? 0.7 : 1, 
                  transition: 'all 0.3s', 
                  boxShadow: `0 8px 24px -4px ${primaryGlow}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(0.98)'
                    e.currentTarget.style.boxShadow = `0 4px 16px -2px ${primaryGlow}`
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = `0 8px 24px -4px ${primaryGlow}`
                  }
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span className="spinner"></span> {t('logging_in')}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span>🔑</span> {t('login')} <span>→</span>
                  </span>
                )}
                
                {/* Shine effect */}
                <span style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
                  animation: 'shine 3s infinite',
                  pointerEvents: 'none'
                }} />
              </button>
            </form>
          )}

          {/* ========================================================== */}
          {/* 🔥 PIN LOGIN FORM */}
          {/* ========================================================== */}
          {loginMethod === 'pin' && (
            <form onSubmit={handlePinLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: textColor, 
                  fontSize: '13px' 
                }}>
                  👤 {t('username')}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    fontSize: '16px', 
                    color: textMuted,
                    opacity: 0.6
                  }}>
                    👤
                  </span>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder={t('enter_username')} 
                    autoComplete="username"
                    style={{ 
                      width: '100%', 
                      padding: isMobile ? '14px 16px 14px 48px' : '16px 16px 16px 48px', 
                      borderRadius: '24px', 
                      border: `1px solid ${inputBorder}`, 
                      background: inputBg, 
                      color: textColor, 
                      fontSize: isMobile ? '14px' : '15px', 
                      outline: 'none', 
                      transition: 'all 0.25s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => { 
                      e.currentTarget.style.borderColor = '#2563eb'; 
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.12)' 
                    }}
                    onBlur={e => { 
                      e.currentTarget.style.borderColor = inputBorder; 
                      e.currentTarget.style.boxShadow = 'none' 
                    }} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: textColor, 
                  fontSize: '13px' 
                }}>
                  🔢 {t('pin')}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    fontSize: '16px', 
                    color: textMuted,
                    opacity: 0.6
                  }}>
                    🔢
                  </span>
                  <input 
                    type={showPin ? 'text' : 'password'} 
                    value={pin} 
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
                    placeholder={t('enter_pin')} 
                    maxLength="6"
                    autoComplete="off"
                    style={{ 
                      width: '100%', 
                      padding: isMobile ? '14px 16px 14px 48px' : '16px 16px 16px 48px', 
                      paddingRight: '50px', 
                      borderRadius: '24px', 
                      border: `1px solid ${inputBorder}`, 
                      background: inputBg, 
                      color: textColor, 
                      fontSize: isMobile ? '14px' : '15px', 
                      outline: 'none', 
                      transition: 'all 0.25s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => { 
                      e.currentTarget.style.borderColor = '#2563eb'; 
                      e.currentTarget.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.12)' 
                    }}
                    onBlur={e => { 
                      e.currentTarget.style.borderColor = inputBorder; 
                      e.currentTarget.style.boxShadow = 'none' 
                    }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPin(!showPin)} 
                    style={{ 
                      position: 'absolute', 
                      right: '16px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontSize: '18px', 
                      color: textMuted, 
                      padding: '4px',
                      opacity: 0.7,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                  >
                    {showPin ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={pinLoading} 
                style={{ 
                  width: '100%', 
                  padding: isMobile ? '14px' : '16px', 
                  background: primaryGradient, 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '60px', 
                  fontSize: isMobile ? '15px' : '16px', 
                  fontWeight: 'bold', 
                  cursor: pinLoading ? 'not-allowed' : 'pointer', 
                  opacity: pinLoading ? 0.7 : 1, 
                  transition: 'all 0.3s', 
                  boxShadow: `0 8px 24px -4px ${primaryGlow}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  if (!pinLoading) {
                    e.currentTarget.style.transform = 'scale(0.98)'
                    e.currentTarget.style.boxShadow = `0 4px 16px -2px ${primaryGlow}`
                  }
                }}
                onMouseLeave={e => {
                  if (!pinLoading) {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = `0 8px 24px -4px ${primaryGlow}`
                  }
                }}
              >
                {pinLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span className="spinner"></span> {t('logging_in')}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span>🔑</span> {t('login')} <span>→</span>
                  </span>
                )}
                
                {/* Shine effect */}
                <span style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
                  animation: 'shine 3s infinite',
                  pointerEvents: 'none'
                }} />
              </button>
            </form>
          )}

          {/* ===== MOBILE BRANDING ===== */}
          {isMobile && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={{ 
                fontSize: '10px', 
                color: textMuted, 
                opacity: 0.6,
                letterSpacing: '0.5px'
              }}>
                ⭐ {loginBrandingText}
              </div>
            </div>
          )}

          {/* ===== FOOTER ===== */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: isMobile ? '20px' : '32px', 
            paddingTop: isMobile ? '14px' : '20px', 
            borderTop: `1px solid ${borderColor}` 
          }}>
            <p style={{ 
              fontSize: '10px', 
              color: textMuted, 
              margin: 0,
              opacity: 0.6,
              letterSpacing: '0.3px'
            }}>
              {loginFooterText.replace('{restaurantName}', restaurantName)}
            </p>
          </div>
        </div>
      </div>

      {/* ===== STYLES ===== */}
      <style>
        {`
          @keyframes slideUp { 
            from { 
              opacity: 0; 
              transform: translateY(40px) scale(0.98); 
            } 
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            } 
          }
          
          @keyframes float1 { 
            0%, 100% { transform: translateY(0) translateX(0); } 
            50% { transform: translateY(-20px) translateX(15px); } 
          }
          
          @keyframes float2 { 
            0%, 100% { transform: translateY(0) translateX(0); } 
            50% { transform: translateY(25px) translateX(-15px); } 
          }
          
          @keyframes float3 { 
            0%, 100% { transform: translate(-50%, -50%) scale(1); } 
            50% { transform: translate(-50%, -50%) scale(1.2); } 
          }
          
          @keyframes shine {
            0% { transform: translateX(-100%) rotate(25deg); }
            100% { transform: translateX(100%) rotate(25deg); }
          }
          
          .spinner { 
            width: 18px; 
            height: 18px; 
            border: 2px solid rgba(255,255,255,0.2); 
            border-top-color: white; 
            border-radius: 50%; 
            animation: spin 0.8s linear infinite; 
            display: inline-block; 
            flex-shrink: 0;
          }
          
          @keyframes spin { 
            to { transform: rotate(360deg); } 
          }
          
          @media (max-width: 480px) {
            input, button {
              font-size: 16px !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default Login