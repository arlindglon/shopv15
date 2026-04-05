import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Helper to get value from either snake_case or camelCase
const getValue = (obj: Record<string, any>, snakeCase: string, camelCase: string, defaultValue: any = '') => {
  return obj[snakeCase] ?? obj[camelCase] ?? defaultValue;
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Fetch settings error:', error);
      return NextResponse.json({
        id: 'default', shopName: 'Dokan', shopLogo: '', shopBannerImage: '',
        shopAddress: '', shopPhone: '', shopEmail: '', shopWebsite: '',
        shopBio: '', shopServices: '', taxId: '', registrationNo: '',
        openingHours: '', facebookUrl: '', instagramUrl: '',
        whatsappNumber: '', youtubeUrl: '', bankName: '',
        bankAccountName: '', bankAccountNumber: '', bankBranch: '',
        loadingText: 'Loading...', loadingTitle: 'Dokan',
        loadingSubtitle: 'Smart Shop Management', loadingAnimationType: 'spinner',
        currency: 'BDT', currencySymbol: '৳', taxRate: 0, taxEnabled: false,
        allowWalkInCustomer: true, subscriptionExpiryDate: null,
        subscriptionContactPhone: '', subscriptionContactEmail: '',
        subscriptionContactWhatsapp: '',
      });
    }

    // Also fetch loading settings from app_config (for fields that don't have DB columns)
    let loadingTitle = getValue(data, 'loading_title', 'loadingTitle', getValue(data, 'shop_name', 'shopName', 'Dokan'));
    let loadingSubtitle = getValue(data, 'loading_subtitle', 'loadingSubtitle', getValue(data, 'shop_bio', 'shopBio', 'Smart Shop Management'));
    let loadingAnimationType = getValue(data, 'loading_animation_type', 'loadingAnimationType', 'spinner');

    try {
      const { data: configData } = await supabase
        .from('app_config')
        .select('key, value')
        .or('key.eq.loading_title,key.eq.loading_subtitle,key.eq.loading_animation_type');

      if (configData) {
        configData.forEach((row: { key: string; value: string }) => {
          if (row.key === 'loading_title' && row.value) loadingTitle = row.value;
          if (row.key === 'loading_subtitle' && row.value) loadingSubtitle = row.value;
          if (row.key === 'loading_animation_type' && row.value) loadingAnimationType = row.value;
        });
      }
    } catch (e) {
      // Ignore app_config read errors
    }

    // Map snake_case DB columns to camelCase for frontend
    return NextResponse.json({
      id: data.id,
      shopName: getValue(data, 'shop_name', 'shopName', 'Dokan'),
      shopLogo: getValue(data, 'shop_logo', 'shopLogo', ''),
      shopBannerImage: getValue(data, 'shop_banner_image', 'shopBannerImage', ''),
      shopAddress: getValue(data, 'shop_address', 'shopAddress', ''),
      shopPhone: getValue(data, 'shop_contact', 'shopContact', ''),
      shopEmail: getValue(data, 'shop_email', 'shopEmail', ''),
      shopWebsite: getValue(data, 'website', 'shopWebsite', ''),
      shopBio: getValue(data, 'shop_bio', 'shopBio', ''),
      shopServices: getValue(data, 'shop_services', 'shopServices', ''),
      taxId: getValue(data, 'tax_id', 'taxId', ''),
      registrationNo: getValue(data, 'registration_no', 'registrationNo', ''),
      openingHours: getValue(data, 'opening_hours', 'openingHours', ''),
      facebookUrl: getValue(data, 'facebook', 'facebookUrl', ''),
      instagramUrl: getValue(data, 'instagram', 'instagramUrl', ''),
      whatsappNumber: getValue(data, 'whatsapp', 'whatsappNumber', ''),
      youtubeUrl: getValue(data, 'youtube_url', 'youtubeUrl', ''),
      bankName: getValue(data, 'bank_name', 'bankName', ''),
      bankAccountName: getValue(data, 'bank_account_name', 'bankAccountName', ''),
      bankAccountNumber: getValue(data, 'bank_account_number', 'bankAccountNumber', ''),
      bankBranch: getValue(data, 'bank_branch', 'bankBranch', ''),
      loadingText: getValue(data, 'loading_text', 'loadingText', 'Loading...'),
      loadingTitle,
      loadingSubtitle,
      loadingAnimationType,
      currency: getValue(data, 'currency', 'currency', 'BDT'),
      currencySymbol: getValue(data, 'currency_symbol', 'currencySymbol', '৳'),
      taxRate: getValue(data, 'tax_rate', 'taxRate', 0),
      taxEnabled: getValue(data, 'tax_enabled', 'taxEnabled', false),
      allowWalkInCustomer: getValue(data, 'allow_walk_in_customer', 'allowWalkInCustomer', true) === true,
      subscriptionPlan: getValue(data, 'subscription_plan', 'subscriptionPlan', 'premium'),
      subscriptionExpiryDate: getValue(data, 'subscription_expiry_date', 'subscriptionExpiryDate', null),
      subscriptionContactPhone: getValue(data, 'subscription_contact_phone', 'subscriptionContactPhone', ''),
      subscriptionContactEmail: getValue(data, 'subscription_contact_email', 'subscriptionContactEmail', ''),
      subscriptionContactWhatsapp: getValue(data, 'subscription_contact_whatsapp', 'subscriptionContactWhatsapp', ''),
      featureLimits: data.feature_limits || data.featureLimits || null,
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({
      id: 'default',
      shopName: 'Dokan',
      shopLogo: '',
      shopBannerImage: '',
      shopAddress: '',
      shopPhone: '',
      shopEmail: '',
      shopWebsite: '',
      shopBio: '',
      shopServices: '',
      taxId: '',
      registrationNo: '',
      openingHours: '',
      facebookUrl: '',
      instagramUrl: '',
      whatsappNumber: '',
      youtubeUrl: '',
      bankName: '',
      bankAccountName: '',
      bankAccountNumber: '',
      bankBranch: '',
      loadingText: 'Loading...',
      loadingTitle: 'Dokan',
      loadingSubtitle: 'Smart Shop Management',
      loadingAnimationType: 'spinner',
      currency: 'BDT',
      currencySymbol: '৳',
      taxRate: 0,
      taxEnabled: false,
      allowWalkInCustomer: true,
      subscriptionPlan: 'premium',
      subscriptionExpiryDate: null,
      subscriptionContactPhone: '',
      subscriptionContactEmail: '',
      subscriptionContactWhatsapp: '',
      featureLimits: null,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    console.log('PUT settings - received body:', body);
    console.log('PUT settings - allowWalkInCustomer to save:', body.allowWalkInCustomer);

    // Map camelCase frontend to snake_case DB columns
    const updateData: Record<string, any> = {
      id: 'default-settings',
    };

    // Map all fields to snake_case
    if (body.shopName !== undefined) updateData.shop_name = body.shopName;
    if (body.shopLogo !== undefined) updateData.shop_logo = body.shopLogo;
    if (body.shopBannerImage !== undefined) updateData.shop_banner_image = body.shopBannerImage;
    if (body.shopAddress !== undefined) updateData.shop_address = body.shopAddress;
    if (body.shopPhone !== undefined) updateData.shop_contact = body.shopPhone;
    if (body.shopEmail !== undefined) updateData.shop_email = body.shopEmail;
    if (body.shopWebsite !== undefined) updateData.website = body.shopWebsite;
    if (body.shopBio !== undefined) updateData.shop_bio = body.shopBio;
    if (body.shopServices !== undefined) updateData.shop_services = body.shopServices;
    if (body.taxId !== undefined) updateData.tax_id = body.taxId;
    if (body.registrationNo !== undefined) updateData.registration_no = body.registrationNo;
    if (body.openingHours !== undefined) updateData.opening_hours = body.openingHours;
    if (body.currencySymbol !== undefined) updateData.currency_symbol = body.currencySymbol;
    if (body.receiptFooter !== undefined) updateData.receipt_footer = body.receiptFooter;
    if (body.invoiceNote !== undefined) updateData.invoice_note = body.invoiceNote;
    if (body.facebookUrl !== undefined) updateData.facebook = body.facebookUrl;
    if (body.instagramUrl !== undefined) updateData.instagram = body.instagramUrl;
    if (body.whatsappNumber !== undefined) updateData.whatsapp = body.whatsappNumber;
    if (body.youtubeUrl !== undefined) updateData.youtube_url = body.youtubeUrl;
    if (body.bankName !== undefined) updateData.bank_name = body.bankName;
    if (body.bankAccountName !== undefined) updateData.bank_account_name = body.bankAccountName;
    if (body.bankAccountNumber !== undefined) updateData.bank_account_number = body.bankAccountNumber;
    if (body.bankBranch !== undefined) updateData.bank_branch = body.bankBranch;
    if (body.loadingText !== undefined) updateData.loading_text = body.loadingText;
    // Note: loading_title, loading_subtitle, loading_animation_type columns may not exist
    // We'll save them separately if the columns exist, otherwise we skip them
    if (body.allowWalkInCustomer !== undefined) updateData.allow_walk_in_customer = body.allowWalkInCustomer;
    
    // Subscription fields
    if (body.subscriptionPlan !== undefined) updateData.subscription_plan = body.subscriptionPlan;
    if (body.subscriptionExpiryDate !== undefined) updateData.subscription_expiry_date = body.subscriptionExpiryDate;
    if (body.subscriptionContactPhone !== undefined) updateData.subscription_contact_phone = body.subscriptionContactPhone;
    if (body.subscriptionContactEmail !== undefined) updateData.subscription_contact_email = body.subscriptionContactEmail;
    if (body.subscriptionContactWhatsapp !== undefined) updateData.subscription_contact_whatsapp = body.subscriptionContactWhatsapp;
    
    // Feature Limits - store as JSON (skip if column doesn't exist)
    // Note: feature_limits column needs to be added to app_settings table
    // ALTER TABLE app_settings ADD COLUMN feature_limits JSONB DEFAULT NULL;
    if (body.featureLimits !== undefined) {
      // Try to save, but don't fail if column doesn't exist
      try {
        updateData.feature_limits = body.featureLimits;
      } catch (e) {
        console.log('feature_limits column may not exist, skipping...');
      }
    }

    console.log('PUT settings - updateData to save:', updateData);

    // Save loading_title, loading_subtitle, loading_animation_type to app_config
    // (these columns don't exist in app_settings table)
    const configSaves: Promise<void>[] = [];
    if (body.loadingTitle !== undefined) {
      configSaves.push(
        supabase.from('app_config').upsert({
          key: 'loading_title', value: body.loadingTitle, category: 'settings',
          description: 'Custom loading screen title', updated_at: new Date().toISOString(),
        }, { onConflict: 'key' }).then(() => {})
      );
    }
    if (body.loadingSubtitle !== undefined) {
      configSaves.push(
        supabase.from('app_config').upsert({
          key: 'loading_subtitle', value: body.loadingSubtitle, category: 'settings',
          description: 'Custom loading screen subtitle', updated_at: new Date().toISOString(),
        }, { onConflict: 'key' }).then(() => {})
      );
    }
    if (body.loadingAnimationType !== undefined) {
      configSaves.push(
        supabase.from('app_config').upsert({
          key: 'loading_animation_type', value: body.loadingAnimationType, category: 'settings',
          description: 'Loading screen animation type', updated_at: new Date().toISOString(),
        }, { onConflict: 'key' }).then(() => {})
      );
    }

    // Remove loading_ fields from updateData since columns don't exist
    delete updateData.loading_title;
    delete updateData.loading_subtitle;
    delete updateData.loading_animation_type;

    // Try update first with WHERE clause
    const { data: updateResult, error: updateError } = await supabase
      .from('app_settings')
      .update(updateData)
      .eq('id', 'default-settings')
      .select()
      .single();

    let data = updateResult;
    let error = updateError;

    // If error due to missing columns, retry without problematic columns
    if (error && error.message?.includes('column')) {
      console.log('Column error, retrying without problematic columns...', error.message);
      const safeUpdateData = { ...updateData };
      delete safeUpdateData.feature_limits;
      const { data: retryResult, error: retryError } = await supabase
        .from('app_settings')
        .update(safeUpdateData)
        .eq('id', 'default-settings')
        .select()
        .single();
      if (!retryError) { data = retryResult; error = null; }
    }

    // If no rows updated, try upsert
    if (error || !data) {
      console.log('Update failed, trying upsert...', error);
      const safeUpdateData = { ...updateData };
      delete safeUpdateData.feature_limits;
      const { data: upsertResult, error: upsertError } = await supabase
        .from('app_settings')
        .upsert(safeUpdateData, { onConflict: 'id' })
        .select()
        .single();
      data = upsertResult;
      error = upsertError;
    }

    // Wait for config saves to complete
    await Promise.all(configSaves);

    if (error) {
      console.error('PUT settings - Supabase error:', error);
      throw error;
    }

    console.log('PUT settings - data from Supabase after save:', data);

    // Read loading settings from app_config for response
    let resLoadingTitle = getValue(data, 'loading_title', 'loadingTitle', getValue(data, 'shop_name', 'shopName', 'Dokan'));
    let resLoadingSubtitle = getValue(data, 'loading_subtitle', 'loadingSubtitle', getValue(data, 'shop_bio', 'shopBio', 'Smart Shop Management'));
    let resLoadingAnimationType = getValue(data, 'loading_animation_type', 'loadingAnimationType', 'spinner');

    try {
      const { data: cfgData } = await supabase
        .from('app_config')
        .select('key, value')
        .or('key.eq.loading_title,key.eq.loading_subtitle,key.eq.loading_animation_type');
      if (cfgData) {
        cfgData.forEach((row: { key: string; value: string }) => {
          if (row.key === 'loading_title' && row.value) resLoadingTitle = row.value;
          if (row.key === 'loading_subtitle' && row.value) resLoadingSubtitle = row.value;
          if (row.key === 'loading_animation_type' && row.value) resLoadingAnimationType = row.value;
        });
      }
    } catch {}

    // Return properly formatted response
    const responseData = {
      id: data.id,
      shopName: getValue(data, 'shop_name', 'shopName', 'Dokan'),
      shopLogo: getValue(data, 'shop_logo', 'shopLogo', ''),
      shopBannerImage: getValue(data, 'shop_banner_image', 'shopBannerImage', ''),
      shopAddress: getValue(data, 'shop_address', 'shopAddress', ''),
      shopPhone: getValue(data, 'shop_contact', 'shopContact', ''),
      shopEmail: getValue(data, 'shop_email', 'shopEmail', ''),
      shopWebsite: getValue(data, 'website', 'shopWebsite', ''),
      shopBio: getValue(data, 'shop_bio', 'shopBio', ''),
      shopServices: getValue(data, 'shop_services', 'shopServices', ''),
      taxId: getValue(data, 'tax_id', 'taxId', ''),
      registrationNo: getValue(data, 'registration_no', 'registrationNo', ''),
      openingHours: getValue(data, 'opening_hours', 'openingHours', ''),
      facebookUrl: getValue(data, 'facebook', 'facebookUrl', ''),
      instagramUrl: getValue(data, 'instagram', 'instagramUrl', ''),
      whatsappNumber: getValue(data, 'whatsapp', 'whatsappNumber', ''),
      youtubeUrl: getValue(data, 'youtube_url', 'youtubeUrl', ''),
      bankName: getValue(data, 'bank_name', 'bankName', ''),
      bankAccountName: getValue(data, 'bank_account_name', 'bankAccountName', ''),
      bankAccountNumber: getValue(data, 'bank_account_number', 'bankAccountNumber', ''),
      bankBranch: getValue(data, 'bank_branch', 'bankBranch', ''),
      loadingText: getValue(data, 'loading_text', 'loadingText', 'Loading...'),
      loadingTitle: resLoadingTitle,
      loadingSubtitle: resLoadingSubtitle,
      loadingAnimationType: resLoadingAnimationType,
      currency: getValue(data, 'currency', 'currency', 'BDT'),
      currencySymbol: getValue(data, 'currency_symbol', 'currencySymbol', '৳'),
      taxRate: getValue(data, 'tax_rate', 'taxRate', 0),
      taxEnabled: getValue(data, 'tax_enabled', 'taxEnabled', false),
      allowWalkInCustomer: getValue(data, 'allow_walk_in_customer', 'allowWalkInCustomer', true) === true,
      subscriptionPlan: getValue(data, 'subscription_plan', 'subscriptionPlan', 'premium'),
      subscriptionExpiryDate: getValue(data, 'subscription_expiry_date', 'subscriptionExpiryDate', null),
      subscriptionContactPhone: getValue(data, 'subscription_contact_phone', 'subscriptionContactPhone', ''),
      subscriptionContactEmail: getValue(data, 'subscription_contact_email', 'subscriptionContactEmail', ''),
      subscriptionContactWhatsapp: getValue(data, 'subscription_contact_whatsapp', 'subscriptionContactWhatsapp', ''),
      featureLimits: data.feature_limits || data.featureLimits || null,
    };

    console.log('PUT settings - returning response:', responseData);
    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
