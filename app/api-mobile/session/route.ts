import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 1. GET: Fetch & Validate a session (Active / Expired checking)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: id." },
        { status: 400 }
      );
    }

    const { data: session, error } = await supabase
      .from("session")
      .select("*, user:id_user(email, full_name)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!session) {
      return NextResponse.json(
        { success: false, active: false, error: "Session not found." },
        { status: 404 }
      );
    }

    // Check if session status is "Login" and expired_at has not passed
    const isExpired = new Date(session.expired_at).getTime() < Date.now();
    const isActive = session.status === "Login" && !isExpired;

    return NextResponse.json({
      success: true,
      active: isActive,
      data: session
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new login session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_user, session_data, expired_at } = body;

    if (!id_user) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id_user." },
        { status: 400 }
      );
    }

    // Default expiry duration: 30 days from now
    const expiry = expired_at 
      ? new Date(expired_at)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { data: newSession, error } = await supabase
      .from("session")
      .insert({
        id_user,
        session_data: session_data || {},
        status: "Login",
        expired_at: expiry.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Session registered successfully.",
      data: newSession
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// 3. PUT: Update status of session (Logout trigger)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id." },
        { status: 400 }
      );
    }

    const nextStatus = status === "Logout" ? "Logout" : "Login";

    const { data: updatedSession, error } = await supabase
      .from("session")
      .update({ status: nextStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Session status updated successfully.",
      data: updatedSession
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
