import { createClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Test 1: Simple query
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        error: error.message,
        details: error
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      data: data,
      message: 'Database connection working!'
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Unexpected error',
      details: error
    }, { status: 500 });
  }
}