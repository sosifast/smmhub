import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Ambil konfigurasi Tripay dari database
    const { data: gatewayData, error: gatewayError } = await supabase
      .from('payment_gateway')
      .select('mode, api_config')
      .eq('type', 'Tripay')
      .single();

    if (gatewayError || !gatewayData) {
      console.error("Payment Gateway Error:", gatewayError);
      return NextResponse.json({ 
        success: false, 
        message: 'Konfigurasi Tripay tidak ditemukan di database.' 
      }, { status: 404 });
    }

    const { mode, api_config } = gatewayData;
    
    // Pastikan apiKey ada di dalam JSON (mendukung format camelCase atau snake_case)
    const apiKey = (api_config as any)?.apiKey || (api_config as any)?.api_key;
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        message: 'API Key Tripay belum diatur dalam konfigurasi database.' 
      }, { status: 400 });
    }

    // 2. Tentukan URL berdasarkan Mode
    const tripayUrl = mode === 'Production' 
      ? 'https://tripay.co.id/api/merchant/payment-channel'
      : 'https://tripay.co.id/api-sandbox/merchant/payment-channel';

    // 3. Request ke Tripay API
    const response = await fetch(tripayUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Tripay API Error:", result);
      return NextResponse.json({ 
        success: false, 
        message: result.message || 'Gagal mengambil data dari Tripay API.',
        error: result 
      }, { status: response.status });
    }

    // 4. Return data asli ke Frontend
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Internal Server Error (Tripay Channels):", error);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server.',
      error: error.message
    }, { status: 500 });
  }
}
