import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create admin client with service role (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    console.log('📅 Fetching public poll stats for date:', date)

    // First, let's see ALL poll responses to debug
    const { data: allPolls, error: debugError } = await supabaseAdmin
      .from('poll_responses')
      .select('date, present, user_id')
      .limit(5)

    console.log('🔍 Sample poll responses in DB:', allPolls)

    // Fetch poll responses (bypasses RLS with service role)
    const { data: responses, error: pollError } = await supabaseAdmin
      .from('poll_responses')
      .select('*')
      .eq('date', date)
      .eq('present', true)
      .order('created_at', { ascending: false })

    console.log('✅ Matching responses for date', date, ':', responses?.length || 0)

    if (pollError) {
      console.error('Poll fetch error:', pollError)
      return NextResponse.json({ error: pollError.message }, { status: 500 })
    }

    // If no responses found, try without the date filter to see if there's any data
    if (!responses || responses.length === 0) {
      console.log('⚠️ No responses found for date, checking all responses...')
      const { data: allResponses } = await supabaseAdmin
        .from('poll_responses')
        .select('date, present, portion_size')
        .eq('present', true)
        .limit(10)
      
      console.log('📊 Recent responses in DB:', allResponses)
    }

    // Get top 3 responses with user profiles
    const limitedResponses = responses?.slice(0, 3) || []
    
    if (limitedResponses.length > 0) {
      const userIds = limitedResponses.map(r => r.user_id)
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles_new')
        .select('id, full_name, email, dept, year')
        .in('id', userIds)

      if (profileError) {
        console.error('Profile fetch error:', profileError)
      } else {
        // Merge profiles with responses
        const enrichedResponses = limitedResponses.map(response => ({
          ...response,
          profile: profiles?.find(p => p.id === response.user_id) || null
        }))

        // Calculate stats
        const fullMeals = responses?.filter(r => r.portion_size === 'full').length || 0
        const halfMeals = responses?.filter(r => r.portion_size === 'half').length || 0

        return NextResponse.json({
          students: enrichedResponses,
          stats: { fullMeals, halfMeals },
          total: responses.length
        })
      }
    }

    // No responses found
    return NextResponse.json({
      students: [],
      stats: { fullMeals: 0, halfMeals: 0 },
      total: 0
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
