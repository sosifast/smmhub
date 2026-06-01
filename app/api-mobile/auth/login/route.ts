import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
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
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.status !== "Active") {
      return NextResponse.json(
        { success: false, error: "Your account is currently inactive. Please contact support." },
        { status: 403 }
      );
    }

    // Strip password from returned payload
    const { password: _, ...userSession } = user;

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      data: userSession
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 550 }
    );
  }
}
