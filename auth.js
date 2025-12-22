(function(){
  const config = window.GF_SUPABASE_CONFIG || {};
  const isConfigured = !!(config.url && config.anonKey);
  const client = isConfigured ? window.supabase?.createClient(config.url, config.anonKey, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  }) : null;
  let session = null;
  let profile = null;
  let ready = false;
  let hasExchanged = false;

  function emit(){
    document.dispatchEvent(new CustomEvent("gf:auth", { detail: { session, profile } }));
  }

  function sanitizeUsername(raw){
    if (!raw) return "";
    return raw.replace(/[^\w.-]/g, "").slice(0, 30);
  }

  async function fetchProfile(user){
    if (!client || !user) return null;
    const { data, error } = await client.from("profiles").select().eq("id", user.id).single();
    if (error && error.code !== "PGRST116") throw error;
    if (!data){
      const baseProfile = {
        id: user.id,
        email: user.email,
        username: sanitizeUsername(user.user_metadata?.user_name || user.email?.split("@")?.[0] || ""),
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        bio: ""
      };
      const { data: inserted, error: insertError } = await client.from("profiles").upsert(baseProfile).select().single();
      if (insertError) throw insertError;
      return inserted;
    }
    return data;
  }

  function clearUrlParams(){
    const url = new URL(window.location.href);
    let changed = false;
    ["code", "state"].forEach((p) => {
      if (url.searchParams.has(p)){ url.searchParams.delete(p); changed = true; }
    });
    if (url.hash.includes("code=") || url.hash.includes("access_token")){
      url.hash = "";
      changed = true;
    }
    if (changed) window.history.replaceState({}, document.title, url.toString());
  }

  async function handleOAuthRedirect(){
    if (!client) return;
    const search = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = search.get("code") || hash.get("code");
    const state = search.get("state") || hash.get("state");
    if (code && !hasExchanged){
      const { data, error } = await client.auth.exchangeCodeForSession({ code });
      if (error) throw error;
      session = data.session;
      profile = session?.user ? await fetchProfile(session.user) : null;
      hasExchanged = true;
      clearUrlParams();
    }else if (state && hash.get("access_token") && !hasExchanged){
      const token = hash.get("access_token");
      const refresh = hash.get("refresh_token");
      const expires_in = Number(hash.get("expires_in") || 0);
      const provider_token = hash.get("provider_token");
      const { data, error } = await client.auth.setSession({ access_token: token, refresh_token: refresh, expires_in, provider_token });
      if (error) throw error;
      session = data.session;
      profile = session?.user ? await fetchProfile(session.user) : null;
      hasExchanged = true;
      clearUrlParams();
    }
  }

  async function init(){
    if (!client){ ready = true; emit(); return; }
    try{
      await handleOAuthRedirect();
      const { data } = await client.auth.getSession();
      session = data?.session || session;
      profile = session?.user ? (profile || await fetchProfile(session.user)) : null;
      ready = true;
      emit();
    }catch(err){
      ready = true;
      emit();
      console.error("[GF_AUTH] init error", err);
    }
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
      options: { redirectTo: window.location.origin + window.location.pathname }
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

  async function updateProfile({ bio, avatarFile, avatarUrl, username }){
    if (!client || !session?.user) throw new Error("Немає активного користувача.");
    let finalAvatar = avatarUrl?.trim() || profile?.avatar_url || null;
    if (avatarFile){
      const ext = avatarFile.name?.split(".").pop() || "png";
      const path = `${session.user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await client.storage.from("avatars").upload(path, avatarFile, { upsert: true, contentType: avatarFile.type || "image/png" });
      if (uploadError) throw uploadError;
      const { data } = client.storage.from("avatars").getPublicUrl(path);
      finalAvatar = data?.publicUrl || finalAvatar;
    }
    const payload = {
      id: session.user.id,
      email: session.user.email,
      bio: bio ?? profile?.bio ?? "",
      avatar_url: finalAvatar,
      username: sanitizeUsername(username) || sanitizeUsername(session.user.email?.split("@")?.[0] || "")
    };
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
