// server.js
import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// 🔥 Admin client - GUNA SERVICE ROLE KEY
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// ============================================================
// API: CREATE USER (Admin/Manager)
// ============================================================
app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { email, password, name, role } = req.body
    
    console.log('📝 Creating user:', email)
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role }
    })
    
    if (error) {
      console.error('❌ Auth error:', error)
      return res.status(400).json({ error: error.message })
    }
    
    console.log('✅ User created:', data.user.id)
    res.json({ success: true, user: data })
    
  } catch (error) {
    console.error('❌ Server error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ============================================================
// API: UPDATE USER (Admin/Manager)
// ============================================================
app.post('/api/admin/update-user', async (req, res) => {
  try {
    const { userId, updates } = req.body
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates)
    
    if (error) throw error
    res.json({ success: true, user: data })
    
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ============================================================
// API: DELETE USER
// ============================================================
app.post('/api/admin/delete-user', async (req, res) => {
  try {
    const { userId } = req.body
    
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (error) throw error
    res.json({ success: true })
    
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ============================================================
// API: RESET PASSWORD
// ============================================================
app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { userId, password } = req.body
    
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: password
    })
    
    if (error) throw error
    res.json({ success: true, user: data })
    
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ Admin API server running on http://localhost:${PORT}`)
})