import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// ============================================
// SUPPORT NOTES API
// ============================================
// Uses app_config table (key: "support_notes_data") to store notes as JSON
// This avoids needing a new table and uses existing infrastructure
// ============================================

interface SupportNote {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const CONFIG_KEY = 'support_notes_data';

// Helper: fetch current notes from app_config
async function fetchNotes(): Promise<SupportNote[]> {
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', CONFIG_KEY)
    .maybeSingle();

  if (error || !data?.value) return [];

  try {
    return JSON.parse(data.value);
  } catch {
    return [];
  }
}

// Helper: save notes to app_config
async function saveNotes(notes: SupportNote[]): Promise<boolean> {
  const { error } = await supabase
    .from('app_config')
    .upsert({
      key: CONFIG_KEY,
      value: JSON.stringify(notes),
      category: 'support',
      description: 'Support Center documentation notes',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

  return !error;
}

// GET - Fetch all notes
export async function GET() {
  try {
    const notes = await fetchNotes();
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Support notes GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST - Create a new note
export async function POST(request: NextRequest) {
  try {
    const { title, content, createdBy } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const notes = await fetchNotes();

    const newNote: SupportNote = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdBy: createdBy || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notes.unshift(newNote); // Add to beginning
    await saveNotes(notes);

    return NextResponse.json({ success: true, id: newNote.id });
  } catch (error) {
    console.error('Support notes POST error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

// PUT - Update an existing note
export async function PUT(request: NextRequest) {
  try {
    const { id, title, content } = await request.json();

    if (!id || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'ID, title and content are required' }, { status: 400 });
    }

    const notes = await fetchNotes();
    const index = notes.findIndex(n => n.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    notes[index] = {
      ...notes[index],
      title: title.trim(),
      content: content.trim(),
      updatedAt: new Date().toISOString(),
    };

    await saveNotes(notes);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Support notes PUT error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

// DELETE - Delete a note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    const notes = await fetchNotes();
    const filtered = notes.filter(n => n.id !== id);

    if (filtered.length === notes.length) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    await saveNotes(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Support notes DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
