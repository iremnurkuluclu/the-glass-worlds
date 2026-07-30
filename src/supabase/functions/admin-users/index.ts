import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type AdminAction =
  | { action: 'list' }
  | { action: 'toggle_disabled'; user_id: string; disabled: boolean }
  | { action: 'delete'; user_id: string }

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const adminEmail = Deno.env.get('ADMIN_EMAIL')?.trim().toLowerCase()
    const authorization = request.headers.get('Authorization')

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !adminEmail || !authorization) {
      return json({ error: 'Admin function is not configured.' }, 500)
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    })
    const { data: callerData, error: callerError } = await callerClient.auth.getUser()
    const caller = callerData.user

    if (callerError || !caller || caller.email?.toLowerCase() !== adminEmail) {
      return json({ error: 'Unauthorized.' }, 403)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const body = (await request.json()) as AdminAction

    if (body.action === 'list') {
      const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })
      if (authError) return json({ error: authError.message }, 400)

      const visibleUsers = authData.users.filter((user) => !user.deleted_at)
      const userIds = visibleUsers.map((user) => user.id)

      const [{ data: profiles }, { data: orders }, { data: bookings }] = await Promise.all([
        adminClient.from('profiles').select('id, full_name, avatar_url, is_disabled, created_at').in('id', userIds),
        adminClient.from('orders').select('user_id').in('user_id', userIds),
        adminClient.from('event_rsvps').select('user_id').in('user_id', userIds),
      ])

      const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]))
      const orderCounts = (orders || []).reduce<Record<string, number>>((counts, order) => {
        counts[order.user_id] = (counts[order.user_id] || 0) + 1
        return counts
      }, {})
      const bookingCounts = (bookings || []).reduce<Record<string, number>>((counts, booking) => {
        counts[booking.user_id] = (counts[booking.user_id] || 0) + 1
        return counts
      }, {})

      return json({
        users: visibleUsers
          .map((user) => {
            const profile = profileMap.get(user.id)
            return {
              id: user.id,
              email: user.email || '',
              full_name: profile?.full_name || user.user_metadata?.full_name || '',
              avatar_url: profile?.avatar_url || '',
              is_disabled: profile?.is_disabled === true || user.banned_until != null,
              is_owner: user.email?.toLowerCase() === adminEmail,
              created_at: user.created_at,
              order_count: orderCounts[user.id] || 0,
              booking_count: bookingCounts[user.id] || 0,
            }
          })
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
      })
    }

    if (!body.user_id) return json({ error: 'User id is required.' }, 400)
    if (body.user_id === caller.id) return json({ error: 'The owner account cannot be changed.' }, 400)

    if (body.action === 'toggle_disabled') {
      const disabled = body.disabled === true
      const { error: authError } = await adminClient.auth.admin.updateUserById(body.user_id, {
        ban_duration: disabled ? '876000h' : 'none',
      })
      if (authError) return json({ error: authError.message }, 400)

      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({ id: body.user_id, is_disabled: disabled }, { onConflict: 'id' })
      if (profileError) return json({ error: profileError.message }, 400)

      return json({ success: true, is_disabled: disabled })
    }

    if (body.action === 'delete') {
      const { error: profileError } = await adminClient
        .from('profiles')
        .update({
          full_name: 'Deleted member',
          avatar_url: '',
          address: '',
          is_disabled: true,
        })
        .eq('id', body.user_id)
      if (profileError) return json({ error: profileError.message }, 400)

      // Soft deletion removes access and personal identity while preserving order records.
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(body.user_id, true)
      if (deleteError) return json({ error: deleteError.message }, 400)

      return json({ success: true })
    }

    return json({ error: 'Unknown action.' }, 400)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500)
  }
})
