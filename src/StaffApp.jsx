import { useState, useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabase'
import toast from 'react-hot-toast'
import { playSound, initSound, unlockAudio } from './utils/sound'
import { ORDER_STATUS, PAYMENT_STATUS, normalizeOrderForInsert } from './lib/orderWorkflow'

// ===== IMPORT USE RECEIPT HOOK =====
import { useReceipt } from './hooks/useReceipt'

function StaffApp() {
  const { darkMode } = useTheme()
  const { language } = useLanguage()
  
  // ===== USE RECEIPT HOOK =====
  const { 
    settings: receiptSettings, 
    loading: receiptLoading, 
    generateReceipt, 
    printReceipt,
    reload: reloadReceipt 
  } = useReceipt()
  
  // ============================================================
  // TRANSLATIONS
  // ============================================================
  const t = (key) => {
    const translations = {
      pos: { en: '🧾 POS', ms: 'Jualan' },
      new_order: { en: '🆕 New Orders', ms: 'Pesanan Baru' },
      unpaid: { en: '💰 Unpaid', ms: 'Belum Bayar' },
      history: { en: '📜 History', ms: 'Sejarah' },
      dine_in: { en: '🍽️ Dine In', ms: 'Makan di Sini' },
      take_away: { en: '🥡 Take Away', ms: 'Bungkus' },
      table: { en: 'Table', ms: 'Meja' },
      customer_name: { en: 'Customer', ms: 'Pelanggan' },
      customer_phone: { en: 'Phone', ms: 'Telefon' },
      table_number: { en: 'Table No.', ms: 'No. Meja' },
      add: { en: 'Add', ms: 'Tambah' },
      cart: { en: '🛒 Cart', ms: 'Keranjang' },
      empty_cart: { en: 'Cart is empty', ms: 'Keranjang kosong' },
      subtotal: { en: 'Subtotal', ms: 'Subtotal' },
      service_charge: { en: 'Service Charge', ms: 'Caj Perkhidmatan' },
      tax: { en: 'Tax', ms: 'Cukai' },
      total: { en: 'Total', ms: 'Jumlah' },
      place_order: { en: 'Send Order', ms: 'Hantar Pesanan' },
      accept: { en: 'Accept', ms: 'Terima' },
      cancel: { en: 'Cancel', ms: 'Batal' },
      record_payment: { en: 'Record Payment', ms: 'Rekod Bayaran' },
      payment_method: { en: 'Payment Method', ms: 'Kaedah Bayaran' },
      cash: { en: 'Cash', ms: 'Tunai' },
      tng: { en: 'TnG', ms: 'TnG' },
      bank: { en: 'Bank', ms: 'Bank' },
      save: { en: 'Save', ms: 'Simpan' },
      payment_received: { en: 'Payment received', ms: 'Bayaran diterima' },
      refresh: { en: 'Refresh', ms: 'Segar' },
      sound_test: { en: '🔊 Test Sound', ms: 'Uji Bunyi' },
      no_data: { en: 'No data', ms: 'Tiada data' },
      guest: { en: 'Guest', ms: 'Tetamu' },
      all_categories: { en: '📋 All', ms: 'Semua' },
      order_added: { en: '✅ Added!', ms: 'Ditambah!' },
      cart_empty_msg: { en: 'Cart is empty', ms: 'Keranjang kosong' },
      confirm_clear_cart: { en: 'Clear cart?', ms: 'Kosongkan keranjang?' },
      order_cancelled: { en: 'Cancelled', ms: 'Dibatalkan' },
      order_sent: { en: 'Order sent!', ms: 'Pesanan dihantar!' },
      error_checkout: { en: 'Error', ms: 'Ralat' },
      no_unpaid_orders_msg: { en: 'No unpaid orders', ms: 'Tiada pesanan belum bayar' },
      no_new_orders: { en: 'No new orders', ms: 'Tiada pesanan baru' },
      no_history_orders: { en: 'No history', ms: 'Tiada sejarah' },
      receipt_title: { en: 'RECEIPT', ms: 'RESIT' },
      receipt_thankyou: { en: 'Thank you!', ms: 'Terima kasih!' },
      receipt_item: { en: 'Item', ms: 'Item' },
      receipt_qty: { en: 'Qty', ms: 'Kuantiti' },
      receipt_price: { en: 'Price', ms: 'Harga' },
      receipt_total: { en: 'TOTAL', ms: 'JUMLAH' },
      print_receipt: { en: '🖨️ Print', ms: 'Cetak' },
      preview_receipt: { en: '🧾 Preview', ms: 'Preview' },
      view_order: { en: 'View', ms: 'Lihat' },
      mark_paid: { en: '💰 Mark Paid', ms: 'Tanda Bayar' },
      close: { en: 'Close', ms: 'Tutup' },
      back: { en: 'Back', ms: 'Kembali' },
      payment_method_label: { en: 'Payment', ms: 'Bayaran' },
      order_type: { en: 'Type', ms: 'Jenis' },
      id: { en: 'ID', ms: 'ID' },
      date: { en: 'Date', ms: 'Tarikh' },
      action: { en: 'Action', ms: 'Tindakan' },
      first: { en: 'First', ms: 'Pertama' },
      prev: { en: 'Prev', ms: 'Sebelum' },
      next: { en: 'Next', ms: 'Seterus' },
      last: { en: 'Last', ms: 'Terakhir' },
      items: { en: 'items', ms: 'item' },
      select_drink: { en: 'Select drink temp', ms: 'Pilih suhu minuman' },
      clear_cart: { en: '🗑️ Clear', ms: 'Kosongkan' },
      new_orders_title: { en: '🔔 New Orders', ms: 'Pesanan Baru' },
      unpaid_orders_title: { en: '💰 Unpaid', ms: 'Belum Bayar' },
      history_title: { en: '📜 History', ms: 'Sejarah' },
      pos_title: { en: 'Point of Sale', ms: 'Tempat Jualan' },
      pos_subtitle: { en: 'Take orders & manage payments', ms: 'Ambil pesanan & urus bayaran' },
      search_menu: { en: '🔍 Search menu...', ms: 'Cari menu...' },
      order_details: { en: '📋 Order Details', ms: 'Butiran Pesanan' },
      select_drink_option: { en: 'Select Drink Option', ms: 'Pilih Pilihan Minuman' },
      select_size_option: { en: 'Select Size', ms: 'Pilih Saiz' },
      hot: { en: 'Hot', ms: 'Panas' },
      cold: { en: 'Cold', ms: 'Sejuk' },
      packed: { en: 'Packed', ms: 'Bungkus' },
      notes: { en: 'Notes', ms: 'Nota' },
      promo: { en: '🔥 Promo', ms: 'Promosi' },
      bogo: { en: '🎁 BOGO', ms: 'Beli 1 Percuma 1' },
      bundle: { en: '📦 Bundle', ms: 'Bundle' },
      set_menu: { en: '🍽️ Set Menu', ms: 'Set Menu' },
      free: { en: 'FREE', ms: 'PERCUMA' },
      select_size: { en: 'Select Size', ms: 'Pilih Saiz' },
      special_request: { en: 'Special request...', ms: 'Permintaan khas...' },
      quantity: { en: 'Qty', ms: 'Kuantiti' },
      add_to_cart: { en: 'Add to Cart', ms: 'Tambah ke Keranjang' },
      new_order_notification: { en: 'New order received!', ms: 'Pesanan baru diterima!' },
      order_confirmed_kitchen: { en: 'Order confirmed!', ms: 'Pesanan disahkan!' },
      out_of_stock: { en: 'Out of Stock', ms: 'Habis Stok' },
      low_stock: { en: 'Low Stock', ms: 'Stok Rendah' },
      please_select_option: { en: 'Please select an option', ms: 'Sila pilih pilihan' },
      please_select_item: { en: 'Please select an item', ms: 'Sila pilih item' },
      ready: { en: 'Ready', ms: 'Siap' },
      preparing: { en: 'Preparing', ms: 'Sedang Siap' },
      stock_label: { en: 'Stock', ms: 'Stok' },
      addons: { en: '✨ Add-Ons', ms: '✨ Tambahan' },
      addon_optional: { en: 'Add-On (optional)', ms: 'Tambahan (pilihan)' },
      addon_list: { en: 'Add-On List', ms: 'Senarai Tambahan' },
      no_addons: { en: 'No add-ons available', ms: 'Tiada tambahan' },
      base_price: { en: 'Base Price', ms: 'Harga Asal' },
      from_base_price: { en: 'from base price', ms: 'dari harga asal' },
    }
    if (!translations[key]) return key
    return language === 'en' ? translations[key].en : translations[key].ms
  }

  // ============================================================
  // STATE
  // ============================================================
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [promotions, setPromotions] = useState([])
  const [drinkOptions, setDrinkOptions] = useState([])
  const [menuOptions, setMenuOptions] = useState([])
  const [menuAddons, setMenuAddons] = useState([])
  const [selectedAddons, setSelectedAddons] = useState([])
  const [cart, setCart] = useState([])
  const [newOrders, setNewOrders] = useState([])
  const [unpaidOrders, setUnpaidOrders] = useState([])
  const [orderHistory, setOrderHistory] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedOption, setSelectedOption] = useState('')
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [orderType, setOrderType] = useState('dine_in')
  const [showItemModal, setShowItemModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // ===== TABS =====
  const [activeTab, setActiveTab] = useState('pos')
  
  // ===== MODALS =====
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState(null)
  const [viewingOrder, setViewingOrder] = useState(null)
  const [historyPage, setHistoryPage] = useState(1)
  const historyItemsPerPage = 10
  
  // ===== RESPONSIVE =====
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024)

  // ===== NOTIFICATION =====
  const [notifiedOrderIds, setNotifiedOrderIds] = useState(new Set())
  const [lastSoundTime, setLastSoundTime] = useState(0)
  const SOUND_COOLDOWN = 3000

  // ===== SETTINGS =====
  const [settings, setSettings] = useState({
    auto_print: true,
    printer_type: 'thermal',
    service_charge: 6,
    tax: 6,
    restaurant_name: 'Restoran Kita',
    kitchen_enabled: true,
    notification_sound: true
  })

  // ============================================================
  // THEME COLORS
  // ============================================================
  const bgColor = darkMode ? '#07111f' : '#eff6ff'
  const cardBg = darkMode ? 'rgba(20,20,40,0.95)' : 'rgba(255,255,255,0.95)'
  const textColor = darkMode ? '#e8edf5' : '#1e293b'
  const textMuted = darkMode ? '#94a3b8' : '#64748b'
  const borderColor = darkMode ? 'rgba(71,85,105,0.3)' : 'rgba(203,213,225,0.5)'
  const priceColor = darkMode ? '#4ade80' : '#22c55e'
  const promoColor = '#ef4444'
  const dangerColor = '#ef4444'
  const secondaryBg = darkMode ? 'rgba(30,30,50,0.6)' : 'rgba(248,250,252,0.8)'
  const inputBg = darkMode ? '#1a1a2e' : '#ffffff'
  const inputBorder = darkMode ? '#3d3d5c' : '#cbd5e1'
  const accentColor = '#f59e0b'

  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${borderColor}`,
    boxShadow: darkMode 
      ? '0 8px 40px rgba(0,0,0,0.5)' 
      : '0 8px 40px rgba(0,0,0,0.06)'
  }

  // ============================================================
  // RESPONSIVE
  // ============================================================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ============================================================
  // PLAY NOTIFICATION SOUND
  // ============================================================
  const playNotificationSound = () => {
    console.log('🔔 playNotificationSound called')
    
    if (!settings.notification_sound) {
      console.log('🔇 Sound disabled in settings')
      return
    }
    
    const now = Date.now()
    if (now - lastSoundTime < SOUND_COOLDOWN) {
      console.log('🔇 Sound cooldown, skipping...')
      return
    }
    setLastSoundTime(now)
    
    console.log('🔊 Playing notification sound!')
    playSound()
  }

  // ============================================================
  // RESET NOTIFIED ORDERS
  // ============================================================
  const resetNotifiedOrders = () => {
    console.log('🔄 Resetting notified orders...')
    setNotifiedOrderIds(new Set())
  }

  // ============================================================
  // TEST SOUND
  // ============================================================
  const testSound = () => {
    console.log('🧪 Test sound')
    initSound()
    unlockAudio()
    playNotificationSound()
    toast.success('🔊 ' + t('sound_test'))
  }

  // ============================================================
  // LOAD SETTINGS
  // ============================================================
  async function loadSettings() {
    try {
      const { data, error } = await supabase.from('settings').select('key, value')
      if (error) throw error
      const settingsObj = {}
      data?.forEach(item => {
        if (item.key === 'service_charge' || item.key === 'tax') {
          settingsObj[item.key] = parseFloat(item.value) || 0
        } else if (item.key === 'auto_print' || item.key === 'notification_sound' || item.key === 'kitchen_enabled') {
          settingsObj[item.key] = item.value === 'true'
        } else {
          settingsObj[item.key] = item.value
        }
      })
      setSettings(prev => ({ ...prev, ...settingsObj }))
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    loadAllData()
    loadNewOrders()
    loadUnpaidOrders()
    loadOrderHistory()
    loadSettings()
    // Load receipt settings
    reloadReceipt()

    const menuSub = supabase.channel('staff_menu')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, () => loadMenu())
      .subscribe()
    
    const drinkSub = supabase.channel('staff_drink')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drink_options' }, () => loadDrinkOptions())
      .subscribe()
    
    const orderSub = supabase.channel('staff_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_orders' }, () => {
        loadNewOrders()
        loadUnpaidOrders()
        loadOrderHistory()
      })
      .subscribe()

    return () => {
      menuSub.unsubscribe()
      drinkSub.unsubscribe()
      orderSub.unsubscribe()
    }
  }, [])

  // ============================================================
  // NOTIFICATION INTERVAL
  // ============================================================
  useEffect(() => {
    const checkOrders = async () => {
      try {
        console.log('🔍 Staff interval: Checking for new orders...')
        
        const { data } = await supabase
          .from('customer_orders')
          .select('*')
          .eq('payment_status', PAYMENT_STATUS.UNPAID)
          .order('created_at', { ascending: false })

        const pending = (data || []).filter(order => {
          const status = order.order_status || order.status
          return ['pending', 'pending_confirmation', 'new'].includes(status) || 
                 status === ORDER_STATUS.NEW
        })

        console.log(`📊 Staff interval: Found ${pending.length} pending orders`)
        setNewOrders(pending)

        const currentIds = pending.map(o => o.id)
        const existingIds = notifiedOrderIds
        const newIds = currentIds.filter(id => !existingIds.has(id))

        if (newIds.length > 0) {
          console.log(`🔔 Staff interval: ${newIds.length} NEW ORDER(S)! Playing sound...`)
          playNotificationSound()
          
          setNotifiedOrderIds(prev => {
            const newSet = new Set(prev)
            currentIds.forEach(id => newSet.add(id))
            return newSet
          })

          toast(`🔔 ${pending.length} ${t('new_order_notification')}`, {
            duration: 3000,
            icon: '🔔'
          })
        }
        
      } catch (err) {
        console.error('Staff interval error:', err)
      }
    }

    checkOrders()
    const interval = setInterval(checkOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  // ============================================================
  // REALTIME SUBSCRIPTION
  // ============================================================
  useEffect(() => {
    const orderSub = supabase
      .channel('staff_orders_realtime')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'customer_orders' },
        (payload) => {
          console.log('🔔 New order inserted!', payload.new)
          playNotificationSound()
          loadNewOrders()
          loadUnpaidOrders()
          toast(`🔔 ${t('new_order_notification')}`, {
            duration: 3000,
            icon: '🔔'
          })
        }
      )
      .subscribe()
    return () => orderSub.unsubscribe()
  }, [])

  async function loadAllData() {
    setLoading(true)
    await Promise.all([
      loadCategories(),
      loadMenu(),
      loadPromotions(),
      loadDrinkOptions()
    ])
    setLoading(false)
  }

  async function loadCategories() {
    try {
      const { data } = await supabase.from('categories').select('*').order('sort_order')
      setCategories(data || [])
    } catch (err) { console.error('Error loading categories:', err) }
  }

  async function loadMenu() {
    try {
      const { data } = await supabase.from('menu').select('*').order('sort_order')
      setMenu(data || [])
    } catch (err) { console.error('Error loading menu:', err) }
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
    } catch (err) { console.error('Error loading promotions:', err) }
  }

  async function loadDrinkOptions() {
    try {
      const { data } = await supabase.from('drink_options').select('*')
      setDrinkOptions(data || [])
    } catch (err) { console.error('Error loading drink options:', err) }
  }

  async function loadNewOrders() {
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', PAYMENT_STATUS.UNPAID)
        .order('created_at', { ascending: false })
      
      const pending = (data || []).filter(order => {
        const status = order.order_status || order.status
        return ['pending', 'pending_confirmation', 'new'].includes(status) || status === ORDER_STATUS.NEW
      })
      setNewOrders(pending)
    } catch (err) { console.error('Error loading new orders:', err) }
  }

  async function loadUnpaidOrders() {
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', PAYMENT_STATUS.UNPAID)
        .in('status', ['confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: false })
      setUnpaidOrders(data || [])
    } catch (err) { console.error('Error loading unpaid orders:', err) }
  }

  async function loadOrderHistory() {
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', PAYMENT_STATUS.PAID)
        .order('created_at', { ascending: false })
        .limit(200)
      setOrderHistory(data || [])
    } catch (err) { console.error('Error loading order history:', err) }
  }

  async function loadMenuOptions(menuId) {
    try {
      const { data } = await supabase
        .from('menu_options')
        .select('*')
        .eq('menu_id', menuId)
        .order('sort_order')
      setMenuOptions(data || [])
    } catch (err) { console.error('Error loading menu options:', err) }
  }

  // ============================================================
  // LOAD ADD-ONS
  // ============================================================
  async function loadAddons(menuId) {
    try {
      const { data } = await supabase
        .from('menu_addons')
        .select('*')
        .eq('menu_id', menuId)
        .eq('is_active', true)
        .order('sort_order')
      setMenuAddons(data || [])
      setSelectedAddons([])
    } catch (err) {
      console.error('Error loading addons:', err)
      setMenuAddons([])
    }
  }

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => {
      if (prev.includes(addonId)) {
        return prev.filter(id => id !== addonId)
      } else {
        return [...prev, addonId]
      }
    })
  }

  const getAddonTotal = () => {
    return menuAddons
      .filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + parseFloat(a.price), 0)
  }

  const getAddonNames = () => {
    return menuAddons
      .filter(a => selectedAddons.includes(a.id))
      .map(a => a.name)
      .join(', ')
  }

  // ============================================================
  // CHECK STOCK FUNCTION
  // ============================================================
  async function checkOptionStock(optionId, quantity = 1) {
    try {
      const { data, error } = await supabase
        .from('menu_options')
        .select('stock, option_name')
        .eq('id', optionId)
        .single()
      
      if (error) {
        console.error('Error checking stock:', error)
        return { available: false, stock: 0, error: error.message }
      }
      
      const currentStock = data?.stock || 0
      const available = currentStock >= quantity
      
      return { 
        available, 
        stock: currentStock, 
        option_name: data?.option_name || 'Unknown',
        error: null 
      }
    } catch (err) {
      console.error('Stock check exception:', err)
      return { available: false, stock: 0, error: err.message }
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function isDrinkCategory(category) {
    const drinkCats = ['Minuman', 'Jus', 'Teh', 'Kopi', 'Air', 'Milo', 'Nescafe', 'Teh Tarik']
    return drinkCats.some(cat => category?.includes(cat))
  }

  function isSizeCategory(item) {
    return item?.has_options === true
  }

  function getDrinkOptionsForItem(item) {
    if (!item) return []
    return drinkOptions.filter(opt => opt.drink_name === item.name)
  }

  function getItemPromotion(item) {
    for (const promo of promotions) {
      if (promo.type === 'bogo') {
        const trigger = promo.trigger_items?.[0]
        if (trigger && item.id === trigger.id) return { type: 'bogo', trigger, free: promo.free_items?.[0], promo }
      } else if (promo.type === 'bundle' || promo.type === 'set_menu') {
        const found = (promo.bundle_items || []).find(i => i.id === item.id)
        if (found) return { type: promo.type, bundleItems: promo.bundle_items, bundlePrice: promo.bundle_price, promo }
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

  function getItemPrice(item, option, size) {
    let basePrice = item?.price || 0
    if (option && item) {
      const drinkOpt = drinkOptions.find(d => d.drink_name === item.name && d.option_type === option)
      if (drinkOpt?.price !== undefined) basePrice = parseFloat(drinkOpt.price) || 0
    }
    const promoPrice = getPromoPrice(item)
    if (promoPrice !== null) basePrice = promoPrice
    if (size?.price_adjustment !== undefined) {
      basePrice = size.is_absolute_price ? parseFloat(size.price_adjustment) : basePrice + parseFloat(size.price_adjustment)
    }
    return parseFloat(basePrice) || 0
  }

  // ============================================================
  // ===== CLEAN CATEGORY NAME - Remove "(Makanan)" etc =====
  // ============================================================
  const cleanCategoryName = (name) => {
    if (!name) return name
    // Remove everything in parentheses including the parentheses
    // e.g: "Nasi (Makanan)" → "Nasi"
    return name.replace(/ \(.*\)$/, '').trim()
  }

  // ============================================================
  // ===== GET SORTED CATEGORIES (Macam ManageMenu) =====
  // ============================================================
  const getSortedCategories = () => {
    return [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  }

  // ============================================================
  // ===== GET FILTERED MENU - Sorted by category order =====
  // ============================================================
  const getFilteredMenu = () => {
    let filtered = [...menu]
    
    if (selectedCategory !== 'All') {
      const selectedCat = categories.find(c => c.name === selectedCategory)
      
      if (selectedCat) {
        const isParent = selectedCat.parent_id === null || selectedCat.parent_id === undefined
        
        if (isParent) {
          // Get all sub-categories under this parent
          const subCategoryNames = categories
            .filter(c => c.parent_id === selectedCat.id)
            .map(c => c.name)
          
          const allRelated = [selectedCategory, ...subCategoryNames]
          filtered = filtered.filter(item => allRelated.includes(item.category))
        } else {
          // If it's a sub-category, only show that category
          filtered = filtered.filter(item => item.category === selectedCategory)
        }
      } else {
        filtered = filtered.filter(item => item.category === selectedCategory)
      }
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // ⭐ SORT BY CATEGORY ORDER (from categories table) - MACAM MANAGE MENU
    return filtered.sort((a, b) => {
      const catOrderA = categories.findIndex(c => c.name === a.category)
      const catOrderB = categories.findIndex(c => c.name === b.category)
      
      const orderA = catOrderA === -1 ? 999 : catOrderA
      const orderB = catOrderB === -1 ? 999 : catOrderB
      
      if (orderA !== orderB) {
        return orderA - orderB
      }
      
      // Within same category, sort by sort_order
      return (a.sort_order || 0) - (b.sort_order || 0)
    })
  }

  // ============================================================
  // ===== GROUP MENU BY CATEGORY - With proper sorting =====
  // ============================================================
  const getGroupedMenuByCategory = (menuItems) => {
    if (selectedCategory !== 'All') return null
    
    const grouped = {}
    
    // Get all categories in order
    const orderedCategories = getSortedCategories().map(cat => cat.name)
    
    // Initialize groups for all categories
    orderedCategories.forEach(catName => {
      grouped[catName] = []
    })
    
    grouped['Lain-lain'] = []
    
    // Group items
    menuItems.forEach(item => {
      const catName = item.category || 'Lain-lain'
      if (grouped[catName]) {
        grouped[catName].push(item)
      } else {
        grouped['Lain-lain'].push(item)
      }
    })
    
    // Remove empty groups
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key]
      }
    })
    
    return grouped
  }

  const getCategoryGroupIcon = (catName) => {
    if (catName === 'Lain-lain') return '📂'
    const cleanName = cleanCategoryName(catName)
    const found = categories.find(c => c.name === catName || cleanName === c.name)
    return found?.icon || '📂'
  }

  // ============================================================
  // CART FUNCTIONS
  // ============================================================
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const getServiceCharge = () => orderType === 'take_away' ? 0 : getSubtotal() * (settings.service_charge / 100)
  const getTax = () => getSubtotal() * (settings.tax / 100)
  const getGrandTotal = () => getSubtotal() + getServiceCharge() + getTax()
  const getCartItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0)

  // ============================================================
  // ADD TO CART - WITH STOCK CHECK & ADD-ONS
  // ============================================================
  const addToCart = async () => {
    if (!selectedItem) { toast.error(t('please_select_item')); return }
    if (isDrinkCategory(selectedItem.category)) {
      const availableOptions = getDrinkOptionsForItem(selectedItem)
      if (availableOptions.length > 0 && !selectedOption) {
        toast.error(t('please_select_option')); return
      }
    }
    if (isSizeCategory(selectedItem) && !selectedSize) {
      toast.error(t('select_size')); return
    }
    
    if (selectedSize) {
      const stockCheck = await checkOptionStock(selectedSize.id, quantity)
      
      if (!stockCheck.available) {
        toast.error(`❌ "${selectedSize.option_name}" ${t('out_of_stock')}! Stok sedia ada: ${stockCheck.stock}`)
        return
      }
      
      if (stockCheck.stock < quantity) {
        toast.error(`❌ Stok tidak mencukupi untuk "${selectedSize.option_name}". Stok sedia ada: ${stockCheck.stock}`)
        return
      }
      
      if (stockCheck.stock < 5) {
        toast.warning(`⚠️ "${selectedSize.option_name}" ${t('low_stock')}! Stok: ${stockCheck.stock} sahaja`)
      }
    }
    
    const basePrice = getItemPrice(selectedItem, selectedOption, selectedSize)
    const addonTotal = getAddonTotal()
    const finalPrice = basePrice + addonTotal
    const addonNames = getAddonNames()
    
    const isFree = finalPrice === 0
    const promo = getItemPromotion(selectedItem)
    
    const cartItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      category: selectedItem.category,
      option: selectedOption || null,
      size: selectedSize?.option_name || null,
      size_id: selectedSize?.id || null,
      price: finalPrice,
      basePrice: basePrice,
      originalPrice: selectedItem.price,
      quantity: quantity,
      subtotal: finalPrice * quantity,
      image_url: selectedItem.image_url,
      notes: selectedItem.notes || '',
      isFree: isFree,
      promoType: promo?.type || null,
      promoName: promo?.promo?.name || null,
      addons: addonNames,
      addon_ids: [...selectedAddons],
      addon_total: addonTotal
    }
    
    const existingIndex = cart.findIndex(c => 
      c.id === cartItem.id && 
      c.option === cartItem.option && 
      c.size === cartItem.size &&
      JSON.stringify(c.addon_ids) === JSON.stringify(cartItem.addon_ids)
    )
    
    if (existingIndex >= 0) {
      const newCart = [...cart]
      newCart[existingIndex].quantity += quantity
      newCart[existingIndex].subtotal = newCart[existingIndex].price * newCart[existingIndex].quantity
      setCart(newCart)
    } else {
      setCart([...cart, cartItem])
    }
    
    setShowItemModal(false)
    setSelectedItem(null)
    setSelectedOption('')
    setSelectedSize(null)
    setSelectedAddons([])
    setMenuAddons([])
    setQuantity(1)
    toast.success(isFree ? `🎁 ${selectedItem.name} FREE!` : t('order_added'))
  }

  const removeFromCart = (index) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const clearCart = () => {
    if (cart.length === 0) { toast.error(t('cart_empty_msg')); return }
    if (window.confirm(t('confirm_clear_cart'))) {
      setCart([])
      toast.success(t('order_cancelled'))
    }
  }

  // ============================================================
  // ===== SEND ORDER - WITH RECEIPT PRINT =====
  // ============================================================
  const sendOrder = async () => {
    if (cart.length === 0) { toast.error(t('cart_empty_msg')); return }
    if (orderType === 'dine_in' && !tableNumber) {
      toast.error('⚠️ Sila masukkan nombor meja!'); return
    }
    
    for (const item of cart) {
      if (item.size_id) {
        const stockCheck = await checkOptionStock(item.size_id, item.quantity)
        if (!stockCheck.available) {
          toast.error(`❌ "${item.size}" ${t('out_of_stock')}! Stok sedia ada: ${stockCheck.stock}`)
          return
        }
        if (stockCheck.stock < item.quantity) {
          toast.error(`❌ Stok tidak mencukupi untuk "${item.size}". Stok sedia ada: ${stockCheck.stock}`)
          return
        }
      }
    }
    
    const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const orderNumber = 'ORD-' + Date.now()
    
    const orderData = {
      order_number: orderNumber,
      items: cart.map(item => ({
        name: item.name,
        category: item.category || 'Makanan',
        option: item.option || null,
        size: item.size || null,
        size_id: item.size_id || null,
        price: item.price,
        basePrice: item.basePrice || item.price,
        originalPrice: item.originalPrice || item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        isFree: item.isFree || false,
        promoType: item.promoType || null,
        promoName: item.promoName || null,
        image_url: item.image_url || null,
        addons: item.addons || null,
        addon_ids: item.addon_ids || [],
        addon_total: item.addon_total || 0
      })),
      total: total,
      customer_name: customerName || 'Guest',
      customer_phone: customerPhone || null,
      table_number: orderType === 'dine_in' ? parseInt(tableNumber) || null : null,
      order_type: orderType,
      status: ORDER_STATUS.NEW,
      order_status: ORDER_STATUS.NEW,
      payment_status: PAYMENT_STATUS.UNPAID,
      notes: cart.map(item => item.notes).filter(n => n).join(', ')
    }
    
    try {
      const { data, error } = await supabase.from('customer_orders').insert([normalizeOrderForInsert(orderData)]).select()
      if (error) throw error
      
      let stockUpdateErrors = []
      
      for (const item of cart) {
        if (item.size_id) {
          const { data: currentData } = await supabase
            .from('menu_options')
            .select('stock')
            .eq('id', item.size_id)
            .single()
          
          if (currentData) {
            const currentStock = currentData.stock || 0
            const newStock = Math.max(0, currentStock - item.quantity)
            
            const { error: updateError } = await supabase
              .from('menu_options')
              .update({ stock: newStock })
              .eq('id', item.size_id)
            
            if (updateError) {
              stockUpdateErrors.push(`Failed to update stock for ${item.size}: ${updateError.message}`)
            }
          }
        }
      }
      
      if (stockUpdateErrors.length > 0) {
        console.warn('Stock update errors:', stockUpdateErrors)
        toast.warning(`⚠️ ${stockUpdateErrors.length} item(s) had stock update issues. Please check inventory.`)
      }
      
      toast.success(`✅ ${t('order_sent')} #${orderNumber}`)
      
      // ============================================================
      // ===== PRINT RECEIPT USING USE RECEIPT HOOK =====
      // ============================================================
      if (data && data.length > 0 && receiptSettings) {
        const order = data[0]
        try {
          const receiptText = generateReceipt({
            ...order,
            order_number: orderNumber,
            customer_name: customerName || 'Guest',
            table_number: orderType === 'dine_in' ? tableNumber : null,
            order_type: orderType,
            staff_name: 'Staff',
            items: cart.map(item => ({
              name: item.name,
              option: item.option || null,
              size: item.size || null,
              addons: item.addons || null,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal
            })),
            subtotal: getSubtotal(),
            service_charge: getServiceCharge(),
            tax: getTax(),
            total: getGrandTotal(),
            payment_method: 'cash',
            paid_amount: getGrandTotal()
          })
          
          // Print using hook
          await printReceipt(receiptText)
          console.log('✅ Receipt printed successfully from StaffApp')
        } catch (receiptError) {
          console.error('Error printing receipt:', receiptError)
          // Don't show error to user, order already sent
        }
      }
      // ============================================================
      
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setTableNumber('')
      loadNewOrders()
      loadUnpaidOrders()
    } catch (err) {
      console.error('Send order error:', err)
      toast.error(t('error_checkout') + ': ' + err.message)
    }
  }

  // ============================================================
  // CONFIRM / CANCEL NEW ORDER
  // ============================================================
  const confirmNewOrder = async (order) => {
    try {
      await supabase
        .from('customer_orders')
        .update({ 
          status: ORDER_STATUS.CONFIRMED, 
          order_status: ORDER_STATUS.CONFIRMED, 
          confirmed_at: new Date().toISOString() 
        })
        .eq('id', order.id)
      
      playSound()
      toast.success(t('order_confirmed_kitchen'))
      loadNewOrders()
      loadUnpaidOrders()
    } catch (err) { 
      console.error('Error confirming order:', err)
      toast.error(err.message) 
    }
  }

  const cancelNewOrder = async (order) => {
    try {
      await supabase.from('customer_orders').update({ status: ORDER_STATUS.CANCELLED, order_status: ORDER_STATUS.CANCELLED }).eq('id', order.id)
      toast.success(t('order_cancelled'))
      loadNewOrders()
    } catch (err) { toast.error(err.message) }
  }

  // ============================================================
  // PAYMENT
  // ============================================================
  const openPaymentModal = (order) => {
    setSelectedOrder(order)
    setShowPaymentModal(true)
  }

  const markAsPaid = async (order) => {
    const subtotal = parseFloat(order.subtotal || order.total || 0)
    const serviceCharge = order.order_type === 'take_away' ? 0 : subtotal * (settings.service_charge / 100)
    const tax = subtotal * (settings.tax / 100)
    const grandTotal = subtotal + serviceCharge + tax
    
    await supabase
      .from('customer_orders')
      .update({ 
        payment_status: PAYMENT_STATUS.PAID,
        payment_method: paymentMethod,
        paid_at: new Date().toISOString(),
        subtotal,
        service_charge: serviceCharge,
        tax,
        grand_total: grandTotal
      })
      .eq('id', order.id)
    
    loadUnpaidOrders()
    loadOrderHistory()
    setShowPaymentModal(false)
    setCurrentReceiptOrder({ ...order, payment_method: paymentMethod, paid_at: new Date().toISOString(), subtotal, service_charge: serviceCharge, tax, grand_total: grandTotal })
    setShowReceipt(true)
    setSelectedOrder(null)
    toast.success(`✅ ${t('payment_received')} RM ${grandTotal.toFixed(2)}!`)
  }

  // ============================================================
  // ===== PRINT RECEIPT - UPDATED WITH USE RECEIPT HOOK =====
  // ============================================================
  const printReceiptLegacy = (order) => {
    // Gunakan hook untuk print
    if (receiptSettings) {
      try {
        const receiptText = generateReceipt({
          ...order,
          items: order.items || [],
          subtotal: order.subtotal || order.total || 0,
          service_charge: order.service_charge || 0,
          tax: order.tax || 0,
          total: order.grand_total || order.total || 0,
          payment_method: order.payment_method || 'cash',
          paid_amount: order.grand_total || order.total || 0
        })
        printReceipt(receiptText)
        console.log('✅ Receipt printed successfully from StaffApp (legacy)')
      } catch (err) {
        console.error('Error printing receipt:', err)
        // Fallback to old method
        fallbackPrintReceipt(order)
      }
    } else {
      fallbackPrintReceipt(order)
    }
  }

  // ===== FALLBACK: Original print method if hook fails =====
  const fallbackPrintReceipt = (order) => {
    const total = Number(order.total || order.grand_total || 0).toFixed(2)
    const items = order.items || []
    const date = new Date(order.created_at).toLocaleString()
    
    const content = `
      <!DOCTYPE html>
      <html>
      <head><title>${t('receipt_title')}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Courier New',monospace;padding:20px;background:white;color:black}
        .receipt{max-width:320px;margin:0 auto;font-size:12px}
        .header{text-align:center;border-bottom:1px dashed #ccc;padding-bottom:10px;margin-bottom:10px}
        .header h1{font-size:18px}
        .header .sub{font-size:11px;color:#666}
        .divider{border-top:1px dashed #ccc;margin:8px 0}
        .items{width:100%;margin:8px 0;border-collapse:collapse}
        .items th,.items td{text-align:left;padding:4px 0;font-size:12px}
        .items th:last-child,.items td:last-child{text-align:right}
        .items th{border-bottom:1px solid #ccc;font-size:11px;color:#666}
        .total-row{font-size:16px;font-weight:bold;color:#22c55e}
        .footer{text-align:center;margin-top:12px;border-top:1px dashed #ccc;padding-top:10px;font-size:11px;color:#666}
        @media print{body{margin:0;padding:10px}}
      </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>${settings.restaurant_name}</h1>
            <div class="sub">${t('receipt_title')}</div>
            <div class="sub">${order.order_type === 'take_away' ? '🥡 Take Away' : '🍽️ Table ' + (order.table_number || '')}</div>
            <div class="sub">👤 ${order.customer_name || t('guest')}</div>
            ${order.customer_phone ? `<div class="sub">📞 ${order.customer_phone}</div>` : ''}
            <div class="sub">${date}</div>
          </div>
          <table>
            <thead><tr><th>${t('receipt_item')}</th><th>${t('receipt_qty')}</th><th>${t('receipt_price')}</th></tr></thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}${item.option ? ` (${item.option})` : ''}${item.size ? ` [${item.size}]` : ''}${item.addons ? ` ✨${item.addons}` : ''}</td>
                  <td style="text-align:center">${item.quantity || 1}</td>
                  <td>RM ${Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:bold;padding:4px 0;">
            <span>${t('receipt_total')}</span>
            <span style="color:#22c55e">RM ${total}</span>
          </div>
          <div class="footer">⭐ ⭐ ⭐ ⭐ ⭐<br>${t('receipt_thankyou')}</div>
        </div>
        <script>window.onload=()=>{setTimeout(()=>{window.print();setTimeout(()=>window.close(),500)},300)}<\/script>
      </body>
      </html>
    `
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(content)
    printWindow.document.close()
  }

  // ============================================================
  // ===== RENDER FUNCTIONS =====
  // ============================================================

  // ============================================================
  // RENDER CATEGORY TABS - Sorted like ManageMenu, clean names
  // ============================================================
  const renderCategoryTabs = () => {
    // Get all categories sorted by sort_order (macam ManageMenu)
    const sortedCategories = getSortedCategories()
    
    // Count items per category
    const getCategoryCount = (catName) => {
      return menu.filter(item => item.category === catName).length
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        flexWrap: 'nowrap', 
        overflowX: 'auto', 
        paddingBottom: '4px',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {/* ALL button */}
        <button
          onClick={() => setSelectedCategory('All')}
          style={{
            padding: isMobile ? '6px 14px' : '8px 20px',
            background: selectedCategory === 'All' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
            color: selectedCategory === 'All' ? 'white' : textColor,
            border: selectedCategory === 'All' ? 'none' : `1px solid ${borderColor}`,
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: selectedCategory === 'All' ? 'bold' : '500',
            fontSize: isMobile ? '11px' : '13px',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
        >
          📋 {t('all_categories')}
          <span style={{
            marginLeft: '4px',
            fontSize: '9px',
            background: selectedCategory === 'All' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            padding: '1px 6px',
            borderRadius: '10px'
          }}>
            {menu.length}
          </span>
        </button>
        
        {/* Category buttons in sort_order */}
        {sortedCategories.map(cat => {
          const count = getCategoryCount(cat.name)
          if (count === 0) return null
          
          // 🔥 CLEAN NAME - remove "(Makanan)" etc
          const displayName = cleanCategoryName(cat.name)
          
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              style={{
                padding: isMobile ? '6px 14px' : '8px 20px',
                background: selectedCategory === cat.name ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                color: selectedCategory === cat.name ? 'white' : textColor,
                border: selectedCategory === cat.name ? 'none' : `1px solid ${borderColor}`,
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat.name ? 'bold' : '500',
                fontSize: isMobile ? '11px' : '13px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              {cat.icon || '📂'} {displayName}
              <span style={{
                marginLeft: '4px',
                fontSize: '9px',
                background: selectedCategory === cat.name ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  // ============================================================
  // RENDER MENU ITEM CARD
  // ============================================================
  const renderMenuItemCard = (item) => {
    const hasDrinkOpts = getDrinkOptionsForItem(item).length > 0
    const hasImage = item.image_url && item.image_url.trim() !== ''
    const promo = getItemPromotion(item)
    const promoPrice = getPromoPrice(item)
    const isBOGO = promo?.type === 'bogo'
    const hasAddons = item.has_addons === true
    const hasSizeOptions = item.has_options === true
    
    return (
      <div
        key={item.id}
        onClick={() => {
          setSelectedItem(item)
          setSelectedOption('')
          setSelectedSize(null)
          setSelectedAddons([])
          setQuantity(1)
          if (item.has_options) loadMenuOptions(item.id)
          if (item.has_addons) loadAddons(item.id)
          setShowItemModal(true)
        }}
        style={{
          ...glassEffect,
          borderRadius: '16px',
          padding: isMobile ? '12px' : '16px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          position: 'relative'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        {promo && (
          <div style={{
            position: 'absolute', top: '-8px', right: '-8px',
            background: promoColor, color: 'white',
            padding: '2px 10px', borderRadius: '20px',
            fontSize: '8px', fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
            zIndex: 5
          }}>
            {promo.type === 'bogo' ? '🎁 BOGO' : '🔥 ' + t('promo')}
          </div>
        )}
        
        {hasDrinkOpts && (
          <div style={{
            position: 'absolute', top: '-8px', left: '-8px',
            background: '#3b82f6', color: 'white',
            padding: '2px 8px', borderRadius: '20px',
            fontSize: '7px', fontWeight: 'bold',
            zIndex: 5
          }}>
            ☕
          </div>
        )}
        
        {hasAddons && (
          <div style={{
            position: 'absolute', top: '-8px', left: '-8px',
            background: '#8b5cf6', color: 'white',
            padding: '2px 8px', borderRadius: '20px',
            fontSize: '7px', fontWeight: 'bold',
            zIndex: 5,
            marginLeft: hasDrinkOpts ? '30px' : '0'
          }}>
            ✨
          </div>
        )}
        
        {hasImage ? (
          <img
            src={item.image_url}
            alt={item.name}
            style={{
              width: '100%',
              height: isMobile ? '70px' : '90px',
              maxWidth: '120px',
              objectFit: 'contain',
              borderRadius: '12px',
              margin: '0 auto 8px auto',
              display: 'block',
              backgroundColor: '#fff',
              padding: '4px'
            }}
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div style={{ fontSize: isMobile ? '32px' : '40px', marginBottom: '4px' }}>
            {isDrinkCategory(item.category) ? '🥤' : '🍽️'}
          </div>
        )}
        
        <div style={{
          fontWeight: 'bold',
          color: textColor,
          fontSize: isMobile ? '11px' : '13px',
          marginBottom: '2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.name}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flexWrap: 'wrap'
        }}>
          {promoPrice !== null && promoPrice !== item.price ? (
            <>
              <span style={{ color: promoColor, fontWeight: 'bold', fontSize: isMobile ? '13px' : '15px' }}>
                RM {promoPrice.toFixed(2)}
              </span>
              <span style={{ color: textMuted, fontSize: isMobile ? '9px' : '10px', textDecoration: 'line-through' }}>
                RM {item.price.toFixed(2)}
              </span>
              {isBOGO && (
                <span style={{ background: promoColor, color: 'white', padding: '1px 6px', borderRadius: '10px', fontSize: '7px', fontWeight: 'bold' }}>
                  BOGO
                </span>
              )}
            </>
          ) : (
            <span style={{ color: priceColor, fontWeight: 'bold', fontSize: isMobile ? '13px' : '15px' }}>
              RM {item.price.toFixed(2)}
            </span>
          )}
          
          {hasAddons && (
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              padding: '1px 8px',
              borderRadius: '12px',
              fontSize: isMobile ? '7px' : '9px',
              fontWeight: 'bold'
            }}>
              ✨ Add-On
            </span>
          )}
          
          {hasSizeOptions && (
            <span style={{
              background: '#f59e0b',
              color: 'white',
              padding: '1px 8px',
              borderRadius: '12px',
              fontSize: isMobile ? '7px' : '9px',
              fontWeight: 'bold'
            }}>
              📏 Size
            </span>
          )}
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER MENU ITEMS - Grouped by category
  // ============================================================
  const renderMenuItems = () => {
    const filteredMenu = getFilteredMenu()
    
    if (filteredMenu.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: textMuted }}>
          🍽️ {t('no_data')}
        </div>
      )
    }
    
    const cols = isMobile ? 2 : (isTablet ? 3 : 4)
    
    // ===== GROUPED VIEW UNTUK "All" =====
    if (selectedCategory === 'All') {
      const grouped = getGroupedMenuByCategory(filteredMenu)
      if (!grouped || Object.keys(grouped).length === 0) {
        return (
          <div style={{ textAlign: 'center', padding: '40px', color: textMuted }}>
            🍽️ {t('no_data')}
          </div>
        )
      }
      
      // Get category order for sorting
      const getCategoryOrder = (catName) => {
        const found = categories.find(c => c.name === catName)
        return found?.sort_order ?? 999
      }
      
      // Sort categories by sort_order
      const sortedCategoryNames = Object.keys(grouped).sort((a, b) => {
        return getCategoryOrder(a) - getCategoryOrder(b)
      })
      
      return sortedCategoryNames.map((categoryName) => {
        const items = grouped[categoryName]
        const catIcon = getCategoryGroupIcon(categoryName)
        const itemCount = items.length
        const cleanName = cleanCategoryName(categoryName)
        
        return (
          <div key={categoryName} style={{ marginBottom: '24px' }}>
            {/* Category Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              padding: '8px 14px',
              background: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
              borderRadius: '10px',
              borderLeft: `4px solid ${accentColor}`,
              border: `1px solid ${borderColor}`
            }}>
              <span style={{ fontSize: '18px' }}>{catIcon}</span>
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: isMobile ? '13px' : '15px', 
                color: textColor 
              }}>
                {cleanName}
              </span>
              <span style={{
                fontSize: '10px',
                color: textMuted,
                background: secondaryBg,
                padding: '1px 10px',
                borderRadius: '12px'
              }}>
                {itemCount} {t('items')}
              </span>
            </div>
            
            {/* Items Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: isMobile ? '10px' : '14px'
            }}>
              {items.map(item => renderMenuItemCard(item))}
            </div>
          </div>
        )
      })
    }
    
    // ===== NORMAL VIEW UNTUK KATEGORI TERTENTU =====
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: isMobile ? '10px' : '14px'
      }}>
        {filteredMenu.map(item => renderMenuItemCard(item))}
      </div>
    )
  }

  const renderCart = () => {
    const totalItems = getCartItemCount()
    const grandTotal = getGrandTotal()
    
    return (
      <div style={{
        ...glassEffect,
        borderRadius: isMobile ? '16px' : '20px',
        padding: isMobile ? '14px' : '18px',
        height: isMobile ? 'auto' : '100%',
        maxHeight: isMobile ? '300px' : 'calc(100vh - 280px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: `1px solid ${borderColor}`,
          paddingBottom: '10px'
        }}>
          <span style={{ fontWeight: 'bold', color: textColor, fontSize: isMobile ? '14px' : '16px' }}>
            🛒 {t('cart')} ({totalItems})
          </span>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            >
              🗑️ {t('clear_cart')}
            </button>
          )}
        </div>
        
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', color: textMuted, padding: '20px 0' }}>
            🛒 {t('empty_cart')}
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {cart.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: `1px solid ${borderColor}`
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: isMobile ? '12px' : '13px', color: textColor }}>
                      {item.name}
                      {item.option && <span style={{ fontSize: '10px', color: textMuted, marginLeft: '4px' }}>({item.option})</span>}
                      {item.size && <span style={{ fontSize: '10px', color: '#8b5cf6', marginLeft: '4px' }}>[{item.size}]</span>}
                      {item.addons && (
                        <div style={{ fontSize: '9px', color: '#8b5cf6', fontWeight: 'normal', marginTop: '2px' }}>
                          ✨ + {item.addons} <span style={{ color: priceColor }}>(+RM {item.addon_total?.toFixed(2) || '0.00'})</span>
                        </div>
                      )}
                      {item.basePrice && item.basePrice !== item.price && (
                        <div style={{ fontSize: '9px', color: '#94a3b8', textDecoration: 'line-through', marginTop: '1px' }}>
                          RM {item.basePrice.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: textMuted }}>
                      x{item.quantity} × RM {item.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: priceColor, fontWeight: 'bold', fontSize: '12px' }}>
                      RM {item.subtotal.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(index)}
                      style={{
                        background: 'transparent',
                        color: '#ef4444',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '2px 6px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              borderTop: `1px solid ${borderColor}`,
              paddingTop: '10px',
              marginTop: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: textColor }}>
                <span>{t('subtotal')}</span>
                <span>RM {getSubtotal().toFixed(2)}</span>
              </div>
              {orderType !== 'take_away' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: textColor }}>
                  <span>{t('service_charge')} ({settings.service_charge}%)</span>
                  <span>RM {getServiceCharge().toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: textColor }}>
                <span>{t('tax')} ({settings.tax}%)</span>
                <span>RM {getTax().toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 'bold',
                color: priceColor,
                marginTop: '6px',
                paddingTop: '6px',
                borderTop: `1px solid ${borderColor}`
              }}>
                <span>{t('total')}</span>
                <span>RM {grandTotal.toFixed(2)}</span>
              </div>
              
              <button
                onClick={sendOrder}
                disabled={cart.length === 0}
                style={{
                  width: '100%',
                  padding: isMobile ? '10px' : '12px',
                  marginTop: '10px',
                  background: cart.length === 0 ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '13px' : '14px'
                }}
              >
                📤 {t('place_order')}
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  const renderNewOrders = () => {
    if (newOrders.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: textMuted }}>
          📭 {t('no_new_orders')}
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {newOrders.map(order => (
          <div key={order.id} style={{
            ...glassEffect,
            borderRadius: '16px',
            padding: isMobile ? '14px' : '18px',
            borderLeft: `4px solid #ef4444`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: textColor }}>
                  🆕 #{order.order_number}
                </span>
                <span style={{ marginLeft: '10px', color: textMuted, fontSize: '13px' }}>
                  {order.order_type === 'take_away' ? '🥡 ' + t('take_away') : '🍽️ ' + t('table') + ' ' + (order.table_number || '')}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: textMuted }}>
                🕐 {new Date(order.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div style={{ marginTop: '6px', color: textColor }}>
              👤 {order.customer_name || t('guest')}
              {order.customer_phone && <span style={{ marginLeft: '10px', fontSize: '12px', color: textMuted }}>📞 {order.customer_phone}</span>}
            </div>
            <div style={{ margin: '8px 0', padding: '8px', background: secondaryBg, borderRadius: '12px' }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor, padding: '2px 0' }}>
                  <span>{item.quantity}x {item.name}{item.option ? ` (${item.option})` : ''}{item.size ? ` [${item.size}]` : ''}{item.addons ? ` ✨${item.addons}` : ''}</span>
                  <span style={{ color: priceColor }}>RM {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: 'bold', color: priceColor, fontSize: '16px' }}>
                {t('total')}: RM {order.total?.toFixed(2) || '0.00'}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => confirmNewOrder(order)}
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '6px 16px', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                >
                  ✅ {t('accept')}
                </button>
                <button
                  onClick={() => cancelNewOrder(order)}
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '6px 16px', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                >
                  ❌ {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderUnpaidOrders = () => {
    if (unpaidOrders.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: textMuted }}>
          💰 {t('no_unpaid_orders_msg')}
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {unpaidOrders.map(order => (
          <div key={order.id} style={{
            ...glassEffect,
            borderRadius: '16px',
            padding: isMobile ? '14px' : '18px',
            borderLeft: `4px solid #eab308`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontWeight: 'bold', color: textColor }}>
                  #{order.order_number}
                </span>
                <span style={{ marginLeft: '10px', color: textMuted, fontSize: '13px' }}>
                  {order.order_type === 'take_away' ? '🥡 ' + t('take_away') : '🍽️ ' + t('table') + ' ' + (order.table_number || '')}
                </span>
                <span style={{
                  marginLeft: '10px',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  background: order.status === 'ready' ? '#22c55e' : '#f59e0b',
                  color: 'white'
                }}>
                  {order.status === 'ready' ? t('ready') : t('preparing')}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: textMuted }}>
                🕐 {new Date(order.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div style={{ marginTop: '6px', color: textColor }}>
              👤 {order.customer_name || t('guest')}
              {order.customer_phone && <span style={{ marginLeft: '10px', fontSize: '12px', color: textMuted }}>📞 {order.customer_phone}</span>}
            </div>
            <div style={{ margin: '8px 0', padding: '8px', background: secondaryBg, borderRadius: '12px' }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor, padding: '2px 0' }}>
                  <span>{item.quantity}x {item.name}{item.option ? ` (${item.option})` : ''}{item.size ? ` [${item.size}]` : ''}{item.addons ? ` ✨${item.addons}` : ''}</span>
                  <span style={{ color: priceColor }}>RM {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontWeight: 'bold', color: priceColor, fontSize: '16px' }}>
                {t('total')}: RM {order.total?.toFixed(2) || '0.00'}
              </span>
              <button
                onClick={() => openPaymentModal(order)}
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                💰 {t('record_payment')}
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderHistory = () => {
    const totalPages = Math.ceil(orderHistory.length / historyItemsPerPage)
    const paginated = orderHistory.slice((historyPage - 1) * historyItemsPerPage, historyPage * historyItemsPerPage)
    
    if (orderHistory.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '30px 20px', color: textMuted }}>
          📜 {t('no_history_orders')}
        </div>
      )
    }
    
    return (
      <div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? '12px' : '13px' }}>
            <thead>
              <tr style={{ background: secondaryBg }}>
                <th style={{ padding: '10px', textAlign: 'left', color: textColor }}>{t('id')}</th>
                <th style={{ padding: '10px', textAlign: 'left', color: textColor }}>{t('customer_name')}</th>
                <th style={{ padding: '10px', textAlign: 'left', color: textColor }}>{t('order_type')}</th>
                <th style={{ padding: '10px', textAlign: 'left', color: textColor }}>{t('total')}</th>
                <th style={{ padding: '10px', textAlign: 'left', color: textColor }}>{t('payment_method_label')}</th>
                <th style={{ padding: '10px', textAlign: 'left', color: textColor }}>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(order => (
                <tr key={order.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <td style={{ padding: '8px', color: textColor }}>{order.order_number || `ORD-${order.id}`}</td>
                  <td style={{ padding: '8px', color: textColor }}>{order.customer_name || 'Walk-in'}</td>
                  <td style={{ padding: '8px', color: textColor }}>{order.order_type === 'take_away' ? '🥡' : '🍽️'}</td>
                  <td style={{ padding: '8px', color: priceColor, fontWeight: 'bold' }}>RM {Number(order.grand_total || order.total || 0).toFixed(2)}</td>
                  <td style={{ padding: '8px', color: textColor }}>
                    {order.payment_method === 'cash' ? '💵' : order.payment_method === 'tng' ? '📱' : '🏦'}
                    {order.payment_method || '-'}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button
                      onClick={() => printReceiptLegacy(order)}
                      style={{ background: '#3b82f6', color: 'white', padding: '4px 12px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '11px' }}
                    >
                      🧾
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
            <button onClick={() => setHistoryPage(1)} disabled={historyPage === 1} style={{ padding: '4px 12px', background: historyPage === 1 ? secondaryBg : '#3b82f6', color: historyPage === 1 ? textMuted : 'white', border: 'none', borderRadius: '20px', cursor: historyPage === 1 ? 'not-allowed' : 'pointer', fontSize: '11px' }}>«</button>
            <button onClick={() => setHistoryPage(p => Math.max(1, p-1))} disabled={historyPage === 1} style={{ padding: '4px 12px', background: historyPage === 1 ? secondaryBg : '#3b82f6', color: historyPage === 1 ? textMuted : 'white', border: 'none', borderRadius: '20px', cursor: historyPage === 1 ? 'not-allowed' : 'pointer', fontSize: '11px' }}>‹</button>
            <span style={{ padding: '4px 12px', color: textColor, fontSize: '12px' }}>{historyPage} / {totalPages}</span>
            <button onClick={() => setHistoryPage(p => Math.min(totalPages, p+1))} disabled={historyPage === totalPages} style={{ padding: '4px 12px', background: historyPage === totalPages ? secondaryBg : '#3b82f6', color: historyPage === totalPages ? textMuted : 'white', border: 'none', borderRadius: '20px', cursor: historyPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '11px' }}>›</button>
            <button onClick={() => setHistoryPage(totalPages)} disabled={historyPage === totalPages} style={{ padding: '4px 12px', background: historyPage === totalPages ? secondaryBg : '#3b82f6', color: historyPage === totalPages ? textMuted : 'white', border: 'none', borderRadius: '20px', cursor: historyPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '11px' }}>»</button>
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  // ===== ITEM MODAL - WITH STOCK DISPLAY & ADD-ONS =====
  // ============================================================
  const renderItemModal = () => {
    if (!selectedItem) return null
    
    const isDrink = isDrinkCategory(selectedItem.category)
    const hasSize = isSizeCategory(selectedItem)
    const drinkOpts = getDrinkOptionsForItem(selectedItem)
    const sizes = menuOptions
    const basePrice = getItemPrice(selectedItem, selectedOption, selectedSize)
    const addonTotal = getAddonTotal()
    const finalPrice = basePrice + addonTotal
    const hasAddons = selectedItem.has_addons === true && menuAddons.length > 0
    
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 2000, padding: '20px'
      }}>
        <div style={{
          background: cardBg,
          padding: isMobile ? '20px' : '28px',
          borderRadius: '24px',
          maxWidth: '450px',
          width: '100%',
          ...glassEffect,
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          {selectedItem.image_url && (
            <img src={selectedItem.image_url} alt={selectedItem.name} style={{
              width: '100%', height: '120px', objectFit: 'contain',
              borderRadius: '12px', marginBottom: '12px',
              background: '#fff', padding: '6px'
            }} />
          )}
          
          <h2 style={{ color: textColor, fontSize: isMobile ? '18px' : '22px', fontWeight: 'bold', marginBottom: '4px' }}>
            {selectedItem.name}
          </h2>
          
          {/* ===== HARGA ASAL ===== */}
          <div style={{ 
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: 'bold',
            color: priceColor,
            marginBottom: '12px'
          }}>
            RM {basePrice.toFixed(2)}
          </div>
          
          {isDrink && drinkOpts.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: textColor, fontWeight: 'bold', fontSize: '13px' }}>{t('select_drink_option')}</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                {drinkOpts.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.option_type)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: selectedOption === opt.option_type ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : secondaryBg,
                      color: selectedOption === opt.option_type ? 'white' : textColor,
                      border: selectedOption === opt.option_type ? 'none' : `1px solid ${borderColor}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    {opt.option_type === 'Panas' ? '🔥' : '🧊'} {opt.option_type}
                    <br /><small>RM {opt.price}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {hasSize && sizes.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: textColor, fontWeight: 'bold', fontSize: '13px' }}>{t('select_size')}</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                {sizes.map(size => {
                  const isOutOfStock = (size.stock || 0) <= 0
                  const isLowStock = (size.stock || 0) > 0 && (size.stock || 0) <= 5
                  const sizePrice = getItemPrice(selectedItem, selectedOption, size)
                  
                  return (
                    <button
                      key={size.id}
                      onClick={() => {
                        if (!isOutOfStock) {
                          setSelectedSize(size)
                        } else {
                          toast.error(`❌ "${size.option_name}" ${t('out_of_stock')}`)
                        }
                      }}
                      style={{
                        flex: 1,
                        minWidth: isMobile ? '60px' : '80px',
                        padding: '10px',
                        background: isOutOfStock 
                          ? '#e2e8f0' 
                          : (selectedSize?.id === size.id ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : secondaryBg),
                        color: isOutOfStock ? '#94a3b8' : (selectedSize?.id === size.id ? 'white' : textColor),
                        border: isOutOfStock 
                          ? `2px solid ${dangerColor}` 
                          : (selectedSize?.id === size.id ? 'none' : `1px solid ${borderColor}`),
                        borderRadius: '12px',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        opacity: isOutOfStock ? 0.6 : 1,
                        position: 'relative'
                      }}
                      disabled={isOutOfStock}
                    >
                      <div>{size.option_name}</div>
                      <div style={{ fontSize: '12px', color: isOutOfStock ? '#94a3b8' : priceColor }}>
                        RM {sizePrice.toFixed(2)}
                      </div>
                      
                      {isOutOfStock && (
                        <div style={{
                          fontSize: '9px',
                          background: dangerColor,
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          marginTop: '4px',
                          fontWeight: 'bold'
                        }}>
                          ❌ {t('out_of_stock')}
                        </div>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <div style={{
                          fontSize: '9px',
                          background: '#f59e0b',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          marginTop: '4px',
                          fontWeight: 'bold'
                        }}>
                          ⚠️ {t('stock_label')}: {size.stock}
                        </div>
                      )}
                      {!isOutOfStock && !isLowStock && (
                        <div style={{
                          fontSize: '8px',
                          color: '#94a3b8',
                          marginTop: '2px'
                        }}>
                          📦 {size.stock || 0}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* ===== ADD-ON SECTION ===== */}
          {hasAddons && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ 
                color: textColor, 
                fontWeight: 'bold', 
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✨ {t('addons')}
                <span style={{ 
                  fontSize: '10px', 
                  color: textMuted, 
                  fontWeight: 'normal' 
                }}>
                  ({t('addon_optional')}) +RM {addonTotal.toFixed(2)}
                </span>
              </label>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px', 
                marginTop: '6px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {menuAddons.map(addon => {
                  const isSelected = selectedAddons.includes(addon.id)
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 14px',
                        background: isSelected ? 'rgba(34,197,94,0.15)' : secondaryBg,
                        border: isSelected ? `2px solid ${priceColor}` : `1px solid ${borderColor}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        color: textColor,
                        fontSize: '13px'
                      }}
                    >
                      <span>{addon.name}</span>
                      <span style={{ 
                        color: priceColor, 
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}>
                        +RM {parseFloat(addon.price).toFixed(2)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ color: textColor, fontWeight: 'bold', fontSize: '13px' }}>{t('quantity')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity-1))} style={{ width: '36px', height: '36px', background: secondaryBg, border: `1px solid ${borderColor}`, borderRadius: '10px', cursor: 'pointer', fontSize: '18px', color: textColor }}>-</button>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: textColor, minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity+1)} style={{ width: '36px', height: '36px', background: secondaryBg, border: `1px solid ${borderColor}`, borderRadius: '10px', cursor: 'pointer', fontSize: '18px', color: textColor }}>+</button>
            </div>
          </div>
          
          <div style={{ marginBottom: '14px' }}>
            <input
              type="text"
              placeholder={t('special_request')}
              value={selectedItem.notes || ''}
              onChange={(e) => setSelectedItem({...selectedItem, notes: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: textColor,
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={addToCart}
              disabled={hasSize && !selectedSize}
              style={{
                flex: 2,
                padding: isMobile ? '12px' : '14px',
                background: (hasSize && !selectedSize) ? '#94a3b8' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: (hasSize && !selectedSize) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '13px' : '14px'
              }}
            >
              ➕ {t('add_to_cart')} (RM {(finalPrice * quantity).toFixed(2)})
            </button>
            <button
              onClick={() => { 
                setShowItemModal(false); 
                setSelectedItem(null); 
                setSelectedOption(''); 
                setSelectedSize(null); 
                setSelectedAddons([]);
                setMenuAddons([]);
                setQuantity(1) 
              }}
              style={{
                flex: 1,
                padding: isMobile ? '12px' : '14px',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '13px' : '14px'
              }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // PAYMENT MODAL
  // ============================================================
  const renderPaymentModal = () => {
    if (!showPaymentModal || !selectedOrder) return null
    
    const subtotal = parseFloat(selectedOrder.subtotal || selectedOrder.total || 0)
    const serviceCharge = selectedOrder.order_type === 'take_away' ? 0 : subtotal * (settings.service_charge / 100)
    const tax = subtotal * (settings.tax / 100)
    const grandTotal = subtotal + serviceCharge + tax
    
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 3000, padding: '20px'
      }}>
        <div style={{
          background: cardBg,
          padding: isMobile ? '24px' : '32px',
          borderRadius: '24px',
          maxWidth: '420px',
          width: '100%',
          ...glassEffect
        }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: textColor, margin: 0 }}>💰 {t('record_payment')}</h2>
            <p style={{ color: textMuted, fontSize: '13px' }}>{selectedOrder.customer_name || t('guest')}</p>
          </div>
          
          <div style={{ background: secondaryBg, padding: '14px', borderRadius: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>{t('subtotal')}</span>
              <span>RM {subtotal.toFixed(2)}</span>
            </div>
            {selectedOrder.order_type !== 'take_away' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>{t('service_charge')} ({settings.service_charge}%)</span>
                <span>RM {serviceCharge.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>{t('tax')} ({settings.tax}%)</span>
              <span>RM {tax.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: `1px solid ${borderColor}`, marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
              <span>{t('total')}</span>
              <span style={{ color: priceColor }}>RM {grandTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: textColor, fontWeight: 'bold', fontSize: '13px' }}>{t('payment_method')}</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              {['cash', 'tng', 'bank'].map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: paymentMethod === m ? 'linear-gradient(135deg, #22c55e, #16a34a)' : secondaryBg,
                    color: paymentMethod === m ? 'white' : textColor,
                    border: paymentMethod === m ? 'none' : `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px'
                  }}
                >
                  {m === 'cash' ? '💵' : m === 'tng' ? '📱' : '🏦'} {m === 'cash' ? t('cash') : m === 'tng' ? t('tng') : t('bank')}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => markAsPaid(selectedOrder)}
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '13px' : '14px'
              }}
            >
              ✅ {t('save')}
            </button>
            <button
              onClick={() => { setShowPaymentModal(false); setSelectedOrder(null) }}
              style={{
                flex: 1,
                padding: '12px',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '13px' : '14px'
              }}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // RECEIPT MODAL
  // ============================================================
  const renderReceiptModal = () => {
    if (!showReceipt || !currentReceiptOrder) return null
    
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 4000, padding: '20px'
      }}>
        <div style={{
          background: cardBg,
          padding: isMobile ? '24px' : '32px',
          borderRadius: '24px',
          maxWidth: '400px',
          width: '100%',
          ...glassEffect
        }}>
          <div style={{ textAlign: 'center', borderBottom: `1px solid ${borderColor}`, paddingBottom: '12px', marginBottom: '12px' }}>
            <h2 style={{ color: textColor, margin: 0 }}>🧾 {t('receipt_title')}</h2>
            <p style={{ color: textMuted, fontSize: '12px' }}>{currentReceiptOrder.customer_name || t('guest')}</p>
          </div>
          
          {currentReceiptOrder.items?.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor, padding: '4px 0', borderBottom: idx !== currentReceiptOrder.items.length-1 ? `1px solid ${borderColor}` : 'none' }}>
              <span>{item.name}{item.option ? ` (${item.option})` : ''}{item.size ? ` [${item.size}]` : ''}{item.addons ? ` ✨${item.addons}` : ''} x{item.quantity}</span>
              <span style={{ color: priceColor }}>RM {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          
          <div style={{ borderTop: `1px solid ${borderColor}`, marginTop: '10px', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
              <span>{t('total')}</span>
              <span style={{ color: priceColor }}>RM {Number(currentReceiptOrder.grand_total || currentReceiptOrder.total || 0).toFixed(2)}</span>
            </div>
            <div style={{ fontSize: '12px', color: textMuted, textAlign: 'center', marginTop: '8px' }}>
              💳 {currentReceiptOrder.payment_method === 'cash' ? t('cash') : currentReceiptOrder.payment_method === 'tng' ? t('tng') : t('bank')}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              onClick={() => printReceiptLegacy(currentReceiptOrder)}
              style={{
                flex: 1,
                padding: '12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🖨️ {t('print_receipt')}
            </button>
            <button
              onClick={() => { setShowReceipt(false); setCurrentReceiptOrder(null) }}
              style={{
                flex: 1,
                padding: '12px',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <Sidebar>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: bgColor }}>
          <div className="spinner"></div>
        </div>
      </Sidebar>
    )
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <Sidebar>
      <div style={{ padding: isMobile ? '12px' : '20px', maxWidth: '1600px', margin: '0 auto', background: bgColor, minHeight: '100vh' }}>
        
        {/* ===== HEADER ===== */}
        <div style={{ ...glassEffect, borderRadius: '20px', padding: isMobile ? '14px 18px' : '18px 24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ margin: 0, color: textColor, fontSize: isMobile ? '18px' : '22px', fontWeight: 'bold' }}>{t('pos_title')}</h1>
            <p style={{ margin: 0, color: textMuted, fontSize: isMobile ? '10px' : '12px' }}>{t('pos_subtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={testSound} style={{ padding: isMobile ? '6px 14px' : '8px 18px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: isMobile ? '11px' : '13px' }}>
              🔊 {t('sound_test')}
            </button>
            <button 
              onClick={() => { 
                loadAllData(); 
                loadNewOrders(); 
                loadUnpaidOrders(); 
                loadOrderHistory(); 
                resetNotifiedOrders();
                reloadReceipt();
                toast.success('🔄 Refreshed!') 
              }} 
              style={{ padding: isMobile ? '6px 14px' : '8px 18px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: isMobile ? '11px' : '13px' }}
            >
              🔄 {t('refresh')}
            </button>
          </div>
        </div>
        
        {/* ===== ORDER TYPE & DETAILS ===== */}
        <div style={{ ...glassEffect, borderRadius: '16px', padding: isMobile ? '12px 16px' : '16px 20px', marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setOrderType('dine_in')} style={{ padding: '6px 14px', background: orderType === 'dine_in' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent', color: orderType === 'dine_in' ? 'white' : textColor, border: orderType === 'dine_in' ? 'none' : `1px solid ${borderColor}`, borderRadius: '30px', cursor: 'pointer', fontSize: isMobile ? '10px' : '12px', fontWeight: 'bold' }}>🍽️ {t('dine_in')}</button>
            <button onClick={() => setOrderType('take_away')} style={{ padding: '6px 14px', background: orderType === 'take_away' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent', color: orderType === 'take_away' ? 'white' : textColor, border: orderType === 'take_away' ? 'none' : `1px solid ${borderColor}`, borderRadius: '30px', cursor: 'pointer', fontSize: isMobile ? '10px' : '12px', fontWeight: 'bold' }}>🥡 {t('take_away')}</button>
          </div>
          {orderType === 'dine_in' && (
            <input type="number" placeholder={t('table_number')} value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} style={{ padding: '8px 14px', borderRadius: '12px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, width: isMobile ? '80px' : '120px', outline: 'none', fontSize: '13px' }} />
          )}
          <input type="text" placeholder={t('customer_name')} value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ padding: '8px 14px', borderRadius: '12px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, flex: 1, minWidth: '120px', outline: 'none', fontSize: '13px' }} />
          <input type="tel" placeholder={t('customer_phone')} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ padding: '8px 14px', borderRadius: '12px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, flex: 1, minWidth: '120px', outline: 'none', fontSize: '13px' }} />
        </div>
        
        {/* ===== TOP TABS ===== */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: darkMode ? 'rgba(30,30,46,0.5)' : 'rgba(0,0,0,0.03)', borderRadius: '50px', padding: '4px', overflowX: 'auto', flexWrap: 'nowrap' }}>
          <button onClick={() => setActiveTab('pos')} style={{ flex: 1, padding: isMobile ? '8px 12px' : '10px 16px', background: activeTab === 'pos' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent', color: activeTab === 'pos' ? 'white' : textColor, border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: activeTab === 'pos' ? 'bold' : '500', fontSize: isMobile ? '11px' : '13px', whiteSpace: 'nowrap' }}>🧾 {t('pos')}</button>
          <button onClick={() => setActiveTab('orders')} style={{ flex: 1, padding: isMobile ? '8px 12px' : '10px 16px', background: activeTab === 'orders' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent', color: activeTab === 'orders' ? 'white' : textColor, border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: activeTab === 'orders' ? 'bold' : '500', fontSize: isMobile ? '11px' : '13px', whiteSpace: 'nowrap', position: 'relative' }}>
            🔔 {t('new_order')}
            {newOrders.length > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '1px 6px', fontSize: '9px', fontWeight: 'bold' }}>{newOrders.length}</span>}
          </button>
          <button onClick={() => setActiveTab('unpaid')} style={{ flex: 1, padding: isMobile ? '8px 12px' : '10px 16px', background: activeTab === 'unpaid' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent', color: activeTab === 'unpaid' ? 'white' : textColor, border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: activeTab === 'unpaid' ? 'bold' : '500', fontSize: isMobile ? '11px' : '13px', whiteSpace: 'nowrap', position: 'relative' }}>
            💰 {t('unpaid')}
            {unpaidOrders.length > 0 && <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '1px 6px', fontSize: '9px', fontWeight: 'bold' }}>{unpaidOrders.length}</span>}
          </button>
          <button onClick={() => setActiveTab('history')} style={{ flex: 1, padding: isMobile ? '8px 12px' : '10px 16px', background: activeTab === 'history' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent', color: activeTab === 'history' ? 'white' : textColor, border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: activeTab === 'history' ? 'bold' : '500', fontSize: isMobile ? '11px' : '13px', whiteSpace: 'nowrap' }}>📜 {t('history')}</button>
        </div>
        
        {/* ===== CONTENT ===== */}
        {activeTab === 'pos' && (
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px' }}>
            {/* Menu Panel */}
            <div style={{ flex: isMobile ? 1 : 2, minWidth: 0 }}>
              <div style={{ ...glassEffect, borderRadius: '16px', padding: isMobile ? '12px' : '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🔍</span>
                  <input type="text" placeholder={t('search_menu')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: isMobile ? '8px 12px' : '10px 14px', border: 'none', background: 'transparent', color: textColor, fontSize: '13px', outline: 'none' }} />
                  {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'transparent', border: 'none', color: textMuted, cursor: 'pointer', fontSize: '16px' }}>✕</button>}
                </div>
              </div>
              {renderCategoryTabs()}
              <div style={{ marginTop: '12px' }}>{renderMenuItems()}</div>
            </div>
            
            {/* Cart Panel */}
            <div style={{ flex: isMobile ? 1 : 1, minWidth: isMobile ? '100%' : '280px' }}>
              {renderCart()}
            </div>
          </div>
        )}
        
        {activeTab === 'orders' && renderNewOrders()}
        {activeTab === 'unpaid' && renderUnpaidOrders()}
        {activeTab === 'history' && renderHistory()}
        
        {/* ===== MODALS ===== */}
        {showItemModal && renderItemModal()}
        {renderPaymentModal()}
        {renderReceiptModal()}
        
        <style>
          {`
            .spinner { width: 40px; height: 40px; border: 3px solid rgba(59,130,246,0.15); border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
            @keyframes spin { to { transform: rotate(360deg); } }
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-track { background: ${darkMode ? '#1a1a2e' : '#e2e8f0'}; border-radius: 10px; }
            ::-webkit-scrollbar-thumb { background: ${darkMode ? '#3d3d5c' : '#94a3b8'}; border-radius: 10px; }
            input, button { transition: all 0.2s ease; }
            input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
          `}
        </style>
      </div>
    </Sidebar>
  )
}

export default StaffApp