import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Service Role Key use karo (admin access ke liye)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // ✅ App Router mein request.json() use karo
    const { userIds } = await request.json();

    console.log('✅ Fetching display names for:', userIds.length, 'users');

    const userMap = {};
    
    for (const userId of userIds) {
      try {
        const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (error) {
          console.error(`Error fetching user ${userId}:`, error);
          userMap[userId] = 'Anonymous';
          continue;
        }
        
        if (authUser?.user) {
          // Display name priority: display_name > full_name > email
          const displayName = 
            authUser.user.user_metadata?.display_name || 
            authUser.user.user_metadata?.full_name || 
            authUser.user.email?.split('@')[0] || 
            'Anonymous';
          
          userMap[userId] = displayName;
        } else {
          userMap[userId] = 'Anonymous';
        }
      } catch (userError) {
        console.error(`Exception for user ${userId}:`, userError);
        userMap[userId] = 'Anonymous';
      }
    }

    console.log('✅ User map created:', Object.keys(userMap).length, 'entries');

    // ✅ App Router mein NextResponse.json() use karo
    return NextResponse.json({ userMap });
    
  } catch (error) {
    console.error('❌ Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message }, 
      { status: 500 }
    );
  }
}

// ✅ OPTIONS method bhi handle karo (CORS ke liye)
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}