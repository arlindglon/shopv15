import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/db';

// GET - Fetch all held orders
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('held_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Table might not exist, return empty array
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return NextResponse.json([]);
      }
      console.error('Fetch held orders error:', error);
      return NextResponse.json([]);
    }

    const heldOrders = (data || []).map(order => ({
      id: order.id,
      holdNumber: order.hold_number || order.holdNumber || '',
      customerName: order.customer_name || order.customerName || 'Walk-in Customer',
      customerId: order.customer_id || order.customerId || '',
      itemCount: order.item_count || order.itemCount || 0,
      subtotal: order.subtotal || 0,
      discount: order.discount || 0,
      total: order.total || 0,
      data: order.data || '{}',
      createdBy: order.created_by || order.createdBy || '',
      createdByName: order.created_by_name || order.createdByName || '',
      createdAt: order.created_at || order.createdAt || new Date().toISOString(),
    }));

    return NextResponse.json(heldOrders);
  } catch (error) {
    console.error('Fetch held orders error:', error);
    return NextResponse.json([]);
  }
}

// POST - Create a new held order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const holdId = generateId();
    
    // Generate hold number
    const { count } = await supabase
      .from('held_orders')
      .select('*', { count: 'exact', head: true });
    
    const holdNumber = `HOLD-${String((count || 0) + 1).padStart(4, '0')}`;
    
    // Parse cart items from data to get item count
    let cartData: any[] = [];
    try {
      const parsedData = typeof body.data === 'string' ? JSON.parse(body.data) : body.data;
      cartData = parsedData.cart || [];
    } catch {
      cartData = [];
    }

    const orderData: Record<string, unknown> = {
      id: holdId,
      hold_number: holdNumber,
      customer_name: body.customerName || 'Walk-in Customer',
      customer_id: body.customerId || null,
      item_count: cartData.length || 0,
      subtotal: body.subtotal || 0,
      discount: body.discount || 0,
      total: body.total || 0,
      data: typeof body.data === 'string' ? body.data : JSON.stringify(body.data || {}),
      created_by: body.createdBy || null,
      created_by_name: body.createdByName || null,
    };

    const { data, error } = await supabase
      .from('held_orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Create held order error:', error);
      
      // If table doesn't exist, try creating it
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        const createError = await createHeldOrdersTable();
        if (createError) {
          return NextResponse.json({ 
            error: 'Held orders table does not exist. Please run the SQL migration first.',
            sql: getCreateTableSQL()
          }, { status: 500 });
        }
        // Retry insert after table creation
        const retry = await supabase
          .from('held_orders')
          .insert([orderData])
          .select()
          .single();
        
        if (retry.error) {
          return NextResponse.json({ error: retry.error.message }, { status: 500 });
        }
        return NextResponse.json({
          id: retry.data.id,
          holdNumber: holdNumber,
          customerName: orderData.customer_name,
          itemCount: orderData.item_count,
          total: orderData.total,
          createdAt: retry.data.created_at || new Date().toISOString(),
        });
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      holdNumber: data.hold_number || holdNumber,
      customerName: data.customer_name || 'Walk-in Customer',
      customerId: data.customer_id || '',
      itemCount: data.item_count || 0,
      total: data.total || 0,
      data: data.data || '{}',
      createdAt: data.created_at || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create held order error:', error);
    return NextResponse.json({ error: 'Failed to create held order' }, { status: 500 });
  }
}

// DELETE - Delete a held order (sent via body with JSON)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Held order ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('held_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete held order error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete held order error:', error);
    return NextResponse.json({ error: 'Failed to delete held order' }, { status: 500 });
  }
}

// Helper: Create held_orders table if it doesn't exist
async function createHeldOrdersTable(): Promise<string | null> {
  try {
    const sql = getCreateTableSQL();
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error('Failed to create held_orders table:', error);
      return error.message;
    }
    return null;
  } catch (error) {
    console.error('Failed to create held_orders table:', error);
    return String(error);
  }
}

function getCreateTableSQL(): string {
  return `
    CREATE TABLE IF NOT EXISTS held_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      hold_number TEXT NOT NULL UNIQUE,
      customer_name TEXT DEFAULT 'Walk-in Customer',
      customer_id UUID,
      item_count INTEGER DEFAULT 0,
      subtotal NUMERIC(12,2) DEFAULT 0,
      discount NUMERIC(12,2) DEFAULT 0,
      total NUMERIC(12,2) DEFAULT 0,
      data JSONB NOT NULL DEFAULT '{}',
      created_by UUID,
      created_by_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_held_orders_created_at ON held_orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_held_orders_customer_id ON held_orders(customer_id);
  `;
}
