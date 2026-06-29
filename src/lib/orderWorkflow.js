export const ORDER_STATUS = {
  NEW: 'pending_confirmation',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  CANCELLED: 'cancelled',
}

const drinkKeywords = [
  'minuman', 'teh', 'kopi', 'jus', 'air', 'milo', 'sirap', 'coke',
  'soda', 'limau', 'mangga', 'oren', 'nescafe', 'neslo',
  'horlicks', 'barli', 'laici', 'ais', 'suam', 'panas', 'sejuk', 'bungkus'
]

export function isDrinkItem(item = {}) {
  const category = String(item.category || '').toLowerCase()
  const name = String(item.name || '').toLowerCase()
  return category.includes('minuman') || drinkKeywords.some(keyword => name.includes(keyword))
}

export function splitOrderItems(items = [], type = 'all') {
  if (type === 'drink') return items.filter(isDrinkItem)
  if (type === 'food') return items.filter(item => !isDrinkItem(item))
  return items
}

export function getDrinkOptionImage(menuItem, option) {
  return option?.image_url || option?.option_image_url || option?.image || menuItem?.image_url || ''
}

// ============================================================
// ===== FIXED: normalizeOrderForInsert - ONLY table columns =====
// ============================================================
export function normalizeOrderForInsert(order = {}) {
  // 🔥 ONLY include fields that exist in the customer_orders table
  return {
    order_number: order.order_number || 'ORD-' + Date.now(),
    items: order.items || [],
    total: order.total || 0,
    customer_name: order.customer_name || 'Guest',
    customer_phone: order.customer_phone || null,
    table_number: order.table_number || null,
    order_type: order.order_type || 'dine_in',
    status: order.status || ORDER_STATUS.NEW,
    order_status: order.order_status || order.status || ORDER_STATUS.NEW,
    payment_status: order.payment_status || PAYMENT_STATUS.UNPAID,
    notes: order.notes || '',
    subtotal: order.subtotal || order.total || 0,
    service_charge: order.service_charge || 0,
    tax: order.tax || 0,
    grand_total: order.grand_total || order.total || 0,
    // 🔥 Only include if you have added these columns to the table
    // If you haven't added them, COMMENT OUT or REMOVE these lines
    has_bundle: order.has_bundle || false,
    bundle_promo: order.bundle_promo || null
  }
}

export function normalizeConfirmedUpdate() {
  return {
    status: ORDER_STATUS.CONFIRMED,
    order_status: ORDER_STATUS.CONFIRMED,
    payment_status: PAYMENT_STATUS.UNPAID,
    confirmed_at: new Date().toISOString(),
  }
}