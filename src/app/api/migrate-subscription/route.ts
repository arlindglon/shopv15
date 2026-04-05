import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST() {
  try {
    console.log('Checking subscription columns...');

    // Check if columns exist by trying to select them
    const { data: existingSettings, error: checkError } = await supabase
      .from('app_settings')
      .select('id')
      .limit(1);

    if (checkError) {
      console.log('Error checking app_settings:', checkError);
      return NextResponse.json({
        success: false,
        needsMigration: true,
        message: 'Cannot access app_settings table. Please run the SQL in Supabase SQL Editor:',
        sql: `
-- Add subscription columns to app_settings table
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS subscription_expiry_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS subscription_contact_email TEXT,
ADD COLUMN IF NOT EXISTS subscription_contact_whatsapp TEXT;
        `
      });
    }

    // Now try to update settings with subscription fields to test if columns exist
    const testUpdate: Record<string, any> = {
      subscription_contact_phone: '',
      subscription_contact_email: '',
      subscription_contact_whatsapp: '',
    };
    
    const { error: updateError } = await supabase
      .from('app_settings')
      .update(testUpdate)
      .eq('id', 'default-settings');

    if (updateError) {
      console.log('Subscription columns may not exist:', updateError);
      return NextResponse.json({
        success: false,
        needsMigration: true,
        message: 'Subscription columns do not exist. Please run this SQL in Supabase SQL Editor:',
        sql: `
-- Add subscription columns to app_settings table
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS subscription_expiry_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS subscription_contact_email TEXT,
ADD COLUMN IF NOT EXISTS subscription_contact_whatsapp TEXT;
        `,
        error: updateError.message
      });
    }

    // Columns exist, return success
    console.log('Subscription columns are ready');
    return NextResponse.json({
      success: true,
      message: 'Subscription columns are ready and working',
      needsMigration: false
    });

  } catch (error) {
    console.error('Migration check error:', error);
    return NextResponse.json({
      success: false,
      needsMigration: true,
      error: 'Migration check failed',
      details: error instanceof Error ? error.message : String(error),
      sql: `
-- Please run this SQL in Supabase SQL Editor:
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS subscription_expiry_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS subscription_contact_email TEXT,
ADD COLUMN IF NOT EXISTS subscription_contact_whatsapp TEXT;
      `
    }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
