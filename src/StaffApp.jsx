import { useState, useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabase'
import toast from 'react-hot-toast'
import { playSound, initSound, unlockAudio } from './utils/sound'
import { ORDER_STATUS, PAYMENT_STATUS, normalizeOrderForInsert, normalizeConfirmedUpdate } from './lib/orderWorkflow'

function StaffApp() {
  const { darkMode } = useTheme()
  const { language } = useLanguage()
  
  // ============================================================
  // TRANSLATIONS
  // ============================================================
  const translations = {
    pos_title: { en: 'Point of Sale', ms: 'Tempat Jualan' },
    pos_subtitle: { en: 'Take orders and manage payments', ms: 'Ambil pesanan dan urus pembayaran' },
    new_cart: { en: '🔄 New Cart', ms: 'Keranjang Baru' },
    new_orders_title: { en: '🆕 New Orders', ms: 'Pesanan Baru' },
    unpaid_orders: { en: '💰 Unpaid', ms: 'Belum Bayar' },
    history_orders: { en: '📜 History', ms: 'Sejarah' },
    clear_cart: { en: '🗑️ Clear Cart', ms: 'Kosongkan Keranjang' },
    send_order: { en: '📤 Send Order', ms: 'Hantar Pesanan' },
    mark_paid: { en: '💰 Mark as Paid', ms: 'Tanda Bayar' },
    confirm_order: { en: '✅ Confirm', ms: 'Sahkan' },
    cancel: { en: '❌ Cancel', ms: 'Batal' },
    print_receipt: { en: '🖨️ Print', ms: 'Cetak' },
    preview_receipt: { en: '🧾 Preview', ms: 'Preview' },
    back: { en: 'Back', ms: 'Kembali' },
    view_order: { en: 'View', ms: 'Lihat' },
    search_menu: { en: '🔍 Search menu...', ms: 'Cari menu...' },
    all_categories: { en: '📋 All', ms: 'Semua' },
    customer_name: { en: 'Customer', ms: 'Pelanggan' },
    customer_phone: { en: 'Phone', ms: 'Telefon' },
    table_number: { en: 'Table', ms: 'Meja' },
    dine_in: { en: 'Dine In', ms: 'Makan di Sini' },
    take_away: { en: 'Take Away', ms: 'Bungkus' },
    add_order: { en: 'Add', ms: 'Tambah' },
    total: { en: 'Total', ms: 'Jumlah' },
    items: { en: 'items', ms: 'item' },
    guest: { en: 'Guest', ms: 'Tetamu' },
    free: { en: 'FREE', ms: 'PERCUMA' },
    promo: { en: 'Promo', ms: 'Promosi' },
    hot: { en: 'Hot', ms: 'Panas' },
    cold: { en: 'Cold', ms: 'Sejuk' },
    packed: { en: 'Packed', ms: 'Bungkus' },
    table: { en: 'Table', ms: 'Meja' },
    quantity: { en: 'Qty', ms: 'Kuantiti' },
    notes: { en: 'Notes', ms: 'Nota' },
    select_option: { en: 'Select Option', ms: 'Pilih Pilihan' },
    no_new_orders: { en: '📭 No new orders', ms: 'Tiada pesanan baru' },
    no_unpaid_orders: { en: '📭 No unpaid orders', ms: 'Tiada pesanan belum bayar' },
    no_history_orders: { en: '📭 No history', ms: 'Tiada sejarah' },
    order_added: { en: 'Added!', ms: 'Ditambah!' },
    cart_empty: { en: 'Cart is empty', ms: 'Keranjang kosong' },
    order_cancelled: { en: 'Cancelled', ms: 'Dibatalkan' },
    order_confirmed_kitchen: { en: 'Order confirmed!', ms: 'Pesanan disahkan!' },
    order_paid_history: { en: 'Paid!', ms: 'Dibayar!' },
    error_checkout: { en: 'Error', ms: 'Ralat' },
    new_order_started: { en: 'New cart started', ms: 'Keranjang baru dimulakan' },
    order_sent: { en: 'Order sent!', ms: 'Pesanan dihantar!' },
    please_select_item: { en: 'Select an item', ms: 'Pilih item' },
    please_select_option: { en: 'Select an option', ms: 'Pilih pilihan' },
    confirm_clear_cart: { en: 'Clear cart?', ms: 'Kosongkan keranjang?' },
    receipt_title: { en: 'RECEIPT', ms: 'RESIT' },
    receipt_thankyou: { en: 'Thank you!', ms: 'Terima kasih!' },
    receipt_item: { en: 'Item', ms: 'Item' },
    receipt_qty: { en: 'Qty', ms: 'Kuantiti' },
    receipt_price: { en: 'Price', ms: 'Harga' },
    receipt_total: { en: 'TOTAL', ms: 'JUMLAH' },
    select_drink: { en: 'Select temperature', ms: 'Pilih suhu' },
    cash: { en: 'Cash', ms: 'Tunai' },
    tng: { en: 'TnG', ms: 'TnG' },
    bank: { en: 'Bank', ms: 'Bank' },
    payment_method: { en: 'Payment Method', ms: 'Kaedah Bayaran' },
    download_receipt: { en: 'Download', ms: 'Muat Turun' },
    print_all: { en: 'Print All', ms: 'Cetak Semua' },
    new_order_notification: { en: 'New order received!', ms: 'Pesanan baru diterima!' },
    sound_test: { en: '🔊 Test Sound', ms: 'Uji Bunyi' },
    service_charge: { en: 'Service Charge', ms: 'Caj Perkhidmatan' },
    tax: { en: 'Tax', ms: 'Cukai' },
    subtotal: { en: 'Subtotal', ms: 'Subtotal' },
    record_payment: { en: 'Record Payment', ms: 'Rekod Bayaran' },
    payment_received: { en: 'Payment received', ms: 'Bayaran diterima' },
    refresh: { en: 'Refresh', ms: 'Segar' },
    kitchen: { en: 'Kitchen', ms: 'Dapur' },
    preview: { en: 'Preview', ms: 'Preview' },
    close: { en: 'Close', ms: 'Tutup' },
    save: { en: 'Save', ms: 'Simpan' },
  }

  const t = (key) => {
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
  const [cart, setCart] = useState([])
  const [unpaidOrders, setUnpaidOrders] = useState([])
  const [newOrders, setNewOrders] = useState([])
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
  const [isMobile, setIsMobile] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOptions, setMenuOptions] = useState([])
  const [showUnpaidOrders, setShowUnpaidOrders] = useState(false)
  const [showNewOrders, setShowNewOrders] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [viewingOrder, setViewingOrder] = useState(null)
  const [historyPage, setHistoryPage] = useState(1)
  const historyItemsPerPage = 10
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [showCartPopup, setShowCartPopup] = useState(false)

  // ===== NOTIFICATION STATE =====
  const [notifiedOrderIds, setNotifiedOrderIds] = useState(new Set())

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
  // CHECK MOBILE
  // ============================================================
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
  const secondaryBg = darkMode ? 'rgba(30,30,50,0.6)' : 'rgba(248,250,252,0.8)'
  const inputBg = darkMode ? '#1a1a2e' : '#ffffff'
  const inputBorder = darkMode ? '#3d3d5c' : '#cbd5e1'

  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${borderColor}`,
    boxShadow: darkMode 
      ? '0 8px 40px rgba(0,0,0,0.5)' 
      : '0 8px 40px rgba(0,0,0,0.06)'
  }

  // ============================================================
  // PLAY NOTIFICATION SOUND - FIXED
  // ============================================================
  const playNotificationSound = () => {
    console.log('🔔 playNotificationSound called')
    
    if (!settings.notification_sound) {
      console.log('🔇 Sound disabled in settings')
      return
    }
    
    console.log('🔊 Playing notification sound...')
    playSound()
  }

  // ============================================================
  // TEST SOUND
  // ============================================================
  const testSound = () => {
    console.log('🧪 Test sound button clicked!')
    initSound()
    unlockAudio()
    playNotificationSound()
    toast('🔊 ' + t('sound_test') + '...')
  }

  // ============================================================
  // LOAD SETTINGS
  // ============================================================
  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')

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
      console.log('✅ Settings loaded:', settingsObj)
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  // ============================================================
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    loadAllData()
    loadUnpaidOrders()
    loadNewOrders()
    loadOrderHistory()
    loadSettings()

    const menuSub = supabase
      .channel('staff_menu')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'menu' },
        () => { loadMenu() }
      )
      .subscribe()

    const drinkSub = supabase
      .channel('staff_drink')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drink_options' },
        () => { loadDrinkOptions() }
      )
      .subscribe()

    const orderSub = supabase
      .channel('staff_orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customer_orders' },
        () => { 
          loadUnpaidOrders()
          loadNewOrders()
          loadOrderHistory()
        }
      )
      .subscribe()

    return () => {
      menuSub.unsubscribe()
      drinkSub.unsubscribe()
      orderSub.unsubscribe()
    }
  }, [])

  // ============================================================
  // NOTIFICATION - CHECK NEW ORDERS (FIXED)
  // ============================================================
  useEffect(() => {
    loadNewOrders()
    
    const interval = setInterval(async () => {
      try {
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

        console.log('📋 Pending orders from DB:', pending.length)

        if (pending.length > 0) {
          console.log('🔔 NEW ORDER DETECTED! Playing sound...')
          playNotificationSound()
          setNewOrders(pending)
          
          toast(`🔔 ${pending.length} ${t('new_order_notification')}`, {
            duration: 3000,
            icon: '🔔'
          })
        } else {
          setNewOrders([])
        }
        
      } catch (err) {
        console.error('Error checking orders:', err)
      }
      
    }, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  // ============================================================
  // REALTIME SUBSCRIPTION - UNTUK SOUND SEGERA
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

    return () => {
      orderSub.unsubscribe()
    }
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
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')
      console.log('📂 Categories loaded:', data)
      setCategories(data || [])
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  async function loadMenu() {
    try {
      const { data } = await supabase
        .from('menu')
        .select('*')
        .order('sort_order')
      setMenu(data || [])
    } catch (err) {
      console.error('Error loading menu:', err)
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

  async function loadUnpaidOrders() {
    try {
      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', PAYMENT_STATUS.UNPAID)
        .order('created_at', { ascending: false })

      if (error) throw error

      const confirmed = (data || []).filter(order => {
        const workflowStatus = order.order_status || order.status
        return [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, 'preparing', 'ready', 'served'].includes(workflowStatus) ||
          [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.READY, 'preparing', 'ready', 'served'].includes(order.status)
      })
      setUnpaidOrders(confirmed)
    } catch (err) {
      console.error('Error loading unpaid orders:', err)
      setUnpaidOrders([])
    }
  }

  // ============================================================
  // LOAD NEW ORDERS - Support pending_confirmation
  // ============================================================
  async function loadNewOrders() {
    try {
      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', PAYMENT_STATUS.UNPAID)
        .order('created_at', { ascending: false })

      if (error) throw error

      const pending = (data || []).filter(order => {
        const workflowStatus = order.order_status || order.status
        return ['pending', 'pending_confirmation', 'new'].includes(workflowStatus) ||
               ['pending', 'pending_confirmation', 'new'].includes(order.status) ||
               workflowStatus === ORDER_STATUS.NEW
      })
      setNewOrders(pending)
    } catch (err) {
      console.error('Error loading new orders:', err)
      setNewOrders([])
    }
  }

  async function loadOrderHistory() {
    try {
      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', PAYMENT_STATUS.PAID)
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error
      setOrderHistory(data || [])
      setHistoryPage(1)
    } catch (err) {
      console.error('Error loading order history:', err)
      setOrderHistory([])
    }
  }

  async function loadMenuOptions(menuId) {
    try {
      const { data } = await supabase
        .from('menu_options')
        .select('*')
        .eq('menu_id', menuId)
        .order('sort_order')
      setMenuOptions(data || [])
    } catch (err) {
      console.error('Error loading menu options:', err)
      setMenuOptions([])
    }
  }

  // ============================================================
  // PROMOTION HELPERS
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

  function isItemInBOGO(item) {
    const promo = getItemPromotion(item)
    return promo?.type === 'bogo'
  }

  function getBOGOFreeItem(item) {
    const promo = getItemPromotion(item)
    if (promo?.type === 'bogo') {
      return promo.free
    }
    return null
  }

  // ============================================================
  // GET ITEM PRICE
  // ============================================================
  function getItemPrice(item, option, size) {
    let basePrice = item?.price || 0

    if (option && item) {
      const drinkOpt = drinkOptions.find(d => 
        d.drink_name === item.name && 
        d.option_type === option
      )
      if (drinkOpt && drinkOpt.price !== undefined && drinkOpt.price !== null) {
        basePrice = parseFloat(drinkOpt.price)
        return parseFloat(basePrice) || 0
      }
    }

    const promoPrice = getPromoPrice(item)
    if (promoPrice !== null && promoPrice !== undefined) {
      basePrice = promoPrice
    }

    if (size && size.price_adjustment !== undefined && size.price_adjustment !== null) {
      if (size.is_absolute_price) {
        basePrice = parseFloat(size.price_adjustment)
      } else {
        basePrice += parseFloat(size.price_adjustment)
      }
    }

    return parseFloat(basePrice) || 0
  }

  // ============================================================
  // DRINK OPTIONS HELPERS
  // ============================================================
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
    if (option === 'Panas') return t('hot')
    if (option === 'Sejuk') return t('cold')
    if (option === 'Bungkus') return t('packed')
    return option
  }

  function getOptionEmoji(option) {
    if (option === 'Panas') return '🔥'
    if (option === 'Sejuk') return '🧊'
    if (option === 'Bungkus') return '📦'
    return '☕'
  }

  // ============================================================
  // HELPERS - Parent/Sub Categories
  // ============================================================
  const getCategories = () => {
    return ['All', ...categories.map(c => c.name)]
  }

  const getFilteredMenu = () => {
    let filtered = [...menu]
    
    if (selectedCategory !== 'All') {
      const selectedCat = categories.find(c => c.name === selectedCategory)
      
      if (selectedCat) {
        const isParent = selectedCat.parent_id === null || selectedCat.parent_id === undefined
        
        if (isParent) {
          const subCategoryNames = categories
            .filter(c => c.parent_id === selectedCat.id)
            .map(c => c.name)
          const allRelatedCategories = [selectedCategory, ...subCategoryNames]
          filtered = filtered.filter(item => allRelatedCategories.includes(item.category))
        } else {
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
    return filtered
  }

  const getCategoryIcon = (cat) => {
    if (!cat) return '📂'
    if (cat === 'All' || cat === 'Semua') return '📋'
    
    const found = categories.find(c => c.name === cat)
    if (found?.icon) return found.icon
    
    const icons = {
      'Makanan': '🍚',
      'Minuman': '🥤',
      'SUP': '🍜',
      'Jus': '🧃',
      'Teh': '🍵',
      'Kopi': '☕',
      'Mee': '🍜',
      'Nasi': '🍚',
      'Telur': '🥚'
    }
    return icons[cat] || '📂'
  }

  const isDrinkCategory = (category) => {
    const drinkCategories = ['Minuman', 'Jus', 'Teh', 'Kopi', 'Air', 'Milo', 'Nescafe', 'Teh Tarik']
    return drinkCategories.some(cat => category?.includes(cat))
  }

  const isSizeCategory = (item) => {
    return item?.has_options === true
  }

  // ============================================================
  // CART FUNCTIONS
  // ============================================================
  const addToCart = () => {
    if (!selectedItem) {
      toast.error(t('please_select_item'))
      return
    }

    if (isDrinkCategory(selectedItem.category)) {
      const availableOptions = getDrinkOptionsForItem(selectedItem)
      if (availableOptions.length > 0 && !selectedOption) {
        toast.error(t('please_select_option'))
        return
      }
    }

    if (isSizeCategory(selectedItem) && !selectedSize) {
      toast.error(t('select_size'))
      return
    }

    const price = getItemPrice(selectedItem, selectedOption, selectedSize)
    const isFree = price === 0
    const promo = getItemPromotion(selectedItem)

    const cartItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      category: selectedItem.category,
      option: selectedOption || null,
      size: selectedSize?.option_name || null,
      price: price,
      originalPrice: selectedItem.price,
      quantity: quantity,
      subtotal: price * quantity,
      image_url: selectedItem.image_url,
      notes: selectedItem.notes || '',
      isFree: isFree,
      promoType: promo?.type || null,
      promoName: promo?.promo?.name || null,
      sizeData: selectedSize || null
    }

    const existingIndex = cart.findIndex(c => 
      c.id === cartItem.id && 
      c.option === cartItem.option && 
      c.size === cartItem.size
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
    setQuantity(1)
    setShowCartPopup(true)
    toast.success(isFree ? `🎁 ${selectedItem.name} FREE!` : t('order_added'))
  }

  const removeFromCart = (index) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
    if (newCart.length === 0) {
      setShowCartPopup(false)
    }
  }

  const clearCart = () => {
    if (cart.length === 0) {
      toast.error(t('cart_empty'))
      return
    }
    if (window.confirm(t('confirm_clear_cart'))) {
      setCart([])
      setShowCartPopup(false)
      toast.success(t('order_cancelled'))
    }
  }

  // ============================================================
  // SEND ORDER
  // ============================================================
  const handleSendOrder = async () => {
    if (cart.length === 0) {
      toast.error(t('cart_empty'))
      return
    }

    if (orderType === 'dine_in' && !tableNumber) {
      toast.error('⚠️ Sila masukkan nombor meja!')
      return
    }

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0)

    const orderData = {
      items: cart.map(item => ({
        name: item.name,
        category: item.category || 'Makanan',
        option: item.option || null,
        size: item.size || null,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        isFree: item.isFree || false,
        promoType: item.promoType || null,
        promoName: item.promoName || null,
        image_url: item.image_url || null
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
      const { data, error } = await supabase
        .from('customer_orders')
        .insert([normalizeOrderForInsert(orderData)])
        .select()
        .single()

      if (error) throw error

      toast.success(t('order_sent'))
      setCart([])
      setShowCartPopup(false)
      setCustomerName('')
      setCustomerPhone('')
      setTableNumber('')
      await loadNewOrders()
      await loadUnpaidOrders()

    } catch (err) {
      console.error('Send order error:', err)
      toast.error(t('error_checkout') + ': ' + err.message)
    }
  }

  // ============================================================
  // CONFIRM NEW ORDER
  // ============================================================
  const confirmNewOrder = async (order) => {
    try {
      const { error } = await supabase
        .from('customer_orders')
        .update({ 
          status: ORDER_STATUS.CONFIRMED, 
          order_status: ORDER_STATUS.CONFIRMED,
          confirmed_at: new Date().toISOString()
        })
        .eq('id', order.id)
      if (error) throw error
      
      toast.success(t('order_confirmed_kitchen'))
      await loadNewOrders()
      await loadUnpaidOrders()
    } catch (err) {
      console.error('Error confirming order:', err)
      toast.error(err.message)
    }
  }

  const cancelNewOrder = async (order) => {
    try {
      const { error } = await supabase
        .from('customer_orders')
        .update({ status: ORDER_STATUS.CANCELLED, order_status: ORDER_STATUS.CANCELLED })
        .eq('id', order.id)
      if (error) throw error
      
      toast.success(t('order_cancelled'))
      await loadNewOrders()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ============================================================
  // MARK ORDER AS PAID
  // ============================================================
  const markOrderAsPaid = async (order, method) => {
    if (!method) {
      toast.error('Sila pilih kaedah bayaran!')
      return
    }

    try {
      const { error } = await supabase
        .from('customer_orders')
        .update({ 
          payment_status: PAYMENT_STATUS.PAID,
          payment_method: method,
          paid_at: new Date().toISOString(),
          status: ORDER_STATUS.COMPLETED,
          order_status: ORDER_STATUS.COMPLETED
        })
        .eq('id', order.id)

      if (error) throw error

      const methodName = method === 'cash' ? 'Tunai' : method === 'bank' ? 'Bank' : 'Touch n Go'
      toast.success(`✅ Dibayar dengan ${methodName}!`)

      if (settings.auto_print) {
        toast('🖨️ Mencetak resit...')
        setTimeout(() => {
          printReceipt(order, method)
        }, 500)
      }

      await loadUnpaidOrders()
      await loadOrderHistory()
      setViewingOrder(null)
      setShowUnpaidOrders(false)
      setPaymentMethod('cash')

    } catch (err) {
      console.error('Error marking order as paid:', err)
      toast.error(err.message)
    }
  }

  // ============================================================
  // PRINT RECEIPT
  // ============================================================
  const printReceipt = (order, method) => {
    const paymentMethod = method || order.payment_method || 'cash'

    const receiptHTML = generateReceiptHTML(order, {
      restaurant_name: settings.restaurant_name || 'Restoran Kita',
      service_charge_percent: settings.service_charge || 6,
      tax_percent: settings.tax || 6,
      payment_method: paymentMethod,
      darkMode: darkMode
    })

    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(receiptHTML)
    printWindow.document.close()
  }

  const downloadReceipt = (order) => {
    const lines = []
    lines.push('================================')
    lines.push(t('receipt_title'))
    lines.push('================================')
    lines.push(`Order: ${order.order_number || order.id || '-'}`)
    lines.push(`Customer: ${order.customer_name || t('guest')}`)
    lines.push(`${order.order_type === 'take_away' ? '🥡 Take Away' : '🍽️ Table ' + (order.table_number || '-')}`)
    lines.push(`Payment: ${order.payment_method || '-'}`)
    lines.push(`Paid: ${order.paid_at ? new Date(order.paid_at).toLocaleString() : '-'}`)
    lines.push('--------------------------------')
    ;(order.items || []).forEach(item => {
      const optionText = item.option || item.option_type ? ` (${item.option || item.option_type})` : ''
      lines.push(`${item.quantity || 1}x ${item.name}${optionText} - RM ${Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}`)
    })
    lines.push('--------------------------------')
    lines.push(`TOTAL: RM ${Number(order.total || order.grand_total || 0).toFixed(2)}`)
    lines.push('================================')
    lines.push(t('receipt_thankyou'))

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${order.order_number || order.id || Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // ============================================================
  // GENERATE RECEIPT HTML
  // ============================================================
  const generateReceiptHTML = (order, options) => {
    const total = Number(order.total || order.grand_total || 0).toFixed(2)
    const items = order.items || []
    const date = new Date(order.created_at).toLocaleString()
    const orderType = order.order_type === 'take_away' ? '🥡 Take Away' : `🍽️ Table ${order.table_number || '-'}`
    const paymentMethod = options.payment_method || 'cash'
    const methodLabel = paymentMethod === 'cash' ? '💵 Tunai' : 
                        paymentMethod === 'tng' ? '📱 Touch n Go' : 
                        '🏦 Bank'

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('receipt_title')}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            background: ${options.darkMode ? '#0f0f1a' : '#ffffff'};
            color: ${options.darkMode ? '#e8edf5' : '#1e293b'};
            display: flex;
            justify-content: center;
          }
          .receipt {
            max-width: 340px;
            width: 100%;
            background: ${options.darkMode ? '#1a1a2e' : '#ffffff'};
            padding: 20px;
            border-radius: 12px;
            border: 1px solid ${options.darkMode ? '#2a2a3e' : '#e2e8f0'};
          }
          .header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 12px; margin-bottom: 12px; }
          .header h1 { font-size: 20px; font-weight: bold; }
          .header .sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }
          .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
          table { width: 100%; margin: 8px 0; border-collapse: collapse; }
          th { text-align: left; font-size: 11px; color: #94a3b8; border-bottom: 1px solid #ccc; padding: 4px 0; }
          td { padding: 4px 0; font-size: 12px; text-align: left; }
          td:last-child { text-align: right; }
          .total-row { font-size: 18px; font-weight: bold; color: #22c55e; }
          .footer { text-align: center; margin-top: 12px; border-top: 1px dashed #ccc; padding-top: 10px; font-size: 11px; color: #94a3b8; }
          .info-row { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; }
          .payment { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #ccc; }
          .payment .method { font-weight: bold; color: #22c55e; }
          .notes { background: #fef3c7; padding: 8px 12px; border-radius: 8px; margin-top: 8px; font-size: 11px; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>${options.restaurant_name || 'Restoran Kita'}</h1>
            <div class="sub">${t('receipt_title')}</div>
            <div class="sub">${orderType}</div>
            <div class="sub">👤 ${order.customer_name || t('guest')}</div>
            ${order.customer_phone ? `<div class="sub">📞 ${order.customer_phone}</div>` : ''}
            <div class="sub">${date}</div>
          </div>

          <table>
            <thead><tr><th>${t('receipt_item')}</th><th>${t('receipt_qty')}</th><th>${t('receipt_price')}</th></tr></thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}${item.option ? ` (${item.option})` : ''}</td>
                  <td style="text-align:center">${item.quantity || 1}</td>
                  <td>RM ${Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="divider"></div>
          <div class="info-row"><span>${t('subtotal')}</span><span>RM ${Number(order.subtotal || order.total || 0).toFixed(2)}</span></div>
          <div class="info-row"><span>${t('service_charge')} (${options.service_charge_percent || 6}%)</span><span>RM ${Number(order.service_charge || 0).toFixed(2)}</span></div>
          <div class="info-row"><span>${t('tax')} (${options.tax_percent || 6}%)</span><span>RM ${Number(order.tax || 0).toFixed(2)}</span></div>
          <div class="divider"></div>
          <div class="info-row total-row"><span>${t('receipt_total')}</span><span>RM ${total}</span></div>

          <div class="payment">
            <div class="info-row"><span>${t('payment_method_label')}</span><span class="method">${methodLabel}</span></div>
          </div>

          ${order.notes ? `<div class="notes">📝 ${t('notes')}: ${order.notes}</div>` : ''}

          <div class="footer">⭐ ⭐ ⭐ ⭐ ⭐<br>${t('receipt_thankyou')}</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }, 300);
          }
        <\/script>
      </body>
      </html>
    `
  }

  // ============================================================
  // RENDER ITEM MODAL
  // ============================================================
  const renderItemModal = () => {
    if (!selectedItem) return null

    const isDrink = isDrinkCategory(selectedItem.category)
    const hasSize = isSizeCategory(selectedItem)
    const availableDrinkOptions = getDrinkOptionsForItem(selectedItem)
    const hasAvailableOptions = availableDrinkOptions.length > 0
    const sizes = menuOptions

    return (
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
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease',
        padding: '20px'
      }}>
        <div style={{
          background: cardBg,
          padding: isMobile ? '24px' : '32px',
          borderRadius: '28px',
          maxWidth: '450px',
          width: '100%',
          ...glassEffect,
          animation: 'popIn 0.3s ease',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          {selectedItem.image_url ? (
            <img 
              src={selectedItem.image_url} 
              alt={selectedItem.name}
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'contain',
                objectPosition: 'center',
                borderRadius: '16px',
                marginBottom: '16px',
                backgroundColor: '#ffffff',
                padding: '8px'
              }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100px',
              background: secondaryBg,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              marginBottom: '16px',
              border: `1px solid ${borderColor}`
            }}>
              {isDrink ? '🥤' : '🍽️'}
            </div>
          )}

          <h2 style={{
            color: textColor,
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: 'bold',
            marginBottom: '4px'
          }}>
            {selectedItem.name}
          </h2>

          {getItemPromotion(selectedItem) && (
            <div style={{
              background: promoColor,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              {getItemPromotion(selectedItem)?.type === 'bogo' ? '🎁 BOGO' : '🔥 ' + t('promo')}
            </div>
          )}

          {selectedItem.description && (
            <p style={{
              color: textMuted,
              fontSize: isMobile ? '12px' : '14px',
              marginBottom: '16px'
            }}>
              {selectedItem.description}
            </p>
          )}

          {isDrink && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: textColor,
                fontSize: isMobile ? '12px' : '13px',
                marginBottom: '8px'
              }}>
                {t('select_option')}:
              </label>

              {hasAvailableOptions ? (
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  {availableDrinkOptions.map(opt => {
                    const price = parseFloat(opt.price) || 0
                    const isSelected = selectedOption === opt.option_type
                    const isFree = price === 0
                    const emoji = opt.option_type === 'Panas' ? '🔥' : opt.option_type === 'Sejuk' ? '🧊' : '📦'

                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOption(opt.option_type)}
                        style={{
                          flex: 1,
                          minWidth: '80px',
                          padding: isMobile ? '10px 12px' : '12px 16px',
                          background: isSelected ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : secondaryBg,
                          color: isSelected ? 'white' : textColor,
                          border: isSelected ? 'none' : `1px solid ${borderColor}`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          fontSize: isMobile ? '12px' : '13px',
                          transition: 'all 0.2s',
                          textAlign: 'center'
                        }}
                      >
                        {opt.image_url ? (
                          <img 
                            src={opt.image_url} 
                            alt={opt.option_type}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              margin: '0 auto 4px auto',
                              display: 'block',
                              border: isSelected ? '2px solid white' : `1px solid ${borderColor}`
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: isMobile ? '18px' : '22px' }}>
                            {emoji}
                          </div>
                        )}
                        <div>{getOptionLabel(opt.option_type)}</div>
                        <div style={{ 
                          fontSize: isMobile ? '11px' : '12px', 
                          color: isSelected ? 'rgba(255,255,255,0.9)' : (isFree ? promoColor : priceColor),
                          fontWeight: 'bold'
                        }}>
                          {isFree ? t('free') : `RM ${price.toFixed(2)}`}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: `1px solid ${promoColor}40`
                }}>
                  <span style={{ color: promoColor, fontSize: '13px' }}>
                    ⚠️ No drink options available.
                  </span>
                </div>
              )}
            </div>
          )}

          {hasSize && sizes.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: textColor,
                fontSize: isMobile ? '12px' : '13px',
                marginBottom: '8px'
              }}>
                {t('select_size')}:
              </label>
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                {sizes.map(size => {
                  const price = getItemPrice(selectedItem, selectedOption, size)
                  const isSelected = selectedSize?.id === size.id
                  const isFree = price === 0
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        flex: 1,
                        minWidth: '70px',
                        padding: isMobile ? '10px 12px' : '12px 16px',
                        background: isSelected ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : secondaryBg,
                        color: isSelected ? 'white' : textColor,
                        border: isSelected ? 'none' : `1px solid ${borderColor}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        fontSize: isMobile ? '12px' : '13px',
                        transition: 'all 0.2s',
                        textAlign: 'center'
                      }}
                    >
                      <div>{size.option_name}</div>
                      <div style={{ 
                        fontSize: isMobile ? '11px' : '12px', 
                        color: isSelected ? 'rgba(255,255,255,0.9)' : (isFree ? promoColor : priceColor),
                        fontWeight: 'bold'
                      }}>
                        {isFree ? t('free') : `RM ${price.toFixed(2)}`}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              color: textColor,
              fontSize: isMobile ? '12px' : '13px',
              marginBottom: '8px'
            }}>
              {t('quantity')}:
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: '40px',
                  height: '40px',
                  background: secondaryBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: textColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                -
              </button>
              <span style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: 'bold',
                color: textColor,
                minWidth: '40px',
                textAlign: 'center'
              }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: '40px',
                  height: '40px',
                  background: secondaryBg,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: textColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              color: textColor,
              fontSize: isMobile ? '12px' : '13px',
              marginBottom: '8px'
            }}>
              {t('notes')}:
            </label>
            <input
              type="text"
              placeholder={t('notes')}
              value={selectedItem.notes || ''}
              onChange={(e) => setSelectedItem({...selectedItem, notes: e.target.value})}
              style={{
                width: '100%',
                padding: isMobile ? '10px 14px' : '12px 16px',
                borderRadius: '12px',
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: textColor,
                fontSize: isMobile ? '13px' : '14px',
                outline: 'none'
              }}
            />
          </div>

          {isItemInBOGO(selectedItem) && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              padding: '10px 14px',
              borderRadius: '12px',
              marginBottom: '16px',
              border: `1px solid ${promoColor}40`
            }}>
              <span style={{ color: promoColor, fontWeight: 'bold', fontSize: '13px' }}>
                🎁 Buy 1 Get 1 FREE!
              </span>
              <span style={{ color: textMuted, fontSize: '12px', display: 'block' }}>
                {getBOGOFreeItem(selectedItem)?.name || 'Free item'} will be added
              </span>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            <button
              onClick={addToCart}
              style={{
                flex: 2,
                padding: isMobile ? '12px' : '14px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '13px' : '15px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🛒 {t('add_order')} (RM {(getItemPrice(selectedItem, selectedOption, selectedSize) * quantity).toFixed(2)})
            </button>
            <button
              onClick={() => {
                setShowItemModal(false)
                setSelectedItem(null)
                setSelectedOption('')
                setSelectedSize(null)
                setQuantity(1)
              }}
              style={{
                flex: 1,
                padding: isMobile ? '12px' : '14px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '13px' : '15px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER CART POPUP
  // ============================================================
  const renderCartPopup = () => {
    if (!showCartPopup || cart.length === 0) return null

    const totalCart = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    return (
      <div style={{
        position: 'fixed',
        bottom: isMobile ? '80px' : '90px',
        right: isMobile ? '10px' : '20px',
        background: cardBg,
        borderRadius: '20px',
        padding: isMobile ? '16px' : '20px',
        maxWidth: isMobile ? '340px' : '400px',
        width: '90%',
        maxHeight: '60vh',
        overflowY: 'auto',
        zIndex: 9998,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        border: `1px solid ${borderColor}`,
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: `1px solid ${borderColor}`,
          paddingBottom: '10px'
        }}>
          <h3 style={{ margin: 0, color: textColor, fontSize: isMobile ? '16px' : '18px' }}>
            🛒 Cart ({cartItemCount})
          </h3>
          <button
            onClick={() => setShowCartPopup(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: textMuted,
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {cart.map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0',
            borderBottom: index !== cart.length - 1 ? `1px solid ${borderColor}` : 'none'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: textColor, fontWeight: 'bold', fontSize: isMobile ? '13px' : '14px' }}>
                {item.name}
                {item.option && <span style={{ fontSize: '10px', color: textMuted, marginLeft: '4px' }}>({item.option})</span>}
              </div>
              <div style={{ fontSize: '11px', color: textMuted }}>
                x{item.quantity} × RM {item.price.toFixed(2)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: priceColor, fontWeight: 'bold', fontSize: '13px' }}>
                RM {item.subtotal.toFixed(2)}
              </span>
              <button
                onClick={() => removeFromCart(index)}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `2px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', color: textColor, fontSize: isMobile ? '16px' : '18px' }}>
            {t('total')}:
          </span>
          <span style={{ fontWeight: 'bold', color: priceColor, fontSize: isMobile ? '20px' : '24px' }}>
            RM {totalCart.toFixed(2)}
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px'
        }}>
          <button
            onClick={clearCart}
            style={{
              flex: 1,
              padding: isMobile ? '10px' : '12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '40px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: isMobile ? '12px' : '14px'
            }}
          >
            🗑️ {t('clear_cart')}
          </button>
          <button
            onClick={() => {
              setShowCartPopup(false)
              handleSendOrder()
            }}
            style={{
              flex: 2,
              padding: isMobile ? '10px' : '12px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '40px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: isMobile ? '12px' : '14px',
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)'
            }}
          >
            📤 {t('send_order')}
          </button>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER NEW ORDERS MODAL
  // ============================================================
  const renderNewOrdersModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
      <div style={{ ...glassEffect, background: cardBg, borderRadius: '28px', padding: isMobile ? '20px' : '28px', maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: textColor, fontSize: isMobile ? '18px' : '22px' }}>
            🔔 {t('new_orders_title')} ({newOrders.length})
          </h2>
          <button onClick={() => setShowNewOrders(false)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
        </div>
        {newOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: textMuted }}>📭 {t('no_new_orders')}</div>
        ) : newOrders.map(order => (
          <div key={order.id} style={{ 
            background: secondaryBg, 
            border: `2px solid ${borderColor}`,
            borderRadius: '18px', 
            padding: '16px', 
            marginBottom: '12px',
            animation: 'pulseGlow 1.5s ease-in-out infinite'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <strong style={{ color: textColor }}>🆕 {order.customer_name || 'Guest'} {order.table_number ? `• ${t('table')} ${order.table_number}` : '• ' + t('take_away')}</strong>
              <span style={{ color: textMuted, fontSize: '12px' }}>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div style={{ color: textColor, marginBottom: '12px' }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${borderColor}` }}>
                  <span>{item.quantity}x {item.name}{item.option || item.option_type ? ` (${item.option || item.option_type})` : ''}</span>
                  <strong>RM {Number((item.price || 0) * (item.quantity || 1)).toFixed(2)}</strong>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <strong style={{ color: priceColor }}>{t('total')}: RM {Number(order.total || order.subtotal || 0).toFixed(2)}</strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => confirmNewOrder(order)} style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', borderRadius: '30px', padding: '10px 16px', cursor: 'pointer', fontWeight: 'bold' }}>✅ {t('confirm_order')}</button>
                <button onClick={() => cancelNewOrder(order)} style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: '30px', padding: '10px 16px', cursor: 'pointer', fontWeight: 'bold' }}>{t('cancel')}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ============================================================
  // RENDER UNPAID ORDERS MODAL
  // ============================================================
  const renderUnpaidOrdersModal = () => {
    return (
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
        zIndex: 2000,
        animation: 'fadeIn 0.2s ease',
        padding: '20px'
      }}>
        <div style={{
          background: cardBg,
          borderRadius: '28px',
          padding: isMobile ? '20px' : '28px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          ...glassEffect,
          animation: 'popIn 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, color: textColor, fontSize: isMobile ? '18px' : '22px' }}>
              💰 {t('unpaid_orders')} ({unpaidOrders.length})
            </h2>
            <button 
              onClick={() => {
                setShowUnpaidOrders(false)
                setViewingOrder(null)
              }}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s'
              }}
            >
              ✕
            </button>
          </div>

          {unpaidOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: textMuted }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📭</span>
              {t('no_unpaid_orders')}
            </div>
          ) : viewingOrder ? (
            <div>
              <button 
                onClick={() => setViewingOrder(null)}
                style={{
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginBottom: '16px'
                }}
              >
                ← {t('back')}
              </button>

              <div style={{
                background: secondaryBg,
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: textColor }}>👤 {viewingOrder.customer_name || t('guest')}</span>
                  <span style={{ color: textMuted, fontSize: '12px' }}>
                    {viewingOrder.order_type === 'take_away' ? '🥡' : `🍽️ ${t('table')} ${viewingOrder.table_number}`}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: textMuted, marginBottom: '12px' }}>
                  🕐 {new Date(viewingOrder.created_at).toLocaleString()}
                </div>

                {viewingOrder.items?.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: idx !== viewingOrder.items.length - 1 ? `1px solid ${borderColor}` : 'none'
                  }}>
                    <span style={{ color: textColor }}>
                      {item.name}
                      {item.option && <span style={{ fontSize: '10px', color: textMuted, marginLeft: '4px' }}>({item.option})</span>}
                      {item.isFree && <span style={{ color: priceColor, fontSize: '10px', marginLeft: '4px' }}>({t('free')})</span>}
                      <span style={{ fontSize: '11px', color: textMuted, marginLeft: '4px' }}>x{item.quantity}</span>
                    </span>
                    <span style={{ color: priceColor, fontWeight: 'bold' }}>
                      {item.isFree ? t('free') : `RM ${(item.price * item.quantity).toFixed(2)}`}
                    </span>
                  </div>
                ))}

                <div style={{
                  borderTop: `2px solid ${borderColor}`,
                  marginTop: '12px',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  <span>{t('total')}:</span>
                  <span style={{ color: priceColor }}>RM {viewingOrder.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ color: textColor, fontWeight: 'bold', fontSize: '14px', width: '100%' }}>
                  💳 {t('payment_method')}:
                </span>
                {['cash', 'bank', 'tng'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      flex: 1,
                      minWidth: '80px',
                      padding: '10px 16px',
                      background: paymentMethod === method ? 'linear-gradient(135deg, #22c55e, #16a34a)' : secondaryBg,
                      color: paymentMethod === method ? 'white' : textColor,
                      border: paymentMethod === method ? 'none' : `1px solid ${borderColor}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: paymentMethod === method ? 'bold' : 'normal',
                      fontSize: isMobile ? '12px' : '14px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {method === 'cash' ? '💵 ' + t('cash') : 
                     method === 'bank' ? '🏦 ' + t('bank') : 
                     '📱 ' + t('tng')}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => printReceipt(viewingOrder, paymentMethod)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '40px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  🧾 {t('preview_receipt')}
                </button>
                {viewingOrder.payment_status === PAYMENT_STATUS.PAID && (
                  <button
                    onClick={() => downloadReceipt(viewingOrder)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '40px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    ⬇️ {t('download_receipt')}
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (!paymentMethod) {
                      toast.error('Sila pilih kaedah bayaran!')
                      return
                    }
                    markOrderAsPaid(viewingOrder, paymentMethod)
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '40px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  💰 {t('mark_paid')} {paymentMethod && `(${paymentMethod === 'cash' ? 'Tunai' : paymentMethod === 'bank' ? 'Bank' : 'TnG'})`}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {unpaidOrders.map(order => (
                <div key={order.id} style={{
                  background: secondaryBg,
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: `1px solid ${borderColor}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setViewingOrder(order)}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: textColor }}>
                      👤 {order.customer_name || t('guest')}
                    </div>
                    <div style={{ fontSize: '12px', color: textMuted }}>
                      {order.order_type === 'take_away' ? '🥡 ' + t('take_away') : '🍽️ ' + t('table') + ' ' + (order.table_number || '-')} • 
                      {order.items?.length || 0} {t('items')}
                    </div>
                    <div style={{ fontSize: '11px', color: textMuted }}>
                      🕐 {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: priceColor }}>
                      RM {order.total?.toFixed(2) || '0.00'}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setViewingOrder(order)
                      }}
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '4px 14px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginTop: '4px'
                      }}
                    >
                      {t('view_order')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER HISTORY MODAL
  // ============================================================
  const renderHistoryModal = () => {
    const totalPages = Math.ceil(orderHistory.length / historyItemsPerPage)

    return (
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
        zIndex: 2000,
        animation: 'fadeIn 0.2s ease',
        padding: '20px'
      }}>
        <div style={{
          background: cardBg,
          borderRadius: '28px',
          padding: isMobile ? '20px' : '28px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          ...glassEffect,
          animation: 'popIn 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, color: textColor, fontSize: isMobile ? '18px' : '22px' }}>
              📜 {t('history_orders')} ({orderHistory.length})
            </h2>
            <button 
              onClick={() => setShowHistoryModal(false)}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s'
              }}
            >
              ✕
            </button>
          </div>

          {orderHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: textMuted }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📭</span>
              {t('no_history_orders')}
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: darkMode ? 'rgba(30,30,46,0.8)' : '#f1f5f9' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('id')}</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('customer_name')}</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('order_type')}</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('total')}</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('payment_method_label')}</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('date')}</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: textColor, fontSize: '13px' }}>{t('action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.slice((historyPage - 1) * historyItemsPerPage, historyPage * historyItemsPerPage).map(order => (
                      <tr key={order.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                        <td style={{ padding: '10px', color: textColor, fontSize: '13px' }}>{order.order_number || `ORD-${order.id}`}</td>
                        <td style={{ padding: '10px', color: textColor, fontSize: '13px' }}>{order.customer_name || 'Walk-in'}</td>
                        <td style={{ padding: '10px', color: textColor, fontSize: '13px' }}>
                          {order.order_type === 'take_away' ? '🥡 ' + t('take_away') : '🍽️ ' + t('table') + ' ' + (order.table_number || '')}
                        </td>
                        <td style={{ padding: '10px', color: priceColor, fontWeight: 'bold', fontSize: '13px' }}>
                          RM {Number(order.grand_total || order.total || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px', color: textColor, fontSize: '13px' }}>
                          {order.payment_method === 'cash' ? '💵 ' + t('cash') : 
                           order.payment_method === 'tng' ? '📱 ' + t('tng') : 
                           order.payment_method === 'bank' ? '🏦 ' + t('bank') : '-'}
                        </td>
                        <td style={{ padding: '10px', color: textColor, fontSize: '13px' }}>
                          {new Date(order.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <button 
                            onClick={() => {
                              setViewingOrder(order)
                              setShowHistoryModal(false)
                              setShowUnpaidOrders(true)
                            }}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '30px',
                              padding: '4px 14px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}
                          >
                            👁️ {t('view_order')}
                          </button>
                          <button 
                            onClick={() => downloadReceipt(order)}
                            style={{
                              background: '#8b5cf6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '30px',
                              padding: '4px 14px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              marginLeft: '4px'
                            }}
                          >
                            ⬇️
                          </button>
                          <button 
                            onClick={() => printReceipt(order, order.payment_method)}
                            style={{
                              background: '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: '30px',
                              padding: '4px 14px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              marginLeft: '4px'
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

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setHistoryPage(1)} 
                    disabled={historyPage === 1}
                    style={{ padding: '6px 12px', background: historyPage === 1 ? secondaryBg : '#3b82f6', color: historyPage === 1 ? textMuted : 'white', border: 'none', borderRadius: '30px', cursor: historyPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    « {t('first')}
                  </button>
                  <button 
                    onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))} 
                    disabled={historyPage === 1}
                    style={{ padding: '6px 12px', background: historyPage === 1 ? secondaryBg : '#3b82f6', color: historyPage === 1 ? textMuted : 'white', border: 'none', borderRadius: '30px', cursor: historyPage === 1 ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    ‹ {t('prev')}
                  </button>
                  <span style={{ padding: '4px 14px', background: cardBg, borderRadius: '30px', color: textColor, fontSize: '13px', border: `1px solid ${borderColor}` }}>
                    {historyPage} / {totalPages}
                  </span>
                  <button 
                    onClick={() => setHistoryPage(prev => Math.min(totalPages, prev + 1))} 
                    disabled={historyPage === totalPages}
                    style={{ padding: '6px 12px', background: historyPage === totalPages ? secondaryBg : '#3b82f6', color: historyPage === totalPages ? textMuted : 'white', border: 'none', borderRadius: '30px', cursor: historyPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    {t('next')} ›
                  </button>
                  <button 
                    onClick={() => setHistoryPage(totalPages)} 
                    disabled={historyPage === totalPages}
                    style={{ padding: '6px 12px', background: historyPage === totalPages ? secondaryBg : '#3b82f6', color: historyPage === totalPages ? textMuted : 'white', border: 'none', borderRadius: '30px', cursor: historyPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >
                    {t('last')} »
                  </button>
                </div>
              )}
            </>
          )}
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
        <div style={{
          padding: '24px',
          maxWidth: '1200px',
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
  const filteredMenu = getFilteredMenu()
  const totalCart = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Sidebar>
      <div style={{
        padding: isMobile ? '12px' : '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        background: bgColor,
        minHeight: '100vh',
        position: 'relative',
      }}>

        {/* HEADER */}
        <div style={{
          ...glassEffect,
          borderRadius: '24px',
          padding: isMobile ? '16px 20px' : '20px 28px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h1 style={{
              margin: 0,
              color: textColor,
              fontSize: isMobile ? '20px' : '26px',
              fontWeight: 'bold'
            }}>
              {t('pos_title')}
            </h1>
            <p style={{
              margin: 0,
              color: textMuted,
              fontSize: isMobile ? '11px' : '13px'
            }}>
              {t('pos_subtitle')}
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            {/* TEST SOUND BUTTON */}
            <button
              onClick={testSound}
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '11px' : '13px',
                boxShadow: '0 4px 16px rgba(139,92,246,0.3)',
              }}
              title="Test Notification Sound"
            >
              🔊 {t('sound_test')}
            </button>

            <button
              onClick={() => {
                setCart([])
                setCustomerName('')
                setCustomerPhone('')
                setTableNumber('')
                setShowCartPopup(false)
                toast(t('new_order_started'))
              }}
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '11px' : '13px',
                boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
              }}
            >
              🔄 {t('new_cart')}
            </button>

            <button
              onClick={() => { setShowNewOrders(true); loadNewOrders() }}
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '11px' : '13px',
                boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                position: 'relative',
                animation: newOrders.length > 0 ? 'pulse 1s ease-in-out infinite' : 'none'
              }}
            >
              🔔 {t('new_orders_title')}
              {newOrders.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  animation: 'bounce 0.5s ease-in-out infinite alternate'
                }}>
                  {newOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setShowUnpaidOrders(true)
                setViewingOrder(null)
                loadUnpaidOrders()
              }}
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '11px' : '13px',
                boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                position: 'relative'
              }}
            >
              💰 {t('unpaid_orders')}
              {unpaidOrders.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unpaidOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setShowHistoryModal(true); loadOrderHistory() }}
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                background: 'linear-gradient(135deg, #6c757d, #495057)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '11px' : '13px',
                boxShadow: '0 4px 16px rgba(108,117,125,0.3)',
              }}
            >
              📜 {t('history_orders')}
            </button>
          </div>
        </div>

        {/* ORDER TYPE DETAILS */}
        <div style={{
          ...glassEffect,
          borderRadius: '16px',
          padding: isMobile ? '12px 16px' : '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              color: textColor,
              fontSize: isMobile ? '11px' : '12px',
              marginBottom: '4px'
            }}>
              👤 {t('customer_name')}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('guest')}
              style={{
                width: '100%',
                padding: isMobile ? '8px 12px' : '10px 14px',
                borderRadius: '10px',
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: textColor,
                fontSize: isMobile ? '13px' : '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              color: textColor,
              fontSize: isMobile ? '11px' : '12px',
              marginBottom: '4px'
            }}>
              📞 {t('customer_phone')}
            </label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="012-3456789"
              style={{
                width: '100%',
                padding: isMobile ? '8px 12px' : '10px 14px',
                borderRadius: '10px',
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: textColor,
                fontSize: isMobile ? '13px' : '14px',
                outline: 'none'
              }}
            />
          </div>

          {orderType === 'dine_in' && (
            <div style={{ flex: 1, minWidth: '100px' }}>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: textColor,
                fontSize: isMobile ? '11px' : '12px',
                marginBottom: '4px'
              }}>
                🪑 {t('table_number')}
              </label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="1"
                min="1"
                style={{
                  width: '100%',
                  padding: isMobile ? '8px 12px' : '10px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: textColor,
                  fontSize: isMobile ? '13px' : '14px',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setOrderType('dine_in')}
              style={{
                padding: '6px 14px',
                background: orderType === 'dine_in' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                color: orderType === 'dine_in' ? 'white' : textColor,
                border: orderType === 'dine_in' ? 'none' : `1px solid ${borderColor}`,
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: isMobile ? '10px' : '12px',
                transition: 'all 0.2s'
              }}
            >
              🍽️ {t('dine_in')}
            </button>
            <button
              onClick={() => setOrderType('take_away')}
              style={{
                padding: '6px 14px',
                background: orderType === 'take_away' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                color: orderType === 'take_away' ? 'white' : textColor,
                border: orderType === 'take_away' ? 'none' : `1px solid ${borderColor}`,
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: isMobile ? '10px' : '12px',
                transition: 'all 0.2s'
              }}
            >
              🥡 {t('take_away')}
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div style={{
          ...glassEffect,
          borderRadius: '60px',
          padding: '4px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '18px', marginRight: '12px', color: textMuted }}>🔍</span>
          <input
            type="text"
            placeholder={t('search_menu')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: isMobile ? '10px 0' : '12px 0',
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

        {/* CATEGORIES TABS */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          marginBottom: '16px',
          paddingBottom: '4px',
          flexShrink: 0
        }}>
          {getCategories().map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: isMobile ? '6px 14px' : '8px 20px',
                background: selectedCategory === cat ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                color: selectedCategory === cat ? 'white' : textColor,
                border: selectedCategory === cat ? 'none' : `1px solid ${borderColor}`,
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                fontSize: isMobile ? '11px' : '13px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {cat === 'All' ? '📋 ' + t('all_categories') : getCategoryIcon(cat) + ' ' + cat}
            </button>
          ))}
        </div>

        {/* MENU GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: isMobile ? '10px' : '14px',
          marginBottom: '10px'
        }}>
          {filteredMenu.map(item => {
            const promo = getItemPromotion(item)
            const promoPrice = getPromoPrice(item)
            const isBOGO = isItemInBOGO(item)
            const drinkOpts = getDrinkOptionsForItem(item)
            const hasDrinkOpts = drinkOpts.length > 0

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item)
                  setSelectedOption('')
                  setSelectedSize(null)
                  setQuantity(1)

                  if (item.has_options) {
                    loadMenuOptions(item.id)
                  }

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
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = darkMode 
                    ? '0 12px 32px rgba(0,0,0,0.5)' 
                    : '0 12px 32px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {promo && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: promoColor,
                    color: 'white',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                    zIndex: 5
                  }}>
                    {promo.type === 'bogo' ? '🎁 BOGO' : 
                     promo.type === 'bundle' ? '📦 Bundle' : 
                     promo.type === 'set_menu' ? '🍽️ Set' : '🔥 ' + t('promo')}
                  </div>
                )}

                {hasDrinkOpts && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '-8px',
                    background: '#3b82f6',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                    zIndex: 5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    ☕ {drinkOpts.length}
                  </div>
                )}

                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: isMobile ? '82px' : '104px',
                      maxWidth: '140px',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      borderRadius: '14px',
                      margin: '0 auto 8px auto',
                      display: 'block',
                      backgroundColor: '#ffffff',
                      padding: '6px',
                      boxSizing: 'border-box'
                    }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div style={{
                    fontSize: isMobile ? '36px' : '48px',
                    marginBottom: '4px'
                  }}>
                    {isDrinkCategory(item.category) ? '🥤' : '🍽️'}
                  </div>
                )}
                <div style={{
                  fontWeight: 'bold',
                  color: textColor,
                  fontSize: isMobile ? '12px' : '14px',
                  marginBottom: '4px',
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
                      <span style={{
                        color: promoColor,
                        fontWeight: 'bold',
                        fontSize: isMobile ? '14px' : '16px'
                      }}>
                        RM {promoPrice.toFixed(2)}
                      </span>
                      <span style={{
                        color: textMuted,
                        fontSize: isMobile ? '10px' : '11px',
                        textDecoration: 'line-through'
                      }}>
                        RM {item.price.toFixed(2)}
                      </span>
                      {isBOGO && (
                        <span style={{
                          background: promoColor,
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontSize: '7px',
                          fontWeight: 'bold'
                        }}>
                          BOGO
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{
                      color: priceColor,
                      fontWeight: 'bold',
                      fontSize: isMobile ? '14px' : '16px'
                    }}>
                      RM {item.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {item.has_options && (
                  <div style={{
                    fontSize: '9px',
                    color: '#8b5cf6',
                    marginTop: '2px'
                  }}>
                    ⚙️ Multiple sizes
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* FLOATING CART BUTTON */}
        {cart.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: isMobile ? '20px' : '30px',
            right: isMobile ? '20px' : '30px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            <button
              onClick={() => setShowCartPopup(!showCartPopup)}
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '60px',
                padding: isMobile ? '14px 20px' : '18px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '10px' : '14px',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
                transition: 'all 0.3s ease',
                fontSize: isMobile ? '14px' : '18px',
                fontWeight: 'bold',
                position: 'relative',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🛒
              <span>RM {totalCart.toFixed(2)}</span>
              <span style={{
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 8px',
                fontSize: isMobile ? '11px' : '13px',
                marginLeft: '4px'
              }}>
                {cartItemCount}
              </span>
            </button>

            {settings.auto_print && (
              <div style={{
                fontSize: '10px',
                color: '#0ea5e9',
                background: 'rgba(14,165,233,0.15)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(14,165,233,0.2)',
                textAlign: 'center'
              }}>
                🖨️ Auto print ON
              </div>
            )}
          </div>
        )}

        {/* RENDER ALL MODALS */}
        {renderCartPopup()}
        {showItemModal && renderItemModal()}
        {showNewOrders && renderNewOrdersModal()}
        {showUnpaidOrders && renderUnpaidOrdersModal()}
        {showHistoryModal && renderHistoryModal()}

        {/* STYLES */}
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
              0% { opacity: 0; transform: scale(0.95) translateY(10px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }

            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }

            @keyframes bounce {
              0% { transform: scale(1); }
              100% { transform: scale(1.3); }
            }

            @keyframes pulseGlow {
              0%, 100% { 
                box-shadow: 0 0 0 0 rgba(59,130,246,0.4);
                border-color: ${borderColor};
              }
              50% { 
                box-shadow: 0 0 20px 5px rgba(59,130,246,0.6);
                border-color: #3b82f6;
              }
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