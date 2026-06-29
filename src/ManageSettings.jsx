import { useState, useEffect } from 'react'
import { useLanguage } from './context/LanguageContext'
import { useTheme } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import { supabase } from './lib/supabase'
import toast from 'react-hot-toast'

// ===== IMPORT SYSTEM LOGS =====
import { 
  logActivity, 
  getLogs, 
  clearLogs, 
  exportLogsToCSV,
  getActionLabel,
  getActionIcon,
  LOG_ACTIONS 
} from './utils/systemLogs'

function ManageSettings() {
  const { language, setLanguage, t } = useLanguage()
  const { darkMode } = useTheme()
  
  const [activeTab, setActiveTab] = useState('settings')
  const [showConfirmModal, setShowConfirmModal] = useState(null)
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const [settings, setSettings] = useState({
    restaurant_name: 'KedaiPOS',
    service_charge: 6,
    tax: 6,
    printer_type: 'thermal',
    auto_print: true,
    notification_sound: true,
    logo_url: '',
    kitchen_enabled: true,
    special_menu_enabled: false,
    special_menu_title: 'Istimewa Hari Ini',
    business_hours_start: '09:00',
    business_hours_end: '22:00',
    login_welcome_text: 'Welcome Back!',
    login_subtitle_text: 'Please sign in to continue',
    login_branding_text: 'POS System for Small & Medium Restaurants',
    login_footer_text: '© 2024 KedaiPOS • POS System',
    auto_complete_enabled: true,
    auto_complete_minutes: 5,
    auto_print_customer_order: true,
    // Telegram Settings
    telegram_enabled: false,
    telegram_bot_token: '',
    telegram_chat_id: '',
    telegram_notify_new_order: true,
    telegram_notify_payment: true,
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [kitchenEnabled, setKitchenEnabled] = useState(true)
  const [testingTelegram, setTestingTelegram] = useState(false)

  // ===== SYSTEM LOGS STATE =====
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsCount, setLogsCount] = useState(0)
  const [logsPage, setLogsPage] = useState(1)
  const [logsLimit] = useState(50)
  const [logsSearch, setLogsSearch] = useState('')
  const [logsActionFilter, setLogsActionFilter] = useState('')
  const [logsUsernameFilter, setLogsUsernameFilter] = useState('')
  const [logsDateFrom, setLogsDateFrom] = useState('')
  const [logsDateTo, setLogsDateTo] = useState('')
  const [logsExporting, setLogsExporting] = useState(false)

  // ===== RECEIPT SETTINGS STATE =====
  const [receiptSettings, setReceiptSettings] = useState({
    receipt_company_name: 'Restoran FullamakSUP',
    receipt_company_address: 'No. 123, Jalan Contoh',
    receipt_company_phone: '012-3456789',
    receipt_header: 'Terima Kasih!',
    receipt_footer: 'Sila datang lagi',
    receipt_thank_you: 'Terima Kasih!',
    receipt_show_logo: true,
    receipt_show_qr: true,
    receipt_show_items: true,
    receipt_show_tax: true,
    receipt_show_service: true,
    receipt_paper_size: '58mm',
    receipt_font_size: 'normal',
    receipt_logo_size: 'medium',
  })
  
  // ===== RECEIPT LOGO STATE =====
  const [receiptLogoUrl, setReceiptLogoUrl] = useState('')
  const [uploadingReceiptLogo, setUploadingReceiptLogo] = useState(false)
  
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [receiptPreview, setReceiptPreview] = useState('')

  // Theme colors
  const bgColor = darkMode ? '#0f0f1a' : '#f1f5f9'
  const cardBg = darkMode ? 'rgba(30, 30, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const textColor = darkMode ? '#f1f5f9' : '#0f172a'
  const textMuted = darkMode ? '#94a3b8' : '#64748b'
  const borderColor = darkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.6)'
  const secondaryBg = darkMode ? 'rgba(30, 30, 46, 0.8)' : 'rgba(248, 250, 252, 0.9)'
  const inputBg = darkMode ? '#1e1e2e' : '#ffffff'
  const primary = '#3b82f6'
  const primaryGradient = 'linear-gradient(135deg, #3b82f6, #2563eb)'
  const success = '#22c55e'
  const danger = '#ef4444'
  const warning = '#f59e0b'
  
  const glassEffect = {
    background: cardBg,
    backdropFilter: 'blur(12px)',
    border: `1px solid ${borderColor}`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
  }

  const tabButtonStyle = (isActive) => ({
    padding: '12px 24px',
    border: 'none',
    borderRadius: '40px',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    background: isActive ? primaryGradient : 'transparent',
    color: isActive ? 'white' : textColor,
    transition: 'all 0.2s ease',
    fontSize: '14px',
    border: isActive ? 'none' : `1px solid ${borderColor}`
  })

  const cardStyle = {
    background: secondaryBg,
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px',
    border: `1px solid ${borderColor}`
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: `1px solid ${borderColor}`,
    fontSize: '14px',
    background: inputBg,
    color: textColor,
    outline: 'none',
    transition: 'all 0.2s'
  }

  const toggleSwitch = (checked, onChange) => (
    <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '26px', flexShrink: 0 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ 
        position: 'absolute', 
        cursor: 'pointer', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: checked ? success : '#64748b', 
        transition: '.3s', 
        borderRadius: '34px' 
      }}>
        <span style={{ 
          position: 'absolute', 
          height: '20px', 
          width: '20px', 
          left: '3px', 
          bottom: '3px', 
          backgroundColor: 'white', 
          transition: '.3s', 
          borderRadius: '50%', 
          transform: checked ? 'translateX(26px)' : 'none' 
        }} />
      </span>
    </label>
  )

  useEffect(() => {
    loadSettings()
    loadReceiptSettings()
  }, [])

  // ===== LOAD LOGS WHEN TAB CHANGES =====
  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs()
    }
  }, [activeTab, logsPage, logsSearch, logsActionFilter, logsUsernameFilter, logsDateFrom, logsDateTo])

  // ===== GENERATE RECEIPT PREVIEW ON SETTINGS CHANGE =====
  useEffect(() => {
    generateReceiptPreview()
  }, [receiptSettings, receiptLogoUrl])

  async function loadSettings() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('settings').select('key, value')
      if (error) console.error('Error loading settings:', error)
      if (data && data.length > 0) {
        const newSettings = { ...settings }
        data.forEach(item => {
          if (['service_charge', 'tax', 'auto_complete_minutes'].includes(item.key)) {
            newSettings[item.key] = parseFloat(item.value) || 0
          } else if (['auto_print', 'notification_sound', 'kitchen_enabled', 'special_menu_enabled', 'auto_complete_enabled', 'auto_print_customer_order', 'telegram_enabled', 'telegram_notify_new_order', 'telegram_notify_payment'].includes(item.key)) {
            newSettings[item.key] = item.value === 'true'
          } else {
            newSettings[item.key] = item.value
          }
        })
        setSettings(newSettings)
        setKitchenEnabled(newSettings.kitchen_enabled)
      }
    } catch (err) {
      console.error('Error:', err)
    }
    setLoading(false)
  }

  // ============================================================
  // RECEIPT FUNCTIONS
  // ============================================================
  async function loadReceiptSettings() {
    try {
      // Load receipt settings
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .like('key', 'receipt_%')

      if (error) {
        console.error('Error loading receipt settings:', error)
        return
      }

      if (data && data.length > 0) {
        const newSettings = { ...receiptSettings }
        data.forEach(item => {
          const key = item.key.replace('receipt_', '')
          if (['show_logo', 'show_qr', 'show_items', 'show_tax', 'show_service'].includes(key)) {
            newSettings[`receipt_${key}`] = item.value === 'true'
          } else {
            newSettings[`receipt_${key}`] = item.value
          }
        })
        setReceiptSettings(newSettings)
      }
      
      // Load receipt logo
      const { data: logoData } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'receipt_logo_url')
        .single()
      
      if (logoData && logoData.value) {
        setReceiptLogoUrl(logoData.value)
      }
      
    } catch (err) {
      console.error('Error loading receipt settings:', err)
    }
  }

  async function saveReceiptSettings() {
    setReceiptLoading(true)
    try {
      const updates = Object.entries(receiptSettings).map(([key, value]) => ({
        key: key,
        value: typeof value === 'boolean' ? value.toString() : value
      }))

      let hasError = false
      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert({ key: update.key, value: update.value }, { onConflict: 'key' })
        if (error) {
          console.error('Error saving:', update.key, error)
          hasError = true
        }
      }

      if (hasError) {
        toast.error(language === 'bm' ? '❌ Gagal simpan tetapan resit' : '❌ Failed to save receipt settings')
      } else {
        toast.success(language === 'bm' ? '✅ Tetapan resit disimpan!' : '✅ Receipt settings saved!')
        await logActivity(LOG_ACTIONS.SETTING_BULK_UPDATE, 'Receipt settings updated', 'System')
      }
    } catch (err) {
      toast.error('❌ ' + err.message)
    }
    setReceiptLoading(false)
  }

  // ===== UPLOAD RECEIPT LOGO =====
  async function uploadReceiptLogo(file) {
    if (!file) return
    setUploadingReceiptLogo(true)
    
    const fileName = `receipt-logo-${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('restaurant-logos').upload(fileName, file)
    
    if (error) {
      console.error('Upload error:', error)
      toast.error('❌ Gagal upload logo resit')
      setUploadingReceiptLogo(false)
      return
    }
    
    const { data: urlData } = supabase.storage.from('restaurant-logos').getPublicUrl(fileName)
    const logoUrl = urlData.publicUrl
    
    await supabase.from('settings').upsert({ 
      key: 'receipt_logo_url', 
      value: logoUrl 
    }, { onConflict: 'key' })
    
    setReceiptLogoUrl(logoUrl)
    toast.success('✅ Logo resit berjaya dimuat naik!')
    await logActivity(LOG_ACTIONS.SETTING_CHANGE, 'Receipt logo uploaded', 'System')
    setUploadingReceiptLogo(false)
  }

  async function deleteReceiptLogo() {
    if (!receiptLogoUrl) return
    if (!window.confirm('Padam logo resit?')) return
    
    const fileName = receiptLogoUrl.split('/').pop()
    await supabase.storage.from('restaurant-logos').remove([fileName])
    await supabase.from('settings').upsert({ 
      key: 'receipt_logo_url', 
      value: '' 
    }, { onConflict: 'key' })
    
    setReceiptLogoUrl('')
    toast.success('✅ Logo resit dipadam')
    await logActivity(LOG_ACTIONS.DATA_DELETE, 'Receipt logo deleted', 'System')
  }

  function generateReceiptPreview() {
    const {
      receipt_company_name,
      receipt_company_address,
      receipt_company_phone,
      receipt_header,
      receipt_footer,
      receipt_thank_you,
      receipt_show_logo,
      receipt_show_qr,
      receipt_show_items,
      receipt_show_tax,
      receipt_show_service,
      receipt_paper_size,
      receipt_font_size,
    } = receiptSettings

    const isLarge = receipt_paper_size === '80mm'
    const lineLength = isLarge ? 48 : 32
    const line = '─'.repeat(lineLength)
    const doubleLine = '═'.repeat(lineLength)
    
    // Logo - use receipt logo if exists
    const logoLine = receipt_show_logo && receiptLogoUrl 
      ? `  🖼️ [LOGO]` 
      : receipt_show_logo ? '  🏪' : ''

    const preview = `
${doubleLine}
${logoLine}
  ${receipt_company_name}
  ${receipt_company_address}
  Tel: ${receipt_company_phone}
${line}
  Date: ${new Date().toLocaleDateString()}  ${new Date().toLocaleTimeString()}
  Order: #ORD-12345
  Table: 5
  Staff: Ahmad
${line}

  Item          Qty    Price    Total
  ───────────────────────────────────
  Nasi Lemak     2     RM 6.00  RM12.00
  Teh Tarik      1     RM 3.00  RM 3.00
  Roti Canai     1     RM 2.50  RM 2.50
${line}
${receipt_show_items ? `                  Subtotal:  RM17.50` : ''}
${receipt_show_service ? `                  Service:    RM 1.05 (6%)` : ''}
${receipt_show_tax ? `                  Tax:        RM 1.05 (6%)` : ''}
${line}
                  TOTAL:      RM19.60
${line}
  Payment: Cash
  Amount:  RM20.00
  Change:  RM 0.40
${doubleLine}
  ${receipt_header}
  ${receipt_thank_you}
  ${receipt_footer}
${receipt_show_qr ? '  [QR Code]' : ''}
${doubleLine}`

    setReceiptPreview(preview)
  }

  async function uploadLogo(file) {
    if (!file) return
    setUploadingLogo(true)
    const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('restaurant-logos').upload(fileName, file)
    if (error) {
      console.error('Upload error:', error)
      setMessage('❌ ' + t('upload_failed'))
      setUploadingLogo(false)
      return
    }
    const { data: urlData } = supabase.storage.from('restaurant-logos').getPublicUrl(fileName)
    const logoUrl = urlData.publicUrl
    await supabase.from('settings').upsert({ key: 'logo_url', value: logoUrl }, { onConflict: 'key' })
    setSettings(prev => ({ ...prev, logo_url: logoUrl }))
    setMessage('✅ ' + t('logo_uploaded'))
    await logActivity(LOG_ACTIONS.SETTING_CHANGE, 'Logo uploaded', 'System')
    setTimeout(() => setMessage(''), 3000)
    setUploadingLogo(false)
  }

  async function deleteLogo() {
    if (!settings.logo_url) return
    if (!window.confirm(t('delete_image'))) return
    const fileName = settings.logo_url.split('/').pop()
    await supabase.storage.from('restaurant-logos').remove([fileName])
    await supabase.from('settings').upsert({ key: 'logo_url', value: '' }, { onConflict: 'key' })
    setSettings(prev => ({ ...prev, logo_url: '' }))
    setMessage('✅ ' + t('logo_deleted'))
    await logActivity(LOG_ACTIONS.DATA_DELETE, 'Logo deleted', 'System')
    setTimeout(() => setMessage(''), 3000)
  }

  // ============================================================
  // TELEGRAM TEST FUNCTION
  // ============================================================
  async function testTelegram() {
    if (!settings.telegram_bot_token || !settings.telegram_chat_id) {
      toast.error(
        language === 'bm' 
          ? '❌ Sila isi Bot Token dan Chat ID terlebih dahulu' 
          : '❌ Please fill in Bot Token and Chat ID first'
      )
      return
    }

    setTestingTelegram(true)
    
    try {
      const message = language === 'bm' 
        ? '✅ Ujian notifikasi daripada KedaiPOS! Bot berfungsi dengan baik.' 
        : '✅ Test notification from KedaiPOS! Bot is working properly.'
      
      const url = `https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage?chat_id=${settings.telegram_chat_id}&text=${encodeURIComponent(message)}`
      
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.ok) {
        toast.success(
          language === 'bm' 
            ? '✅ Notifikasi berjaya dihantar ke Telegram!' 
            : '✅ Notification sent to Telegram successfully!'
        )
        await logActivity(LOG_ACTIONS.TELEGRAM_TEST, 'Telegram test sent successfully', 'System')
      } else {
        let errorMessage = result.description || 'Unknown error'
        toast.error(
          language === 'bm' 
            ? `❌ Gagal: ${errorMessage}` 
            : `❌ Failed: ${errorMessage}`
        )
        await logActivity(LOG_ACTIONS.TELEGRAM_TEST, `Telegram test failed: ${errorMessage}`, 'System')
      }
    } catch (error) {
      console.error('Telegram test error:', error)
      toast.error(
        language === 'bm' 
          ? `❌ Ralat sambungan: ${error.message}` 
          : `❌ Connection error: ${error.message}`
      )
      await logActivity(LOG_ACTIONS.TELEGRAM_TEST, `Telegram test error: ${error.message}`, 'System')
    }
    
    setTestingTelegram(false)
  }

  async function saveSettings() {
    setSaving(true)
    setMessage('')
    try {
      const updates = [
        { key: 'restaurant_name', value: settings.restaurant_name },
        { key: 'service_charge', value: settings.service_charge.toString() },
        { key: 'tax', value: settings.tax.toString() },
        { key: 'printer_type', value: settings.printer_type },
        { key: 'auto_print', value: settings.auto_print.toString() },
        { key: 'notification_sound', value: settings.notification_sound.toString() },
        { key: 'kitchen_enabled', value: kitchenEnabled.toString() },
        { key: 'special_menu_enabled', value: settings.special_menu_enabled.toString() },
        { key: 'special_menu_title', value: settings.special_menu_title },
        { key: 'business_hours_start', value: settings.business_hours_start },
        { key: 'business_hours_end', value: settings.business_hours_end },
        { key: 'login_welcome_text', value: settings.login_welcome_text },
        { key: 'login_subtitle_text', value: settings.login_subtitle_text },
        { key: 'login_branding_text', value: settings.login_branding_text },
        { key: 'login_footer_text', value: settings.login_footer_text },
        { key: 'auto_complete_enabled', value: settings.auto_complete_enabled.toString() },
        { key: 'auto_complete_minutes', value: settings.auto_complete_minutes.toString() },
        { key: 'auto_print_customer_order', value: settings.auto_print_customer_order.toString() },
        { key: 'telegram_enabled', value: settings.telegram_enabled.toString() },
        { key: 'telegram_bot_token', value: settings.telegram_bot_token },
        { key: 'telegram_chat_id', value: settings.telegram_chat_id },
        { key: 'telegram_notify_new_order', value: settings.telegram_notify_new_order.toString() },
        { key: 'telegram_notify_payment', value: settings.telegram_notify_payment.toString() },
      ]
      let hasError = false
      for (const update of updates) {
        const { error } = await supabase.from('settings').upsert({ key: update.key, value: update.value }, { onConflict: 'key' })
        if (error) { console.error('Error saving:', update.key, error); hasError = true }
      }
      
      await logActivity(LOG_ACTIONS.SETTING_BULK_UPDATE, 'Settings updated', 'System')
      
      if (hasError) {
        setMessage('❌ ' + t('save_error'))
      } else {
        setMessage('✅ ' + t('settings_saved'))
        await loadSettings()
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (err) {
      setMessage('❌ ' + t('error_updating') + ': ' + err.message)
    }
    setSaving(false)
  }

  const updateSetting = (key, value) => { setSettings(prev => ({ ...prev, [key]: value })) }

  // ============================================================
  // SYSTEM LOGS FUNCTIONS
  // ============================================================
  async function loadLogs() {
    setLogsLoading(true)
    try {
      const { data, count, error } = await getLogs({
        page: logsPage,
        limit: logsLimit,
        search: logsSearch,
        action: logsActionFilter,
        username: logsUsernameFilter,
        dateFrom: logsDateFrom,
        dateTo: logsDateTo,
      })
      
      if (!error) {
        setLogs(data || [])
        setLogsCount(count || 0)
      }
    } catch (error) {
      console.error('Error loading logs:', error)
      toast.error(language === 'bm' ? '❌ Gagal memuatkan log' : '❌ Failed to load logs')
    }
    setLogsLoading(false)
  }

  async function handleClearLogs() {
    const confirmMsg = language === 'bm' 
      ? '⚠️ Padam semua log aktiviti?\n\nTindakan ini tidak boleh dibatalkan!'
      : '⚠️ Delete all activity logs?\n\nThis action cannot be undone!'
    
    if (!window.confirm(confirmMsg)) return

    const { error } = await clearLogs()
    if (error) {
      toast.error(language === 'bm' ? '❌ Gagal memadam log' : '❌ Failed to clear logs')
    } else {
      toast.success(language === 'bm' ? '✅ Semua log dipadam' : '✅ All logs cleared')
      await logActivity(LOG_ACTIONS.DATA_DELETE, 'Cleared all system logs', 'System')
      await loadLogs()
    }
  }

  async function handleExportLogs() {
    setLogsExporting(true)
    try {
      const { data } = await getLogs({
        page: 1,
        limit: 10000,
        search: logsSearch,
        action: logsActionFilter,
        username: logsUsernameFilter,
        dateFrom: logsDateFrom,
        dateTo: logsDateTo,
      })

      const csvContent = await exportLogsToCSV(data || [])
      if (!csvContent) {
        toast.info(language === 'bm' ? 'ℹ️ Tiada log untuk dieksport' : 'ℹ️ No logs to export')
        setLogsExporting(false)
        return
      }

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(link.href)

      toast.success(language === 'bm' ? '✅ Log dieksport!' : '✅ Logs exported!')
      await logActivity(LOG_ACTIONS.DATA_EXPORT, 'Exported system logs to CSV', 'System')
    } catch (error) {
      console.error('Export error:', error)
      toast.error(language === 'bm' ? '❌ Gagal eksport log' : '❌ Failed to export logs')
    }
    setLogsExporting(false)
  }

  // ============================================================
  // DELETE DATA FUNCTIONS
  // ============================================================
  async function deleteAllOrders() {
    try {
      const { data, error } = await supabase.from('customer_orders').delete().neq('id', 0)
      if (error) throw error
      toast.success(language === 'bm' ? '✅ Semua pesanan dipadam!' : '✅ All orders deleted!')
      await logActivity(LOG_ACTIONS.DATA_DELETE, `Deleted ${data?.length || 0} orders`, 'System')
      setShowConfirmModal(null)
    } catch (error) {
      toast.error('❌ ' + error.message)
    }
  }

  async function deleteAllMenu() {
    try {
      const { data, error } = await supabase.from('menu').delete().neq('id', 0)
      if (error) throw error
      await supabase.from('drink_options').delete().neq('id', 0)
      await supabase.from('menu_options').delete().neq('id', 0)
      toast.success(language === 'bm' ? '✅ Semua menu dipadam!' : '✅ All menu deleted!')
      await logActivity(LOG_ACTIONS.DATA_DELETE, `Deleted ${data?.length || 0} menu items`, 'System')
      setShowConfirmModal(null)
    } catch (error) {
      toast.error('❌ ' + error.message)
    }
  }

  async function deleteAllCategories() {
    try {
      const { data, error } = await supabase.from('categories').delete().neq('id', 0)
      if (error) throw error
      toast.success(language === 'bm' ? '✅ Semua kategori dipadam!' : '✅ All categories deleted!')
      await logActivity(LOG_ACTIONS.DATA_DELETE, `Deleted ${data?.length || 0} categories`, 'System')
      setShowConfirmModal(null)
    } catch (error) {
      toast.error('❌ ' + error.message)
    }
  }

  async function deleteAllCustomers() {
    try {
      const { data, error } = await supabase.from('customers').delete().neq('id', 0)
      if (error) throw error
      toast.success(language === 'bm' ? '✅ Semua pelanggan dipadam!' : '✅ All customers deleted!')
      await logActivity(LOG_ACTIONS.DATA_DELETE, `Deleted ${data?.length || 0} customers`, 'System')
      setShowConfirmModal(null)
    } catch (error) {
      toast.error('❌ ' + error.message)
    }
  }

  async function deleteAllStaff() {
    try {
      let error = null
      const { data: data1, error: err1 } = await supabase.from('profiles').delete().neq('username', 'admin')
      if (err1) {
        const { data: data2, error: err2 } = await supabase.from('users').delete().neq('username', 'admin')
        if (err2) {
          const { data: data3, error: err3 } = await supabase.from('staff').delete().neq('username', 'admin')
          if (err3) error = err3
        }
      }
      if (error) throw error
      toast.success(language === 'bm' ? '✅ Semua staff dipadam!' : '✅ All staff deleted!')
      await logActivity(LOG_ACTIONS.DATA_DELETE, 'Deleted all staff (except admin)', 'System')
      setShowConfirmModal(null)
    } catch (error) {
      toast.error('❌ ' + error.message)
    }
  }

  async function deleteAllTables() {
    try {
      const { data, error } = await supabase.from('tables').delete().neq('id', 0)
      if (error) throw error
      toast.success(language === 'bm' ? '✅ Semua meja dipadam!' : '✅ All tables deleted!')
      await logActivity(LOG_ACTIONS.DATA_DELETE, `Deleted ${data?.length || 0} tables`, 'System')
      setShowConfirmModal(null)
    } catch (error) {
      toast.error('❌ ' + error.message)
    }
  }

  async function deleteAllPayments() {
    try {
      const { data, error } = await supabase.from('payments').delete().neq('id', 0)
      if (error) throw error
      toast.success(language === 'bm' ? '✅ Semua pembayaran dipadam!' : '✅ All payments deleted!')
      await logActivity(LOG_ACTIONS.DATA_DELETE, `Deleted ${data?.length || 0} payments`, 'System')
      setShowConfirmModal(null)
    } catch (error) {
      toast.error('❌ ' + error.message)
    }
  }

  async function deleteAllSettings() {
    try {
      const defaultSettings = [
        { key: 'restaurant_name', value: 'KedaiPOS' },
        { key: 'service_charge', value: '6' },
        { key: 'tax', value: '6' },
        { key: 'printer_type', value: 'thermal' },
        { key: 'auto_print', value: 'true' },
        { key: 'notification_sound', value: 'true' },
        { key: 'kitchen_enabled', value: 'true' },
        { key: 'special_menu_enabled', value: 'false' },
        { key: 'special_menu_title', value: 'Istimewa Hari Ini' },
        { key: 'business_hours_start', value: '09:00' },
        { key: 'business_hours_end', value: '22:00' },
        { key: 'login_welcome_text', value: 'Welcome Back!' },
        { key: 'login_subtitle_text', value: 'Please sign in to continue' },
        { key: 'login_branding_text', value: 'POS System for Small & Medium Restaurants' },
        { key: 'login_footer_text', value: '© 2024 KedaiPOS • POS System' },
        { key: 'auto_complete_enabled', value: 'true' },
        { key: 'auto_complete_minutes', value: '5' },
        { key: 'auto_print_customer_order', value: 'true' },
        { key: 'telegram_enabled', value: 'false' },
        { key: 'telegram_bot_token', value: '' },
        { key: 'telegram_chat_id', value: '' },
        { key: 'telegram_notify_new_order', value: 'true' },
        { key: 'telegram_notify_payment', value: 'true' },
      ]
      
      await supabase.from('settings').delete().neq('key', '')
      
      for (const setting of defaultSettings) {
        await supabase.from('settings').upsert({ key: setting.key, value: setting.value }, { onConflict: 'key' })
      }
      
      toast.success(language === 'bm' ? '✅ Semua tetapan direset ke default!' : '✅ All settings reset to default!')
      await logActivity(LOG_ACTIONS.SETTING_BULK_UPDATE, 'Settings reset to default', 'System')
      setShowConfirmModal(null)
      await loadSettings()
    } catch (error) {
      toast.error('❌ ' + error.message)
    }
  }

  async function deleteAllLogs() {
    try {
      const { data, error } = await supabase.from('system_logs').delete().neq('id', 0)
      if (error) {
        toast.info(language === 'bm' ? 'ℹ️ Tiada log untuk dipadam' : 'ℹ️ No logs to delete')
        setShowConfirmModal(null)
        return
      }
      toast.success(language === 'bm' ? '✅ Semua log dipadam!' : '✅ All logs deleted!')
      await logActivity(LOG_ACTIONS.DATA_DELETE, `Deleted ${data?.length || 0} logs`, 'System')
      setShowConfirmModal(null)
    } catch (error) {
      toast.error('❌ ' + error.message)
    }
  }

  async function resetAllData() {
    try {
      const tables = ['customer_orders', 'menu', 'categories', 'tables', 'customers', 'payments']
      for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', 0)
        if (error) console.error(`Error deleting ${table}:`, error)
      }
      
      await supabase.from('drink_options').delete().neq('id', 0)
      await supabase.from('menu_options').delete().neq('id', 0)
      
      const defaultSettings = [
        { key: 'restaurant_name', value: 'KedaiPOS' },
        { key: 'service_charge', value: '6' },
        { key: 'tax', value: '6' },
        { key: 'printer_type', value: 'thermal' },
        { key: 'auto_print', value: 'true' },
        { key: 'notification_sound', value: 'true' },
        { key: 'kitchen_enabled', value: 'true' },
        { key: 'special_menu_enabled', value: 'false' },
        { key: 'special_menu_title', value: 'Istimewa Hari Ini' },
        { key: 'business_hours_start', value: '09:00' },
        { key: 'business_hours_end', value: '22:00' },
        { key: 'login_welcome_text', value: 'Welcome Back!' },
        { key: 'login_subtitle_text', value: 'Please sign in to continue' },
        { key: 'login_branding_text', value: 'POS System for Small & Medium Restaurants' },
        { key: 'login_footer_text', value: '© 2024 KedaiPOS • POS System' },
        { key: 'auto_complete_enabled', value: 'true' },
        { key: 'auto_complete_minutes', value: '5' },
        { key: 'auto_print_customer_order', value: 'true' },
        { key: 'telegram_enabled', value: 'false' },
        { key: 'telegram_bot_token', value: '' },
        { key: 'telegram_chat_id', value: '' },
        { key: 'telegram_notify_new_order', value: 'true' },
        { key: 'telegram_notify_payment', value: 'true' },
      ]
      
      for (const setting of defaultSettings) {
        await supabase.from('settings').upsert({ key: setting.key, value: setting.value }, { onConflict: 'key' })
      }
      
      toast.success(language === 'bm' ? '✅ Semua data direset!' : '✅ All data reset!')
      await logActivity(LOG_ACTIONS.DATA_DELETE, 'Reset ALL data', 'System')
      setShowConfirmModal(null)
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      toast.error('❌ ' + error.message)
    }
  }

  // ============================================================
  // DELETE ACTIONS CONFIGURATION
  // ============================================================
  const deleteActions = {
    orders: { 
      icon: '📋', 
      title: { en: 'Delete All Orders', ms: 'Padam Semua Pesanan' },
      desc: { en: 'Delete all order records permanently', ms: 'Padam semua rekod pesanan secara kekal' },
      action: deleteAllOrders
    },
    menu: { 
      icon: '🍽️', 
      title: { en: 'Delete All Menu', ms: 'Padam Semua Menu' },
      desc: { en: 'Delete all menu items and options', ms: 'Padam semua item menu dan pilihan' },
      action: deleteAllMenu
    },
    categories: { 
      icon: '📂', 
      title: { en: 'Delete All Categories', ms: 'Padam Semua Kategori' },
      desc: { en: 'Delete all categories permanently', ms: 'Padam semua kategori secara kekal' },
      action: deleteAllCategories
    },
    customers: { 
      icon: '👤', 
      title: { en: 'Delete All Customers', ms: 'Padam Semua Pelanggan' },
      desc: { en: 'Delete all customer records', ms: 'Padam semua rekod pelanggan' },
      action: deleteAllCustomers
    },
    staff: { 
      icon: '👥', 
      title: { en: 'Delete All Staff', ms: 'Padam Semua Staff' },
      desc: { en: 'Delete all staff (except admin)', ms: 'Padam semua staff (kecuali admin)' },
      action: deleteAllStaff
    },
    tables: { 
      icon: '🪑', 
      title: { en: 'Delete All Tables', ms: 'Padam Semua Meja' },
      desc: { en: 'Delete all table records', ms: 'Padam semua rekod meja' },
      action: deleteAllTables
    },
    payments: { 
      icon: '💳', 
      title: { en: 'Delete All Payments', ms: 'Padam Semua Pembayaran' },
      desc: { en: 'Delete all payment records', ms: 'Padam semua rekod pembayaran' },
      action: deleteAllPayments
    },
    settings_reset: { 
      icon: '⚙️', 
      title: { en: 'Reset All Settings', ms: 'Reset Semua Tetapan' },
      desc: { en: 'Reset all settings to default values', ms: 'Reset semua tetapan ke nilai default' },
      color: '#f59e0b',
      action: deleteAllSettings
    },
    logs: { 
      icon: '📜', 
      title: { en: 'Delete All Logs', ms: 'Padam Semua Log' },
      desc: { en: 'Delete all system activity logs', ms: 'Padam semua log aktiviti sistem' },
      color: '#f59e0b',
      action: deleteAllLogs
    },
    reset_all: { 
      icon: '⚠️', 
      title: { en: 'Reset ALL Data', ms: 'Reset SEMUA Data' },
      desc: { en: 'Delete ALL data and reset everything to default', ms: 'Padam SEMUA data dan reset semua ke default' },
      color: '#dc2626',
      isDanger: true,
      action: resetAllData
    }
  }

  const openConfirmModal = (key) => {
    const item = deleteActions[key]
    setShowConfirmModal({
      key: key,
      title: item.title,
      desc: item.desc,
      action: item.action,
      isDanger: item.isDanger || false,
      color: item.color || '#ef4444'
    })
  }

  // ============================================================
  // RENDER COMPONENTS
  // ============================================================
  const Section = ({ icon, title, children }) => (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <h3 style={{ margin: 0, color: textColor, fontSize: '17px', fontWeight: 'bold' }}>{title}</h3>
      </div>
      {children}
    </div>
  )

  const SettingRow = ({ icon, label, description, children, isDanger = false }) => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '14px 16px',
      background: isDanger ? 'rgba(239, 68, 68, 0.05)' : secondaryBg,
      borderRadius: '14px',
      marginBottom: '10px',
      flexWrap: 'wrap',
      gap: '10px',
      border: isDanger ? `1px solid rgba(239, 68, 68, 0.3)` : 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <div>
          <div style={{ fontWeight: '600', fontSize: '14px', color: isDanger ? danger : textColor }}>{label}</div>
          {description && <div style={{ fontSize: '11px', color: isDanger ? danger : textMuted }}>{description}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 180px', justifyContent: 'flex-end' }}>
        {children}
      </div>
    </div>
  )

  if (loading) {
    return (
      <Sidebar>
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', background: bgColor, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="spinner"></div>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', background: bgColor, minHeight: '100vh' }}>
        
        {/* ===== HEADER ===== */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #6c757d, #495057)',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              boxShadow: '0 8px 20px rgba(108,117,125,0.3)'
            }}>
              ⚙️
            </div>
            <div>
              <h1 style={{ margin: 0, color: textColor, fontSize: '28px', fontWeight: 'bold' }}>
                {t('system_settings')}
              </h1>
              <p style={{ color: textMuted, marginTop: '4px', fontSize: '14px' }}>
                {language === 'bm' ? 'Urus tetapan sistem restoran anda' : 'Manage your restaurant system settings'}
              </p>
            </div>
          </div>
          <div style={{ 
            height: '4px', 
            width: '80px', 
            background: 'linear-gradient(135deg, #6c757d, #3b82f6)', 
            borderRadius: '4px',
            marginTop: '8px'
          }} />
        </div>

        {/* ===== TAB NAVIGATION ===== */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px',
          flexWrap: 'wrap',
          background: secondaryBg,
          padding: '8px',
          borderRadius: '48px',
          border: `1px solid ${borderColor}`
        }}>
          <button 
            onClick={() => setActiveTab('settings')}
            style={tabButtonStyle(activeTab === 'settings')}
          >
            ⚙️ {language === 'bm' ? 'Tetapan' : 'Settings'}
          </button>
          <button 
            onClick={() => setActiveTab('telegram')}
            style={tabButtonStyle(activeTab === 'telegram')}
          >
            📱 {language === 'bm' ? 'Telegram' : 'Telegram'}
          </button>
          <button 
            onClick={() => setActiveTab('receipt')}
            style={tabButtonStyle(activeTab === 'receipt')}
          >
            🧾 {language === 'bm' ? 'Resit' : 'Receipt'}
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            style={tabButtonStyle(activeTab === 'data')}
          >
            🗑️ {language === 'bm' ? 'Padam Data' : 'Delete Data'}
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            style={tabButtonStyle(activeTab === 'logs')}
          >
            📋 {language === 'bm' ? 'Log' : 'Logs'}
          </button>
        </div>

        {/* ===== MESSAGE ALERT ===== */}
        {message && (
          <div style={{ 
            background: message.includes('✅') ? '#dcfce7' : '#fee2e2', 
            color: message.includes('✅') ? '#166534' : '#991b1b', 
            padding: '14px 20px', 
            borderRadius: '60px', 
            marginBottom: '24px', 
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 1: SETTINGS */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <div style={{ ...glassEffect, borderRadius: '28px', padding: '28px' }}>
            
            {/* 🌐 Language */}
            <Section icon="🌐" title={t('language')}>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)} 
                style={inputStyle}
              >
                <option value="bm">🇲🇾 Bahasa Melayu</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </Section>

            {/* 🏪 Restaurant Info */}
            <Section icon="🏪" title={language === 'bm' ? 'Maklumat Restoran' : 'Restaurant Info'}>
              <SettingRow 
                icon="🖼️" 
                label={t('restaurant_logo')}
                description={language === 'bm' ? 'JPG, PNG (Saiz terbaik: 200x200px)' : 'JPG, PNG (Best size: 200x200px)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {settings.logo_url ? (
                    <div style={{ position: 'relative' }}>
                      <img src={settings.logo_url} alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px', border: `1px solid ${borderColor}` }} />
                      <button onClick={deleteLogo} style={{ position: 'absolute', top: '-6px', right: '-6px', background: danger, color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ width: '48px', height: '48px', background: secondaryBg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${borderColor}` }}>
                      <span style={{ fontSize: '24px' }}>🏪</span>
                    </div>
                  )}
                  <div>
                    <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) uploadLogo(e.target.files[0]) }} style={{ display: 'none' }} id="logo-upload" />
                    <label htmlFor="logo-upload" style={{ display: 'inline-block', background: primaryGradient, color: 'white', padding: '6px 14px', borderRadius: '30px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      {uploadingLogo ? '⏳' : '📤'}
                    </label>
                  </div>
                </div>
              </SettingRow>

              <SettingRow 
                icon="📛" 
                label={t('restaurant_name')}
              >
                <input 
                  type="text" 
                  value={settings.restaurant_name} 
                  onChange={(e) => updateSetting('restaurant_name', e.target.value)} 
                  style={{ ...inputStyle, maxWidth: '250px' }} 
                />
              </SettingRow>
            </Section>

            {/* 💰 Tax & Service Charge */}
            <Section icon="💰" title={language === 'bm' ? 'Cukai & Caj Perkhidmatan' : 'Tax & Service Charge'}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <SettingRow 
                  icon="🧾" 
                  label={t('service_charge') + ' (%)'}
                >
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0" 
                    max="100" 
                    value={settings.service_charge} 
                    onChange={(e) => updateSetting('service_charge', parseFloat(e.target.value) || 0)} 
                    style={{ ...inputStyle, maxWidth: '100px' }} 
                  />
                </SettingRow>
                <SettingRow 
                  icon="🏛️" 
                  label={t('tax') + ' (%)'}
                >
                  <input 
                    type="number" 
                    step="0.5" 
                    min="0" 
                    max="100" 
                    value={settings.tax} 
                    onChange={(e) => updateSetting('tax', parseFloat(e.target.value) || 0)} 
                    style={{ ...inputStyle, maxWidth: '100px' }} 
                  />
                </SettingRow>
              </div>
            </Section>

            {/* 🖨️ Printing */}
            <Section icon="🖨️" title={language === 'bm' ? 'Pencetakan' : 'Printing'}>
              <SettingRow 
                icon="🖨️" 
                label={t('printer_type')}
              >
                <select 
                  value={settings.printer_type} 
                  onChange={(e) => updateSetting('printer_type', e.target.value)} 
                  style={{ ...inputStyle, maxWidth: '200px' }}
                >
                  <option value="thermal">🖨️ {t('thermal_printer')}</option>
                  <option value="a4">📄 {t('a4_printer')}</option>
                  <option value="none">❌ {t('no_printer')}</option>
                </select>
              </SettingRow>

              <SettingRow 
                icon="🖨️" 
                label={t('auto_print')}
                description={language === 'bm' ? 'Cetak resit secara automatik' : 'Auto print receipt'}
              >
                {toggleSwitch(settings.auto_print, (val) => updateSetting('auto_print', val))}
              </SettingRow>

              <SettingRow 
                icon="🔔" 
                label={t('notification_sound')}
                description={language === 'bm' ? 'Bunyi notifikasi untuk pesanan baru' : 'Notification sound for new orders'}
              >
                {toggleSwitch(settings.notification_sound, (val) => updateSetting('notification_sound', val))}
              </SettingRow>
            </Section>

            {/* 🧾 Customer Order Auto Print */}
            <Section icon="🧾" title={language === 'bm' ? 'Cetakan Pesanan Pelanggan' : 'Customer Order Printing'}>
              <SettingRow 
                icon="🧾" 
                label={language === 'bm' ? 'Cetak Resit Pelanggan' : 'Print Customer Receipt'}
                description={language === 'bm' ? 'Cetak resit pelanggan secara automatik' : 'Auto print customer receipt'}
              >
                {toggleSwitch(settings.auto_print_customer_order, (val) => updateSetting('auto_print_customer_order', val))}
              </SettingRow>
            </Section>

            {/* 🍳 Kitchen */}
            <Section icon="🍳" title={language === 'bm' ? 'Dapur Digital' : 'Digital Kitchen'}>
              <SettingRow 
                icon="🍳" 
                label={t('kitchen_app')}
                description={language === 'bm' ? 'Hidupkan/matikan modul dapur' : 'Enable/disable kitchen module'}
              >
                {toggleSwitch(kitchenEnabled, setKitchenEnabled)}
              </SettingRow>

              {!kitchenEnabled && (
                <>
                  <SettingRow 
                    icon="⏱️" 
                    label={t('auto_complete')}
                    description={language === 'bm' ? 'Lengkapkan pesanan secara automatik' : 'Auto complete orders'}
                  >
                    {toggleSwitch(settings.auto_complete_enabled, (val) => updateSetting('auto_complete_enabled', val))}
                  </SettingRow>

                  {settings.auto_complete_enabled && (
                    <SettingRow 
                      icon="⏱️" 
                      label={language === 'bm' ? 'Minit Untuk Lengkap' : 'Minutes To Complete'}
                    >
                      <input 
                        type="number" 
                        min="1" 
                        max="30" 
                        value={settings.auto_complete_minutes} 
                        onChange={(e) => updateSetting('auto_complete_minutes', parseInt(e.target.value) || 5)} 
                        style={{ ...inputStyle, maxWidth: '100px' }} 
                      />
                    </SettingRow>
                  )}
                </>
              )}
            </Section>

            {/* ⭐ Special Menu */}
            <Section icon="⭐" title={language === 'bm' ? 'Menu Istimewa' : 'Special Menu'}>
              <SettingRow 
                icon="⭐" 
                label={t('enable_special_menu')}
                description={language === 'bm' ? 'Paparkan menu istimewa di laman utama' : 'Display special menu on main page'}
              >
                {toggleSwitch(settings.special_menu_enabled, (val) => updateSetting('special_menu_enabled', val))}
              </SettingRow>

              {settings.special_menu_enabled && (
                <SettingRow 
                  icon="📝" 
                  label={t('special_menu_title')}
                >
                  <input 
                    type="text" 
                    value={settings.special_menu_title} 
                    onChange={(e) => updateSetting('special_menu_title', e.target.value)} 
                    style={{ ...inputStyle, maxWidth: '250px' }} 
                  />
                </SettingRow>
              )}
            </Section>

            {/* ⏰ Business Hours */}
            <Section icon="⏰" title={t('business_hours')}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <SettingRow 
                  icon="🕐" 
                  label={t('start')}
                >
                  <input 
                    type="time" 
                    value={settings.business_hours_start} 
                    onChange={(e) => updateSetting('business_hours_start', e.target.value)} 
                    style={{ ...inputStyle, maxWidth: '150px' }} 
                  />
                </SettingRow>
                <SettingRow 
                  icon="🕐" 
                  label={t('end')}
                >
                  <input 
                    type="time" 
                    value={settings.business_hours_end} 
                    onChange={(e) => updateSetting('business_hours_end', e.target.value)} 
                    style={{ ...inputStyle, maxWidth: '150px' }} 
                  />
                </SettingRow>
              </div>
            </Section>

            {/* 🔐 Login Page */}
            <Section icon="🔐" title={t('login_page')}>
              <SettingRow 
                icon="👋" 
                label={t('welcome_text')}
              >
                <input 
                  type="text" 
                  value={settings.login_welcome_text} 
                  onChange={(e) => updateSetting('login_welcome_text', e.target.value)} 
                  style={{ ...inputStyle, maxWidth: '250px' }} 
                />
              </SettingRow>
              <SettingRow 
                icon="📝" 
                label={t('subtitle_text')}
              >
                <input 
                  type="text" 
                  value={settings.login_subtitle_text} 
                  onChange={(e) => updateSetting('login_subtitle_text', e.target.value)} 
                  style={{ ...inputStyle, maxWidth: '250px' }} 
                />
              </SettingRow>
              <SettingRow 
                icon="⭐" 
                label={t('branding_text')}
              >
                <input 
                  type="text" 
                  value={settings.login_branding_text} 
                  onChange={(e) => updateSetting('login_branding_text', e.target.value)} 
                  style={{ ...inputStyle, maxWidth: '300px' }} 
                />
              </SettingRow>
              <SettingRow 
                icon="©️" 
                label={t('footer_text')}
              >
                <input 
                  type="text" 
                  value={settings.login_footer_text} 
                  onChange={(e) => updateSetting('login_footer_text', e.target.value)} 
                  style={{ ...inputStyle, maxWidth: '300px' }} 
                />
              </SettingRow>
            </Section>

            {/* 📊 Preview */}
            <Section icon="📊" title={t('preview')}>
              <div style={{ background: secondaryBg, borderRadius: '20px', padding: '20px' }}>
                <div style={{ fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: textColor }}>
                    <span>{t('subtotal')} ({t('example')}):</span>
                    <span>RM 100.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: textColor }}>
                    <span>{t('service_charge')} ({settings.service_charge}%):</span>
                    <span>RM {(100 * settings.service_charge / 100).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: textColor }}>
                    <span>{t('tax')} ({settings.tax}%):</span>
                    <span>RM {(100 * settings.tax / 100).toFixed(2)}</span>
                  </div>
                  <div style={{ borderTop: `1px solid ${borderColor}`, margin: '14px 0', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                    <span style={{ color: textColor }}>{t('total')}:</span>
                    <span style={{ color: success }}>RM {(100 + (100 * settings.service_charge / 100) + (100 * settings.tax / 100)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* 💾 Save Button */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                onClick={saveSettings} 
                disabled={saving} 
                style={{ 
                  flex: 1, 
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                  color: 'white', 
                  padding: '14px', 
                  border: 'none', 
                  borderRadius: '60px', 
                  fontSize: '15px', 
                  fontWeight: 'bold', 
                  cursor: saving ? 'not-allowed' : 'pointer', 
                  opacity: saving ? 0.7 : 1,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {saving ? '⏳ ' + t('saving') : '💾 ' + t('save')}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: TELEGRAM */}
        {/* ============================================================ */}
        {activeTab === 'telegram' && (
          <div style={{ ...glassEffect, borderRadius: '28px', padding: '28px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #0088cc, #006699)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                📱
              </div>
              <div>
                <h3 style={{ margin: 0, color: textColor, fontSize: '20px', fontWeight: 'bold' }}>
                  {language === 'bm' ? 'Notifikasi Telegram' : 'Telegram Notifications'}
                </h3>
                <p style={{ color: textMuted, marginTop: '4px', fontSize: '13px' }}>
                  {language === 'bm' 
                    ? 'Hantar notifikasi ke Telegram untuk pesanan dan pembayaran' 
                    : 'Send notifications to Telegram for orders and payments'}
                </p>
              </div>
            </div>

            {/* Status */}
            <SettingRow 
              icon="🔔" 
              label={language === 'bm' ? 'Status Notifikasi' : 'Notification Status'}
              description={language === 'bm' ? 'Hidupkan untuk menghantar notifikasi ke Telegram' : 'Enable to send notifications to Telegram'}
            >
              {toggleSwitch(settings.telegram_enabled, (val) => updateSetting('telegram_enabled', val))}
            </SettingRow>

            {/* Bot Token */}
            <SettingRow 
              icon="🤖" 
              label={language === 'bm' ? 'Bot Token' : 'Bot Token'}
              description={language === 'bm' ? 'Token daripada @BotFather' : 'Token from @BotFather'}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input 
                  type={settings.telegram_bot_token ? 'password' : 'text'} 
                  placeholder="1234567890:ABCdefGHIjkl..." 
                  value={settings.telegram_bot_token} 
                  onChange={(e) => updateSetting('telegram_bot_token', e.target.value)} 
                  style={{ ...inputStyle, maxWidth: '250px', fontFamily: 'monospace', fontSize: '12px' }} 
                />
                {settings.telegram_bot_token && (
                  <button 
                    onClick={() => {
                      if (window.confirm(language === 'bm' ? 'Padam token bot?' : 'Delete bot token?')) {
                        updateSetting('telegram_bot_token', '')
                        toast.success(language === 'bm' ? '✅ Token dipadam' : '✅ Token deleted')
                        logActivity(LOG_ACTIONS.TELEGRAM_RESET, 'Bot token cleared', 'System')
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      background: danger,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    ✕ {language === 'bm' ? 'Padam' : 'Clear'}
                  </button>
                )}
              </div>
            </SettingRow>

            {/* Chat ID */}
            <SettingRow 
              icon="💬" 
              label={language === 'bm' ? 'Chat ID' : 'Chat ID'}
              description={language === 'bm' ? 'ID pengguna atau kumpulan' : 'User or group ID'}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="-1001234567890" 
                  value={settings.telegram_chat_id} 
                  onChange={(e) => updateSetting('telegram_chat_id', e.target.value)} 
                  style={{ ...inputStyle, maxWidth: '200px', fontFamily: 'monospace', fontSize: '12px' }} 
                />
                {settings.telegram_chat_id && (
                  <button 
                    onClick={() => {
                      if (window.confirm(language === 'bm' ? 'Padam Chat ID?' : 'Delete Chat ID?')) {
                        updateSetting('telegram_chat_id', '')
                        toast.success(language === 'bm' ? '✅ Chat ID dipadam' : '✅ Chat ID deleted')
                        logActivity(LOG_ACTIONS.TELEGRAM_RESET, 'Chat ID cleared', 'System')
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      background: danger,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    ✕ {language === 'bm' ? 'Padam' : 'Clear'}
                  </button>
                )}
              </div>
            </SettingRow>

            {/* Cara Dapatkan Chat ID */}
            <div style={{ 
              ...cardStyle, 
              marginTop: '4px',
              background: darkMode ? 'rgba(34, 197, 94, 0.08)' : '#f0fdf4',
              borderColor: '#22c55e'
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: textColor, fontSize: '13px' }}>
                    {language === 'bm' ? '📌 Cara Mudah Dapatkan Chat ID:' : '📌 Easy Way to Get Chat ID:'}
                  </div>
                  <ol style={{ color: textMuted, fontSize: '12px', paddingLeft: '20px', marginTop: '4px', lineHeight: '1.8' }}>
                    <li>{language === 'bm' ? 'Buka Telegram dan cari @userinfobot' : 'Open Telegram and search for @userinfobot'}</li>
                    <li>{language === 'bm' ? 'Klik "Start" atau hantar /start' : 'Click "Start" or send /start'}</li>
                    <li>{language === 'bm' ? 'Bot akan tunjukkan ID anda - salin dan tampal di atas' : 'Bot will show your ID - copy and paste above'}</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Notify New Order */}
            <SettingRow 
              icon="🆕" 
              label={language === 'bm' ? 'Notifikasi Pesanan Baru' : 'Notify New Order'}
              description={language === 'bm' ? 'Hantar notifikasi bila ada pesanan baru' : 'Send notification when new order is placed'}
            >
              {toggleSwitch(settings.telegram_notify_new_order, (val) => updateSetting('telegram_notify_new_order', val))}
            </SettingRow>

            {/* Notify Payment */}
            <SettingRow 
              icon="💳" 
              label={language === 'bm' ? 'Notifikasi Pembayaran' : 'Notify Payment'}
              description={language === 'bm' ? 'Hantar notifikasi bila pembayaran diterima' : 'Send notification when payment is received'}
            >
              {toggleSwitch(settings.telegram_notify_payment, (val) => updateSetting('telegram_notify_payment', val))}
            </SettingRow>

            {/* Test Button */}
            <div style={{ 
              ...cardStyle, 
              border: `2px solid ${settings.telegram_enabled ? '#22c55e' : '#64748b'}`,
              background: settings.telegram_enabled ? 'rgba(34, 197, 94, 0.05)' : secondaryBg,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '16px'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: textColor }}>
                  📨 {language === 'bm' ? 'Uji Notifikasi' : 'Test Notification'}
                </div>
                <div style={{ fontSize: '12px', color: textMuted }}>
                  {language === 'bm' 
                    ? 'Hantar mesej ujian ke Telegram untuk memastikan konfigurasi betul' 
                    : 'Send a test message to Telegram to verify configuration'}
                </div>
              </div>
              <button 
                onClick={testTelegram}
                disabled={testingTelegram || !settings.telegram_enabled || !settings.telegram_bot_token || !settings.telegram_chat_id}
                style={{
                  padding: '10px 24px',
                  background: (settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id) 
                    ? 'linear-gradient(135deg, #0088cc, #006699)' 
                    : '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '40px',
                  cursor: (settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id && !testingTelegram) 
                    ? 'pointer' 
                    : 'not-allowed',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  opacity: (settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id) ? 1 : 0.6,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => (settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id && !testingTelegram) 
                  && (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {testingTelegram ? '⏳ Menghantar...' : '📨 ' + (language === 'bm' ? 'Uji Sekarang' : 'Test Now')}
              </button>
            </div>

            {/* Butang Reset & Save */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button 
                onClick={saveSettings} 
                disabled={saving} 
                style={{ 
                  flex: 2,
                  minWidth: '150px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                  color: 'white', 
                  padding: '14px', 
                  border: 'none', 
                  borderRadius: '60px', 
                  fontSize: '15px', 
                  fontWeight: 'bold', 
                  cursor: saving ? 'not-allowed' : 'pointer', 
                  opacity: saving ? 0.7 : 1,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => !saving && (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {saving ? '⏳ ' + t('saving') : '💾 ' + t('save')}
              </button>

              <button 
                onClick={() => {
                  const confirmMsg = language === 'bm' 
                    ? '⚠️ Reset semua tetapan Telegram?\n\nToken, Chat ID, dan semua notifikasi akan dipadam.\n\nTindakan ini tidak boleh dibatalkan!'
                    : '⚠️ Reset all Telegram settings?\n\nToken, Chat ID, and all notifications will be cleared.\n\nThis action cannot be undone!'
                  
                  if (window.confirm(confirmMsg)) {
                    updateSetting('telegram_enabled', false)
                    updateSetting('telegram_bot_token', '')
                    updateSetting('telegram_chat_id', '')
                    updateSetting('telegram_notify_new_order', true)
                    updateSetting('telegram_notify_payment', true)
                    toast.success(language === 'bm' ? '✅ Semua tetapan Telegram direset' : '✅ All Telegram settings reset')
                    logActivity(LOG_ACTIONS.TELEGRAM_RESET, 'All Telegram settings reset', 'System')
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '14px 20px',
                  background: 'transparent',
                  color: danger,
                  border: `2px solid ${danger}`,
                  borderRadius: '60px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = danger
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = danger
                }}
              >
                🔄 {language === 'bm' ? 'Reset Semua' : 'Reset All'}
              </button>
            </div>

            {/* Status Bar */}
            <div style={{ 
              marginTop: '16px',
              padding: '12px 16px',
              background: secondaryBg,
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              border: `1px solid ${borderColor}`
            }}>
              <div style={{ fontSize: '12px', color: textMuted }}>
                {language === 'bm' ? 'Status:' : 'Status:'}
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: settings.telegram_bot_token ? success : textMuted }}>
                  {settings.telegram_bot_token ? '✅ Token' : '❌ Token'}
                </span>
                <span style={{ fontSize: '12px', color: settings.telegram_chat_id ? success : textMuted }}>
                  {settings.telegram_chat_id ? '✅ Chat ID' : '❌ Chat ID'}
                </span>
                <span style={{ fontSize: '12px', color: settings.telegram_enabled ? success : textMuted }}>
                  {settings.telegram_enabled ? '✅ Aktif' : '❌ Tidak Aktif'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: RECEIPT CUSTOMIZATION */}
        {/* ============================================================ */}
        {activeTab === 'receipt' && (
          <div style={{ ...glassEffect, borderRadius: '28px', padding: '28px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px'
              }}>
                🧾
              </div>
              <div>
                <h3 style={{ margin: 0, color: textColor, fontSize: '20px', fontWeight: 'bold' }}>
                  {language === 'bm' ? 'Customize Resit' : 'Receipt Customization'}
                </h3>
                <p style={{ color: textMuted, marginTop: '4px', fontSize: '13px' }}>
                  {language === 'bm' 
                    ? 'Ubah rupa dan kandungan resit anda' 
                    : 'Customize your receipt appearance and content'}
                </p>
              </div>
            </div>

            {/* ===== LOGO RESIT - TAMBAHAN BARU ===== */}
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', color: textColor, marginBottom: '12px' }}>
                🖼️ {language === 'bm' ? 'Logo Resit' : 'Receipt Logo'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {receiptLogoUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={receiptLogoUrl} 
                      alt="Receipt Logo" 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'contain', 
                        borderRadius: '10px', 
                        border: `1px solid ${borderColor}`,
                        background: 'white',
                        padding: '4px'
                      }} 
                    />
                    <button 
                      onClick={deleteReceiptLogo}
                      style={{ 
                        position: 'absolute', 
                        top: '-8px', 
                        right: '-8px', 
                        background: danger, 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '22px', 
                        height: '22px', 
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: secondaryBg, 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: `1px solid ${borderColor}`,
                    fontSize: '32px'
                  }}>
                    🏪
                  </div>
                )}
                <div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => { if (e.target.files[0]) uploadReceiptLogo(e.target.files[0]) }} 
                    style={{ display: 'none' }} 
                    id="receipt-logo-upload" 
                  />
                  <label 
                    htmlFor="receipt-logo-upload" 
                    style={{ 
                      display: 'inline-block', 
                      background: primaryGradient, 
                      color: 'white', 
                      padding: '8px 18px', 
                      borderRadius: '30px', 
                      cursor: 'pointer', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}
                  >
                    {uploadingReceiptLogo ? '⏳' : '📤 ' + (language === 'bm' ? 'Pilih Logo Resit' : 'Select Receipt Logo')}
                  </label>
                  <p style={{ fontSize: '10px', color: textMuted, marginTop: '4px' }}>
                    {language === 'bm' ? 'Format: JPG, PNG (Saiz terbaik: 200x200px)' : 'Format: JPG, PNG (Best size: 200x200px)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Settings Grid */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '16px'
            }}>
              
              {/* Company Info */}
              <div style={{ ...cardStyle }}>
                <div style={{ fontWeight: 'bold', color: textColor, marginBottom: '12px' }}>
                  🏢 {language === 'bm' ? 'Maklumat Syarikat' : 'Company Info'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: textMuted }}>{language === 'bm' ? 'Nama' : 'Name'}</label>
                    <input 
                      type="text"
                      value={receiptSettings.receipt_company_name}
                      onChange={(e) => setReceiptSettings({...receiptSettings, receipt_company_name: e.target.value})}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: textMuted }}>{language === 'bm' ? 'Alamat' : 'Address'}</label>
                    <input 
                      type="text"
                      value={receiptSettings.receipt_company_address}
                      onChange={(e) => setReceiptSettings({...receiptSettings, receipt_company_address: e.target.value})}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: textMuted }}>{language === 'bm' ? 'Telefon' : 'Phone'}</label>
                    <input 
                      type="text"
                      value={receiptSettings.receipt_company_phone}
                      onChange={(e) => setReceiptSettings({...receiptSettings, receipt_company_phone: e.target.value})}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Receipt Text */}
              <div style={{ ...cardStyle }}>
                <div style={{ fontWeight: 'bold', color: textColor, marginBottom: '12px' }}>
                  📝 {language === 'bm' ? 'Teks Resit' : 'Receipt Text'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: textMuted }}>{language === 'bm' ? 'Header' : 'Header'}</label>
                    <input 
                      type="text"
                      value={receiptSettings.receipt_header}
                      onChange={(e) => setReceiptSettings({...receiptSettings, receipt_header: e.target.value})}
                      style={inputStyle}
                      placeholder="Terima Kasih!"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: textMuted }}>{language === 'bm' ? 'Footer' : 'Footer'}</label>
                    <input 
                      type="text"
                      value={receiptSettings.receipt_footer}
                      onChange={(e) => setReceiptSettings({...receiptSettings, receipt_footer: e.target.value})}
                      style={inputStyle}
                      placeholder="Sila datang lagi"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: textMuted }}>{language === 'bm' ? 'Ucapan Terima Kasih' : 'Thank You'}</label>
                    <input 
                      type="text"
                      value={receiptSettings.receipt_thank_you}
                      onChange={(e) => setReceiptSettings({...receiptSettings, receipt_thank_you: e.target.value})}
                      style={inputStyle}
                      placeholder="Terima Kasih!"
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div style={{ ...cardStyle }}>
                <div style={{ fontWeight: 'bold', color: textColor, marginBottom: '12px' }}>
                  ⚙️ {language === 'bm' ? 'Pilihan' : 'Options'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: textColor }}>🏪 {language === 'bm' ? 'Tunjuk Logo' : 'Show Logo'}</span>
                    {toggleSwitch(receiptSettings.receipt_show_logo, (val) => setReceiptSettings({...receiptSettings, receipt_show_logo: val}))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: textColor }}>📱 {language === 'bm' ? 'Tunjuk QR Code' : 'Show QR Code'}</span>
                    {toggleSwitch(receiptSettings.receipt_show_qr, (val) => setReceiptSettings({...receiptSettings, receipt_show_qr: val}))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: textColor }}>📋 {language === 'bm' ? 'Tunjuk Item' : 'Show Items'}</span>
                    {toggleSwitch(receiptSettings.receipt_show_items, (val) => setReceiptSettings({...receiptSettings, receipt_show_items: val}))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: textColor }}>💰 {language === 'bm' ? 'Tunjuk Cukai' : 'Show Tax'}</span>
                    {toggleSwitch(receiptSettings.receipt_show_tax, (val) => setReceiptSettings({...receiptSettings, receipt_show_tax: val}))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: textColor }}>🧾 {language === 'bm' ? 'Tunjuk Caj Perkhidmatan' : 'Show Service Charge'}</span>
                    {toggleSwitch(receiptSettings.receipt_show_service, (val) => setReceiptSettings({...receiptSettings, receipt_show_service: val}))}
                  </div>
                </div>
              </div>

              {/* Size & Style */}
              <div style={{ ...cardStyle }}>
                <div style={{ fontWeight: 'bold', color: textColor, marginBottom: '12px' }}>
                  📐 {language === 'bm' ? 'Saiz & Gaya' : 'Size & Style'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: textMuted }}>{language === 'bm' ? 'Saiz Kertas' : 'Paper Size'}</label>
                    <select 
                      value={receiptSettings.receipt_paper_size}
                      onChange={(e) => setReceiptSettings({...receiptSettings, receipt_paper_size: e.target.value})}
                      style={inputStyle}
                    >
                      <option value="58mm">58mm (Small)</option>
                      <option value="80mm">80mm (Large)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: textMuted }}>{language === 'bm' ? 'Saiz Font' : 'Font Size'}</label>
                    <select 
                      value={receiptSettings.receipt_font_size}
                      onChange={(e) => setReceiptSettings({...receiptSettings, receipt_font_size: e.target.value})}
                      style={inputStyle}
                    >
                      <option value="small">Small</option>
                      <option value="normal">Normal</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: textMuted }}>{language === 'bm' ? 'Saiz Logo' : 'Logo Size'}</label>
                    <select 
                      value={receiptSettings.receipt_logo_size}
                      onChange={(e) => setReceiptSettings({...receiptSettings, receipt_logo_size: e.target.value})}
                      style={inputStyle}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '20px',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={saveReceiptSettings}
                disabled={receiptLoading}
                style={{ 
                  flex: 2,
                  minWidth: '150px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
                  color: 'white', 
                  padding: '14px', 
                  border: 'none', 
                  borderRadius: '60px', 
                  fontSize: '15px', 
                  fontWeight: 'bold', 
                  cursor: receiptLoading ? 'not-allowed' : 'pointer', 
                  opacity: receiptLoading ? 0.7 : 1,
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={e => !receiptLoading && (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {receiptLoading ? '⏳ ' + (language === 'bm' ? 'Menyimpan...' : 'Saving...') : '💾 ' + (language === 'bm' ? 'Simpan Tetapan' : 'Save Settings')}
              </button>
              <button 
                onClick={generateReceiptPreview}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '14px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '60px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                🔄 {language === 'bm' ? 'Refresh Preview' : 'Refresh Preview'}
              </button>
            </div>

            {/* ===== RECEIPT PREVIEW ===== */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '16px' 
              }}>
                <span style={{ fontSize: '20px' }}>📄</span>
                <h4 style={{ margin: 0, color: textColor, fontSize: '16px', fontWeight: 'bold' }}>
                  {language === 'bm' ? 'Pratonton Resit' : 'Receipt Preview'}
                </h4>
              </div>
              
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                maxWidth: receiptSettings.receipt_paper_size === '80mm' ? '420px' : '300px',
                margin: '0 auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                fontFamily: 'monospace',
                fontSize: receiptSettings.receipt_font_size === 'large' ? '14px' : receiptSettings.receipt_font_size === 'small' ? '10px' : '12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                color: '#000000',
                minHeight: '200px',
                overflow: 'auto'
              }}>
                {receiptPreview || (
                  <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                    {language === 'bm' ? 'Memuatkan pratonton...' : 'Loading preview...'}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: DELETE DATA */}
        {/* ============================================================ */}
        {activeTab === 'data' && (
          <div style={{ ...glassEffect, borderRadius: '28px', padding: '28px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px' }}>🗑️</span>
              <h3 style={{ margin: 0, color: textColor, fontSize: '20px', fontWeight: 'bold' }}>
                {language === 'bm' ? 'Padam Data' : 'Delete Data'}
              </h3>
            </div>
            
            <p style={{ color: textMuted, marginBottom: '24px', fontSize: '14px' }}>
              {language === 'bm' 
                ? '⚠️ Berhati-hati! Tindakan ini tidak boleh dibatalkan.' 
                : '⚠️ Caution! This action cannot be undone.'}
            </p>

            {/* Category: Orders & Payments */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: textMuted, 
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {language === 'bm' ? '📋 Pesanan & Pembayaran' : '📋 Orders & Payments'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <button 
                  onClick={() => openConfirmModal('orders')}
                  style={{ 
                    padding: '14px 18px', 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '22px' }}>📋</span>
                  <div>
                    <div>{language === 'bm' ? 'Padam Semua Pesanan' : 'Delete All Orders'}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{language === 'bm' ? 'Padam semua rekod pesanan' : 'Delete all order records'}</div>
                  </div>
                </button>

                <button 
                  onClick={() => openConfirmModal('payments')}
                  style={{ 
                    padding: '14px 18px', 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '22px' }}>💳</span>
                  <div>
                    <div>{language === 'bm' ? 'Padam Semua Pembayaran' : 'Delete All Payments'}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{language === 'bm' ? 'Padam semua rekod pembayaran' : 'Delete all payment records'}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Category: Menu & Categories */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: textMuted, 
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {language === 'bm' ? '🍽️ Menu & Kategori' : '🍽️ Menu & Categories'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <button 
                  onClick={() => openConfirmModal('menu')}
                  style={{ 
                    padding: '14px 18px', 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '22px' }}>🍽️</span>
                  <div>
                    <div>{language === 'bm' ? 'Padam Semua Menu' : 'Delete All Menu'}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{language === 'bm' ? 'Padam semua item menu' : 'Delete all menu items'}</div>
                  </div>
                </button>

                <button 
                  onClick={() => openConfirmModal('categories')}
                  style={{ 
                    padding: '14px 18px', 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '22px' }}>📂</span>
                  <div>
                    <div>{language === 'bm' ? 'Padam Semua Kategori' : 'Delete All Categories'}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{language === 'bm' ? 'Padam semua kategori' : 'Delete all categories'}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Category: Customers, Staff & Tables */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: textMuted, 
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {language === 'bm' ? '👥 Pelanggan, Staff & Meja' : '👥 Customers, Staff & Tables'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <button 
                  onClick={() => openConfirmModal('customers')}
                  style={{ 
                    padding: '14px 18px', 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '22px' }}>👤</span>
                  <div>
                    <div>{language === 'bm' ? 'Padam Semua Pelanggan' : 'Delete All Customers'}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{language === 'bm' ? 'Padam semua rekod pelanggan' : 'Delete all customer records'}</div>
                  </div>
                </button>

                <button 
                  onClick={() => openConfirmModal('staff')}
                  style={{ 
                    padding: '14px 18px', 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '22px' }}>👥</span>
                  <div>
                    <div>{language === 'bm' ? 'Padam Semua Staff' : 'Delete All Staff'}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{language === 'bm' ? 'Padam semua staff (kecuali admin)' : 'Delete all staff (except admin)'}</div>
                  </div>
                </button>

                <button 
                  onClick={() => openConfirmModal('tables')}
                  style={{ 
                    padding: '14px 18px', 
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s',
                    gridColumn: isMobile ? 'auto' : '1 / -1'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '22px' }}>🪑</span>
                  <div>
                    <div>{language === 'bm' ? 'Padam Semua Meja' : 'Delete All Tables'}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{language === 'bm' ? 'Padam semua rekod meja' : 'Delete all table records'}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Category: System */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: textMuted, 
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {language === 'bm' ? '⚙️ Sistem' : '⚙️ System'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                <button 
                  onClick={() => openConfirmModal('settings_reset')}
                  style={{ 
                    padding: '14px 18px', 
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '22px' }}>⚙️</span>
                  <div>
                    <div>{language === 'bm' ? 'Reset Semua Tetapan' : 'Reset All Settings'}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{language === 'bm' ? 'Reset semua tetapan ke default' : 'Reset all settings to default'}</div>
                  </div>
                </button>

                <button 
                  onClick={() => openConfirmModal('logs')}
                  style={{ 
                    padding: '14px 18px', 
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '14px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '22px' }}>📜</span>
                  <div>
                    <div>{language === 'bm' ? 'Padam Semua Log' : 'Delete All Logs'}</div>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>{language === 'bm' ? 'Padam semua log aktiviti' : 'Delete all activity logs'}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ 
              borderTop: `2px dashed ${borderColor}`, 
              margin: '20px 0 24px 0',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: cardBg,
                padding: '0 16px',
                fontSize: '12px',
                color: textMuted,
                fontWeight: 'bold'
              }}>
                {language === 'bm' ? '⚠️ PERHATIAN' : '⚠️ WARNING'}
              </span>
            </div>

            {/* Danger: Reset ALL Data */}
            <div>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: danger, 
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {language === 'bm' ? '🚨 TINDAKAN BERISIKO TINGGI' : '🚨 HIGH RISK ACTION'}
              </div>
              <button 
                onClick={() => openConfirmModal('reset_all')}
                style={{ 
                  padding: '18px 24px', 
                  background: 'linear-gradient(135deg, #dc2626, #991b1b)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '16px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '15px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'transform 0.2s',
                  width: '100%',
                  boxShadow: '0 4px 20px rgba(220, 38, 38, 0.3)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: '28px' }}>⚠️</span>
                <div>
                  <div>{language === 'bm' ? 'Reset SEMUA Data' : 'Reset ALL Data'}</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    {language === 'bm' 
                      ? 'Padam SEMUA data (pesanan, menu, pelanggan, staff, meja, pembayaran) dan reset semua tetapan ke default' 
                      : 'Delete ALL data (orders, menu, customers, staff, tables, payments) and reset all settings to default'}
                  </div>
                </div>
              </button>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: SYSTEM LOGS */}
        {/* ============================================================ */}
        {activeTab === 'logs' && (
          <div style={{ ...glassEffect, borderRadius: '28px', padding: '28px' }}>
            
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>📋</span>
                <div>
                  <h3 style={{ margin: 0, color: textColor, fontSize: '20px', fontWeight: 'bold' }}>
                    {language === 'bm' ? 'Aktiviti Sistem' : 'System Activity'}
                  </h3>
                  <p style={{ color: textMuted, marginTop: '2px', fontSize: '13px' }}>
                    {language === 'bm' 
                      ? `Jumlah log: ${logsCount}` 
                      : `Total logs: ${logsCount}`}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleExportLogs}
                  disabled={logsExporting}
                  style={{
                    padding: '10px 20px',
                    background: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '40px',
                    cursor: logsExporting ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    opacity: logsExporting ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {logsExporting ? '⏳' : '📥 ' + (language === 'bm' ? 'Eksport' : 'Export')}
                </button>
                <button
                  onClick={handleClearLogs}
                  style={{
                    padding: '10px 20px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '40px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                >
                  🗑️ {language === 'bm' ? 'Padam Semua' : 'Clear All'}
                </button>
                <button
                  onClick={() => { setLogsPage(1); loadLogs() }}
                  style={{
                    padding: '10px 20px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '40px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                >
                  🔄 {language === 'bm' ? 'Muat Semula' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <input
                type="text"
                placeholder={language === 'bm' ? '🔍 Cari...' : '🔍 Search...'}
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder={language === 'bm' ? '👤 User' : '👤 User'}
                value={logsUsernameFilter}
                onChange={(e) => setLogsUsernameFilter(e.target.value)}
                style={inputStyle}
              />
              <input
                type="date"
                value={logsDateFrom}
                onChange={(e) => setLogsDateFrom(e.target.value)}
                style={inputStyle}
              />
              <input
                type="date"
                value={logsDateTo}
                onChange={(e) => setLogsDateTo(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Logs Table */}
            {logsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="spinner"></div>
                <p style={{ color: textMuted, marginTop: '12px' }}>
                  {language === 'bm' ? 'Memuatkan log...' : 'Loading logs...'}
                </p>
              </div>
            ) : logs.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: textMuted
              }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📭</span>
                {language === 'bm' ? 'Tiada log dijumpai' : 'No logs found'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: isMobile ? '12px' : '14px'
                }}>
                  <thead>
                    <tr style={{ 
                      background: secondaryBg,
                      borderBottom: `2px solid ${borderColor}`
                    }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: textMuted }}>
                        {language === 'bm' ? 'Masa' : 'Time'}
                      </th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: textMuted }}>
                        {language === 'bm' ? 'User' : 'User'}
                      </th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: textMuted }}>
                        {language === 'bm' ? 'Tindakan' : 'Action'}
                      </th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: textMuted }}>
                        {language === 'bm' ? 'Butiran' : 'Details'}
                      </th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: textMuted, display: isMobile ? 'none' : 'table-cell' }}>
                        IP
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => {
                      const icon = getActionIcon(log.action)
                      const label = getActionLabel(log.action, language)
                      
                      return (
                        <tr 
                          key={log.id}
                          style={{
                            borderBottom: `1px solid ${borderColor}`,
                            background: idx % 2 === 0 ? 'transparent' : secondaryBg,
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : secondaryBg}
                        >
                          <td style={{ padding: '10px 12px', color: textMuted, whiteSpace: 'nowrap' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td style={{ padding: '10px 12px', color: textColor, fontWeight: '500' }}>
                            {log.username || 'System'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: secondaryBg,
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: isMobile ? '11px' : '12px',
                              color: textColor,
                              border: `1px solid ${borderColor}`
                            }}>
                              {icon} {label}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: textMuted, maxWidth: '200px', wordBreak: 'break-word' }}>
                            {log.details || '-'}
                          </td>
                          <td style={{ padding: '10px 12px', color: textMuted, display: isMobile ? 'none' : 'table-cell' }}>
                            {log.ip_address || '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                {logsCount > logsLimit && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    marginTop: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                      disabled={logsPage === 1}
                      style={{
                        padding: '6px 14px',
                        background: logsPage === 1 ? '#64748b' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        cursor: logsPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        opacity: logsPage === 1 ? 0.5 : 1
                      }}
                    >
                      ← {language === 'bm' ? 'Sebelum' : 'Prev'}
                    </button>
                    <span style={{ 
                      padding: '6px 14px', 
                      color: textColor,
                      fontSize: '13px'
                    }}>
                      {logsPage} / {Math.ceil(logsCount / logsLimit)}
                    </span>
                    <button
                      onClick={() => setLogsPage(p => p + 1)}
                      disabled={logsPage >= Math.ceil(logsCount / logsLimit)}
                      style={{
                        padding: '6px 14px',
                        background: logsPage >= Math.ceil(logsCount / logsLimit) ? '#64748b' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '30px',
                        cursor: logsPage >= Math.ceil(logsCount / logsLimit) ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        opacity: logsPage >= Math.ceil(logsCount / logsLimit) ? 0.5 : 1
                      }}
                    >
                      {language === 'bm' ? 'Seterusnya' : 'Next'} →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* CONFIRMATION MODAL */}
        {/* ============================================================ */}
        {showConfirmModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              background: cardBg,
              padding: '32px',
              borderRadius: '28px',
              maxWidth: '440px',
              width: '90%',
              textAlign: 'center',
              ...glassEffect,
              animation: 'popIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)',
              border: showConfirmModal.isDanger ? `2px solid ${danger}` : 'none'
            }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>
                {showConfirmModal.isDanger ? '🚨' : '⚠️'}
              </div>
              <h3 style={{ color: showConfirmModal.isDanger ? danger : textColor, fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                {language === 'bm' ? 'Sahkan Padam' : 'Confirm Delete'}
              </h3>
              <p style={{ color: textMuted, marginTop: '12px', fontSize: '14px' }}>
                {language === 'bm' 
                  ? `Anda pasti mahu ${showConfirmModal.title.ms.toLowerCase()}?` 
                  : `Are you sure you want to ${showConfirmModal.title.en.toLowerCase()}?`}
              </p>
              {showConfirmModal.isDanger && (
                <p style={{ 
                  color: danger, 
                  fontSize: '13px', 
                  marginTop: '8px', 
                  fontWeight: 'bold',
                  background: 'rgba(239, 68, 68, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '8px'
                }}>
                  {language === 'bm' 
                    ? '⚠️ Tindakan ini tidak boleh dibatalkan! SEMUA data akan hilang.' 
                    : '⚠️ This action cannot be undone! ALL data will be lost.'}
                </p>
              )}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button 
                  onClick={showConfirmModal.action}
                  style={{ 
                    flex: 1, 
                    background: showConfirmModal.isDanger 
                      ? 'linear-gradient(135deg, #dc2626, #991b1b)' 
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white', 
                    padding: '14px', 
                    border: 'none', 
                    borderRadius: '40px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  {language === 'bm' ? '✅ Ya, Padam' : '✅ Yes, Delete'}
                </button>
                <button 
                  onClick={() => setShowConfirmModal(null)}
                  style={{ 
                    flex: 1, 
                    background: '#64748b', 
                    color: 'white', 
                    padding: '14px', 
                    border: 'none', 
                    borderRadius: '40px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  {language === 'bm' ? '❌ Batal' : '❌ Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>
          {`
            .spinner { 
              width: 48px; 
              height: 48px; 
              border: 4px solid rgba(59,130,246,0.2); 
              border-top-color: #3b82f6; 
              border-radius: 50%; 
              animation: spin 1s linear infinite; 
              margin: 0 auto; 
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
            }
            ::-webkit-scrollbar-track { 
              background: ${darkMode ? '#2a2a3e' : '#e2e8f0'}; 
              border-radius: 10px; 
            }
            ::-webkit-scrollbar-thumb { 
              background: ${darkMode ? '#555' : '#94a3b8'}; 
              border-radius: 10px; 
            }
            @media (max-width: 768px) {
              .tab-button-text {
                display: none;
              }
            }
          `}
        </style>
      </div>
    </Sidebar>
  )
}

export default ManageSettings