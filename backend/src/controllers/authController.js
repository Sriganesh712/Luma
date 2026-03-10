import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses all RLS policies
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function register(req, res) {
  const { email, password, name, role, institutionCode, institutionName } = req.body;

  try {
    // ── 1. Resolve institution ───────────────────────────────────────────────
    let institutionId;

    if (role === "admin") {
      const code = generateCode();
      const { data, error } = await supabaseAdmin
        .from("institutions")
        .insert({ name: institutionName, code })
        .select("id")
        .single();
      if (error) throw new Error(`Could not create institution: ${error.message}`);
      institutionId = data.id;
    } else {
      const { data, error } = await supabaseAdmin
        .from("institutions")
        .select("id")
        .eq("code", institutionCode.toUpperCase())
        .single();
      if (error || !data)
        return res.status(400).json({ error: "Invalid institution code. Please check with your admin." });
      institutionId = data.id;
    }

    // ── 2. Create Supabase Auth user (auto-confirmed) ────────────────────────
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) throw new Error(authError.message);

    // ── 3. Insert public.users profile ───────────────────────────────────────
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      institution_id: institutionId,
      name,
      email,
      role,
    });
    if (profileError) {
      // Roll back auth user to avoid orphaned accounts
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id).catch(() => {});
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    res.status(201).json({ message: "Account created. You can now sign in." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
