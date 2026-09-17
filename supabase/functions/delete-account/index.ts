import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization");

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authHeader) {
    return new Response(JSON.stringify({ error: "Account deletion is unavailable." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Authentication required." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userId = user.id;

  const deleteByUserId = [
    "conversation_members",
    "issues",
    "patient_inventories",
    "scanner_checks",
    "search_events",
    "user_favorite_devices",
    "user_recent_devices",
    "user_scanner_profiles",
  ];

  for (const table of deleteByUserId) {
    const { error } = await admin.from(table).delete().eq("user_id", userId);
    if (error) {
      console.error(`delete-account: failed deleting ${table}`, error);
      return new Response(JSON.stringify({ error: "Unable to delete all account data. No account deletion was completed." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const { error: conversationError } = await admin.from("conversations").delete().eq("created_by", userId);
  if (conversationError) {
    console.error("delete-account: failed deleting conversations", conversationError);
    return new Response(JSON.stringify({ error: "Unable to delete all account data. No account deletion was completed." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Preserve operational audit records while removing the direct account identifier.
  const { error: auditError } = await admin.from("audit_logs").update({ user_id: null }).eq("user_id", userId);
  if (auditError) {
    console.error("delete-account: failed de-identifying audit log", auditError);
    return new Response(JSON.stringify({ error: "Unable to complete account deletion." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
  if (deleteUserError) {
    console.error("delete-account: failed deleting auth user", deleteUserError);
    return new Response(JSON.stringify({ error: "Unable to delete the account." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ deleted: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
