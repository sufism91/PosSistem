// ============================================================
// ORDER WORKFLOW CONSTANTS
// ============================================================

export const ORDER_STATUS = {
  NEW: 'new',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  CANCELLED: 'cancelled'
}

// ============================================================
// NORMALIZE ORDER FOR INSERT
// ============================================================

export function normalizeOrderForInsert(order) {
  return {
    order_number: order.order_number || `ORD-${Date.now()}`,
    order_type: order.order_type || 'dine_in',
    table_number: order.table_number || null,
    customer_name: order.customer_name || 'Guest',
    customer_phone: order.customer_phone || null,
    items: order.items || [],
    subtotal: order.subtotal || 0,
    service_charge: order.service_charge || 0,
    tax: order.tax || 0,
    total: order.total || 0,
    notes: order.notes || '',
    status: order.status || ORDER_STATUS.NEW,
    order_status: order.order_status || ORDER_STATUS.NEW,
    payment_status: order.payment_status || PAYMENT_STATUS.UNPAID,
    created_at: new Date().toISOString(),
    confirmed_at: null,
    paid_at: null
  }
}

// ============================================================
// NORMALIZE CONFIRMED UPDATE
// ============================================================

export function normalizeConfirmedUpdate(order) {
  return {
    status: ORDER_STATUS.CONFIRMED,
    order_status: ORDER_STATUS.CONFIRMED,
    confirmed_at: new Date().toISOString()
  }
}

// ============================================================
// SPLIT ORDER ITEMS
// ============================================================

export function splitOrderItems(items, itemType = 'all') {
  if (!items || !Array.isArray(items)) return []
  
  if (itemType === 'all') return items
  
  if (itemType === 'food') {
    return items.filter(item => item.category !== 'Minuman')
  }
  
  if (itemType === 'drink') {
    return items.filter(item => item.category === 'Minuman')
  }
  
  return items
}

// ============================================================
// GET DRINK OPTION IMAGE
// ============================================================

export function getDrinkOptionImage(drink, option) {
  if (!drink) return null
  if (option?.image_url) return option.image_url
  if (drink.image_url) return drink.image_url
  return null
}