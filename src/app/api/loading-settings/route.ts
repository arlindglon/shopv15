import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * Fast endpoint for loading screen settings
 * Returns only essential data for the loading screen
 */
export async function GET() {
  try {
    // First, try to get existing columns
    const { data: checkData, error: checkError } = await supabase
      .from('app_settings')
      .select('shop_name, shop_logo, shop_bio, loading_text')
      .limit(1)
      .single();

    if (checkError) {
      console.error('Fetch loading settings error:', checkError);
      return NextResponse.json({
        shopName: 'Dokan',
        shopLogo: '',
        shopBio: 'Smart Shop Management',
        loadingText: 'Loading...',
        loadingTitle: 'Dokan',
        loadingSubtitle: 'Smart Shop Management',
        loadingAnimationType: 'spinner',
      });
    }

    // Try to get new columns, fall back to defaults if they don't exist
    let loadingTitle = checkData.shop_name || 'Dokan';
    let loadingSubtitle = checkData.shop_bio || 'Smart Shop Management';
    let loadingAnimationType = 'spinner';

    // Try to fetch new columns (they may not exist yet)
    try {
      const { data: newData } = await supabase
        .from('app_settings')
        .select('loading_title, loading_subtitle, loading_animation_type')
        .limit(1)
        .single();
      
      if (newData) {
        loadingTitle = newData.loading_title || loadingTitle;
        loadingSubtitle = newData.loading_subtitle || loadingSubtitle;
        loadingAnimationType = newData.loading_animation_type || 'spinner';
      }
    } catch {
      // Columns don't exist yet, use defaults
    }

    return NextResponse.json({
      shopName: checkData.shop_name || 'Dokan',
      shopLogo: checkData.shop_logo || '',
      shopBio: checkData.shop_bio || 'Smart Shop Management',
      loadingText: checkData.loading_text || 'Loading...',
      loadingTitle,
      loadingSubtitle,
      loadingAnimationType,
    });
  } catch (error) {
    console.error('Loading settings error:', error);
    return NextResponse.json({
      shopName: 'Dokan',
      shopLogo: '',
      shopBio: 'Smart Shop Management',
      loadingText: 'Loading...',
      loadingTitle: 'Dokan',
      loadingSubtitle: 'Smart Shop Management',
      loadingAnimationType: 'spinner',
    });
  }
}
