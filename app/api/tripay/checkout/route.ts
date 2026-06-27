import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, method, userId } = body;
    
    // Dapatkan base URL dari request (misal: localhost, ngrok, atau production domain)
    const baseUrl = new URL(req.url).origin;

    if (!planId || !method) {
      return NextResponse.json({ success: false, message: 'Plan ID dan Method harus diisi.' }, { status: 400 });
    }

    // 1. Ambil detail paket dari database
    const { data: planData, error: planError } = await supabase
      .from('paket_smm')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !planData) {
      return NextResponse.json({ success: false, message: 'Paket tidak ditemukan.' }, { status: 404 });
    }

    // 2. Ambil konfigurasi Tripay
    const { data: gatewayData, error: gatewayError } = await supabase
      .from('payment_gateway')
      .select('id, mode, api_config')
      .eq('type', 'Tripay')
      .single();

    if (gatewayError || !gatewayData) {
      return NextResponse.json({ success: false, message: 'Konfigurasi Tripay tidak ditemukan.' }, { status: 404 });
    }

    const { mode, api_config, id: id_payment_gateway } = gatewayData;
    const apiKey = (api_config as any)?.apiKey || (api_config as any)?.api_key;
    const privateKey = (api_config as any)?.privateKey || (api_config as any)?.private_key;
    const merchantCode = (api_config as any)?.merchantCode || (api_config as any)?.merchant_code;

    if (!apiKey || !privateKey || !merchantCode) {
      return NextResponse.json({ success: false, message: 'Konfigurasi kredensial Tripay tidak lengkap.' }, { status: 400 });
    }

    // 3. Persiapkan Data Transaksi
    // Jika tidak ada user ID, gunakan ID dummy sementara (atau abaikan relasi jika DB diizinkan nullable). 
    // Tapi karena tabel id_users NOT NULL, kita butuh User ID yang valid di tabel user.
    // Kita akan ambil satu user acak jika userId kosong untuk keperluan testing.
    let finalUserId = userId;
    if (!finalUserId) {
      const { data: randomUser } = await supabase.from('user').select('id').limit(1).single();
      if (randomUser) {
        finalUserId = randomUser.id;
      } else {
         return NextResponse.json({ success: false, message: 'Tidak ada user di database untuk dipasangkan (dummy test gagal).' }, { status: 400 });
      }
    }

    const merchantRef = `INV-${Date.now()}`;
    const amount = planData.price;

    // 4. Buat Signature HMAC-SHA256
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(merchantCode + merchantRef + amount)
      .digest('hex');

    const expiredTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 Jam dari sekarang

    const payload = {
      method: method,
      merchant_ref: merchantRef,
      amount: amount,
      customer_name: "Member SMMHub",
      customer_email: "member@smmhub.com",
      customer_phone: "081234567890",
      order_items: [
        {
          sku: `PKT-${planData.id.substring(0, 5)}`,
          name: planData.nama_paket,
          price: amount,
          quantity: 1,
          product_url: "https://smmhub.com/membership/plan/smm-api",
          image_url: "https://smmhub.com/logo.png"
        }
      ],
      return_url: `${baseUrl}/membership/history/subscribe-smm-api`,
      expired_time: expiredTime,
      signature: signature
    };

    const tripayUrl = mode === 'Production' 
      ? 'https://tripay.co.id/api/transaction/create'
      : 'https://tripay.co.id/api-sandbox/transaction/create';

    // 5. Tembak Tripay API
    const response = await fetch(tripayUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Tripay Checkout Error:", result);
      return NextResponse.json({ 
        success: false, 
        message: 'Gagal membuat tagihan di Tripay.',
        error: result 
      }, { status: 400 });
    }

    // 6. Simpan transaksi ke tabel langganan_smm
    const checkoutUrl = result.data.checkout_url;
    
    const { error: insertError } = await supabase
      .from('langganan_smm')
      .insert({
        id_users: finalUserId,
        id_paket_smm: planData.id,
        id_payment_gateway: id_payment_gateway,
        status_payment: 'Pending',
        detail_transaction: {
          reference: result.data.reference,
          merchant_ref: result.data.merchant_ref,
          checkout_url: checkoutUrl,
          payment_method: method,
          total_fee: result.data.total_fee,
          amount_received: result.data.amount_received
        }
      });

    if (insertError) {
      console.error("Database Insert Error:", insertError);
      // Kita tetap mereturn checkoutUrl agar user bisa bayar, meskipun log gagal (untuk toleransi)
    }

    // 7. Kembalikan checkout URL
    return NextResponse.json({
      success: true,
      checkout_url: checkoutUrl,
      reference: result.data.reference
    });

  } catch (error: any) {
    console.error("Internal Server Error (Tripay Checkout):", error);
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan pada server saat checkout.',
      error: error.message
    }, { status: 500 });
  }
}
