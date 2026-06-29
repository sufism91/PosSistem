// src/hooks/useReceipt.js

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useReceipt() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .like('key', 'receipt_%')

      if (error) {
        console.error('Error loading receipt settings:', error)
        setSettings({})
        setLoading(false)
        return
      }

      const receiptSettings = {}
      data?.forEach(item => {
        const key = item.key.replace('receipt_', '')
        if (['show_logo', 'show_qr', 'show_items', 'show_tax', 'show_service'].includes(key)) {
          receiptSettings[key] = item.value === 'true'
        } else {
          receiptSettings[key] = item.value
        }
      })

      setSettings(receiptSettings)
    } catch (err) {
      console.error('Error loading receipt settings:', err)
      setSettings({})
    }
    setLoading(false)
  }

  function generateReceipt(orderData) {
    const s = settings || {}
    
    const {
      company_name = 'Restoran Saya',
      company_address = '',
      company_phone = '',
      header = 'Terima Kasih!',
      footer = 'Sila datang lagi',
      thank_you = 'Terima Kasih!',
      show_logo = true,
      show_qr = true,
      show_items = true,
      show_tax = true,
      show_service = true,
      paper_size = '58mm',
      logo_url = '',
    } = s

    const lineLength = paper_size === '80mm' ? 48 : 32
    const line = '─'.repeat(lineLength)
    const doubleLine = '═'.repeat(lineLength)

    // Logo
    const logoLine = show_logo && logo_url 
      ? `  🖼️ [LOGO]` 
      : show_logo ? '  🏪' : ''

    const items = orderData.items || []
    const itemLines = items.map(item => 
      `  ${(item.name || '').padEnd(12)} ${String(item.quantity || 1).padStart(3)}  RM${(item.price || 0).toFixed(2).padStart(6)}  RM${((item.price || 0) * (item.quantity || 1)).toFixed(2).padStart(6)}`
    ).join('\n')

    const subtotal = orderData.subtotal || 0
    const serviceCharge = orderData.service_charge || 0
    const tax = orderData.tax || 0
    const total = orderData.total || 0

    return `
${doubleLine}
${logoLine}
  ${company_name}
  ${company_address}
  Tel: ${company_phone}
${line}
  Date: ${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}
  Order: #${orderData.order_number || 'N/A'}
  Table: ${orderData.table_number || '-'}
  Staff: ${orderData.staff_name || 'System'}
${line}

  Item          Qty    Price    Total
  ───────────────────────────────────
${itemLines}
${line}
${show_items ? `                  Subtotal:  RM${subtotal.toFixed(2)}` : ''}
${show_service ? `                  Service:    RM${serviceCharge.toFixed(2)}` : ''}
${show_tax ? `                  Tax:        RM${tax.toFixed(2)}` : ''}
${line}
                  TOTAL:      RM${total.toFixed(2)}
${line}
  Payment: ${orderData.payment_method || 'Cash'}
  Amount:  RM${orderData.paid_amount || total.toFixed(2)}
${doubleLine}
  ${header}
  ${thank_you}
  ${footer}
${show_qr ? '  [QR Code]' : ''}
${doubleLine}`
  }

  async function printReceipt(receiptText) {
    try {
      const printWindow = window.open('', '_blank', 'width=400,height=600')
      if (!printWindow) {
        toast.error('❌ Popup blocked. Please allow popups.')
        return false
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            *{margin:0;padding:0;box-sizing:border-box}
            body{font-family:'Courier New',monospace;padding:20px;background:white;color:black}
            .receipt{max-width:320px;margin:0 auto;font-size:12px;white-space:pre-wrap;font-family:'Courier New',monospace}
            @media print{body{margin:0;padding:10px}}
          </style>
        </head>
        <body>
          <div class="receipt">${receiptText}</div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print()
                setTimeout(function() { window.close() }, 500)
              }, 300)
            }
          <\/script>
        </body>
        </html>
      `)
      printWindow.document.close()
      return true
    } catch (error) {
      console.error('Print error:', error)
      toast.error('❌ Failed to print receipt')
      return false
    }
  }

  return { 
    settings, 
    loading, 
    generateReceipt, 
    printReceipt,
    reload: loadSettings 
  }
}