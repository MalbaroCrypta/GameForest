// About page logic: investor toggle, timeline, FAQ lists, contact modal
(function(){
  const roadmap = [
    { dateVar: "MVP Demo", date: "2025-12", key: "aboutRoadmapMvp", stage: "now" },
    { dateVar: "Beta v1", date: "2026-Q1", key: "aboutRoadmapB1" },
    { dateVar: "Beta v2", date: "2026-Q2", key: "aboutRoadmapB2" },
    { dateVar: "Public launch", date: "2026-Q3", key: "aboutRoadmapLaunch" },
    { dateVar: "B2B API + партнери", date: "2026-Q4", key: "aboutRoadmapApi" },
    { dateVar: "Mobile app", date: "2027", key: "aboutRoadmapMobile" }
  ];

  const risks = [
    { k: "riskData", label: "Дані / API залежність" },
    { k: "riskLegal", label: "Легальність та ToS" },
    { k: "riskMonet", label: "Монетизація" },
    { k: "riskGrowth", label: "Залучення аудиторії" }
  ];

  function $(s, r=document){ return r.querySelector(s); }

  function renderLists(){
    const forWhom = $("#forWhomList");
    const roadmapList = $("#roadmapList");
    const riskList = $("#riskList");
    if (forWhom){
      const items = window.GF_I18N.t("aboutForWhomItems");
      if (Array.isArray(items)){
        forWhom.innerHTML = items.map(x => `<div class="pill">${x}</div>`).join("");
      }
    }
    if (roadmapList){
      roadmapList.innerHTML = roadmap.map(item => `
        <div class="timeline__item">
          <div class="timeline__date">${item.date}</div>
          <div class="timeline__title">${window.GF_I18N.t(item.key)}</div>
          <div class="timeline__desc">${window.GF_I18N.t("aboutRoadmapHint")}</div>
          <div class="timeline__badge">${item.dateVar}</div>
        </div>`).join("");
    }
    if (riskList){
      riskList.innerHTML = risks.map(r => `<li>${window.GF_I18N.t(r.k)}</li>`).join("");
    }
  }

  function bindInvestorToggle(){
    const btn = $("#investorToggle");
    if (!btn) return;
    const setState = (on) => {
      document.body.classList.toggle("investor-mode", on);
      btn.classList.toggle("is-on", on);
      localStorage.setItem("gf_investor_mode", on ? "1" : "0");
      const meta = $("#roadmapList");
      if (meta) meta.classList.toggle("pulse", on);
    };
    const saved = localStorage.getItem("gf_investor_mode") === "1";
    setState(saved);
    btn.addEventListener("click", () => setState(!btn.classList.contains("is-on")));
  }

  function bindContactForm(){
    const modal = $("#contactModal");
    const status = $("#cStatus");
    const setStatus = (msg) => { if (status) status.textContent = msg; };
    const open = () => modal && modal.classList.remove("hidden");
    const close = () => modal && modal.classList.add("hidden");
    $("#contactBtn")?.addEventListener("click", open);
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
    bindInvestorToggle();
    bindContactForm();
    window.GF_I18N.apply(document);
    document.addEventListener("gf:lang", () => { renderLists(); window.GF_I18N.apply(document); });
  });
})();
