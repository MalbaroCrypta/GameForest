(function(){
  const data = Array.isArray(window.GF_DATA) ? window.GF_DATA : [];
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const t = (k) => window.GF_I18N.t(k);
  const clamp = (n,a,b) => Math.max(a, Math.min(b, n));
  const safeNum = (v, def=0) => Number.isFinite(Number(v)) ? Number(v) : def;
  const fmtMoney = (n) => `$${Math.round(safeNum(n, 0))}`;

  const discountPct = (g) => {
    const sentiment = safeNum(g?.metrics?.sentiment, 70);
    const demand = safeNum(g?.metrics?.demandIndex, 70);
    const stability = safeNum(g?.metrics?.priceStability, 70);
    let base = 40 + (100 - stability) * 0.35 + (demand - 50) * 0.12 - (sentiment - 50) * 0.08;
    base = clamp(base, 10, 90);
    return Math.round(base);
  };
  const priceNow = (g) => {
    const base = safeNum(g?.basePriceUSD, 0);
    const disc = discountPct(g);
    return Math.max(0, Math.round(base * (1 - disc/100)));
  };
  const nameOf = (g) => g?.name?.[GF_I18N.lang] || g?.name?.en || g?.id || "—";
  const profileDom = {
    avatar: $("#profileAvatar"),
    preview: $("#profileAvatarPreview"),
    input: $("#profileAvatarInput"),
    save: $("#profileSave"),
    bio: $("#profileBio"),
    status: $("#profileStatus"),
    guard: $("#profileGuard"),
    heroAvatar: $("#heroAvatar"),
    email: $("#profileEmail"),
    username: $("#profileUsername"),
    avatarUrl: $("#profileAvatarUrl"),
    options: $$("#profileAvatarOptions [data-avatar-option]"),
    sessionStatus: $("#sessionStatus"),
    gate: $("#accountGate"),
    gateStatus: $("#accountGateStatus"),
    gateLogin: $("#gateLogin"),
    gateRegister: $("#gateRegister"),
    gateGoogle: $("#gateGoogle"),
    main: document.querySelector("main.layout")
  };
  let gatePrompted = false;

  function applyAvatar(el, url, fallback="GF"){
    if (!el) return;
    if (url){
      el.style.backgroundImage = `url(${url})`;
      el.classList.add("avatar--image");
      el.textContent = "";
    }else{
      el.style.backgroundImage = "";
      el.textContent = fallback;
      el.classList.remove("avatar--image");
    }
  }

  function renderStats(){
    const stats = window.GF_STORE?.stats?.get() || { viewed: [], compared: [], saved: [] };
    $("#statViewed").textContent = stats.viewed?.length || 0;
    $("#statSaved").textContent = stats.saved?.length || 0;
    $("#statCompared").textContent = stats.compared?.length || 0;
  }

  function renderHeroMeta(){
    const emailEl = $("#accountEmail");
    const primaryEmail = $("#accountPrimaryEmail");
    const wishCount = $("#wishCount");
    const cartCount = $("#cartCount");
    const compareCount = $("#compareCount");
    const session = window.GF_SHELL?.getSession?.();
    const profile = window.GF_SHELL?.getProfile?.();
    const sessionBadge = profileDom.sessionStatus;
    const emailText = session?.user?.email || "—";
    const wishLen = window.GF_STORE?.wishlist?.get()?.length || 0;
    const cartLen = window.GF_STORE?.cart?.get()?.length || 0;
    const ids = (() => { try{ return JSON.parse(localStorage.getItem("gf_compare_ids") || "[]"); }catch{return [];} })();
    if (emailEl) emailEl.textContent = emailText;
    if (primaryEmail) primaryEmail.textContent = emailText;
    if (wishCount) wishCount.textContent = wishLen;
    if (cartCount) cartCount.textContent = cartLen;
    if (compareCount){
      compareCount.textContent = ids.length;
    }
    $("#accountWish")?.textContent = wishLen;
    $("#accountCart")?.textContent = cartLen;
    $("#accountCompare")?.textContent = ids.length;
    if (sessionBadge){
      sessionBadge.textContent = session?.user ? t("sessionActive") : t("sessionOffline");
      sessionBadge.classList.toggle("pill--muted", !session?.user);
    }
    applyAvatar(profileDom.heroAvatar, profile?.avatar_url, (emailText || "GF").slice(0,2).toUpperCase());
  }

  function renderList(targetId, ids, emptyKey){
    const wrap = $("#"+targetId);
    if (!wrap) return;
    if (!ids?.length){
      wrap.innerHTML = `<div class="empty">${t(emptyKey)}</div>`;
      return;
    }
    const items = ids.map(id => data.find(g => g.id === id)).filter(Boolean);
    wrap.innerHTML = items.map(g => `
      <div class="listrow">
        <div class="listrow__cover"><img src="${g.coverUrl}" alt="${nameOf(g)}"></div>
        <div class="listrow__meta">
          <div class="listrow__title">${nameOf(g)}</div>
          <div class="muted">${g.genre || ""} · ${g.model || ""}</div>
        </div>
        <div class="listrow__price">
          <div class="price">${fmtMoney(priceNow(g))}</div>
          <div class="muted">-${discountPct(g)}%</div>
        </div>
        <div class="listrow__actions">
          <a class="chip chip--mini" href="game.html?id=${encodeURIComponent(g.id)}">${t("viewDetails")}</a>
          <button class="chip chip--mini" data-remove="${g.id}">${t("remove")}</button>
        </div>
      </div>`).join("");
    wrap.querySelectorAll("[data-remove]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-remove");
        if (targetId === "wishlistList") window.GF_STORE?.wishlist?.toggle(id);
        if (targetId === "cartList") window.GF_STORE?.cart?.toggle(id);
        refresh();
      });
    });
  }

  function applyAnchorFocus(){
    if (location.hash === "#wishlist") $("#wishlistSection")?.scrollIntoView({ behavior: "smooth" });
    if (location.hash === "#cart") $("#cartSection")?.scrollIntoView({ behavior: "smooth" });
  }

  function renderProfile(){
    const session = window.GF_SHELL?.getSession?.();
    const profile = window.GF_SHELL?.getProfile?.();
    const email = session?.user?.email;
    const fallback = (email || "GF").slice(0,2).toUpperCase();
    if (profileDom.guard) profileDom.guard.hidden = !!email;
    if (!email){
      applyAvatar(profileDom.avatar, null, "GF");
      applyAvatar(profileDom.preview, null, "GF");
      if (profileDom.status) profileDom.status.textContent = t("profileRequiresLogin");
      return;
    }
    applyAvatar(profileDom.avatar, profile?.avatar_url, fallback);
    if (profileDom.preview){
      applyAvatar(profileDom.preview, profile?.avatar_url, fallback);
    }
    if (profileDom.email) profileDom.email.value = email;
    if (profileDom.username) profileDom.username.value = profile?.username || (email?.split("@")?.[0] || "");
    if (profileDom.avatarUrl){
      profileDom.avatarUrl.value = profile?.avatar_url || "";
    }
    if (profileDom.bio) profileDom.bio.value = profile?.bio || "";
    if (profileDom.status) profileDom.status.textContent = "";
    syncAvatarOptions(profile?.avatar_url);
  }

  async function saveProfile(){
    const session = window.GF_SHELL?.getSession?.();
    if (!session){
      window.GF_SHELL?.openAuth?.("login");
      return;
    }
    if (!profileDom.bio || !profileDom.save || !profileDom.status) return;
    const bio = profileDom.bio.value || "";
    const file = profileDom.input?.files?.[0];
    const avatarUrl = (profileDom.avatarUrl?.value || "").trim();
    const username = (profileDom.username?.value || "").trim();
    profileDom.save.disabled = true;
    profileDom.status.textContent = t("profileSaving");
    try{
      await window.GF_AUTH.updateProfile({ bio, avatarFile: file, avatarUrl, username });
      profileDom.status.textContent = t("profileSaved");
      if (profileDom.input) profileDom.input.value = "";
      renderProfile();
    }catch(err){
      profileDom.status.textContent = err?.message || t("authUnknownError");
    }finally{
      profileDom.save.disabled = false;
    }
  }

  function refresh(){
    GF_I18N.apply(document);
    renderHeroMeta();
    renderStats();
    renderList("wishlistList", window.GF_STORE?.wishlist?.get() || [], "wishlistEmpty");
    renderList("cartList", window.GF_STORE?.cart?.get() || [], "cartEmpty");
    renderProfile();
  }

  function enforceGate(){
    const session = window.GF_SHELL?.getSession?.();
    const loggedIn = !!session?.user;
    if (profileDom.gateStatus){
      profileDom.gateStatus.textContent = window.GF_AUTH?.isConfigured ? t("supabaseConfigured") : t("supabaseNotConfigured");
    }
    if (loggedIn) gatePrompted = false;
    if (profileDom.gate) profileDom.gate.hidden = loggedIn;
    if (profileDom.main) profileDom.main.classList.toggle("is-locked", !loggedIn);
    if (profileDom.main){
      profileDom.main.querySelectorAll(".hero, .panel:not(.panel--gate)").forEach(section => {
        section.hidden = !loggedIn;
        if (!loggedIn){
          section.setAttribute("aria-hidden", "true");
        }else{
          section.removeAttribute("aria-hidden");
        }
      });
    }
    if (!loggedIn && window.GF_AUTH?.isReady?.() && !gatePrompted){
      window.GF_SHELL?.openAuth?.("login");
      gatePrompted = true;
    }
  }

  function syncAvatarOptions(current){
    profileDom.options?.forEach(btn => {
      const val = btn.getAttribute("data-avatar-option");
      btn.classList.toggle("is-active", !!current && current === val);
    });
  }

  function bindAvatarOptions(){
    profileDom.options?.forEach(btn => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-avatar-option") || "";
        if (profileDom.avatarUrl){
          profileDom.avatarUrl.value = val;
        }
        syncAvatarOptions(val);
        applyAvatar(profileDom.preview, val || null, "GF");
      });
    });
    profileDom.avatarUrl?.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      syncAvatarOptions(val);
      applyAvatar(profileDom.preview, val || null, "GF");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.GF_SHELL.initShell("account");
    profileDom.input?.addEventListener("change", () => {
      const file = profileDom.input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (profileDom.preview){
          profileDom.preview.style.backgroundImage = `url(${e.target.result})`;
          profileDom.preview.classList.add("avatar--image");
        }
      };
      reader.readAsDataURL(file);
    });
    profileDom.save?.addEventListener("click", saveProfile);
    profileDom.gateLogin?.addEventListener("click", () => window.GF_SHELL?.openAuth?.("login"));
    profileDom.gateRegister?.addEventListener("click", () => window.GF_SHELL?.openAuth?.("register"));
    profileDom.gateGoogle?.addEventListener("click", async () => {
      try{
        await window.GF_AUTH?.signInWithGoogle?.();
      }catch(err){
        if (profileDom.status) profileDom.status.textContent = err?.message || t("authUnknownError");
      }
    });
    bindAvatarOptions();
    refresh();
    applyAnchorFocus();
    enforceGate();
    document.addEventListener("gf:wishlist", refresh);
    document.addEventListener("gf:cart", refresh);
    document.addEventListener("gf:lang", refresh);
    document.addEventListener("gf:auth", () => { refresh(); enforceGate(); });
  });
})();
