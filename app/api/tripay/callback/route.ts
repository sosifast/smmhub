import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;
    const signature = headers.get('x-callback-signature');
    const event = headers.get('x-callback-event'); // ex: payment_status

    if (!signature) {
      return NextResponse.json({ success: false, message: 'Invalid signature.' }, { status: 400 });
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
    }

    // 1. Ambil Private Key Tripay dari database untuk validasi
    const { data: gatewayData, error: gatewayError } = await supabase
      .from('payment_gateway')
      .select('api_config')
      .eq('type', 'Tripay')
      .single();

    if (gatewayError || !gatewayData) {
      return NextResponse.json({ success: false, message: 'Gateway config not found.' }, { status: 500 });
    }

    const api_config = gatewayData.api_config as any;
    const privateKey = api_config?.privateKey || api_config?.private_key;

    if (!privateKey) {
      return NextResponse.json({ success: false, message: 'Private key not configured.' }, { status: 500 });
    }

    // 2. Validasi Signature Tripay
    const generatedSignature = crypto
      .createHmac('sha256', privateKey)
      .update(rawBody)
      .digest('hex');

    if (signature !== generatedSignature) {
      console.error("Tripay Callback Signature Mismatch");
      console.error("Received:", signature);
      console.error("Generated:", generatedSignature);
      console.error("Using Private Key (first 5 chars):", privateKey.substring(0, 5));
      return NextResponse.json({ success: false, message: 'Invalid signature.' }, { status: 403 });
    }

    // 3. Proses Data Webhook
    // Tripay mengirim event payment_status
    if (event !== 'payment_status') {
      return NextResponse.json({ success: true, message: 'Event ignored.' });
    }

    const { reference, status, merchant_ref } = parsedBody;

    let appStatus = 'Pending';
    if (status === 'PAID') {
      appStatus = 'Success';
    } else if (status === 'EXPIRED' || status === 'FAILED') {
      appStatus = 'Expired';
    } else if (status === 'REFUND') {
      appStatus = 'Error';
    }

    // 4. Update Database
    // Karena reference ada di dalam kolom JSONB detail_transaction,
    // kita menggunakan filter contains atau mencari record-nya.
    const { data: subscription, error: fetchError } = await supabase
      .from('langganan_smm')
      .select('id')
      .contains('detail_transaction', { reference: reference })
      .single();

    if (fetchError || !subscription) {
      console.error("Transaction not found for reference:", reference);
      return NextResponse.json({ success: false, message: 'Transaction not found.' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('langganan_smm')
      .update({ status_payment: appStatus })
      .eq('id', subscription.id);

    if (updateError) {
      console.error("Failed to update status:", updateError);
      return NextResponse.json({ success: false, message: 'Failed to update database.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Callback processed.' });

  } catch (error: any) {
    console.error("Tripay Callback Error:", error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
