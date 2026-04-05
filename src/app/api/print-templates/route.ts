import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PrintTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'purchase' | 'quotation' | 'receipt' | 'challan';
  paperSize: 'thermal-58' | 'thermal-80' | 'a4' | 'a5' | 'letter';
  isDefault: boolean;
  isActive: boolean;
  isSystem: boolean;
  elements: any[];
  customCSS: string;
  width: number;
  margin: { top: number; right: number; bottom: number; left: number };
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Mapping helpers — match ACTUAL Supabase table columns
// Actual columns: id, name, type, paper_size, elements, is_default, is_system, created_by, created_at, updated_at
// ---------------------------------------------------------------------------

/** DB row (snake_case columns) → Frontend template (camelCase properties) */
function dbToTemplate(row: any): PrintTemplate {
  return {
    id: row.id,
    name: row.name,
    type: row.type || 'receipt',
    paperSize: row.paper_size || 'thermal-80',
    isDefault: row.is_default || false,
    isActive: true, // No is_active column — all templates are active
    isSystem: row.is_system || false,
    elements: row.elements || [],
    customCSS: '', // No custom_css column in DB
    width: row.paper_size === 'thermal-58' ? 58 : row.paper_size === 'a4' ? 210 : row.paper_size === 'a5' ? 148 : 80,
    margin: { top: 2, right: 2, bottom: 2, left: 2 }, // No margin column in DB
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Frontend template (camelCase properties) → DB row (snake_case columns) */
function templateToDb(t: any): any {
  // The DB id column is UUID type — ensure valid UUID
  let id = t.id;
  if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    id = crypto.randomUUID();
  }
  return {
    id,
    name: t.name,
    type: t.type || 'invoice',
    paper_size: t.paperSize || 'thermal-80',
    is_default: t.isDefault || false,
    is_system: t.isSystem || false,
    elements: t.elements || [],
    created_at: t.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// GET — Fetch all templates
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('print_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        return NextResponse.json({ data: [], message: 'Templates stored locally' });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const templates: PrintTemplate[] = (data || []).map(dbToTemplate);
    return NextResponse.json({ data: templates });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — Create a single template
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const dbRow = templateToDb({
      ...body,
      id: body.id || Math.random().toString(36).substring(2, 15),
    });

    const { data, error } = await supabase
      .from('print_templates')
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST205') {
        return NextResponse.json({
          data: dbToTemplate({ ...dbRow, created_at: dbRow.created_at, updated_at: dbRow.updated_at }),
          message: 'Template saved locally',
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: dbToTemplate(data) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT — Bulk save (replace all non-system templates)
// Expects body: { templates: PrintTemplate[] }
// ---------------------------------------------------------------------------

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const templates: any[] = body.templates;

    if (!Array.isArray(templates)) {
      return NextResponse.json(
        { error: 'Request body must contain a "templates" array' },
        { status: 400 },
      );
    }

    // 1. Delete all non-system templates (preserve system templates)
    const { error: deleteError } = await supabase
      .from('print_templates')
      .delete()
      .eq('is_system', false);

    if (deleteError && deleteError.code !== 'PGRST205') {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 2. Insert the new set
    if (templates.length === 0) {
      return NextResponse.json({ data: [], message: 'All templates replaced' });
    }

    const dbRows = templates.map(templateToDb);

    const { data, error: insertError } = await supabase
      .from('print_templates')
      .insert(dbRows)
      .select();

    if (insertError) {
      if (insertError.code === 'PGRST205') {
        return NextResponse.json({
          data: dbRows.map((row: any) =>
            dbToTemplate({
              ...row,
              created_at: row.created_at || new Date().toISOString(),
              updated_at: row.updated_at,
            }),
          ),
          message: 'Templates saved locally',
        });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ data: (data || []).map(dbToTemplate) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save templates' }, { status: 500 });
  }
}
