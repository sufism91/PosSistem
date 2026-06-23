import { useState, useEffect } from 'react'
import { useTheme } from './context/ThemeContext'
import { useLanguage } from './context/LanguageContext'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabase'
import { ORDER_STATUS, PAYMENT_STATUS, normalizeOrderForInsert, normalizeConfirmedUpdate } from './lib/orderWorkflow'
import toast from 'react-hot-toast'

function StaffApp() {
  const { darkMode } = useTheme()
  const { language } = useLanguage()
  
  // ===== SIMPLE TRANSLATIONS =====
  const t = (key) => {
    const translations = {
      pos_title: { en: 'Point of Sale', ms: 'Tempat Jualan' },
      new_order: { en: '➕ New Order', ms: '➕ Pesanan Baru' },
      new_orders_title: { en: '🆕 New Orders', ms: '🆕 Pesanan Baru' },
      unpaid_orders: { en: '💰 Unpaid', ms: '💰 Belum Bayar' },
      history_orders: { en: '📜 History', ms: '📜 Sejarah' },
      clear_cart: { en: '🗑️ Clear Cart', ms: '🗑️ Kosongkan Keranjang' },
      checkout: { en: '💳 Checkout', ms: '💳 Bayar' },
      confirm_order: { en: 'Confirm', ms: 'Sahkan' },
      cancel: { en: 'Cancel', ms: 'Batal' },
      mark_paid: { en: '💰 Mark as Paid', ms: '💰 Tanda Bayar' },
      print_receipt: { en: '🖨️ Print', ms: '🖨️ Cetak' },
      back: { en: 'Back', ms: 'Kembali' },
      view_order: { en: 'View', ms: 'Lihat' },
      search_menu: { en: '🔍 Search...', ms: '🔍 Cari...' },
      all_categories: { en: '📋 All', ms: '📋 Semua' },
      customer_name: { en: 'Customer', ms: 'Pelanggan' },
      table_number: { en: 'Table', ms: 'Meja' },
      dine_in: { en: 'Dine In', ms: 'Makan di Sini' },
      take_away: { en: 'Take Away', ms: 'Bungkus' },
      add_order: { en: 'Add', ms: 'Tambah' },
      total: { en: 'Total', ms: 'Jumlah' },
      items: { en: 'items', ms: 'item' },
      guest: { en: 'Guest', ms: 'Tetamu' },
      free: { en: 'FREE', ms: 'PERCUMA' },
      promo: { en: '🔥 Promo', ms: '🔥 Promosi' },
      hot: { en: 'Hot', ms: 'Panas' },
      cold: { en: 'Cold', ms: 'Sejuk' },
      packed: { en: 'Packed', ms: 'Bungkus' },
      table: { en: 'Table', ms: 'Meja' },
      quantity: { en: 'Qty', ms: 'Kuantiti' },
      notes: { en: 'Notes', ms: 'Nota' },
      select_option: { en: 'Select Option', ms: 'Pilih Pilihan' },
      no_new_orders: { en: 'No new orders', ms: 'Tiada pesanan baru' },
      no_unpaid_orders: { en: 'No unpaid orders', ms: 'Tiada pesanan belum bayar' },
      no_history_orders: { en: 'No history', ms: 'Tiada sejarah' },
      order_added: { en: '✅ Added!', ms: '✅ Ditambah!' },
      cart_empty: { en: 'Cart is empty', ms: 'Keranjang kosong' },
      order_cancelled: { en: 'Cancelled', ms: 'Dibatalkan' },
      order_confirmed_kitchen: { en: '✅ Confirmed!', ms: '✅ Disahkan!' },
      order_paid_history: { en: '✅ Paid!', ms: '✅ Dibayar!' },
      error_checkout: { en: 'Error', ms: 'Ralat' },
      new_order_started: { en: 'New order started', ms: 'Pesanan baru dimulakan' },
    }
    return language === 'en' ? translations[key]?.en || key : translations[key]?.ms || key
  }

  // ===== STATE =====
  const [menu, setMenu] = useState([])
  const [categories, setCategories] = useState([])
  const [drinkOptions, setDrinkOptions] = useState([])
  const [cart, setCart] = useState([])
  const [unpaidOrders, setUnpaidOrders] = useState([])
  const [newOrders, setNewOrders] = useState([])
  const [orderHistory, setOrderHistory] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedOption, setSelectedOption] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [orderType, setOrderType] = useState('dine_in')
  const [showItemModal, setShowItemModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showUnpaidOrders, setShowUnpaidOrders] = useState(false)
  const [showNewOrders, setShowNewOrders] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [viewingOrder, setViewingOrder] = useState(null)

  // ===== CHECK MOBILE =====
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ===== THEME COLORS =====
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

  // ===== LOAD DATA =====
  useEffect(() => {
    loadAllData()
    loadUnpaidOrders()
    loadNewOrders()
    loadOrderHistory()
  }, [])

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
    } catch (err) { console.error(err) }
  }

  async function loadMenu() {
    try {
      const { data } = await supabase.from('menu').select('*').order('sort_order')
      setMenu(data || [])
    } catch (err) { console.error(err) }
  }

  async function loadDrinkOptions() {
    try {
      const { data } = await supabase.from('drink_options').select('*')
      setDrinkOptions(data || [])
    } catch (err) { console.error(err) }
  }

  async function loadUnpaidOrders() {
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', 'unpaid')
        .order('created_at', { ascending: false })
      setUnpaidOrders(data || [])
    } catch (err) { console.error(err) }
  }

  async function loadNewOrders() {
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', 'unpaid')
        .eq('order_status', 'pending')
        .order('created_at', { ascending: false })
      setNewOrders(data || [])
    } catch (err) { console.error(err) }
  }

  async function loadOrderHistory() {
    try {
      const { data } = await supabase
        .from('customer_orders')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(100)
      setOrderHistory(data || [])
    } catch (err) { console.error(err) }
  }

  // ===== HELPERS =====
  const getCategories = () => ['All', ...categories.map(c => c.name)]
  
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
    const drinkCats = ['Minuman', 'Jus', 'Teh', 'Kopi', 'Air', 'Milo', 'Nescafe']
    return drinkCats.some(c => category?.includes(c))
  }

  const getDrinkOptionsForItem = (item) => {
    if (!item) return []
    return drinkOptions.filter(opt => 
      opt.drink_name?.toLowerCase() === item.name?.toLowerCase()
    )
  }

  const getItemPrice = (item, option) => {
    let price = item?.price || 0
    if (option) {
      const opt = drinkOptions.find(d => 
        d.drink_name === item.name && d.option_type === option
      )
      if (opt && opt.price !== null) price = parseFloat(opt.price) || 0
    }
    return price
  }

  // ===== CART FUNCTIONS =====
  const addToCart = () => {
    if (!selectedItem) {
      toast.error('Pilih item dulu')
      return
    }

    const isDrink = isDrinkCategory(selectedItem.category)
    const hasOptions = getDrinkOptionsForItem(selectedItem).length > 0
    
    if (isDrink && hasOptions && !selectedOption) {
      toast.error('Sila pilih Panas/Sejuk/Bungkus')
      return
    }

    const price = getItemPrice(selectedItem, selectedOption)
    
    const cartItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      category: selectedItem.category,
      option: selectedOption || null,
      price: price,
      quantity: quantity,
      subtotal: price * quantity,
      image_url: selectedItem.image_url
    }

    const existingIndex = cart.findIndex(c => 
      c.id === cartItem.id && c.option === cartItem.option
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
    setQuantity(1)
    toast.success(t('order_added'))
  }

  const clearCart = () => {
    if (cart.length === 0) {
      toast.error(t('cart_empty'))
      return
    }
    if (window.confirm('Kosongkan keranjang?')) {
      setCart([])
      toast.success(t('order_cancelled'))
    }
  }

  // ===== CHECKOUT =====
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error(t('cart_empty'))
      return
    }

    if (orderType === 'dine_in' && !tableNumber) {
      toast.error('⚠️ Masukkan nombor meja!')
      return
    }

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
    
    const orderData = {
      items: cart.map(item => ({
        name: item.name,
        category: item.category || 'Makanan',
        option: item.option || null,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal
      })),
      total: total,
      customer_name: customerName || 'Guest',
      table_number: orderType === 'dine_in' ? parseInt(tableNumber) || null : null,
      order_type: orderType,
      status: 'pending',
      order_status: 'pending',
      payment_status: 'unpaid',
      notes: ''
    }

    try {
      const { error } = await supabase
        .from('customer_orders')
        .insert([normalizeOrderForInsert(orderData)])

      if (error) throw error

      toast.success('✅ Pesanan dihantar!')
      setCart([])
      setCustomerName('')
      setTableNumber('')
      await loadNewOrders()
      await loadUnpaidOrders()
    } catch (err) {
      console.error('Checkout error:', err)
      toast.error(t('error_checkout') + ': ' + err.message)
    }
  }

  // ===== CONFIRM / PAY =====
  const confirmNewOrder = async (order) => {
    try {
      await supabase
        .from('customer_orders')
        .update({ order_status: 'confirmed', status: 'confirmed' })
        .eq('id', order.id)
      toast.success(t('order_confirmed_kitchen'))
      await loadNewOrders()
      await loadUnpaidOrders()
    } catch (err) { toast.error(err.message) }
  }

  const cancelNewOrder = async (order) => {
    try {
      await supabase
        .from('customer_orders')
        .update({ order_status: 'cancelled', status: 'cancelled' })
        .eq('id', order.id)
      toast.success(t('order_cancelled'))
      await loadNewOrders()
    } catch (err) { toast.error(err.message) }
  }

  const markOrderAsPaid = async (order) => {
    try {
      await supabase
        .from('customer_orders')
        .update({ 
          payment_status: 'paid',
          order_status: 'completed',
          status: 'completed',
          paid_at: new Date().toISOString()
        })
        .eq('id', order.id)
      toast.success(t('order_paid_history'))
      await loadUnpaidOrders()
      await loadOrderHistory()
      setViewingOrder(null)
      setShowUnpaidOrders(false)
    } catch (err) { toast.error(err.message) }
  }

  // ===== PRINT RECEIPT =====
  const printReceipt = (order) => {
    const content = `
      <html><head><title>Receipt</title>
      <style>body{font-family:monospace;padding:20px;max-width:320px;margin:auto}
      .header{text-align:center;border-bottom:1px dashed #ccc;padding-bottom:10px}
      .items td{padding:4px 0}
      .total{font-size:18px;font-weight:bold;color:#22c55e}
      .footer{text-align:center;margin-top:12px;border-top:1px dashed #ccc;padding-top:10px}</style>
      </head><body>
      <div class="header"><h2>${order.customer_name || 'Guest'}</h2>
      <p>${order.order_type === 'take_away' ? '🥡 Take Away' : '🍽️ Table ' + (order.table_number || '')}</p>
      <p>${new Date(order.created_at).toLocaleString()}</p></div>
      <table class="items" width="100%">
      <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
      ${order.items?.map(item => `
        <tr><td>${item.name}${item.option ? ' ('+item.option+')' : ''}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">RM ${(item.price * item.quantity).toFixed(2)}</td></tr>
      `).join('')}
      </table>
      <div class="total">TOTAL: RM ${order.total.toFixed(2)}</div>
      <div class="footer">⭐ Thank you! ⭐</div>
      <script>window.onload=()=>{setTimeout(()=>{window.print();setTimeout(()=>window.close(),500)},300)}<\/script>
      </body></html>
    `
    const win = window.open('', '_blank', 'width=400,height=600')
    win.document.write(content)
    win.document.close()
  }

  // ===== MODALS =====
  const renderItemModal = () => {
    if (!selectedItem) return null
    
    const isDrink = isDrinkCategory(selectedItem.category)
    const options = getDrinkOptionsForItem(selectedItem)
    const hasOptions = options.length > 0
    const price = getItemPrice(selectedItem, selectedOption)
    
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          background: cardBg,
          padding: isMobile ? '24px' : '32px',
          borderRadius: '28px',
          maxWidth: '420px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <h2 style={{ color: textColor, fontSize: '22px', marginBottom: '8px' }}>
            {selectedItem.name}
          </h2>
          
          {isDrink && hasOptions && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: textColor, fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                {t('select_option')}:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {options.map(opt => {
                  const isSelected = selectedOption === opt.option_type
                  const optPrice = parseFloat(opt.price) || 0
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.option_type)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: isSelected ? '#3b82f6' : secondaryBg,
                        color: isSelected ? 'white' : textColor,
                        border: isSelected ? 'none' : `1px solid ${borderColor}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '24px' }}>
                        {opt.option_type === 'Panas' ? '🔥' : opt.option_type === 'Sejuk' ? '🧊' : '📦'}
                      </div>
                      <div>{opt.option_type}</div>
                      <div style={{ color: optPrice === 0 ? promoColor : priceColor }}>
                        {optPrice === 0 ? 'FREE' : `RM ${optPrice.toFixed(2)}`}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: textColor, fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              {t('quantity')}:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: '40px', height: '40px', background: secondaryBg, border: `1px solid ${borderColor}`, borderRadius: '12px', cursor: 'pointer', fontSize: '20px', color: textColor }}>
                -
              </button>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: textColor, minWidth: '40px', textAlign: 'center' }}>
                {quantity}
              </span>
              <button onClick={() => setQuantity(quantity + 1)}
                style={{ width: '40px', height: '40px', background: secondaryBg, border: `1px solid ${borderColor}`, borderRadius: '12px', cursor: 'pointer', fontSize: '20px', color: textColor }}>
                +
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={addToCart}
              style={{
                flex: 2,
                padding: '14px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '15px'
              }}>
              🛒 Add (RM {(price * quantity).toFixed(2)})
            </button>
            <button onClick={() => { setShowItemModal(false); setSelectedItem(null); setSelectedOption(''); setQuantity(1) }}
              style={{
                flex: 1,
                padding: '14px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderNewOrdersModal = () => (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000, padding:'20px' }}>
      <div style={{ background: cardBg, borderRadius:'28px', padding: isMobile ? '20px' : '28px', maxWidth:'700px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ color: textColor }}>🆕 {t('new_orders_title')} ({newOrders.length})</h2>
          <button onClick={() => setShowNewOrders(false)} style={{ background:'#ef4444', color:'white', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer' }}>✕</button>
        </div>
        {newOrders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color: textMuted }}>📭 {t('no_new_orders')}</div>
        ) : newOrders.map(order => (
          <div key={order.id} style={{ background: secondaryBg, border:`1px solid ${borderColor}`, borderRadius:'16px', padding:'16px', marginBottom:'12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
              <strong style={{ color: textColor }}>{order.customer_name || 'Guest'} {order.table_number ? `• Table ${order.table_number}` : ''}</strong>
              <span style={{ color: textMuted, fontSize:'12px' }}>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom: idx !== order.items.length-1 ? `1px solid ${borderColor}` : 'none' }}>
                <span style={{ color: textColor }}>{item.quantity}x {item.name}{item.option ? ` (${item.option})` : ''}</span>
                <span style={{ color: priceColor }}>RM {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'12px' }}>
              <strong style={{ color: priceColor, fontSize:'18px' }}>Total: RM {order.total.toFixed(2)}</strong>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={() => confirmNewOrder(order)} style={{ background:'#2563eb', color:'white', border:'none', borderRadius:'30px', padding:'8px 16px', cursor:'pointer', fontWeight:'bold' }}>✅ Confirm</button>
                <button onClick={() => cancelNewOrder(order)} style={{ background:'#ef4444', color:'white', border:'none', borderRadius:'30px', padding:'8px 16px', cursor:'pointer', fontWeight:'bold' }}>Cancel</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderUnpaidOrdersModal = () => (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000, padding:'20px' }}>
      <div style={{ background: cardBg, borderRadius:'28px', padding: isMobile ? '20px' : '28px', maxWidth:'700px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ color: textColor }}>💰 {t('unpaid_orders')} ({unpaidOrders.length})</h2>
          <button onClick={() => { setShowUnpaidOrders(false); setViewingOrder(null) }} style={{ background:'#ef4444', color:'white', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer' }}>✕</button>
        </div>
        {unpaidOrders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color: textMuted }}>📭 {t('no_unpaid_orders')}</div>
        ) : viewingOrder ? (
          <div>
            <button onClick={() => setViewingOrder(null)} style={{ background:'#64748b', color:'white', border:'none', borderRadius:'30px', padding:'6px 16px', cursor:'pointer', marginBottom:'16px' }}>← Back</button>
            <div style={{ background: secondaryBg, borderRadius:'16px', padding:'16px', marginBottom:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontWeight:'bold', color: textColor }}>👤 {viewingOrder.customer_name || 'Guest'}</span>
                <span style={{ color: textMuted }}>{viewingOrder.order_type === 'take_away' ? '🥡 Take Away' : '🍽️ Table ' + (viewingOrder.table_number || '')}</span>
              </div>
              {viewingOrder.items?.map((item, idx) => (
                <div key={idx} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom: idx !== viewingOrder.items.length-1 ? `1px solid ${borderColor}` : 'none' }}>
                  <span style={{ color: textColor }}>{item.quantity}x {item.name}{item.option ? ` (${item.option})` : ''}</span>
                  <span style={{ color: priceColor }}>RM {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop:`2px solid ${borderColor}`, marginTop:'12px', paddingTop:'12px', display:'flex', justifyContent:'space-between', fontWeight:'bold', fontSize:'18px' }}>
                <span>{t('total')}:</span>
                <span style={{ color: priceColor }}>RM {viewingOrder.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => printReceipt(viewingOrder)} style={{ flex:1, padding:'12px', background:'#0ea5e9', color:'white', border:'none', borderRadius:'40px', cursor:'pointer', fontWeight:'bold' }}>🖨️ {t('print_receipt')}</button>
              <button onClick={() => markOrderAsPaid(viewingOrder)} style={{ flex:1, padding:'12px', background:'linear-gradient(135deg, #22c55e, #16a34a)', color:'white', border:'none', borderRadius:'40px', cursor:'pointer', fontWeight:'bold' }}>💰 {t('mark_paid')}</button>
            </div>
          </div>
        ) : (
          unpaidOrders.map(order => (
            <div key={order.id} onClick={() => setViewingOrder(order)} style={{ background: secondaryBg, border:`1px solid ${borderColor}`, borderRadius:'16px', padding:'14px 16px', marginBottom:'10px', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:'bold', color: textColor }}>👤 {order.customer_name || 'Guest'}</div>
                  <div style={{ fontSize:'12px', color: textMuted }}>{order.order_type === 'take_away' ? '🥡 Take Away' : '🍽️ Table ' + (order.table_number || '-')} • {order.items?.length || 0} items</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:'bold', fontSize:'18px', color: priceColor }}>RM {order.total?.toFixed(2) || '0.00'}</div>
                  <button style={{ background:'#3b82f6', color:'white', border:'none', borderRadius:'20px', padding:'4px 14px', cursor:'pointer', fontSize:'11px', fontWeight:'bold' }}>View</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderHistoryModal = () => (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:2000, padding:'20px' }}>
      <div style={{ background: cardBg, borderRadius:'28px', padding: isMobile ? '20px' : '28px', maxWidth:'900px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ color: textColor }}>📜 {t('history_orders')} ({orderHistory.length})</h2>
          <button onClick={() => setShowHistoryModal(false)} style={{ background:'#ef4444', color:'white', border:'none', borderRadius:'50%', width:'32px', height:'32px', cursor:'pointer' }}>✕</button>
        </div>
        {orderHistory.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color: textMuted }}>📭 {t('no_history_orders')}</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background: darkMode ? 'rgba(30,30,46,0.8)' : '#f1f5f9' }}>
                  <th style={{ padding:'10px', textAlign:'left', color: textColor }}>Order</th>
                  <th style={{ padding:'10px', textAlign:'left', color: textColor }}>Customer</th>
                  <th style={{ padding:'10px', textAlign:'left', color: textColor }}>Type</th>
                  <th style={{ padding:'10px', textAlign:'left', color: textColor }}>Total</th>
                  <th style={{ padding:'10px', textAlign:'left', color: textColor }}>Date</th>
                  <th style={{ padding:'10px', textAlign:'left', color: textColor }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.slice(0, 20).map(order => (
                  <tr key={order.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <td style={{ padding:'10px', color: textColor, fontSize:'13px' }}>#{order.id.slice(0,6)}</td>
                    <td style={{ padding:'10px', color: textColor }}>{order.customer_name || 'Guest'}</td>
                    <td style={{ padding:'10px', color: textColor }}>{order.order_type === 'take_away' ? '🥡' : '🍽️'}</td>
                    <td style={{ padding:'10px', color: priceColor, fontWeight:'bold' }}>RM {order.total?.toFixed(2) || '0.00'}</td>
                    <td style={{ padding:'10px', color: textColor, fontSize:'12px' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{ padding:'10px' }}>
                      <button onClick={() => printReceipt(order)} style={{ background:'#8b5cf6', color:'white', border:'none', borderRadius:'30px', padding:'4px 14px', cursor:'pointer', fontSize:'11px', fontWeight:'bold' }}>🖨️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  // ===== LOADING =====
  if (loading) {
    return (
      <Sidebar>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background: bgColor }}>
          <div style={{ width:'40px', height:'40px', border:'3px solid rgba(59,130,246,0.15)', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        </div>
      </Sidebar>
    )
  }

  // ===== MAIN RENDER =====
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
        paddingBottom: cart.length > 0 ? (isMobile ? '100px' : '90px') : '20px',
      }}>
        
        {/* HEADER */}
        <div style={{
          background: cardBg,
          borderRadius: '24px',
          padding: isMobile ? '16px 20px' : '20px 28px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          border: `1px solid ${borderColor}`
        }}>
          <div>
            <h1 style={{ margin:0, color: textColor, fontSize: isMobile ? '20px' : '26px', fontWeight:'bold' }}>
              🧾 {t('pos_title')}
            </h1>
          </div>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            <button onClick={() => { setCart([]); setCustomerName(''); setTableNumber(''); toast(t('new_order_started')) }}
              style={{ padding: isMobile ? '8px 16px' : '10px 20px', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', border:'none', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', fontSize: isMobile ? '11px' : '13px' }}>
              {t('new_order')}
            </button>
            <button onClick={() => { setShowNewOrders(true); loadNewOrders() }}
              style={{ padding: isMobile ? '8px 16px' : '10px 20px', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'white', border:'none', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', fontSize: isMobile ? '11px' : '13px', position:'relative' }}>
              🆕 {t('new_orders_title')}
              {newOrders.length > 0 && <span style={{ position:'absolute', top:'-6px', right:'-6px', background:'#ef4444', color:'white', borderRadius:'50%', width:'20px', height:'20px', fontSize:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>{newOrders.length}</span>}
            </button>
            <button onClick={() => { setShowUnpaidOrders(true); setViewingOrder(null); loadUnpaidOrders() }}
              style={{ padding: isMobile ? '8px 16px' : '10px 20px', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'white', border:'none', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', fontSize: isMobile ? '11px' : '13px', position:'relative' }}>
              {t('unpaid_orders')}
              {unpaidOrders.length > 0 && <span style={{ position:'absolute', top:'-6px', right:'-6px', background:'#ef4444', color:'white', borderRadius:'50%', width:'20px', height:'20px', fontSize:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>{unpaidOrders.length}</span>}
            </button>
            <button onClick={() => { setShowHistoryModal(true); loadOrderHistory() }}
              style={{ padding: isMobile ? '8px 16px' : '10px 20px', background:'linear-gradient(135deg,#6c757d,#495057)', color:'white', border:'none', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', fontSize: isMobile ? '11px' : '13px' }}>
              📜 {t('history_orders')}
            </button>
          </div>
        </div>
        
        {/* ORDER TYPE */}
        <div style={{
          background: cardBg,
          borderRadius: '16px',
          padding: isMobile ? '12px 16px' : '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          border: `1px solid ${borderColor}`
        }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display:'block', fontWeight:'bold', color: textColor, fontSize: isMobile ? '11px' : '12px', marginBottom:'4px' }}>👤 {t('customer_name')}</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t('guest')}
              style={{ width:'100%', padding: isMobile ? '8px 12px' : '10px 14px', borderRadius:'10px', border:`1px solid ${inputBorder}`, background:inputBg, color:textColor, fontSize: isMobile ? '13px' : '14px', outline:'none' }} />
          </div>
          {orderType === 'dine_in' && (
            <div style={{ flex: 1, minWidth: '100px' }}>
              <label style={{ display:'block', fontWeight:'bold', color: textColor, fontSize: isMobile ? '11px' : '12px', marginBottom:'4px' }}>🪑 {t('table_number')}</label>
              <input type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="1"
                style={{ width:'100%', padding: isMobile ? '8px 12px' : '10px 14px', borderRadius:'10px', border:`1px solid ${inputBorder}`, background:inputBg, color:textColor, fontSize: isMobile ? '13px' : '14px', outline:'none' }} />
            </div>
          )}
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <button onClick={() => setOrderType('dine_in')} style={{ padding:'6px 14px', background: orderType === 'dine_in' ? '#3b82f6' : 'transparent', color: orderType === 'dine_in' ? 'white' : textColor, border: orderType === 'dine_in' ? 'none' : `1px solid ${borderColor}`, borderRadius:'30px', cursor:'pointer' }}>🍽️ {t('dine_in')}</button>
            <button onClick={() => setOrderType('take_away')} style={{ padding:'6px 14px', background: orderType === 'take_away' ? '#3b82f6' : 'transparent', color: orderType === 'take_away' ? 'white' : textColor, border: orderType === 'take_away' ? 'none' : `1px solid ${borderColor}`, borderRadius:'30px', cursor:'pointer' }}>🥡 {t('take_away')}</button>
          </div>
        </div>
        
        {/* SEARCH */}
        <div style={{
          background: cardBg,
          borderRadius: '60px',
          padding: '4px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${borderColor}`
        }}>
          <span style={{ fontSize:'18px', marginRight:'12px', color: textMuted }}>🔍</span>
          <input type="text" placeholder={t('search_menu')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width:'100%', padding: isMobile ? '10px 0' : '12px 0', border:'none', background:'transparent', color:textColor, fontSize: isMobile ? '13px' : '14px', outline:'none' }} />
        </div>
        
        {/* CATEGORIES */}
        <div style={{ display:'flex', gap:'8px', overflowX:'auto', marginBottom:'16px', paddingBottom:'4px' }}>
          {getCategories().map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ padding: isMobile ? '6px 14px' : '8px 20px', background: selectedCategory === cat ? '#3b82f6' : 'transparent', color: selectedCategory === cat ? 'white' : textColor, border: selectedCategory === cat ? 'none' : `1px solid ${borderColor}`, borderRadius:'30px', cursor:'pointer', fontWeight: selectedCategory === cat ? 'bold' : 'normal', fontSize: isMobile ? '11px' : '13px', whiteSpace:'nowrap' }}>
              {cat === 'All' ? '📋 All' : cat}
            </button>
          ))}
        </div>
        
        {/* MENU GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: isMobile ? '10px' : '14px',
          marginBottom: '10px'
        }}>
          {filteredMenu.map(item => {
            const isDrink = isDrinkCategory(item.category)
            const hasOptions = getDrinkOptionsForItem(item).length > 0
            
            return (
              <div key={item.id} onClick={() => { setSelectedItem(item); setSelectedOption(''); setQuantity(1); setShowItemModal(true) }}
                style={{
                  background: cardBg,
                  borderRadius: '16px',
                  padding: isMobile ? '12px' : '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: `1px solid ${borderColor}`,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name}
                    style={{ width:'100%', height: isMobile ? '70px' : '90px', objectFit:'contain', borderRadius:'12px', marginBottom:'8px', background:'white', padding:'4px' }}
                    onError={e => e.currentTarget.style.display = 'none'} />
                ) : (
                  <div style={{ fontSize: isMobile ? '36px' : '44px', marginBottom:'4px' }}>{isDrink ? '🥤' : '🍽️'}</div>
                )}
                <div style={{ fontWeight:'bold', color: textColor, fontSize: isMobile ? '12px' : '14px', marginBottom:'4px' }}>{item.name}</div>
                <div style={{ color: priceColor, fontWeight:'bold', fontSize: isMobile ? '14px' : '16px' }}>RM {item.price.toFixed(2)}</div>
                {isDrink && hasOptions && <div style={{ fontSize:'10px', color:'#3b82f6', marginTop:'2px' }}>☕ Options</div>}
              </div>
            )
          })}
        </div>
        
        {/* ===== CART BOTTOM BAR - FIXED VISIBLE ===== */}
        {cart.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: cardBg,
            borderTop: `3px solid ${priceColor}`,
            padding: isMobile ? '12px 16px' : '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            zIndex: 999,
            boxShadow: '0 -8px 30px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <span style={{ fontWeight:'bold', color: textColor, fontSize: isMobile ? '14px' : '16px' }}>
                🛒 {cartItemCount} {t('items')}
              </span>
              <span style={{ fontWeight:'bold', color: priceColor, fontSize: isMobile ? '18px' : '22px' }}>
                RM {totalCart.toFixed(2)}
              </span>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={clearCart}
                style={{ padding: isMobile ? '8px 16px' : '10px 20px', background:'#ef4444', color:'white', border:'none', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', fontSize: isMobile ? '11px' : '13px' }}>
                {t('clear_cart')}
              </button>
              <button onClick={handleCheckout}
                style={{ padding: isMobile ? '8px 16px' : '10px 24px', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', border:'none', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', fontSize: isMobile ? '11px' : '13px', boxShadow:'0 4px 16px rgba(34,197,94,0.3)' }}>
                💳 {t('checkout')}
              </button>
            </div>
          </div>
        )}
        
        {/* MODALS */}
        {showItemModal && renderItemModal()}
        {showNewOrders && renderNewOrdersModal()}
        {showUnpaidOrders && renderUnpaidOrdersModal()}
        {showHistoryModal && renderHistoryModal()}
        
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: ${darkMode ? '#1a1a2e' : '#e2e8f0'}; border-radius: 10px; }
          ::-webkit-scrollbar-thumb { background: ${darkMode ? '#3d3d5c' : '#94a3b8'}; border-radius: 10px; }
          input:focus { outline: none; border-color: #3b82f6 !important; }
        `}</style>
      </div>
    </Sidebar>
  )
}

export default StaffApp