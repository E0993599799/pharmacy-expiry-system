import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify admin user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('can_manage_members')
      .eq('auth_user_id', user.id)
      .single()

    if (!adminUser?.can_manage_members) {
      return NextResponse.json(
        { error: 'Not authorized to manage members' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, memberEmail, branchId, role } = body

    if (action === 'add') {
      // Add new member to branch
      if (!memberEmail || !branchId || !role) {
        return NextResponse.json(
          { error: 'Missing required fields: memberEmail, branchId, role' },
          { status: 400 }
        )
      }

      // Insert into user_branches
      // Note: memberEmail must already exist in auth.users
      const { error } = await supabase
        .from('user_branches')
        .insert([
          {
            auth_user_id: memberEmail, // This should be the UUID from auth.users
            branch_id: branchId,
            role: role
          }
        ])

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: `Member ${memberEmail} added to branch with role ${role}`
      })
    }

    if (action === 'remove') {
      // Remove member from branch
      const { data: memberData } = await supabase
        .from('user_branches')
        .delete()
        .eq('auth_user_id', memberEmail)
        .eq('branch_id', branchId)

      return NextResponse.json({
        success: true,
        message: `Member removed from branch`
      })
    }

    if (action === 'update') {
      // Update member role
      const { error } = await supabase
        .from('user_branches')
        .update({ role })
        .eq('auth_user_id', memberEmail)
        .eq('branch_id', branchId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: `Member role updated to ${role}`
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify admin user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      )
    }

    // Get all members across all branches
    const { data: members } = await supabase
      .from('user_branches')
      .select(`
        id,
        auth_user_id,
        branch_id,
        role,
        created_at,
        branches (
          id,
          name,
          location
        )
      `)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      members: members || []
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
