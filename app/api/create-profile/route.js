// app/api/create-profile/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

    // 3️⃣ Create Auth user (no user_metadata - role stored in profiles_new only)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (authError) throw authError

    const authUserId = authUser.user.id

    // 4️⃣ Insert profile into profiles_new (matching actual table schema)
    const profileData = {
      id: authUserId,                    // FK to auth.users (UUID)
      email: email.trim().toLowerCase(), // Store email in profiles_new too
      full_name,
      role: 'user',
      dept: dept || null,
      year: year || null,
      contact_number: contact_number || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: profileError } = await supabaseAdmin.from('profiles_new').insert([profileData])
    if (profileError) {
      console.error('❌ Profile insert error:', profileError)
      // Rollback Auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      return NextResponse.json({ error: `Database error: ${profileError.message}` }, { status: 500 })
    }

    // 5️⃣ Return success
    return NextResponse.json({
      success: true,
      user_id: authUserId,  // Return the UUID as user_id
      email,
      full_name,
      role: 'user'
    })
  } catch (err) {
    console.error('❌ API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
