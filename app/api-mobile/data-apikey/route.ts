import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 1. GET: List API keys for a specific user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_user = searchParams.get("id_user");

    if (!id_user) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: id_user." },
        { status: 400 }
      );
    }

    const { data: keys, error } = await supabase
      .from("api_key")
      .select("*, user:id_user(email, full_name)")
      .eq("id_user", id_user)
      .order("create_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: keys || []
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// 2. POST: Create/Generate a new API key
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_user, name, code, url, balance } = body;

    if (!id_user || !name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (id_user, name)." },
        { status: 400 }
      );
    }

    // Generate random mock tokens
    const randomHex = Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const generatedToken = `smm_live_${randomHex}`;
    const generatedApiId = `api_${Math.floor(Math.random() * 10000)}`;

    const { data: newKey, error } = await supabase
      .from("api_key")
      .insert({
        id_user,
        name,
        api_key: generatedToken,
        secret_key: "Read/Write", // default access level
        balance: balance !== undefined ? Number(balance) : 100.00,
        status: "Active",
        code: code || "SMM",
        api_id: generatedApiId,
        url: url || "https://api.smmhub.com/v1"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "API Key generated successfully.",
      data: newKey
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// 3. PUT: Edit/Update an existing API key
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, status, balance, url } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id." },
        { status: 400 }
      );
    }

    // Construct update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (balance !== undefined) updateData.balance = Number(balance);
    
    if (status !== undefined) {
      // Map API status 'Inactive' to DB constraints 'Not-Active'
      const dbStatus = status === "Inactive" || status === "Not-Active" ? "Not-Active" : "Active";
      updateData.status = dbStatus;
    }

    const { data: updatedKey, error } = await supabase
      .from("api_key")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

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

// 4. DELETE: Revoke/Delete an API key
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
        // body not present
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
      message: "API Key revoked successfully."
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
