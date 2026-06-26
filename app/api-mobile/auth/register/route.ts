import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const start = Date.now();
  const endpoint = "/api-mobile/auth/register";
  const method = "POST";
  
  const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown IP";
  const userAgent = request.headers.get("user-agent") || "Unknown User Agent";
  
  let statusCode = 200;
  let userId: string | null = null;

  try {
    const body = await request.json();
    const { full_name, email, password } = body;

    if (!full_name || !email || !password) {
      statusCode = 400;
      await logApi(endpoint, method, statusCode, start, ipAddress, userAgent, userId);
      return NextResponse.json(
        { success: false, error: "Missing required fields (full_name, email, password)." },
        { status: 400 }
      );
    }

    // Insert user into Supabase user table
    const { data: newUser, error } = await supabase
      .from("user")
      .insert({
        full_name,
        email,
        password,
        level: "Member",
        status: "Active"
      })
      .select("id, full_name, email, level, status, create_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        statusCode = 409;
        await logApi(endpoint, method, statusCode, start, ipAddress, userAgent, userId);
        return NextResponse.json(
          { success: false, error: "Email address is already registered." },
          { status: 409 }
        );
      }
      throw error;
    }

    userId = newUser.id;
    await logApi(endpoint, method, statusCode, start, ipAddress, userAgent, userId);

    return NextResponse.json({
      success: true,
      message: "User registered successfully.",
      data: newUser
    });

  } catch (err: any) {
    statusCode = 500;
    await logApi(endpoint, method, statusCode, start, ipAddress, userAgent, userId);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

async function logApi(
  endpoint: string, 
  method: string, 
  statusCode: number, 
  start: number, 
  ipAddress: string, 
  userAgent: string, 
  userId: string | null
) {
  const latencyMs = Date.now() - start;
  try {
    await supabase.from('api_logs').insert({
      endpoint,
      method,
      status_code: statusCode,
      latency_ms: latencyMs,
      ip_address: ipAddress,
      user_agent: userAgent,
      id_user: userId
    });
  } catch (e) {
    console.error("Failed to insert API log", e);
  }
}
