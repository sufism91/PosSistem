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

export function normalizeOrderForInsert(order = {}) {
  return {
    ...order,
    status: order.status || ORDER_STATUS.NEW,
    order_status: order.order_status || order.status || ORDER_STATUS.NEW,
    payment_status: order.payment_status || PAYMENT_STATUS.UNPAID,
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
