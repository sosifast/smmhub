import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, new_password } = body;

    if (!email || !new_password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (email, new_password)." },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // 1. Check if email exists
    const { data: user, error: getError } = await supabase
      .from("user")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (getError) throw getError;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No user accounts match the provided email address." },
        { status: 404 }
      );
    }

    // 2. Perform update
    const { error: updateError } = await supabase
      .from("user")
      .update({ password: new_password })
      .eq("email", email);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: "Password reset successful."
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
