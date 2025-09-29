// app/api/create-profile/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Helper: generate custom SMC user ID
async function generateSMCUserId(year) {
  const { data: lastUser, error } = await supabaseAdmin
    .from('profiles_new')
    .select('user_id')
    .like('user_id', `SMC-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  let lastNumber = 0
  if (lastUser?.user_id) {
    const parts = lastUser.user_id.split('-')
    lastNumber = parseInt(parts[2], 10)
  }

  const nextNumber = lastNumber + 1
  return `SMC-${year}-${nextNumber.toString().padStart(4, '0')}`
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password, full_name, dept, year, contact_number } = body

    // 1️⃣ Required fields check
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // 2️⃣ Check if email already exists in Auth
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({ limit: 1000 })
    if (listError) throw listError

    if (userList.users?.some(u => u.email === email)) {
      return NextResponse.json({ error: 'Email already exists in Auth' }, { status: 400 })
    }

    // 3️⃣ Create Auth user (role fixed: "user")
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'user', full_name }
    })
    if (authError) throw authError

    const authUserId = authUser.user.id

    // 4️⃣ Generate custom SMC user_id
    const user_id = await generateSMCUserId(year || new Date().getFullYear())

    // 5️⃣ Insert profile into profiles_new
    const profileData = {
      id: authUserId,                 // FK to auth.users
      user_id,
      full_name,
      email,
      department: dept || null,
      academic_year: year || null,
      contact_number: contact_number || null,
      role: 'user',
      total_bill: 0,
      last_poll_at: null,
      onboarding_complete: false,
      created_at: new Date().toISOString()
    }

    const { error: profileError } = await supabaseAdmin.from('profiles_new').insert([profileData])
    if (profileError) {
      // Rollback Auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      return NextResponse.json({ error: 'Database error creating new user' }, { status: 500 })
    }

    // 6️⃣ Return success
    return NextResponse.json({
      success: true,
      user_id,
      email,
      full_name,
      role: 'user'
    })
  } catch (err) {
    console.error('❌ API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
