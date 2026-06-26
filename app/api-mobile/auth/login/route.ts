import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const start = Date.now();
  const endpoint = "/api-mobile/auth/login";
  const method = "POST";
  
  const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown IP";
  const userAgent = request.headers.get("user-agent") || "Unknown User Agent";
  
  let statusCode = 200;
  let userId: string | null = null;

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      statusCode = 400;
      await logApi(endpoint, method, statusCode, start, ipAddress, userAgent, userId);
      return NextResponse.json(
        { success: false, error: "Missing email or password." },
        { status: 400 }
      );
    }

    // Query user matching credentials
    const { data: user, error } = await supabase
      .from("user")
      .select("id, full_name, email, password, level, status, create_at")
      .eq("email", email)
      .eq("password", password)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      statusCode = 401;
      await logApi(endpoint, method, statusCode, start, ipAddress, userAgent, userId);
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    userId = user.id;

    if (user.status !== "Active") {
      statusCode = 403;
      await logApi(endpoint, method, statusCode, start, ipAddress, userAgent, userId);
      return NextResponse.json(
        { success: false, error: "Your account is currently inactive. Please contact support." },
        { status: 403 }
      );
    }

    // Strip password from returned payload
    const { password: _, ...userSession } = user;

    await logApi(endpoint, method, statusCode, start, ipAddress, userAgent, userId);
    return NextResponse.json({
      success: true,
      message: "Login successful.",
      data: userSession
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
