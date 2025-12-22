// About page logic: roadmap + investor-ready copy + contact modal
(function(){
  const listBindings = [
    { id: "problemList", key: "aboutProblemPoints", asPills: false },
    { id: "solutionList", key: "aboutSolutionPoints", asPills: false },
    { id: "audienceList", key: "aboutAudiencePoints", asPills: false },
    { id: "monetList", key: "aboutMonetPoints", asPills: false },
    { id: "coreList", key: "aboutCorePoints", asPills: false },
  ];

  function $(s, r=document){ return r.querySelector(s); }

  function renderLists(){
    listBindings.forEach(({ id, key, asPills }) => {
      const el = $("#"+id);
      if (!el) return;
      const items = window.GF_I18N.t(key);
      if (!Array.isArray(items)) return;
      el.innerHTML = items.map(item => asPills ? `<span class="pill">${item}</span>` : `<li>${item}</li>`).join("");
    });
  }

  function renderRoadmap(){
    const roadmapList = $("#roadmapList");
    if (roadmapList){
      const items = window.GF_I18N.t("aboutRoadmapItems");
      if (!Array.isArray(items)) return;
      const badge = window.GF_I18N.t("aboutRoadmapBadge");
      roadmapList.innerHTML = items.map(item => `
        <div class="timeline__item">
          <div class="timeline__date">${item.quarter || ""}</div>
          <div class="timeline__title">${item.title || ""}</div>
          <div class="timeline__desc">${item.desc || ""}</div>
          <div class="timeline__badge">${item.badge || badge}</div>
        </div>`).join("");
    }
  }

  function bindContactForm(){
    const modal = $("#contactModal");
    const status = $("#cStatus");
    const setStatus = (msg) => { if (status) status.textContent = msg; };
    const open = () => modal && modal.classList.remove("hidden");
    const close = () => modal && modal.classList.add("hidden");
    document.querySelectorAll('[data-contact="open"]').forEach(btn => btn.addEventListener("click", open));
    modal?.addEventListener("click", (e) => {
      if (e.target.classList?.contains("modal__backdrop") || e.target.dataset.close === "1") close();
    });
    $("#cSubmit")?.addEventListener("click", () => {
      const payload = {
        name: ($("#cName")?.value || "").trim(),
        email: ($("#cEmail")?.value || "").trim(),
        type: $("#cType")?.value || "",
        msg: ($("#cMsg")?.value || "").trim(),
        ts: new Date().toISOString()
      };
      localStorage.setItem("gf_contact_draft", JSON.stringify(payload));
      setStatus(window.GF_I18N.t("contactSaved"));
    });
    const draftRaw = localStorage.getItem("gf_contact_draft");
    if (draftRaw){
      try{
        const d = JSON.parse(draftRaw);
        if (d.name) $("#cName").value = d.name;
        if (d.email) $("#cEmail").value = d.email;
        if (d.type) $("#cType").value = d.type;
        if (d.msg) $("#cMsg").value = d.msg;
      }catch{}
    }
  }

  function bindDiscordCopy(){
    const handleCopy = () => {
      const nick = "d1m0s_l1m0s";
      navigator.clipboard?.writeText(nick).then(() => {
        window.GF_STORE?.toast?.("Copied");
      }).catch(() => {
        window.GF_STORE?.toast?.("Discord: " + nick);
      });
    };
    ["#discordCopy", "#discordCopySecondary"].forEach(sel => {
      const btn = $(sel);
      btn?.addEventListener("click", handleCopy);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.GF_SHELL.initShell("about");
    renderLists();
    renderRoadmap();
    bindContactForm();
    bindDiscordCopy();
    window.GF_I18N.apply(document);
    document.addEventListener("gf:lang", () => { renderLists(); renderRoadmap(); window.GF_I18N.apply(document); });
  });
})();
