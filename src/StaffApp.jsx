import { useState, useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabase'
import toast from 'react-hot-toast'
import { playSound, initSound, unlockAudio } from './utils/sound'

function StaffApp() {
  const { darkMode } = useTheme()
  const { language } = useLanguage()
  
  // ============================================================
  // TRANSLATIONS
  // ============================================================
  const t = (key) => {
    const translations = {
      pos: { en: '🧾 POS', ms: '🧾 Jualan' },
      new_order: { en: '🆕 New Orders', ms: '🆕 Pesanan Baru' },
      unpaid: { en: '💰 Unpaid', ms: '💰 Belum Bayar' },
      history: { en: '📜 History', ms: '📜 Sejarah' },
      dine_in: { en: '🍽️ Dine In', ms: '🍽️ Makan di Sini' },
      take_away: { en: '🥡 Take Away', ms: '🥡 Bungkus' },
      table: { en: 'Table', ms: 'Meja' },
      customer_name: { en: 'Customer Name', ms: 'Nama Pelanggan' },
      customer_phone: { en: 'Phone', ms: 'Telefon' },
      table_number: { en: 'Table No.', ms: 'No. Meja' },
      add: { en: 'Add', ms: 'Tambah' },
      cart: { en: '🛒 Cart', ms: '🛒 Keranjang' },
      empty_cart: { en: 'Cart is empty', ms: 'Keranjang kosong' },
      subtotal: { en: 'Subtotal', ms: 'Subtotal' },
      service_charge: { en: 'Service Charge', ms: 'Caj Perkhidmatan' },
      tax: { en: 'Tax', ms: 'Cukai' },
      total: { en: 'Total', ms: 'Jumlah' },
      place_order: { en: 'Place Order', ms: 'Hantar Pesanan' },
      accept: { en: 'Accept', ms: 'Terima' },
      cancel: { en: 'Cancel', ms: 'Batal' },
      start_cooking: { en: 'Start Cooking', ms: 'Mula Masak' },
      ready: { en: 'Ready', ms: 'Sedia' },
      preparing: { en: 'Preparing', ms: 'Sedang Masak' },
      pending: { en: 'Pending', ms: 'Menunggu' },
      record_payment: { en: 'Record Payment', ms: 'Rekod Bayaran' },
      payment_method: { en: 'Payment Method', ms: 'Kaedah Bayaran' },
      cash: { en: 'Cash', ms: 'Tunai' },
      tng: { en: 'TnG', ms: 'TnG' },
      bank: { en: 'Bank', ms: 'Bank' },
      save: { en: 'Save', ms: 'Simpan' },
      payment_received: { en: 'Payment received', ms: 'Bayaran diterima' },
      refresh: { en: 'Refresh', ms: 'Segar' },
      sound: { en: 'Sound', ms: 'Bunyi' },
      kitchen: { en: 'Kitchen', ms: 'Dapur' },
      hot: { en: 'Hot', ms: 'Panas' },
      cold: { en: 'Cold', ms: 'Sejuk' },
      add_to_cart: { en: 'Add to Cart', ms: 'Tambah ke Keranjang' },
      no_data: { en: 'No data', ms: 'Tiada data' },
      new_orders: { en: 'new orders', ms: 'pesanan baru' },
      btn_receipt: { en: 'Receipt', ms: 'Resit' },
      id: { en: 'ID', ms: 'ID' },
      order_type: { en: 'Type', ms: 'Jenis' },
      payment_method_label: { en: 'Payment', ms: 'Bayaran' },
      date: { en: 'Date', ms: 'Tarikh' },
      action: { en: 'Action', ms: 'Tindakan' },
      first: { en: 'First', ms: 'Pertama' },
      prev: { en: 'Prev', ms: 'Sebelum' },
      next: { en: 'Next', ms: 'Seterus' },
      last: { en: 'Last', ms: 'Terakhir' },
      items: { en: 'items', ms: 'item' },
      select_drink: { en: 'Select drink temperature', ms: 'Pilih suhu minuman' },
      clear_cart: { en: '🗑️ Clear Cart', ms: '🗑️ Kosongkan Keranjang' },
      checkout: { en: '💳 Checkout', ms: '💳 Bayar' },
      print_receipt: { en: '🖨️ Print Receipt', ms: '🖨️ Cetak Resit' },
      back: { en: 'Back', ms: 'Kembali' },
      view_order: { en: 'View Order', ms: 'Lihat Pesanan' },
      mark_paid: { en: '💰 Mark as Paid', ms: '💰 Tanda Bayar' },
      close: { en: 'Close', ms: 'Tutup' },
      all_categories: { en: '📋 All', ms: '📋 Semua' },
      order_added: { en: '✅ Order added!', ms: '✅ Pesanan ditambah!' },
      order_cancelled: { en: '❌ Order cancelled', ms: '❌ Pesanan dibatalkan' },
      payment_success: { en: '✅ Payment successful!', ms: '✅ Pembayaran berjaya!' },
      please_select_item: { en: '⚠️ Please select an item', ms: '⚠️ Sila pilih item' },
      please_select_option: { en: '⚠️ Please select an option', ms: '⚠️ Sila pilih pilihan' },
      cart_empty_msg: { en: '⚠️ Cart is empty', ms: '⚠️ Keranjang kosong' },
      confirm_clear_cart: { en: 'Clear cart?', ms: 'Kosongkan keranjang?' },
      no_unpaid_orders_msg: { en: '📭 No unpaid orders', ms: '📭 Tiada pesanan belum bayar' },
      new_order_started: { en: '📝 New order started!', ms: '📝 Pesanan baru dimulakan!' },
      order_paid: { en: '✅ Order paid!', ms: '✅ Pesanan dibayar!' },
      error_checkout: { en: '❌ Checkout error', ms: '❌ Ralat bayaran' },
      search_menu: { en: '🔍 Search menu...', ms: '🔍 Cari menu...' },
      order_details: { en: '📋 Order Details', ms: '📋 Butiran Pesanan' },
      unpaid_orders_title: { en: '💰 Unpaid Orders', ms: '💰 Pesanan Belum Bayar' },
      select_drink_option: { en: 'Select Drink Option', ms: 'Pilih Pilihan Minuman' },
      select_size_option: { en: 'Select Size', ms: 'Pilih Saiz' },
      history_title: { en: '📜 Order History', ms: '📜 Sejarah Pesanan' },
      receipt_title: { en: '🧾 RECEIPT', ms: '🧾 RESIT' },
      receipt_thankyou: { en: 'Thank you for dining with us!', ms: 'Terima kasih kerana makan di sini!' },
      receipt_order: { en: 'Order', ms: 'Pesanan' },
      receipt_table: { en: 'Table', ms: 'Meja' },
      receipt_customer: { en: 'Customer', ms: 'Pelanggan' },
      receipt_item: { en: 'Item', ms: 'Item' },
      receipt_qty: { en: 'Qty', ms: 'Kuantiti' },
      receipt_price: { en: 'Price', ms: 'Harga' },
      receipt_total: { en: 'TOTAL', ms: 'JUMLAH' },
      receipt_paid: { en: 'Paid', ms: 'Dibayar' },
      receipt_unpaid: { en: 'Unpaid', ms: 'Belum Bayar' },
      receipt_cash: { en: 'Cash', ms: 'Tunai' },
      receipt_tng: { en: 'TnG', ms: 'TnG' },
      receipt_bank: { en: 'Bank', ms: 'Bank' },
      receipt_payment_method: { en: 'Payment Method', ms: 'Kaedah Bayaran' },
      guest: { en: 'Guest', ms: 'Tetamu' },
      download_receipt: { en: 'Download Receipt', ms: 'Muat Turun Resit' },
      confirm_order: { en: 'Confirm Order', ms: 'Sahkan Pesanan' },
      no_new_orders: { en: '📭 No new orders to confirm', ms: '📭 Tiada pesanan baru untuk disahkan' },
      no_history_orders: { en: '📭 No order history', ms: '📭 Tiada sejarah pesanan' },
      pos_title: { en: 'Point of Sale', ms: 'Tempat Jualan' },
      pos_subtitle: { en: 'Take orders and manage payments', ms: 'Ambil pesanan dan urus pembayaran' },
      sound_test: { en: '🔊 Test Sound', ms: '🔊 Uji Bunyi' },
    }
    if (!translations[key]) return key
    return language === 'en' ? translations[key].en : translations[key].ms
  }

  // ============================================================
  // STATE
  // ============================================================
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [drinkOptions, setDrinkOptions] = useState([])
  const [cart, setCart] = useState([])
  const [customerOrders, setCustomerOrders] = useState([])
  const [unpaidOrders, setUnpaidOrders] = useState([])
  const [orderHistory, setOrderHistory] = useState([])
  const [activeTab, setActiveTab] = useState('pos')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [orderType, setOrderType] = useState('dine_in')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  
  // Drink modal
  const [showDrinkModal, setShowDrinkModal] = useState(false)
  const [selectedDrinkItem, setSelectedDrinkItem] = useState(null)
  const [selectedDrinkOption, setSelectedDrinkOption] = useState('Panas')
  const [addingItemId, setAddingItemId] = useState(null)
  
  // Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  
  // Receipt
  const [showReceipt, setShowReceipt] = useState(false)
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState(null)
  
  // Settings
  const [serviceChargePercent, setServiceChargePercent] = useState(6)
  const [taxPercent, setTaxPercent] = useState(6)
  const [kitchenEnabled, setKitchenEnabled] = useState(true)
  
  // Pagination
  const [historyPage, setHistoryPage] = useState(1)
  const historyItemsPerPage = 10

  // ===== TRACK PREVIOUS ORDERS FOR SOUND =====
  const [previousOrderCount, setPreviousOrderCount] = useState(0)

  // ============================================================
  // INIT SOUND
  // ============================================================
  useEffect(() => {
    console.log('🔊 Initializing sound...')
    initSound()
    
    const unlock = () => {
      console.log('🔓 Unlocking audio on user interaction...')
      unlockAudio()
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
    
    document.addEventListener('click', unlock)
    document.addEventListener('touchstart', unlock)
    
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }, [])

  // ============================================================
  // THEME COLORS
  // ============================================================
  const bgColor = darkMode ? '#0f0f1a' : '#f1f5f9'
  const cardBg = darkMode ? 'rgba(30, 30, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const textColor = darkMode ? '#f1f5f9' : '#0f172a'
  const textMuted = darkMode ? '#94a3b8' : '#64748b'
  const borderColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.6)'
  const inputBg = darkMode ? '#1e1e2e' : '#ffffff'
  const inputBorder = darkMode ? '#334155' : '#cbd5e1'
  const secondaryBg = darkMode ? 'rgba(30, 30, 46, 0.8)' : 'rgba(248, 250, 252, 0.9)'
  const priceColor = darkMode ? '#4ade80' : '#22c55e'
  
  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${borderColor}`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
  }

  // ============================================================
  // CHECK MOBILE
  // ============================================================
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    console.log('📊 Loading initial data...')
    loadAllData()
    loadCustomerOrders()
    loadUnpaidOrders()
    loadOrderHistory()
    loadSettings()

    // ===== SUPABASE SUBSCRIPTIONS =====
    const menuSub = supabase.channel('menu_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, () => loadMenu())
      .subscribe()
    
    const drinkSub = supabase.channel('drink_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drink_options' }, () => loadDrinkOptions())
      .subscribe()
    
    const orderSub = supabase.channel('order_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_orders' }, () => {
        console.log('🔄 Realtime: Order changed!')
        loadCustomerOrders()
        loadUnpaidOrders()
        loadOrderHistory()
      })
      .subscribe()

    // ===== INTERVAL CHECKING (FALLBACK) =====
    const checkOrders = async () => {
      try {
        const { data } = await supabase
          .from('customer_orders')
          .select('id')
          .eq('status', 'pending')
        
        const currentCount = data?.length || 0
        
        // If new orders detected (count increased)
        if (currentCount > previousOrderCount) {
          console.log(`🔔 New order detected via interval! (${previousOrderCount} → ${currentCount})`)
          playSound()
          toast.success(`🔔 ${currentCount - previousOrderCount} new order(s)!`)
        }
        
        setPreviousOrderCount(currentCount)
      } catch (err) {
        console.error('Interval check error:', err)
      }
    }
    
    // Check immediately
    checkOrders()
    
    // Check every 5 seconds
    const interval = setInterval(checkOrders, 5000)

    return () => {
      menuSub.unsubscribe()
      drinkSub.unsubscribe()
      orderSub.unsubscribe()
      clearInterval(interval)
    }
  }, [previousOrderCount])

  // ============================================================
  // LOAD FUNCTIONS
  // ============================================================
  async function loadAllData() {
    setLoading(true)
    await Promise.all([
      loadCategories(),
      loadMenu(),
      loadDrinkOptions()
    ])
    setLoading(false)
  }

  async function loadCategories() {
    try {
      const { data } = await supabase.from('categories').select('*').order('sort_order')
      setCategories(data || [])
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  async function loadMenu() {
    try {
      const { data } = await supabase.from('menu').select('*').order('sort_order')
      setMenu(data || [])
    } catch (err) {
      console.error('Error loading menu:', err)
    }
  }

  async function loadDrinkOptions() {
    try {
      const { data } = await supabase.from('drink_options').select('*')
      setDrinkOptions(data || [])
    } catch (err) {
      console.error('Error loading drink options:', err)
      setDrinkOptions([])
    }
  }

  async function loadSettings() {
    try {
      const { data } = await supabase.from('settings').select('key, value')
      if (data) {
        const sc = data.find(s => s.key === 'service_charge')
        const tx = data.find(s => s.key === 'tax')
        const kitchen = data.find(s => s.key === 'kitchen_enabled')
        if (sc) setServiceChargePercent(parseFloat(sc.value) || 0)
        if (tx) setTaxPercent(parseFloat(tx.value) || 0)
        if (kitchen) setKitchenEnabled(kitchen.value === 'true')
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  async function loadCustomerOrders() {
    console.log('📊 loadCustomerOrders called')
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      console.log(`📊 Found ${data?.length || 0} pending orders`)
      setCustomerOrders(data || [])
      
      // Update previous count
      setPreviousOrderCount(data?.length || 0)
      
      // 🔔 PLAY SOUND BILA ADA NEW ORDER
      if (data && data.length > 0) {
        console.log('🔔 New order detected! Playing sound...')
        playSound()
      }
      
    } catch (err) {
      console.error('Error loading customer orders:', err)
      setCustomerOrders([])
    }
  }

  async function loadUnpaidOrders() {
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', 'unpaid')
        .in('status', ['pending', 'ready', 'preparing'])
        .order('created_at', { ascending: false })
      setUnpaidOrders(data || [])
    } catch (err) {
      console.error('Error loading unpaid orders:', err)
      setUnpaidOrders([])
    }
  }

  async function loadOrderHistory() {
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(200)
      setOrderHistory(data || [])
    } catch (err) {
      console.error('Error loading order history:', err)
      setOrderHistory([])
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const getCategories = () => {
    return ['Semua', ...categories.map(c => c.name)]
  }

  const getCategoryIcon = (cat) => {
    if (!cat || cat === 'Semua') return '📋'
    if (cat === 'Makanan') return '🍚'
    if (cat === 'Minuman') return '🥤'
    if (cat === 'SUP') return '🍜'
    if (cat === 'Jus') return '🧃'
    if (cat === 'Teh') return '🍵'
    if (cat === 'Kopi') return '☕'
    if (cat === 'Mee') return '🍜'
    if (cat === 'Nasi') return '🍚'
    if (cat === 'Telur') return '🥚'
    const found = categories.find(c => c.name === cat)
    return found?.icon || '📂'
  }

  const getDefaultIcon = (category) => {
    switch(category) {
      case 'Makanan': return '🍚'
      case 'Minuman': return '🥤'
      case 'SUP': return '🍜'
      default: return '🍽️'
    }
  }

  const getFilteredMenu = () => {
    let filtered = [...menu]
    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    return filtered
  }

  const isDrinkCategory = (category) => {
    const drinkCategories = ['Minuman', 'Jus', 'Teh', 'Kopi', 'Air', 'Milo', 'Nescafe', 'Teh Tarik']
    return drinkCategories.some(cat => category?.includes(cat))
  }

  const getDrinkOptionsForItem = (item) => {
    if (!item) return []
    return drinkOptions.filter(opt => opt.drink_name === item.name)
  }

  const hasDrinkOptions = (item) => {
    if (!item) return false
    return getDrinkOptionsForItem(item).length > 0
  }

  // ============================================================
  // CART FUNCTIONS
  // ============================================================
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const getServiceCharge = () => orderType === 'take_away' ? 0 : getSubtotal() * (serviceChargePercent / 100)
  const getTax = () => getSubtotal() * (taxPercent / 100)
  const getGrandTotal = () => getSubtotal() + getServiceCharge() + getTax()

  const addToCart = (item) => {
    setAddingItemId(item.id)
    setTimeout(() => setAddingItemId(null), 300)
    
    const hasDrinkOpts = getDrinkOptionsForItem(item).length > 0
    const isDrink = isDrinkCategory(item.category)
    
    if (hasDrinkOpts || isDrink) {
      setSelectedDrinkItem(item)
      setSelectedDrinkOption('Panas')
      setShowDrinkModal(true)
    } else {
      const existing = cart.find(x => x.id === item.id)
      if (existing) {
        setCart(cart.map(x => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x))
      } else {
        setCart([...cart, { ...item, quantity: 1, category: item.category || 'Makanan' }])
      }
      toast.success(`✅ ${item.name} ${t('add')}ed!`)
    }
  }

  const addDrinkToCart = () => {
    if (!selectedDrinkItem) return
    const options = getDrinkOptionsForItem(selectedDrinkItem)
    const selected = options?.find(opt => opt.option_type === selectedDrinkOption)
    if (!selected) return
    
    setAddingItemId(`${selectedDrinkItem.id}_${selectedDrinkOption}`)
    setTimeout(() => setAddingItemId(null), 300)
    
    const optionLabel = selectedDrinkOption === 'Panas' ? '☕ Panas' : '🧊 Sejuk'
    const newItem = {
      id: `${selectedDrinkItem.id}_${selectedDrinkOption}`,
      name: `${selectedDrinkItem.name} (${optionLabel})`,
      price: selected.price,
      quantity: 1,
      category: 'Minuman',
      option: selectedDrinkOption
    }
    
    setCart([...cart, newItem])
    setShowDrinkModal(false)
    setSelectedDrinkItem(null)
    toast.success(`✅ ${selectedDrinkItem.name} (${optionLabel}) ${t('add')}ed!`)
  }

  const removeFromCart = (id) => {
    const existing = cart.find(x => x.id === id)
    if (existing.quantity === 1) {
      setCart(cart.filter(x => x.id !== id))
    } else {
      setCart(cart.map(x => x.id === id ? { ...x, quantity: x.quantity - 1 } : x))
    }
  }

  const clearCart = () => {
    if (cart.length === 0) {
      toast.error(t('cart_empty_msg'))
      return
    }
    if (window.confirm(t('confirm_clear_cart'))) {
      setCart([])
      toast.success(t('order_cancelled'))
    }
  }

  // ============================================================
  // SAVE ORDER
  // ============================================================
  const saveOrder = async () => {
    if (cart.length === 0) { toast.error(t('cart_empty_msg')); return }
    if (orderType === 'dine_in' && !tableNumber) { toast.error('⚠️ Sila masukkan nombor meja!'); return }
    
    const orderNumber = 'ORD-' + Date.now()
    const items = cart.map(item => ({ 
      id: item.id, 
      name: item.name, 
      price: item.price, 
      quantity: item.quantity, 
      category: item.category || 'Makanan',
      option: item.option || null
    }))
    
    const subtotal = getSubtotal()
    const serviceCharge = getServiceCharge()
    const tax = getTax()
    const grandTotal = getGrandTotal()
    
    const orderData = { 
      order_number: orderNumber, 
      items, 
      subtotal, 
      service_charge: serviceCharge, 
      tax, 
      total: grandTotal, 
      payment_status: 'unpaid', 
      status: 'pending'
    }
    
    if (orderType === 'take_away') {
      orderData.order_type = 'take_away'
      orderData.customer_name = customerName || 'Take Away'
      orderData.customer_phone = customerPhone || ''
      orderData.table_number = 0
    } else if (orderType === 'dine_in' && tableNumber) {
      orderData.order_type = 'dine_in'
      orderData.customer_name = customerName || 'Walk-in'
      orderData.table_number = parseInt(tableNumber)
    }
    
    const { error } = await supabase.from('customer_orders').insert([orderData])
    if (error) {
      toast.error('Ralat: ' + error.message)
    } else {
      toast.success(`✅ Pesanan ${orderNumber} dihantar!`)
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setTableNumber('')
      loadCustomerOrders()
      loadUnpaidOrders()
    }
  }

  // ============================================================
  // UPDATE ORDER STATUS
  // ============================================================
  const updateOrderStatus = async (orderId, status) => {
    if (status === 'accepted') {
      // 🔔 PLAY SOUND BILA ORDER DITERIMA
      playSound()
      
      if (kitchenEnabled) {
        await supabase.from('customer_orders').update({ status: 'preparing' }).eq('id', orderId)
        setCustomerOrders(prev => prev.filter(order => order.id !== orderId))
        toast.success('✅ ' + t('start_cooking'))
      } else {
        await supabase.from('customer_orders').update({ status: 'ready' }).eq('id', orderId)
        setCustomerOrders(prev => prev.filter(order => order.id !== orderId))
        toast.success('✅ Pesanan sedia!')
      }
      loadUnpaidOrders()
      loadCustomerOrders()
    } else if (status === 'cancelled') {
      await supabase.from('customer_orders').update({ status: 'cancelled', payment_status: 'cancelled' }).eq('id', orderId)
      setCustomerOrders(prev => prev.filter(order => order.id !== orderId))
      toast.error('❌ ' + t('cancel'))
      loadCustomerOrders()
    }
  }

  // ============================================================
  // PAYMENT FUNCTIONS
  // ============================================================
  const openPaymentModal = (order) => {
    setSelectedOrder(order)
    setShowPaymentModal(true)
  }

  const markAsPaid = async (order) => {
    const subtotal = parseFloat(order.subtotal || order.total || 0)
    const serviceCharge = order.order_type === 'take_away' ? 0 : subtotal * (serviceChargePercent / 100)
    const tax = subtotal * (taxPercent / 100)
    const grandTotal = subtotal + serviceCharge + tax
    
    await supabase.from('customer_orders').update({ 
      payment_status: 'paid', 
      payment_method: paymentMethod, 
      paid_at: new Date().toISOString(), 
      subtotal, 
      service_charge: serviceCharge, 
      tax, 
      grand_total: grandTotal 
    }).eq('id', order.id)
    
    await loadUnpaidOrders()
    await loadOrderHistory()
    setShowPaymentModal(false)
    setCurrentReceiptOrder({ 
      ...order, 
      payment_method: paymentMethod, 
      paid_at: new Date().toISOString(), 
      subtotal, 
      service_charge: serviceCharge, 
      tax, 
      grand_total: grandTotal 
    })
    setShowReceipt(true)
    setSelectedOrder(null)
    toast.success(`✅ ${t('payment_received')} RM ${grandTotal.toFixed(2)}!`)
  }

  // ============================================================
  // PRINT RECEIPT
  // ============================================================
  const printReceipt = (order) => {
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
            <h1>${order.customer_name || t('guest')}</h1>
            <div class="sub">${order.order_type === 'take_away' ? '🥡 ' + t('take_away') : '🍽️ ' + t('table') + ' ' + (order.table_number || '')}</div>
            <div class="sub">${new Date(order.created_at).toLocaleString()}</div>
          </div>
          <table class="items">
            <thead><tr><th>${t('receipt_item')}</th><th>${t('receipt_qty')}</th><th>${t('receipt_price')}</th></tr></thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.name}${item.option ? ` (${item.option})` : ''}</td>
                  <td style="text-align:center">${item.quantity}</td>
                  <td style="text-align:right">RM ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
          <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:bold;padding:4px 0;">
            <span>${t('receipt_total')}</span>
            <span style="color:#22c55e">RM ${order.total.toFixed(2)}</span>
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
  // FORMAT TIME
  // ============================================================
  const formatMalaysiaTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // ============================================================
  // TEST SOUND
  // ============================================================
  const testSound = () => {
    console.log('🧪 Test sound button clicked!')
    initSound()
    unlockAudio()
    setTimeout(() => {
      playSound()
      toast.success('🔊 ' + t('sound_test') + '...')
    }, 200)
  }

  // ============================================================
  // RENDER FUNCTIONS
  // ============================================================
  const renderOrderItems = (items) => {
    return items.map((item, idx) => (
      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx !== items.length - 1 ? `1px solid ${borderColor}` : 'none' }}>
        <span style={{ color: textColor }}>{item.name} x{item.quantity}</span>
        <span style={{ color: priceColor, fontWeight: 'bold' }}>RM {(item.price * item.quantity).toFixed(2)}</span>
      </div>
    ))
  }

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <Sidebar>
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', background: bgColor, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="spinner"></div>
        </div>
      </Sidebar>
    )
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  const filteredMenu = getFilteredMenu()
  const categoriesList = getCategories()
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalCart = getGrandTotal()

  return (
    <Sidebar>
      <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '1400px', margin: '0 auto', background: bgColor, minHeight: '100vh' }}>
        
        {/* ===== TOP BAR ===== */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ background: kitchenEnabled ? '#22c55e' : '#ef4444', color: 'white', padding: '6px 16px', borderRadius: '40px', fontSize: '12px', fontWeight: 'bold' }}>
              🍳 {t('kitchen')}: {kitchenEnabled ? 'ON' : 'OFF'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* TEST SOUND BUTTON */}
            <button 
              onClick={testSound}
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
                color: 'white', 
                padding: '8px 20px', 
                border: 'none', 
                borderRadius: '40px', 
                cursor: 'pointer', 
                fontSize: '13px', 
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
              }}
            >
              🔊 {t('sound_test')}
            </button>
            
            <button 
              onClick={async () => { 
                await loadAllData(); 
                await loadCustomerOrders(); 
                await loadUnpaidOrders(); 
                await loadOrderHistory(); 
                toast.success('🔄 Data refreshed!') 
              }} 
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '40px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
            >
              🔄 {t('refresh')}
            </button>
          </div>
        </div>

        {/* ===== SETTINGS BAR ===== */}
        <div style={{ ...glassEffect, borderRadius: '24px', padding: '12px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
          <span style={{ color: textColor }}>⚙️ {t('service_charge')}: {serviceChargePercent}% {orderType === 'take_away' && `(${t('take_away')} - Tiada)`}</span>
          <span style={{ color: textColor }}>🏷️ {t('tax')}: {taxPercent}%</span>
          <span style={{ color: textColor, fontWeight: 'bold' }}>💰 {t('unpaid')}: {unpaidOrders.length}</span>
        </div>

        {/* ===== ORDER TYPE SELECTION ===== */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', background: cardBg, borderRadius: '60px', padding: '6px', ...glassEffect }}>
          <button 
            onClick={() => { setOrderType('dine_in'); setCustomerName(''); setCustomerPhone(''); setTableNumber(''); }} 
            style={{ flex: 1, padding: '12px 20px', background: orderType === 'dine_in' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent', color: orderType === 'dine_in' ? 'white' : textColor, border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            🍽️ {t('dine_in')}
          </button>
          <button 
            onClick={() => { setOrderType('take_away'); setCustomerName(''); setCustomerPhone(''); setTableNumber(''); }} 
            style={{ flex: 1, padding: '12px 20px', background: orderType === 'take_away' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent', color: orderType === 'take_away' ? 'white' : textColor, border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            🥡 {t('take_away')}
          </button>
        </div>

        {/* ===== ORDER DETAILS INPUT ===== */}
        <div style={{ ...glassEffect, borderRadius: '24px', padding: '20px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {orderType === 'dine_in' && (
            <>
              <input type="number" placeholder={t('table_number')} value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} style={{ padding: '14px 16px', borderRadius: '16px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, flex: 1, minWidth: '140px', outline: 'none', fontSize: '14px' }} />
              <input type="text" placeholder={t('customer_name')} value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ padding: '14px 16px', borderRadius: '16px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, flex: 2, outline: 'none', fontSize: '14px' }} />
            </>
          )}
          {orderType === 'take_away' && (
            <>
              <input type="text" placeholder={t('customer_name')} value={customerName} onChange={(e) => setCustomerName(e.target.value)} style={{ padding: '14px 16px', borderRadius: '16px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, flex: 1, outline: 'none', fontSize: '14px' }} />
              <input type="tel" placeholder={t('customer_phone')} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} style={{ padding: '14px 16px', borderRadius: '16px', border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, flex: 1, outline: 'none', fontSize: '14px' }} />
            </>
          )}
        </div>

        {/* ===== TABS ===== */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: darkMode ? 'rgba(30, 30, 46, 0.5)' : 'rgba(0,0,0,0.03)', borderRadius: '60px', padding: '4px', overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'pos', icon: '🧾', label: t('pos'), badge: 0 },
            { id: 'orders', icon: '🆕', label: t('new_order'), badge: customerOrders.length },
            { id: 'unpaid', icon: '💰', label: t('unpaid'), badge: unpaidOrders.length },
            { id: 'history', icon: '📜', label: t('history'), badge: 0 }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'orders') loadCustomerOrders(); if (tab.id === 'unpaid') loadUnpaidOrders(); if (tab.id === 'history') loadOrderHistory(); }} 
              style={{ 
                flex: 1, padding: isMobile ? '10px 12px' : '12px 20px', 
                background: activeTab === tab.id ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent', 
                color: activeTab === tab.id ? 'white' : textColor, 
                border: 'none', borderRadius: '50px', cursor: 'pointer', 
                fontWeight: activeTab === tab.id ? 'bold' : '500', 
                fontSize: isMobile ? '13px' : '14px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge > 0 && <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#ef4444', color: 'white', borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontWeight: 'bold' }}>{tab.badge}</span>}
            </button>
          ))}
        </div>

        {/* ===== NEW ORDERS ALERT BANNER ===== */}
        {customerOrders.length > 0 && activeTab !== 'orders' && (
          <div onClick={() => setActiveTab('orders')} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '16px 24px', borderRadius: '28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: '0 8px 20px rgba(239,68,68,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>🔔</span>
              <div><strong style={{ fontSize: '16px' }}>{customerOrders.length} {t('new_orders')}!</strong><br /><small style={{ fontSize: '11px', opacity: 0.9 }}>Klik untuk lihat dan proses</small></div>
            </div>
            <div style={{ background: 'white', color: '#dc2626', padding: '4px 14px', borderRadius: '40px', fontWeight: 'bold', fontSize: '18px' }}>{customerOrders.length}</div>
          </div>
        )}

        {/* ============================================================ */}
        {/* POS TAB */}
        {/* ============================================================ */}
        {activeTab === 'pos' && (
          <>
            <h1 style={{ color: textColor, fontSize: isMobile ? '22px' : '26px', marginBottom: '20px', fontWeight: 'bold' }}>
              🧾 {t('pos')} {orderType === 'take_away' ? `(${t('take_away')})` : `(${t('dine_in')})`}
            </h1>
            
            {/* Categories */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {categoriesList.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  style={{ 
                    padding: isMobile ? '8px 18px' : '10px 24px', 
                    background: selectedCategory === cat ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent', 
                    color: selectedCategory === cat ? 'white' : textColor, 
                    border: `1px solid ${borderColor}`, 
                    borderRadius: '50px', 
                    cursor: 'pointer', 
                    fontWeight: selectedCategory === cat ? 'bold' : '500', 
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                >
                  {cat === 'Semua' ? '🍽️ Semua' : `${getCategoryIcon(cat)} ${cat}`}
                </button>
              ))}
            </div>
            
            {/* Menu + Cart */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
              {/* Menu Grid */}
              <div style={{ flex: 2 }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(150px, 1fr))' : 'repeat(auto-fill, minmax(170px, 1fr))', gap: '20px' }}>
                  {filteredMenu.map(item => {
                    const hasDrinkOpts = getDrinkOptionsForItem(item).length > 0
                    const hasImage = item.image_url && item.image_url.trim() !== ''
                    const isAdding = addingItemId === item.id
                    const drinkOpts = getDrinkOptionsForItem(item)
                    
                    return (
                      <div 
                        key={item.id} 
                        style={{ background: cardBg, borderRadius: '24px', padding: '18px', border: `1px solid ${borderColor}`, transition: 'transform 0.25s, box-shadow 0.25s', textAlign: 'center', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 32px rgba(0,0,0,0.12)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        {hasImage ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name} 
                            style={{ 
                              width: '90px', 
                              height: '90px', 
                              objectFit: 'contain',
                              borderRadius: '18px', 
                              margin: '0 auto 12px auto', 
                              display: 'block', 
                              backgroundColor: '#ffffff',
                              padding: '6px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                            }} 
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        ) : (
                          <div style={{ width: '70px', height: '70px', background: secondaryBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '36px' }}>
                            {getDefaultIcon(item.category)}
                          </div>
                        )}
                        <h3 style={{ fontSize: '15px', margin: '8px 0', color: textColor, fontWeight: 'bold' }}>{item.name}</h3>
                        
                        {hasDrinkOpts ? (
                          <div style={{ fontSize: '12px', marginBottom: '12px' }}>
                            {drinkOpts.map(opt => (
                              <span key={opt.id} style={{ margin: '0 4px', color: opt.option_type === 'Panas' ? '#f97316' : '#06b6d4' }}>
                                {opt.option_type === 'Panas' ? '🔥' : '🧊'} RM {opt.price}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: priceColor, fontSize: '18px', fontWeight: 'bold', margin: '8px 0' }}>RM {item.price}</p>
                        )}
                        
                        <button 
                          onClick={() => addToCart(item)} 
                          style={{ 
                            background: isAdding ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                            color: 'white', 
                            padding: '10px 0', 
                            border: 'none', 
                            borderRadius: '60px', 
                            cursor: 'pointer', 
                            width: '100%', 
                            fontSize: '13px', 
                            fontWeight: 'bold' 
                          }}
                        >
                          {isAdding ? '✓ Ditambah!' : `+ ${t('add')}`}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Cart - Sticky */}
              <div style={{ 
                flex: 1, 
                ...glassEffect, 
                borderRadius: '28px', 
                padding: '20px', 
                position: 'sticky', 
                top: '20px', 
                alignSelf: 'flex-start', 
                maxHeight: 'calc(100vh - 40px)', 
                overflowY: 'auto' 
              }}>
                <h2 style={{ color: textColor, fontSize: '20px', marginBottom: '20px', fontWeight: 'bold' }}>🛒 {t('cart')}</h2>
                {cart.length === 0 ? (
                  <p style={{ color: textMuted, textAlign: 'center', padding: '40px 20px' }}>{t('cart_empty_msg')}</p>
                ) : (
                  <>
                    <div style={{ marginBottom: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                      {cart.map(item => (
                        <div key={item.id} style={{ borderBottom: `1px solid ${borderColor}`, marginBottom: '12px', paddingBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ color: textColor, fontWeight: '500', fontSize: '14px' }}>{item.name}</span>
                              <div style={{ fontSize: '12px', color: textMuted }}>x{item.quantity}</div>
                              {item.option && <div style={{ fontSize: '10px', color: textMuted }}>☕ {item.option}</div>}
                            </div>
                            <span style={{ color: priceColor, fontWeight: 'bold', fontSize: '14px' }}>RM {(item.price * item.quantity).toFixed(2)}</span>
                            <button 
                              onClick={() => removeFromCart(item.id)} 
                              style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '30px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <hr style={{ borderColor: borderColor, margin: '16px 0' }} />
                    <div style={{ fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: textColor }}>{t('subtotal')}:</span>
                        <span style={{ color: textColor }}>RM {getSubtotal().toFixed(2)}</span>
                      </div>
                      {orderType !== 'take_away' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: textColor }}>{t('service_charge')} ({serviceChargePercent}%):</span>
                          <span style={{ color: textColor }}>RM {getServiceCharge().toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: textColor }}>{t('tax')} ({taxPercent}%):</span>
                        <span style={{ color: textColor }}>RM {getTax().toFixed(2)}</span>
                      </div>
                    </div>
                    <hr style={{ borderColor: borderColor, margin: '16px 0' }} />
                    <h3 style={{ textAlign: 'right', color: priceColor, fontSize: '22px', marginBottom: '20px', fontWeight: 'bold' }}>
                      {t('total')}: RM {getGrandTotal().toFixed(2)}
                    </h3>
                    <button 
                      onClick={saveOrder} 
                      style={{ 
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                        color: 'white', 
                        padding: '14px', 
                        width: '100%', 
                        border: 'none', 
                        borderRadius: '60px', 
                        cursor: 'pointer', 
                        fontWeight: 'bold', 
                        fontSize: '15px' 
                      }}
                    >
                      💾 {t('place_order')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* ORDERS TAB */}
        {/* ============================================================ */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ color: textColor, marginBottom: '24px', fontSize: '20px', fontWeight: 'bold', borderLeft: '4px solid #ef4444', paddingLeft: '14px' }}>
              🆕 {t('new_order')}
            </h2>
            {customerOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', ...glassEffect, borderRadius: '28px' }}>
                <span style={{ fontSize: '64px', opacity: 0.5 }}>📭</span>
                <p style={{ color: textMuted, marginTop: '16px' }}>{t('no_new_orders')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {customerOrders.map(order => (
                  <div key={order.id} style={{ ...glassEffect, borderRadius: '28px', padding: '24px', borderLeft: `4px solid #ef4444` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{order.order_type === 'take_away' ? '🥡' : '🍽️'}</span>
                        <h3 style={{ margin: 0, fontSize: '16px', color: textColor, fontWeight: 'bold' }}>
                          {order.order_type === 'take_away' ? t('take_away') : `${t('table')} ${order.table_number}`}
                        </h3>
                        <span style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '40px', fontSize: '10px', fontWeight: 'bold' }}>
                          {t('pending')}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: textMuted }}>🕐 {formatMalaysiaTime(order.created_at)}</div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontWeight: 'bold', color: textColor }}>{t('customer_name')}:</span>
                      <span style={{ color: textColor, marginLeft: '8px' }}>{order.customer_name || 'Walk-in'}</span>
                      {order.customer_phone && <span style={{ marginLeft: '12px', fontSize: '12px', color: textMuted }}>📞 {order.customer_phone}</span>}
                    </div>
                    <div style={{ background: secondaryBg, borderRadius: '20px', padding: '16px', margin: '16px 0' }}>
                      {renderOrderItems(order.items)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${borderColor}`, flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '14px', color: textMuted }}>{t('total')}:</span>
                        <span style={{ fontSize: '22px', fontWeight: 'bold', color: priceColor, marginLeft: '8px' }}>RM {order.total}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'accepted')} 
                          style={{ 
                            background: kitchenEnabled ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #06b6d4, #0891b2)', 
                            color: 'white', 
                            padding: '10px 24px', 
                            border: 'none', 
                            borderRadius: '40px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold' 
                          }}
                        >
                          {kitchenEnabled ? `✅ ${t('accept')} & ${t('start_cooking')}` : `✅ ${t('accept')} (${t('ready')})`}
                        </button>
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'cancelled')} 
                          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          ❌ {t('cancel')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* UNPAID TAB */}
        {/* ============================================================ */}
        {activeTab === 'unpaid' && (
          <div>
            <h2 style={{ color: textColor, marginBottom: '24px', fontSize: '20px', fontWeight: 'bold', borderLeft: '4px solid #eab308', paddingLeft: '14px' }}>
              💰 {t('unpaid')}
            </h2>
            {unpaidOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', ...glassEffect, borderRadius: '28px' }}>
                <span style={{ fontSize: '64px', opacity: 0.5 }}>✅</span>
                <p style={{ color: textMuted, marginTop: '16px' }}>{t('no_data')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {unpaidOrders.map(order => {
                  const subtotal = order.subtotal || order.total || 0
                  const sc = order.service_charge || (subtotal * (serviceChargePercent / 100))
                  const tax = order.tax || (subtotal * (taxPercent / 100))
                  const grandTotal = order.grand_total || (subtotal + sc + tax)
                  return (
                    <div key={order.id} style={{ ...glassEffect, borderRadius: '28px', padding: '24px', borderLeft: `4px solid #eab308` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '24px' }}>{order.order_type === 'take_away' ? '🥡' : '🍽️'}</span>
                          <span style={{ fontWeight: 'bold', color: textColor }}>{order.order_number || `ORD-${order.id}`}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ color: textColor }}>{order.order_type === 'take_away' ? t('take_away') : `${t('table')} ${order.table_number}`}</span>
                          <span style={{ background: order.status === 'ready' ? '#22c55e' : order.status === 'preparing' ? '#eab308' : '#6c757d', color: order.status === 'preparing' ? '#333' : 'white', padding: '2px 12px', borderRadius: '40px', fontSize: '10px', fontWeight: 'bold' }}>
                            {order.status === 'ready' ? t('ready') : order.status === 'preparing' ? t('preparing') : t('pending')}
                          </span>
                        </div>
                      </div>
                      <p><strong style={{ color: textColor }}>{order.customer_name || 'Walk-in'}</strong></p>
                      <div style={{ background: secondaryBg, borderRadius: '20px', padding: '16px', margin: '16px 0' }}>
                        {renderOrderItems(order.items)}
                      </div>
                      <div style={{ background: secondaryBg, padding: '16px', borderRadius: '20px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span>{t('subtotal')}:</span>
                          <span>RM {subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span>{t('service_charge')} ({serviceChargePercent}%):</span>
                          <span>RM {sc.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                          <span>{t('tax')} ({taxPercent}%):</span>
                          <span>RM {tax.toFixed(2)}</span>
                        </div>
                        <div style={{ borderTop: `1px solid ${borderColor}`, marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                          <span>{t('total')}:</span>
                          <span style={{ color: priceColor }}>RM {grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => openPaymentModal(order)} 
                        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: 'bold', marginTop: '16px', width: '100%' }}
                      >
                        💰 {t('record_payment')}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* HISTORY TAB */}
        {/* ============================================================ */}
        {activeTab === 'history' && (
          <div>
            <h2 style={{ color: textColor, marginBottom: '24px', fontSize: '20px', fontWeight: 'bold', borderLeft: '4px solid #6c757d', paddingLeft: '14px' }}>
              📜 {t('history')}
            </h2>
            {orderHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', ...glassEffect, borderRadius: '28px' }}>
                <span style={{ fontSize: '64px', opacity: 0.5 }}>📜</span>
                <p style={{ color: textMuted, marginTop: '16px' }}>{t('no_data')}</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto', ...glassEffect, borderRadius: '24px', padding: '4px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: darkMode ? 'rgba(30,30,46,0.8)' : '#f1f5f9' }}>
                        <th style={{ padding: '14px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('id')}</th>
                        <th style={{ padding: '14px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('customer_name')}</th>
                        <th style={{ padding: '14px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('order_type')}</th>
                        <th style={{ padding: '14px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('total')}</th>
                        <th style={{ padding: '14px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('payment_method_label')}</th>
                        <th style={{ padding: '14px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('date')}</th>
                        <th style={{ padding: '14px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.slice((historyPage - 1) * historyItemsPerPage, historyPage * historyItemsPerPage).map(order => (
                        <tr key={order.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <td style={{ padding: '12px', color: textColor, fontSize: '13px' }}>{order.order_number || `ORD-${order.id}`}</td>
                          <td style={{ padding: '12px', color: textColor, fontSize: '13px' }}>{order.customer_name || 'Walk-in'}</td>
                          <td style={{ padding: '12px', color: textColor, fontSize: '13px' }}>{order.order_type === 'take_away' ? '🥡 Take Away' : `🍽️ ${t('table')} ${order.table_number}`}</td>
                          <td style={{ padding: '12px', color: priceColor, fontWeight: 'bold', fontSize: '13px' }}>RM {order.grand_total || order.total}</td>
                          <td style={{ padding: '12px', color: textColor, fontSize: '13px' }}>{order.payment_method === 'cash' ? '💵 Tunai' : order.payment_method === 'tng' ? '📱 TnG' : '🏦 Bank'}</td>
                          <td style={{ padding: '12px', color: textColor, fontSize: '13px' }}>{formatMalaysiaTime(order.created_at)}</td>
                          <td style={{ padding: '12px' }}>
                            <button 
                              onClick={() => printReceipt(order)} 
                              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', padding: '6px 16px', border: 'none', borderRadius: '40px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                            >
                              🧾 {t('btn_receipt')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {Math.ceil(orderHistory.length / historyItemsPerPage) > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
                    <button onClick={() => setHistoryPage(1)} disabled={historyPage === 1} style={{ padding: '8px 14px', background: historyPage === 1 ? secondaryBg : '#2563eb', color: historyPage === 1 ? textMuted : 'white', border: 'none', borderRadius: '40px', cursor: historyPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}>« {t('first')}</button>
                    <button onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))} disabled={historyPage === 1} style={{ padding: '8px 14px', background: historyPage === 1 ? secondaryBg : '#2563eb', color: historyPage === 1 ? textMuted : 'white', border: 'none', borderRadius: '40px', cursor: historyPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}>‹ {t('prev')}</button>
                    <span style={{ padding: '8px 16px', background: cardBg, borderRadius: '40px', color: textColor, fontSize: '13px', border: `1px solid ${borderColor}` }}>{historyPage} / {Math.ceil(orderHistory.length / historyItemsPerPage)}</span>
                    <button onClick={() => setHistoryPage(prev => Math.min(Math.ceil(orderHistory.length / historyItemsPerPage), prev + 1))} disabled={historyPage === Math.ceil(orderHistory.length / historyItemsPerPage)} style={{ padding: '8px 14px', background: historyPage === Math.ceil(orderHistory.length / historyItemsPerPage) ? secondaryBg : '#2563eb', color: historyPage === Math.ceil(orderHistory.length / historyItemsPerPage) ? textMuted : 'white', border: 'none', borderRadius: '40px', cursor: historyPage === Math.ceil(orderHistory.length / historyItemsPerPage) ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}>{t('next')} ›</button>
                    <button onClick={() => setHistoryPage(Math.ceil(orderHistory.length / historyItemsPerPage))} disabled={historyPage === Math.ceil(orderHistory.length / historyItemsPerPage)} style={{ padding: '8px 14px', background: historyPage === Math.ceil(orderHistory.length / historyItemsPerPage) ? secondaryBg : '#2563eb', color: historyPage === Math.ceil(orderHistory.length / historyItemsPerPage) ? textMuted : 'white', border: 'none', borderRadius: '40px', cursor: historyPage === Math.ceil(orderHistory.length / historyItemsPerPage) ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}>{t('last')} »</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* DRINK OPTIONS MODAL */}
        {/* ============================================================ */}
        {showDrinkModal && selectedDrinkItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
            <div style={{ background: cardBg, borderRadius: '32px', padding: '32px', maxWidth: '380px', width: '90%', textAlign: 'center', ...glassEffect }}>
              {selectedDrinkItem.image_url ? (
                <img 
                  src={selectedDrinkItem.image_url} 
                  alt={selectedDrinkItem.name} 
                  style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '16px', margin: '0 auto 12px auto', display: 'block', backgroundColor: '#ffffff', padding: '6px' }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥤</div>
              )}
              <h2 style={{ marginBottom: '12px', color: textColor, fontSize: '24px' }}>{selectedDrinkItem.name}</h2>
              <p style={{ color: textMuted, marginBottom: '28px' }}>{t('select_drink')}</p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
                {getDrinkOptionsForItem(selectedDrinkItem).map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setSelectedDrinkOption(opt.option_type)}
                    style={{ 
                      flex: 1, 
                      padding: '18px', 
                      background: selectedDrinkOption === opt.option_type 
                        ? (opt.option_type === 'Panas' ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #06b6d4, #0891b2)')
                        : darkMode ? '#2a2a3e' : '#f1f5f9', 
                      color: selectedDrinkOption === opt.option_type ? 'white' : textColor, 
                      border: `1px solid ${borderColor}`, 
                      borderRadius: '20px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold' 
                    }}
                  >
                    {opt.option_type === 'Panas' ? '🔥' : '🧊'} {opt.option_type === 'Panas' ? t('hot') : t('cold')}
                    <br /><small>RM {opt.price}</small>
                  </button>
                ))}
              </div>
              <button 
                onClick={addDrinkToCart} 
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', borderRadius: '60px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '12px' }}
              >
                ➕ {t('add_to_cart')}
              </button>
              <button 
                onClick={() => { setShowDrinkModal(false); setSelectedDrinkItem(null) }} 
                style={{ width: '100%', padding: '16px', background: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0', color: textColor, border: 'none', borderRadius: '60px', cursor: 'pointer' }}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PAYMENT MODAL */}
        {/* ============================================================ */}
        {showPaymentModal && selectedOrder && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
            <div style={{ background: cardBg, padding: '28px', borderRadius: '32px', maxWidth: '420px', width: '90%', ...glassEffect }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                  <span style={{ fontSize: '28px' }}>💰</span>
                </div>
                <h2 style={{ margin: 0, color: textColor, fontSize: '22px', fontWeight: 'bold' }}>{t('record_payment')}</h2>
                <p style={{ color: textMuted, fontSize: '13px', marginTop: '4px' }}>{language === 'bm' ? 'Sila pilih kaedah bayaran' : 'Please select payment method'}</p>
              </div>

              <div style={{ background: secondaryBg, padding: '16px', borderRadius: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: textMuted }}>No. Pesanan:</span>
                  <span style={{ color: textColor, fontWeight: 'bold' }}>{selectedOrder.order_number || `ORD-${selectedOrder.id}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: textMuted }}>{t('table_number')}:</span>
                  <span style={{ color: textColor, fontWeight: 'bold' }}>{selectedOrder.table_number || 'Take Away'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: textMuted }}>{t('customer_name')}:</span>
                  <span style={{ color: textColor, fontWeight: 'bold' }}>{selectedOrder.customer_name || 'Walk-in'}</span>
                </div>
              </div>

              {(() => {
                const subtotal = selectedOrder.subtotal || selectedOrder.total || 0
                const sc = selectedOrder.service_charge || (subtotal * (serviceChargePercent / 100))
                const tax = selectedOrder.tax || (subtotal * (taxPercent / 100))
                const grandTotal = selectedOrder.grand_total || (subtotal + sc + tax)
                return (
                  <div style={{ background: secondaryBg, padding: '16px', borderRadius: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>{t('subtotal')}:</span>
                      <span>RM {subtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>{t('service_charge')} ({serviceChargePercent}%):</span>
                      <span>RM {sc.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>{t('tax')} ({taxPercent}%):</span>
                      <span>RM {tax.toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: `1px solid ${borderColor}`, marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                      <span>{t('total')}:</span>
                      <span style={{ color: priceColor }}>RM {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: textColor, fontSize: '14px' }}>💳 {t('payment_method')}</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button onClick={() => setPaymentMethod('cash')} style={{ flex: 1, padding: '12px', background: paymentMethod === 'cash' ? '#22c55e' : secondaryBg, color: paymentMethod === 'cash' ? 'white' : textColor, border: paymentMethod === 'cash' ? 'none' : `1px solid ${borderColor}`, borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>💵 {t('cash')}</button>
                  <button onClick={() => setPaymentMethod('tng')} style={{ flex: 1, padding: '12px', background: paymentMethod === 'tng' ? '#06b6d4' : secondaryBg, color: paymentMethod === 'tng' ? 'white' : textColor, border: paymentMethod === 'tng' ? 'none' : `1px solid ${borderColor}`, borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>📱 {t('tng')}</button>
                  <button onClick={() => setPaymentMethod('bank')} style={{ flex: 1, padding: '12px', background: paymentMethod === 'bank' ? '#8b5cf6' : secondaryBg, color: paymentMethod === 'bank' ? 'white' : textColor, border: paymentMethod === 'bank' ? 'none' : `1px solid ${borderColor}`, borderRadius: '16px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>🏦 {t('bank')}</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => markAsPaid(selectedOrder)} style={{ flex: 1, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', padding: '14px', border: 'none', borderRadius: '60px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>✅ {t('save')}</button>
                <button onClick={() => { setShowPaymentModal(false); setSelectedOrder(null); }} style={{ flex: 1, background: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0', color: textColor, padding: '14px', border: 'none', borderRadius: '60px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>❌ {t('cancel')}</button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* RECEIPT MODAL */}
        {/* ============================================================ */}
        {showReceipt && currentReceiptOrder && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
            <div style={{ background: cardBg, borderRadius: '32px', padding: '32px', maxWidth: '420px', width: '90%', ...glassEffect }}>
              <div style={{ textAlign: 'center', borderBottom: `1px solid ${borderColor}`, paddingBottom: '16px', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, color: textColor }}>🧾 {t('receipt_title')}</h2>
                <p style={{ color: textMuted, fontSize: '12px' }}>{currentReceiptOrder.customer_name || t('guest')}</p>
                <p style={{ color: textMuted, fontSize: '11px' }}>
                  {currentReceiptOrder.order_type === 'take_away' ? '🥡 ' + t('take_away') : '🍽️ ' + t('table') + ' ' + (currentReceiptOrder.table_number || '')}
                </p>
                <p style={{ color: textMuted, fontSize: '11px' }}>
                  {new Date(currentReceiptOrder.paid_at || currentReceiptOrder.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                {currentReceiptOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: idx !== currentReceiptOrder.items.length - 1 ? `1px solid ${borderColor}` : 'none' }}>
                    <span style={{ color: textColor }}>{item.name}{item.option ? ` (${item.option})` : ''} x{item.quantity}</span>
                    <span style={{ color: priceColor, fontWeight: 'bold' }}>RM {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
                  <span>{t('total')}:</span>
                  <span style={{ color: priceColor }}>RM {currentReceiptOrder.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div style={{ fontSize: '12px', color: textMuted, textAlign: 'center', marginTop: '12px' }}>
                  💳 {currentReceiptOrder.payment_method === 'cash' ? t('cash') : currentReceiptOrder.payment_method === 'tng' ? t('tng') : t('bank')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => printReceipt(currentReceiptOrder)} style={{ flex: 1, padding: '12px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ {t('print_receipt')}</button>
                <button onClick={() => { setShowReceipt(false); setCurrentReceiptOrder(null) }} style={{ flex: 1, padding: '12px', background: '#64748b', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: 'bold' }}>{t('close')}</button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STYLES */}
        {/* ============================================================ */}
        <style>
          {`
            .spinner {
              width: 40px;
              height: 40px;
              border: 3px solid rgba(59,130,246,0.15);
              border-top-color: #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes popIn {
              0% { opacity: 0; transform: scale(0.95); }
              100% { opacity: 1; transform: scale(1); }
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
            
            input, button {
              transition: all 0.2s ease;
            }
            
            input:focus {
              outline: none;
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
            }
            
            button:hover:not(:disabled) {
              opacity: 0.9;
              transform: scale(0.97);
            }
            
            button:active:not(:disabled) {
              transform: scale(0.93);
            }
          `}
        </style>
      </div>
    </Sidebar>
  )
}

export default StaffApp