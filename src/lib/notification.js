// lib/notification.js
import { supabase } from './supabase'

// ============================================================
// PREVENT DUPLICATE NOTIFICATIONS
// ============================================================
const sentNotifications = new Set()
const NOTIFICATION_COOLDOWN = 5000 // 5 seconds

// ============================================================
// SEND TELEGRAM NOTIFICATION (Centralized)
// ============================================================
export async function sendTelegramNotification(message, orderId = null) {
  // Check if this order was already notified
  if (orderId) {
    const key = `order_${orderId}`
    if (sentNotifications.has(key)) {
      console.log(`⏳ Notification for order ${orderId} already sent, skipping...`)
      return { success: false, reason: 'duplicate' }
    }
    sentNotifications.add(key)
    
    // Clean up after cooldown
    setTimeout(() => {
      sentNotifications.delete(key)
    }, NOTIFICATION_COOLDOWN)
  }
  
  try {
    // Check if telegram is enabled
    const { data: enabledData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'telegram_enabled')
      .single()
    
    if (!enabledData || enabledData.value !== 'true') {
      console.log('📵 Telegram notification disabled')
      return { success: false, reason: 'disabled' }
    }
    
    // Get bot token and chat ID
    const { data: tokenData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'telegram_bot_token')
      .single()
    
    const { data: chatData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'telegram_chat_id')
      .single()
    
    if (!tokenData?.value || !chatData?.value) {
      console.log('📵 Telegram not configured')
      return { success: false, reason: 'not_configured' }
    }
    
    const url = `https://api.telegram.org/bot${tokenData.value}/sendMessage`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatData.value,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    })
    
    const result = await response.json()
    if (result.ok) {
      console.log('✅ Telegram notification sent')
      return { success: true }
    } else {
      console.error('❌ Telegram error:', result.description)
      return { success: false, error: result.description }
    }
  } catch (error) {
    console.error('❌ Telegram send error:', error)
    return { success: false, error: error.message }
  }
}

// ============================================================
// FORMAT ORDER NOTIFICATION
// ============================================================
export function formatOrderNotification(order) {
  const items = order.items || []
  const itemList = items.map(item => {
    let name = item.name
    if (item.option) name += ` (${item.option})`
    if (item.size) name += ` [${item.size}]`
    if (item.addons) name += ` ✨${item.addons}`
    return `  ✅ ${name} x${item.quantity} (RM ${(item.price * item.quantity).toFixed(2)})`
  }).join('\n')
  
  const total = order.total || order.grand_total || 0
  const orderType = order.order_type === 'take_away' ? '🥡 Takeaway' : `🍽️ Table ${order.table_number || ''}`
  
  return `
🆕 <b>NEW ORDER!</b> 🆕

<b>Order:</b> #${order.order_number}
<b>Customer:</b> ${order.customer_name || 'Guest'}
<b>${order.order_type === 'take_away' ? 'Type' : 'Table'}:</b> ${orderType}

<b>Items:</b>
${itemList}

<b>Total:</b> RM ${Number(total).toFixed(2)}
<b>Payment:</b> ${order.payment_status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}

🔔 <a href="${window.location.origin}/staff">View Order</a>
`
}

// ============================================================
// FORMAT PROMO NOTIFICATION
// ============================================================
export function formatPromoNotification(order, promo) {
  if (!promo) return formatOrderNotification(order)
  
  let promoText = ''
  if (promo.type === 'bogo') {
    promoText = `🎁 BOGO: ${promo.trigger?.name} → ${promo.free?.name} FREE!`
  } else if (promo.type === 'bundle' || promo.type === 'set_menu') {
    const items = promo.bundleItems?.map(i => i.name).join(' + ') || ''
    promoText = `📦 Bundle: ${items} → RM ${promo.bundlePrice}`
  }
  
  return `
🆕 <b>NEW ORDER with PROMO!</b> 🆕

<b>Order:</b> #${order.order_number}
<b>Customer:</b> ${order.customer_name || 'Guest'}
<b>${order.order_type === 'take_away' ? 'Type' : 'Table'}:</b> ${order.order_type === 'take_away' ? '🥡 Takeaway' : `🍽️ Table ${order.table_number || ''}`}

<b>Promo Applied:</b>
${promoText}

<b>Items:</b>
${order.items?.map(item => {
  let name = item.name
  if (item.option) name += ` (${item.option})`
  if (item.size) name += ` [${item.size}]`
  if (item.addons) name += ` ✨${item.addons}`
  return `  ✅ ${name} x${item.quantity} (RM ${(item.price * item.quantity).toFixed(2)})`
}).join('\n') || '  - No items'}

<b>Total:</b> RM ${Number(order.total || order.grand_total || 0).toFixed(2)}
<b>Payment:</b> ${order.payment_status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}

🔔 <a href="${window.location.origin}/staff">View Order</a>
`
}