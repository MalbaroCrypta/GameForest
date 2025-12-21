(function(){
  const config = window.GF_SUPABASE_CONFIG || {
    url: "https://YOUR_SUPABASE_PROJECT.supabase.co",
    anonKey: "YOUR_PUBLIC_ANON_KEY"
  };

  const isConfigured = !!(config.url && config.anonKey && !config.url.includes("YOUR_") && !config.anonKey.includes("YOUR_"));
  const client = isConfigured ? window.supabase?.createClient(config.url, config.anonKey, { auth: { autoRefreshToken: true, persistSession: true } }) : null;
  let session = null;
  let profile = null;
  let ready = false;

  function emit(){
    document.dispatchEvent(new CustomEvent("gf:auth", { detail: { session, profile } }));
  }

  async function fetchProfile(user){
    if (!client || !user) return null;
    const { data, error } = await client.from("profiles").select().eq("id", user.id).single();
    if (error && error.code !== "PGRST116") throw error;
    if (!data){
      const baseProfile = { id: user.id, email: user.email, avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null, bio: "" };
      const { data: inserted, error: insertError } = await client.from("profiles").upsert(baseProfile).select().single();
      if (insertError) throw insertError;
      return inserted;
    }
    return data;
  }

  async function init(){
    if (!client){ ready = true; emit(); return; }
    const { data } = await client.auth.getSession();
    session = data?.session || null;
    profile = session ? await fetchProfile(session.user) : null;
    ready = true;
    emit();
    client.auth.onAuthStateChange(async (_event, newSession) => {
      session = newSession;
      profile = newSession?.user ? await fetchProfile(newSession.user) : null;
      emit();
    });
  }

  async function signUp(email, password){
    if (!client) throw new Error("Supabase не сконфігуровано.");
    const { error, data } = await client.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user){
      profile = await fetchProfile(data.user);
      emit();
    }
    return data;
  }

  async function signIn(email, password){
    if (!client) throw new Error("Supabase не сконфігуровано.");
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const user = data.user || data.session?.user;
    profile = await fetchProfile(user);
    emit();
    return data;
  }

  async function signInWithGoogle(){
    if (!client) throw new Error("Supabase не сконфігуровано.");
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href }
    });
    if (error) throw error;
  }

  async function signOut(){
    if (!client) return;
    await client.auth.signOut();
    session = null;
    profile = null;
    emit();
  }

  async function updateProfile({ bio, avatarFile }){
    if (!client || !session?.user) throw new Error("Немає активного користувача.");
    let avatarUrl = profile?.avatar_url || null;
    if (avatarFile){
      const ext = avatarFile.name?.split(".").pop() || "png";
      const path = `${session.user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await client.storage.from("avatars").upload(path, avatarFile, { upsert: true, contentType: avatarFile.type || "image/png" });
      if (uploadError) throw uploadError;
      const { data } = client.storage.from("avatars").getPublicUrl(path);
      avatarUrl = data?.publicUrl || avatarUrl;
    }
    const payload = { id: session.user.id, email: session.user.email, bio: bio ?? profile?.bio ?? "", avatar_url: avatarUrl };
    const { data, error } = await client.from("profiles").upsert(payload).select().single();
    if (error) throw error;
    profile = data;
    emit();
    return data;
  }

  window.GF_AUTH = {
    init,
    isReady: () => ready,
    isConfigured,
    client,
    getSession: () => session,
    getProfile: () => profile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile
  };

  document.addEventListener("DOMContentLoaded", init);
})();
