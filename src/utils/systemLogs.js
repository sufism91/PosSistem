// src/utils/systemLogs.js

import { supabase } from '../lib/supabase'

export const LOG_ACTIONS = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_FAILED_LOGIN: 'user_failed_login',
  SETTING_CHANGE: 'setting_change',
  SETTING_BULK_UPDATE: 'setting_bulk_update',
  DATA_DELETE: 'data_delete',
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import',
  BACKUP_CREATED: 'backup_created',
  RESTORE_PERFORMED: 'restore_performed',
  TELEGRAM_TEST: 'telegram_test',
  TELEGRAM_ENABLED: 'telegram_enabled',
  TELEGRAM_DISABLED: 'telegram_disabled',
  TELEGRAM_RESET: 'telegram_reset',
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated',
  ORDER_DELETED: 'order_deleted',
  ORDER_COMPLETED: 'order_completed',
  ORDER_CANCELLED: 'order_cancelled',
  MENU_ADDED: 'menu_added',
  MENU_UPDATED: 'menu_updated',
  MENU_DELETED: 'menu_deleted',
  CATEGORY_ADDED: 'category_added',
  CATEGORY_UPDATED: 'category_updated',
  CATEGORY_DELETED: 'category_deleted',
  STAFF_ADDED: 'staff_added',
  STAFF_UPDATED: 'staff_updated',
  STAFF_DELETED: 'staff_deleted',
  TABLE_ADDED: 'table_added',
  TABLE_UPDATED: 'table_updated',
  TABLE_DELETED: 'table_deleted',
}

const ACTION_LABELS = {
  user_login: { en: 'User logged in', ms: 'Pengguna log masuk' },
  user_logout: { en: 'User logged out', ms: 'Pengguna log keluar' },
  user_failed_login: { en: 'Failed login attempt', ms: 'Percubaan log masuk gagal' },
  setting_change: { en: 'Setting changed', ms: 'Tetapan diubah' },
  setting_bulk_update: { en: 'Settings updated', ms: 'Tetapan dikemaskini' },
  data_delete: { en: 'Data deleted', ms: 'Data dipadam' },
  data_export: { en: 'Data exported', ms: 'Data dieksport' },
  data_import: { en: 'Data imported', ms: 'Data diimport' },
  backup_created: { en: 'Backup created', ms: 'Backup dicipta' },
  restore_performed: { en: 'Restore performed', ms: 'Restore dilakukan' },
  telegram_test: { en: 'Telegram test sent', ms: 'Ujian Telegram dihantar' },
  telegram_enabled: { en: 'Telegram enabled', ms: 'Telegram diaktifkan' },
  telegram_disabled: { en: 'Telegram disabled', ms: 'Telegram dimatikan' },
  telegram_reset: { en: 'Telegram reset', ms: 'Telegram direset' },
  order_created: { en: 'Order created', ms: 'Pesanan dicipta' },
  order_updated: { en: 'Order updated', ms: 'Pesanan dikemaskini' },
  order_deleted: { en: 'Order deleted', ms: 'Pesanan dipadam' },
  order_completed: { en: 'Order completed', ms: 'Pesanan selesai' },
  order_cancelled: { en: 'Order cancelled', ms: 'Pesanan dibatalkan' },
  menu_added: { en: 'Menu added', ms: 'Menu ditambah' },
  menu_updated: { en: 'Menu updated', ms: 'Menu dikemaskini' },
  menu_deleted: { en: 'Menu deleted', ms: 'Menu dipadam' },
  category_added: { en: 'Category added', ms: 'Kategori ditambah' },
  category_updated: { en: 'Category updated', ms: 'Kategori dikemaskini' },
  category_deleted: { en: 'Category deleted', ms: 'Kategori dipadam' },
  staff_added: { en: 'Staff added', ms: 'Staff ditambah' },
  staff_updated: { en: 'Staff updated', ms: 'Staff dikemaskini' },
  staff_deleted: { en: 'Staff deleted', ms: 'Staff dipadam' },
  table_added: { en: 'Table added', ms: 'Meja ditambah' },
  table_updated: { en: 'Table updated', ms: 'Meja dikemaskini' },
  table_deleted: { en: 'Table deleted', ms: 'Meja dipadam' },
}

export function getActionLabel(action, language = 'en') {
  return ACTION_LABELS[action]?.[language] || action
}

const ACTION_ICONS = {
  user_login: '🔐',
  user_logout: '🚪',
  user_failed_login: '⚠️',
  setting_change: '📝',
  setting_bulk_update: '📝',
  data_delete: '🗑️',
  data_export: '📥',
  data_import: '📤',
  backup_created: '💾',
  restore_performed: '🔄',
  telegram_test: '📨',
  telegram_enabled: '🔔',
  telegram_disabled: '🔕',
  telegram_reset: '🔄',
  order_created: '🆕',
  order_updated: '✏️',
  order_deleted: '🗑️',
  order_completed: '✅',
  order_cancelled: '❌',
  menu_added: '➕',
  menu_updated: '✏️',
  menu_deleted: '🗑️',
  category_added: '➕',
  category_updated: '✏️',
  category_deleted: '🗑️',
  staff_added: '➕',
  staff_updated: '✏️',
  staff_deleted: '🗑️',
  table_added: '➕',
  table_updated: '✏️',
  table_deleted: '🗑️',
}

export function getActionIcon(action) {
  return ACTION_ICONS[action] || '📋'
}

export async function logActivity(action, details = null, username = null) {
  try {
    let userId = null
    let user = null
    
    try {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        userId = data.user.id
        user = data.user
      }
    } catch (e) {}

    let ipAddress = null
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      ipAddress = data.ip
    } catch (e) {}

    const finalUsername = username || user?.email || user?.user_metadata?.username || 'System'
    const finalDetails = typeof details === 'string' ? details : JSON.stringify(details)

    console.log(`📋 [LOG] ${action} - ${finalUsername}:`, finalDetails)

    const { error } = await supabase
      .from('system_logs')
      .insert({
        user_id: userId,
        username: finalUsername,
        action: action,
        details: finalDetails,
        ip_address: ipAddress,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error logging activity:', error)
    }
  } catch (error) {
    console.error('Error in logActivity:', error)
  }
}

export async function getLogs(options = {}) {
  const {
    page = 1,
    limit = 50,
    search = '',
    action = '',
    username = '',
    dateFrom = '',
    dateTo = '',
  } = options

  let query = supabase
    .from('system_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`username.ilike.%${search}%,details.ilike.%${search}%,action.ilike.%${search}%`)
  }
  if (action) {
    query = query.eq('action', action)
  }
  if (username) {
    query = query.ilike('username', `%${username}%`)
  }
  if (dateFrom) {
    query = query.gte('created_at', dateFrom)
  }
  if (dateTo) {
    query = query.lte('created_at', dateTo)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error getting logs:', error)
    return { data: [], count: 0, error }
  }

  return { data, count, error: null }
}

export async function clearLogs() {
  const { error } = await supabase
    .from('system_logs')
    .delete()
    .neq('id', 0)

  if (error) {
    console.error('Error clearing logs:', error)
  }
  return { error }
}

export async function exportLogsToCSV(logs) {
  if (!logs || logs.length === 0) {
    return null
  }

  const headers = ['ID', 'User', 'Action', 'Details', 'IP Address', 'Created At']
  const rows = logs.map(log => [
    log.id,
    log.username || 'System',
    log.action,
    log.details || '',
    log.ip_address || '-',
    new Date(log.created_at).toLocaleString()
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
}