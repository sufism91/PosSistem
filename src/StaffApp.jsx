import { useState, useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabase'
import toast from 'react-hot-toast'

function StaffApp() {
  const { darkMode } = useTheme()
  const { language } = useLanguage()
  
  // ===== TRANSLATIONS =====
  const translations = {
    pos_title: { en: 'Point of Sale', ms: 'Tempat Jualan' },
    pos_subtitle: { en: 'Take orders and manage payments', ms: 'Ambil pesanan dan urus pembayaran' },
    table_service: { en: 'Table Service', ms: 'Perkhidmatan Meja' },
    take_away: { en: 'Take Away', ms: 'Bungkus' },
    add_order: { en: 'Add Order', ms: 'Tambah Pesanan' },
    clear_cart: { en: 'Clear Cart', ms: 'Kosongkan Keranjang' },
    checkout: { en: 'Checkout', ms: 'Bayar' },
    cancel: { en: 'Cancel', ms: 'Batal' },
    confirm: { en: 'Confirm', ms: 'Sahkan' },
    print_receipt: { en: 'Print Receipt', ms: 'Cetak Resit' },
    customer_name: { en: 'Customer Name', ms: 'Nama Pelanggan' },
    table_number: { en: 'Table Number', ms: 'Nombor Meja' },
    select_table: { en: 'Select Table', ms: 'Pilih Meja' },
    order_items: { en: 'Order Items', ms: 'Item Pesanan' },
    total: { en: 'Total', ms: 'Jumlah' },
    quantity: { en: 'Qty', ms: 'Kuantiti' },
    price: { en: 'Price', ms: 'Harga' },
    notes: { en: 'Notes', ms: 'Nota' },
    special_request: { en: 'Special Request', ms: 'Permintaan Khas' },
    select_option: { en: 'Select Option', ms: 'Pilih Pilihan' },
    hot: { en: 'Hot', ms: 'Panas' },
    cold: { en: 'Cold', ms: 'Sejuk' },
    packed: { en: 'Packed', ms: 'Bungkus' },
    select_size: { en: 'Select Size', ms: 'Pilih Saiz' },
    promo: { en: '🔥 Promo', ms: '🔥 Promosi' },
    bogo: { en: 'Buy 1 Free 1', ms: 'Beli 1 Percuma 1' },
    free: { en: 'FREE', ms: 'PERCUMA' },
    original_price: { en: 'Original', ms: 'Asal' },
    promo_price: { en: 'Promo Price', ms: 'Harga Promosi' },
    order_added: { en: 'Order added!', ms: 'Pesanan ditambah!' },
    order_updated: { en: 'Order updated!', ms: 'Pesanan dikemaskini!' },
    order_cancelled: { en: 'Order cancelled', ms: 'Pesanan dibatalkan' },
    payment_success: { en: 'Payment successful!', ms: 'Pembayaran berjaya!' },
    please_select_item: { en: 'Please select an item', ms: 'Sila pilih item' },
    please_select_option: { en: 'Please select an option', ms: 'Sila pilih pilihan' },
    cart_empty: { en: 'Cart is empty', ms: 'Keranjang kosong' },
    confirm_clear_cart: { en: 'Clear cart?', ms: 'Kosongkan keranjang?' },
  }

  const t = (key) => {
    if (!translations[key]) return key
    return language === 'en' ? translations[key].en : translations[key].ms
  }

  // ===== STATE =====
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [promotions, setPromotions] = useState([])
  const [drinkOptions, setDrinkOptions] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedOption, setSelectedOption] = useState('')
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [orderType, setOrderType] = useState('dine_in')
  const [showItemModal, setShowItemModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [menuOptions, setMenuOptions] = useState([])

  // ===== CHECK MOBILE =====
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ===== THEME COLORS =====
  const bgColor = darkMode ? '#0a0a16' : '#f1f5f9'
  const cardBg = darkMode ? 'rgba(20, 20, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const textColor = darkMode ? '#e8edf5' : '#1e293b'
  const textMuted = darkMode ? '#94a3b8' : '#64748b'
  const borderColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.5)'
  const priceColor = darkMode ? '#4ade80' : '#22c55e'
  const promoColor = '#ef4444'
  const secondaryBg = darkMode ? 'rgba(30, 30, 50, 0.6)' : 'rgba(248, 250, 252, 0.8)'
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
  // LOAD DATA
  // ============================================================
  useEffect(() => {
    loadAllData()
    
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
        () => { 
          console.log('🔄 Drink options changed, reloading...')
          loadDrinkOptions() 
        }
      )
      .subscribe()
    
    const promoSub = supabase
      .channel('staff_promo')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'promotions' },
        () => { loadPromotions() }
      )
      .subscribe()
    
    return () => {
      menuSub.unsubscribe()
      drinkSub.unsubscribe()
      promoSub.unsubscribe()
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
    console.log('✅ All data loaded! Drink options:', drinkOptions.length)
  }

  async function loadCategories() {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')
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
      console.log('🍹 Drink options loaded:', data?.length || 0, 'options')
      console.log('📋 Data:', data)
    } catch (err) {
      console.error('Error loading drink options:', err)
      setDrinkOptions([])
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

  // ===== PROMOTION HELPERS =====
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
    
    // Check drink option price FIRST
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
    
    // Check promotion
    const promoPrice = getPromoPrice(item)
    if (promoPrice !== null && promoPrice !== undefined) {
      basePrice = promoPrice
    }
    
    // Add size price adjustment
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
  function getDrinkOptionsForItem(item) {
    if (!item) return []
    const options = drinkOptions.filter(opt => opt.drink_name === item.name)
    return options
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

  // ===== HELPERS =====
  const getCategories = () => {
    return ['All', ...categories.map(c => c.name)]
  }

  const getFilteredMenu = () => {
    let filtered = [...menu]
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filtered
  }

  const isDrinkCategory = (category) => {
    const drinkCategories = ['Minuman', 'Jus', 'Teh', 'Kopi', 'Air', 'Milo', 'Nescafe', 'Teh Tarik']
    return drinkCategories.some(cat => category?.includes(cat))
  }

  const isSizeCategory = (item) => {
    return item?.has_options === true
  }

  // ===== CART FUNCTIONS =====
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
    toast.success(isFree ? `🎁 ${selectedItem.name} FREE!` : t('order_added'))
  }

  const removeFromCart = (index) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const clearCart = () => {
    if (cart.length === 0) {
      toast.error(t('cart_empty'))
      return
    }
    if (window.confirm(t('confirm_clear_cart'))) {
      setCart([])
      toast.success(t('order_cancelled'))
    }
  }

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return
    const newCart = [...cart]
    newCart[index].quantity = newQuantity
    newCart[index].subtotal = newCart[index].price * newQuantity
    setCart(newCart)
  }

  // ===== CHECKOUT =====
  const handleCheckout = async () => {
  if (cart.length === 0) {
    toast.error(t('cart_empty'))
    return
  }

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
  
  const orderData = {
    items: cart.map(item => ({
      name: item.name,
      category: item.category,
      option: item.option,
      size: item.size,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
      isFree: item.isFree,
      promoType: item.promoType,
      promoName: item.promoName
    })),
    total: total,
    customer_name: customerName || 'Guest',
    table_number: orderType === 'dine_in' ? parseInt(tableNumber) || null : 0,  // 👈 FIX
    order_type: orderType,
    status: 'pending',
    payment_status: 'unpaid',
    notes: cart.map(item => item.notes).filter(n => n).join(', ')
  }

  try {
    const { data, error } = await supabase
      .from('customer_orders')
      .insert([orderData])
      .select()
      .single()

    if (error) throw error

    toast.success(t('payment_success'))
    setCart([])
    setCustomerName('')
    setTableNumber('')
    
    if (data) {
      setTimeout(() => {
        printReceipt(data)
      }, 500)
    }

  } catch (err) {
    console.error('Checkout error:', err)
    toast.error(err.message)
  }
}

  // ===== PRINT RECEIPT =====
  const printReceipt = (order) => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; padding: 20px; background: white; color: black; }
          .receipt { max-width: 320px; margin: 0 auto; font-size: 12px; }
          .header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; }
          .header h1 { font-size: 18px; }
          .header .sub { font-size: 11px; color: #666; }
          .divider { border-top: 1px dashed #ccc; margin: 8px 0; }
          .items { width: 100%; margin: 8px 0; border-collapse: collapse; }
          .items th, .items td { text-align: left; padding: 4px 0; font-size: 12px; }
          .items th:last-child, .items td:last-child { text-align: right; }
          .items th { border-bottom: 1px solid #ccc; font-size: 11px; color: #666; }
          .total-row { font-size: 16px; font-weight: bold; color: #22c55e; }
          .footer { text-align: center; margin-top: 12px; border-top: 1px dashed #ccc; padding-top: 10px; font-size: 11px; color: #666; }
          .free-label { color: #ef4444; font-weight: bold; }
          .promo-label { color: #ef4444; font-size: 10px; }
          .option-label { font-size: 10px; color: #666; }
          @media print { body { margin: 0; padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>${order.customer_name || 'Guest'}</h1>
            <div class="sub">${order.order_type === 'take_away' ? '🥡 Take Away' : '🍽️ Table ' + (order.table_number || '')}</div>
            <div class="sub">${new Date(order.created_at).toLocaleString()}</div>
          </div>
          
          <table class="items">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>
                    ${item.isFree ? '🎁 ' : ''}${item.name}
                    ${item.option ? `<div class="option-label">${item.option}</div>` : ''}
                    ${item.size ? `<div class="option-label">${item.size}</div>` : ''}
                    ${item.isFree ? `<div class="free-label">FREE</div>` : ''}
                    ${item.promoName ? `<div class="promo-label">🔥 ${item.promoName}</div>` : ''}
                  </td>
                  <td style="text-align:center">${item.quantity}</td>
                  <td style="text-align:right">${item.isFree ? 'FREE' : `RM ${(item.price * item.quantity).toFixed(2)}`}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:bold;padding:4px 0;">
            <span>TOTAL</span>
            <span style="color:#22c55e">RM ${order.total.toFixed(2)}</span>
          </div>
          
          <div class="footer">
            <div>⭐ ⭐ ⭐ ⭐ ⭐</div>
            <div>Thank you!</div>
          </div>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 300);
          }
        <\/script>
      </body>
      </html>
    `
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(receiptContent)
    printWindow.document.close()
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
          
          {/* Image with objectFit cover */}
          {selectedItem.image_url ? (
            <img 
              src={selectedItem.image_url} 
              alt={selectedItem.name}
              style={{
                width: '100%',
                height: '150px',
                objectFit: 'cover',
                borderRadius: '16px',
                marginBottom: '16px'
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
              marginBottom: '16px'
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
          
          {/* Promotion Badge */}
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
              {getItemPromotion(selectedItem)?.type === 'bogo' ? '🎁 BOGO' : '🔥 PROMO'}
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
          
          {/* DRINK OPTIONS */}
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
                        <div style={{ fontSize: isMobile ? '18px' : '22px' }}>
                          {getOptionEmoji(opt.option_type)}
                        </div>
                        <div>{getOptionLabel(opt.option_type)}</div>
                        <div style={{ 
                          fontSize: isMobile ? '11px' : '12px', 
                          color: isSelected ? 'rgba(255,255,255,0.9)' : (isFree ? promoColor : priceColor),
                          fontWeight: 'bold'
                        }}>
                          {isFree ? 'FREE' : `RM ${price.toFixed(2)}`}
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
                    ⚠️ No drink options available. Please add options in Manage Menu.
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Size Options */}
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
                        {isFree ? 'FREE' : `RM ${price.toFixed(2)}`}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Quantity */}
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
          
          {/* Notes */}
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
              placeholder={t('special_request')}
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
          
          {/* BOGO Info */}
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
          
          {/* Buttons */}
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

  return (
    <Sidebar>
      <div style={{
        padding: isMobile ? '12px' : '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        background: bgColor,
        minHeight: '100vh'
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
            <button
              onClick={() => setOrderType('dine_in')}
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                background: orderType === 'dine_in' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : secondaryBg,
                color: orderType === 'dine_in' ? 'white' : textColor,
                border: orderType === 'dine_in' ? 'none' : `1px solid ${borderColor}`,
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '11px' : '13px',
                transition: 'all 0.2s'
              }}
            >
              🍽️ {t('table_service')}
            </button>
            <button
              onClick={() => setOrderType('take_away')}
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                background: orderType === 'take_away' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : secondaryBg,
                color: orderType === 'take_away' ? 'white' : textColor,
                border: orderType === 'take_away' ? 'none' : `1px solid ${borderColor}`,
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '11px' : '13px',
                transition: 'all 0.2s'
              }}
            >
              🥡 {t('take_away')}
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
              placeholder="Guest"
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
            placeholder="Search menu..."
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
              {cat === 'All' ? '📋 All' : cat}
            </button>
          ))}
        </div>
        
        {/* ===== MENU GRID ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: isMobile ? '10px' : '14px',
          marginBottom: isMobile ? '160px' : '0px'
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
                {/* Promo Badge */}
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
                     promo.type === 'set_menu' ? '🍽️ Set' : '🔥 Promo'}
                  </div>
                )}
                
                {/* Drink Options Indicator */}
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
                
                {/* Image with objectFit cover */}
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: isMobile ? '80px' : '100px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      marginBottom: '8px'
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
                
                {/* Price with Promo */}
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
                
                {/* Size indicator */}
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
        
        {/* ===== CART BOTTOM BAR ===== */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: isMobile ? 0 : '260px',
          right: 0,
          background: cardBg,
          borderTop: `1px solid ${borderColor}`,
          padding: isMobile ? '12px 16px' : '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          zIndex: 100,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              fontWeight: 'bold',
              color: textColor,
              fontSize: isMobile ? '14px' : '16px'
            }}>
              🛒 {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
            <span style={{
              fontWeight: 'bold',
              color: priceColor,
              fontSize: isMobile ? '16px' : '20px'
            }}>
              RM {totalCart.toFixed(2)}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={clearCart}
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '11px' : '13px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🗑️ {t('clear_cart')}
            </button>
            <button
              onClick={handleCheckout}
              style={{
                padding: isMobile ? '8px 16px' : '10px 20px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: isMobile ? '11px' : '13px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(34,197,94,0.3)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(0.97)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(34,197,94,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(34,197,94,0.3)'
              }}
            >
              💳 {t('checkout')}
            </button>
          </div>
        </div>
        
        {/* ITEM MODAL */}
        {showItemModal && renderItemModal()}
        
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
          `}
        </style>
      </div>
    </Sidebar>
  )
}

export default StaffApp