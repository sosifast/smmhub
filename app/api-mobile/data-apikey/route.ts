import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Helper sync functions for the three SMM panel formats
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

// 1. GET: Read details of a specific key or list keys for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const id_user = searchParams.get("id_user");

    if (!id && !id_user) {
      return NextResponse.json(
        { success: false, error: "Missing parameter: id or id_user must be provided." },
        { status: 400 }
      );
    }

    if (id) {
      // Fetch details of a single API key
      const { data, error } = await supabase
        .from("api_key")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) {
        return NextResponse.json(
          { success: false, error: "API Key not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: data.id,
          id_user: data.id_user,
          name: data.name,
          code: data.code || null,
          url: data.url,
          api_key: data.api_key,
          api_id: data.api_id || null,
          secret_key: data.secret_key || null,
          balance: Number(data.balance ?? 0),
          status: data.status,
          create_at: data.create_at,
          update_at: data.update_at
        }
      });
    } else {
      // List API keys for a specific user
      const { data, error } = await supabase
        .from("api_key")
        .select("*")
        .eq("id_user", id_user)
        .order("create_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((item: any) => ({
        id: item.id,
        id_user: item.id_user,
        name: item.name,
        code: item.code || null,
        url: item.url,
        api_key: item.api_key,
        api_id: item.api_id || null,
        secret_key: item.secret_key || null,
        balance: Number(item.balance ?? 0),
        status: item.status,
        create_at: item.create_at,
        update_at: item.update_at
      }));

      return NextResponse.json({
        success: true,
        data: mapped
      });
    }

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new API Key by user inputs (no generation)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_user, name, api_key, url, secret_key, api_id, balance, code } = body;

    // Validation
    if (!id_user) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id_user." },
        { status: 400 }
      );
    }
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Missing required field: name." },
        { status: 400 }
      );
    }
    if (!api_key) {
      return NextResponse.json(
        { success: false, error: "Missing required field: api_key." },
        { status: 400 }
      );
    }
    if (!url) {
      return NextResponse.json(
        { success: false, error: "Missing required field: url." },
        { status: 400 }
      );
    }

    const { data: newKey, error } = await supabase
      .from("api_key")
      .insert({
        id_user,
        name,
        api_key: api_key.trim(),
        url: url.trim(),
        secret_key: secret_key ? secret_key.trim() : null,
        api_id: api_id ? api_id.trim() : null,
        balance: balance !== undefined && balance !== "" ? Number(balance) : 0.00,
        code: code ? code.trim() : "SMM",
        status: "Active"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "API Key created successfully.",
      data: newKey
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// 3. PUT: Update an existing API Key
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, code, api_key, api_id, secret_key, url, balance, status, sync } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id." },
        { status: 400 }
      );
    }

    // Load current key info from db to merge fields
    const { data: currentKey, error: fetchError } = await supabase
      .from("api_key")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentKey) {
      return NextResponse.json(
        { success: false, error: "API Key record not found." },
        { status: 404 }
      );
    }

    // Merge body params with current db fields
    const mergedName = name !== undefined ? name : currentKey.name;
    const mergedCode = code !== undefined ? code : currentKey.code;
    const mergedApiKey = api_key !== undefined ? api_key : currentKey.api_key;
    const mergedApiId = api_id !== undefined ? (api_id ? api_id : null) : currentKey.api_id;
    const mergedSecretKey = secret_key !== undefined ? (secret_key ? secret_key : null) : currentKey.secret_key;
    const mergedUrl = url !== undefined ? url : currentKey.url;
    const mergedStatus = status !== undefined ? status : currentKey.status;
    let mergedBalance = balance !== undefined && balance !== "" ? Number(balance) : Number(currentKey.balance ?? 0);

    // Sync from provider if requested
    if (sync === true) {
      if (!mergedUrl) {
        return NextResponse.json(
          { success: false, error: "Cannot sync balance: Integration URL is empty." },
          { status: 400 }
        );
      }

      let syncedBalance: number | null = null;
      let syncErrors: string[] = [];

      // Try Type 3 if api_id is present
      if (mergedApiId && mergedApiKey && syncedBalance === null) {
        try {
          syncedBalance = await tryType3(mergedUrl, mergedApiKey, mergedApiId);
        } catch (e: any) {
          syncErrors.push(`Format 3: ${e.message}`);
        }
      }

      // Try Type 1 if both secret_key and api_key are present
      if (mergedSecretKey && mergedApiKey && syncedBalance === null) {
        try {
          syncedBalance = await tryType1(mergedUrl, mergedApiKey, mergedSecretKey);
        } catch (e: any) {
          syncErrors.push(`Format 1: ${e.message}`);
        }
      }

      // Try Type 2 if secret_key or api_key are present
      if ((mergedSecretKey || mergedApiKey) && syncedBalance === null) {
        const keyToUse = mergedSecretKey || mergedApiKey || "";
        try {
          syncedBalance = await tryType2(mergedUrl, keyToUse);
        } catch (e: any) {
          syncErrors.push(`Format 2: ${e.message}`);
        }
      }

      if (syncedBalance === null) {
        return NextResponse.json(
          { success: false, error: `Failed to sync balance from provider SMM. Details:\n${syncErrors.join("\n")}` },
          { status: 400 }
        );
      }

      mergedBalance = syncedBalance;
    }

    // Update in database
    const { data: updatedKey, error: updateError } = await supabase
      .from("api_key")
      .update({
        name: mergedName,
        code: mergedCode,
        api_key: mergedApiKey,
        api_id: mergedApiId,
        secret_key: mergedSecretKey,
        url: mergedUrl,
        balance: mergedBalance,
        status: mergedStatus,
        update_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: "API Key updated successfully.",
      data: updatedKey
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// 4. DELETE: Delete an API Key
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    // Fallback: check request body if query param is not provided
    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch (e) {
        // body not present or invalid
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: id." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("api_key")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "API Key deleted successfully."
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
