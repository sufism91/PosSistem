import { useState, useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import toast from 'react-hot-toast'
import { supabase } from './lib/supabase'
import { ORDER_STATUS, PAYMENT_STATUS, getDrinkOptionImage, normalizeOrderForInsert } from './lib/orderWorkflow'
import { useReceipt } from './hooks/useReceipt'

function CustomerMenu() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { language, setLanguage } = useLanguage()
  
  const { 
    settings: receiptSettings, 
    loading: receiptLoading, 
    generateReceipt, 
    printReceipt,
    reload: reloadReceipt 
  } = useReceipt()
  
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [tableNumber, setTableNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [restaurantName, setRestaurantName] = useState('Restoran Kita')
  const [restaurantLogo, setRestaurantLogo] = useState('')
  const [drinkOptions, setDrinkOptions] = useState({})
  const [showDrinkModal, setShowDrinkModal] = useState(false)
  const [selectedDrink, setSelectedDrink] = useState(null)
  const [selectedOption, setSelectedOption] = useState('Panas')
  const [specialMenuEnabled, setSpecialMenuEnabled] = useState(false)
  const [specialMenuTitle, setSpecialMenuTitle] = useState('Istimewa Hari Ini')
  const [specialMenuItems, setSpecialMenuItems] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [addingItem, setAddingItem] = useState(null)
  const [clickedItemId, setClickedItemId] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [serviceChargePercent, setServiceChargePercent] = useState(6)
  const [taxPercent, setTaxPercent] = useState(6)
  const [isMobile, setIsMobile] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [selectedSizeItem, setSelectedSizeItem] = useState(null)
  const [menuOptions, setMenuOptions] = useState([])
  
  const [menuAddons, setMenuAddons] = useState([])
  const [selectedAddons, setSelectedAddons] = useState([])
  const [showAddonModal, setShowAddonModal] = useState(false)
  
  const [activePromos, setActivePromos] = useState([])
  const [promoItems, setPromoItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // ============================================================
  // TRANSLATIONS (SAME AS YOURS - KEPT SHORT FOR BREVITY)
  // ============================================================
  const translations = {
    scan_qr: { en: 'Scan QR to order', ms: 'Scan QR untuk pesan' },
    table_no: { en: 'Table No.', ms: 'No. Meja' },
    enter_table: { en: 'Please enter your table number', ms: 'Sila masukkan nombor meja' },
    promotions: { en: 'Active Promotions!', ms: 'Promosi Giat!' },
    buy: { en: 'Buy', ms: 'Beli' },
    get_free: { en: 'get', ms: 'dapat' },
    free: { en: 'FREE', ms: 'PERCUMA' },
    only: { en: 'Only', ms: 'Hanya' },
    save: { en: 'Save', ms: 'Jimat' },
    promo: { en: 'PROMO', ms: 'PROMOSI' },
    promo_bundle: { en: 'Bundle Deal', ms: 'Tawaran Bundle' },
    promo_set: { en: 'Set Menu', ms: 'Set Menu' },
    promo_bogo: { en: 'Buy 1 Free 1', ms: 'Beli 1 Percuma 1' },
    buy_promo: { en: 'Buy Promo', ms: 'Beli Promo' },
    your_order: { en: 'Your Order', ms: 'Pesanan Anda' },
    empty_cart_msg: { en: 'Your cart is empty', ms: 'Keranjang kosong' },
    back_to_menu: { en: 'Back to Menu', ms: 'Kembali ke Menu' },
    place_order: { en: 'Place Order', ms: 'Hantar Pesanan' },
    table_required: { en: 'Table number required', ms: 'Nombor meja diperlukan' },
    subtotal: { en: 'Subtotal', ms: 'Subtotal' },
    service: { en: 'Service', ms: 'Perkhidmatan' },
    tax: { en: 'Tax', ms: 'Cukai' },
    total: { en: 'Total', ms: 'Jumlah' },
    total_items: { en: 'Total Items', ms: 'Jumlah Item' },
    total_amount: { en: 'Total Amount', ms: 'Jumlah Bayaran' },
    your_name: { en: 'Your name', ms: 'Nama anda' },
    phone_optional: { en: 'Phone (optional)', ms: 'Telefon (optional)' },
    special_notes: { en: 'Special notes...', ms: 'Catatan khas...' },
    confirm_order: { en: 'Confirm Order', ms: 'Sahkan Pesanan' },
    review_order: { en: 'Please review your order before placing', ms: 'Sila semak semula pesanan anda sebelum menghantar' },
    table: { en: 'Table', ms: 'Meja' },
    customer: { en: 'Customer', ms: 'Pelanggan' },
    guest: { en: 'Guest', ms: 'Tetamu' },
    back: { en: 'Back', ms: 'Kembali' },
    close: { en: 'Close', ms: 'Tutup' },
    confirm: { en: 'Confirm', ms: 'Sahkan' },
    order_confirmed: { en: 'Order Confirmed!', ms: 'Pesanan Dikonfirmasi!' },
    order_sent: { en: 'Your order has been sent to the kitchen', ms: 'Pesanan anda telah dihantar ke dapur' },
    order_number: { en: 'Order Number', ms: 'Nombor Pesanan' },
    copy: { en: 'Copy', ms: 'Salin' },
    track_order: { en: 'Track Order', ms: 'Jejak Pesanan' },
    new_order: { en: 'New Order', ms: 'Pesanan Baru' },
    copied: { en: 'Copied!', ms: 'Disalin!' },
    drink_type: { en: 'Select drink type', ms: 'Pilih jenis minuman' },
    hot: { en: 'Hot', ms: 'Panas' },
    cold: { en: 'Cold', ms: 'Sejuk' },
    bungkus: { en: 'Takeaway', ms: 'Bungkus' },
    add_to_cart: { en: 'Add to Cart', ms: 'Tambah ke Keranjang' },
    cancel: { en: 'Cancel', ms: 'Batal' },
    choose_size: { en: 'Choose size / option', ms: 'Pilih saiz / pilihan' },
    select_size: { en: 'Select Size', ms: 'Pilih Saiz' },
    no_menu_category: { en: 'No menu items in this category', ms: 'Tiada menu dalam kategori ini' },
    special_today: { en: 'Special Today', ms: 'Istimewa Hari Ini' },
    add: { en: 'Add', ms: 'Tambah' },
    added: { en: 'Added!', ms: 'Ditambah!' },
    all: { en: 'All', ms: 'Semua' },
    menu_updated: { en: 'Menu updated!', ms: 'Menu dikemaskini!' },
    category_updated: { en: 'Categories updated!', ms: 'Kategori dikemaskini!' },
    promo_updated: { en: 'Promotions updated!', ms: 'Promosi dikemaskini!' },
    live: { en: 'Live', ms: 'Langsung' },
    empty_cart: { en: 'Your cart is empty', ms: 'Keranjang anda kosong' },
    error_submit: { en: 'Error submitting order', ms: 'Ralat menghantar pesanan' },
    please_enter_table: { en: 'Please enter table number', ms: 'Sila masukkan nombor meja' },
    select_size_btn: { en: 'Select Size', ms: 'Pilih Saiz' },
    note: { en: 'Note', ms: 'Nota' },
    out_of_stock: { en: 'Out of Stock', ms: 'Habis Stok' },
    low_stock: { en: 'Low Stock', ms: 'Stok Rendah' },
    stock_label: { en: 'Stock', ms: 'Stok' },
    addons: { en: 'Add-Ons', ms: 'Tambahan' },
    addon_optional: { en: '(optional)', ms: '(pilihan)' },
    base_price: { en: 'Base Price', ms: 'Harga Asal' },
    from_base_price: { en: 'from base price', ms: 'dari harga asal' },
    you_save: { en: 'You Save', ms: 'Anda Jimat' },
    promo_price_label: { en: 'Promo Price', ms: 'Harga Promosi' },
    original_price: { en: 'Original Price', ms: 'Harga Asal' },
    search_menu: { en: 'Search menu...', ms: 'Cari menu...' },
  }

  const translate = (key) => {
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
  const bgColor = darkMode ? '#0a0a16' : '#fef3c7'
  const cardBg = darkMode ? 'rgba(20, 20, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const textColor = darkMode ? '#f1f5f9' : '#1e293b'
  const textMuted = darkMode ? '#94a3b8' : '#64748b'
  const textPrice = '#22c55e'
  const borderColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.4)'
  const inputBg = darkMode ? '#1a1a2e' : '#ffffff'
  const secondaryBg = darkMode ? 'rgba(30, 30, 50, 0.6)' : '#fef3c7'
  const accentColor = '#f59e0b'
  const successColor = '#22c55e'
  const dangerColor = '#ef4444'
  const primaryColor = '#3b82f6'
  const priceColor = '#22c55e'
  const promoColor = '#ef4444'
  const bundleColor = '#8b5cf6'

  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${borderColor}`,
    boxShadow: darkMode 
      ? '0 8px 40px rgba(0,0,0,0.5)' 
      : '0 8px 40px rgba(0,0,0,0.06)'
  }

  // ============================================================
  // CLEAN CATEGORY NAME
  // ============================================================
  const cleanCategoryName = (name) => {
    if (!name) return name
    return name.replace(/ \(.*\)$/, '').trim()
  }

  // ============================================================
  // GET ORDERED CATEGORIES
  // ============================================================
  const getOrderedCategories = () => {
    const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    const orderedList = []
    sorted.forEach(cat => {
      const cleaned = cleanCategoryName(cat.name)
      if (!orderedList.includes(cleaned)) {
        orderedList.push(cleaned)
      }
    })
    return orderedList
  }

  // ============================================================
  // GET CATEGORIES FOR MENU
  // ============================================================
  const getCategoriesForMenuFn = () => {
    const ordered = getOrderedCategories()
    const result = ['All', ...ordered]
    if (promoItems.length > 0 && !result.includes('🔥 Promosi')) {
      result.splice(1, 0, '🔥 Promosi')
    }
    return result
  }

  // ============================================================
  // GET CATEGORY ICON
  // ============================================================
  const getCategoryIcon = (catName) => {
    if (catName === 'All') return '🍽️'
    if (catName === '🔥 Promosi') return '🏷️'
    const foundCat = categories.find(c => cleanCategoryName(c.name) === catName)
    if (foundCat && foundCat.icon) return foundCat.icon
    const parentCat = categories.find(c => c.id === foundCat?.parent_id)
    if (parentCat && parentCat.icon) return parentCat.icon
    return '📂'
  }

  // ============================================================
  // GET DEFAULT ICON
  // ============================================================
  const getDefaultIcon = (category) => {
    const foundCat = categories.find(c => cleanCategoryName(c.name) === category)
    if (foundCat && foundCat.icon) return foundCat.icon
    switch(category) {
      case 'Makanan': return '🍚'
      case 'Minuman': return '🥤'
      default: return '🍽️'
    }
  }

  // ============================================================
  // PROMOTION HELPERS (KEEP YOUR EXISTING CODE)
  // ============================================================
  function normalisePromoItem(item) {
    if (!item) return null
    return {
      ...item,
      id: item.menu_id || item.id || null,
      menu_id: item.menu_id || item.id || null,
      name: item.name || 'Unknown Item',
      price: parseFloat(item.price) || 0
    }
  }

  function getItemPromotion(item) {
    if (!item) return null
    if (activePromos.length === 0) return null
    for (const promo of activePromos) {
      if (promo.type === 'bogo') {
        const trigger = (promo.trigger_items || []).find(t => {
          const normalised = normalisePromoItem(t)
          if (!normalised) return false
          if (normalised.id === item.id) return true
          if (item.id === normalised.id) return true
          if (normalised.name?.toLowerCase() === item.name?.toLowerCase()) return true
          if (item.id === `trigger_${promo.id}`) return true
          return false
        })
        if (trigger) {
          return { type: 'bogo', trigger: trigger, free: promo.free_items?.[0], promo }
        }
      }
      if (promo.type === 'bundle' || promo.type === 'set_menu') {
        if (!promo.bundle_items || promo.bundle_items.length === 0) continue
        const found = promo.bundle_items.find(i => {
          const normalised = normalisePromoItem(i)
          if (!normalised) return false
          if (normalised.id === item.id) return true
          if (item.id === normalised.id) return true
          if (normalised.name?.toLowerCase() === item.name?.toLowerCase()) return true
          if (item.id === `promo_bundle_${promo.id}`) return true
          if (item.id === `promo_set_${promo.id}`) return true
          return false
        })
        if (found) {
          return { type: promo.type, bundleItems: promo.bundle_items, bundlePrice: promo.bundle_price, promo }
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
      const bundleItem = promo.bundleItems?.find(i => {
        const normalised = normalisePromoItem(i)
        if (!normalised) return false
        return normalised.id === item.id || normalised.name === item.name
      })
      return bundleItem?.price || item.price || 0
    }
    return null
  }

  function getItemPriceWithPromo(item) {
    if (!item) return 0
    if (item.promo_price !== undefined && item.promo_price !== null) {
      return parseFloat(item.promo_price) || 0
    }
    const promoPrice = getPromoPrice(item)
    if (promoPrice !== null) {
      return parseFloat(promoPrice) || 0
    }
    return parseFloat(item.price) || 0
  }

  function getBundlePromoForCart(cartItems) {
    if (!cartItems || cartItems.length === 0) return null
    const bundlePromos = activePromos.filter(p => 
      (p.type === 'bundle' || p.type === 'set_menu') && 
      p.bundle_items && 
      p.bundle_items.length > 0 &&
      p.bundle_price > 0
    )
    for (const promo of bundlePromos) {
      const bundleItemIds = promo.bundle_items.map(i => i.menu_id || i.id).filter(id => id !== null)
      if (bundleItemIds.length === 0) continue
      const allItemsInCart = bundleItemIds.every(id => {
        return cartItems.some(cartItem => {
          if (cartItem.menu_id === id) return true
          if (cartItem.original_id === id) return true
          if (cartItem.id === id) return true
          const bundleItem = promo.bundle_items.find(i => (i.menu_id || i.id) === id)
          if (bundleItem) {
            return cartItem.name?.toLowerCase() === bundleItem.name?.toLowerCase()
          }
          return false
        })
      })
      if (allItemsInCart) {
        let totalOriginal = 0
        for (const bundleItem of promo.bundle_items) {
          const menuId = bundleItem.menu_id || bundleItem.id
          const cartItem = cartItems.find(c => {
            if (c.menu_id === menuId) return true
            if (c.original_id === menuId) return true
            if (c.id === menuId) return true
            if (c.name?.toLowerCase() === bundleItem.name?.toLowerCase()) return true
            return false
          })
          totalOriginal += cartItem?.original_price || cartItem?.price || bundleItem.price || 0
        }
        return {
          promo: promo,
          bundleItems: promo.bundle_items,
          bundlePrice: promo.bundle_price,
          totalOriginalPrice: totalOriginal,
          savings: totalOriginal - promo.bundle_price
        }
      }
    }
    return null
  }

  // ============================================================
  // LOAD PROMOTIONS (KEEP YOUR EXISTING CODE)
  // ============================================================
  async function loadPromotions() {
    try {
      console.log('🔄 Loading promotions from Supabase...')
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: false })
      if (error) {
        console.error('❌ Supabase error:', error)
        setActivePromos([])
        setPromoItems([])
        return
      }
      if (!data || data.length === 0) {
        console.log('⚠️ No promotions found')
        setActivePromos([])
        setPromoItems([])
        return
      }
      const parsedPromos = data.map(promo => {
        if (promo.bundle_items) {
          let items = []
          if (typeof promo.bundle_items === 'string') {
            try { items = JSON.parse(promo.bundle_items) } catch(e) { items = [] }
          } else if (Array.isArray(promo.bundle_items)) {
            items = promo.bundle_items
          } else if (typeof promo.bundle_items === 'object') {
            items = Object.values(promo.bundle_items)
          }
          promo.bundle_items = items.map(item => ({
            ...item,
            id: item.menu_id || item.id || null,
            menu_id: item.menu_id || item.id || null,
            name: item.name || 'Unknown Item',
            price: parseFloat(item.price) || 0
          })).filter(item => item.id !== null)
        } else {
          promo.bundle_items = []
        }
        if (promo.trigger_items) {
          let items = []
          if (typeof promo.trigger_items === 'string') {
            try { items = JSON.parse(promo.trigger_items) } catch(e) { items = [] }
          } else if (Array.isArray(promo.trigger_items)) {
            items = promo.trigger_items
          } else if (typeof promo.trigger_items === 'object') {
            items = Object.values(promo.trigger_items)
          }
          promo.trigger_items = items.map(item => ({
            ...item,
            id: item.menu_id || item.id || null,
            menu_id: item.menu_id || item.id || null,
            name: item.name || 'Unknown',
            price: parseFloat(item.price) || 0
          })).filter(item => item.id !== null)
        } else {
          promo.trigger_items = []
        }
        if (promo.free_items) {
          let items = []
          if (typeof promo.free_items === 'string') {
            try { items = JSON.parse(promo.free_items) } catch(e) { items = [] }
          } else if (Array.isArray(promo.free_items)) {
            items = promo.free_items
          } else if (typeof promo.free_items === 'object') {
            items = Object.values(promo.free_items)
          }
          promo.free_items = items.map(item => ({
            ...item,
            id: item.menu_id || item.id || null,
            menu_id: item.menu_id || item.id || null,
            name: item.name || 'Unknown',
            price: parseFloat(item.price) || 0
          })).filter(item => item.id !== null)
        } else {
          promo.free_items = []
        }
        return promo
      })
      const today = new Date().toISOString().split('T')[0]
      const active = parsedPromos.filter(promo => {
        if (promo.start_date && promo.start_date > today) return false
        if (promo.end_date && promo.end_date < today) return false
        return true
      })
      console.log('✅ Active promos:', active.length)
      setActivePromos(active)
      const items = []
      active.forEach(promo => {
        const genericNames = ['Promo', 'Promosi', 'Promotion', 'Bundle', 'Set Menu']
        const isGenericName = genericNames.includes(promo.name) || 
                              promo.name.includes('Promo') || 
                              promo.name.includes('Promosi')
        if ((promo.type === 'set_menu' || promo.type === 'bundle') && 
            promo.bundle_items && 
            promo.bundle_items.length > 0 &&
            promo.bundle_price > 0) {
          const bundleName = promo.bundle_items.map(i => i.name).join(' + ')
          const displayName = isGenericName ? bundleName : promo.name
          items.push({
            id: `promo_${promo.type}_${promo.id}`,
            name: displayName,
            price: promo.bundle_price,
            original_price: promo.bundle_items.reduce((sum, i) => sum + (i.price || 0), 0),
            items: promo.bundle_items.map(item => ({ ...item, name: item.name })),
            type: promo.type,
            promo_id: promo.id,
            promo_name: promo.name,
            image_url: promo.image_url || null,
            item_names: bundleName
          })
        }
        if (promo.type === 'bogo' && 
            promo.trigger_items && 
            promo.trigger_items.length > 0 &&
            promo.free_items && 
            promo.free_items.length > 0) {
          const triggerName = promo.trigger_items[0]?.name || 'Item'
          const freeName = promo.free_items[0]?.name || 'Item'
          const bogoName = `${triggerName} + FREE ${freeName}`
          const displayName = isGenericName ? bogoName : promo.name
          items.push({
            id: `promo_bogo_${promo.id}`,
            name: displayName,
            price: promo.trigger_items[0]?.price || 0,
            original_price: promo.trigger_items[0]?.price || 0,
            trigger_item: promo.trigger_items[0],
            free_item: promo.free_items[0],
            type: 'bogo',
            promo_id: promo.id,
            promo_name: promo.name,
            image_url: promo.image_url || null,
            item_names: bogoName
          })
        }
      })
      setPromoItems(items)
      console.log('🏷️ Promo items for display:', items.map(i => i.name))
    } catch (err) {
      console.error('❌ Error loading promotions:', err)
      setActivePromos([])
      setPromoItems([])
    }
  }

  // ============================================================
  // LOAD DATA + REAL-TIME SUBSCRIPTIONS (KEEP YOUR EXISTING CODE)
  // ============================================================
  useEffect(() => {
    loadAllData()
    loadSettings()
    reloadReceipt()
    const params = new URLSearchParams(window.location.search)
    const table = params.get('table')
    if (table) setTableNumber(table)
    const menuSubscription = supabase
      .channel('customer-menu-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, () => {
        loadMenu()
        toast.success(translate('menu_updated'), { duration: 1500 })
      })
      .subscribe()
    const categorySubscription = supabase
      .channel('customer-category-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        loadCategories()
        toast.success(translate('category_updated'), { duration: 1500 })
      })
      .subscribe()
    const drinkSubscription = supabase
      .channel('customer-drink-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drink_options' }, () => {
        loadDrinkOptions()
      })
      .subscribe()
    const promoSubscription = supabase
      .channel('customer-promo-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promotions' }, () => {
        loadPromotions()
        toast.success(translate('promo_updated'), { duration: 1500 })
      })
      .subscribe()
    const settingsSubscription = supabase
      .channel('customer-settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        loadSpecialMenu()
        loadRestaurantInfo()
        loadSettings()
        reloadReceipt()
      })
      .subscribe()
    return () => {
      menuSubscription.unsubscribe()
      categorySubscription.unsubscribe()
      drinkSubscription.unsubscribe()
      promoSubscription.unsubscribe()
      settingsSubscription.unsubscribe()
    }
  }, [])

  // ============================================================
  // LOAD FUNCTIONS (KEEP YOUR EXISTING CODE)
  // ============================================================
  async function loadAllData() {
    setLoading(true)
    await loadRestaurantInfo()
    await loadCategories()
    await loadMenu()
    await loadDrinkOptions()
    await loadPromotions()
    await loadSpecialMenu()
    setLoading(false)
  }

  async function loadRestaurantInfo() {
    try {
      const { data: nameData } = await supabase.from('settings').select('value').eq('key', 'restaurant_name').single()
      if (nameData) setRestaurantName(nameData.value)
      const { data: logoData } = await supabase.from('settings').select('value').eq('key', 'logo_url').single()
      if (logoData) setRestaurantLogo(logoData.value)
    } catch (err) {
      console.error('Error loading restaurant info:', err)
    }
  }

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    setCategories(data || [])
  }

  async function loadMenu() {
    const { data } = await supabase
      .from('menu')
      .select('*')
      .order('sort_order', { ascending: true })
    setMenu(data || [])
  }

  async function loadDrinkOptions() {
    const { data } = await supabase.from('drink_options').select('*')
    const optionsMap = {}
    data?.forEach(opt => {
      if (!optionsMap[opt.drink_name]) optionsMap[opt.drink_name] = []
      optionsMap[opt.drink_name].push({
        id: opt.id,
        type: opt.option_type,
        option_type: opt.option_type,
        price: parseFloat(opt.price) || 0,
        image_url: opt.image_url || opt.option_image_url || opt.image || null
      })
    })
    setDrinkOptions(optionsMap)
  }

  async function loadSettings() {
    try {
      const { data } = await supabase.from('settings').select('key, value')
      if (data) {
        const sc = data.find(s => s.key === 'service_charge')
        const tx = data.find(s => s.key === 'tax')
        if (sc) setServiceChargePercent(parseFloat(sc.value) || 0)
        if (tx) setTaxPercent(parseFloat(tx.value) || 0)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
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
        let items = []
        try {
          items = JSON.parse(itemsData.value)
        } catch (e) {
          items = []
        }
        const syncedItems = []
        for (const item of items) {
          if (item.menu_id) {
            const { data: menuItem } = await supabase
              .from('menu')
              .select('price, image_url, description, has_options, has_addons')
              .eq('id', item.menu_id)
              .single()
            if (menuItem) {
              syncedItems.push({
                ...item,
                price: menuItem.price,
                image_url: menuItem.image_url || item.image_url,
                description: menuItem.description || item.description,
                has_options: menuItem.has_options,
                has_addons: menuItem.has_addons
              })
            } else {
              syncedItems.push(item)
            }
          } else {
            syncedItems.push(item)
          }
        }
        setSpecialMenuItems(syncedItems)
      }
    } catch (err) {
      console.error('Error loading special menu:', err)
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const getCategoriesForMenuFnHelper = () => {
    const ordered = getOrderedCategories()
    const result = ['All', ...ordered]
    if (promoItems.length > 0 && !result.includes('🔥 Promosi')) {
      result.splice(1, 0, '🔥 Promosi')
    }
    return result
  }

  // ============================================================
  // GET FILTERED MENU
  // ============================================================
  const getFilteredMenu = () => {
    if (selectedCategory === '🔥 Promosi') {
      return promoItems
    }
    let filtered = [...menu]
    if (selectedCategory !== 'All') {
      const selectedClean = cleanCategoryName(selectedCategory)
      const selectedCat = categories.find(c => cleanCategoryName(c.name) === selectedClean)
      if (selectedCat) {
        const isParent = selectedCat.parent_id === null || selectedCat.parent_id === undefined
        if (isParent) {
          const subCategoryNames = categories
            .filter(c => c.parent_id === selectedCat.id)
            .map(c => cleanCategoryName(c.name))
          filtered = filtered.filter(item => {
            const itemClean = cleanCategoryName(item.category)
            return itemClean === selectedClean || subCategoryNames.includes(itemClean)
          })
        } else {
          filtered = filtered.filter(item => {
            const itemClean = cleanCategoryName(item.category)
            return itemClean === selectedClean
          })
        }
      } else {
        filtered = filtered.filter(item => {
          const itemClean = cleanCategoryName(item.category)
          return itemClean === selectedClean
        })
      }
    }
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filtered.sort((a, b) => {
      const catOrderA = categories.findIndex(c => cleanCategoryName(c.name) === cleanCategoryName(a.category))
      const catOrderB = categories.findIndex(c => cleanCategoryName(c.name) === cleanCategoryName(b.category))
      const orderA = catOrderA === -1 ? 999 : catOrderA
      const orderB = catOrderB === -1 ? 999 : catOrderB
      if (orderA !== orderB) {
        return orderA - orderB
      }
      return (a.sort_order || 0) - (b.sort_order || 0)
    })
  }

  // ============================================================
  // MENU OPTIONS FUNCTIONS
  // ============================================================
  async function loadMenuOptions(menuId) {
    const { data } = await supabase
      .from('menu_options')
      .select('*')
      .eq('menu_id', menuId)
      .eq('available', true)
      .order('sort_order')
    return data || []
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
  // CHECK STOCK
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
  // ADD TO CART DIRECT
  // ============================================================
  function addToCartDirect(item) {
    console.log('🛒 addToCartDirect called for:', item.name)
    const tempCart = [...cart, item]
    const bundleInCart = getBundlePromoForCart(tempCart)
    const isInBundle = bundleInCart && bundleInCart.bundleItems.some(i => {
      const normalised = normalisePromoItem(i)
      return normalised?.id === item.id || normalised?.name === item.name
    })
    if (isInBundle && bundleInCart) {
      const allItemsAfterAdd = bundleInCart.bundleItems.every(bi => {
        const normalised = normalisePromoItem(bi)
        return tempCart.some(c => {
          if (c.id === normalised?.id) return true
          if (c.menu_id === normalised?.id) return true
          if (c.original_id === normalised?.id) return true
          if (c.name?.toLowerCase() === normalised?.name?.toLowerCase()) return true
          return false
        })
      })
      if (allItemsAfterAdd) {
        const bundleItemIds = bundleInCart.bundleItems.map(i => i.menu_id || i.id)
        const updatedCart = cart.filter(c => {
          if (bundleItemIds.includes(c.id)) return false
          if (bundleItemIds.includes(c.menu_id)) return false
          if (bundleItemIds.includes(c.original_id)) return false
          if (c.isBundleItem) return false
          const isBundleByName = bundleInCart.bundleItems.some(bi => 
            bi.name?.toLowerCase() === c.name?.toLowerCase()
          )
          if (isBundleByName) return false
          return true
        })
        const bundleItem = {
          id: `bundle_${bundleInCart.promo.id}_${Date.now()}`,
          menu_id: bundleInCart.promo.id,
          original_id: bundleInCart.promo.id,
          name: `📦 ${bundleInCart.promo.name}`,
          display_name: bundleInCart.promo.name,
          price: bundleInCart.bundlePrice,
          quantity: 1,
          isBundleItem: true,
          is_bundle_line: true,
          bundleName: bundleInCart.promo.name,
          bundlePrice: bundleInCart.bundlePrice,
          original_price: bundleInCart.totalOriginalPrice,
          is_promo_item: true,
          promo_name: bundleInCart.promo.name,
          bundle_items: bundleInCart.bundleItems.map(i => ({ ...i, name: i.name }))
        }
        setCart([...updatedCart, bundleItem])
        setShowCart(true)
        toast.success(`📦 ${bundleInCart.promo.name} - RM ${bundleInCart.bundlePrice.toFixed(2)} (Jimat RM ${bundleInCart.savings.toFixed(2)})`)
        return
      }
    }
    const promo = getItemPromotion(item)
    const promoPrice = getPromoPrice(item)
    const hasPromo = promo !== null && promoPrice !== null
    let finalPrice = promoPrice !== null ? promoPrice : item.price
    const isFree = finalPrice === 0
    const existing = cart.find(x => x.id === item.id && !x.option_id && !x.addons && !x.isBundleItem)
    if (existing) {
      setCart(cart.map(x => 
        x.id === item.id && !x.option_id && !x.addons && !x.isBundleItem
          ? { ...x, quantity: x.quantity + 1 } 
          : x
      ))
    } else {
      setCart([...cart, { 
        ...item,
        menu_id: item.id,
        original_id: item.id,
        name: item.name,
        display_name: item.name,
        price: finalPrice,
        quantity: 1,
        is_free: isFree,
        is_promo_item: hasPromo,
        promo_type: promo?.type || null,
        promo_name: promo?.promo?.name || null,
        original_price: item.price,
        category: item.category || 'Makanan',
        isBundleItem: false,
        bundleName: null,
        bundlePrice: null
      }])
    }
    setShowCart(true)
    if (isFree) {
      toast.success(`🎁 ${item.name} PERCUMA!`)
    } else if (hasPromo) {
      toast.success(`✓ ${item.name} - RM ${finalPrice.toFixed(2)} (Promo)`)
    } else {
      toast.success(`✓ ${item.name} ${translate('added')}`)
    }
  }

  // ============================================================
  // ADD TO CART WITH OPTION
  // ============================================================
  async function addToCartWithOption(item, option) {
    const stockCheck = await checkOptionStock(option.id, 1)
    if (!stockCheck.available) {
      toast.error(`❌ "${option.option_name}" ${translate('out_of_stock')}! Stok sedia ada: ${stockCheck.stock}`)
      setShowSizeModal(false)
      setSelectedSizeItem(null)
      return
    }
    if (stockCheck.stock < 5) {
      toast.warning(`⚠️ "${option.option_name}" ${translate('low_stock')}! Stok: ${stockCheck.stock} sahaja`)
    }
    setAddingItem(item.id)
    setTimeout(() => setAddingItem(null), 300)
    const promo = getItemPromotion(item)
    const promoPrice = getPromoPrice(item)
    const hasPromo = promo !== null && promoPrice !== null
    const basePrice = hasPromo ? promoPrice : item.price
    let finalPrice = option.is_absolute_price 
      ? option.price_adjustment 
      : basePrice + option.price_adjustment
    const isFree = finalPrice === 0
    const tempCart = [...cart, { 
      id: item.id,
      menu_id: item.id,
      original_id: item.id,
      name: item.name, 
      price: finalPrice, 
      quantity: 1,
      category: item.category
    }]
    const bundleInCart = getBundlePromoForCart(tempCart)
    const isInBundle = bundleInCart && bundleInCart.bundleItems.some(i => {
      const normalised = normalisePromoItem(i)
      return normalised?.id === item.id || normalised?.name === item.name
    })
    let bundleName = null
    let bundlePriceValue = null
    if (bundleInCart && isInBundle) {
      const bundleItemCount = bundleInCart.bundleItems.length
      const perItemPrice = bundleInCart.bundlePrice / bundleItemCount
      finalPrice = perItemPrice
      bundleName = bundleInCart.promo.name
      bundlePriceValue = bundleInCart.bundlePrice
      setTimeout(() => {
        toast.success(`📦 ${bundleInCart.promo.name} Aktif! ${bundleInCart.bundleItems.map(i => i.name).join(' + ')} = RM ${bundleInCart.bundlePrice.toFixed(2)} (Jimat RM ${bundleInCart.savings.toFixed(2)})`, {
          duration: 4000
        })
      }, 200)
    }
    const cartItem = {
      id: `${item.id}_${option.id}_${Date.now()}`,
      menu_id: item.id,
      original_id: item.id,
      name: `${item.name} (${option.option_name})`,
      display_name: item.name,
      price: finalPrice,
      basePrice: basePrice,
      originalPrice: item.price,
      quantity: 1,
      option_name: option.option_name,
      option_id: option.id,
      option_stock: stockCheck.stock,
      is_free: isFree,
      is_promo_item: hasPromo || (bundleInCart && isInBundle),
      promo_type: promo?.type || null,
      promo_name: promo?.promo?.name || bundleName || null,
      category: item.category || 'Makanan',
      isBundleItem: bundleInCart && isInBundle,
      bundleName: bundleName,
      bundlePrice: bundlePriceValue
    }
    setCart([...cart, cartItem])
    setShowSizeModal(false)
    setSelectedSizeItem(null)
    setShowCart(true)
    if (isFree) {
      toast.success(`🎁 ${cartItem.name} PERCUMA!`)
    } else if (hasPromo) {
      toast.success(`✓ ${cartItem.name} - RM ${finalPrice.toFixed(2)} (Promo)`)
    } else {
      toast.success(`✓ ${cartItem.name} ${translate('added')}`)
    }
  }

  // ============================================================
  // ADD TO CART WITH ADD-ONS
  // ============================================================
  const addToCartWithAddons = (item, option, size) => {
    const promo = getItemPromotion(item)
    const promoPrice = getPromoPrice(item)
    const hasPromo = promo !== null && promoPrice !== null
    const basePrice = hasPromo ? promoPrice : item.price
    let finalPrice = basePrice + getAddonTotal()
    let isFree = finalPrice === 0
    const tempCart = [...cart, { 
      id: item.id,
      menu_id: item.id,
      original_id: item.id,
      name: item.name, 
      price: finalPrice, 
      quantity: 1,
      category: item.category
    }]
    const bundleInCart = getBundlePromoForCart(tempCart)
    const isInBundle = bundleInCart && bundleInCart.bundleItems.some(i => {
      const normalised = normalisePromoItem(i)
      return normalised?.id === item.id || normalised?.name === item.name
    })
    let bundleName = null
    let bundlePriceValue = null
    if (bundleInCart && isInBundle) {
      const bundleItemCount = bundleInCart.bundleItems.length
      const perItemPrice = bundleInCart.bundlePrice / bundleItemCount
      finalPrice = perItemPrice + getAddonTotal()
      bundleName = bundleInCart.promo.name
      bundlePriceValue = bundleInCart.bundlePrice
      isFree = finalPrice === 0
      setTimeout(() => {
        toast.success(`📦 ${bundleInCart.promo.name} Aktif! ${bundleInCart.bundleItems.map(i => i.name).join(' + ')} = RM ${bundleInCart.bundlePrice.toFixed(2)} (Jimat RM ${bundleInCart.savings.toFixed(2)})`, {
          duration: 4000
        })
      }, 200)
    }
    const addonNames = getAddonNames()
    const addonTotal = getAddonTotal()
    const cartItem = {
      id: `${item.id}_${option?.id || ''}_${Date.now()}`,
      menu_id: item.id,
      original_id: item.id,
      name: item.name,
      display_name: item.name,
      price: finalPrice,
      basePrice: basePrice,
      originalPrice: item.price,
      quantity: 1,
      option_name: option?.option_name || null,
      option_id: option?.id || null,
      size_name: size?.option_name || null,
      addons: addonNames,
      addon_ids: [...selectedAddons],
      addon_total: addonTotal,
      is_free: isFree,
      is_promo_item: hasPromo || (bundleInCart && isInBundle),
      promo_type: promo?.type || null,
      promo_name: promo?.promo?.name || bundleName || null,
      category: item.category || 'Makanan',
      isBundleItem: bundleInCart && isInBundle,
      bundleName: bundleName,
      bundlePrice: bundlePriceValue
    }
    setCart([...cart, cartItem])
    setShowSizeModal(false)
    setShowAddonModal(false)
    setSelectedSizeItem(null)
    setSelectedAddons([])
    setMenuAddons([])
    setShowCart(true)
    if (isFree) {
      toast.success(`🎁 ${item.name} PERCUMA!`)
    } else if (hasPromo || (bundleInCart && isInBundle)) {
      toast.success(`✓ ${item.name} - RM ${finalPrice.toFixed(2)} (Promo)`)
    } else {
      toast.success(`✓ ${item.name} ${translate('added')}`)
    }
  }

  // ============================================================
  // ADD TO CART - MAIN ENTRY POINT
  // ============================================================
  const addToCart = (item) => {
    setClickedItemId(item.id)
    setTimeout(() => setClickedItemId(null), 250)
    const promo = getItemPromotion(item)
    const promoPrice = getPromoPrice(item)
    const hasPromo = promo !== null && promoPrice !== null
    if (item.has_options) {
      loadMenuOptions(item.id).then(options => {
        if (options && options.length > 0) {
          setSelectedSizeItem({ 
            ...item, 
            price: item.price, 
            has_promo: hasPromo, 
            promo_price: promoPrice 
          })
          setMenuOptions(options)
          if (item.has_addons) {
            loadAddons(item.id).then(() => {
              setShowAddonModal(true)
            })
          } else {
            setShowSizeModal(true)
          }
        } else {
          addToCartDirect(item)
        }
      })
      return
    }
    if (item.has_addons) {
      loadAddons(item.id).then(() => {
        setSelectedSizeItem({ 
          ...item, 
          price: item.price, 
          has_promo: hasPromo, 
          promo_price: promoPrice 
        })
        setMenuOptions([])
        setShowAddonModal(true)
      })
      return
    }
    const hasDrinkOpts = drinkOptions[item.name] && drinkOptions[item.name].length > 0
    const isDrink = item.category === 'Minuman'
    if (hasDrinkOpts || isDrink) {
      openDrinkOptions(item)
    } else {
      addToCartDirect(item)
    }
  }

  // ============================================================
  // DRINK FUNCTIONS
  // ============================================================
  const openDrinkOptions = (drink) => {
    setSelectedDrink(drink)
    const options = drinkOptions[drink.name]
    if (options && options.length > 0) {
      setSelectedOption(options[0].type)
    } else {
      setSelectedOption('Panas')
    }
    setShowDrinkModal(true)
  }
  
  const selectedDrinkOptionData = selectedDrink ? drinkOptions[selectedDrink.name]?.find(opt => opt.type === selectedOption) : null
  const selectedDrinkPreviewImage = selectedDrink ? getDrinkOptionImage(selectedDrink, selectedDrinkOptionData) : ''

  // ============================================================
  // ADD DRINK TO CART
  // ============================================================
  const addDrinkToCart = () => {
    if (!selectedDrink) return
    const options = drinkOptions[selectedDrink.name]
    const selected = options?.find(o => o.type === selectedOption || o.option_type === selectedOption)
    if (!selected) return
    setAddingItem(selectedDrink.id)
    setTimeout(() => setAddingItem(null), 300)
    const promo = getItemPromotion(selectedDrink)
    const promoPrice = getPromoPrice(selectedDrink)
    const hasPromo = promo !== null && promoPrice !== null
    const finalPrice = hasPromo ? promoPrice : selected.price
    const isFree = finalPrice === 0
    let optionLabel = ''
    if (selectedOption === 'Panas') optionLabel = translate('hot')
    else if (selectedOption === 'Sejuk') optionLabel = translate('cold')
    else if (selectedOption === 'Bungkus') optionLabel = translate('bungkus')
    setCart([...cart, { 
      id: `${selectedDrink.id}_${selectedOption}_${Date.now()}`,
      menu_id: selectedDrink.id,
      original_id: selectedDrink.id,
      name: `${selectedDrink.name} (${optionLabel})`,
      display_name: selectedDrink.name,
      price: finalPrice,
      originalPrice: selectedDrink.price,
      quantity: 1,
      is_free: isFree,
      is_promo_item: hasPromo,
      promo_type: promo?.type || null,
      promo_name: promo?.promo?.name || null,
      category: 'Minuman',
      option_type: selectedOption,
      image_url: selected.image_url || null
    }])
    setShowDrinkModal(false)
    setSelectedDrink(null)
    setShowCart(true)
    if (isFree) {
      toast.success(`🎁 ${selectedDrink.name} (${optionLabel}) PERCUMA!`)
    } else if (hasPromo) {
      toast.success(`✓ ${selectedDrink.name} (${optionLabel}) - RM ${finalPrice.toFixed(2)} (Promo)`)
    } else {
      toast.success(`✓ ${selectedDrink.name} (${optionLabel}) ${translate('added')}`)
    }
  }

  // ============================================================
  // PROMO ITEMS - ADD TO CART
  // ============================================================
  const addPromoToCart = (promoItem) => {
    setAddingItem(promoItem.id)
    setTimeout(() => setAddingItem(null), 300)
    if (promoItem.type === 'bogo') {
      const triggerItem = { 
        id: `trigger_${promoItem.promo_id}_${Date.now()}`,
        menu_id: promoItem.trigger_item.id,
        original_id: promoItem.trigger_item.id,
        name: promoItem.trigger_item.name,
        display_name: promoItem.trigger_item.name,
        price: promoItem.trigger_item.price,
        quantity: 1,
        is_free: false,
        is_promo_item: false,
        original_price: promoItem.trigger_item.price,
        category: promoItem.trigger_item.category || 'Makanan',
        promo_id: promoItem.promo_id,
        promo_type: 'bogo'
      }
      const freeItem = { 
        id: `free_${promoItem.promo_id}_${Date.now()}`,
        menu_id: promoItem.free_item.id,
        original_id: promoItem.free_item.id,
        name: promoItem.free_item.name,
        display_name: promoItem.free_item.name,
        price: 0,
        quantity: 1,
        is_free: true,
        is_promo_item: true,
        promo_name: promoItem.promo_name,
        original_price: promoItem.free_item.price,
        category: promoItem.free_item.category || 'Makanan',
        promo_id: promoItem.promo_id,
        promo_type: 'bogo'
      }
      setCart([...cart, triggerItem, freeItem])
      toast.success(`${promoItem.trigger_item.name} + ${translate('free')} ${promoItem.free_item.name}!`)
    }
    if (promoItem.type === 'set_menu' || promoItem.type === 'bundle') {
      const bundleItems = promoItem.items.map((item, idx) => ({
        id: `bundle_${promoItem.promo_id}_${idx}_${Date.now()}`,
        menu_id: item.id,
        original_id: item.id,
        name: item.name,
        display_name: item.name,
        price: 0,
        quantity: 1,
        original_price: item.price,
        is_free: false,
        is_promo_item: true,
        promo_name: promoItem.promo_name,
        promo_type: promoItem.type,
        category: item.category || 'Makanan',
        promo_id: promoItem.promo_id,
        is_bundle_item: true,
        bundle_id: promoItem.promo_id
      }))
      const promoLineItem = {
        id: `promo_line_${promoItem.promo_id}_${Date.now()}`,
        name: `📦 ${promoItem.name}`,
        display_name: promoItem.name,
        price: promoItem.price,
        quantity: 1,
        is_free: false,
        is_promo_item: true,
        promo_name: promoItem.promo_name,
        promo_type: promoItem.type,
        bundle_items_count: promoItem.items.length,
        bundle_items: promoItem.items.map(item => ({ ...item, name: item.name })),
        promo_id: promoItem.promo_id,
        is_bundle_line: true,
        isBundleItem: true,
        bundlePrice: promoItem.price
      }
      setCart([...cart, ...bundleItems, promoLineItem])
      toast.success(`${promoItem.name} ${translate('added')}! ${translate('save')} RM ${(promoItem.original_price - promoItem.price).toFixed(2)}`)
    }
    setShowCart(true)
  }

  // ============================================================
  // SPECIAL ITEMS - ADD TO CART
  // ============================================================
  const addSpecialToCart = (item) => {
    setAddingItem(`special_${item.id}`)
    setTimeout(() => setAddingItem(null), 300)
    const existing = cart.find(x => x.id === `special_${item.id}`)
    if (existing) {
      setCart(cart.map(x => x.id === `special_${item.id}` ? { ...x, quantity: x.quantity + 1 } : x))
      toast.success(`✓ ${item.name} (x${existing.quantity + 1})`)
    } else {
      setCart([...cart, { 
        id: `special_${item.id}`,
        menu_id: item.id,
        original_id: item.id,
        name: item.name,
        display_name: item.name,
        price: item.price,
        quantity: 1,
        is_special: true,
        is_free: false,
        is_promo_item: false,
        category: item.category || 'Makanan'
      }])
      toast.success(`✓ ${item.name} (${translate('special_today')}) ${translate('added')}`)
    }
    setShowCart(true)
  }

  // ============================================================
  // QUANTITY CONTROL
  // ============================================================
  const updateCartQuantity = async (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(x => x.id !== id))
      return
    }
    const cartItem = cart.find(x => x.id === id)
    if (!cartItem) return
    if (cartItem.option_id) {
      const stockCheck = await checkOptionStock(cartItem.option_id, newQuantity)
      if (!stockCheck.available) {
        toast.error(`❌ "${cartItem.option_name}" ${translate('out_of_stock')}! Stok sedia ada: ${stockCheck.stock}`)
        return
      }
      if (stockCheck.stock < newQuantity) {
        toast.error(`❌ Stok tidak mencukupi untuk "${cartItem.option_name}". Stok sedia ada: ${stockCheck.stock}`)
        return
      }
    }
    setCart(cart.map(x => x.id === id ? { ...x, quantity: newQuantity } : x))
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(x => x.id !== id))
  }

  // ============================================================
  // HANDLE PLACE ORDER
  // ============================================================
  const handlePlaceOrder = () => {
    console.log('📋 handlePlaceOrder called')
    console.log('Cart length:', cart.length)
    console.log('Table number:', tableNumber)
    if (cart.length === 0) { 
      toast.error(translate('empty_cart'))
      console.log('❌ Cart is empty')
      return 
    }
    if (!tableNumber) { 
      toast.error(translate('table_required'))
      console.log('❌ No table number')
      return 
    }
    console.log('✅ Showing confirmation modal')
    setShowConfirmModal(true)
  }

  // ============================================================
  // SUBMIT ORDER CONFIRMED
  // ============================================================
  const submitOrderConfirmed = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setShowConfirmModal(false)
    for (const item of cart) {
      if (item.option_id) {
        const stockCheck = await checkOptionStock(item.option_id, item.quantity)
        if (!stockCheck.available) {
          toast.error(`❌ "${item.option_name}" ${translate('out_of_stock')}! Stok sedia ada: ${stockCheck.stock}`)
          setIsSubmitting(false)
          setShowConfirmModal(true)
          return
        }
        if (stockCheck.stock < item.quantity) {
          toast.error(`❌ Stok tidak mencukupi untuk "${item.option_name}". Stok sedia ada: ${stockCheck.stock}`)
          setIsSubmitting(false)
          setShowConfirmModal(true)
          return
        }
      }
    }
    const formattedItems = []
    cart.forEach(item => {
      if (item.is_bundle_line && item.bundle_items) {
        item.bundle_items.forEach(bi => {
          formattedItems.push({
            id: bi.id || bi.menu_id || `bundle_${Date.now()}`,
            menu_id: bi.menu_id || bi.id,
            original_id: bi.id || bi.menu_id,
            name: bi.name,
            display_name: bi.name,
            price: 0,
            quantity: bi.quantity || 1,
            original_price: bi.price || 0,
            is_free: false,
            is_promo_item: true,
            promo_name: item.promo_name || null,
            promo_type: item.promo_type || null,
            category: bi.category || 'Makanan',
            isBundleItem: true,
            bundleName: item.display_name || item.name,
            is_bundle_item: true
          })
        })
        formattedItems.push({
          id: item.id,
          menu_id: item.promo_id || `bundle_line_${Date.now()}`,
          original_id: item.promo_id || `bundle_line_${Date.now()}`,
          name: `📦 ${item.display_name || item.name}`,
          display_name: item.display_name || item.name,
          price: item.price,
          quantity: 1,
          original_price: item.price,
          is_free: false,
          is_promo_item: true,
          promo_name: item.promo_name || null,
          promo_type: item.promo_type || null,
          category: 'Promosi',
          isBundleItem: true,
          bundleName: item.display_name || item.name,
          is_bundle_line: true,
          is_bundle_item: false
        })
        return
      }
      let itemName = item.display_name || item.name
      if (item.option_name) {
        itemName = `${itemName} (${item.option_name})`
      }
      if (item.addons) {
        itemName = `${itemName} ✨${item.addons}`
      }
      if (item.is_free) {
        itemName = `🎁 ${itemName}`
      }
      formattedItems.push({
        id: item.id,
        menu_id: item.menu_id || item.id,
        original_id: item.original_id || item.id,
        name: itemName,
        display_name: item.display_name || item.name,
        price: item.price,
        basePrice: item.basePrice || item.price,
        quantity: item.quantity,
        is_free: item.is_free || false,
        is_promo_item: item.is_promo_item || false,
        promo_name: item.promo_name || null,
        promo_type: item.promo_type || null,
        original_price: item.original_price || null,
        option_name: item.option_name || null,
        option_id: item.option_id || null,
        option_type: item.option_type || null,
        addons: item.addons || null,
        addon_ids: item.addon_ids || [],
        addon_total: item.addon_total || 0,
        category: item.category || 'Makanan',
        isBundleItem: item.isBundleItem || false,
        bundleName: item.bundleName || null,
        is_bundle_item: item.is_bundle_item || false,
        is_bundle_line: item.is_bundle_line || false,
        promo_id: item.promo_id || null
      })
    })
    const orderNumber = 'ORD-' + Date.now()
    setSubmittedOrderNumber(orderNumber)
    const total = getGrandTotal()
    const subtotal = getSubtotal()
    const serviceCharge = getServiceCharge()
    const tax = getTax()
    try {
      const { data, error } = await supabase.from('customer_orders').insert([normalizeOrderForInsert({
        order_number: orderNumber,
        order_type: 'dine_in',
        table_number: parseInt(tableNumber),
        customer_name: customerName || 'Guest',
        customer_phone: customerPhone || null,
        items: formattedItems,
        subtotal: subtotal,
        service_charge: serviceCharge,
        tax: tax,
        total: total,
        notes: notes,
        status: ORDER_STATUS.PENDING,
        order_status: ORDER_STATUS.PENDING,
        payment_status: PAYMENT_STATUS.UNPAID
      })]).select()
      if (error) {
        console.error('Submit error:', error)
        toast.error(translate('error_submit') + ': ' + error.message)
        setIsSubmitting(false)
        return
      }
      let stockUpdateErrors = []
      for (const item of cart) {
        if (item.option_id) {
          const { data: currentData } = await supabase
            .from('menu_options')
            .select('stock')
            .eq('id', item.option_id)
            .single()
          if (currentData) {
            const currentStock = currentData.stock || 0
            const newStock = Math.max(0, currentStock - item.quantity)
            const { error: updateError } = await supabase
              .from('menu_options')
              .update({ stock: newStock })
              .eq('id', item.option_id)
            if (updateError) {
              stockUpdateErrors.push(`Failed to update stock for ${item.option_name}: ${updateError.message}`)
            }
          }
        }
      }
      if (stockUpdateErrors.length > 0) {
        console.warn('Stock update errors:', stockUpdateErrors)
        toast.warning(`⚠️ ${stockUpdateErrors.length} item(s) had stock update issues. Please check inventory.`)
      }
      setSubmitted(true)
      setCart([])
      setShowCart(false)
      const orderId = data?.[0]?.order_number || orderNumber
      toast.success(`✓ ${translate('order_number')} ${orderNumber} ${translate('order_sent')}`)
      setTimeout(() => {
        setIsSubmitting(false)
        window.location.replace(`/track?order=${orderId}`)
      }, 1500)
    } catch (err) {
      console.error('Exception:', err)
      toast.error(translate('error_submit'))
      setIsSubmitting(false)
    }
  }

  // ============================================================
  // CART HELPERS
  // ============================================================
  const getSubtotal = () => {
    let subtotal = 0
    cart.forEach(item => {
      if (item.is_bundle_item === true) {
        return;
      }
      const itemTotal = item.price * item.quantity
      subtotal += itemTotal
    })
    return subtotal
  }
  
  const getServiceCharge = () => getSubtotal() * (serviceChargePercent / 100)
  const getTax = () => getSubtotal() * (taxPercent / 100)
  const getGrandTotal = () => getSubtotal() + getServiceCharge() + getTax()
  const getCartItemCount = () => cart.reduce((sum, item) => sum + item.quantity, 0)

  // ============================================================
  // FILTERS
  // ============================================================
  const categoryNames = getCategoriesForMenuFnHelper()
  const filteredMenu = getFilteredMenu()
  
  // FIXED: Smaller grid for mobile
  const menuGridCols = isMobile ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(180px, 1fr))'

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
        <style>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(245,158,11,0.15);
            border-top-color: #f59e0b;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  const cartItemCount = getCartItemCount()

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div style={{ minHeight: '100vh', background: bgColor }}>
      
      {/* ===== HERO BANNER - COMPACT VERSION ===== */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
        padding: isMobile ? '12px 12px' : '24px 20px',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isMobile ? '6px' : '10px',
            flexWrap: 'wrap',
            gap: isMobile ? '4px' : '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
              {restaurantLogo ? (
                <img 
                  src={restaurantLogo}
                  alt={restaurantName}
                  style={{ 
                    height: isMobile ? '28px' : '40px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.15)',
                    padding: '4px',
                    backdropFilter: 'blur(4px)'
                  }}
                />
              ) : (
                <span style={{ fontSize: isMobile ? '20px' : '32px' }}>🏪</span>
              )}
              <div>
                <h1 style={{ 
                  margin: 0,
                  fontSize: isMobile ? '11px' : '16px',
                  fontWeight: 'bold'
                }}>
                  {restaurantName}
                </h1>
                <p style={{ 
                  margin: 0,
                  fontSize: isMobile ? '7px' : '10px',
                  opacity: 0.8
                }}>
                  {translate('scan_qr')}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={toggleDarkMode}
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: isMobile ? '4px 8px' : '6px 12px',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '10px' : '12px',
                  transition: 'all 0.2s'
                }}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button 
                onClick={() => setLanguage(language === 'bm' ? 'en' : 'bm')}
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: isMobile ? '4px 8px' : '6px 12px',
                  border: 'none',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '10px' : '12px',
                  transition: 'all 0.2s'
                }}
              >
                {language === 'bm' ? '🇺🇸' : '🇲🇾'}
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? '4px' : '8px' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '50px',
              padding: isMobile ? '2px 10px' : '4px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: isMobile ? '4px' : '8px',
              border: '1px solid rgba(255,255,255,0.15)'
            }}>
              <span style={{ fontSize: isMobile ? '12px' : '18px' }}>📋</span>
              <input 
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder={translate('table_no')}
                style={{ 
                  padding: isMobile ? '4px 0' : '8px 0',
                  width: isMobile ? '40px' : '70px',
                  textAlign: 'center',
                  border: 'none',
                  outline: 'none',
                  fontSize: isMobile ? '12px' : '16px',
                  fontWeight: 'bold',
                  background: 'transparent',
                  color: '#ffffff',
                  caretColor: '#ffffff',
                  WebkitTextFillColor: '#ffffff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                }}
              />
              <span style={{ fontSize: isMobile ? '12px' : '18px' }}>🪑</span>
            </div>
          </div>
          
          {!tableNumber && (
            <p style={{ 
              marginTop: '4px',
              fontSize: isMobile ? '8px' : '10px',
              opacity: 0.9,
              background: 'rgba(0,0,0,0.2)',
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: '30px',
              color: 'white'
            }}>
              ⚠️ {translate('enter_table')}
            </p>
          )}
        </div>
      </div>

      {/* ===== REAL-TIME INDICATOR ===== */}
      <div style={{ 
        maxWidth: '1280px',
        margin: '4px auto 0 auto',
        padding: isMobile ? '0 8px' : '0 16px',
        textAlign: 'right',
        fontSize: '8px',
        color: successColor,
        opacity: 0.7
      }}>
        <span>🔄 {translate('live')}</span>
      </div>

      {/* ===== SPECIAL MENU BANNER - COMPACT ===== */}
      {specialMenuEnabled && specialMenuItems.length > 0 && (
        <div style={{ maxWidth: '1280px', margin: '8px auto', padding: isMobile ? '0 8px' : '0 16px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            borderRadius: isMobile ? '10px' : '14px',
            padding: isMobile ? '8px 10px' : '12px 18px',
            border: `2px solid ${accentColor}`,
            boxShadow: '0 2px 12px rgba(245,158,11,0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', position: 'relative' }}>
              <span style={{ fontSize: isMobile ? '14px' : '22px' }}>⭐</span>
              <h2 style={{ 
                margin: 0,
                color: '#92400e',
                fontSize: isMobile ? '11px' : '16px',
                fontWeight: 'bold'
              }}>
                {specialMenuTitle}
              </h2>
              <span style={{ 
                background: dangerColor,
                color: 'white',
                padding: '1px 8px',
                borderRadius: '20px',
                fontSize: isMobile ? '7px' : '9px',
                fontWeight: 'bold',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}>
                🔥 HOT
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', position: 'relative' }}>
              {specialMenuItems.slice(0, isMobile ? 4 : 8).map((item, idx) => {
                const hasSizeOptions = item.has_options === true
                const hasAddons = item.has_addons === true
                const isAdding = addingItem === `special_${item.id}`
                
                return (
                  <div 
                    key={idx}
                    style={{ 
                      background: 'white',
                      borderRadius: '50px',
                      padding: isMobile ? '3px 8px' : '6px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '4px' : '6px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                      border: (hasSizeOptions || hasAddons) ? `1px solid ${accentColor}` : 'none',
                      cursor: (hasSizeOptions || hasAddons) ? 'pointer' : 'default',
                      transition: 'transform 0.2s'
                    }}
                  >
                    {item.image_url ? (
                      <img 
                        src={item.image_url}
                        alt={item.name}
                        style={{ 
                          width: isMobile ? '18px' : '28px',
                          height: isMobile ? '18px' : '28px',
                          borderRadius: '4px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: isMobile ? '12px' : '16px' }}>⭐</span>
                    )}
                    <span style={{ 
                      fontWeight: 'bold',
                      fontSize: isMobile ? '9px' : '12px',
                      color: '#1e293b'
                    }}>
                      {item.name}
                    </span>
                    
                    {hasSizeOptions && (
                      <span style={{ 
                        color: accentColor,
                        fontWeight: 'bold',
                        fontSize: isMobile ? '7px' : '9px',
                        background: '#fef3c7',
                        padding: '1px 6px',
                        borderRadius: '20px'
                      }}>
                        📏
                      </span>
                    )}
                    {hasAddons && (
                      <span style={{ 
                        color: '#8b5cf6',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '7px' : '9px',
                        background: '#f3e8ff',
                        padding: '1px 6px',
                        borderRadius: '20px'
                      }}>
                        ✨
                      </span>
                    )}
                    {!hasSizeOptions && !hasAddons && (
                      <span style={{ 
                        color: successColor,
                        fontWeight: 'bold',
                        background: '#dcfce7',
                        padding: '1px 6px',
                        borderRadius: '20px',
                        fontSize: isMobile ? '8px' : '10px'
                      }}>
                        RM {item.price}
                      </span>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        if ((hasSizeOptions || hasAddons) && item.menu_id) {
                          if (hasSizeOptions) {
                            loadMenuOptions(item.menu_id).then(options => {
                              if (options && options.length > 0) {
                                setSelectedSizeItem({ ...item, id: item.menu_id, price: item.price })
                                setMenuOptions(options)
                                if (hasAddons) {
                                  loadAddons(item.menu_id).then(() => {
                                    setShowAddonModal(true)
                                  })
                                } else {
                                  setShowSizeModal(true)
                                }
                              }
                            })
                          } else if (hasAddons) {
                            loadAddons(item.menu_id).then(() => {
                              setSelectedSizeItem({ ...item, id: item.menu_id, price: item.price })
                              setMenuOptions([])
                              setShowAddonModal(true)
                            })
                          }
                        } else {
                          addSpecialToCart(item)
                        }
                      }}
                      style={{ 
                        background: isAdding ? successColor : ((hasSizeOptions || hasAddons) ? accentColor : successColor),
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        padding: isMobile ? '2px 6px' : '4px 10px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: isMobile ? '8px' : '9px',
                        transition: 'all 0.2s'
                      }}
                    >
                      {isAdding ? '✓' : ((hasSizeOptions || hasAddons) ? '📏' : '+')}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== PROMO BANNER - COMPACT ===== */}
      {activePromos.length > 0 && (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 8px' : '0 16px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: isMobile ? '10px' : '14px',
            padding: isMobile ? '6px 10px' : '12px 18px',
            boxShadow: '0 2px 12px rgba(139,92,246,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: isMobile ? '12px' : '20px' }}>🏷️</span>
              <span style={{ 
                fontWeight: 'bold',
                color: 'white',
                fontSize: isMobile ? '10px' : '13px'
              }}>
                {translate('promotions')}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {activePromos.slice(0, isMobile ? 1 : 2).map(promo => {
                let displayName = promo.name
                const genericNames = ['Promo', 'Promosi', 'Promotion', 'Bundle', 'Set Menu']
                if (genericNames.includes(displayName) || displayName.includes('Promo')) {
                  if (promo.bundle_items && promo.bundle_items.length > 0) {
                    displayName = promo.bundle_items.map(i => i.name).join(' + ')
                  } else if (promo.trigger_items && promo.free_items) {
                    displayName = `${promo.trigger_items[0]?.name} + FREE ${promo.free_items[0]?.name}`
                  }
                }
                return (
                  <div key={promo.id} style={{ 
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    padding: isMobile ? '3px 8px' : '6px 12px'
                  }}>
                    <div style={{ 
                      fontWeight: 'bold',
                      color: 'white',
                      fontSize: isMobile ? '9px' : '12px',
                      wordBreak: 'break-word'
                    }}>
                      {displayName}
                    </div>
                    {promo.type === 'bogo' && (
                      <div style={{ 
                        fontSize: isMobile ? '8px' : '10px',
                        color: 'rgba(255,255,255,0.9)',
                        marginTop: '1px'
                      }}>
                        🎁 {translate('buy')} <strong>{promo.trigger_items?.[0]?.name || 'item'}</strong> {translate('get_free')} <strong>{promo.free_items?.[0]?.name || 'item'}</strong> {translate('free')}!
                      </div>
                    )}
                    {(promo.type === 'set_menu' || promo.type === 'bundle') && (
                      <div style={{ 
                        fontSize: isMobile ? '8px' : '10px',
                        color: 'rgba(255,255,255,0.9)',
                        marginTop: '1px'
                      }}>
                        🍽️ <strong>{promo.bundle_items?.map(i => i.name).join(' + ')}</strong> — {translate('only')} <strong>RM {promo.bundle_price}</strong>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== SEARCH BAR - COMPACT ===== */}
      <div style={{ maxWidth: '1280px', margin: '8px auto', padding: isMobile ? '0 8px' : '0 16px' }}>
        <div style={{ 
          ...glassEffect,
          borderRadius: '50px',
          padding: isMobile ? '4px 12px' : '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '6px' : '10px'
        }}>
          <span style={{ fontSize: isMobile ? '12px' : '16px', color: textMuted }}>🔍</span>
          <input
            type="text"
            placeholder={translate('search_menu') || 'Cari menu...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: isMobile ? '4px 0' : '8px 0',
              border: 'none',
              background: 'transparent',
              color: textColor,
              fontSize: isMobile ? '11px' : '13px',
              outline: 'none',
              fontWeight: '500'
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
                fontSize: '14px',
                padding: '2px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ===== CATEGORY FILTERS - COMPACT ===== */}
      <div style={{ maxWidth: '1280px', margin: '8px auto', padding: isMobile ? '0 8px' : '0 16px' }}>
        <div style={{ 
          display: 'flex',
          gap: '4px',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
        }}>
          {categoryNames.map(cat => {
            const icon = getCategoryIcon(cat)
            const isActive = selectedCategory === cat
            const getCategoryCount = () => {
              if (cat === 'All') return menu.length
              if (cat === '🔥 Promosi') return promoItems.length
              const cleanCat = cleanCategoryName(cat)
              return menu.filter(item => cleanCategoryName(item.category) === cleanCat).length
            }
            const count = getCategoryCount()
            return (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{ 
                  padding: isMobile ? '4px 10px' : '6px 16px',
                  background: isActive ? `linear-gradient(135deg, ${accentColor}, #d97706)` : (darkMode ? 'rgba(255,255,255,0.05)' : 'white'),
                  color: isActive ? 'white' : textColor,
                  border: isActive ? 'none' : `1px solid ${borderColor}`,
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: isActive ? 'bold' : '500',
                  fontSize: isMobile ? '9px' : '12px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 10px rgba(245,158,11,0.25)' : 'none',
                  flexShrink: 0
                }}
              >
                {icon} {cat}
                <span style={{
                  marginLeft: '3px',
                  fontSize: '7px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== MENU GRID - COMPACT ===== */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 8px 80px 8px' : '0 16px 100px 16px' }}>
        {filteredMenu.length === 0 ? (
          <div style={{ 
            textAlign: 'center',
            padding: isMobile ? '30px 16px' : '40px 20px',
            ...glassEffect,
            borderRadius: '16px'
          }}>
            <span style={{ fontSize: isMobile ? '32px' : '48px', opacity: 0.5 }}>🍽️</span>
            <p style={{ color: textMuted, marginTop: '8px', fontSize: isMobile ? '11px' : '13px' }}>
              {translate('no_menu_category')}
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: menuGridCols,
            gap: isMobile ? '10px' : '16px'
          }}>
            {filteredMenu.map(item => {
              const isPromoItem = item.type === 'set_menu' || item.type === 'bundle' || item.type === 'bogo'
              const hasDrinkOptions = !isPromoItem && drinkOptions[item.name] && drinkOptions[item.name].length > 0
              const hasImage = item.image_url && item.image_url.trim() !== ''
              const panasPrice = hasDrinkOptions ? drinkOptions[item.name]?.find(o => o.type === 'Panas')?.price : null
              const sejukPrice = hasDrinkOptions ? drinkOptions[item.name]?.find(o => o.type === 'Sejuk')?.price : null
              const bungkusPrice = hasDrinkOptions ? drinkOptions[item.name]?.find(o => o.type === 'Bungkus')?.price : null
              const isAdding = addingItem === item.id
              const isClicked = clickedItemId === item.id
              const hasSizeOptions = item.has_options === true
              const hasAddons = item.has_addons === true
              const hasDescription = item.description && item.description.trim() !== ''
              
              const bundleInCart = getBundlePromoForCart(cart)
              const isInBundle = bundleInCart && bundleInCart.bundleItems.some(i => {
                const normalised = normalisePromoItem(i)
                return normalised?.id === item.id || normalised?.name === item.name
              })
              
              const promo = getItemPromotion(item)
              const promoPrice = getPromoPrice(item)
              const hasPromo = promo !== null && promoPrice !== null
              
              let displayPrice = item.price
              let displayOriginalPrice = null
              let hasDiscount = false
              let savings = 0
              let promoLabel = ''
              
              if (bundleInCart && isInBundle) {
                const allItemsInCart = bundleInCart.bundleItems.every(i => {
                  const normalised = normalisePromoItem(i)
                  return cart.some(c => {
                    if (c.id === normalised?.id) return true
                    if (c.menu_id === normalised?.id) return true
                    if (c.original_id === normalised?.id) return true
                    if (c.name?.toLowerCase() === normalised?.name?.toLowerCase()) return true
                    return false
                  })
                })
                if (allItemsInCart) {
                  const bundleItemCount = bundleInCart.bundleItems.length
                  const perItemPrice = bundleInCart.bundlePrice / bundleItemCount
                  displayPrice = perItemPrice
                  displayOriginalPrice = item.price
                  hasDiscount = true
                  savings = bundleInCart.savings || 0
                  promoLabel = '📦'
                }
              }
              
              if (!hasDiscount && hasPromo) {
                displayPrice = promoPrice
                displayOriginalPrice = item.price
                hasDiscount = true
                savings = item.price - promoPrice
                promoLabel = promo?.type === 'bogo' ? '🎁' : '🔥'
              }
              
              return (
                <div 
                  key={item.id}
                  style={{ 
                    ...glassEffect,
                    borderRadius: isMobile ? '12px' : '18px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    transform: isClicked ? 'scale(0.95)' : 'scale(1)',
                    border: isClicked ? `2px solid ${successColor}` : (hasDiscount ? `1px solid ${promoColor}` : (isPromoItem ? `1px solid #8b5cf6` : 'none')),
                    boxShadow: hasDiscount ? '0 2px 12px rgba(239,68,68,0.12)' : (isPromoItem ? '0 2px 12px rgba(139,92,246,0.12)' : '0 2px 8px rgba(0,0,0,0.04)')
                  }}
                  onClick={() => {
                    setClickedItemId(item.id)
                    setTimeout(() => setClickedItemId(null), 250)
                    if (isPromoItem) addPromoToCart(item)
                    else addToCart(item)
                  }}
                >
                  {/* IMAGE - SMALLER */}
                  <div style={{ 
                    background: isPromoItem ? '#f3e8ff' : (hasDiscount ? '#fef2f2' : (darkMode ? '#1a1a2e' : '#fef3c7')),
                    padding: isMobile ? '12px' : '20px',
                    textAlign: 'center',
                    position: 'relative',
                    minHeight: isMobile ? '100px' : '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {hasDiscount && (
                      <div style={{ 
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        fontSize: isMobile ? '7px' : '9px',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                        zIndex: 5,
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}>
                        {promoLabel}
                      </div>
                    )}
                    {isPromoItem && (
                      <div style={{ 
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: 'white',
                        fontSize: isMobile ? '7px' : '9px',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                        zIndex: 5
                      }}>
                        🔥
                      </div>
                    )}
                    {hasSizeOptions && (
                      <div style={{ 
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: accentColor,
                        color: 'white',
                        fontSize: isMobile ? '7px' : '9px',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
                        zIndex: 5
                      }}>
                        📏
                      </div>
                    )}
                    {hasAddons && (
                      <div style={{ 
                        position: 'absolute',
                        top: '4px',
                        left: hasSizeOptions ? '32px' : '4px',
                        background: '#8b5cf6',
                        color: 'white',
                        fontSize: isMobile ? '7px' : '9px',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
                        zIndex: 5
                      }}>
                        ✨
                      </div>
                    )}
                    {hasImage ? (
                      <img 
                        src={item.image_url}
                        alt={item.name}
                        style={{ 
                          width: isMobile ? '80px' : '120px',
                          height: isMobile ? '80px' : '120px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = `<span style="font-size:${isMobile ? '36px' : '56px'}">${isPromoItem ? '🏷️' : getDefaultIcon(item.category)}</span>`
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: isMobile ? '36px' : '56px' }}>
                        {isPromoItem ? '🏷️' : getDefaultIcon(item.category)}
                      </span>
                    )}
                  </div>
                  
                  {/* CONTENT - COMPACT */}
                  <div style={{ padding: isMobile ? '8px 8px' : '12px 16px', textAlign: 'center' }}>
                    <h3 style={{ 
                      margin: '0 0 2px 0',
                      fontSize: isMobile ? '11px' : '15px',
                      fontWeight: 'bold',
                      color: textColor,
                      wordBreak: 'break-word'
                    }}>
                      {item.name}
                    </h3>
                    
                    {isPromoItem && item.items && item.items.length > 0 && (
                      <div style={{ 
                        fontSize: isMobile ? '7px' : '10px',
                        color: textMuted,
                        marginBottom: '2px',
                        background: 'rgba(139,92,246,0.06)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: `1px solid rgba(139,92,246,0.1)`
                      }}>
                        {item.items.map((subItem, idx) => (
                          <span key={subItem.id || idx}>
                            {subItem.name}
                            {idx < item.items.length - 1 && ' + '}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {hasDescription && !isPromoItem && (
                      <div style={{ 
                        fontSize: isMobile ? '7px' : '10px',
                        color: textMuted,
                        fontStyle: 'italic',
                        marginBottom: '2px',
                        background: darkMode ? 'rgba(255,255,255,0.05)' : secondaryBg,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: `1px solid ${borderColor}`,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        📝 {item.description}
                      </div>
                    )}
                    
                    {isPromoItem && item.original_price ? (
                      <div style={{ marginBottom: '2px' }}>
                        <span style={{ 
                          fontSize: isMobile ? '8px' : '10px',
                          color: '#94a3b8',
                          textDecoration: 'line-through',
                          marginRight: '4px'
                        }}>
                          RM {item.original_price.toFixed(2)}
                        </span>
                        <span style={{ 
                          fontSize: isMobile ? '12px' : '16px',
                          fontWeight: 'bold',
                          color: '#8b5cf6'
                        }}>
                          RM {item.price.toFixed(2)}
                        </span>
                      </div>
                    ) : !isPromoItem && (
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        marginBottom: '2px',
                        flexWrap: 'wrap'
                      }}>
                        {hasDiscount ? (
                          <>
                            <span style={{ 
                              fontSize: isMobile ? '12px' : '18px',
                              fontWeight: 'bold',
                              color: promoColor,
                              background: 'rgba(239,68,68,0.08)',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              RM {displayPrice.toFixed(2)}
                            </span>
                            <span style={{ 
                              fontSize: isMobile ? '8px' : '12px',
                              color: textMuted,
                              textDecoration: 'line-through'
                            }}>
                              RM {displayOriginalPrice?.toFixed(2) || item.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span style={{ 
                            fontSize: isMobile ? '12px' : '18px',
                            fontWeight: 'bold',
                            color: successColor
                          }}>
                            RM {item.price?.toFixed(2)}
                          </span>
                        )}
                        
                        {(hasAddons || hasSizeOptions) && (
                          <span style={{
                            background: hasAddons ? '#8b5cf6' : '#f59e0b',
                            color: 'white',
                            padding: '1px 6px',
                            borderRadius: '20px',
                            fontSize: isMobile ? '7px' : '9px',
                            fontWeight: 'bold'
                          }}>
                            {hasAddons ? '✨' : '📏'}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {hasDrinkOptions ? (
                      <div style={{ 
                        marginBottom: '2px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '2px'
                      }}>
                        {panasPrice && (
                          <span style={{ 
                            color: '#f97316',
                            fontSize: isMobile ? '7px' : '10px',
                            fontWeight: 'bold'
                          }}>
                            🔥 RM {panasPrice?.toFixed(2)}
                          </span>
                        )}
                        {sejukPrice && (
                          <span style={{ 
                            color: '#06b6d4',
                            fontSize: isMobile ? '7px' : '10px',
                            fontWeight: 'bold'
                          }}>
                            🧊 RM {sejukPrice?.toFixed(2)}
                          </span>
                        )}
                        {bungkusPrice && (
                          <span style={{ 
                            color: '#8b5cf6',
                            fontSize: isMobile ? '7px' : '10px',
                            fontWeight: 'bold'
                          }}>
                            📦 RM {bungkusPrice?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ) : null}
                    
                    <div style={{ 
                      width: '100%',
                      padding: isMobile ? '4px' : '8px',
                      background: isAdding ? successColor : (isPromoItem ? '#8b5cf6' : (hasDiscount ? promoColor : (hasSizeOptions || hasAddons ? accentColor : accentColor))),
                      color: 'white',
                      borderRadius: '30px',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '9px' : '13px',
                      transition: 'all 0.2s'
                    }}>
                      {isAdding ? '✓' : (isPromoItem ? '🏷️' : ((hasSizeOptions || hasAddons) ? '📏' : '+'))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ===== FLOATING CART BUTTON - COMPACT ===== */}
      {cartItemCount > 0 && (
        <button 
          onClick={() => setShowCart(true)}
          style={{ 
            position: 'fixed',
            bottom: isMobile ? '12px' : '20px',
            right: isMobile ? '10px' : '16px',
            background: `linear-gradient(135deg, ${accentColor}, #d97706)`,
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: isMobile ? '10px 14px' : '14px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '6px' : '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
            zIndex: 9999,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: isMobile ? '11px' : '16px',
            fontWeight: 'bold',
            animation: 'float 2s ease-in-out infinite'
          }}
        >
          🛒
          <span>RM {getGrandTotal().toFixed(2)}</span>
          <span style={{ 
            background: dangerColor,
            color: 'white',
            borderRadius: '50%',
            padding: isMobile ? '1px 6px' : '2px 10px',
            fontSize: isMobile ? '9px' : '12px',
            fontWeight: 'bold'
          }}>
            {cartItemCount}
          </span>
        </button>
      )}

      {/* ===== CART DRAWER - COMPACT ===== */}
      {showCart && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: isMobile ? '100%' : '380px',
          background: cardBg,
          boxShadow: '-4px 0 30px rgba(0,0,0,0.25)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease'
        }}>
          
          {/* HEADER - COMPACT */}
          <div style={{ 
            padding: isMobile ? '10px 12px' : '14px 18px',
            borderBottom: `1px solid ${borderColor}`,
            background: `linear-gradient(135deg, ${accentColor}, #d97706)`,
            color: 'white',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: isMobile ? '13px' : '16px', color: 'white' }}>
                  🛒 {translate('your_order')}
                </h2>
                <span style={{ fontSize: isMobile ? '9px' : '11px', opacity: 0.9 }}>
                  {cartItemCount} {translate('items')} • RM {getGrandTotal().toFixed(2)}
                </span>
              </div>
              <button 
                onClick={() => setShowCart(false)}
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* BODY - COMPACT */}
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '8px' : '12px'
          }}>
            {cart.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: textMuted, 
                padding: '30px 16px',
                fontSize: isMobile ? '11px' : '13px'
              }}>
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🛒</span>
                {translate('empty_cart_msg')}
              </div>
            ) : (
              <>
                {(() => {
                  const bundleInCart = getBundlePromoForCart(cart)
                  if (bundleInCart) {
                    return (
                      <div style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: 'white',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontWeight: 'bold', fontSize: isMobile ? '10px' : '12px' }}>
                          📦 {bundleInCart.bundleItems.map(i => i.name).join(' + ')}
                        </div>
                        <div style={{ fontSize: isMobile ? '9px' : '11px', marginTop: '2px' }}>
                          RM {bundleInCart.bundlePrice.toFixed(2)} 
                          <span style={{ textDecoration: 'line-through', opacity: 0.7, marginLeft: '6px' }}>
                            RM {bundleInCart.totalOriginalPrice.toFixed(2)}
                          </span>
                          <span style={{ 
                            background: '#22c55e', 
                            padding: '1px 8px', 
                            borderRadius: '20px', 
                            fontSize: isMobile ? '7px' : '9px',
                            marginLeft: '6px'
                          }}>
                            Jimat RM {bundleInCart.savings.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
                
                {cart.map(item => {
                  const isBundleItem = item.isBundleItem || false
                  const isPromoItem = item.is_promo_item || false
                  
                  return (
                    <div key={item.id} style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      background: isBundleItem ? 'rgba(139,92,246,0.05)' : 'transparent',
                      border: isBundleItem ? `1px solid rgba(139,92,246,0.12)` : `1px solid ${borderColor}`,
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: 'bold',
                          fontSize: isMobile ? '10px' : '12px',
                          color: textColor,
                          wordBreak: 'break-word'
                        }}>
                          {item.name}
                          {item.is_free && <span style={{ color: successColor, fontSize: '8px', marginLeft: '3px' }}>🎁</span>}
                          {isBundleItem && <span style={{ color: '#8b5cf6', fontSize: '8px', marginLeft: '3px' }}>📦</span>}
                          {item.option_name && (
                            <span style={{ color: accentColor, fontSize: '8px', marginLeft: '3px' }}>({item.option_name})</span>
                          )}
                          {item.addons && (
                            <div style={{ fontSize: '7px', color: '#8b5cf6', fontWeight: 'normal', marginTop: '1px' }}>
                              ✨ {item.addons}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: isMobile ? '8px' : '9px', color: textMuted }}>
                          RM {item.price.toFixed(2)}
                        </div>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '3px',
                        background: secondaryBg,
                        borderRadius: '30px',
                        padding: '2px',
                        border: `1px solid ${borderColor}`,
                        flexShrink: 0
                      }}>
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          style={{ 
                            width: isMobile ? '22px' : '26px',
                            height: isMobile ? '22px' : '26px',
                            borderRadius: '50%',
                            background: darkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '12px' : '14px',
                            color: textColor,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          −
                        </button>
                        <span style={{ 
                          minWidth: '18px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: isMobile ? '12px' : '14px',
                          color: textColor
                        }}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          style={{ 
                            width: isMobile ? '22px' : '26px',
                            height: isMobile ? '22px' : '26px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${accentColor}, #d97706)`,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: isMobile ? '12px' : '14px',
                            color: 'white',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                      </div>
                      
                      <span style={{ 
                        fontWeight: 'bold',
                        color: successColor,
                        fontSize: isMobile ? '10px' : '12px',
                        minWidth: '50px',
                        textAlign: 'right',
                        flexShrink: 0
                      }}>
                        RM {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
                
                {/* CUSTOMER DETAILS - COMPACT */}
                <div style={{ marginTop: '8px' }}>
                  <input 
                    type="text"
                    placeholder={translate('your_name')}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ 
                      width: '100%',
                      padding: isMobile ? '6px 10px' : '10px',
                      marginBottom: '4px',
                      borderRadius: '10px',
                      border: `1px solid ${borderColor}`,
                      outline: 'none',
                      fontSize: isMobile ? '11px' : '13px',
                      color: textColor,
                      background: inputBg
                    }}
                  />
                  <input 
                    type="tel"
                    placeholder={translate('phone_optional')}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{ 
                      width: '100%',
                      padding: isMobile ? '6px 10px' : '10px',
                      marginBottom: '4px',
                      borderRadius: '10px',
                      border: `1px solid ${borderColor}`,
                      outline: 'none',
                      fontSize: isMobile ? '11px' : '13px',
                      color: textColor,
                      background: inputBg
                    }}
                  />
                  <textarea 
                    placeholder={translate('special_notes')}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="1"
                    style={{ 
                      width: '100%',
                      padding: isMobile ? '6px 10px' : '10px',
                      marginBottom: '4px',
                      borderRadius: '10px',
                      border: `1px solid ${borderColor}`,
                      outline: 'none',
                      fontFamily: 'inherit',
                      fontSize: isMobile ? '11px' : '13px',
                      color: textColor,
                      background: inputBg,
                      resize: 'vertical'
                    }}
                  />
                </div>
              </>
            )}
          </div>
          
          {/* FOOTER - COMPACT */}
          <div style={{ 
            padding: isMobile ? '10px 12px' : '14px 18px',
            borderTop: `1px solid ${borderColor}`,
            background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.02)',
            flexShrink: 0
          }}>
            {cart.length > 0 && (
              <div style={{ 
                background: secondaryBg,
                borderRadius: '10px',
                padding: '6px 10px',
                marginBottom: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile ? '9px' : '11px', color: textMuted }}>
                  <span>{translate('subtotal')}</span>
                  <span>RM {getSubtotal().toFixed(2)}</span>
                </div>
                {serviceChargePercent > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile ? '9px' : '11px', color: textMuted }}>
                    <span>{translate('service')} ({serviceChargePercent}%)</span>
                    <span>RM {getServiceCharge().toFixed(2)}</span>
                  </div>
                )}
                {taxPercent > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: isMobile ? '9px' : '11px', color: textMuted }}>
                    <span>{translate('tax')} ({taxPercent}%)</span>
                    <span>RM {getTax().toFixed(2)}</span>
                  </div>
                )}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: 'bold', 
                  fontSize: isMobile ? '13px' : '15px',
                  color: textColor,
                  borderTop: `1px solid ${borderColor}`,
                  paddingTop: '4px',
                  marginTop: '2px'
                }}>
                  <span>{translate('total')}</span>
                  <span style={{ color: successColor }}>RM {getGrandTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => setShowCart(false)}
                style={{ 
                  flex: 1,
                  padding: isMobile ? '8px' : '10px',
                  background: darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '10px' : '12px'
                }}
              >
                ✕ {translate('close')}
              </button>
              
              <button 
                onClick={handlePlaceOrder}
                disabled={!tableNumber || cart.length === 0 || isSubmitting}
                style={{ 
                  flex: 2,
                  padding: isMobile ? '8px' : '10px',
                  background: (!tableNumber || cart.length === 0 || isSubmitting) ? '#cbd5e1' : `linear-gradient(135deg, ${accentColor}, #d97706)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: (!tableNumber || cart.length === 0 || isSubmitting) ? 'not-allowed' : 'pointer',
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: 'bold',
                  boxShadow: (!tableNumber || cart.length === 0 || isSubmitting) ? 'none' : '0 2px 12px rgba(245,158,11,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                {isSubmitting ? (
                  '⏳...'
                ) : !tableNumber ? (
                  `📋 ${translate('table_required')}`
                ) : cart.length === 0 ? (
                  '🛒 Kosong'
                ) : (
                  `📋 ${translate('place_order')}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRMATION MODAL - COMPACT ===== */}
      {showConfirmModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          background: 'rgba(0,0,0,0.85)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 11000,
          animation: 'fadeIn 0.2s ease',
          padding: '12px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowConfirmModal(false)
          }
        }}
        >
          <div style={{ 
            background: cardBg,
            borderRadius: '20px',
            padding: isMobile ? '16px' : '24px',
            maxWidth: '360px',
            width: '90%',
            textAlign: 'center',
            ...glassEffect,
            animation: 'popIn 0.3s ease',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowConfirmModal(false)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                color: textMuted,
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            
            <div style={{ 
              width: isMobile ? '36px' : '48px',
              height: isMobile ? '36px' : '48px',
              background: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px auto'
            }}>
              <span style={{ fontSize: isMobile ? '18px' : '24px' }}>📋</span>
            </div>
            
            <h2 style={{ 
              marginBottom: '4px',
              fontSize: isMobile ? '15px' : '20px',
              fontWeight: 'bold',
              color: textColor
            }}>
              {translate('confirm_order')}
            </h2>
            
            <p style={{ 
              color: textMuted,
              marginBottom: '12px',
              fontSize: isMobile ? '10px' : '12px'
            }}>
              {translate('review_order')}
            </p>
            
            <div style={{ 
              background: secondaryBg,
              borderRadius: '10px',
              padding: isMobile ? '8px' : '12px',
              marginBottom: '12px',
              textAlign: 'left'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '2px',
                fontSize: isMobile ? '10px' : '12px',
                color: textColor
              }}>
                <span style={{ color: textMuted }}>{translate('table')}:</span>
                <span style={{ fontWeight: 'bold' }}>{tableNumber}</span>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: isMobile ? '10px' : '12px',
                color: textColor
              }}>
                <span style={{ color: textMuted }}>{translate('customer')}:</span>
                <span style={{ fontWeight: 'bold' }}>{customerName || translate('guest')}</span>
              </div>
            </div>
            
            <div style={{ 
              background: '#fef3c7',
              borderRadius: '10px',
              padding: isMobile ? '8px' : '12px',
              marginBottom: '14px'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                fontSize: isMobile ? '13px' : '16px',
                color: '#1e293b'
              }}>
                <span>{translate('total_amount')}:</span>
                <span style={{ color: successColor }}>RM {getGrandTotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => { 
                  setShowConfirmModal(false)
                  setShowCart(true)
                }}
                style={{ 
                  flex: 1,
                  padding: isMobile ? '8px' : '10px',
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '10px' : '12px'
                }}
              >
                {translate('back')}
              </button>
              
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{ 
                  flex: 1,
                  padding: isMobile ? '8px' : '10px',
                  background: 'transparent',
                  color: '#64748b',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: 'bold'
                }}
              >
                {translate('close')}
              </button>
              
              <button 
                onClick={submitOrderConfirmed}
                disabled={isSubmitting}
                style={{ 
                  flex: 2,
                  padding: isMobile ? '8px' : '10px',
                  background: isSubmitting ? '#94a3b8' : `linear-gradient(135deg, ${successColor}, #16a34a)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '10px' : '12px',
                  boxShadow: isSubmitting ? 'none' : '0 2px 12px rgba(34,197,94,0.3)'
                }}
              >
                {isSubmitting ? '⏳...' : translate('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODALS (SIZE, ADD-ON, DRINK) - COMPACT VERSIONS */}
      {/* ========================================================== */}
      
      {/* SIZE OPTIONS MODAL - COMPACT */}
      {showSizeModal && selectedSizeItem && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 2000, animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ 
            background: cardBg,
            borderRadius: '20px',
            padding: isMobile ? '16px' : '24px',
            maxWidth: '340px',
            width: '90%',
            textAlign: 'center',
            ...glassEffect,
            animation: 'popIn 0.3s ease'
          }}>
            <h2 style={{ 
              marginBottom: '4px',
              fontSize: isMobile ? '15px' : '20px',
              fontWeight: 'bold',
              color: textColor
            }}>
              {selectedSizeItem.name}
            </h2>
            <p style={{ 
              color: textMuted,
              marginBottom: '12px',
              fontSize: isMobile ? '10px' : '12px'
            }}>
              {translate('choose_size')}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {menuOptions.map(opt => {
                const finalPrice = opt.is_absolute_price 
                  ? opt.price_adjustment
                  : (selectedSizeItem.price + opt.price_adjustment)
                const isOutOfStock = (opt.stock || 0) <= 0
                const isLowStock = (opt.stock || 0) > 0 && (opt.stock || 0) <= 5
                
                return (
                  <button 
                    key={opt.id}
                    onClick={() => {
                      if (!isOutOfStock) {
                        addToCartWithOption(selectedSizeItem, opt)
                      } else {
                        toast.error(`❌ "${opt.option_name}" ${translate('out_of_stock')}`)
                      }
                    }}
                    style={{ 
                      padding: isMobile ? '8px 12px' : '10px 16px',
                      background: isOutOfStock 
                        ? '#e2e8f0' 
                        : `linear-gradient(135deg, ${accentColor}, #d97706)`,
                      color: isOutOfStock ? '#94a3b8' : 'white',
                      border: isOutOfStock ? `1px solid ${dangerColor}` : 'none',
                      borderRadius: '40px',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: isMobile ? '11px' : '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: isOutOfStock ? 0.6 : 1,
                      position: 'relative'
                    }}
                    disabled={isOutOfStock}
                  >
                    <span>
                      {opt.option_name}
                      {isLowStock && !isOutOfStock && (
                        <span style={{ 
                          marginLeft: '6px',
                          fontSize: '8px',
                          background: '#f59e0b',
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '12px'
                        }}>
                          ⚠️ {opt.stock}
                        </span>
                      )}
                      {isOutOfStock && (
                        <span style={{ 
                          marginLeft: '6px',
                          fontSize: '8px',
                          background: dangerColor,
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '12px'
                        }}>
                          ❌
                        </span>
                      )}
                    </span>
                    <span>RM {finalPrice.toFixed(2)}</span>
                  </button>
                )
              })}
            </div>
            
            <button 
              onClick={() => setShowSizeModal(false)}
              style={{ 
                width: '100%',
                padding: isMobile ? '8px' : '10px',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '11px' : '13px'
              }}
            >
              ❌ {translate('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ADD-ON MODAL - COMPACT */}
      {showAddonModal && selectedSizeItem && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 2000, animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ 
            background: cardBg,
            borderRadius: '20px',
            padding: isMobile ? '16px' : '24px',
            maxWidth: '340px',
            width: '90%',
            textAlign: 'center',
            ...glassEffect,
            animation: 'popIn 0.3s ease',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              marginBottom: '2px',
              fontSize: isMobile ? '15px' : '20px',
              fontWeight: 'bold',
              color: textColor
            }}>
              {selectedSizeItem.name}
            </h2>
            
            {(() => {
              const selectedSize = menuOptions.find(opt => opt.id === selectedSizeItem?.selectedOptionId)
              const basePrice = selectedSize 
                ? (selectedSize.is_absolute_price ? selectedSize.price_adjustment : selectedSizeItem.price + selectedSize.price_adjustment)
                : selectedSizeItem.price
              
              return (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                  padding: '6px 12px',
                  background: secondaryBg,
                  borderRadius: '10px',
                  border: `1px solid ${borderColor}`
                }}>
                  <span style={{ 
                    fontSize: isMobile ? '18px' : '24px',
                    fontWeight: 'bold',
                    color: priceColor
                  }}>
                    RM {basePrice.toFixed(2)}
                  </span>
                  {menuAddons.length > 0 && (
                    <span style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      padding: '2px 10px',
                      borderRadius: '20px',
                      fontSize: isMobile ? '8px' : '10px',
                      fontWeight: 'bold'
                    }}>
                      ✨ {translate('addons')}
                    </span>
                  )}
                </div>
              )
            })()}
            
            {/* Size Options */}
            {menuOptions.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ color: textColor, fontWeight: 'bold', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                  📏 {translate('select_size')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {menuOptions.map(opt => {
                    const isOutOfStock = (opt.stock || 0) <= 0
                    const finalPrice = opt.is_absolute_price 
                      ? opt.price_adjustment
                      : (selectedSizeItem.price + opt.price_adjustment)
                    const isSelected = selectedSizeItem?.selectedOptionId === opt.id
                    
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedSizeItem({ ...selectedSizeItem, selectedOptionId: opt.id })
                          }
                        }}
                        disabled={isOutOfStock}
                        style={{
                          padding: '6px 12px',
                          background: isOutOfStock ? '#e2e8f0' : (isSelected ? 'rgba(59,130,246,0.15)' : secondaryBg),
                          border: isOutOfStock ? `1px solid ${dangerColor}` : (isSelected ? `1px solid ${primaryColor}` : `1px solid ${borderColor}`),
                          borderRadius: '10px',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: isOutOfStock ? 0.6 : 1,
                          color: textColor,
                          fontSize: isMobile ? '10px' : '12px'
                        }}
                      >
                        <span style={{ fontWeight: 'bold' }}>{opt.option_name}</span>
                        <span style={{ color: priceColor, fontWeight: 'bold' }}>RM {finalPrice.toFixed(2)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Add-On Options */}
            {menuAddons.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ 
                  color: textColor, 
                  fontWeight: 'bold', 
                  fontSize: '11px', 
                  display: 'block', 
                  marginBottom: '4px' 
                }}>
                  ✨ {translate('addons')} {translate('addon_optional')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {menuAddons.map(addon => {
                    const isSelected = selectedAddons.includes(addon.id)
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        style={{
                          padding: '6px 12px',
                          background: isSelected ? 'rgba(34,197,94,0.12)' : secondaryBg,
                          border: isSelected ? `1px solid ${successColor}` : `1px solid ${borderColor}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s',
                          color: textColor,
                          fontSize: isMobile ? '10px' : '12px'
                        }}
                      >
                        <span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
                          {addon.name}
                          {isSelected && (
                            <span style={{ 
                              fontSize: '8px', 
                              color: successColor, 
                              marginLeft: '3px',
                              fontWeight: 'bold'
                            }}>
                              ✓
                            </span>
                          )}
                        </span>
                        <span style={{ 
                          color: isSelected ? priceColor : textMuted, 
                          fontWeight: isSelected ? 'bold' : 'normal',
                          fontSize: '11px'
                        }}>
                          +RM {parseFloat(addon.price).toFixed(2)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Total Breakdown */}
            {(() => {
              const selectedSize = menuOptions.find(opt => opt.id === selectedSizeItem?.selectedOptionId)
              const basePrice = selectedSize 
                ? (selectedSize.is_absolute_price ? selectedSize.price_adjustment : selectedSizeItem.price + selectedSize.price_adjustment)
                : selectedSizeItem.price
              const addonTotal = getAddonTotal()
              const finalPrice = basePrice + addonTotal
              
              return (
                <div style={{ 
                  padding: '8px 12px',
                  background: secondaryBg,
                  borderRadius: '10px',
                  marginBottom: '10px',
                  border: `1px solid ${borderColor}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: textColor, fontSize: '11px', padding: '1px 0' }}>
                    <span>{translate('base_price')}:</span>
                    <span style={{ fontWeight: 'bold' }}>RM {basePrice.toFixed(2)}</span>
                  </div>
                  {addonTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: textColor, fontSize: '11px', padding: '1px 0' }}>
                      <span style={{ color: '#8b5cf6' }}>✨ {translate('addons')}:</span>
                      <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>+RM {addonTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ 
                    borderTop: `1px solid ${borderColor}`,
                    marginTop: '4px',
                    paddingTop: '4px',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontWeight: 'bold', 
                    fontSize: '13px',
                    color: textColor
                  }}>
                    <span>{translate('total')}:</span>
                    <span style={{ color: successColor }}>RM {finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )
            })()}
            
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => {
                  const selectedSize = menuOptions.find(opt => opt.id === selectedSizeItem?.selectedOptionId)
                  const basePrice = selectedSize 
                    ? (selectedSize.is_absolute_price ? selectedSize.price_adjustment : selectedSizeItem.price + selectedSize.price_adjustment)
                    : selectedSizeItem.price
                  const addonTotal = getAddonTotal()
                  const finalPrice = basePrice + addonTotal
                  const addonNames = getAddonNames()
                  
                  const cartItem = {
                    id: `${selectedSizeItem.id}_${selectedSize?.id || ''}_${Date.now()}`,
                    menu_id: selectedSizeItem.id,
                    original_id: selectedSizeItem.id,
                    name: selectedSizeItem.name,
                    display_name: selectedSizeItem.name,
                    price: finalPrice,
                    basePrice: basePrice,
                    quantity: 1,
                    option_name: selectedSize?.option_name || null,
                    option_id: selectedSize?.id || null,
                    addons: addonNames,
                    addon_ids: [...selectedAddons],
                    addon_total: addonTotal,
                    category: selectedSizeItem.category || 'Makanan'
                  }
                  
                  setCart([...cart, cartItem])
                  setShowAddonModal(false)
                  setSelectedSizeItem(null)
                  setSelectedAddons([])
                  setMenuAddons([])
                  setShowCart(true)
                  toast.success(`✓ ${selectedSizeItem.name} ${translate('added')}`)
                }}
                style={{
                  flex: 2,
                  padding: isMobile ? '8px' : '10px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '10px' : '12px'
                }}
              >
                🛒 {translate('add_to_cart')}
              </button>
              <button
                onClick={() => {
                  setShowAddonModal(false)
                  setSelectedSizeItem(null)
                  setSelectedAddons([])
                  setMenuAddons([])
                }}
                style={{
                  flex: 1,
                  padding: isMobile ? '8px' : '10px',
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '10px' : '12px'
                }}
              >
                {translate('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRINK OPTIONS MODAL - COMPACT */}
      {showDrinkModal && selectedDrink && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 2000, animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ 
            background: cardBg,
            borderRadius: '20px',
            padding: isMobile ? '16px' : '24px',
            maxWidth: '340px',
            width: '90%',
            textAlign: 'center',
            ...glassEffect,
            animation: 'popIn 0.3s ease'
          }}>
            <h2 style={{ 
              marginBottom: '4px',
              fontSize: isMobile ? '15px' : '20px',
              fontWeight: 'bold',
              color: textColor
            }}>
              🥤 {selectedDrink.name}
            </h2>
            <p style={{ 
              color: textMuted,
              marginBottom: '12px',
              fontSize: isMobile ? '10px' : '12px'
            }}>
              {translate('drink_type')}
            </p>
            
            {selectedDrinkPreviewImage && (
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'12px' }}>
                <img
                  src={selectedDrinkPreviewImage}
                  alt={selectedDrink.name}
                  style={{ width:isMobile ? '100px' : '140px', height:isMobile ? '100px' : '140px', objectFit:'cover', borderRadius:'16px', boxShadow:'0 8px 20px rgba(37,99,235,0.18)' }}
                />
              </div>
            )}

            <div style={{ 
              display: 'flex',
              gap: '6px',
              marginBottom: '14px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {drinkOptions[selectedDrink.name]?.some(o => o.type === 'Panas' || o.option_type === 'Panas') && (
                <button 
                  onClick={() => setSelectedOption('Panas')}
                  style={{ 
                    flex: 1,
                    minWidth: isMobile ? '60px' : '80px',
                    padding: isMobile ? '8px' : '10px',
                    background: selectedOption === 'Panas' ? 'linear-gradient(135deg, #f97316, #ea580c)' : secondaryBg,
                    color: selectedOption === 'Panas' ? 'white' : textColor,
                    border: selectedOption === 'Panas' ? 'none' : `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '9px' : '12px'
                  }}
                >
                  🔥 {translate('hot')}
                  <br />
                  <small>RM {drinkOptions[selectedDrink.name]?.find(o => o.type === 'Panas' || o.option_type === 'Panas')?.price?.toFixed(2) || '0.00'}</small>
                </button>
              )}
              
              {drinkOptions[selectedDrink.name]?.some(o => o.type === 'Sejuk' || o.option_type === 'Sejuk') && (
                <button 
                  onClick={() => setSelectedOption('Sejuk')}
                  style={{ 
                    flex: 1,
                    minWidth: isMobile ? '60px' : '80px',
                    padding: isMobile ? '8px' : '10px',
                    background: selectedOption === 'Sejuk' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : secondaryBg,
                    color: selectedOption === 'Sejuk' ? 'white' : textColor,
                    border: selectedOption === 'Sejuk' ? 'none' : `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '9px' : '12px'
                  }}
                >
                  🧊 {translate('cold')}
                  <br />
                  <small>RM {drinkOptions[selectedDrink.name]?.find(o => o.type === 'Sejuk' || o.option_type === 'Sejuk')?.price?.toFixed(2) || '0.00'}</small>
                </button>
              )}
              
              {drinkOptions[selectedDrink.name]?.some(o => o.type === 'Bungkus' || o.option_type === 'Bungkus') && (
                <button 
                  onClick={() => setSelectedOption('Bungkus')}
                  style={{ 
                    flex: 1,
                    minWidth: isMobile ? '60px' : '80px',
                    padding: isMobile ? '8px' : '10px',
                    background: selectedOption === 'Bungkus' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : secondaryBg,
                    color: selectedOption === 'Bungkus' ? 'white' : textColor,
                    border: selectedOption === 'Bungkus' ? 'none' : `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: isMobile ? '9px' : '12px'
                  }}
                >
                  📦 {translate('bungkus')}
                  <br />
                  <small>RM {drinkOptions[selectedDrink.name]?.find(o => o.type === 'Bungkus' || o.option_type === 'Bungkus')?.price?.toFixed(2) || '0.00'}</small>
                </button>
              )}
            </div>
            
            <button 
              onClick={addDrinkToCart}
              style={{ 
                width: '100%',
                padding: isMobile ? '8px' : '10px',
                background: `linear-gradient(135deg, ${successColor}, #16a34a)`,
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '6px',
                fontSize: isMobile ? '11px' : '13px'
              }}
            >
              {translate('add_to_cart')}
            </button>
            <button 
              onClick={() => setShowDrinkModal(false)}
              style={{ 
                width: '100%',
                padding: isMobile ? '8px' : '10px',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '40px',
                cursor: 'pointer',
                fontSize: isMobile ? '11px' : '13px'
              }}
            >
              {translate('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* STYLES */}
      {/* ========================================================== */}
      <style>
        {`
          @keyframes slideIn { 
            from { transform: translateX(100%); } 
            to { transform: translateX(0); } 
          }
          
          @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
          }
          
          @keyframes popIn { 
            0% { opacity: 0; transform: scale(0.9) translateY(10px); } 
            100% { opacity: 1; transform: scale(1) translateY(0); } 
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          ::-webkit-scrollbar { 
            width: 4px; 
            height: 4px; 
          }
          
          ::-webkit-scrollbar-track { 
            background: ${darkMode ? '#1a1a2e' : '#e2e8f0'}; 
            border-radius: 10px; 
          }
          
          ::-webkit-scrollbar-thumb { 
            background: ${darkMode ? '#3d3d5c' : '#94a3b8'}; 
            border-radius: 10px; 
          }
          
          button, input, textarea, select { 
            transition: all 0.2s ease; 
          }
          
          button:hover:not(:disabled) { 
            opacity: 0.85; 
            transform: scale(0.96); 
          }
          
          input:focus, textarea:focus { 
            outline: none; 
            border-color: ${accentColor};
            box-shadow: 0 0 0 2px rgba(245,158,11,0.1);
          }
        `}
      </style>
    </div>
  )
}

export default CustomerMenu