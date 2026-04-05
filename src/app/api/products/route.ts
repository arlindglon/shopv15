import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateId } from '@/lib/db';
import { logActivity } from '@/lib/activity-logger';
import { getLogContext } from '@/lib/get-log-context';

export async function GET() {
  try {
    console.log('Fetching products from Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    console.log('Supabase response:', { data: data?.length, error });
    
    if (error) {
      console.error('Fetch products error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.log('No products found, returning empty array');
      return NextResponse.json([]);
    }

    // Map snake_case DB columns to camelCase for frontend
    // Use ?? and safe defaults since some columns may not exist in the DB
    const products = data.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      unit: p.unit,
      purchasePrice: p.purchase_price || 0,
      salePrice: p.sale_price || 0,
      stock: p.stock || 0,
      minStock: p.min_stock || 5,
      reorderLevel: p.reorder_level ?? 10,
      barcode: p.barcode,
      batchNumber: p.batch_number,
      expiryDate: p.expiry_date,
      imageUrl: p.image_url,
      description: p.description,
      isActive: p.is_active ?? true,
      isFeatured: p.is_featured ?? false,
      taxable: p.taxable ?? false,
      createdAt: p.created_at || new Date().toISOString(),
      updatedAt: p.updated_at || new Date().toISOString(),
    }));
    
    console.log('Returning products:', products.length);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const context = getLogContext(request);
    
    console.log('POST /api/products - Creating product:', { name: body.name, sku: body.sku, category: body.category });
    
    // Enforce stock = 0 for new products - stock can only increase through purchases
    const productStock = 0;
    
    // Generate a proper UUID for the product
    const productId = generateId();
    
    // Build insert payload - only include non-empty values
    const insertPayload: Record<string, any> = {
      id: productId,
      name: body.name,
      sku: body.sku,
      category: body.category,
      unit: body.unit || 'pcs',
      purchase_price: body.purchasePrice || 0,
      sale_price: body.salePrice || 0,
      stock: productStock,
      min_stock: body.minStock || 5,
      barcode: body.barcode || null,
      batch_number: body.batchNumber || null,
      image_url: body.imageUrl || null,
      description: body.description || null,
      is_active: true,
    };
    
    // Only include date column if it's a valid non-empty date string
    if (body.expiryDate && body.expiryDate.trim() !== '' && !isNaN(Date.parse(body.expiryDate))) {
      insertPayload.expiry_date = body.expiryDate;
    }
    
    // Try insert with optional columns (may not exist in older DBs)
    let { data, error } = await supabase
      .from('products')
      .insert([{ ...insertPayload, 
        reorder_level: body.reorderLevel || 10,
        is_featured: body.isFeatured || false,
        taxable: body.taxable || false,
      }])
      .select()
      .single();
    
    // If column error, retry without optional columns
    if (error && (error.message?.includes('column') || error.code === '42P01' || error.code === '42703')) {
      console.log('Column error, retrying without optional columns:', error.message);
      const retry = await supabase
        .from('products')
        .insert([insertPayload])
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Create product error:', error);
      const errorMsg = error.message || String(error);
      return NextResponse.json({ error: 'Failed to create product', details: errorMsg }, { status: 500 });
    }
    
    // Log activity (async, non-blocking)
    logActivity('products', data.id, 'create', null, data, context);
    
    // Return with camelCase for frontend - safely access optional columns
    return NextResponse.json({
      id: data.id,
      name: data.name,
      sku: data.sku,
      category: data.category,
      unit: data.unit,
      purchasePrice: data.purchase_price || 0,
      salePrice: data.sale_price || 0,
      stock: data.stock || 0,
      minStock: data.min_stock || 5,
      reorderLevel: data.reorder_level ?? body.reorderLevel ?? 10,
      barcode: data.barcode,
      batchNumber: data.batch_number,
      expiryDate: data.expiry_date,
      imageUrl: data.image_url,
      description: data.description,
      isActive: data.is_active ?? true,
      isFeatured: data.is_featured ?? false,
      taxable: data.taxable ?? false,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Create product error:', error);
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to create product', details: errMessage }, { status: 500 });
  }
}
