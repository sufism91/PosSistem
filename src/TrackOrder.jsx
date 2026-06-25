import { useState, useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import toast from 'react-hot-toast'
import { supabase } from './lib/supabase'

function TrackOrder() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [restaurantName, setRestaurantName] = useState('Restoran Kita')
  const [logoUrl, setLogoUrl] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  
  const [kitchenEnabled, setKitchenEnabled] = useState(true)
  const [autoCompleteEnabled, setAutoCompleteEnabled] = useState(false)
  const [autoCompleteMinutes, setAutoCompleteMinutes] = useState(5)

  // ============================================================
  // TRANSLATIONS
  // ============================================================
  const translations = {
    track_title: { en: '🔍 Track Your Order', ms: '🔍 Jejak Pesanan Anda' },
    track_subtitle: { en: 'Enter your order number to check status', ms: 'Masukkan nombor pesanan untuk semak status' },
    enter_order: { en: 'Enter order ID or number', ms: 'Masukkan ID atau nombor pesanan' },
    searching: { en: 'Searching...', ms: 'Mencari...' },
    track: { en: '🔍 Track', ms: '🔍 Jejak' },
    order_not_found: { en: 'Order not found', ms: 'Pesanan tidak dijumpai' },
    check_order: { en: 'Please check your order ID or number', ms: 'Sila semak ID atau nombor pesanan anda' },
    order_found: { en: 'Order found!', ms: 'Pesanan dijumpai!' },
    enter_order_error: { en: 'Please enter an order ID or number', ms: 'Sila masukkan ID atau nombor pesanan' },
    error_loading: { en: 'Error loading order. Please try again.', ms: 'Ralat memuat pesanan. Sila cuba lagi.' },
    order_type: { en: 'Order Type', ms: 'Jenis Pesanan' },
    customer: { en: 'Customer', ms: 'Pelanggan' },
    order_items: { en: 'Order Items', ms: 'Item Pesanan' },
    total: { en: 'Total', ms: 'Jumlah' },
    estimated_time: { en: 'Estimated Ready Time', ms: 'Anggaran Masa Siap' },
    almost_ready: { en: 'Almost ready!', ms: 'Hampir siap!' },
    refresh_status: { en: '🔄 Refresh Status', ms: '🔄 Muat Semula Status' },
    auto_refresh: { en: 'Auto-refresh status', ms: 'Muat semula automatik' },
    order: { en: 'Order', ms: 'Pesanan' },
    at: { en: 'at', ms: 'pada' },
    table: { en: 'Table', ms: 'Meja' },
    take_away: { en: 'Take Away', ms: 'Bungkus' },
    dine_in: { en: 'Dine In', ms: 'Makan di sini' },
    guest: { en: 'Guest', ms: 'Tetamu' },
    note: { en: 'Note', ms: 'Nota' },
    minutes: { en: 'minutes', ms: 'minit' },
    cancelled: { en: 'Cancelled', ms: 'Dibatalkan' },
    order_again: { en: '🍽️ Order Again →', ms: '🍽️ Pesan Lagi →' },
    back_to_menu: { en: '📋 Back to Menu', ms: '📋 Kembali ke Menu' },
    pending: { en: 'Pending', ms: 'Menunggu' },
    preparing: { en: 'Preparing', ms: 'Sedang Disiapkan' },
    ready: { en: 'Ready', ms: 'Sedia' },
    completed: { en: 'Completed', ms: 'Selesai' },
    cancelled_status: { en: 'Cancelled', ms: 'Dibatalkan' },
    unknown: { en: 'Unknown', ms: 'Tidak Diketahui' },
    pending_desc: { en: 'Your order has been received and waiting for confirmation.', ms: 'Pesanan anda telah diterima dan menunggu pengesahan dari dapur.' },
    preparing_desc: { en: 'Your order is being prepared in the kitchen.', ms: 'Pesanan anda sedang disediakan di dapur.' },
    ready_desc: { en: 'Your order is ready! Please proceed to counter.', ms: 'Pesanan anda sedia! Sila datang ke kaunter.' },
    completed_desc: { en: 'Order completed. Thank you!', ms: 'Pesanan selesai. Terima kasih!' },
    cancelled_desc: { en: 'This order has been cancelled.', ms: 'Pesanan ini telah dibatalkan.' },
    unknown_desc: { en: 'Status unknown.', ms: 'Status tidak diketahui.' },
    step_received: { en: 'Received', ms: 'Diterima' },
    step_preparing: { en: 'Preparing', ms: 'Disiapkan' },
    step_ready: { en: 'Ready', ms: 'Sedia' },
    step_completed: { en: 'Completed', ms: 'Selesai' },
    auto_complete_info: { en: 'Order will be auto completed in ~', ms: 'Pesanan akan siap secara automatik dalam ~' },
    auto_complete: { en: 'Auto Complete', ms: 'Selesai Automatik' },
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
  // THEME COLORS
  // ============================================================
  const bgColor = darkMode ? '#0a0a16' : '#f1f5f9'
  const cardBg = darkMode ? 'rgba(20, 20, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const textColor = darkMode ? '#e8edf5' : '#1e293b'
  const textMuted = darkMode ? '#94a3b8' : '#64748b'
  const borderColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.5)'
  const inputBg = darkMode ? '#1a1a2e' : '#ffffff'
  const inputBorder = darkMode ? '#3d3d5c' : '#cbd5e1'
  const inputText = darkMode ? '#e8edf5' : '#1e293b'
  const secondaryBg = darkMode ? 'rgba(30, 30, 50, 0.6)' : 'rgba(248, 250, 252, 0.8)'
  
  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${borderColor}`,
    boxShadow: darkMode 
      ? '0 8px 40px rgba(0,0,0,0.5)' 
      : '0 8px 40px rgba(0,0,0,0.06)'
  }

  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const orderParam = urlParams.get('order')
    if (orderParam) {
      setOrderNumber(orderParam)
      loadOrder(orderParam)
    }
    loadRestaurantInfo()
    loadSettings()
  }, [])

  // Auto refresh
  useEffect(() => {
    let interval
    if (autoRefresh && order && order.payment_status !== 'paid' && order.status !== 'completed' && order.status !== 'cancelled') {
      interval = setInterval(() => {
        if (orderNumber) {
          loadOrder(orderNumber, true)
        }
      }, 10000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [autoRefresh, order, orderNumber])

  // ============================================================
  // LOAD FUNCTIONS
  // ============================================================
  async function loadRestaurantInfo() {
    try {
      const { data: nameData } = await supabase.from('settings').select('value').eq('key', 'restaurant_name').single()
      if (nameData) setRestaurantName(nameData.value)
      
      const { data: logoData } = await supabase.from('settings').select('value').eq('key', 'logo_url').single()
      if (logoData && logoData.value) setLogoUrl(logoData.value)
    } catch (err) {
      console.error('Error loading restaurant info:', err)
    }
  }

  async function loadSettings() {
    try {
      const { data } = await supabase.from('settings').select('key, value')
      if (data) {
        const kitchen = data.find(s => s.key === 'kitchen_enabled')
        const autoComplete = data.find(s => s.key === 'auto_complete_enabled')
        const autoCompleteMin = data.find(s => s.key === 'auto_complete_minutes')
        
        if (kitchen) setKitchenEnabled(kitchen.value === 'true')
        if (autoComplete) setAutoCompleteEnabled(autoComplete.value === 'true')
        if (autoCompleteMin) setAutoCompleteMinutes(parseInt(autoCompleteMin.value) || 5)
        
        console.log('✅ Settings loaded:', { kitchenEnabled: kitchen?.value, autoCompleteEnabled: autoComplete?.value, autoCompleteMinutes: autoCompleteMin?.value })
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  async function loadOrder(searchValue, isAutoRefresh = false) {
    if (!searchValue) return
    
    setLoading(true)
    if (!isAutoRefresh) setError('')
    
    try {
      const isUUID = searchValue.includes('-') && searchValue.length > 20
      
      let query = supabase
        .from('customer_orders')
        .select('*')
      
      if (isUUID) {
        query = query.eq('id', searchValue)
      } else {
        query = query.eq('order_number', searchValue)
      }
      
      const { data, error } = await query.single()

      if (error || !data) {
        let fallbackQuery = supabase
          .from('customer_orders')
          .select('*')
        
        if (isUUID) {
          fallbackQuery = fallbackQuery.eq('order_number', searchValue)
        } else {
          fallbackQuery = fallbackQuery.eq('id', searchValue)
        }
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery.single()
        
        if (fallbackError || !fallbackData) {
          const { data: likeData, error: likeError } = await supabase
            .from('customer_orders')
            .select('*')
            .ilike('order_number', `%${searchValue}%`)
            .limit(1)
          
          if (likeError || !likeData || likeData.length === 0) {
            setError(`${t('order_not_found')}. ${t('check_order')}`)
            setOrder(null)
            if (!isAutoRefresh) {
              toast.error(t('order_not_found'))
            }
            setLoading(false)
            return
          }
          
          setOrder(likeData[0])
          if (!isAutoRefresh) {
            toast.success(t('order_found'))
          }
        } else {
          setOrder(fallbackData)
          if (!isAutoRefresh) {
            toast.success(t('order_found'))
          }
        }
      } else {
        setOrder(data)
        if (!isAutoRefresh) {
          toast.success(t('order_found'))
        }
      }
    } catch (err) {
      console.error('Error loading order:', err)
      setError(t('error_loading'))
    }
    setLoading(false)
    setSearchPerformed(true)
  }

  // ============================================================
  // HANDLE SEARCH
  // ============================================================
  const handleSearch = (e) => {
    e.preventDefault()
    if (!orderNumber.trim()) {
      setError(t('enter_order_error'))
      return
    }
    loadOrder(orderNumber.trim())
  }

  // ============================================================
  // GO TO MENU - Fixed path
  // ============================================================
  const goToMenu = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const tableFromUrl = urlParams.get('table')
    const tableNumber = order?.table_number || tableFromUrl || '1'
    window.location.href = `/menu?table=${tableNumber}`
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const getStatusInfo = (status) => {
    switch(status) {
      case 'new':
        return { 
          label: '🆕 Baru Diterima', 
          color: '#3b82f6', 
          icon: '📋', 
          step: 1, 
          description: 'Pesanan baru diterima, menunggu pengesahan dapur.' 
        }
      case 'pending':
        return { 
          label: '⏳ Menunggu', 
          color: '#eab308', 
          icon: '⏳', 
          step: 1, 
          description: 'Pesanan anda sedang menunggu pengesahan.' 
        }
      case 'preparing':
        return { 
          label: '🔪 Sedang Disiapkan', 
          color: '#f97316', 
          icon: '🔪', 
          step: 2, 
          description: 'Pesanan anda sedang disediakan di dapur.' 
        }
      case 'ready':
        return { 
          label: '✅ Sedia', 
          color: '#22c55e', 
          icon: '✅', 
          step: 3, 
          description: 'Pesanan anda sedia! Sila datang ke kaunter.' 
        }
      case 'completed':
        return { 
          label: '📦 Selesai', 
          color: '#3b82f6', 
          icon: '📦', 
          step: 4, 
          description: 'Pesanan selesai. Terima kasih!' 
        }
      case 'cancelled':
        return { 
          label: '❌ Dibatalkan', 
          color: '#ef4444', 
          icon: '❌', 
          step: 0, 
          description: 'Pesanan ini telah dibatalkan.' 
        }
      default:
        return { 
          label: '❓ Tidak Diketahui', 
          color: '#6c757d', 
          icon: '❓', 
          step: 0, 
          description: 'Status tidak diketahui.' 
        }
    }
  }

  const getEstimatedTime = (createdAt, status) => {
    if (status === 'ready' || status === 'completed') {
      return '✅ Sedia / Selesai'
    }
    
    if (status === 'cancelled') {
      return '❌ Dibatalkan'
    }
    
    if (!kitchenEnabled && autoCompleteEnabled) {
      return `⏱️ ~${autoCompleteMinutes} minit (Auto Complete)`
    }
    
    try {
      const created = new Date(createdAt)
      const now = new Date()
      const elapsedMinutes = Math.floor((now - created) / 60000)
      const totalEstimated = 15
      const remaining = totalEstimated - elapsedMinutes
      
      if (remaining <= 0) {
        return '🟢 Hampir siap!'
      }
      return `⏱️ ~${remaining} minit lagi`
    } catch (e) {
      return '🟢 Hampir siap!'
    }
  }

  const getOrderTypeText = () => {
    if (!order) return ''
    if (order.order_type === 'take_away') return `🥡 ${t('take_away')}`
    if (order.table_number && order.table_number > 0) return `🍽️ ${t('table')} ${order.table_number}`
    return '🍽️ ' + t('dine_in')
  }

  const formatTime = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('ms-MY', { 
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (e) {
      return '-'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ms-MY', { 
        timeZone: 'Asia/Kuala_Lumpur',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (e) {
      return '-'
    }
  }

  // ============================================================
  // STEP BAR COMPONENT - RINGKAS & TIDAK MENGHALANG
  // ============================================================
  const StepBar = ({ currentStep }) => {
    const steps = [
      { step: 1, label: t('step_received'), icon: '📋' },
      { step: 2, label: t('step_preparing'), icon: '🔪' },
      { step: 3, label: t('step_ready'), icon: '✅' },
      { step: 4, label: t('step_completed'), icon: '📦' }
    ]

    return (
      <div style={{ marginBottom: '12px', padding: '0 4px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          position: 'relative'
        }}>
          {steps.map((step, index) => {
            const isActive = currentStep >= step.step
            const isLast = index === steps.length - 1
            
            return (
              <div key={step.step} style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative'
              }}>
                {!isLast && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    right: '-50%',
                    height: '2px',
                    background: currentStep > step.step ? '#22c55e' : '#e2e8f0',
                    zIndex: 0
                  }} />
                )}
                
                <div style={{
                  width: isMobile ? '24px' : '28px',
                  height: isMobile ? '24px' : '28px',
                  borderRadius: '50%',
                  background: isActive ? '#22c55e' : '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '10px' : '12px',
                  transition: 'all 0.3s',
                  boxShadow: isActive 
                    ? '0 2px 8px rgba(34,197,94,0.2)' 
                    : 'none',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {step.icon}
                </div>
                
                <div style={{ 
                  fontSize: isMobile ? '7px' : '9px', 
                  color: isActive ? '#22c55e' : textMuted, 
                  fontWeight: isActive ? '600' : '400',
                  marginTop: '3px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.2px'
                }}>
                  {step.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: bgColor, 
      padding: isMobile ? '16px' : '24px' 
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* ===== HEADER ===== */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={restaurantName} 
                style={{ 
                  height: isMobile ? '32px' : '40px', 
                  width: 'auto', 
                  borderRadius: '8px',
                  objectFit: 'contain'
                }} 
              />
            ) : (
              <span style={{ fontSize: isMobile ? '28px' : '32px' }}>🏪</span>
            )}
            <h1 style={{ 
              margin: 0, 
              color: textColor, 
              fontSize: isMobile ? '16px' : '20px', 
              fontWeight: 'bold' 
            }}>
              {restaurantName}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={toggleDarkMode} 
              style={{ 
                background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', 
                border: `1px solid ${borderColor}`, 
                borderRadius: '30px', 
                padding: isMobile ? '6px 10px' : '6px 12px', 
                cursor: 'pointer', 
                fontSize: isMobile ? '12px' : '14px',
                transition: 'all 0.2s',
                color: textColor
              }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={() => setLanguage(language === 'bm' ? 'en' : 'bm')} 
              style={{ 
                background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', 
                border: `1px solid ${borderColor}`, 
                borderRadius: '30px', 
                padding: isMobile ? '6px 10px' : '6px 12px', 
                cursor: 'pointer', 
                fontSize: isMobile ? '12px' : '14px',
                transition: 'all 0.2s',
                fontWeight: 'bold',
                color: textColor
              }}
            >
              {language === 'bm' ? '🇺🇸 EN' : '🇲🇾 BM'}
            </button>
          </div>
        </div>

        {/* ===== TITLE ===== */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ 
            color: textColor, 
            fontSize: isMobile ? '20px' : '24px', 
            fontWeight: 'bold', 
            marginBottom: '6px' 
          }}>
            {t('track_title')}
          </h2>
          <p style={{ 
            color: textMuted, 
            fontSize: isMobile ? '12px' : '14px' 
          }}>
            {t('track_subtitle')}
          </p>
        </div>

        {/* ===== SEARCH FORM ===== */}
        <div style={{ 
          ...glassEffect, 
          borderRadius: '24px', 
          padding: isMobile ? '16px' : '24px', 
          marginBottom: '20px' 
        }}>
          <form onSubmit={handleSearch}>
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              flexWrap: 'wrap', 
              flexDirection: isMobile ? 'column' : 'row' 
            }}>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder={`${t('enter_order')}`}
                style={{
                  flex: 2,
                  padding: isMobile ? '12px 16px' : '14px 16px',
                  borderRadius: '50px',
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: inputText,
                  fontSize: isMobile ? '14px' : '14px',
                  outline: 'none',
                  width: '100%',
                  transition: 'all 0.2s'
                }}
                onFocus={e => { 
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
                }}
                onBlur={e => { 
                  e.currentTarget.style.borderColor = inputBorder
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: isMobile ? '12px 16px' : '14px 24px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  opacity: loading ? 0.7 : 1,
                  fontSize: isMobile ? '14px' : '14px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.3)'
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(0.97)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.2)'
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,130,246,0.3)'
                  }
                }}
              >
                {loading ? `⏳ ${t('searching')}` : `🔍 ${t('track')}`}
              </button>
            </div>
          </form>

          {error && (
            <div style={{ 
              marginTop: '14px', 
              padding: '10px 14px', 
              background: darkMode ? 'rgba(239,68,68,0.15)' : '#fee2e2', 
              color: darkMode ? '#f87171' : '#991b1b', 
              borderRadius: '12px', 
              textAlign: 'center', 
              fontSize: isMobile ? '12px' : '13px',
              border: `1px solid ${darkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.2)'}`
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* ===== AUTO REFRESH ===== */}
        {order && order.status !== 'completed' && order.status !== 'cancelled' && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '20px' 
          }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              cursor: 'pointer' 
            }}>
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={(e) => setAutoRefresh(e.target.checked)} 
                style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
              />
              <span style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: textMuted 
              }}>
                🔄 {t('auto_refresh')}
              </span>
            </label>
          </div>
        )}

        {/* ===== ORDER DETAILS ===== */}
        {order && searchPerformed && !error && (
          <div style={{ 
            ...glassEffect, 
            borderRadius: '24px', 
            padding: isMobile ? '16px' : '24px',
            animation: 'popIn 0.3s ease'
          }}>
            
            {/* Status Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                display: 'inline-block',
                background: getStatusInfo(order.status).color,
                color: 'white',
                padding: isMobile ? '4px 14px' : '6px 18px',
                borderRadius: '40px',
                fontSize: isMobile ? '11px' : '13px',
                fontWeight: 'bold',
                marginBottom: '8px',
                boxShadow: `0 2px 8px ${getStatusInfo(order.status).color}40`
              }}>
                {getStatusInfo(order.status).icon} {getStatusInfo(order.status).label}
              </div>
              <h3 style={{ 
                margin: 0, 
                color: textColor, 
                fontSize: isMobile ? '14px' : '16px', 
                fontWeight: 'bold' 
              }}>
                {t('order')} #{order.order_number || order.id}
              </h3>
              <p style={{ 
                color: textMuted, 
                fontSize: isMobile ? '9px' : '11px', 
                marginTop: '2px' 
              }}>
                {formatDate(order.created_at)} {t('at')} {formatTime(order.created_at)}
              </p>
            </div>

            {/* Auto Complete Info */}
            {order.status === 'pending' && !kitchenEnabled && autoCompleteEnabled && (
              <div style={{ 
                background: darkMode ? 'rgba(59,130,246,0.15)' : '#e0f2fe', 
                borderRadius: '10px', 
                padding: '8px 12px', 
                marginBottom: '12px', 
                textAlign: 'center',
                border: `1px solid ${darkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.2)'}`
              }}>
                <span style={{ 
                  fontSize: isMobile ? '10px' : '11px', 
                  color: darkMode ? '#60a5fa' : '#0369a1' 
                }}>
                  ⏱️ {t('auto_complete_info')} {autoCompleteMinutes} {t('minutes')}
                </span>
              </div>
            )}

            {/* Step Bar - RINGKAS */}
            {order.status !== 'cancelled' && (
              <StepBar currentStep={getStatusInfo(order.status).step} />
            )}

            {/* Estimated Time */}
            {order.status !== 'cancelled' && (
              <div style={{ 
                background: secondaryBg, 
                borderRadius: '12px', 
                padding: isMobile ? '8px 12px' : '10px 14px', 
                textAlign: 'center', 
                marginBottom: '12px' 
              }}>
                <span style={{ 
                  fontSize: isMobile ? '10px' : '11px', 
                  color: textMuted 
                }}>
                  🕐 {t('estimated_time')}
                </span>
                <div style={{ 
                  fontSize: isMobile ? '13px' : '15px', 
                  fontWeight: 'bold', 
                  color: '#22c55e', 
                  marginTop: '2px' 
                }}>
                  {getEstimatedTime(order.created_at, order.status)}
                </div>
              </div>
            )}

            {/* Order Info */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '6px 0', 
                borderBottom: `1px solid ${borderColor}`, 
                fontSize: isMobile ? '12px' : '13px' 
              }}>
                <span style={{ color: textMuted }}>{t('order_type')}:</span>
                <span style={{ color: textColor, fontWeight: 'bold' }}>{getOrderTypeText()}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '6px 0', 
                borderBottom: `1px solid ${borderColor}`, 
                fontSize: isMobile ? '12px' : '13px' 
              }}>
                <span style={{ color: textMuted }}>{t('customer')}:</span>
                <span style={{ color: textColor, fontWeight: 'bold' }}>{order.customer_name || t('guest')}</span>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ 
                color: textColor, 
                fontSize: isMobile ? '12px' : '13px', 
                fontWeight: 'bold', 
                marginBottom: '8px' 
              }}>
                🛒 {t('order_items')}
              </h4>
              <div style={{ 
                background: secondaryBg, 
                borderRadius: '12px', 
                padding: '8px' 
              }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '4px 0', 
                    borderBottom: idx !== order.items.length - 1 ? `1px solid ${borderColor}` : 'none', 
                    fontSize: isMobile ? '11px' : '12px' 
                  }}>
                    <span style={{ color: textColor }}>{item.name} x{item.quantity}</span>
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                      RM {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{ 
              background: secondaryBg, 
              borderRadius: '12px', 
              padding: isMobile ? '8px 12px' : '10px 14px', 
              marginBottom: '12px' 
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 'bold', 
                fontSize: isMobile ? '13px' : '14px' 
              }}>
                <span style={{ color: textColor }}>{t('total')}:</span>
                <span style={{ color: '#22c55e' }}>
                  RM {(order.total || order.grand_total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div style={{ 
                background: darkMode ? 'rgba(245,158,11,0.15)' : '#fef3c7', 
                borderRadius: '10px', 
                padding: '8px 12px', 
                marginBottom: '12px',
                border: `1px solid ${darkMode ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.2)'}`
              }}>
                <span style={{ 
                  fontSize: isMobile ? '9px' : '10px', 
                  color: darkMode ? '#fbbf24' : '#92400e' 
                }}>
                  📝 {t('note')}: {order.notes}
                </span>
              </div>
            )}

            {/* Status Description */}
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <p style={{ 
                fontSize: isMobile ? '10px' : '11px', 
                color: textMuted 
              }}>
                {getStatusInfo(order.status).description}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: '12px', 
              display: 'flex', 
              gap: '8px', 
              justifyContent: 'center', 
              flexDirection: isMobile ? 'column' : 'row' 
            }}>
              <button
                onClick={() => loadOrder(orderNumber)}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  color: 'white',
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '11px' : '12px',
                  flex: 1,
                  transition: 'all 0.2s',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(0.97)'
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1)'
                  }
                }}
              >
                🔄 {t('refresh_status')}
              </button>
              
              <button
                onClick={goToMenu}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  color: 'white',
                  padding: isMobile ? '8px 16px' : '10px 20px',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '11px' : '12px',
                  flex: 1,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(245,158,11,0.3)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(0.97)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(245,158,11,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.3)'
                }}
              >
                {order.status === 'completed' || order.status === 'cancelled' ? t('order_again') : t('back_to_menu')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* STYLES */}
      {/* ========================================================== */}
      <style>
        {`
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.95) translateY(10px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          
          ::-webkit-scrollbar { 
            width: 6px; 
          }
          
          ::-webkit-scrollbar-track { 
            background: ${darkMode ? '#1a1a2e' : '#e2e8f0'}; 
            border-radius: 10px; 
          }
          
          ::-webkit-scrollbar-thumb { 
            background: ${darkMode ? '#3d3d5c' : '#94a3b8'}; 
            border-radius: 10px; 
          }
          
          button, input { 
            transition: all 0.2s ease; 
          }
          
          input:focus { 
            outline: none; 
          }
        `}
      </style>
    </div>
  )
}

export default TrackOrder