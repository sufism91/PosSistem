import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect, Suspense, lazy } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import { supabase } from './lib/supabase'
import toast from 'react-hot-toast'

// ===== IMPORT SYSTEM LOGS =====
import { logActivity, LOG_ACTIONS } from './utils/systemLogs'

// Lazy load components for better performance
const StaffApp = lazy(() => import('./StaffApp'))
const CustomerMenu = lazy(() => import('./CustomerMenu'))
const CustomerDisplay = lazy(() => import('./CustomerDisplay'))
const AdminReport = lazy(() => import('./AdminReport'))
const ProtectedRoute = lazy(() => import('./ProtectedRoute'))
const ManageMenu = lazy(() => import('./ManageMenu'))
const ManageCategories = lazy(() => import('./ManageCategories'))
const ManageStaff = lazy(() => import('./ManageStaff'))
const ManageSettings = lazy(() => import('./ManageSettings'))
const ManageTables = lazy(() => import('./ManageTables'))
const TableQRs = lazy(() => import('./TableQRs'))
const KitchenApp = lazy(() => import('./KitchenApp'))
const Dashboard = lazy(() => import('./Dashboard'))
const Login = lazy(() => import('./Login'))
const TrackOrder = lazy(() => import('./TrackOrder'))

// ============================================================
// LOADING COMPONENT
// ============================================================
function LoadingSpinner() {
  const { darkMode } = useTheme()
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: darkMode ? '#0a0a16' : '#f0f4f8',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="spinner-global"></div>
      <p style={{
        color: darkMode ? '#94a3b8' : '#64748b',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        Loading...
      </p>
      <style>
        {`
          .spinner-global {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(59,130,246,0.15);
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin-global 1s linear infinite;
          }
          @keyframes spin-global {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

// ============================================================
// WRAPPED COMPONENT WITH CONTEXTS
// ============================================================
function AppWrapper() {
  const { darkMode } = useTheme()
  const { language } = useLanguage()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Track page views
  useEffect(() => {
    console.log(`📍 Page: ${location.pathname}`)
  }, [location])

  // ============================================================
  // TELEGRAM NOTIFICATION - REALTIME (FULLY FIXED)
  // ============================================================
  useEffect(() => {
    let isMounted = true
    let subscription = null
    let lastOrderId = null
    let lastOrderTime = 0

    async function sendTelegramNotification(order) {
      // CEK DUPLIKAT
      if (order.id === lastOrderId && Date.now() - lastOrderTime < 3000) {
        console.log('⚠️ Duplicate order detected, skipping Telegram...')
        return
      }
      
      lastOrderId = order.id
      lastOrderTime = Date.now()
      
      try {
        console.log('📨 Sending Telegram notification for order:', order.id)
        
        const { data: settings, error } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', [
            'telegram_enabled',
            'telegram_bot_token', 
            'telegram_chat_id',
            'telegram_notify_new_order'
          ])

        if (error) {
          console.error('Error getting settings:', error)
          return
        }

        const config = {}
        settings.forEach(item => {
          if (['telegram_enabled', 'telegram_notify_new_order'].includes(item.key)) {
            config[item.key] = item.value === 'true'
          } else {
            config[item.key] = item.value
          }
        })

        if (!config.telegram_enabled || !config.telegram_notify_new_order) {
          console.log('Telegram notification disabled')
          return
        }

        if (!config.telegram_bot_token || !config.telegram_chat_id) {
          console.log('Telegram token or chat ID missing')
          return
        }

        const orderItems = order.items || []
        
        // FORMAT ITEM DENGAN SEMUA DETAIL
        let itemList = ''
        let hasItems = false
        
        if (orderItems.length > 0) {
          const promoItems = orderItems.filter(item => item.is_promo_item === true)
          const regularItems = orderItems.filter(item => !item.is_promo_item && !item.is_free)
          const freeItems = orderItems.filter(item => item.is_free === true)
          
          // REGULAR ITEMS
          if (regularItems.length > 0) {
            itemList += '  📌 <b>Item Pesanan:</b>\n'
            regularItems.forEach(item => {
              let line = `  • ${item.name}`
              
              if (item.option_name || item.option) {
                const opt = item.option_name || item.option
                const emoji = opt === 'Panas' ? '🔥' : opt === 'Sejuk' ? '🧊' : opt === 'Bungkus' ? '📦' : ''
                line += ` ${emoji}(${opt})`
              }
              
              if (item.size || item.size_name) {
                line += ` [${item.size || item.size_name}]`
              }
              
              const qty = item.quantity || 1
              const price = item.price || 0
              line += `\n    x${qty} = RM ${(price * qty).toFixed(2)}`
              
              if (item.addons) {
                let addonText = item.addons
                if (Array.isArray(item.addons)) {
                  addonText = item.addons.join(', ')
                }
                const addonPrice = item.addon_total || 0
                if (addonPrice > 0) {
                  line += `\n    ✨ Add-On: ${addonText} (+RM ${addonPrice.toFixed(2)})`
                } else {
                  line += `\n    ✨ Add-On: ${addonText}`
                }
              }
              
              itemList += line + '\n'
            })
            hasItems = true
          }
          
          // PROMO BUNDLE/SET ITEMS
          const promoBundleItems = orderItems.filter(item => 
            item.is_promo_item === true && 
            (item.promo_type === 'bundle' || item.promo_type === 'set_menu')
          )
          
          if (promoBundleItems.length > 0) {
            if (hasItems) itemList += '\n'
            itemList += '  🏷️ <b>Promosi Bundle/Set:</b>\n'
            
            const promoGroups = {}
            promoBundleItems.forEach(item => {
              const key = item.promo_name || 'Promo'
              if (!promoGroups[key]) promoGroups[key] = []
              promoGroups[key].push(item)
            })
            
            Object.entries(promoGroups).forEach(([promoName, items]) => {
              const promoItem = items.find(i => i.price > 0) || items[0]
              const totalPrice = promoItem.price || 0
              
              itemList += `  • ${promoName}\n`
              items.forEach(item => {
                itemList += `    - ${item.name}`
                if (item.original_price) {
                  itemList += ` (RM ${item.original_price.toFixed(2)})`
                }
                itemList += '\n'
              })
              itemList += `    💰 Harga Promo: RM ${totalPrice.toFixed(2)}\n`
            })
            hasItems = true
          }
          
          // FREE ITEMS (BOGO)
          if (freeItems.length > 0) {
            if (hasItems) itemList += '\n'
            itemList += '  🎁 <b>Item Percuma (BOGO):</b>\n'
            freeItems.forEach(item => {
              let line = `  • ${item.name}`
              if (item.promo_name) {
                line += ` (${item.promo_name})`
              }
              line += `\n    🆓 PERCUMA!`
              if (item.original_price) {
                line += ` (Asal RM ${item.original_price.toFixed(2)})`
              }
              itemList += line + '\n'
            })
            hasItems = true
          }
          
          // TRIGGER ITEMS FOR BOGO
          const triggerItems = orderItems.filter(item => 
            item.is_promo_item === true && 
            item.promo_type === 'bogo' && 
            !item.is_free
          )
          
          if (triggerItems.length > 0) {
            if (hasItems) itemList += '\n'
            itemList += '  🛒 <b>Item Dibeli (BOGO):</b>\n'
            triggerItems.forEach(item => {
              let line = `  • ${item.name}`
              if (item.promo_name) {
                line += ` (${item.promo_name})`
              }
              const qty = item.quantity || 1
              const price = item.price || 0
              line += `\n    x${qty} = RM ${(price * qty).toFixed(2)}`
              itemList += line + '\n'
            })
            hasItems = true
          }
          
          // OTHER PROMO ITEMS
          const otherPromoItems = orderItems.filter(item => 
            item.is_promo_item === true && 
            !item.promo_type && 
            item.promo_name
          )
          
          if (otherPromoItems.length > 0) {
            if (hasItems) itemList += '\n'
            itemList += '  🏷️ <b>Promosi Lain:</b>\n'
            otherPromoItems.forEach(item => {
              let line = `  • ${item.name}`
              if (item.promo_name) {
                line += ` (${item.promo_name})`
              }
              const qty = item.quantity || 1
              const price = item.price || 0
              line += `\n    x${qty} = RM ${(price * qty).toFixed(2)}`
              if (item.original_price) {
                line += ` (Asal RM ${(item.original_price * qty).toFixed(2)})`
              }
              itemList += line + '\n'
            })
            hasItems = true
          }
          
          if (!hasItems) {
            itemList = '  • Tiada item'
          }
          
        } else {
          itemList = '  • Tiada item'
        }

        const totalAmount = order.total || order.total_amount || 0

        const message = `
🆕 <b>PESANAN BARU!</b>
━━━━━━━━━━━━━━━━━━━━━

🧾 <b>Order #:</b> ${order.order_number || order.id || 'N/A'}
👤 <b>Pelanggan:</b> ${order.customer_name || 'Walk-in'}
🪑 <b>Meja:</b> ${order.table_number || 'N/A'}
📋 <b>Item:</b>
${itemList}
━━━━━━━━━━━━━━━━━━━━━
💰 <b>JUMLAH:</b> RM ${totalAmount.toFixed(2)}
⏰ <b>Masa:</b> ${new Date().toLocaleString('ms-MY', { hour12: false })}
📌 <b>Status:</b> ${order.status || order.order_status || 'Menunggu'}

━━━━━━━━━━━━━━━━━━━━━
🔗 Sila semak di sistem POS.
        `

        console.log('📨 Sending to Telegram...')

        const response = await fetch(
          `https://api.telegram.org/bot${config.telegram_bot_token}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: config.telegram_chat_id,
              text: message,
              parse_mode: 'HTML',
            }),
          }
        )

        const result = await response.json()

        if (result.ok) {
          console.log('✅ Telegram notification sent successfully!')
          await logActivity(LOG_ACTIONS.ORDER_CREATED, `Order #${order.order_number || order.id} created`, 'System')
        } else {
          console.error('❌ Telegram error:', result.description)
        }
      } catch (error) {
        console.error('❌ Send notification error:', error)
      }
    }

    // Subscribe to new orders (REALTIME)
    if (isMounted) {
      subscription = supabase
        .channel('telegram-orders-channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'customer_orders',
          },
          async (payload) => {
            if (!isMounted) return
            console.log('🆕 New order detected!', payload.new.id)
            await sendTelegramNotification(payload.new)
          }
        )
        .subscribe((status) => {
          console.log('📡 Telegram subscription status:', status)
        })
    }

    return () => {
      console.log('🔌 Unsubscribing from Telegram channel')
      isMounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  // ============================================================
  // COMPLETE TRANSLATIONS FOR APP
  // ============================================================
  const translations = {
    app_title: { en: 'KedaiPOS - Restaurant POS System', ms: 'KedaiPOS - Sistem POS Restoran' },
    loading: { en: 'Loading...', ms: 'Memuatkan...' },
    page_not_found: { en: 'Page Not Found', ms: 'Halaman Tidak Dijumpai' },
    go_back: { en: '← Go Back', ms: '← Kembali' },
    go_home: { en: '🏠 Go Home', ms: '🏠 Ke Laman Utama' },
  }

  const t = (key) => {
    if (!translations[key]) return key
    return language === 'en' ? translations[key].en : translations[key].ms
  }

  // ============================================================
  // THEME COLORS
  // ============================================================
  const bgColor = darkMode ? '#0a0a16' : '#f0f4f8'
  const textColor = darkMode ? '#f1f5f9' : '#0f172a'
  const textMuted = darkMode ? '#94a3b8' : '#64748b'
  const borderColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.5)'
  const cardBg = darkMode ? 'rgba(20, 20, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  
  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${borderColor}`,
    boxShadow: darkMode 
      ? '0 8px 40px rgba(0, 0, 0, 0.5)' 
      : '0 8px 40px rgba(0, 0, 0, 0.06)'
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/login" element={<Login />} />
        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/display" element={<CustomerDisplay />} />
        <Route path="/track" element={<TrackOrder />} />
        
        {/* ========================================================== */}
        {/* 🔥 PROTECTED ROUTES - ROLE BASED ACCESS */}
        {/* ========================================================== */}
        
        {/* Dashboard - Admin & Manager sahaja */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Staff POS - Admin, Manager, Cashier, Staff sahaja */}
        <Route 
          path="/staff" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier', 'staff']}>
              <StaffApp />
            </ProtectedRoute>
          } 
        />
        
        {/* Kitchen - Admin, Manager, Kitchen sahaja */}
        <Route 
          path="/kitchen" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'kitchen']}>
              <KitchenApp />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Report - Admin sahaja */}
        <Route 
          path="/admin-report" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReport />
            </ProtectedRoute>
          } 
        />
        
        {/* Manage Menu - Admin & Manager sahaja */}
        <Route 
          path="/manage-menu" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <ManageMenu />
            </ProtectedRoute>
          } 
        />
        
        {/* Manage Categories - Admin & Manager sahaja */}
        <Route 
          path="/manage-categories" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <ManageCategories />
            </ProtectedRoute>
          } 
        />
        
        {/* Manage Staff - Admin SAHAJA */}
        <Route 
          path="/manage-staff" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageStaff />
            </ProtectedRoute>
          } 
        />
        
        {/* Manage Tables - Admin & Manager sahaja */}
        <Route 
          path="/manage-tables" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <ManageTables />
            </ProtectedRoute>
          } 
        />
        
        {/* Table QR - Admin & Manager sahaja */}
        <Route 
          path="/table-qrs" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <TableQRs />
            </ProtectedRoute>
          } 
        />
        
        {/* Manage Settings - Admin SAHAJA */}
        <Route 
          path="/manage-settings" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageSettings />
            </ProtectedRoute>
          } 
        />
        
        {/* ===== DEFAULT ROUTES ===== */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* ===== 404 NOT FOUND ===== */}
        <Route 
          path="*" 
          element={
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: bgColor,
              padding: isMobile ? '20px' : '40px',
              textAlign: 'center'
            }}>
              <div style={{
                ...glassEffect,
                borderRadius: '28px',
                padding: isMobile ? '32px' : '48px',
                maxWidth: '420px',
                width: '100%'
              }}>
                <div style={{ fontSize: isMobile ? '64px' : '80px', marginBottom: '16px' }}>
                  🔍
                </div>
                <h1 style={{
                  color: textColor,
                  fontSize: isMobile ? '24px' : '32px',
                  fontWeight: 'bold',
                  margin: '0 0 8px 0'
                }}>
                  404
                </h1>
                <p style={{
                  color: textMuted,
                  fontSize: isMobile ? '14px' : '16px',
                  margin: '0 0 24px 0'
                }}>
                  {t('page_not_found')}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => window.history.back()}
                    style={{
                      padding: isMobile ? '10px 20px' : '12px 28px',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '40px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '13px' : '14px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {t('go_back')}
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    style={{
                      padding: isMobile ? '10px 20px' : '12px 28px',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '40px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '13px' : '14px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {t('go_home')}
                  </button>
                </div>
              </div>
            </div>
          } 
        />
      </Routes>
    </Suspense>
  )
}

// ============================================================
// MAIN APP - WITH CONTEXT PROVIDERS
// ============================================================
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppWrapper />
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App