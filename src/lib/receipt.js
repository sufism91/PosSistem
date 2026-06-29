// lib/receipt.js
export function generateReceiptHTML(order, settings = {}) {
  const { 
    restaurant_name = 'Restoran Kita',
    service_charge_percent = 6,
    tax_percent = 6,
    payment_method = 'cash',
    darkMode = false
  } = settings

  const subtotal = order.subtotal || order.total || 0
  const sc = order.service_charge || (subtotal * (service_charge_percent / 100))
  const tax = order.tax || (subtotal * (tax_percent / 100))
  const grandTotal = order.grand_total || (subtotal + sc + tax)

  const orderDate = new Date(order.created_at)
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

  const isDark = darkMode

  // 🔥 AMBIL DATA BUNDLE DARI ORDER
  const hasBundle = order.has_bundle || false
  const bundlePromo = order.bundle_promo || null

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resit - ${restaurant_name}</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Courier New', monospace; 
          margin: 0; 
          padding: 20px; 
          background: ${isDark ? '#1a1a2e' : '#ffffff'}; 
          color: ${isDark ? '#e2e8f0' : '#1a1a2e'};
        }
        .receipt { 
          max-width: 320px; 
          margin: 0 auto; 
          font-size: 12px;
          background: ${isDark ? '#1a1a2e' : '#ffffff'};
          padding: 16px;
          border-radius: 12px;
        }
        .header { 
          text-align: center; 
          border-bottom: 1px dashed ${isDark ? '#475569' : '#94a3b8'}; 
          padding-bottom: 12px; 
          margin-bottom: 12px; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 20px; 
          color: ${isDark ? '#f1f5f9' : '#0f172a'};
        }
        .header .sub {
          font-size: 11px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          margin-top: 4px;
        }
        .divider { 
          border-top: 1px dashed ${isDark ? '#475569' : '#94a3b8'}; 
          margin: 10px 0; 
        }
        .items { 
          width: 100%; 
          margin: 10px 0; 
          border-collapse: collapse; 
        }
        .items th, .items td { 
          text-align: left; 
          padding: 4px 0; 
          color: ${isDark ? '#e2e8f0' : '#1a1a2e'};
        }
        .items th:last-child, .items td:last-child { 
          text-align: right; 
        }
        .items th {
          font-size: 11px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          border-bottom: 1px solid ${isDark ? '#475569' : '#e2e8f0'};
        }
        .total-row {
          font-size: 16px;
          font-weight: bold;
          color: #22c55e;
        }
        .footer { 
          text-align: center; 
          margin-top: 16px; 
          border-top: 1px dashed ${isDark ? '#475569' : '#94a3b8'}; 
          padding-top: 12px; 
          font-size: 11px; 
          color: ${isDark ? '#94a3b8' : '#64748b'};
        }
        .footer .stars {
          font-size: 16px;
          letter-spacing: 4px;
          color: #f59e0b;
        }
        .label { color: ${isDark ? '#94a3b8' : '#64748b'}; }
        .amount { font-weight: bold; }
        .amount-green { color: #22c55e; }
        .order-info {
          font-size: 11px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          margin: 2px 0;
        }
        .option-label {
          font-size: 10px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
        }
        .payment-method {
          font-size: 11px;
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
          font-size: 12px;
          color: #8b5cf6;
          font-weight: bold;
        }
        .promo-items {
          font-size: 10px;
          color: ${isDark ? '#94a3b8' : '#64748b'};
          margin: 4px 0;
        }
        .promo-price {
          font-size: 14px;
          font-weight: bold;
          color: #22c55e;
        }
        .promo-original {
          font-size: 11px;
          color: #94a3b8;
          text-decoration: line-through;
        }
        .promo-savings {
          font-size: 10px;
          background: #22c55e;
          color: white;
          padding: 1px 10px;
          border-radius: 12px;
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
          }
          .header h1 { color: black !important; }
          .header .sub { color: #666 !important; }
          .items th, .items td { color: black !important; }
          .items th { color: #666 !important; border-bottom-color: #ccc !important; }
          .total-row { color: #22c55e !important; }
          .footer { color: #666 !important; border-top-color: #ccc !important; }
          .label { color: #666 !important; }
          .amount-green { color: #22c55e !important; }
          .divider { border-top-color: #ccc !important; }
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
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>${restaurant_name}</h1>
          <div class="sub">Terima kasih!</div>
          <div style="margin-top: 6px; font-size: 11px; color: ${isDark ? '#94a3b8' : '#64748b'};">
            ${formattedDate} • ${formattedTime}
          </div>
        </div>
        
        <div class="order-info">🧾 ${order.order_number || `ORD-${order.id}`}</div>
        <div class="order-info">👤 ${order.customer_name || 'Guest'}</div>
        <div class="order-info">${order.order_type === 'take_away' ? '🥡 Take Away' : (order.table_number && order.table_number > 0) ? `Table ${order.table_number}` : '🚶 Walk-in'}</div>
        <div class="payment-method">💳 ${payment_method === 'cash' ? 'Tunai' : payment_method === 'tng' ? 'Touch n Go' : 'Bank'}</div>
        
        <div class="divider"></div>
        
        <table class="items">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
          </thead>
          <tbody>
            ${order.items?.map(item => {
              let itemName = item.name || ''
              
              // 🔥 TAMBAH LABEL PROMO PADA ITEM
              if (item.isBundleItem || item.isBundle) {
                itemName = `📦 ${itemName} (Bundle)`
              } else if (item.isFree) {
                itemName = `🎁 ${itemName} (FREE)`
              } else if (item.promoType === 'bogo') {
                itemName = `🎁 ${itemName} (BOGO)`
              } else if (item.promoName) {
                itemName = `🔥 ${itemName} (Promo)`
              }
              
              return `
                <tr>
                  <td style="text-align:left">
                    ${itemName}
                    ${item.option ? `<div class="option-label">${item.option}</div>` : ''}
                    ${item.size ? `<div class="option-label">${item.size}</div>` : ''}
                    ${item.addons ? `<div class="option-label">✨ ${item.addons}</div>` : ''}
                    ${item.isFree ? `<div style="color:#ef4444;font-weight:bold;">FREE</div>` : ''}
                  </td>
                  <td style="text-align:center">${item.quantity}</td>
                  <td style="text-align:right">${item.isFree ? 'FREE' : `RM ${(item.price * item.quantity).toFixed(2)}`}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
        
        <div class="divider"></div>
        
        <!-- ========================================================== -->
        <!-- 🔥🔥🔥 TUNJUK BUNDLE PROMO DI RESIT 🔥🔥🔥 -->
        <!-- ========================================================== -->
        ${hasBundle && bundlePromo ? `
          <div class="promo-badge">
            <div class="promo-name">📦 ${bundlePromo.name}</div>
            <div class="promo-items">${bundlePromo.items.join(' + ')}</div>
            <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
              <span class="promo-price">RM ${bundlePromo.bundle_price.toFixed(2)}</span>
              <span class="promo-original">RM ${bundlePromo.original_price.toFixed(2)}</span>
              <span class="promo-savings">Jimat RM ${bundlePromo.savings.toFixed(2)}</span>
            </div>
          </div>
          <div class="divider"></div>
        ` : ''}
        
        <div style="display:flex;justify-content:space-between;padding:2px 0;">
          <span class="label">Subtotal</span>
          <span class="amount">RM ${subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:2px 0;">
          <span class="label">Service Charge (${service_charge_percent}%)</span>
          <span class="amount">RM ${sc.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:2px 0;">
          <span class="label">Tax (${tax_percent}%)</span>
          <span class="amount">RM ${tax.toFixed(2)}</span>
        </div>
        
        <div class="divider"></div>
        
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;padding:4px 0;">
          <span>TOTAL</span>
          <span class="amount-green">RM ${grandTotal.toFixed(2)}</span>
        </div>
        
        <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:11px;color:${isDark ? '#94a3b8' : '#64748b'};">
          <span>Status: ${order.payment_status === 'paid' ? '✅ Paid' : '⏳ Unpaid'}</span>
        </div>
        
        <div class="footer">
          <div class="stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
          <div style="margin-top:4px;">${restaurant_name}</div>
          <div style="font-size:10px;margin-top:2px;">${formattedTime}</div>
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
}