import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Default limits for each plan
const DEFAULT_LIMITS = {
  basic: {
    maxProducts: 500,
    maxCustomers: 200,
    maxSuppliers: 50,
    maxAdmins: 1,
    maxManagers: 1,
    maxStaff: 2,
    maxSellers: 2,
    maxViewers: 1,
    posSystem: true,
    salesPurchases: true,
    customerManagement: true,
    supplierManagement: false,
    advancedReports: false,
    autoBackup: false,
    apiAccess: false,
    prioritySupport: false,
  },
  premium: {
    maxProducts: -1,
    maxCustomers: -1,
    maxSuppliers: 500,
    maxAdmins: 3,
    maxManagers: 5,
    maxStaff: 10,
    maxSellers: 10,
    maxViewers: 5,
    posSystem: true,
    salesPurchases: true,
    customerManagement: true,
    supplierManagement: true,
    advancedReports: true,
    autoBackup: true,
    apiAccess: false,
    prioritySupport: true,
  },
  enterprise: {
    maxProducts: -1,
    maxCustomers: -1,
    maxSuppliers: -1,
    maxAdmins: -1,
    maxManagers: -1,
    maxStaff: -1,
    maxSellers: -1,
    maxViewers: -1,
    posSystem: true,
    salesPurchases: true,
    customerManagement: true,
    supplierManagement: true,
    advancedReports: true,
    autoBackup: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

export async function POST() {
  try {
    console.log('Starting migration...');

    // Try to create subscription_limits table by inserting data
    // This will work if the table exists, or fail if it doesn't
    
    const defaultLimits = DEFAULT_LIMITS.premium;
    
    // Check if subscription_limits table exists
    const { data: existingLimits, error: fetchError } = await supabase
      .from('subscription_limits')
      .select('*')
      .limit(1);

    if (fetchError) {
      // Table might not exist, try to create it via upsert
      console.log('Checking if table exists:', fetchError.message);
      
      if (fetchError.message?.includes('relation') || fetchError.message?.includes('does not exist')) {
        // Table doesn't exist - we need to create it
        // We can't create tables directly, so we need to use a workaround
        
        // Option 1: Use app_settings with a JSON column approach
        // Let's try adding feature_limits column via raw SQL through a stored procedure
        
        // For now, let's use a workaround: store limits in a key-value format
        // in app_config or create entries dynamically
        
        return NextResponse.json({ 
          needsMigration: true,
          message: 'subscription_limits table does not exist.',
          instructions: 'Please run this SQL in Supabase SQL Editor:',
          sql: `
-- Create subscription_limits table
CREATE TABLE IF NOT EXISTS subscription_limits (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  plan VARCHAR(50) DEFAULT 'premium',
  max_products INTEGER DEFAULT 500,
  max_customers INTEGER DEFAULT 200,
  max_suppliers INTEGER DEFAULT 50,
  max_admins INTEGER DEFAULT 1,
  max_managers INTEGER DEFAULT 1,
  max_staff INTEGER DEFAULT 2,
  max_sellers INTEGER DEFAULT 2,
  max_viewers INTEGER DEFAULT 1,
  pos_system BOOLEAN DEFAULT true,
  sales_purchases BOOLEAN DEFAULT true,
  customer_management BOOLEAN DEFAULT true,
  supplier_management BOOLEAN DEFAULT true,
  advanced_reports BOOLEAN DEFAULT false,
  auto_backup BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default values
INSERT INTO subscription_limits (id, plan, max_products, max_customers, max_suppliers, max_admins, max_managers, max_staff, max_sellers, max_viewers)
VALUES ('default', 'premium', -1, -1, 500, 3, 5, 10, 10, 5)
ON CONFLICT (id) DO NOTHING;
          `
        });
      }
    }

    // Table exists, let's update with default values
    const { data: upsertResult, error: upsertError } = await supabase
      .from('subscription_limits')
      .upsert({
        id: 'default',
        plan: 'premium',
        max_products: defaultLimits.maxProducts,
        max_customers: defaultLimits.maxCustomers,
        max_suppliers: defaultLimits.maxSuppliers,
        max_admins: defaultLimits.maxAdmins,
        max_managers: defaultLimits.maxManagers,
        max_staff: defaultLimits.maxStaff,
        max_sellers: defaultLimits.maxSellers,
        max_viewers: defaultLimits.maxViewers,
        pos_system: defaultLimits.posSystem,
        sales_purchases: defaultLimits.salesPurchases,
        customer_management: defaultLimits.customerManagement,
        supplier_management: defaultLimits.supplierManagement,
        advanced_reports: defaultLimits.advancedReports,
        auto_backup: defaultLimits.autoBackup,
        api_access: defaultLimits.apiAccess,
        priority_support: defaultLimits.prioritySupport,
      }, { onConflict: 'id' })
      .select();

    if (upsertError) {
      console.error('Error upserting limits:', upsertError);
      return NextResponse.json({ 
        error: 'Failed to upsert limits', 
        details: upsertError.message 
      }, { status: 500 });
    }

    console.log('Successfully updated limits:', upsertResult);

    return NextResponse.json({ 
      success: true,
      message: 'Migration successful! subscription_limits table is working.',
      data: upsertResult
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
