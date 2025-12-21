// About page logic: roadmap + investor-ready copy + contact modal
(function(){
  const roadmap = [
    { quarter: "2025 Q1", key: "aboutRoadmapQ1" },
    { quarter: "2025 Q2", key: "aboutRoadmapQ2" },
    { quarter: "2025 Q3", key: "aboutRoadmapQ3" },
    { quarter: "2025 Q4", key: "aboutRoadmapQ4" }
  ];

  const listBindings = [
    { id: "introBullets", key: "aboutIntroBullets", asPills: false },
    { id: "problemList", key: "aboutProblemPoints", asPills: false },
    { id: "solutionList", key: "aboutSolutionPoints", asPills: false },
    { id: "diffList", key: "aboutDifferPoints", asPills: false },
    { id: "monetList", key: "aboutMonetPoints", asPills: false },
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

    const roadmapList = $("#roadmapList");
    if (roadmapList){
      roadmapList.innerHTML = roadmap.map(item => `
        <div class="timeline__item">
          <div class="timeline__date">${item.quarter}</div>
          <div class="timeline__title">${window.GF_I18N.t(item.key)}</div>
          <div class="timeline__desc">${window.GF_I18N.t("aboutRoadmapHint")}</div>
          <div class="timeline__badge">${window.GF_I18N.t("aboutRoadmapBadge")}</div>
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

  document.addEventListener("DOMContentLoaded", () => {
    window.GF_SHELL.initShell("about");
    renderLists();
    bindContactForm();
    window.GF_I18N.apply(document);
    document.addEventListener("gf:lang", () => { renderLists(); window.GF_I18N.apply(document); });
  });
})();
