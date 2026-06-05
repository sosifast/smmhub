import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function tryType1(url: string, apiKey: string, secretKey: string) {
  const formData = new FormData();
  formData.append("secret_key", secretKey || "");
  formData.append("api_key", apiKey || "");
  formData.append("action", "profile");
  
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(6000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json && json.status === true && json.data && json.data.balance !== undefined) {
    return Number(json.data.balance);
  }
  throw new Error("Format respon Type 1 tidak valid");
}

async function tryType2(url: string, secretKey: string) {
  const formData = new FormData();
  formData.append("action", "balance");
  formData.append("key", secretKey || "");
  
  const res = await fetch(url, {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(6000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json && (json.status === "success" || json.balance !== undefined)) {
    return Number(json.balance);
  }
  throw new Error("Format respon Type 2 tidak valid");
}

async function tryType3(url: string, apiKey: string, apiId: string) {
  let targetUrl = url;
  if (!targetUrl.endsWith("/profile")) {
    targetUrl = targetUrl.replace(/\/$/, "") + "/profile";
  }
  
  const formData = new FormData();
  formData.append("api_key", apiKey || "");
  formData.append("api_id", apiId || "");
  
  const res = await fetch(targetUrl, {
    method: "POST",
    body: formData,
    signal: AbortSignal.timeout(6000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json && json.status === true && json.data && json.data.balance !== undefined) {
    return Number(json.data.balance);
  }
  throw new Error("Format respon Type 3 tidak valid");
}

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing key ID." },
        { status: 400 }
      );
    }

    const { data: keyRecord, error: fetchError } = await supabase
      .from("api_key")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !keyRecord) {
      return NextResponse.json(
        { success: false, error: "Kunci API tidak ditemukan di database." },
        { status: 404 }
      );
    }

    if (!keyRecord.url) {
      return NextResponse.json(
        { success: false, error: "URL Integrasi kosong." },
        { status: 400 }
      );
    }

    let balance: number | null = null;
    let errors: string[] = [];

    // 1. Try Type 3 if api_id is present
    if (keyRecord.api_id && balance === null) {
      try {
        balance = await tryType3(keyRecord.url, keyRecord.api_key || "", keyRecord.api_id);
      } catch (e: any) {
        errors.push(`Format 3: ${e.message}`);
      }
    }

    // 2. Try Type 1 if both secret_key and api_key are present
    if (keyRecord.secret_key && keyRecord.api_key && balance === null) {
      try {
        balance = await tryType1(keyRecord.url, keyRecord.api_key, keyRecord.secret_key);
      } catch (e: any) {
        errors.push(`Format 1: ${e.message}`);
      }
    }

    // 3. Try Type 2 if secret_key or api_key are present
    if ((keyRecord.secret_key || keyRecord.api_key) && balance === null) {
      const keyToUse = keyRecord.secret_key || keyRecord.api_key || "";
      try {
        balance = await tryType2(keyRecord.url, keyToUse);
      } catch (e: any) {
        errors.push(`Format 2: ${e.message}`);
      }
    }

    // 4. Generic fallback try if balance is still null
    if (balance === null) {
      return NextResponse.json({
        success: false,
        error: `Gagal mengambil saldo dari provider. Detail error:\n${errors.join("\n")}`
      }, { status: 400 });
    }

    // Save updated balance to database
    const { error: updateError } = await supabase
      .from("api_key")
      .update({ 
        balance: balance,
        update_at: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      balance: balance
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
