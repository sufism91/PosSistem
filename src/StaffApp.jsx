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
      order_confirmed_staff: { en: 'Order confirmed! Waiting for kitchen.', ms: 'Pesanan disahkan! Menunggu dapur.' },
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

  // ===== SOUND TRACKING =====
  const [notifiedOrderIds, setNotifiedOrderIds] = useState(new Set())

  // ===== MOBILE CART =====
  const [showMobileCart, setShowMobileCart] = useState(false)

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

    return () => {
      menuSub.unsubscribe()
      drinkSub.unsubscribe()
      orderSub.unsubscribe()
    }
  }, [])

  // ============================================================
  // INTERVAL CHECKING FOR SOUND
  // ============================================================
  useEffect(() => {
    const checkOrders = async () => {
      try {
        const { data } = await supabase
          .from('customer_orders')
          .select('id, status')
          .in('status', ['pending', 'new'])
        
        const currentIds = data?.map(o => o.id) || []
        const existingIds = notifiedOrderIds
        const newIds = currentIds.filter(id => !existingIds.has(id))
        
        if (newIds.length > 0) {
          console.log(`🔔 Staff: ${newIds.length} new order(s)!`)
          playSound()
          
          setNotifiedOrderIds(prev => {
            const newSet = new Set(prev)
            currentIds.forEach(id => newSet.add(id))
            return newSet
          })
        }
        
        if (currentIds.length > 0) {
          console.log(`🔔 Staff: ${currentIds.length} order(s) pending, reminder sound...`)
          playSound()
        }
        
      } catch (err) {
        console.error('Staff interval error:', err)
      }
    }
    
    checkOrders()
    const interval = setInterval(checkOrders, 5000)
    
    return () => clearInterval(interval)
  }, [notifiedOrderIds])

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

  // ============================================================
  // LOAD CUSTOMER ORDERS - Support 'new' and 'pending'
  // ============================================================
  async function loadCustomerOrders() {
    console.log('📊 loadCustomerOrders called')
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .in('status', ['pending', 'new'])
        .order('created_at', { ascending: false })
      
      console.log(`📊 Found ${data?.length || 0} pending/new orders`)
      setCustomerOrders(data || [])
      
      // 🔔 CHECK FOR NEW ORDERS (yang belum notified)
      if (data && data.length > 0) {
        const newOrderIds = data.map(o => o.id)
        const existingIds = notifiedOrderIds
        const newIds = newOrderIds.filter(id => !existingIds.has(id))
        
        if (newIds.length > 0) {
          console.log(`🔔 ${newIds.length} new order(s) detected! Playing sound...`)
          playSound()
          
          setNotifiedOrderIds(prev => {
            const newSet = new Set(prev)
            newOrderIds.forEach(id => newSet.add(id))
            return newSet
          })
          
          toast.success(`🔔 ${newIds.length} new order(s)!`)
        }
      }
      
    } catch (err) {
      console.error('Error loading customer orders:', err)
      setCustomerOrders([])
    }
  }

  // ============================================================
  // LOAD UNPAID ORDERS - Support 'new', 'pending', 'confirmed'
  // ============================================================
  async function loadUnpaidOrders() {
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', 'unpaid')
        .in('status', ['new', 'pending', 'confirmed', 'ready', 'preparing'])
        .order('created_at', { ascending: false })
      setUnpaidOrders(data || [])
    } catch (err) {
      console.error('Error loading unpaid orders:', err)
      setUnpaidOrders([])
    }
  }

  // ============================================================
  // LOAD ORDER HISTORY
  // ============================================================
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
  // UPDATE ORDER STATUS - FIXED: Accept -> 'confirmed'
  // ============================================================
  const updateOrderStatus = async (orderId, status) => {
    if (status === 'accepted') {
      // 🔔 PLAY SOUND BILA ORDER DITERIMA
      playSound()
      
      // Remove from notified set
      setNotifiedOrderIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
      
      // ===== FIX: Tukar status ke 'confirmed', BUKAN 'preparing' =====
      await supabase.from('customer_orders').update({ 
        status: 'confirmed', 
        order_status: 'confirmed',
        confirmed_at: new Date().toISOString()
      }).eq('id', orderId)
      
      setCustomerOrders(prev => prev.filter(order => order.id !== orderId))
      
      // ===== PENTING: Tunjuk mesej yang betul =====
      toast.success('✅ Pesanan diterima! Menunggu dapur mula masak.')
      
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
  // RENDER FUNCTIONS
  // ============================================================
  const renderPOS = () => {
    const filteredMenu = getFilteredMenu()
    const categoryList = getCategories()

    return (
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px' }}>
        {/* ===== MENU PANEL ===== */}
        <div style={{ flex: 2, minWidth: 0 }}>
          {/* Category tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '6px', 
            flexWrap: 'nowrap',
            overflowX: 'auto',
            padding: '4px 0 12px 0',
            scrollbarWidth: 'thin'
          }}>
            {categoryList.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: isMobile ? '6px 12px' : '8px 18px',
                  background: selectedCategory === cat ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                  color: selectedCategory === cat ? 'white' : textColor,
                  border: selectedCategory === cat ? 'none' : `1px solid ${borderColor}`,
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontWeight: selectedCategory === cat ? 'bold' : '500',
                  fontSize: isMobile ? '11px' : '13px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {getCategoryIcon(cat)} {cat}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: isMobile ? '10px' : '14px'
          }}>
            {filteredMenu.length === 0 ? (
              <div style={{ 
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px 20px',
                color: textMuted
              }}>
                🍽️ {t('no_data')}
              </div>
            ) : (
              filteredMenu.map(item => {
                const isAdding = addingItemId === item.id
                const hasDrinkOpts = getDrinkOptionsForItem(item).length > 0
                const isDrink = isDrinkCategory(item.category)
                const hasImage = item.image_url && item.image_url.trim() !== ''
                
                return (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item)}
                    style={{
                      ...glassEffect,
                      borderRadius: '16px',
                      padding: isMobile ? '10px' : '14px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: isAdding ? `2px solid ${priceColor}` : `1px solid ${borderColor}`
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {hasImage ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{
                          width: isMobile ? '50px' : '70px',
                          height: isMobile ? '50px' : '70px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          margin: '0 auto 8px auto'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = `
                            <span style="font-size:${isMobile ? '32px' : '44px'}">${getDefaultIcon(item.category)}</span>
                          `
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: isMobile ? '32px' : '44px', display: 'block', marginBottom: '6px' }}>
                        {getDefaultIcon(item.category)}
                      </span>
                    )}
                    <div style={{ fontWeight: 'bold', fontSize: isMobile ? '12px' : '13px', color: textColor }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: isMobile ? '11px' : '12px', color: priceColor, fontWeight: 'bold' }}>
                      RM {item.price?.toFixed(2) || '0.00'}
                    </div>
                    {hasDrinkOpts && (
                      <div style={{ fontSize: '9px', color: textMuted, marginTop: '2px' }}>
                        🧊 {t('select_drink')}
                      </div>
                    )}
                    <div style={{
                      marginTop: '6px',
                      padding: '4px',
                      background: isAdding ? priceColor : '#3b82f6',
                      color: 'white',
                      borderRadius: '30px',
                      fontSize: isMobile ? '9px' : '10px',
                      fontWeight: 'bold'
                    }}>
                      {isAdding ? '✅' : '+'}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ===== CART PANEL ===== */}
        <div style={{
          flex: 1,
          minWidth: isMobile ? '100%' : '300px',
          ...glassEffect,
          borderRadius: '20px',
          padding: isMobile ? '14px' : '18px',
          maxHeight: isMobile ? 'auto' : 'calc(100vh - 200px)',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, color: textColor, fontSize: isMobile ? '16px' : '18px' }}>
              🛒 {t('cart')} ({cart.length})
            </h3>
            <button
              onClick={clearCart}
              style={{
                background: 'transparent',
                color: '#ef4444',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '12px' : '13px'
              }}
            >
              🗑️
            </button>
          </div>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: textMuted, padding: '20px 0' }}>
              🛒 {t('empty_cart')}
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: `1px solid ${borderColor}`
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: isMobile ? '12px' : '13px', color: textColor }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11px', color: textMuted }}>
                      x{item.quantity} × RM {item.price.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div style={{
                marginTop: '14px',
                paddingTop: '14px',
                borderTop: `1px solid ${borderColor}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor }}>
                  <span>{t('subtotal')}</span>
                  <span>RM {getSubtotal().toFixed(2)}</span>
                </div>
                {orderType !== 'take_away' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor }}>
                    <span>{t('service_charge')} ({serviceChargePercent}%)</span>
                    <span>RM {getServiceCharge().toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor }}>
                  <span>{t('tax')} ({taxPercent}%)</span>
                  <span>RM {getTax().toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: 'bold',
                  color: textColor,
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: `1px solid ${borderColor}`
                }}>
                  <span>{t('total')}</span>
                  <span style={{ color: priceColor }}>RM {getGrandTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Order details */}
              <div style={{ marginTop: '12px' }}>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    background: inputBg,
                    color: textColor,
                    marginBottom: '8px',
                    fontSize: isMobile ? '12px' : '13px'
                  }}
                >
                  <option value="dine_in">🍽️ {t('dine_in')}</option>
                  <option value="take_away">🥡 {t('take_away')}</option>
                </select>

                {orderType === 'dine_in' ? (
                  <input
                    type="number"
                    placeholder={t('table_number')}
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '12px',
                      border: `1px solid ${borderColor}`,
                      background: inputBg,
                      color: textColor,
                      marginBottom: '8px',
                      fontSize: isMobile ? '12px' : '13px'
                    }}
                  />
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder={t('customer_name')}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '12px',
                        border: `1px solid ${borderColor}`,
                        background: inputBg,
                        color: textColor,
                        marginBottom: '8px',
                        fontSize: isMobile ? '12px' : '13px'
                      }}
                    />
                    <input
                      type="tel"
                      placeholder={t('customer_phone')}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '12px',
                        border: `1px solid ${borderColor}`,
                        background: inputBg,
                        color: textColor,
                        marginBottom: '8px',
                        fontSize: isMobile ? '12px' : '13px'
                      }}
                    />
                  </>
                )}

                <button
                  onClick={saveOrder}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '14px' : '15px',
                    cursor: 'pointer'
                  }}
                >
                  💳 {t('place_order')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const renderCustomerOrders = () => {
    return (
      <div>
        {customerOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            ...glassEffect,
            borderRadius: '20px',
            color: textMuted
          }}>
            📭 {t('no_new_orders')}
          </div>
        ) : (
          customerOrders.map(order => (
            <div key={order.id} style={{
              ...glassEffect,
              borderRadius: '20px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '12px',
              borderLeft: `5px solid ${order.status === 'pending' ? '#eab308' : '#3b82f6'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px', color: textColor }}>
                    {order.order_type === 'take_away' ? '🥡 ' + t('take_away') : '🍽️ ' + t('table') + ' ' + (order.table_number || '')}
                  </span>
                  <span style={{ marginLeft: '12px', fontSize: '12px', color: textMuted }}>
                    #{order.order_number}
                  </span>
                  {order.customer_name && (
                    <div style={{ fontSize: '13px', color: textColor, marginTop: '4px' }}>
                      👤 {order.customer_name}
                    </div>
                  )}
                  {order.customer_phone && (
                    <div style={{ fontSize: '12px', color: textMuted }}>
                      📞 {order.customer_phone}
                    </div>
                  )}
                  {order.notes && (
                    <div style={{
                      fontSize: '12px',
                      color: '#f59e0b',
                      marginTop: '4px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}>
                      📝 {order.notes}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: order.status === 'pending' ? '#fef3c7' : '#dbeafe',
                    color: order.status === 'pending' ? '#b45309' : '#1e40af',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {order.status === 'pending' ? '⏳ ' + t('pending') : '🆕 ' + t('new_order')}
                  </span>
                </div>
              </div>

              <div style={{ margin: '10px 0', borderTop: `1px solid ${borderColor}`, paddingTop: '10px' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: textColor }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span style={{ color: priceColor }}>RM {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: priceColor }}>
                    RM {order.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'accepted')}
                    style={{
                      padding: '8px 20px',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '40px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '11px' : '12px'
                    }}
                  >
                    ✅ {t('accept')}
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '40px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '11px' : '12px'
                    }}
                  >
                    ❌ {t('cancel')}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  const renderUnpaid = () => {
    return (
      <div>
        {unpaidOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            ...glassEffect,
            borderRadius: '20px',
            color: textMuted
          }}>
            💰 {t('no_unpaid_orders_msg')}
          </div>
        ) : (
          unpaidOrders.map(order => (
            <div key={order.id} style={{
              ...glassEffect,
              borderRadius: '20px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '12px',
              borderLeft: `5px solid ${order.status === 'ready' ? '#22c55e' : '#f59e0b'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? '14px' : '16px', color: textColor }}>
                    {order.order_type === 'take_away' ? '🥡 ' + t('take_away') : '🍽️ ' + t('table') + ' ' + (order.table_number || '')}
                  </span>
                  <span style={{ marginLeft: '12px', fontSize: '12px', color: textMuted }}>
                    #{order.order_number}
                  </span>
                  {order.customer_name && (
                    <div style={{ fontSize: '13px', color: textColor, marginTop: '4px' }}>
                      👤 {order.customer_name}
                    </div>
                  )}
                  {order.customer_phone && (
                    <div style={{ fontSize: '12px', color: textMuted }}>
                      📞 {order.customer_phone}
                    </div>
                  )}
                  {order.notes && (
                    <div style={{
                      fontSize: '12px',
                      color: '#f59e0b',
                      marginTop: '4px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}>
                      📝 {order.notes}
                    </div>
                  )}
                </div>
                <div>
                  <span style={{
                    background: order.status === 'ready' ? '#dcfce7' : '#fef3c7',
                    color: order.status === 'ready' ? '#166534' : '#b45309',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {order.status === 'ready' ? '✅ ' + t('ready') : '🔪 ' + t('preparing')}
                  </span>
                </div>
              </div>

              <div style={{ margin: '10px 0', borderTop: `1px solid ${borderColor}`, paddingTop: '10px' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: textColor }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span style={{ color: priceColor }}>RM {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: priceColor }}>
                    RM {order.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <button
                  onClick={() => openPaymentModal(order)}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '40px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '12px' : '13px'
                  }}
                >
                  💰 {t('record_payment')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  const renderHistory = () => {
    const startIndex = (historyPage - 1) * historyItemsPerPage
    const endIndex = startIndex + historyItemsPerPage
    const paginatedHistory = orderHistory.slice(startIndex, endIndex)
    const totalPages = Math.ceil(orderHistory.length / historyItemsPerPage)

    return (
      <div>
        {orderHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            ...glassEffect,
            borderRadius: '20px',
            color: textMuted
          }}>
            📜 {t('no_history_orders')}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${borderColor}` }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: textMuted, fontSize: '13px' }}>#</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: textMuted, fontSize: '13px' }}>{t('customer_name')}</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: textMuted, fontSize: '13px' }}>{t('order_type')}</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: textMuted, fontSize: '13px' }}>{t('total')}</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: textMuted, fontSize: '13px' }}>{t('payment_method_label')}</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: textMuted, fontSize: '13px' }}>{t('date')}</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: textMuted, fontSize: '13px' }}>{t('action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((order, idx) => (
                    <tr key={order.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                      <td style={{ padding: '10px', color: textColor, fontSize: '13px' }}>
                        {startIndex + idx + 1}
                      </td>
                      <td style={{ padding: '10px', color: textColor, fontSize: '13px' }}>
                        {order.customer_name || t('guest')}
                      </td>
                      <td style={{ padding: '10px', color: textColor, fontSize: '13px' }}>
                        {order.order_type === 'take_away' ? '🥡' : '🍽️'}
                      </td>
                      <td style={{ padding: '10px', color: priceColor, fontSize: '13px', fontWeight: 'bold' }}>
                        RM {order.total?.toFixed(2) || '0.00'}
                      </td>
                      <td style={{ padding: '10px', color: textColor, fontSize: '13px' }}>
                        {order.payment_method === 'cash' ? '💵' :
                         order.payment_method === 'tng' ? '📱' : '🏦'}
                        {order.payment_method || '-'}
                      </td>
                      <td style={{ padding: '10px', color: textMuted, fontSize: '12px' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button
                          onClick={() => {
                            setCurrentReceiptOrder(order)
                            setShowReceipt(true)
                          }}
                          style={{
                            padding: '4px 12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          🧾
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '20px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setHistoryPage(1)}
                  disabled={historyPage === 1}
                  style={{
                    padding: '6px 14px',
                    background: historyPage === 1 ? '#94a3b8' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: historyPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {t('first')}
                </button>
                <button
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  style={{
                    padding: '6px 14px',
                    background: historyPage === 1 ? '#94a3b8' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: historyPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {t('prev')}
                </button>
                <span style={{ padding: '6px 14px', color: textColor, fontSize: '13px' }}>
                  {historyPage} / {totalPages}
                </span>
                <button
                  onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                  disabled={historyPage === totalPages}
                  style={{
                    padding: '6px 14px',
                    background: historyPage === totalPages ? '#94a3b8' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: historyPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {t('next')}
                </button>
                <button
                  onClick={() => setHistoryPage(totalPages)}
                  disabled={historyPage === totalPages}
                  style={{
                    padding: '6px 14px',
                    background: historyPage === totalPages ? '#94a3b8' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: historyPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {t('last')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <Sidebar>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: bgColor
        }}>
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
      <div style={{
        padding: isMobile ? '12px' : '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        background: bgColor,
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h1 style={{ color: textColor, margin: 0, fontSize: isMobile ? '20px' : '28px' }}>
              {t('pos_title')}
            </h1>
            <p style={{ color: textMuted, marginTop: '4px', fontSize: isMobile ? '12px' : '14px' }}>
              {t('pos_subtitle')}
            </p>
          </div>
          <button
            onClick={() => {
              loadCustomerOrders()
              loadUnpaidOrders()
              loadOrderHistory()
              toast.success('🔄 Refreshed!')
            }}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '40px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: isMobile ? '12px' : '13px'
            }}
          >
            🔄 {t('refresh')}
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '20px',
          background: secondaryBg,
          padding: '6px',
          borderRadius: '48px',
          overflowX: 'auto',
          flexWrap: 'nowrap'
        }}>
          {[
            { id: 'pos', label: t('pos'), icon: '🧾' },
            { id: 'orders', label: t('new_order'), icon: '🆕', count: customerOrders.length },
            { id: 'unpaid', label: t('unpaid'), icon: '💰', count: unpaidOrders.length },
            { id: 'history', label: t('history'), icon: '📜' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: isMobile ? '8px 12px' : '10px 20px',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                color: activeTab === tab.id ? 'white' : textColor,
                border: 'none',
                borderRadius: '40px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 'bold' : '500',
                fontSize: isMobile ? '11px' : '13px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : '#3b82f6',
                  color: 'white',
                  borderRadius: '30px',
                  padding: '0 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginLeft: '4px'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'pos' && renderPOS()}
        {activeTab === 'orders' && renderCustomerOrders()}
        {activeTab === 'unpaid' && renderUnpaid()}
        {activeTab === 'history' && renderHistory()}

        {/* ========================================================== */}
        {/* DRINK OPTIONS MODAL */}
        {/* ========================================================== */}
        {showDrinkModal && selectedDrinkItem && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}>
            <div style={{
              ...glassEffect,
              borderRadius: '24px',
              padding: isMobile ? '20px' : '28px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}>
              <h3 style={{ color: textColor, marginBottom: '8px' }}>
                🥤 {selectedDrinkItem.name}
              </h3>
              <p style={{ color: textMuted, fontSize: '13px', marginBottom: '16px' }}>
                {t('select_drink_option')}
              </p>

              {getDrinkOptionsForItem(selectedDrinkItem).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedDrinkOption(opt.option_type)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '8px',
                    background: selectedDrinkOption === opt.option_type ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : secondaryBg,
                    color: selectedDrinkOption === opt.option_type ? 'white' : textColor,
                    border: selectedDrinkOption === opt.option_type ? 'none' : `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '13px' : '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{opt.option_type === 'Panas' ? '☕' : '🧊'} {opt.option_type}</span>
                  <span style={{ color: priceColor }}>RM {opt.price.toFixed(2)}</span>
                </button>
              ))}

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={addDrinkToCart}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                >
                  {t('add_to_cart')}
                </button>
                <button
                  onClick={() => {
                    setShowDrinkModal(false)
                    setSelectedDrinkItem(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                >
                  {t('back')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* PAYMENT MODAL */}
        {/* ========================================================== */}
        {showPaymentModal && selectedOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}>
            <div style={{
              ...glassEffect,
              borderRadius: '24px',
              padding: isMobile ? '20px' : '28px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}>
              <h3 style={{ color: textColor, marginBottom: '8px' }}>
                💰 {t('record_payment')}
              </h3>
              <p style={{ color: textMuted, fontSize: '13px', marginBottom: '16px' }}>
                {selectedOrder.customer_name || t('guest')} • 
                {selectedOrder.order_type === 'take_away' ? ' 🥡' : ' 🍽️'}
              </p>

              <div style={{ fontSize: '24px', fontWeight: 'bold', color: priceColor, marginBottom: '16px' }}>
                RM {selectedOrder.total?.toFixed(2) || '0.00'}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: textColor, marginBottom: '8px' }}>
                  {t('payment_method')}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['cash', 'tng', 'bank'].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: paymentMethod === method ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : secondaryBg,
                        color: paymentMethod === method ? 'white' : textColor,
                        border: paymentMethod === method ? 'none' : `1px solid ${borderColor}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '11px' : '12px'
                      }}
                    >
                      {method === 'cash' ? '💵' : method === 'tng' ? '📱' : '🏦'}
                      {method === 'cash' ? t('cash') : method === 'tng' ? t('tng') : t('bank')}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => markAsPaid(selectedOrder)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                >
                  ✅ {t('save')}
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedOrder(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* RECEIPT MODAL */}
        {/* ========================================================== */}
        {showReceipt && currentReceiptOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}>
            <div style={{
              ...glassEffect,
              borderRadius: '24px',
              padding: isMobile ? '20px' : '28px',
              maxWidth: '420px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{ color: textColor, margin: 0, fontSize: isMobile ? '18px' : '22px' }}>
                  🧾 {t('receipt_title')}
                </h2>
                <p style={{ color: textMuted, fontSize: '13px' }}>
                  {currentReceiptOrder.order_number}
                </p>
              </div>

              <div style={{ borderTop: `1px dashed ${borderColor}`, paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor }}>
                  <span>{t('customer_name')}</span>
                  <span>{currentReceiptOrder.customer_name || t('guest')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor }}>
                  <span>{t('order_type')}</span>
                  <span>{currentReceiptOrder.order_type === 'take_away' ? '🥡 ' + t('take_away') : '🍽️ ' + t('table') + ' ' + (currentReceiptOrder.table_number || '')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor }}>
                  <span>{t('date')}</span>
                  <span>{new Date(currentReceiptOrder.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ borderTop: `1px dashed ${borderColor}`, margin: '12px 0', paddingTop: '12px' }}>
                {currentReceiptOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', color: textColor }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>RM {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px dashed ${borderColor}`, paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor }}>
                  <span>{t('subtotal')}</span>
                  <span>RM {(currentReceiptOrder.subtotal || currentReceiptOrder.total || 0).toFixed(2)}</span>
                </div>
                {currentReceiptOrder.order_type !== 'take_away' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor }}>
                    <span>{t('service_charge')}</span>
                    <span>RM {(currentReceiptOrder.service_charge || 0).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor }}>
                  <span>{t('tax')}</span>
                  <span>RM {(currentReceiptOrder.tax || 0).toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: 'bold',
                  color: priceColor,
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: `1px solid ${borderColor}`
                }}>
                  <span>{t('total')}</span>
                  <span>RM {(currentReceiptOrder.grand_total || currentReceiptOrder.total || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: textColor, marginTop: '4px' }}>
                  <span>{t('payment_method_label')}</span>
                  <span>
                    {currentReceiptOrder.payment_method === 'cash' ? '💵 ' :
                     currentReceiptOrder.payment_method === 'tng' ? '📱 ' : '🏦 '}
                    {currentReceiptOrder.payment_method || '-'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => printReceipt(currentReceiptOrder)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                >
                  🖨️ {t('print_receipt')}
                </button>
                <button
                  onClick={() => {
                    setShowReceipt(false)
                    setCurrentReceiptOrder(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '13px' : '14px'
                  }}
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* STYLES */}
        {/* ========================================================== */}
        <style>
          {`
            .spinner {
              width: 48px;
              height: 48px;
              border: 4px solid rgba(59,130,246,0.2);
              border-top-color: #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-track { background: ${darkMode ? '#2a2a3e' : '#e2e8f0'}; border-radius: 10px; }
            ::-webkit-scrollbar-thumb { background: ${darkMode ? '#555' : '#94a3b8'}; border-radius: 10px; }
            button { transition: all 0.2s ease; }
            button:hover { opacity: 0.85; transform: scale(0.98); }
          `}
        </style>
      </div>
    </Sidebar>
  )
}

export default StaffApp