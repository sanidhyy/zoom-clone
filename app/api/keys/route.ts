import { auth, currentUser } from "@clerk/nextjs/server";
import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

// Generate API key from user ID
function generateApiKey(userId: string): string {
  const random = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(`${userId}-${random}-${Date.now()}`)
    .digest("hex");
  return `eb_${hash.substring(0, 32)}`;
}

// GET - Retrieve user's API key
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("api_keys")
      .select("api_key, created_at, last_used_at, is_active")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Failed to fetch API key" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({
      exists: true,
      apiKey: data.api_key,
      createdAt: data.created_at,
      lastUsedAt: data.last_used_at,
      isActive: data.is_active,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Generate new API key
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = generateApiKey(userId);
    const userName = user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user?.emailAddresses?.[0]?.emailAddress || "User";

    // Upsert API key
    const { data, error } = await supabase
      .from("api_keys")
      .upsert(
        {
          user_id: userId,
          api_key: apiKey,
          name: userName,
          created_at: new Date().toISOString(),
          is_active: true,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to generate API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      apiKey: data.api_key,
      createdAt: data.created_at,
      message: "API key generated successfully",
    });
  } catch (err) {
    console.error("API key generation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
