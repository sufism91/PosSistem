// lib/receipt.js
export function generateReceiptHTML(order = {}, settings = {}) {
  // ============================================================
  // ===== SETTINGS DARI MANAGESETTING =====
  // ============================================================
  const {
    // Restaurant Info
    restaurant_name = 'Restoran Kita',
    service_charge_percent = 6,
    tax_percent = 6,
    payment_method = 'cash',
    darkMode = false,
    
    // ===== RECEIPT SETTINGS DARI MANAGESETTING =====
    receipt_logo_url = '',
    receipt_company_name = '',
    receipt_company_address = '',
    receipt_company_phone = '',
    receipt_header = 'Terima Kasih!',
    receipt_footer = 'Sila datang lagi',
    receipt_thank_you = 'Terima Kasih!',
    receipt_show_logo = true,
    receipt_show_qr = true,
    receipt_show_items = true,
    receipt_show_tax = true,
    receipt_show_service = true,
    receipt_paper_size = '58mm',
    receipt_font_size = 'normal',
    receipt_logo_size = 'medium',
  } = settings

  // ============================================================
  // ===== DATA ORDER =====
  // ============================================================
  const items = order.items || []
  const subtotal = order.subtotal || order.total || 0
  const sc = order.service_charge || (subtotal * (service_charge_percent / 100))
  const tax = order.tax || (subtotal * (tax_percent / 100))
  const grandTotal = order.grand_total || order.total || (subtotal + sc + tax)
  const orderNumber = order.order_number || `ORD-${Date.now()}`
  const customerName = order.customer_name || 'Guest'
  const tableNumber = order.table_number || ''
  const orderType = order.order_type || 'dine_in'
  const paymentMethod = order.payment_method || payment_method || 'cash'

  // ===== DATA PROMOSI / BUNDLE =====
  const hasBundle = order.has_bundle || false
  const bundlePromo = order.bundle_promo || null

  // ============================================================
  // ===== FORMAT ITEMS DENGAN LABEL PROMO & HARGA =====
  // ============================================================
  const formattedItems = items.map(item => {
    // 🔥 Tentukan sama ada item ada promo
    const isFree = item.isFree === true
    const isBundleItem = item.isBundleItem === true
    const hasPromo = item.promoType !== null && item.promoType !== undefined
    const promoName = item.promoName || ''
    const originalPrice = item.originalPrice || item.price || 0
    const displayPrice = isFree ? 0 : item.price || 0
    const savings = hasPromo && !isFree ? (originalPrice - displayPrice) : 0
    
    // 🔥 Build item name with tags
    let nameWithTags = item.name || 'Item'
    
    // Add promo tags
    if (isFree) {
      nameWithTags = `🎁 ${nameWithTags} (FREE)`
    } else if (isBundleItem) {
      nameWithTags = `📦 ${nameWithTags} (Bundle)`
    } else if (hasPromo && promoName) {
      nameWithTags = `🔥 ${nameWithTags} (${promoName})`
    } else if (hasPromo && item.promoType === 'bogo') {
      nameWithTags = `🎁 ${nameWithTags} (BOGO)`
    }
    
    // Add option/size/addons
    if (item.option) {
      nameWithTags += ` (${item.option})`
    }
    if (item.size) {
      nameWithTags += ` [${item.size}]`
    }
    if (item.addons) {
      nameWithTags += ` ✨${item.addons}`
    }
    
    return {
      name: nameWithTags,
      quantity: item.quantity || 1,
      price: displayPrice,
      originalPrice: originalPrice,
      subtotal: displayPrice * (item.quantity || 1),
      originalSubtotal: originalPrice * (item.quantity || 1),
      isFree: isFree,
      isBundleItem: isBundleItem,
      hasPromo: hasPromo,
      promoName: promoName,
      promoType: item.promoType,
      savings: savings,
      // 🔥 Untuk display price with strike-through
      showOriginal: hasPromo && !isFree && originalPrice !== displayPrice
    }
  })

  // ============================================================
  // ===== DATE FORMAT =====
  // ============================================================
  const orderDate = new Date(order.created_at || Date.now())
  const formattedDate = orderDate.toLocaleDateString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  const formattedTime = orderDate.toLocaleTimeString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  // ============================================================
  // ===== PAPER SIZE & FONT SIZE =====
  // ============================================================
  const isLarge = receipt_paper_size === '80mm'
  const maxWidth = isLarge ? 420 : 320
  const fontSize = receipt_font_size === 'large' ? 14 : receipt_font_size === 'small' ? 10 : 12
  const logoSize = receipt_logo_size === 'large' ? 80 : receipt_logo_size === 'small' ? 40 : 60

  // ============================================================
  // ===== THEME =====
  // ============================================================
  const isDark = darkMode

  // ============================================================
  // ===== BUILD RECEIPT HTML =====
  // ============================================================
  let receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${restaurant_name}</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Courier New', monospace; 
          margin: 0; 
          padding: 20px; 
          background: ${isDark ? '#1a1a2e' : '#f8fafc'}; 
          color: ${isDark ? '#e2e8f0' : '#1a1a2e'};
          display: flex;
          justify-content: center;
        }
        .receipt { 
          max-width: ${maxWidth}px; 
          margin: 0 auto; 
          font-size: ${fontSize}px;
          background: ${isDark ? '#1a1a2e' : '#ffffff'};
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          width: 100%;
        }
        .header { 
          text-align: center; 
          border-bottom: 1px dashed ${isDark ? '#475569' : '#94a3b8'}; 
          padding-bottom: 12px; 
          margin-bottom: 12px; 
        }
        .header h1 { 
          margin: 0; 
          font-size: ${isLarge ? 22 : 18}px; 
          color: ${isDark ? '#f1f5f9' : '#0f172a'};
          font-weight: bold;
        }
        .header .sub {
          font-size: ${isLarge ? 12 : 11}px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          margin-top: 2px;
        }
        .header .logo {
          max-width: ${logoSize}px;
          max-height: ${logoSize}px;
          margin: 0 auto 8px auto;
          display: block;
        }
        .divider { 
          border-top: 1px dashed ${isDark ? '#475569' : '#94a3b8'}; 
          margin: 10px 0; 
        }
        .divider-double {
          border-top: 2px solid ${isDark ? '#475569' : '#94a3b8'};
          margin: 10px 0;
        }
        .items { 
          width: 100%; 
          margin: 10px 0; 
          border-collapse: collapse; 
        }
        .items th, .items td { 
          text-align: left; 
          padding: 4px 2px; 
          color: ${isDark ? '#e2e8f0' : '#1a1a2e'};
          font-size: ${fontSize}px;
        }
        .items th:last-child, .items td:last-child { 
          text-align: right; 
        }
        .items th {
          font-size: ${fontSize - 1}px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          border-bottom: 1px solid ${isDark ? '#475569' : '#e2e8f0'};
        }
        .items .item-free {
          color: #22c55e;
          font-weight: bold;
        }
        .items .item-bundle {
          color: #8b5cf6;
          font-weight: bold;
        }
        .items .item-promo {
          color: #ef4444;
          font-weight: bold;
        }
        .items .price-original {
          text-decoration: line-through;
          color: ${isDark ? '#94a3b8' : '#94a3b8'};
          font-size: ${fontSize - 2}px;
          margin-right: 4px;
        }
        .items .price-discount {
          color: #22c55e;
          font-weight: bold;
        }
        .total-row {
          font-size: ${isLarge ? 20 : 18}px;
          font-weight: bold;
          color: #22c55e;
        }
        .footer { 
          text-align: center; 
          margin-top: 16px; 
          border-top: 1px dashed ${isDark ? '#475569' : '#94a3b8'}; 
          padding-top: 12px; 
          font-size: ${isLarge ? 12 : 11}px; 
          color: ${isDark ? '#94a3b8' : '#64748b'};
        }
        .footer .stars {
          font-size: ${isLarge ? 18 : 16}px;
          letter-spacing: 4px;
          color: #f59e0b;
        }
        .label { color: ${isDark ? '#94a3b8' : '#64748b'}; }
        .amount { font-weight: bold; }
        .amount-green { color: #22c55e; font-weight: bold; }
        .order-info {
          font-size: ${isLarge ? 12 : 11}px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          margin: 2px 0;
        }
        .option-label {
          font-size: ${fontSize - 2}px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          padding-left: 8px;
        }
        .payment-method {
          font-size: ${isLarge ? 12 : 11}px;
          color: #3b82f6;
          font-weight: bold;
          margin-top: 4px;
        }
        
        /* 🔥 STYLE UNTUK BUNDLE PROMO */
        .promo-badge {
          background: ${isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.06)'};
          border: 1px solid #8b5cf6;
          border-radius: 8px;
          padding: 10px 12px;
          margin: 10px 0;
          text-align: center;
        }
        .promo-name {
          font-size: ${isLarge ? 14 : 12}px;
          color: #8b5cf6;
          font-weight: bold;
        }
        .promo-items {
          font-size: ${isLarge ? 11 : 10}px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          margin: 4px 0;
        }
        .promo-price {
          font-size: ${isLarge ? 16 : 14}px;
          font-weight: bold;
          color: #22c55e;
        }
        .promo-original {
          font-size: ${isLarge ? 12 : 11}px;
          color: #94a3b8;
          text-decoration: line-through;
        }
        .promo-savings {
          font-size: ${isLarge ? 11 : 10}px;
          background: #22c55e;
          color: white;
          padding: 2px 10px;
          border-radius: 12px;
          font-weight: bold;
        }
        
        .qr-code {
          text-align: center;
          margin: 8px 0;
          font-size: ${isLarge ? 12 : 10}px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
        }
        
        @media print { 
          body { 
            margin: 0; 
            padding: 0; 
            background: white !important;
            color: black !important;
          }
          .receipt {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 10px;
          }
          .header h1 { color: black !important; }
          .header .sub { color: #666 !important; }
          .items th, .items td { color: black !important; }
          .items th { color: #666 !important; border-bottom-color: #ccc !important; }
          .items .price-original { color: #94a3b8 !important; }
          .items .price-discount { color: #22c55e !important; }
          .total-row { color: #22c55e !important; }
          .footer { color: #666 !important; border-top-color: #ccc !important; }
          .label { color: #666 !important; }
          .amount-green { color: #22c55e !important; }
          .divider { border-top-color: #ccc !important; }
          .divider-double { border-top-color: #ccc !important; }
          .order-info { color: #666 !important; }
          .option-label { color: #666 !important; }
          .payment-method { color: #3b82f6 !important; }
          .promo-badge {
            background: rgba(139,92,246,0.06) !important;
            border-color: #8b5cf6 !important;
          }
          .promo-name { color: #8b5cf6 !important; }
          .promo-items { color: #666 !important; }
          .promo-price { color: #22c55e !important; }
          .promo-original { color: #94a3b8 !important; }
          .promo-savings { background: #22c55e !important; color: white !important; }
          .qr-code { color: #666 !important; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        
        <!-- ===== HEADER ===== -->
        <div class="header">
          ${receipt_show_logo && receipt_logo_url ? `
            <img src="${receipt_logo_url}" alt="Logo" class="logo" />
          ` : ''}
          <h1>${receipt_company_name || restaurant_name}</h1>
          ${receipt_company_address ? `<div class="sub">${receipt_company_address}</div>` : ''}
          ${receipt_company_phone ? `<div class="sub">📞 ${receipt_company_phone}</div>` : ''}
          <div class="sub">${formattedDate} • ${formattedTime}</div>
        </div>
        
        <!-- ===== ORDER INFO ===== -->
        <div class="order-info">🧾 ${orderNumber}</div>
        <div class="order-info">👤 ${customerName}</div>
        <div class="order-info">${orderType === 'take_away' ? '🥡 Take Away' : (tableNumber && tableNumber > 0) ? `🍽️ Table ${tableNumber}` : '🚶 Walk-in'}</div>
        <div class="payment-method">💳 ${paymentMethod === 'cash' ? 'Tunai' : paymentMethod === 'tng' ? 'Touch n Go' : 'Bank Transfer'}</div>
        
        <div class="divider"></div>
        
        <!-- ===== ITEMS ===== -->
        ${receipt_show_items ? `
          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center">Qty</th>
                <th style="text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>
              ${formattedItems.map(item => {
                // 🔥 Build price display
                let priceDisplay = ''
                if (item.isFree) {
                  priceDisplay = `<span class="item-free">FREE</span>`
                } else if (item.showOriginal) {
                  priceDisplay = `
                    <span class="price-original">RM ${item.originalSubtotal.toFixed(2)}</span>
                    <span class="price-discount">RM ${item.subtotal.toFixed(2)}</span>
                  `
                } else {
                  priceDisplay = `RM ${item.subtotal.toFixed(2)}`
                }
                
                // 🔥 Build item name class
                let nameClass = ''
                if (item.isFree) nameClass = 'item-free'
                else if (item.isBundleItem) nameClass = 'item-bundle'
                else if (item.hasPromo) nameClass = 'item-promo'
                
                return `
                  <tr>
                    <td style="text-align:left">
                      <span class="${nameClass}">${item.name}</span>
                      ${item.addons ? `<div class="option-label">✨ ${item.addons}</div>` : ''}
                      ${item.isFree ? `<div class="item-free">🎁 FREE</div>` : ''}
                      ${item.hasPromo && !item.isFree && item.savings > 0 ? `<div class="option-label" style="color:#22c55e;">🔥 Jimat RM ${item.savings.toFixed(2)}</div>` : ''}
                    </td>
                    <td style="text-align:center">${item.quantity}</td>
                    <td style="text-align:right">${priceDisplay}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
        ` : ''}
        
        <!-- ========================================================== -->
        <!-- 🔥🔥🔥 BUNDLE PROMO DISPLAY 🔥🔥🔥 -->
        <!-- ========================================================== -->
        ${hasBundle && bundlePromo ? `
          <div class="promo-badge">
            <div class="promo-name">📦 ${bundlePromo.name}</div>
            <div class="promo-items">${bundlePromo.items.join(' + ')}</div>
            <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
              <span class="promo-price">RM ${bundlePromo.bundle_price.toFixed(2)}</span>
              <span class="promo-original">RM ${bundlePromo.original_price.toFixed(2)}</span>
              <span class="promo-savings">🎉 Jimat RM ${bundlePromo.savings.toFixed(2)}</span>
            </div>
          </div>
          <div class="divider"></div>
        ` : ''}
        
        <!-- ========================================================== -->
        <!-- ===== TOTALS ===== -->
        <!-- ========================================================== -->
        ${receipt_show_items ? `
          <div style="display:flex;justify-content:space-between;padding:2px 0;">
            <span class="label">Subtotal</span>
            <span class="amount">RM ${subtotal.toFixed(2)}</span>
          </div>
        ` : ''}
        
        ${receipt_show_service && service_charge_percent > 0 ? `
          <div style="display:flex;justify-content:space-between;padding:2px 0;">
            <span class="label">Service (${service_charge_percent}%)</span>
            <span class="amount">RM ${sc.toFixed(2)}</span>
          </div>
        ` : ''}
        
        ${receipt_show_tax && tax_percent > 0 ? `
          <div style="display:flex;justify-content:space-between;padding:2px 0;">
            <span class="label">Tax (${tax_percent}%)</span>
            <span class="amount">RM ${tax.toFixed(2)}</span>
          </div>
        ` : ''}
        
        <div class="divider-double"></div>
        
        <div style="display:flex;justify-content:space-between;font-size:${isLarge ? 20 : 18}px;font-weight:bold;padding:4px 0;">
          <span>TOTAL</span>
          <span class="amount-green">RM ${grandTotal.toFixed(2)}</span>
        </div>
        
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:${isLarge ? 11 : 10}px;color:${isDark ? '#94a3b8' : '#64748b'};">
          <span>Status: ${order.payment_status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}</span>
        </div>
        
        <!-- ===== QR CODE ===== -->
        ${receipt_show_qr ? `
          <div class="qr-code">
            ┌──────────────────┐
            │  [ QR CODE ]     │
            │  Scan to pay     │
            └──────────────────┘
          </div>
        ` : ''}
        
        <!-- ===== FOOTER ===== -->
        <div class="footer">
          <div class="stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
          <div style="margin-top:4px;font-weight:bold;">${receipt_thank_you}</div>
          <div style="font-size:${isLarge ? 11 : 10}px;margin-top:2px;">${receipt_footer}</div>
          <div style="font-size:${isLarge ? 10 : 9}px;margin-top:4px;opacity:0.6;">${restaurant_name}</div>
        </div>
        
      </div>
      
      <!-- ===== PRINT BUTTONS ===== -->
      <div style="text-align:center;margin-top:16px;max-width:${maxWidth}px;width:100%;">
        <button onclick="window.print()" style="padding:10px 24px;background:#3b82f6;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;margin-right:8px;">
          🖨️ Print
        </button>
        <button onclick="window.close()" style="padding:10px 24px;background:#64748b;color:white;border:none;border-radius:8px;cursor:pointer;font-size:14px;">
          ❌ Close
        </button>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      <\/script>
    </body>
    </html>
  `

  return receiptHTML
}