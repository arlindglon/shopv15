import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Default settings for reset
const DEFAULT_SETTINGS = {
  id: 'default-settings',
  shop_name: 'Dokan Enterprise',
  shop_address: '123 Business Avenue, Suite 100, City Center',
  shop_contact: '+880 1234 567890',
  shop_email: 'info@dokan.com',
  currency: 'BDT',
  currency_symbol: '৳',
  tax_rate: 5,
  tax_enabled: false,
  receipt_footer: 'Thank you for shopping with us!',
  low_stock_alert: 10,
  expiry_alert_days: 30,
  default_payment_method: 'Cash',
  allow_walk_in_customer: true,
  theme: 'light',
  language: 'en',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Default categories
const DEFAULT_CATEGORIES = [
  'Electronics',
  'Grocery', 
  'Beverages',
  'Fashion',
  'Medicine',
  'Cosmetics',
  'Stationery',
  'Household',
  'Other'
];

export async function POST(request: NextRequest) {
  console.log('='.repeat(50));
  console.log('RESET DATA API CALLED');
  console.log('='.repeat(50));
  
  try {
    const body = await request.json();
    const { confirmText, userId } = body;

    console.log('Request body:', { confirmText, userId });

    // Verify confirmation text
    if (confirmText !== 'DELETE ALL DATA') {
      console.log('Invalid confirmation text');
      return NextResponse.json(
        { error: 'Invalid confirmation text. Please type "DELETE ALL DATA" to confirm.' },
        { status: 400 }
      );
    }

    // Verify user is Master Admin or Super Admin
    if (!userId) {
      console.log('No userId provided');
      return NextResponse.json(
        { error: 'User ID is required. Please login again.' },
        { status: 401 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('app_users')
      .select('id, role, name')
      .eq('id', userId)
      .single();
    
    console.log('User lookup result:', { user, userError });
    
    if (userError || !user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'User not found. Please login again.' },
        { status: 401 }
      );
    }

    if (user.role !== 'Master Admin' && user.role !== 'Super Admin') {
      console.log('User role not authorized:', user.role);
      return NextResponse.json(
        { error: 'Only Master Admin or Super Admin can perform this action.' },
        { status: 403 }
      );
    }

    console.log('User authorized. Starting data deletion...');

    // Tables to clear in order (respecting foreign keys)
    const tablesToDelete = [
      { name: 'sale_items', hasId: true },
      { name: 'sales', hasId: true },
      { name: 'purchase_items', hasId: true },
      { name: 'purchases', hasId: true },
      { name: 'expenses', hasId: true },
      { name: 'products', hasId: true },
      { name: 'categories', hasId: true },
      { name: 'customers', hasId: true },
      { name: 'suppliers', hasId: true },
      { name: 'activity_logs', hasId: true },
      { name: 'notifications', hasId: true },
      { name: 'held_sales', hasId: true },
      { name: 'draft_purchases', hasId: true },
      { name: 'stock_adjustments', hasId: true },
      { name: 'customer_payments', hasId: true },
      { name: 'supplier_payments', hasId: true },
      { name: 'cash_transactions', hasId: true },
      { name: 'cash_shifts', hasId: true },
      { name: 'cash_registers', hasId: true },
      { name: 'branches', hasId: true },
      { name: 'inventory_history', hasId: true },
    ];

    const deletionResults: Record<string, { success: boolean; count: number; error?: string }> = {};

    // Delete all data from each table
    for (const table of tablesToDelete) {
      console.log(`Processing table: ${table.name}`);
      
      try {
        // First count existing records
        const { count, error: countError } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.log(`Table ${table.name} count error:`, countError.message);
          deletionResults[table.name] = { success: false, count: 0, error: countError.message };
          continue;
        }
        
        console.log(`Table ${table.name} has ${count} records`);
        
        if (count === 0) {
          deletionResults[table.name] = { success: true, count: 0 };
          continue;
        }

        // Delete all records using a more aggressive approach
        // Use DELETE with a filter that matches everything
        const { error: deleteError, status } = await supabase
          .from(table.name)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything where id is not a fake UUID
        
        if (deleteError) {
          console.error(`Error deleting from ${table.name}:`, deleteError);
          deletionResults[table.name] = { success: false, count: count || 0, error: deleteError.message };
          
          // Try alternative approach - delete by selecting all first
          if (table.hasId) {
            const { data: allRecords } = await supabase
              .from(table.name)
              .select('id');
            
            if (allRecords && allRecords.length > 0) {
              const ids = allRecords.map(r => r.id);
              const { error: batchDeleteError } = await supabase
                .from(table.name)
                .delete()
                .in('id', ids);
              
              if (batchDeleteError) {
                console.error(`Batch delete also failed for ${table.name}:`, batchDeleteError);
              } else {
                console.log(`Batch delete succeeded for ${table.name}`);
                deletionResults[table.name] = { success: true, count: ids.length };
              }
            }
          }
        } else {
          console.log(`Successfully deleted from ${table.name}, status: ${status}`);
          deletionResults[table.name] = { success: true, count: count || 0 };
        }
      } catch (err) {
        console.error(`Exception processing ${table.name}:`, err);
        deletionResults[table.name] = { success: false, count: 0, error: String(err) };
      }
    }

    console.log('Deletion results:', JSON.stringify(deletionResults, null, 2));

    // Delete all users except the current admin
    console.log('Processing users...');
    try {
      const { data: allUsers, error: usersError } = await supabase
        .from('app_users')
        .select('id, name, role');
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else if (allUsers && allUsers.length > 0) {
        console.log(`Found ${allUsers.length} users`);
        const otherUsers = allUsers.filter(u => u.id !== userId);
        console.log(`Will delete ${otherUsers.length} users (keeping current admin)`);
        
        if (otherUsers.length > 0) {
          const otherUserIds = otherUsers.map(u => u.id);
          const { error: usersDeleteError } = await supabase
            .from('app_users')
            .delete()
            .in('id', otherUserIds);
          
          if (usersDeleteError) {
            console.error('Error deleting users:', usersDeleteError);
          } else {
            console.log('Successfully deleted other users');
          }
        }
      }
    } catch (err) {
      console.error('Exception processing users:', err);
    }

    // Reset app_settings
    console.log('Resetting app_settings...');
    try {
      // First delete existing settings
      const { error: deleteSettingsError } = await supabase
        .from('app_settings')
        .delete()
        .neq('id', ''); // Delete all
      
      if (deleteSettingsError) {
        console.log('Delete settings error (might be ok):', deleteSettingsError.message);
      }
      
      // Insert default settings
      const { error: insertSettingsError } = await supabase
        .from('app_settings')
        .insert(DEFAULT_SETTINGS);
      
      if (insertSettingsError) {
        console.error('Error inserting default settings:', insertSettingsError);
      } else {
        console.log('Default settings inserted successfully');
      }
    } catch (err) {
      console.error('Exception resetting settings:', err);
    }

    // Recreate default categories
    console.log('Creating default categories...');
    for (const name of DEFAULT_CATEGORIES) {
      try {
        const { error: catError } = await supabase
          .from('categories')
          .insert({
            name,
            isActive: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (catError) {
          if (!catError.message.includes('duplicate') && !catError.message.includes('unique')) {
            console.error(`Error creating category ${name}:`, catError.message);
          }
        } else {
          console.log(`Created category: ${name}`);
        }
      } catch (err) {
        console.error(`Exception creating category ${name}:`, err);
      }
    }

    // Verify deletion by counting records
    console.log('Verifying deletion...');
    const verification: Record<string, number> = {};
    
    for (const table of ['products', 'customers', 'suppliers', 'sales', 'expenses']) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      verification[table] = count || 0;
      console.log(`Verification - ${table}: ${count} records`);
    }

    console.log('='.repeat(50));
    console.log('RESET COMPLETE');
    console.log('Verification:', verification);
    console.log('='.repeat(50));

    return NextResponse.json({
      success: true,
      message: 'All data has been reset to defaults.',
      deletionResults,
      verification,
    });

  } catch (error) {
    console.error('RESET DATA ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to reset data: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
