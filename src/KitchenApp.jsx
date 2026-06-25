import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabase'
import { ORDER_STATUS, splitOrderItems } from './lib/orderWorkflow'
import { sendNotification } from './utils/notification'
import { playSound, initSound, unlockAudio } from './utils/sound'

function KitchenApp() {
  const { darkMode } = useTheme()
  const { language } = useLanguage()
  
  // ============================================================
  // TRANSLATIONS
  // ============================================================
  const translations = {
    kitchen_title: { en: '🍳 Digital Kitchen', ms: ' Dapur Digital' },
    kitchen_subtitle: { en: 'Manage food & drink orders', ms: 'Urus pesanan makanan & minuman' },
    sound_on: { en: '🔊 Sound ON', ms: ' Bunyi ON' },
    sound_off: { en: '🔇 Sound OFF', ms: ' Bunyi OFF' },
    sound_test: { en: '🔊 Test Sound', ms: ' Uji Bunyi' },
    refresh: { en: '🔄 Refresh', ms: ' Muat Semula' },
    complete_all: { en: '✅ Complete All', ms: ' Selesaikan Semua' },
    go_to_settings: { en: '⚙️ Settings', ms: ' Tetapan' },
    search_orders: { en: '🔍 Search orders...', ms: ' Cari pesanan...' },
    all_orders: { en: '📋 All', ms: ' Semua' },
    dine_in: { en: '🍽️ Dine-in', ms: ' Makan di sini' },
    take_away: { en: '🥡 Take Away', ms: ' Bungkus' },
    new_orders: { en: '🆕 New Orders', ms: ' Pesanan Baru' },
    food_orders: { en: '🍳 Food', ms: ' Makanan' },
    drink_orders: { en: '🥤 Drinks', ms: ' Minuman' },
    confirmed_orders: { en: '✅ Confirmed', ms: ' Disahkan' },
    preparing_orders: { en: '🔪 Cooking', ms: ' Memasak' },
    ready_orders: { en: '✅ Ready', ms: ' Sedia' },
    completed_orders: { en: '📦 Done', ms: ' Selesai' },
    no_new_orders: { en: '📭 No new orders', ms: ' Tiada pesanan baru' },
    no_food_orders: { en: '📭 No food orders', ms: ' Tiada pesanan makanan' },
    no_drink_orders: { en: '📭 No drink orders', ms: ' Tiada pesanan minuman' },
    no_confirmed_orders: { en: '📭 No confirmed orders', ms: ' Tiada pesanan disahkan' },
    no_preparing_orders: { en: '📭 No orders cooking', ms: ' Tiada pesanan dimasak' },
    no_ready_orders: { en: '📭 No ready orders', ms: ' Tiada pesanan sedia' },
    no_completed_orders: { en: '📭 No completed orders', ms: ' Tiada pesanan selesai' },
    start_cooking: { en: '🔪 Start Cooking', ms: ' Mula Masak' },
    finish_cooking: { en: '✅ Finish Cooking', ms: ' Selesai Masak' },
    complete: { en: '✅ Complete', ms: ' Selesai' },
    cancelled: { en: '❌ Cancelled', ms: ' Dibatalkan' },
    error_updating: { en: '❌ Error updating order!', ms: ' Ralat kemaskini pesanan!' },
    no_orders_to_complete: { en: '📭 No orders to complete', ms: ' Tiada pesanan untuk diselesaikan' },
    orders_completed: { en: '✅ orders completed!', ms: ' pesanan selesai!' },
    confirm_complete_all: { en: 'Complete all orders?', ms: 'Selesaikan semua pesanan?' },
    cooking_started: { en: '🔪 Cooking started!', ms: ' Mula memasak!' },
    cooking_finished: { en: '✅ Cooking finished!', ms: ' Selesai memasak!' },
    order_completed: { en: '✅ Order completed!', ms: ' Pesanan selesai!' },
    order_cancelled: { en: '❌ Order cancelled!', ms: ' Pesanan dibatalkan!' },
    waiting: { en: '⏱️ Waiting', ms: '⏱ Menunggu' },
    total: { en: 'Total', ms: 'Jumlah' },
    note: { en: '📝 Note', ms: ' Nota' },
    cancel: { en: '❌ Cancel', ms: ' Batal' },
    table: { en: 'Table', ms: 'Meja' },
    just_now: { en: 'Just now', ms: 'Baru sahaja' },
    guest: { en: 'Guest', ms: 'Tetamu' },
    kitchen_disabled: { en: '🍳 Digital Kitchen Disabled', ms: ' Dapur Digital Dimatikan' },
    kitchen_disabled_desc: { en: 'Please enable digital kitchen in Settings', ms: 'Sila aktifkan dapur digital di Tetapan' },
    minutes_short: { en: 'm', ms: 'm' },
    hours_short: { en: 'h', ms: 'j' },
    order_confirmed: { en: '✅ Order confirmed!', ms: ' Pesanan disahkan!' },
    confirmed: { en: 'Confirmed', ms: 'Disahkan' },
    customer_phone: { en: 'Phone', ms: 'Telefon' },
  }

  const t = (key) => {
    if (!translations[key]) return key
    return language === 'en' ? translations[key].en : translations[key].ms
  }

  // ============================================================
  // STATE
  // ============================================================
  const [foodOrders, setFoodOrders] = useState([])
  const [drinkOrders, setDrinkOrders] = useState([])
  const [confirmedOrders, setConfirmedOrders] = useState([])
  const [preparingOrders, setPreparingOrders] = useState([])
  const [readyOrders, setReadyOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [restaurantName, setRestaurantName] = useState('Restoran Kita')
  const [activeTab, setActiveTab] = useState('new_food')
  const [kitchenEnabled, setKitchenEnabled] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [orderTypeFilter, setOrderTypeFilter] = useState('all')
  const [isMobile, setIsMobile] = useState(false)

  // ===== SOUND TRACKING =====
  const [notifiedOrderIds, setNotifiedOrderIds] = useState(new Set())

  // ============================================================
  // INIT SOUND
  // ============================================================
  useEffect(() => {
    initSound()
    
    const unlockOnInteraction = () => {
      unlockAudio()
      document.removeEventListener('click', unlockOnInteraction)
      document.removeEventListener('touchstart', unlockOnInteraction)
    }
    
    document.addEventListener('click', unlockOnInteraction)
    document.addEventListener('touchstart', unlockOnInteraction)
    
    return () => {
      document.removeEventListener('click', unlockOnInteraction)
      document.removeEventListener('touchstart', unlockOnInteraction)
    }
  }, [])

  // ============================================================
  // PLAY KITCHEN SOUND
  // ============================================================
  const playKitchenSound = () => {
    console.log('🔔 Kitchen: playKitchenSound called, soundEnabled:', soundEnabled)
    
    if (!soundEnabled) {
      console.log('🔇 Kitchen sound disabled')
      return
    }
    
    playSound()
  }

  // ============================================================
  // TEST SOUND
  // ============================================================
  const testSound = () => {
    console.log('🧪 Kitchen test sound button clicked!')
    initSound()
    unlockAudio()
    playSound()
    toast.success(`🔊 ${t('sound_test')}...`)
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
  const bgColor = darkMode ? '#07111f' : '#eff6ff'
  const cardBg = darkMode ? 'rgba(20, 20, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const textColor = darkMode ? '#e8edf5' : '#1e293b'
  const textMuted = darkMode ? '#94a3b8' : '#64748b'
  const borderColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.5)'
  const priceColor = darkMode ? '#4ade80' : '#22c55e'
  const secondaryBg = darkMode ? 'rgba(30, 30, 50, 0.6)' : 'rgba(248, 250, 252, 0.8)'
  
  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${borderColor}`,
    boxShadow: darkMode 
      ? '0 8px 40px rgba(0,0,0,0.5)' 
      : '0 8px 40px rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease'
  }

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    loadKitchenSetting()
  }, [])

  async function loadKitchenSetting() {
    try {
      const { data } = await supabase.from('settings').select('value').eq('key', 'kitchen_enabled').single()
      if (data) setKitchenEnabled(data.value === 'true')
    } catch (err) {
      console.error('Error loading kitchen setting:', err)
      setKitchenEnabled(true)
    }
  }

  useEffect(() => {
    if (!kitchenEnabled) return
    
    loadRestaurantName()
    loadOrders()
    
    const subscription = supabase
      .channel('kitchen_orders')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'customer_orders' },
        (payload) => {
          // Accept 'new', 'pending', and 'confirmed'
          if (payload.new.status === 'new' || payload.new.status === 'pending' || 
              payload.new.status === 'confirmed' || payload.new.status === ORDER_STATUS.CONFIRMED ||
              payload.new.order_status === 'new' || payload.new.order_status === 'pending' || 
              payload.new.order_status === 'confirmed' || payload.new.order_status === ORDER_STATUS.CONFIRMED) {
            
            console.log('🔔 New order! Playing kitchen sound...')
            playKitchenSound()
            
            const orderType = payload.new.order_type === 'take_away' 
              ? t('take_away') 
              : `${t('table')} ${payload.new.table_number || '?'}`
            
            toast.custom((toastObj) => (
              <div style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                color: 'white', 
                padding: isMobile ? '10px 16px' : '12px 24px', 
                borderRadius: '50px', 
                fontWeight: 'bold', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
                fontSize: isMobile ? '12px' : '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>🔔</span>
                <span>🆕 {t('new_orders')}! {orderType}</span>
              </div>
            ), { duration: 3000 })
            
            loadOrders()
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'customer_orders' },
        (payload) => {
          if (payload.new.status === 'ready' && payload.old.status !== 'ready') {
            loadOrders()
            console.log('🔔 Order ready! Playing kitchen sound...')
            playKitchenSound()
            
            sendNotification(
              t('order_ready_alert'),
              `${t('order_ready_desc')}: ${payload.new.order_number}`,
              '/staff'
            )
          } else {
            loadOrders()
          }
        }
      )
      .subscribe()
    
    const interval = setInterval(() => loadOrders(), 5000)
    
    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [soundEnabled, kitchenEnabled])

  // ============================================================
  // ===== FIXED: LOAD ORDERS WITH FOOD/DRINK SPLIT =====
  // ============================================================
  async function loadOrders() {
    try {
      const { data: pending } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', 'unpaid')
        .in('order_status', ['new', 'pending', 'confirmed', ORDER_STATUS.CONFIRMED])
        .in('status', ['new', 'pending', 'confirmed', ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, 'preparing', 'ready'])
        .order('created_at', { ascending: false })
      
      const { data: completed } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(20)
      
      // ===== PISAHKAN MAKANAN & MINUMAN =====
      const newFood = []
      const newDrinks = []
      const confirmedFood = []
      const confirmedDrinks = []
      const preparingFood = []
      const preparingDrinks = []
      const readyFood = []
      const readyDrinks = []
      
      pending?.forEach(order => {
        // Check if order has food items (category !== 'Minuman')
        const hasFood = order.items?.some(item => item.category !== 'Minuman')
        // Check if order has drink items (category === 'Minuman')
        const hasDrink = order.items?.some(item => item.category === 'Minuman')
        
        // If no category in items, treat as food (fallback for old orders)
        const hasAnyCategory = order.items?.some(item => item.category)
        const fallbackFood = !hasAnyCategory || hasFood
        
        if (order.status === 'new' || order.status === 'pending') {
          if (hasFood || fallbackFood) newFood.push(order)
          if (hasDrink) newDrinks.push(order)
          // If both, appear in both lists
          if (!hasFood && !hasDrink && !fallbackFood) newFood.push(order) // fallback
        } else if (order.status === 'confirmed') {
          if (hasFood || fallbackFood) confirmedFood.push(order)
          if (hasDrink) confirmedDrinks.push(order)
        } else if (order.status === 'preparing') {
          if (hasFood || fallbackFood) preparingFood.push(order)
          if (hasDrink) preparingDrinks.push(order)
        } else if (order.status === 'ready') {
          if (hasFood || fallbackFood) readyFood.push(order)
          if (hasDrink) readyDrinks.push(order)
        }
      })
      
      setFoodOrders(newFood)
      setDrinkOrders(newDrinks)
      setConfirmedOrders(confirmedFood)
      setPreparingOrders(preparingFood)
      setReadyOrders(readyFood)
      setCompletedOrders(completed || [])
      
      console.log('🍳 Food orders:', newFood.length)
      console.log('🥤 Drink orders:', newDrinks.length)
      
    } catch (err) {
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // LOAD RESTAURANT NAME
  // ============================================================
  async function loadRestaurantName() {
    try {
      const { data } = await supabase.from('settings').select('value').eq('key', 'restaurant_name').single()
      if (data) setRestaurantName(data.value)
    } catch (err) {
      console.error('Error loading restaurant name:', err)
    }
  }

  // ============================================================
  // ORDER ACTIONS
  // ============================================================
  async function updateOrderStatus(orderId, status) {
    try {
      setNotifiedOrderIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
      
      const updateData = status === ORDER_STATUS.COMPLETED || status === 'completed' 
        ? { status, order_status: ORDER_STATUS.COMPLETED }
        : { status, order_status: status }
      
      const { error } = await supabase
        .from('customer_orders')
        .update(updateData)
        .eq('id', orderId)
      
      if (error) throw error
      
      await loadOrders()
      
      if (status === 'preparing') {
        toast.success(t('cooking_started'))
        playKitchenSound()
      } else if (status === 'ready') {
        toast.success(t('cooking_finished'))
        playKitchenSound()
      } else if (status === 'completed') {
        toast.success(t('order_completed'))
      } else if (status === 'cancelled') {
        toast.error(t('order_cancelled'))
      }
    } catch (err) {
      console.error('Error updating order:', err)
      toast.error(t('error_updating'))
    }
  }

  async function bulkComplete(tab) {
    let ordersToComplete = []
    if (tab === 'ready') ordersToComplete = readyOrders
    else if (tab === 'preparing') ordersToComplete = preparingOrders
    
    if (ordersToComplete.length === 0) {
      toast.error(t('no_orders_to_complete'))
      return
    }
    
    if (window.confirm(t('confirm_complete_all'))) {
      for (const order of ordersToComplete) {
        setNotifiedOrderIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(order.id)
          return newSet
        })
        
        const newStatus = tab === 'ready' ? 'completed' : 'ready'
        await supabase
          .from('customer_orders')
          .update({ status: newStatus })
          .eq('id', order.id)
      }
      await loadOrders()
      toast.success(`✅ ${ordersToComplete.length} ${t('orders_completed')}`)
      playKitchenSound()
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const getOrderTypeIcon = (order) => {
    if (order.order_type === 'take_away') return `🥡 ${t('take_away')}`
    if (order.table_number) return `🍽️ ${t('table')} ${order.table_number}`
    return `🍽️ ${t('dine_in')}`
  }

  const getWaitingTime = (createdAt) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffMinutes = Math.floor((now - created) / 60000)
    if (diffMinutes < 1) return t('just_now')
    if (diffMinutes < 60) return `${diffMinutes}${t('minutes_short')}`
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    if (minutes === 0) return `${hours}${t('hours_short')}`
    return `${hours}${t('hours_short')} ${minutes}m`
  }

  const getWaitingColor = (createdAt) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffMinutes = Math.floor((now - created) / 60000)
    if (diffMinutes > 15) return '#ef4444'
    if (diffMinutes > 8) return '#f59e0b'
    return '#22c55e'
  }

  const getWaitingBg = (createdAt) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffMinutes = Math.floor((now - created) / 60000)
    if (diffMinutes > 15) return 'rgba(239, 68, 68, 0.12)'
    if (diffMinutes > 8) return 'rgba(245, 158, 11, 0.12)'
    return 'rgba(34, 197, 94, 0.12)'
  }

  const filterOrders = (orders) => {
    let filtered = orders
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    if (orderTypeFilter !== 'all') {
      filtered = filtered.filter(order => order.order_type === orderTypeFilter)
    }
    return filtered
  }

  // ============================================================
  // RENDER ORDER CARD
  // ============================================================
  const renderOrderCard = (order, showActionButtons = true) => {
    const waitingColor = getWaitingColor(order.created_at)
    const waitingBg = getWaitingBg(order.created_at)
    const statusColor = order.status === 'new' ? '#3b82f6' : 
                        order.status === 'pending' ? '#3b82f6' :
                        order.status === 'confirmed' ? '#8b5cf6' :
                        order.status === 'preparing' ? '#f59e0b' :
                        order.status === 'ready' ? '#22c55e' : '#6c757d'
    
    return (
      <div 
        key={order.id} 
        style={{ 
          ...glassEffect, 
          borderRadius: isMobile ? '20px' : '24px', 
          padding: isMobile ? '16px' : '20px', 
          borderLeft: `5px solid ${statusColor}`,
          marginBottom: isMobile ? '12px' : '16px',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'default'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = darkMode 
            ? '0 12px 40px rgba(0,0,0,0.5)' 
            : '0 12px 40px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = darkMode 
            ? '0 8px 32px rgba(0,0,0,0.4)' 
            : '0 8px 32px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: isMobile ? '10px' : '12px', 
          flexWrap: 'wrap', 
          gap: '8px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', 
              padding: isMobile ? '4px 12px' : '6px 14px', 
              borderRadius: '40px',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 'bold',
              color: textColor
            }}>
              {getOrderTypeIcon(order)}
            </span>
            
            <span style={{ 
              background: waitingBg,
              padding: isMobile ? '3px 10px' : '4px 12px',
              borderRadius: '40px',
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: 'bold',
              color: waitingColor
            }}>
              ⏱️ {t('waiting')}: {getWaitingTime(order.created_at)}
            </span>
            
            <span style={{ 
              background: statusColor,
              color: 'white',
              padding: isMobile ? '2px 10px' : '4px 12px',
              borderRadius: '40px',
              fontSize: isMobile ? '8px' : '10px',
              fontWeight: 'bold'
            }}>
              {order.status === 'new' ? '🆕 New' : 
               order.status === 'pending' ? '🆕 New' :
               order.status === 'confirmed' ? '✅ Confirmed' :
               order.status === 'preparing' ? '🔪 Cooking' :
               order.status === 'ready' ? '✅ Ready' : '📦 Done'}
            </span>
          </div>
          <div style={{ fontSize: isMobile ? '10px' : '11px', color: textMuted }}>
            🕐 {new Date(order.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <div style={{ marginBottom: isMobile ? '10px' : '12px' }}>
          <h4 style={{ 
            margin: 0, 
            color: textColor, 
            fontSize: isMobile ? '15px' : '17px', 
            fontWeight: 'bold' 
          }}>
            👤 {order.customer_name || t('guest')}
          </h4>
          
          {order.customer_phone && (
            <div style={{ 
              fontSize: isMobile ? '11px' : '12px', 
              color: textMuted, 
              marginTop: '2px' 
            }}>
              📞 {order.customer_phone}
            </div>
          )}
          
          {order.order_number && (
            <p style={{ 
              fontSize: isMobile ? '10px' : '12px', 
              color: textMuted, 
              margin: '2px 0 0 0' 
            }}>
              #{order.order_number}
            </p>
          )}
        </div>
        
        {order.notes && (
          <div style={{ 
            background: 'rgba(245, 158, 11, 0.15)', 
            padding: isMobile ? '8px 12px' : '10px 14px', 
            borderRadius: '12px', 
            marginBottom: '10px', 
            fontSize: isMobile ? '11px' : '12px', 
            color: '#f59e0b',
            borderLeft: `3px solid #f59e0b`
          }}>
            📝 {t('note')}: {order.notes}
          </div>
        )}
        
        <div style={{ 
          margin: '12px 0', 
          borderTop: `1px solid ${borderColor}`, 
          paddingTop: '10px' 
        }}>
          {order.items?.map((item, idx) => {
            const isDrink = item.category === 'Minuman'
            return (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '6px 0', 
                color: textColor,
                borderBottom: idx !== order.items.length - 1 ? `1px solid ${borderColor}` : 'none',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {isDrink ? (
                    <span style={{ fontSize: '10px', color: '#06b6d4' }}>🥤</span>
                  ) : (
                    <span style={{ fontSize: '10px', color: '#ef4444' }}>🍳</span>
                  )}
                  <span style={{ fontSize: isMobile ? '12px' : '13px' }}>
                    {item.quantity}x {item.name}
                  </span>
                  {item.option_type && (
                    <span style={{ 
                      fontSize: isMobile ? '8px' : '9px', 
                      color: textMuted,
                      background: secondaryBg,
                      padding: '1px 6px',
                      borderRadius: '12px'
                    }}>
                      {item.option_type === 'Panas' ? '🔥' : 
                       item.option_type === 'Sejuk' ? '🧊' : 
                       item.option_type === 'Bungkus' ? '📦' : ''}
                      {item.option_type}
                    </span>
                  )}
                </div>
                <span style={{ 
                  color: priceColor, 
                  fontWeight: 'bold', 
                  fontSize: isMobile ? '12px' : '13px' 
                }}>
                  RM {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>
        
        <div style={{ 
          textAlign: 'right', 
          marginBottom: showActionButtons ? '12px' : '0',
          paddingTop: '8px',
          borderTop: `1px solid ${borderColor}`
        }}>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: isMobile ? '14px' : '16px', 
            color: textColor 
          }}>
            {t('total')}: <span style={{ color: priceColor }}>RM {order.total?.toFixed(2) || '0.00'}</span>
          </span>
        </div>
        
        {showActionButtons && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
            {order.status === 'confirmed' && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'preparing')} 
                style={{ 
                  flex: 1,
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
                  color: 'white', 
                  padding: isMobile ? '10px' : '12px', 
                  border: 'none', 
                  borderRadius: '50px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: isMobile ? '12px' : '13px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                🔪 {t('start_cooking')}
              </button>
            )}
            
            {order.status === 'preparing' && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'ready')} 
                style={{ 
                  flex: 1, 
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                  color: 'white', 
                  padding: isMobile ? '10px' : '12px', 
                  border: 'none', 
                  borderRadius: '50px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: isMobile ? '12px' : '13px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                ✅ {t('finish_cooking')}
              </button>
            )}
            
            {order.status === 'ready' && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'completed')} 
                style={{ 
                  flex: 1, 
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                  color: 'white', 
                  padding: isMobile ? '10px' : '12px', 
                  border: 'none', 
                  borderRadius: '50px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: isMobile ? '12px' : '13px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                ✅ {t('complete')}
              </button>
            )}
            
            {order.status !== 'completed' && (
              <button 
                onClick={() => updateOrderStatus(order.id, 'cancelled')} 
                style={{ 
                  flex: 1, 
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                  color: 'white', 
                  padding: isMobile ? '10px' : '12px', 
                  border: 'none', 
                  borderRadius: '50px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: isMobile ? '12px' : '13px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                ❌ {t('cancel')}
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // KITCHEN DISABLED STATE
  // ============================================================
  if (!kitchenEnabled) {
    return (
      <Sidebar>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: bgColor, 
          padding: isMobile ? '16px' : '20px' 
        }}>
          <div style={{ 
            ...glassEffect, 
            borderRadius: '28px', 
            padding: isMobile ? '32px' : '48px', 
            maxWidth: '500px', 
            width: '90%', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: isMobile ? '56px' : '72px', marginBottom: '20px' }}>🍳</div>
            <h2 style={{ 
              color: '#ef4444', 
              marginBottom: '10px', 
              fontWeight: 'bold', 
              fontSize: isMobile ? '20px' : '24px' 
            }}>
              {t('kitchen_disabled')}
            </h2>
            <p style={{ 
              color: textMuted, 
              marginBottom: '24px', 
              fontSize: isMobile ? '12px' : '14px' 
            }}>
              {t('kitchen_disabled_desc')}
            </p>
            <button 
              onClick={() => window.location.href = '/manage-settings'} 
              style={{ 
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                color: 'white', 
                padding: isMobile ? '12px 24px' : '14px 32px', 
                border: 'none', 
                borderRadius: '50px', 
                cursor: 'pointer', 
                fontSize: isMobile ? '13px' : '15px', 
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {t('go_to_settings')}
            </button>
          </div>
        </div>
      </Sidebar>
    )
  }

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <Sidebar>
        <div style={{ 
          padding: isMobile ? '12px' : '20px', 
          maxWidth: '1400px', 
          margin: '0 auto', 
          background: bgColor, 
          minHeight: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <div className="spinner"></div>
        </div>
      </Sidebar>
    )
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  // ===== TABS WITH FOOD & DRINK SEPARATED =====
  const tabs = [
    { id: 'new_food', label: t('food_orders'), icon: '🍳', color: '#ef4444', count: foodOrders.length },
    { id: 'new_drink', label: t('drink_orders'), icon: '🥤', color: '#06b6d4', count: drinkOrders.length },
    { id: 'confirmed', label: t('confirmed_orders'), icon: '✅', color: '#8b5cf6', count: confirmedOrders.length },
    { id: 'preparing', label: t('preparing_orders'), icon: '🔪', color: '#f59e0b', count: preparingOrders.length },
    { id: 'ready', label: t('ready_orders'), icon: '✅', color: '#22c55e', count: readyOrders.length },
    { id: 'completed', label: t('completed_orders'), icon: '📦', color: '#6c757d', count: completedOrders.length }
  ]

  return (
    <Sidebar>
      <div style={{ 
        padding: isMobile ? '12px' : '24px', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        background: bgColor, 
        minHeight: '100vh' 
      }}>
        
        {/* ===== HEADER ===== */}
        <div style={{ 
          ...glassEffect, 
          borderRadius: '28px', 
          padding: isMobile ? '16px 20px' : '24px 32px', 
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '12px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: isMobile ? '36px' : '48px' }}>🍳</div>
              <div>
                <h1 style={{ 
                  color: textColor, 
                  margin: 0, 
                  fontSize: isMobile ? '20px' : '28px', 
                  fontWeight: 'bold' 
                }}>
                  {t('kitchen_title')}
                </h1>
                <p style={{ 
                  color: textMuted, 
                  marginTop: '2px', 
                  fontSize: isMobile ? '11px' : '13px' 
                }}>
                  {restaurantName} • {t('kitchen_subtitle')}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={testSound}
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
                  color: 'white', 
                  padding: isMobile ? '6px 14px' : '10px 20px', 
                  border: 'none', 
                  borderRadius: '40px', 
                  cursor: 'pointer', 
                  fontSize: isMobile ? '11px' : '13px', 
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 16px rgba(139,92,246,0.3)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                🔊 {t('sound_test')}
              </button>
              
              <button 
                onClick={() => { 
                  const newState = !soundEnabled
                  setSoundEnabled(newState)
                  console.log('🔊 Sound toggled to:', newState)
                  toast.success(newState ? '🔊 Sound ON' : '🔇 Sound OFF')
                }} 
                style={{ 
                  background: soundEnabled 
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                    : 'linear-gradient(135deg, #6c757d, #5a6268)', 
                  color: 'white', 
                  padding: isMobile ? '6px 14px' : '10px 20px', 
                  border: 'none', 
                  borderRadius: '40px', 
                  cursor: 'pointer', 
                  fontSize: isMobile ? '11px' : '13px', 
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {soundEnabled ? '🔊 ' + t('sound_on') : '🔇 ' + t('sound_off')}
              </button>
              <button 
                onClick={() => loadOrders()} 
                style={{ 
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)', 
                  color: 'white', 
                  padding: isMobile ? '6px 14px' : '10px 20px', 
                  border: 'none', 
                  borderRadius: '40px', 
                  cursor: 'pointer', 
                  fontSize: isMobile ? '11px' : '13px', 
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isMobile ? '🔄' : '🔄 ' + t('refresh')}
              </button>
            </div>
          </div>
        </div>
        
        {/* ===== SEARCH & FILTER ===== */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px', 
          flexWrap: 'wrap' 
        }}>
          <div style={{ 
            ...glassEffect, 
            borderRadius: '60px', 
            padding: isMobile ? '4px 16px' : '4px 20px', 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center',
            minWidth: isMobile ? '150px' : '200px'
          }}>
            <span style={{ fontSize: isMobile ? '14px' : '18px', marginRight: '10px', color: textMuted }}>🔍</span>
            <input 
              type="text" 
              placeholder={t('search_orders')} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: isMobile ? '10px 0' : '14px 0', 
                border: 'none', 
                background: 'transparent', 
                color: textColor, 
                fontSize: isMobile ? '13px' : '14px', 
                outline: 'none' 
              }} 
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: textMuted, 
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            )}
          </div>
          <select 
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
            style={{
              ...glassEffect,
              padding: isMobile ? '8px 16px' : '12px 24px',
              borderRadius: '60px',
              border: 'none',
              background: cardBg,
              color: textColor,
              fontSize: isMobile ? '12px' : '13px',
              cursor: 'pointer',
              outline: 'none',
              minWidth: isMobile ? '100px' : '140px'
            }}
          >
            <option value="all">🍽️ {t('all_orders')}</option>
            <option value="dine_in">🏠 {t('dine_in')}</option>
            <option value="take_away">🥡 {t('take_away')}</option>
          </select>
        </div>
        
        {/* ===== TABS ===== */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          marginBottom: '20px', 
          background: darkMode ? 'rgba(30, 30, 45, 0.5)' : 'rgba(0,0,0,0.03)', 
          borderRadius: '50px', 
          padding: '6px',
          overflowX: 'auto',
          flexWrap: 'nowrap'
        }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              style={{ 
                flex: 1,
                minWidth: isMobile ? '60px' : 'auto',
                padding: isMobile ? '8px 12px' : '12px 20px', 
                background: activeTab === tab.id 
                  ? `linear-gradient(135deg, ${tab.color}, ${tab.color}dd)` 
                  : 'transparent', 
                color: activeTab === tab.id ? 'white' : textColor, 
                border: 'none', 
                borderRadius: '50px', 
                cursor: 'pointer', 
                fontWeight: activeTab === tab.id ? 'bold' : '500', 
                fontSize: isMobile ? '11px' : '13px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              <span style={{ display: isMobile ? 'none' : 'inline' }}>{tab.label}</span>
              {tab.count > 0 && (
                <span style={{ 
                  background: activeTab === tab.id 
                    ? 'rgba(255,255,255,0.25)' 
                    : tab.color, 
                  color: 'white', 
                  borderRadius: '30px', 
                  padding: '2px 8px', 
                  fontSize: isMobile ? '8px' : '10px', 
                  fontWeight: 'bold',
                  minWidth: '18px',
                  textAlign: 'center'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* ===== TAB CONTENT ===== */}
        {activeTab === 'new_food' && (
          <div>
            {filterOrders(foodOrders).length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: isMobile ? '40px 20px' : '80px 20px', 
                ...glassEffect, 
                borderRadius: '24px' 
              }}>
                <span style={{ fontSize: isMobile ? '48px' : '72px', opacity: 0.5 }}>🍳</span>
                <h3 style={{ color: textColor, marginTop: '12px', fontSize: isMobile ? '16px' : '18px' }}>
                  {t('no_food_orders')}
                </h3>
              </div>
            ) : (
              filterOrders(foodOrders).map(order => renderOrderCard(order, true))
            )}
          </div>
        )}
        
        {activeTab === 'new_drink' && (
          <div>
            {filterOrders(drinkOrders).length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: isMobile ? '40px 20px' : '80px 20px', 
                ...glassEffect, 
                borderRadius: '24px' 
              }}>
                <span style={{ fontSize: isMobile ? '48px' : '72px', opacity: 0.5 }}>🥤</span>
                <h3 style={{ color: textColor, marginTop: '12px', fontSize: isMobile ? '16px' : '18px' }}>
                  {t('no_drink_orders')}
                </h3>
              </div>
            ) : (
              filterOrders(drinkOrders).map(order => renderOrderCard(order, true))
            )}
          </div>
        )}
        
        {activeTab === 'confirmed' && (
          <div>
            {filterOrders(confirmedOrders).length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: isMobile ? '40px 20px' : '80px 20px', 
                ...glassEffect, 
                borderRadius: '24px' 
              }}>
                <span style={{ fontSize: isMobile ? '48px' : '72px', opacity: 0.5 }}>✅</span>
                <h3 style={{ color: textColor, marginTop: '12px', fontSize: isMobile ? '16px' : '18px' }}>
                  {t('no_confirmed_orders')}
                </h3>
              </div>
            ) : (
              filterOrders(confirmedOrders).map(order => renderOrderCard(order, true))
            )}
          </div>
        )}
        
        {activeTab === 'preparing' && (
          <div>
            {filterOrders(preparingOrders).length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: isMobile ? '40px 20px' : '80px 20px', 
                ...glassEffect, 
                borderRadius: '24px' 
              }}>
                <span style={{ fontSize: isMobile ? '48px' : '72px', opacity: 0.5 }}>🔪</span>
                <h3 style={{ color: textColor, marginTop: '12px', fontSize: isMobile ? '16px' : '18px' }}>
                  {t('no_preparing_orders')}
                </h3>
              </div>
            ) : (
              <>
                {preparingOrders.length > 1 && (
                  <button 
                    onClick={() => bulkComplete('preparing')} 
                    style={{ 
                      marginBottom: '16px', 
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                      color: 'white', 
                      padding: isMobile ? '10px' : '14px', 
                      border: 'none', 
                      borderRadius: '40px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      fontSize: isMobile ? '13px' : '15px',
                      width: '100%',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    ✅ {t('complete_all')} ({preparingOrders.length})
                  </button>
                )}
                {filterOrders(preparingOrders).map(order => renderOrderCard(order, true))}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'ready' && (
          <div>
            {filterOrders(readyOrders).length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: isMobile ? '40px 20px' : '80px 20px', 
                ...glassEffect, 
                borderRadius: '24px' 
              }}>
                <span style={{ fontSize: isMobile ? '48px' : '72px', opacity: 0.5 }}>✅</span>
                <h3 style={{ color: textColor, marginTop: '12px', fontSize: isMobile ? '16px' : '18px' }}>
                  {t('no_ready_orders')}
                </h3>
              </div>
            ) : (
              <>
                {readyOrders.length > 1 && (
                  <button 
                    onClick={() => bulkComplete('ready')} 
                    style={{ 
                      marginBottom: '16px', 
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                      color: 'white', 
                      padding: isMobile ? '10px' : '14px', 
                      border: 'none', 
                      borderRadius: '40px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      fontSize: isMobile ? '13px' : '15px',
                      width: '100%',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    ✅ {t('complete_all')} ({readyOrders.length})
                  </button>
                )}
                {filterOrders(readyOrders).map(order => renderOrderCard(order, true))}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'completed' && (
          <div>
            {filterOrders(completedOrders).length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: isMobile ? '40px 20px' : '80px 20px', 
                ...glassEffect, 
                borderRadius: '24px' 
              }}>
                <span style={{ fontSize: isMobile ? '48px' : '72px', opacity: 0.5 }}>📦</span>
                <h3 style={{ color: textColor, marginTop: '12px', fontSize: isMobile ? '16px' : '18px' }}>
                  {t('no_completed_orders')}
                </h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filterOrders(completedOrders).map(order => (
                  <div key={order.id} style={{ 
                    ...glassEffect, 
                    borderRadius: '16px', 
                    padding: isMobile ? '12px 16px' : '16px 20px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: '10px' 
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: textColor, 
                        fontSize: isMobile ? '13px' : '14px' 
                      }}>
                        {getOrderTypeIcon(order)} - {order.customer_name || t('guest')}
                      </div>
                      <div style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        color: textMuted, 
                        marginTop: '2px' 
                      }}>
                        {order.items?.map((i, idx) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: priceColor, 
                        fontSize: isMobile ? '14px' : '16px' 
                      }}>
                        RM {order.total?.toFixed(2) || '0.00'}
                      </div>
                      <div style={{ 
                        fontSize: isMobile ? '9px' : '10px', 
                        color: textMuted 
                      }}>
                        {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* ===== STYLES ===== */}
        <style>
          {`
            .spinner { 
              width: 40px; 
              height: 40px; 
              border: 3px solid rgba(59,130,246,0.15); 
              border-top-color: #3b82f6; 
              border-radius: 50%; 
              animation: spin 1s linear infinite; 
              margin: 0 auto; 
            }
            
            @keyframes spin { 
              to { transform: rotate(360deg); } 
            }
            
            ::-webkit-scrollbar { 
              width: 6px; 
              height: 6px; 
            }
            
            ::-webkit-scrollbar-track { 
              background: ${darkMode ? '#1a1a2e' : '#e2e8f0'}; 
              border-radius: 10px; 
            }
            
            ::-webkit-scrollbar-thumb { 
              background: ${darkMode ? '#3d3d5c' : '#94a3b8'}; 
              border-radius: 10px; 
            }
            
            input, select { 
              transition: all 0.2s ease; 
            }
            
            input:focus, select:focus { 
              outline: none; 
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
            }
            
            button { 
              transition: all 0.2s ease; 
            }
            
            button:hover:not(:disabled) { 
              opacity: 0.9; 
            }
            
            button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          `}
        </style>
      </div>
    </Sidebar>
  )
}

export default KitchenApp