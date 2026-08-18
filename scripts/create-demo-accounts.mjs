import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const password = "PikoDemo123!";
const demoAccounts = [
  { email: "admin@pikopicks.test", fullName: "Piko Admin", role: "admin" },
  { email: "customer@pikopicks.test", fullName: "Piko Customer", role: "customer" },
  { email: "owner@pikopicks.test", fullName: "Piko Shop Owner", role: "shop_owner" }
];

async function findUserByEmail(email) {
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < 1000) return null;
  }
}

for (const account of demoAccounts) {
  const existingUser = await findUserByEmail(account.email);
  let userId;

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName, role: account.role }
    });
    if (error) throw error;
    userId = data.user.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName, role: account.role }
    });
    if (error) throw error;
    userId = data.user.id;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: account.fullName,
    email: account.email,
    role: account.role,
    updated_at: new Date().toISOString()
  });
  if (profileError) throw profileError;

  console.log(`${existingUser ? "Updated" : "Created"}: ${account.email} (${account.role})`);
}

console.log("Demo accounts are ready.");
