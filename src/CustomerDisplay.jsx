import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import { supabase } from './lib/supabase'
import { PAYMENT_STATUS } from './lib/orderWorkflow'
import { generateReceiptHTML } from './lib/receipt'

// ===== IMPORT USE RECEIPT HOOK =====
import { useReceipt } from './hooks/useReceipt'

// Helper functions for Malaysia time (UTC+8)
const formatMalaysiaDate = (date) => {
  return date.toLocaleDateString('en-MY', { 
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatMalaysiaTime = (date) => {
  return date.toLocaleTimeString('en-MY', { 
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

const formatOrderTime = (utcDateString) => {
  if (!utcDateString) return '-'
  const date = new Date(utcDateString)
  return date.toLocaleTimeString('en-MY', { 
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function CustomerDisplay() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { language, setLanguage } = useLanguage()
  
  // ===== USE RECEIPT HOOK =====
  const { 
    settings: receiptSettings, 
    loading: receiptLoading, 
    generateReceipt, 
    printReceipt,
    reload: reloadReceipt 
  } = useReceipt()
  
  // ============================================================
  // STATE
  // ============================================================
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [tableOrders, setTableOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [restaurantName, setRestaurantName] = useState('Restoran Kita')
  const [logoUrl, setLogoUrl] = useState('')
  const [showBillingModal, setShowBillingModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [serviceChargePercent, setServiceChargePercent] = useState(6)
  const [taxPercent, setTaxPercent] = useState(6)
  const [specialMenuEnabled, setSpecialMenuEnabled] = useState(false)
  const [specialMenuTitle, setSpecialMenuTitle] = useState('Istimewa Hari Ini')
  const [specialMenuItems, setSpecialMenuItems] = useState([])
  const [promotions, setPromotions] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [searchOrder, setSearchOrder] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [drinkOptions, setDrinkOptions] = useState([])
  
  // ===== SELECTED MENU FOR DISPLAY =====
  const [selectedMenuIds, setSelectedMenuIds] = useState([])
  const [showMenuSelector, setShowMenuSelector] = useState(false)
  const [tempSelectedMenuIds, setTempSelectedMenuIds] = useState([])
  const [displayMenuItems, setDisplayMenuItems] = useState([])
  
  // ===== HIDDEN HINTS =====
  const [showHiddenHints, setShowHiddenHints] = useState(true)
  
  // Business hours
  const [businessHoursStart, setBusinessHoursStart] = useState('09:00')
  const [businessHoursEnd, setBusinessHoursEnd] = useState('22:00')
  const [isOpen, setIsOpen] = useState(true)
  
  // Current time
  const [currentTime, setCurrentTime] = useState(new Date())

  // Settings for print
  const [printSettings, setPrintSettings] = useState({
    restaurant_name: 'Restoran Kita',
    service_charge_percent: 6,
    tax_percent: 6,
    auto_print: true
  })

  // ============================================================
  // TRANSLATIONS
  // ============================================================
  const translations = {
    menu_pricing: { en: 'Menu & Pricing', ms: 'Menu & Harga' },
    open: { en: 'OPEN', ms: 'BUKA' },
    closed: { en: 'CLOSED', ms: 'TUTUP' },
    billing: { en: '💰 Billing', ms: '💰 Bil' },
    take_away: { en: 'Take Away', ms: 'Bungkus' },
    all_orders: { en: 'All Orders', ms: 'Semua Pesanan' },
    select_table: { en: 'Select Table', ms: 'Pilih Meja' },
    table_number: { en: 'Table', ms: 'Meja' },
    no_orders: { en: 'No orders', ms: 'Tiada pesanan' },
    subtotal: { en: 'Subtotal', ms: 'Subtotal' },
    service_charge: { en: 'Service Charge', ms: 'Caj Perkhidmatan' },
    tax: { en: 'Tax', ms: 'Cukai' },
    total: { en: 'Total', ms: 'Jumlah' },
    payment_method: { en: 'Payment Method', ms: 'Kaedah Bayaran' },
    cash: { en: 'Cash', ms: 'Tunai' },
    tng: { en: 'TnG', ms: 'TnG' },
    bank: { en: 'Bank', ms: 'Bank' },
    record_payment: { en: 'Record Payment', ms: 'Rekod Bayaran' },
    payment_received: { en: 'Payment received', ms: 'Bayaran diterima' },
    btn_print: { en: 'Print', ms: 'Cetak' },
    btn_pay: { en: 'Pay', ms: 'Bayar' },
    btn_save: { en: 'Save', ms: 'Simpan' },
    cancel: { en: 'Cancel', ms: 'Batal' },
    close: { en: 'Close', ms: 'Tutup' },
    print_all: { en: 'Print All', ms: 'Cetak Semua' },
    find_order: { en: 'Find order...', ms: 'Cari pesanan...' },
    thank_you: { en: 'Thank you for dining with us!', ms: 'Terima kasih kerana makan di sini!' },
    error_updating: { en: 'Error updating order', ms: 'Ralat kemaskini pesanan' },
    special_today: { en: "Today's Special Menu", ms: 'Menu Istimewa Hari Ini' },
    promo: { en: '🔥 PROMO', ms: '🔥 PROMOSI' },
    bogo: { en: 'BUY 1 FREE 1', ms: 'BELI 1 PERCUMA 1' },
    bundle: { en: 'BUNDLE DEAL', ms: 'TAWARAN BUNDLE' },
    set_menu: { en: 'SET MENU', ms: 'SET MENU' },
    hot: { en: 'Hot', ms: 'Panas' },
    cold: { en: 'Cold', ms: 'Sejuk' },
    packed: { en: 'Packed', ms: 'Bungkus' },
    drink_options: { en: 'Drink Options', ms: 'Pilihan Minuman' },
    no_drink_options: { en: 'No drink options available', ms: 'Tiada pilihan minuman' },
    preview_receipt: { en: 'Preview Receipt', ms: 'Preview Resit' },
    mark_paid: { en: 'Mark as Paid', ms: 'Tanda Bayar' },
    select_menu: { en: 'Select Menu', ms: 'Pilih Menu' },
    select_menu_title: { en: 'Select Menu To Display', ms: 'Pilih Menu Untuk Paparan' },
    select_all: { en: 'Select All', ms: 'Pilih Semua' },
    no_menu_selected: { en: 'No menu selected. Tap left bottom to select.', ms: 'Tiada menu dipilih. Tap kiri bawah untuk pilih.' },
    tap_left_select: { en: 'Tap left to select menu', ms: 'Tap kiri pilih menu' },
    tap_right_pay: { en: 'Tap right for billing', ms: 'Tap kanan untuk bayar' },
  }

  const t2 = (key) => {
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
  // HIDE HINTS AFTER 5 SECONDS
  // ============================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHiddenHints(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // ============================================================
  // THEME COLORS
  // ============================================================
  const bgColor = darkMode ? '#07111f' : '#eff6ff'
  const cardBg = darkMode ? 'rgba(20, 20, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const textColor = darkMode ? '#e8edf5' : '#1e293b'
  const textMuted = darkMode ? '#94a3b8' : '#64748b'
  const borderColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.5)'
  const modalBg = darkMode ? 'rgba(20, 20, 40, 0.98)' : 'rgba(255, 255, 255, 0.98)'
  const secondaryBg = darkMode ? 'rgba(30, 30, 50, 0.6)' : 'rgba(248, 250, 252, 0.8)'
  const inputBg = darkMode ? '#1a1a2e' : '#ffffff'
  const promoColor = '#ef4444'
  const priceColor = darkMode ? '#4ade80' : '#22c55e'
  
  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${borderColor}`,
    boxShadow: darkMode 
      ? '0 8px 40px rgba(0,0,0,0.5)' 
      : '0 8px 40px rgba(0,0,0,0.06)'
  }

  // ============================================================
  // CHECK BUSINESS HOURS
  // ============================================================
  const checkBusinessHours = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const [startHour, startMinute] = businessHoursStart.split(':').map(Number)
    const [endHour, endMinute] = businessHoursEnd.split(':').map(Number)
    
    const currentTotal = currentHour * 60 + currentMinute
    const startTotal = startHour * 60 + startMinute
    const endTotal = endHour * 60 + endMinute
    
    setIsOpen(currentTotal >= startTotal && currentTotal <= endTotal)
  }

  // ============================================================
  // CLOCK UPDATES
  // ============================================================
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      checkBusinessHours()
    }, 1000)
    return () => clearInterval(timer)
  }, [businessHoursStart, businessHoursEnd])

  // ============================================================
  // DRINK OPTIONS HELPERS
  // ============================================================
  async function loadDrinkOptions() {
    try {
      const { data } = await supabase
        .from('drink_options')
        .select('*')
      setDrinkOptions(data || [])
    } catch (err) {
      console.error('Error loading drink options:', err)
      setDrinkOptions([])
    }
  }

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase()
  }

  function getDrinkOptionsForItem(item) {
    if (!item) return []
    return drinkOptions.filter(opt => normalizeText(opt.drink_name) === normalizeText(item.name))
  }

  function hasDrinkOptions(item) {
    if (!item) return false
    return getDrinkOptionsForItem(item).length > 0
  }

  function getOptionLabel(option) {
    if (option === 'Panas') return t2('hot')
    if (option === 'Sejuk') return t2('cold')
    if (option === 'Bungkus') return t2('packed')
    return option
  }

  function getOptionEmoji(option) {
    if (option === 'Panas') return '🔥'
    if (option === 'Sejuk') return '🧊'
    if (option === 'Bungkus') return '📦'
    return '☕'
  }

  // ============================================================
  // LOAD SELECTED MENU FOR DISPLAY
  // ============================================================
  async function loadSelectedMenu() {
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'customer_display_menu_ids')
        .single()
      
      if (data && data.value) {
        const ids = JSON.parse(data.value)
        setSelectedMenuIds(ids)
        setTempSelectedMenuIds(ids)
        const filtered = menu.filter(item => ids.includes(item.id))
        setDisplayMenuItems(filtered)
      } else {
        const allIds = menu.map(item => item.id)
        setSelectedMenuIds(allIds)
        setTempSelectedMenuIds(allIds)
        setDisplayMenuItems(menu)
      }
    } catch (err) {
      console.error('Error loading selected menu:', err)
      setDisplayMenuItems(menu)
    }
  }

  async function saveSelectedMenu() {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'customer_display_menu_ids', 
          value: JSON.stringify(tempSelectedMenuIds) 
        }, { onConflict: 'key' })
      
      if (error) throw error
      
      setSelectedMenuIds(tempSelectedMenuIds)
      const filtered = menu.filter(item => tempSelectedMenuIds.includes(item.id))
      setDisplayMenuItems(filtered)
      setShowMenuSelector(false)
      toast.success('✅ Menu paparan dikemaskini!')
    } catch (err) {
      console.error('Error saving selected menu:', err)
      toast.error('❌ Gagal menyimpan menu paparan')
    }
  }

  const toggleMenuSelection = (menuId) => {
    setTempSelectedMenuIds(prev => {
      if (prev.includes(menuId)) {
        return prev.filter(id => id !== menuId)
      } else {
        return [...prev, menuId]
      }
    })
  }

  const toggleAllMenu = () => {
    if (tempSelectedMenuIds.length === menu.length) {
      setTempSelectedMenuIds([])
    } else {
      setTempSelectedMenuIds(menu.map(item => item.id))
    }
  }

  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    loadAllData()
    reloadReceipt()

    const liveChannel = supabase
      .channel('customer_display_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_orders' }, () => {
        if (selectedTable) loadTableOrders(selectedTable)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, () => {
        loadMenu()
        loadSpecialMenu()
        loadSelectedMenu()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        loadCategories()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drink_options' }, () => {
        loadDrinkOptions()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, () => {
        loadPromotions()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        loadRestaurantInfo()
        loadSettings()
        loadSpecialMenu()
        loadBusinessHours()
        loadPrintSettings()
        loadSelectedMenu()
        reloadReceipt()
      })
      .subscribe()

    return () => {
      liveChannel.unsubscribe()
    }
  }, [selectedTable])

  useEffect(() => {
    const interval = setInterval(() => {
      loadMenu()
      loadSpecialMenu()
      loadPromotions()
      loadDrinkOptions()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  async function loadAllData() {
    setLoading(true)
    await loadRestaurantInfo()
    await loadCategories()
    await loadMenu()
    await loadTables()
    await loadSettings()
    await loadSpecialMenu()
    await loadPromotions()
    await loadBusinessHours()
    await loadDrinkOptions()
    await loadPrintSettings()
    await loadSelectedMenu()
    setLoading(false)
  }

  async function loadRestaurantInfo() {
    const { data: nameData } = await supabase.from('settings').select('value').eq('key', 'restaurant_name').single()
    if (nameData) setRestaurantName(nameData.value)
    const { data: logoData } = await supabase.from('settings').select('value').eq('key', 'logo_url').single()
    if (logoData && logoData.value) setLogoUrl(logoData.value)
  }

  async function loadCategories() {
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
  }

  async function loadBusinessHours() {
    const { data: startData } = await supabase.from('settings').select('value').eq('key', 'business_hours_start').single()
    if (startData) setBusinessHoursStart(startData.value)
    const { data: endData } = await supabase.from('settings').select('value').eq('key', 'business_hours_end').single()
    if (endData) setBusinessHoursEnd(endData.value)
  }

  async function forceRefreshMenu() {
    setRefreshing(true)
    await loadMenu()
    await loadSpecialMenu()
    await loadPromotions()
    await loadDrinkOptions()
    await loadSelectedMenu()
    setRefreshing(false)
    toast.success('Menu refreshed!')
  }

  async function loadSettings() {
    const { data } = await supabase.from('settings').select('key, value')
    if (data) {
      const sc = data.find(s => s.key === 'service_charge')
      const tx = data.find(s => s.key === 'tax')
      if (sc) setServiceChargePercent(parseFloat(sc.value) || 0)
      if (tx) setTaxPercent(parseFloat(tx.value) || 0)
    }
  }

  async function loadPrintSettings() {
    try {
      const { data } = await supabase.from('settings').select('key, value')
      if (data) {
        const settings = {}
        data.forEach(item => {
          if (item.key === 'service_charge' || item.key === 'tax') {
            settings[item.key] = parseFloat(item.value) || 0
          } else if (item.key === 'auto_print') {
            settings[item.key] = item.value === 'true'
          } else {
            settings[item.key] = item.value
          }
        })
        setPrintSettings({
          restaurant_name: settings.restaurant_name || 'Restoran Kita',
          service_charge_percent: settings.service_charge || 6,
          tax_percent: settings.tax || 6,
          auto_print: settings.auto_print || true
        })
      }
    } catch (err) {
      console.error('Error loading print settings:', err)
    }
  }

  async function loadSpecialMenu() {
    try {
      const { data: enabledData } = await supabase.from('settings').select('value').eq('key', 'special_menu_enabled').single()
      if (enabledData) setSpecialMenuEnabled(enabledData.value === 'true')
      
      const { data: titleData } = await supabase.from('settings').select('value').eq('key', 'special_menu_title').single()
      if (titleData) setSpecialMenuTitle(titleData.value)
      
      const { data: itemsData } = await supabase.from('settings').select('value').eq('key', 'special_menu_items').single()
      if (itemsData) {
        try {
          const items = JSON.parse(itemsData.value)
          const syncedItems = []
          for (const item of items) {
            if (item.menu_id) {
              const { data: menuItem } = await supabase
                .from('menu')
                .select('price, image_url, description, name')
                .eq('id', item.menu_id)
                .single()
              if (menuItem) {
                syncedItems.push({
                  ...item,
                  name: menuItem.name || item.name,
                  price: menuItem.price,
                  image_url: menuItem.image_url || item.image_url,
                  description: menuItem.description || item.description
                })
              } else {
                syncedItems.push(item)
              }
            } else {
              syncedItems.push(item)
            }
          }
          setSpecialMenuItems(syncedItems)
        } catch (e) {
          setSpecialMenuItems([])
        }
      }
    } catch (err) {
      console.error('Error loading special menu:', err)
    }
  }

  async function loadPromotions() {
    try {
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
      setPromotions(data || [])
    } catch (err) {
      console.error('Error loading promotions:', err)
    }
  }

  async function loadMenu() {
    try {
      const { data, error } = await supabase.from('menu').select('*').order('sort_order')
      if (!error && data) setMenu(data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  async function loadTables() {
    const { data } = await supabase.from('tables').select('*').order('table_number')
    if (data && data.length > 0) {
      setTables(data)
    } else {
      const newTables = []
      for (let i = 1; i <= 23; i++) {
        newTables.push({ table_number: i, status: 'available' })
      }
      setTables(newTables)
    }
  }

  async function loadTableOrders(tableNum) {
    let query = supabase.from('customer_orders').select('*').eq('payment_status', PAYMENT_STATUS.UNPAID).order('created_at', { ascending: false })
    if (tableNum === 'takeaway') {
      query = query.eq('order_type', 'take_away')
    } else if (tableNum === 'all') {
      // No filter
    } else if (tableNum && tableNum !== 'all' && tableNum !== 'takeaway') {
      query = query.eq('table_number', parseInt(tableNum))
    }
    const { data } = await query
    setTableOrders(data || [])
  }

  const selectTable = async (tableNum) => {
    setSelectedTable(tableNum)
    await loadTableOrders(tableNum)
  }

  const showAllOrders = async () => {
    setSelectedTable('all')
    await loadTableOrders('all')
  }

  const showTakeawayOrders = async () => {
    setSelectedTable('takeaway')
    await loadTableOrders('takeaway')
  }

  // ============================================================
  // GET PROMOTION INFO
  // ============================================================
  function getItemPromotion(item) {
    for (const promo of promotions) {
      if (promo.type === 'bogo') {
        const triggerItem = promo.trigger_items?.[0]
        if (triggerItem && item.id === triggerItem.id) {
          return { type: 'bogo', trigger: triggerItem, free: promo.free_items?.[0], promo: promo }
        }
      } else if (promo.type === 'bundle' || promo.type === 'set_menu') {
        const bundleItems = promo.bundle_items || []
        const found = bundleItems.find(i => i.id === item.id)
        if (found) {
          return { type: promo.type, bundleItems: bundleItems, bundlePrice: promo.bundle_price, promo: promo }
        }
      }
    }
    return null
  }

  function getPromoPrice(item) {
    const promo = getItemPromotion(item)
    if (!promo) return null
    if (promo.type === 'bogo') return 0
    if (promo.type === 'bundle' || promo.type === 'set_menu') {
      if (promo.bundlePrice > 0) return promo.bundlePrice
      const bundleItem = promo.bundleItems?.find(i => i.id === item.id)
      return bundleItem?.price || item.price
    }
    return null
  }

  function getPromoTypeLabel(type) {
    if (type === 'bogo') return t2('bogo')
    if (type === 'bundle') return t2('bundle')
    if (type === 'set_menu') return t2('set_menu')
    return t2('promo')
  }

  // ============================================================
  // ===== PAYMENT & PRINT FUNCTIONS =====
  // ============================================================
  async function markAsPaid(order) {
    const subtotal = parseFloat(order.subtotal || order.total || 0)
    const serviceCharge = order.order_type === 'take_away' ? 0 : subtotal * (serviceChargePercent / 100)
    const tax = subtotal * (taxPercent / 100)
    const grandTotal = subtotal + serviceCharge + tax

    const { error } = await supabase.from('customer_orders').update({
      payment_status: 'paid', 
      payment_method: paymentMethod, 
      paid_at: new Date().toISOString(),
      subtotal, 
      service_charge: serviceCharge, 
      tax, 
      grand_total: grandTotal
    }).eq('id', order.id)

    if (error) {
      toast.error(t2('error_updating') + ': ' + error.message)
      return
    }

    if (selectedTable === 'takeaway') {
      await loadTableOrders('takeaway')
    } else if (selectedTable === 'all') {
      await loadTableOrders('all')
    } else {
      await loadTableOrders(selectedTable)
    }
    
    setShowPaymentModal(false)
    setSelectedOrder(null)
    toast.success(`✅ ${t2('payment_received')} RM ${grandTotal.toFixed(2)}!`)
    
    // ===== PRINT RECEIPT USING USE RECEIPT HOOK =====
    const receiptOrder = { 
      ...order, 
      payment_method: paymentMethod, 
      paid_at: new Date().toISOString(), 
      subtotal, 
      service_charge: serviceCharge, 
      tax, 
      grand_total: grandTotal 
    }
    
    if (receiptSettings) {
      try {
        const receiptText = generateReceipt({
          ...receiptOrder,
          order_number: order.order_number || `ORD-${order.id}`,
          customer_name: order.customer_name || 'Guest',
          table_number: order.table_number || null,
          order_type: order.order_type || 'dine_in',
          staff_name: 'System',
          items: order.items || [],
          subtotal: subtotal,
          service_charge: serviceCharge,
          tax: tax,
          total: grandTotal,
          payment_method: paymentMethod,
          paid_amount: grandTotal
        })
        await printReceipt(receiptText)
        console.log('✅ Receipt printed successfully from CustomerDisplay')
      } catch (receiptError) {
        console.error('Error printing receipt with hook:', receiptError)
        printReceiptDirect(receiptOrder)
      }
    } else {
      printReceiptDirect(receiptOrder)
    }
  }

  // ===== ORIGINAL PRINT METHOD (FALLBACK) =====
  const printReceiptDirect = (order) => {
    const method = order.payment_method || paymentMethod || 'cash'
    
    const receiptHTML = generateReceiptHTML(order, {
      restaurant_name: printSettings.restaurant_name || 'Restoran Kita',
      service_charge_percent: printSettings.service_charge_percent || 6,
      tax_percent: printSettings.tax_percent || 6,
      payment_method: method,
      darkMode: darkMode
    })
    
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (printWindow) {
      printWindow.document.write(receiptHTML)
      printWindow.document.close()
    }
  }

  // ===== PRINT RECEIPT WITH HOOK (RENAME TO AVOID CONFLICT) =====
  const printReceiptWithHook = (order) => {
    if (receiptSettings) {
      try {
        const subtotal = order.subtotal || order.total || 0
        const serviceCharge = order.service_charge || (subtotal * (serviceChargePercent / 100))
        const tax = order.tax || (subtotal * (taxPercent / 100))
        const grandTotal = order.grand_total || (subtotal + serviceCharge + tax)
        
        const receiptText = generateReceipt({
          ...order,
          order_number: order.order_number || `ORD-${order.id}`,
          customer_name: order.customer_name || 'Guest',
          table_number: order.table_number || null,
          order_type: order.order_type || 'dine_in',
          staff_name: 'System',
          items: order.items || [],
          subtotal: subtotal,
          service_charge: serviceCharge,
          tax: tax,
          total: grandTotal,
          payment_method: order.payment_method || paymentMethod || 'cash',
          paid_amount: grandTotal
        })
        printReceipt(receiptText)
        console.log('✅ Receipt printed successfully from CustomerDisplay (view)')
      } catch (err) {
        console.error('Error printing receipt:', err)
        printReceiptDirect(order)
      }
    } else {
      printReceiptDirect(order)
    }
  }

  const printAllReceipts = () => {
    if (tableOrders.length === 0) { toast.error(t2('no_orders')); return }
    tableOrders.forEach(order => printReceiptWithHook(order))
    toast.success(t2('btn_print') + '...')
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const getDefaultIcon = (category) => {
    const foundCat = categories.find(c => c.name === category)
    if (foundCat) return foundCat.icon
    switch(category) {
      case 'Makanan': return '🍚'
      case 'Minuman': return '🥤'
      default: return '🍽️'
    }
  }

  // Filter orders
  const filteredOrders = tableOrders.filter(order => {
    if (!searchOrder) return true
    return order.customer_name?.toLowerCase().includes(searchOrder.toLowerCase()) ||
           order.order_number?.toLowerCase().includes(searchOrder.toLowerCase())
  })

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: bgColor 
      }}>
        <div className="spinner"></div>
      </div>
    )
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={{ 
      padding: '16px 24px', 
      background: bgColor, 
      minHeight: '100vh',
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* ===== HEADER ===== */}
      <div style={{ 
        ...glassEffect, 
        borderRadius: '20px', 
        padding: '12px 24px', 
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
            padding: '8px 20px', 
            borderRadius: '60px',
            boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
            minWidth: '160px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: 'white', 
              letterSpacing: '2px', 
              fontFamily: 'monospace' 
            }}>
              {formatMalaysiaTime(currentTime)}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
              📅 {formatMalaysiaDate(currentTime)}
            </div>
          </div>
          
          <div style={{ 
            background: isOpen ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            padding: '6px 14px',
            borderRadius: '40px',
            border: `1px solid ${isOpen ? '#22c55e' : '#ef4444'}`
          }}>
            <span style={{ 
              color: isOpen ? '#22c55e' : '#ef4444',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                background: isOpen ? '#22c55e' : '#ef4444', 
                borderRadius: '50%', 
                display: 'inline-block',
                animation: isOpen ? 'pulse 1.5s infinite' : 'none'
              }}></span>
              {isOpen ? t2('open') : t2('closed')} • {businessHoursStart}-{businessHoursEnd}
            </span>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '14px',
          flex: 1,
          justifyContent: 'center'
        }}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={restaurantName} 
              style={{ 
                height: '70px', 
                width: 'auto', 
                maxWidth: '220px',
                objectFit: 'contain',
                borderRadius: '12px',
                filter: darkMode ? 'brightness(0.95)' : 'none'
              }} 
            />
          ) : (
            <div style={{ 
              width: '70px', 
              height: '70px', 
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '36px',
              boxShadow: '0 4px 20px rgba(245,158,11,0.3)'
            }}>
              🏪
            </div>
          )}
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '26px', 
              fontWeight: 'bold', 
              color: textColor,
              letterSpacing: '0.5px'
            }}>
              {restaurantName}
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: '12px', 
              color: textMuted,
              textAlign: 'center'
            }}>
              {t2('menu_pricing')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <button 
            onClick={toggleDarkMode} 
            style={{ 
              background: secondaryBg, 
              border: `1px solid ${borderColor}`, 
              borderRadius: '40px', 
              padding: '8px 12px', 
              cursor: 'pointer', 
              fontSize: '18px',
              transition: 'all 0.2s'
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <button 
            onClick={() => setLanguage(language === 'bm' ? 'en' : 'bm')} 
            style={{ 
              background: secondaryBg, 
              border: `1px solid ${borderColor}`, 
              borderRadius: '40px', 
              padding: '8px 14px', 
              cursor: 'pointer', 
              fontSize: '12px', 
              fontWeight: 'bold',
              color: textColor
            }}
          >
            {language === 'bm' ? '🇺🇸 EN' : '🇲🇾 BM'}
          </button>
          
          <button 
            onClick={forceRefreshMenu} 
            disabled={refreshing} 
            style={{ 
              background: '#22c55e', 
              color: 'white', 
              border: 'none', 
              borderRadius: '40px', 
              padding: '8px 14px', 
              cursor: 'pointer',
              opacity: refreshing ? 0.6 : 1,
              fontSize: '16px'
            }}
          >
            🔄
          </button>
        </div>
      </div>

      {/* ===== PROMOTIONS BANNER ===== */}
      {promotions.length > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
          borderRadius: '20px',
          padding: isMobile ? '16px 20px' : '24px 32px',
          marginBottom: '16px',
          boxShadow: '0 8px 32px rgba(239,68,68,0.4)',
          border: '2px solid #fca5a5',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          animation: 'pulseGlow 2s ease-in-out infinite'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }} />
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '10px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                fontSize: isMobile ? '40px' : '56px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}>
                🔥
              </div>
              <div>
                <div style={{ 
                  fontSize: isMobile ? '22px' : '34px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  letterSpacing: '1px'
                }}>
                  {t2('promo')}
                </div>
                <div style={{ 
                  fontSize: isMobile ? '11px' : '14px', 
                  color: '#fca5a5',
                  fontWeight: '500'
                }}>
                  {promotions.length} {language === 'bm' ? 'promosi aktif' : 'active promotions'}
                </div>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              padding: '6px 20px',
              borderRadius: '30px',
              fontSize: isMobile ? '11px' : '14px',
              fontWeight: 'bold',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              🎉 {language === 'bm' ? 'JANGAN LEPASKAN!' : "DON'T MISS OUT!"}
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile 
              ? '1fr' 
              : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: isMobile ? '12px' : '16px',
            position: 'relative',
            zIndex: 1
          }}>
            {promotions.slice(0, 6).map((promo, idx) => {
              const itemCount = promo.bundle_items?.length || 0
              const isBOGO = promo.type === 'bogo'
              const triggerName = promo.trigger_items?.[0]?.name || ''
              const freeName = promo.free_items?.[0]?.name || ''
              
              return (
                <div 
                  key={idx} 
                  style={{ 
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px', 
                    padding: isMobile ? '14px 18px' : '18px 24px', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.25)',
                      color: 'white',
                      padding: '2px 12px',
                      borderRadius: '20px',
                      fontSize: isMobile ? '9px' : '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {getPromoTypeLabel(promo.type)}
                    </span>
                    {promo.bundle_price > 0 && (
                      <span style={{
                        color: '#fcd34d',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '14px' : '18px'
                      }}>
                        RM {promo.bundle_price}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: isMobile ? '14px' : '18px', 
                    color: 'white',
                    textShadow: '0 1px 4px rgba(0,0,0,0.2)'
                  }}>
                    {promo.name}
                  </div>
                  
                  <div style={{ 
                    fontSize: isMobile ? '11px' : '13px', 
                    color: '#fca5a5',
                    marginTop: '4px'
                  }}>
                    {isBOGO ? (
                      `🎁 ${triggerName} → ${freeName || 'FREE'}`
                    ) : (
                      `${itemCount} ${language === 'bm' ? 'item termasuk' : 'items included'}`
                    )}
                  </div>
                  
                  {promo.image_url && (
                    <div style={{ marginTop: '8px' }}>
                      <img 
                        src={promo.image_url} 
                        alt={promo.name}
                        style={{
                          width: '100%',
                          height: isMobile ? '60px' : '80px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                          opacity: 0.9
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {promotions.length > 6 && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '10px',
              color: '#fca5a5',
              fontSize: isMobile ? '11px' : '13px',
              position: 'relative',
              zIndex: 1
            }}>
              + {promotions.length - 6} {language === 'bm' ? 'lagi promosi' : 'more promotions'} 🔥
            </div>
          )}
        </div>
      )}

      {/* ===== SPECIAL MENU BANNER ===== */}
      {specialMenuEnabled && specialMenuItems.length > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #fef3c7, #fde68a, #f59e0b, #d97706)',
          borderRadius: '20px', 
          padding: isMobile ? '16px 20px' : '24px 32px', 
          marginBottom: '16px',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.35)',
          border: '2px solid #f59e0b',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }} />
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '10px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                fontSize: isMobile ? '40px' : '56px',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                ⭐
              </div>
              <div>
                <div style={{ 
                  fontSize: isMobile ? '22px' : '34px', 
                  fontWeight: 'bold', 
                  color: '#92400e',
                  textShadow: '0 2px 8px rgba(245,158,11,0.2)',
                  letterSpacing: '1px'
                }}>
                  {specialMenuTitle}
                </div>
                <div style={{ 
                  fontSize: isMobile ? '11px' : '14px', 
                  color: '#78350f',
                  opacity: 0.8
                }}>
                  🌟 {t2('special_today')}
                </div>
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              padding: '6px 24px',
              borderRadius: '30px',
              fontSize: isMobile ? '12px' : '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              🔥 {language === 'bm' ? 'ISTIMEWA' : 'SPECIAL'}
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: isMobile ? '10px' : '14px',
            position: 'relative',
            zIndex: 1
          }}>
            {specialMenuItems.slice(0, isMobile ? 4 : 8).map((item, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px', 
                  padding: isMobile ? '12px 16px' : '16px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  minHeight: isMobile ? '70px' : '90px'
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      style={{ 
                        width: isMobile ? '48px' : '64px', 
                        height: isMobile ? '48px' : '64px', 
                        borderRadius: '12px', 
                        objectFit: 'cover',
                        border: '2px solid #f59e0b'
                      }} 
                    />
                  ) : (
                    <div style={{ 
                      width: isMobile ? '48px' : '64px', 
                      height: isMobile ? '48px' : '64px', 
                      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: isMobile ? '24px' : '32px',
                      border: '2px solid #f59e0b'
                    }}>
                      ⭐
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: isMobile ? '13px' : '16px', 
                    color: '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.name}
                  </div>
                  {item.description && (
                    <div style={{ 
                      fontSize: isMobile ? '9px' : '11px', 
                      color: '#64748b', 
                      fontStyle: 'italic',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      📝 {item.description}
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  padding: isMobile ? '4px 12px' : '6px 18px',
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '14px' : '18px',
                  boxShadow: '0 2px 12px rgba(34,197,94,0.3)',
                  minWidth: isMobile ? '60px' : '80px',
                  textAlign: 'center'
                }}>
                  RM {item.price}
                </div>
              </div>
            ))}
          </div>
          
          {specialMenuItems.length > (isMobile ? 4 : 8) && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: '10px',
              color: '#78350f',
              fontSize: isMobile ? '11px' : '13px',
              opacity: 0.7,
              position: 'relative',
              zIndex: 1
            }}>
              + {specialMenuItems.length - (isMobile ? 4 : 8)} {language === 'bm' ? 'lagi item istimewa' : 'more special items'} 🎉
            </div>
          )}
        </div>
      )}

      {/* ===== MENU GRID ===== */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {displayMenuItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '40px 20px' : '80px 20px', 
            ...glassEffect, 
            borderRadius: '24px' 
          }}>
            <span style={{ fontSize: isMobile ? '48px' : '64px', opacity: 0.5 }}>📭</span>
            <p style={{ color: textMuted, marginTop: '12px', fontSize: isMobile ? '14px' : '16px' }}>
              {t2('no_menu_selected')}
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '16px'
          }}>
            {displayMenuItems.map(item => {
              const hasImage = item.image_url && item.image_url.trim() !== ''
              const promo = getItemPromotion(item)
              const promoPrice = getPromoPrice(item)
              const hasDescription = item.description && item.description.trim() !== ''
              const hasDrinkOptions = getDrinkOptionsForItem(item).length > 0
              const drinkOpts = getDrinkOptionsForItem(item)
              
              return (
                <div 
                  key={item.id} 
                  style={{ 
                    background: cardBg,
                    borderRadius: '20px',
                    padding: '18px',
                    textAlign: 'center',
                    border: `1px solid ${borderColor}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default',
                    position: 'relative',
                    boxShadow: darkMode ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.06)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = darkMode 
                      ? '0 8px 32px rgba(0,0,0,0.4)' 
                      : '0 8px 32px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = darkMode ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.06)'
                  }}
                >
                  {promo && (
                    <div style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: promoColor,
                      color: 'white',
                      padding: '2px 12px',
                      borderRadius: '20px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                      zIndex: 5
                    }}>
                      {promo.type === 'bogo' ? '🎁 BOGO' : 
                       promo.type === 'bundle' ? '📦 Bundle' : 
                       promo.type === 'set_menu' ? '🍽️ Set' : '🔥 Promo'}
                    </div>
                  )}
                  
                  {hasImage ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      style={{ 
                        width: '100%',
                        maxWidth: '200px',
                        height: '160px', 
                        objectFit: 'contain',
                        borderRadius: '12px', 
                        margin: '0 auto 12px auto',
                        display: 'block',
                        background: '#f8fafc',
                        padding: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}
                      onError={(e) => { 
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '56px', marginBottom: '10px' }}>{getDefaultIcon(item.category)}</div>
                  )}
                  
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: isMobile ? '16px' : '18px', 
                    color: textColor, 
                    marginBottom: '4px'
                  }}>
                    {item.name}
                  </div>
                  
                  {hasDescription && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: textMuted, 
                      fontStyle: 'italic',
                      marginBottom: '6px',
                      background: secondaryBg,
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}>
                      📝 {item.description}
                    </div>
                  )}
                  
                  <div style={{ 
                    color: darkMode ? '#4ade80' : '#22c55e', 
                    fontWeight: 'bold', 
                    fontSize: '22px',
                    background: secondaryBg,
                    display: 'inline-block',
                    padding: '4px 20px',
                    borderRadius: '30px',
                    marginBottom: '8px'
                  }}>
                    {promoPrice !== null ? (
                      <span style={{ color: promoColor }}>
                        RM {promoPrice}
                      </span>
                    ) : (
                      `RM ${item.price}`
                    )}
                  </div>
                  
                  {hasDrinkOptions && (
                    <div style={{
                      marginTop: '8px',
                      paddingTop: '8px',
                      borderTop: `1px solid ${borderColor}`,
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '6px',
                      flexWrap: 'wrap'
                    }}>
                      {drinkOpts.slice(0, 3).map(opt => (
                        <div key={opt.id} style={{
                          fontSize: '10px',
                          background: secondaryBg,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          color: textMuted,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          border: `1px solid ${borderColor}`,
                          minWidth: '50px'
                        }}>
                          {opt.image_url ? (
                            <img 
                              src={opt.image_url} 
                              alt={opt.option_type}
                              style={{
                                width: '32px',
                                height: '32px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: `1px solid ${borderColor}`
                              }}
                            />
                          ) : (
                            <span style={{ fontSize: '16px' }}>{getOptionEmoji(opt.option_type)}</span>
                          )}
                          <span style={{ fontSize: '8px', fontWeight: 'bold' }}>{getOptionLabel(opt.option_type)}</span>
                          <span style={{ color: priceColor, fontWeight: 'bold', fontSize: '10px' }}>
                            RM {parseFloat(opt.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {drinkOpts.length > 3 && (
                        <span style={{
                          fontSize: '9px',
                          color: textMuted,
                          padding: '2px 6px',
                          alignSelf: 'center'
                        }}>
                          +{drinkOpts.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ===== HIDDEN AREA - KLIK KIRI UNTUK PILIH MENU ===== */}
      <div 
        onClick={() => {
          setTempSelectedMenuIds(selectedMenuIds)
          setShowMenuSelector(true)
        }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: isMobile ? '50%' : '30%',
          height: '70px',
          cursor: 'pointer',
          zIndex: 999,
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={t2('tap_left_select')}
      >
        {showHiddenHints && (
          <div style={{
            background: 'rgba(59,130,246,0.12)',
            backdropFilter: 'blur(8px)',
            padding: '6px 16px',
            borderRadius: '30px',
            border: '1px dashed rgba(59,130,246,0.25)',
            fontSize: isMobile ? '9px' : '11px',
            color: '#3b82f6',
            fontWeight: 'bold',
            animation: 'pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            📋 {t2('tap_left_select')}
          </div>
        )}
      </div>

      {/* ===== HIDDEN AREA - KLIK KANAN UNTUK BILLING ===== */}
      <div 
        onClick={() => setShowBillingModal(true)}
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: isMobile ? '50%' : '30%',
          height: '70px',
          cursor: 'pointer',
          zIndex: 999,
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={t2('tap_right_pay')}
      >
        {showHiddenHints && (
          <div style={{
            background: 'rgba(245,158,11,0.12)',
            backdropFilter: 'blur(8px)',
            padding: '6px 16px',
            borderRadius: '30px',
            border: '1px dashed rgba(245,158,11,0.25)',
            fontSize: isMobile ? '9px' : '11px',
            color: '#f59e0b',
            fontWeight: 'bold',
            animation: 'pulse 2s ease-in-out infinite',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            💰 {t2('tap_right_pay')}
          </div>
        )}
      </div>

      {/* ===== MENU SELECTOR MODAL ===== */}
      {showMenuSelector && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          zIndex: 2000, animation: 'fadeIn 0.25s ease' 
        }}>
          <div style={{ 
            background: modalBg, borderRadius: '28px', padding: '28px', 
            maxWidth: '550px', width: '92%', maxHeight: '80vh', 
            overflowY: 'auto', ...glassEffect, animation: 'popIn 0.3s ease' 
          }}>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h2 style={{ 
                fontSize: '20px', 
                color: textColor, 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                ✏️ {t2('select_menu_title')}
              </h2>
              <button 
                onClick={() => setShowMenuSelector(false)} 
                style={{ 
                  background: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '40px', 
                  padding: '6px 16px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ 
              marginBottom: '14px',
              padding: '10px 14px',
              background: secondaryBg,
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: textColor, fontWeight: 'bold', fontSize: '13px' }}>
                {t2('select_all')}
              </span>
              <button
                onClick={toggleAllMenu}
                style={{
                  padding: '4px 16px',
                  background: tempSelectedMenuIds.length === menu.length ? '#ef4444' : '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                {tempSelectedMenuIds.length === menu.length ? '✕' : '✓'}
              </button>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
              gap: '8px',
              marginBottom: '16px'
            }}>
              {menu.map(item => {
                const isSelected = tempSelectedMenuIds.includes(item.id)
                const hasImage = item.image_url && item.image_url.trim() !== ''
                
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleMenuSelection(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: isSelected ? 'rgba(59,130,246,0.15)' : secondaryBg,
                      border: isSelected ? `2px solid #3b82f6` : `1px solid ${borderColor}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#3b82f6'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = borderColor
                      }
                    }}
                  >
                    {hasImage ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: secondaryBg,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        {getDefaultIcon(item.category)}
                      </div>
                    )}
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '13px', 
                        color: textColor 
                      }}>
                        {item.name}
                      </div>
                      <div style={{ 
                        fontSize: '11px', 
                        color: textMuted 
                      }}>
                        RM {item.price} • {item.category}
                      </div>
                    </div>
                    
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isSelected ? '#3b82f6' : '#e2e8f0',
                      color: isSelected ? 'white' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {isSelected ? '✓' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={saveSelectedMenu}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                💾 {language === 'bm' ? 'Simpan' : 'Save'}
              </button>
              <button
                onClick={() => setShowMenuSelector(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {language === 'bm' ? 'Tutup' : 'Close'}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ===== BILLING MODAL ===== */}
      {showBillingModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          zIndex: 3000, animation: 'fadeIn 0.25s ease' 
        }}>
          <div style={{ 
            background: modalBg, borderRadius: '28px', padding: '24px', 
            maxWidth: '900px', width: '92%', maxHeight: '85vh', 
            overflowY: 'auto', 
            ...glassEffect, animation: 'popIn 0.3s ease' 
          }}>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <h2 style={{ 
                fontSize: '22px', 
                color: textColor, 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                💰 {t2('billing')}
              </h2>
              <button 
                onClick={() => { setShowBillingModal(false); setSelectedTable(null); }} 
                style={{ 
                  background: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '40px', 
                  padding: '8px 20px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {t2('close')}
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '20px', 
              flexWrap: 'wrap' 
            }}>
              <button 
                onClick={showTakeawayOrders} 
                style={{ 
                  padding: '8px 20px', 
                  background: selectedTable === 'takeaway' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : secondaryBg, 
                  color: selectedTable === 'takeaway' ? 'white' : textColor, 
                  border: `1px solid ${borderColor}`, 
                  borderRadius: '40px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                🥡 {t2('take_away')}
              </button>
              <button 
                onClick={showAllOrders} 
                style={{ 
                  padding: '8px 20px', 
                  background: selectedTable === 'all' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : secondaryBg, 
                  color: selectedTable === 'all' ? 'white' : textColor, 
                  border: `1px solid ${borderColor}`, 
                  borderRadius: '40px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                📋 {t2('all_orders')}
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '10px', 
                color: textMuted, 
                fontSize: '13px' 
              }}>
                {t2('select_table')}:
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
                gap: '8px' 
              }}>
                {tables.slice(0, 23).map(table => (
                  <button 
                    key={table.table_number} 
                    onClick={() => selectTable(table.table_number)} 
                    style={{ 
                      padding: '10px 0', 
                      background: selectedTable === table.table_number ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : secondaryBg, 
                      color: selectedTable === table.table_number ? 'white' : textColor, 
                      border: `1px solid ${borderColor}`, 
                      borderRadius: '10px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    {table.table_number}
                  </button>
                ))}
              </div>
            </div>

            {selectedTable && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '14px', 
                  paddingBottom: '10px', 
                  borderBottom: `2px solid ${borderColor}` 
                }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    margin: 0, 
                    color: textColor, 
                    fontWeight: 'bold' 
                  }}>
                    {selectedTable === 'takeaway' ? `🥡 ${t2('take_away')}` : 
                     selectedTable === 'all' ? `🧾 ${t2('all_orders')}` : 
                     `🧾 ${t2('table_number')} ${selectedTable}`}
                  </h3>
                  {tableOrders.length > 0 && (
                    <button 
                      onClick={printAllReceipts} 
                      style={{ 
                        background: '#0ea5e9', 
                        color: 'white', 
                        padding: '6px 16px', 
                        border: 'none', 
                        borderRadius: '30px', 
                        cursor: 'pointer', 
                        fontWeight: 'bold', 
                        fontSize: '11px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.96)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      🖨️ {t2('print_all')}
                    </button>
                  )}
                </div>

                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    fontSize: '13px', 
                    color: textMuted 
                  }}>
                    🔍
                  </span>
                  <input 
                    type="text" 
                    placeholder={t2('find_order')} 
                    value={searchOrder} 
                    onChange={(e) => setSearchOrder(e.target.value)} 
                    style={{ 
                      width: '100%', 
                      padding: '10px 16px 10px 40px', 
                      borderRadius: '40px', 
                      border: `1px solid ${borderColor}`, 
                      background: inputBg, 
                      color: textColor, 
                      outline: 'none', 
                      fontSize: '13px' 
                    }} 
                  />
                </div>

                {filteredOrders.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px', 
                    ...glassEffect, 
                    borderRadius: '20px' 
                  }}>
                    <span style={{ fontSize: '40px', opacity: 0.5 }}>📋</span>
                    <p style={{ color: textMuted, marginTop: '8px' }}>{t2('no_orders')}</p>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const subtotal = order.subtotal || order.total
                    const sc = order.service_charge || (subtotal * (serviceChargePercent / 100))
                    const tax = order.tax || (subtotal * (taxPercent / 100))
                    const grandTotal = order.grand_total || (subtotal + sc + tax)
                    return (
                      <div key={order.id} style={{ 
                        ...glassEffect, 
                        borderRadius: '18px', 
                        marginBottom: '14px', 
                        overflow: 'hidden' 
                      }}>
                        <div style={{ 
                          padding: '12px 18px', 
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                          color: 'white', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          flexWrap: 'wrap', 
                          gap: '6px' 
                        }}>
                          <div>
                            <span style={{ fontSize: '18px', marginRight: '6px' }}>
                              {order.order_type === 'take_away' ? '🥡' : '🍽️'}
                            </span>
                            <strong>{order.customer_name || 'Guest'}</strong>
                            <span style={{ fontSize: '12px', opacity: 0.85, marginLeft: '6px' }}>
                              - {order.order_type === 'take_away' ? t2('take_away') : `${t2('table_number')} ${order.table_number}`}
                            </span>
                          </div>
                          <div style={{ fontSize: '10px', opacity: 0.85 }}>
                            🕐 {formatOrderTime(order.created_at)}
                          </div>
                        </div>
                        <div style={{ padding: '12px 18px' }}>
                          {order.items?.map((item, idx) => (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              padding: '6px 0', 
                              borderBottom: idx !== order.items.length - 1 ? `1px solid ${borderColor}` : 'none' 
                            }}>
                              <span style={{ color: textColor, fontSize: '13px' }}>
                                {item.name}
                                {item.option && <span style={{ fontSize: '10px', color: textMuted, marginLeft: '4px' }}>({item.option})</span>}
                                {item.size && <span style={{ fontSize: '10px', color: textMuted, marginLeft: '4px' }}>• {item.size}</span>}
                                {' x' + item.quantity}
                              </span>
                              <span style={{ 
                                color: darkMode ? '#4ade80' : '#22c55e', 
                                fontWeight: 'bold', 
                                fontSize: '13px' 
                              }}>
                                {item.isFree ? 'FREE' : `RM ${(item.price * item.quantity).toFixed(2)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div style={{ 
                          padding: '10px 18px', 
                          background: secondaryBg, 
                          borderTop: `1px solid ${borderColor}`, 
                          borderBottom: `1px solid ${borderColor}` 
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '12px', 
                            marginBottom: '2px' 
                          }}>
                            <span>{t2('subtotal')}:</span>
                            <span>RM {subtotal.toFixed(2)}</span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '12px', 
                            marginBottom: '2px' 
                          }}>
                            <span>{t2('service_charge')} ({serviceChargePercent}%):</span>
                            <span>RM {sc.toFixed(2)}</span>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontSize: '12px', 
                            marginBottom: '2px' 
                          }}>
                            <span>{t2('tax')} ({taxPercent}%):</span>
                            <span>RM {tax.toFixed(2)}</span>
                          </div>
                          <div style={{ 
                            borderTop: `1px solid ${borderColor}`, 
                            marginTop: '6px', 
                            paddingTop: '6px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            fontWeight: 'bold', 
                            fontSize: '16px' 
                          }}>
                            <span>{t2('total')}:</span>
                            <span style={{ color: '#22c55e' }}>RM {grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                        <div style={{ 
                          padding: '10px 18px', 
                          display: 'flex', 
                          gap: '10px', 
                          justifyContent: 'flex-end' 
                        }}>
                          <button 
                            onClick={() => printReceiptWithHook(order)} 
                            style={{ 
                              background: '#0ea5e9', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '30px', 
                              padding: '6px 20px', 
                              cursor: 'pointer', 
                              fontWeight: 'bold', 
                              fontSize: '12px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.96)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            🧾 {t2('preview_receipt')}
                          </button>
                          <button 
                            onClick={() => { setSelectedOrder(order); setShowPaymentModal(true) }} 
                            style={{ 
                              background: '#22c55e', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '30px', 
                              padding: '6px 24px', 
                              cursor: 'pointer', 
                              fontWeight: 'bold', 
                              fontSize: '12px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.96)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            💰 {t2('btn_pay')}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== PAYMENT MODAL ===== */}
      {showPaymentModal && selectedOrder && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', 
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          zIndex: 4000, animation: 'fadeIn 0.25s ease' 
        }}>
          <div style={{ 
            background: modalBg, borderRadius: '28px', padding: '28px', 
            maxWidth: '380px', width: '90%', ...glassEffect, animation: 'popIn 0.3s ease' 
          }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '56px', height: '56px', 
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                borderRadius: '28px', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 10px auto' 
              }}>
                <span style={{ fontSize: '26px' }}>💰</span>
              </div>
              <h2 style={{ 
                fontSize: '20px', 
                color: textColor, 
                fontWeight: 'bold' 
              }}>
                {t2('record_payment')}
              </h2>
            </div>
            
            {(() => {
              const subtotal = selectedOrder.subtotal || selectedOrder.total
              const sc = selectedOrder.service_charge || (subtotal * (serviceChargePercent / 100))
              const tax = selectedOrder.tax || (subtotal * (taxPercent / 100))
              const grandTotal = selectedOrder.grand_total || (subtotal + sc + tax)
              return (
                <>
                  <div style={{ 
                    background: secondaryBg, 
                    padding: '16px', 
                    borderRadius: '16px', 
                    margin: '12px 0' 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '6px', 
                      fontSize: '12px' 
                    }}>
                      <span>{t2('subtotal')}:</span>
                      <span>RM {subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '6px', 
                      fontSize: '12px' 
                    }}>
                      <span>{t2('service_charge')} ({serviceChargePercent}%):</span>
                      <span>RM {sc.toFixed(2)}</span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      marginBottom: '6px', 
                      fontSize: '12px' 
                    }}>
                      <span>{t2('tax')} ({taxPercent}%):</span>
                      <span>RM {tax.toFixed(2)}</span>
                    </div>
                    <div style={{ 
                      borderTop: `1px solid ${borderColor}`, 
                      marginTop: '10px', 
                      paddingTop: '10px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontWeight: 'bold', 
                      fontSize: '18px' 
                    }}>
                      <span>{t2('total')}:</span>
                      <span style={{ color: '#22c55e' }}>RM {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: 'bold', 
                      color: textColor, 
                      fontSize: '12px' 
                    }}>
                      {t2('payment_method')}:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {['cash', 'tng', 'bank'].map(method => (
                        <button 
                          key={method} 
                          onClick={() => setPaymentMethod(method)} 
                          style={{ 
                            flex: 1, 
                            padding: '10px', 
                            background: paymentMethod === method ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : secondaryBg, 
                            color: paymentMethod === method ? 'white' : textColor, 
                            border: `1px solid ${borderColor}`, 
                            borderRadius: '14px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold', 
                            fontSize: '12px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {method === 'cash' ? '💵 ' + t2('cash') : 
                           method === 'tng' ? '📱 ' + t2('tng') : 
                           '🏦 ' + t2('bank')}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )
            })()}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => markAsPaid(selectedOrder)} 
                style={{ 
                  flex: 1, 
                  background: '#22c55e', 
                  color: 'white', 
                  padding: '12px', 
                  border: 'none', 
                  borderRadius: '50px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                ✅ {t2('btn_save')}
              </button>
              <button 
                onClick={() => { setShowPaymentModal(false); setSelectedOrder(null) }} 
                style={{ 
                  flex: 1, 
                  background: '#ef4444', 
                  color: 'white', 
                  padding: '12px', 
                  border: 'none', 
                  borderRadius: '50px', 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.96)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                ❌ {t2('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ===== STYLES ===== */}
      <style>
        {`
          .spinner { 
            width: 48px; 
            height: 48px; 
            border: 4px solid rgba(59,130,246,0.15); 
            border-top-color: #3b82f6; 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
            margin: 0 auto; 
          }
          
          @keyframes spin { 
            to { transform: rotate(360deg); } 
          }
          
          @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
          }
          
          @keyframes popIn { 
            0% { opacity: 0; transform: scale(0.95) translateY(10px); } 
            100% { opacity: 1; transform: scale(1) translateY(0); } 
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.05); opacity: 1; }
          }
          
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 8px 32px rgba(239,68,68,0.4); }
            50% { box-shadow: 0 8px 48px rgba(239,68,68,0.6); }
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
          
          button, input { 
            transition: all 0.2s ease; 
          }
          
          input:focus { 
            outline: none; 
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
          }
        `}
      </style>
    </div>
  )
}

export default CustomerDisplay