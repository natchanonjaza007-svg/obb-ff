(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (items) => items[Math.floor(Math.random() * items.length)];
  const storageKey = "fast-muay-pixel-love-v1";

  const screens = $$(".screen");
  const state = {
    screen: "intro",
    love: 0,
    gallery: new Set(["intro"]),
    resultAction: null,
    resultHubAction: null,
    keys: Object.create(null)
  };

  const saved = loadSave();
  if (saved) {
    state.love = Number(saved.love) || 0;
    state.gallery = new Set(saved.gallery?.length ? saved.gallery : ["intro"]);
  }

  const ui = {
    loveBar: $("#love-bar-inner"),
    loveLabel: $("#love-bar-label"),
    chapter: $("#chapter-label"),
    sceneBanner: $("#scene-name-banner"),
    dialogueBox: $("#dialogue-box"),
    speaker: $("#dialogue-speaker"),
    dialogue: $("#dialogue-text"),
    choices: $("#dialogue-choices"),
    dialogueNext: $("#dialogue-next"),
    result: $("#result-overlay"),
    resultIcon: $("#result-icon"),
    resultTitle: $("#result-title"),
    resultMsg: $("#result-msg"),
    resultStars: $("#result-stars"),
    resultRetry: $("#btn-result-retry"),
    resultHub: $("#btn-result-hub")
  };

  const copy = {
    start: "▶ เริ่มเรื่องราว",
    minigame: "🎮 มินิเกม",
    gallery: "📖 แกลเลอรี",
    about: "💌 เกี่ยวกับ",
    back: "◀ กลับ",
    play: "เล่น!",
    retry: "เล่นอีกครั้ง",
    hub: "กลับหน้ามินิเกม",
    close: "ปิด"
  };

  const galleryItems = [
    {
      id: "intro",
      icon: "💗",
      title: "First Pixel",
      desc: "จุดเริ่มต้นของเกมเล็ก ๆ ที่ตั้งใจทำให้ Fast และ Muay อยู่ในโลกเดียวกัน"
    },
    {
      id: "firstRain",
      icon: "🌧️",
      title: "After Rain",
      desc: "วันที่ฝนหยุดตก และถนนพิกเซลสะท้อนแสงเหมือนกำลังรอให้ทั้งสองเดินไปด้วยกัน"
    },
    {
      id: "pixelFlower",
      icon: "🌸",
      title: "Pixel Flower",
      desc: "ดอกไม้สีชมพูที่ Fast เก็บไว้ให้ Muay เพราะบางความรู้สึกพูดด้วยสีได้ดีกว่าคำ"
    },
    {
      id: "starKey",
      icon: "⭐",
      title: "Star Key",
      desc: "พวงกุญแจรูปดาวเล็ก ๆ เหมือนสัญญาว่าจะไม่ปล่อยมือในคืนที่ฟ้ามืด"
    },
    {
      id: "honestWord",
      icon: "💬",
      title: "Honest Word",
      desc: "คำพูดเรียบง่ายที่ตรงจากใจ และทำให้หัวใจของ Muay ยิ้มก่อนริมฝีปาก"
    },
    {
      id: "cafe",
      icon: "☕",
      title: "Warm Cafe",
      desc: "แก้วโกโก้อุ่น ๆ บนโต๊ะเดียวกัน กับความเงียบที่ไม่อึดอัดเลยสักนิด"
    },
    {
      id: "park",
      icon: "🎀",
      title: "Ribbon Walk",
      desc: "ทางเดินในสวนที่ดูยาวขึ้น เพราะทั้งคู่ไม่อยากให้เวลานี้จบเร็วเกินไป"
    },
    {
      id: "heartcatch",
      icon: "💝",
      title: "Heart Catch",
      desc: "หัวใจที่ Muay รับไว้ได้ทัน ก่อนมันจะตกถึงพื้นและกลายเป็นความเขิน"
    },
    {
      id: "lovepuzzle",
      icon: "🧩",
      title: "Matched Memories",
      desc: "ความทรงจำที่จับคู่กันได้พอดี เหมือนบางคนที่เกิดมาเพื่อเข้ากัน"
    },
    {
      id: "starlove",
      icon: "🌙",
      title: "Star Promise",
      desc: "ดาวสิบดวงที่เชื่อมกันเป็นคำสัญญาเล็ก ๆ ใต้แสงจันทร์"
    },
    {
      id: "loveletter",
      icon: "💌",
      title: "Love Letter",
      desc: "จดหมายที่เติมคำครบแล้ว แต่ความรู้สึกยังล้นออกมานอกกระดาษ"
    },
    {
      id: "ending",
      icon: "🏆",
      title: "True Ending",
      desc: "ตอนจบที่ไม่ได้จบจริง ๆ เพราะเรื่องราวของ Fast และ Muay ยังเดินต่อในทุกวัน"
    }
  ];

  const storyNodes = [
    {
      sceneTitle: "Chapter 1 : ถนนหลังฝน",
      chapter: "Chapter 1",
      scene: "town",
      speaker: "ผู้เล่า",
      text: "หลังฝนหยุด เมืองพิกเซลเล็ก ๆ สว่างขึ้นทีละช่อง Fast ยืนรอ Muay อยู่ตรงแสงไฟสีชมพูที่กระพริบเบา ๆ",
      love: 5,
      unlock: "firstRain"
    },
    {
      speaker: "Fast",
      text: "Muay... วันนี้ท้องฟ้าดูสวยกว่าทุกวัน เหมือนมันตั้งใจเปิดฉากให้เราเลย"
    },
    {
      speaker: "Muay",
      text: "ถ้าอย่างนั้นอย่าเดินเร็วเกินนะ Fast เดี๋ยวหัวใจตามไม่ทัน"
    },
    {
      speaker: "Fast",
      text: "Fast หยิบของเล็ก ๆ จากกระเป๋า เขาซ่อนมันไว้ทั้งวันเพื่อรอจังหวะนี้",
      choices: [
        { text: "ยื่นดอกไม้พิกเซลสีชมพูให้ Muay", love: 14, unlock: "pixelFlower" },
        { text: "ให้พวงกุญแจรูปดาวเล็ก ๆ", love: 12, unlock: "starKey" },
        { text: "พูดตรง ๆ ว่าอยากดูแล Muay", love: 16, unlock: "honestWord" }
      ]
    },
    {
      sceneTitle: "Chapter 2 : คาเฟ่ไฟอุ่น",
      chapter: "Chapter 2",
      scene: "cafe",
      speaker: "ผู้เล่า",
      text: "ทั้งคู่หลบลมเย็นเข้ามาในคาเฟ่เล็ก ๆ กลิ่นโกโก้และเสียงเพลง 8-bit ทำให้โลกข้างนอกเงียบลง",
      love: 5,
      unlock: "cafe"
    },
    {
      speaker: "Muay",
      text: "Fast รู้ไหม เวลาอยู่ด้วยกัน เราไม่ต้องพยายามเป็นใครเลย มันสบายใจมาก"
    },
    {
      speaker: "Fast",
      text: "งั้นขอให้ฉันเป็นที่สบายใจของ Muay บ่อย ๆ ได้ไหม ไม่ต้องทุกวันก็ได้ แต่อยากเป็นคนที่เธอนึกถึง"
    },
    {
      speaker: "Muay",
      text: "บนโต๊ะมีแก้วโกโก้สองใบ Fast อยากทำอะไรให้ช่วงเวลานี้น่าจดจำขึ้นอีกนิด",
      choices: [
        { text: "วาดหัวใจบนไอน้ำที่กระจก", love: 13, unlock: "cafe" },
        { text: "แบ่งขนมชิ้นสุดท้ายให้ Muay", love: 15, unlock: "cafe" },
        { text: "ชวนถ่ายรูปคู่แบบพิกเซล", love: 12, unlock: "cafe" }
      ]
    },
    {
      sceneTitle: "Chapter 3 : สวนริบบิ้น",
      chapter: "Chapter 3",
      scene: "park",
      speaker: "ผู้เล่า",
      text: "เย็นนั้นสวนเต็มไปด้วยไฟดวงเล็ก ๆ ริบบิ้นสีชมพูผูกอยู่ตามทาง เหมือนมีใครเตรียมฉากไว้ให้หัวใจสองดวงได้พูดกัน",
      love: 6,
      unlock: "park"
    },
    {
      speaker: "Muay",
      text: "ถ้าวันหนึ่งเราเหนื่อยมาก ๆ Fast จะยังเดินช้า ๆ ไปด้วยกันไหม"
    },
    {
      speaker: "Fast",
      text: "เดินช้าก็ได้ หยุดพักก็ได้ ขอแค่ยังได้จับมือ Muay อยู่ตรงนี้"
    },
    {
      speaker: "Muay",
      text: "คำตอบของ Fast ทำให้แสงไฟรอบสวนสว่างขึ้น Muay มองเขาเหมือนกำลังเก็บประโยคนั้นไว้ในใจ",
      choices: [
        { text: "จับมือ Muay แล้วเดินผ่านอุโมงค์ไฟ", love: 18, unlock: "park" },
        { text: "ให้ Muay เลือกเพลงสำหรับเดินต่อ", love: 14, unlock: "park" },
        { text: "หยุดมองท้องฟ้าด้วยกันเงียบ ๆ", love: 16, unlock: "park" }
      ]
    },
    {
      sceneTitle: "Chapter 4 : ดาดฟ้าดาวตก",
      chapter: "Chapter 4",
      scene: "rooftop",
      speaker: "ผู้เล่า",
      text: "คืนสุดท้ายของเกม ทั้งสองขึ้นมาบนดาดฟ้า เมืองด้านล่างเล็กลง แต่ความรู้สึกในใจกลับใหญ่ขึ้นเรื่อย ๆ",
      love: 7
    },
    {
      speaker: "Fast",
      text: "Muay ถ้าโลกนี้เป็นเกม ฉันอยากกด continue กับเธอไปทุกด่าน"
    },
    {
      speaker: "Muay",
      text: "งั้นอย่าแพ้ง่าย ๆ นะ เพราะเรายังมีฉากสวย ๆ ให้ไปด้วยกันอีกเยอะ"
    },
    {
      speaker: "Fast",
      text: "Fast สูดหายใจลึก เขารวบรวมทุกความตั้งใจไว้ในประโยคเดียว",
      choices: [
        { text: "บอกว่า Muay คือบ้านของหัวใจ", love: 20, unlock: "ending" },
        { text: "สัญญาว่าจะดูแลรอยยิ้มนี้", love: 18, unlock: "ending" },
        { text: "ขอบคุณที่ทำให้ทุกวันมีความหมาย", love: 17, unlock: "ending" }
      ]
    },
    {
      speaker: "ผู้เล่า",
      text: "แสงดาวแตกเป็นพิกเซลสีทอง รอบตัวทั้งคู่เต็มไปด้วยหัวใจเล็ก ๆ เกมรักของ Fast และ Muay ถึงฉากสำคัญที่สุดแล้ว"
    },
    { ending: true }
  ];

  const story = {
    index: 0,
    scene: "town",
    chapter: "Chapter 1",
    typing: false,
    fullText: "",
    timer: 0,
    raf: 0,
    lastTime: 0
  };

  const storyCanvas = $("#story-canvas");
  const storyCtx = storyCanvas?.getContext("2d");

  const heartCatch = {
    canvas: $("#heartcatch-canvas"),
    ctx: $("#heartcatch-canvas")?.getContext("2d"),
    raf: 0,
    running: false,
    lastTime: 0,
    score: 0,
    timeLeft: 30,
    playerX: 0,
    items: [],
    spawn: 0
  };

  const starLove = {
    canvas: $("#starlove-canvas"),
    ctx: $("#starlove-canvas")?.getContext("2d"),
    raf: 0,
    running: false,
    current: 0,
    stars: [],
    lastTime: 0
  };

  const lovePuzzle = {
    timer: 60,
    interval: 0,
    locked: false,
    first: null,
    second: null,
    matched: 0
  };

  const loveLetter = {
    score: 0,
    blanks: []
  };

  const ending = {
    canvas: $("#ending-canvas"),
    ctx: $("#ending-canvas")?.getContext("2d"),
    raf: 0,
    sparks: []
  };

  document.addEventListener("DOMContentLoaded", init);
  if (document.readyState !== "loading") init();

  function init() {
    updateLabels();
    installSpriteDetails();
    bindNavigation();
    bindGames();
    buildStars();
    startParticles();
    updateLoveBar();
    renderGallery();
    showScreen("intro");
    resizeAllCanvases();
  }

  function updateLabels() {
    setText("#btn-start", copy.start);
    setText("#btn-minigame", copy.minigame);
    setText("#btn-gallery", copy.gallery);
    setText("#btn-about", copy.about);
    setText("#btn-minigame-back", copy.back);
    setText("#btn-gallery-back", copy.back);
    setText("#btn-about-back", copy.back);
    setText("#btn-hc-start", "เริ่มเลย!");
    setText("#btn-lp-start", "เริ่มเลย!");
    setText("#btn-sl-start", "เริ่มเลย!");
    setText("#btn-ll-start", "เริ่มเลย!");
    $$(".btn-play").forEach((button) => {
      button.textContent = copy.play;
    });
  }

  function setText(selector, text) {
    const node = $(selector);
    if (node) node.textContent = text;
  }

  function installSpriteDetails() {
    $$(".char-fast-intro, .fast-about").forEach((node) => {
      if (!$(".fast-face", node)) node.appendChild(makeDiv("fast-face"));
    });
    $$(".char-muay-intro, .muay-about").forEach((node) => {
      if (!$(".muay-flower", node)) node.appendChild(makeDiv("muay-flower"));
      if (!$(".muay-face", node)) node.appendChild(makeDiv("muay-face"));
    });
  }

  function makeDiv(className) {
    const node = document.createElement("div");
    node.className = className;
    return node;
  }

  function bindNavigation() {
    $("#btn-start")?.addEventListener("click", startStory);
    $("#btn-minigame")?.addEventListener("click", () => showScreen("minigame"));
    $("#btn-gallery")?.addEventListener("click", () => {
      renderGallery();
      showScreen("gallery");
    });
    $("#btn-about")?.addEventListener("click", () => showScreen("about"));

    $("#btn-story-back")?.addEventListener("click", () => showScreen("intro"));
    $("#btn-minigame-back")?.addEventListener("click", () => showScreen("intro"));
    $("#btn-gallery-back")?.addEventListener("click", () => showScreen("intro"));
    $("#btn-about-back")?.addEventListener("click", () => showScreen("intro"));

    ui.dialogueBox?.addEventListener("click", () => {
      if (ui.choices && !ui.choices.classList.contains("hidden")) return;
      if (story.typing) {
        finishTyping();
      } else {
        nextStoryNode();
      }
    });

    ui.resultRetry?.addEventListener("click", () => {
      hideResult();
      state.resultAction?.();
    });
    ui.resultHub?.addEventListener("click", () => {
      hideResult();
      (state.resultHubAction || (() => showScreen("minigame")))();
    });

    window.addEventListener("resize", resizeAllCanvases);
    window.addEventListener("keydown", (event) => {
      state.keys[event.key.toLowerCase()] = true;
      if (["arrowleft", "arrowright", " "].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    });
    window.addEventListener("keyup", (event) => {
      state.keys[event.key.toLowerCase()] = false;
    });
  }

  function bindGames() {
    $$(".btn-play").forEach((button) => {
      button.addEventListener("click", () => startMinigame(button.dataset.game));
    });

    $("#btn-hc-back")?.addEventListener("click", () => {
      stopHeartCatch();
      showScreen("minigame");
    });
    $("#btn-lp-back")?.addEventListener("click", () => {
      stopLovePuzzle();
      showScreen("minigame");
    });
    $("#btn-sl-back")?.addEventListener("click", () => {
      stopStarLove();
      showScreen("minigame");
    });
    $("#btn-ll-back")?.addEventListener("click", () => showScreen("minigame"));

    $("#btn-hc-start")?.addEventListener("click", startHeartCatch);
    $("#btn-lp-start")?.addEventListener("click", startLovePuzzle);
    $("#btn-sl-start")?.addEventListener("click", startStarLove);
    $("#btn-ll-start")?.addEventListener("click", startLoveLetter);

    heartCatch.canvas?.addEventListener("pointermove", (event) => {
      const rect = heartCatch.canvas.getBoundingClientRect();
      heartCatch.playerX = (event.clientX - rect.left) * (heartCatch.canvas.width / rect.width);
    });
    heartCatch.canvas?.addEventListener("pointerdown", (event) => {
      heartCatch.canvas.setPointerCapture?.(event.pointerId);
    });

    starLove.canvas?.addEventListener("pointerdown", handleStarClick);
  }

  function showScreen(name) {
    state.screen = name;
    screens.forEach((screen) => screen.classList.toggle("active", screen.id === `screen-${name}`));
    if (name !== "heartcatch") stopHeartCatch(false);
    if (name !== "lovepuzzle") stopLovePuzzle(false);
    if (name !== "starlove") stopStarLove(false);
    if (name === "story") startStoryCanvas();
    if (name === "gallery") renderGallery();
    if (name === "ending") startEndingCanvas();
    resizeAllCanvases();
  }

  function addLove(points) {
    state.love = clamp(state.love + points, 0, 100);
    updateLoveBar();
    persist();
  }

  function updateLoveBar() {
    if (ui.loveBar) ui.loveBar.style.width = `${state.love}%`;
    if (ui.loveLabel) ui.loveLabel.textContent = `${state.love}%`;
  }

  function unlockGallery(id) {
    if (!id || state.gallery.has(id)) return;
    state.gallery.add(id);
    persist();
    toast("ปลดล็อกความทรงจำใหม่");
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        love: state.love,
        gallery: Array.from(state.gallery)
      }));
    } catch {
      // Local storage can be blocked in some browser modes; the game still works.
    }
  }

  function loadSave() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch {
      return null;
    }
  }

  function startStory() {
    state.love = 0;
    story.index = 0;
    story.scene = "town";
    story.chapter = "Chapter 1";
    updateLoveBar();
    showScreen("story");
    ui.dialogueBox?.classList.remove("hidden");
    renderStoryNode();
  }

  function renderStoryNode() {
    const node = storyNodes[story.index];
    if (!node) {
      showEnding();
      return;
    }
    if (node.ending) {
      showEnding();
      return;
    }

    if (node.scene) story.scene = node.scene;
    if (node.chapter) story.chapter = node.chapter;
    if (ui.chapter) ui.chapter.textContent = story.chapter;
    if (node.sceneTitle) showSceneBanner(node.sceneTitle);
    if (node.love) addLove(node.love);
    if (node.unlock) unlockGallery(node.unlock);

    ui.speaker.textContent = node.speaker || "";
    ui.choices.innerHTML = "";
    ui.choices.classList.add("hidden");
    ui.dialogueNext.classList.add("hidden");
    typeDialogue(node.text || "", () => {
      if (node.choices) {
        renderChoices(node.choices);
      } else {
        ui.dialogueNext.classList.remove("hidden");
      }
    });
  }

  function typeDialogue(text, onDone) {
    window.clearInterval(story.timer);
    story.typing = true;
    story.fullText = text;
    ui.dialogue.textContent = "";
    const chars = Array.from(text);
    let index = 0;
    story.timer = window.setInterval(() => {
      ui.dialogue.textContent += chars[index] || "";
      index += 1;
      if (index >= chars.length) {
        window.clearInterval(story.timer);
        story.typing = false;
        onDone?.();
      }
    }, 22);
  }

  function finishTyping() {
    window.clearInterval(story.timer);
    story.typing = false;
    ui.dialogue.textContent = story.fullText;
    const node = storyNodes[story.index];
    if (node?.choices) {
      renderChoices(node.choices);
    } else {
      ui.dialogueNext.classList.remove("hidden");
    }
  }

  function renderChoices(choices) {
    ui.choices.innerHTML = "";
    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.className = "choice-btn";
      button.type = "button";
      button.textContent = choice.text;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        addLove(choice.love || 0);
        unlockGallery(choice.unlock);
        createHeartBurst(window.innerWidth / 2, window.innerHeight * 0.72);
        nextStoryNode();
      });
      ui.choices.appendChild(button);
    });
    ui.choices.classList.remove("hidden");
  }

  function nextStoryNode() {
    story.index += 1;
    renderStoryNode();
  }

  function showSceneBanner(text) {
    if (!ui.sceneBanner) return;
    ui.sceneBanner.textContent = text;
    ui.sceneBanner.classList.remove("hidden");
    window.clearTimeout(showSceneBanner.timer);
    showSceneBanner.timer = window.setTimeout(() => {
      ui.sceneBanner.classList.add("hidden");
    }, 1500);
  }

  function startStoryCanvas() {
    if (story.raf || !storyCtx) return;
    story.lastTime = performance.now();
    const loop = (time) => {
      story.raf = 0;
      drawStoryCanvas(time);
      if (state.screen === "story") {
        story.raf = requestAnimationFrame(loop);
      }
    };
    story.raf = requestAnimationFrame(loop);
  }

  function drawStoryCanvas(time) {
    const canvas = storyCanvas;
    const ctx = storyCtx;
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const t = time / 1000;

    drawScene(ctx, w, h, story.scene, t);
    const ground = h * 0.77;
    const spacing = clamp(w * 0.18, 80, 170);
    drawFast(ctx, w / 2 - spacing, ground, 3.2, t, "right");
    drawMuay(ctx, w / 2 + spacing, ground, 3.2, t, "left");
    drawFloatingHearts(ctx, w, h, t);
  }

  function drawScene(ctx, w, h, scene, t) {
    ctx.clearRect(0, 0, w, h);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    const palettes = {
      town: ["#7dcde8", "#f8c7d6", "#4f9b71", "#2f6044"],
      cafe: ["#3b1d16", "#7d3c24", "#d38b4d", "#3a211b"],
      park: ["#7bcfe7", "#b9e58a", "#4b9b5f", "#23563a"],
      rooftop: ["#0b1238", "#32246d", "#d9855f", "#171b3f"],
      night: ["#07132f", "#15205d", "#25164b", "#050716"]
    };
    const p = palettes[scene] || palettes.town;
    sky.addColorStop(0, p[0]);
    sky.addColorStop(0.55, p[1]);
    sky.addColorStop(0.56, p[2]);
    sky.addColorStop(1, p[3]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#ffffff";
    for (let x = 0; x < w; x += 28) ctx.fillRect(x, 0, 2, h);
    for (let y = 0; y < h; y += 28) ctx.fillRect(0, y, w, 2);
    ctx.globalAlpha = 1;

    if (scene === "cafe") drawCafe(ctx, w, h);
    if (scene === "park") drawPark(ctx, w, h, t);
    if (scene === "rooftop") drawRooftop(ctx, w, h, t);
    if (scene === "town") drawTown(ctx, w, h, t);
  }

  function drawTown(ctx, w, h, t) {
    ctx.fillStyle = "rgba(255, 250, 210, 0.9)";
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.16, 24, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i += 1) {
      const bw = 42 + (i % 3) * 18;
      const bh = 60 + (i % 4) * 20;
      const x = i * (w / 8) - 12;
      const y = h * 0.56 - bh;
      ctx.fillStyle = i % 2 ? "#513a6d" : "#29516b";
      ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = "#ffd56b";
      for (let wy = y + 12; wy < y + bh - 8; wy += 18) {
        ctx.fillRect(x + 8, wy, 8, 8);
        ctx.fillRect(x + bw - 16, wy, 8, 8);
      }
    }
    drawPixelRoad(ctx, w, h);
    ctx.fillStyle = "#ff7aa6";
    for (let i = 0; i < 12; i += 1) {
      const x = (i * 91 + Math.sin(t + i) * 18) % w;
      ctx.fillRect(x, h * 0.63 + (i % 3) * 12, 8, 8);
    }
  }

  function drawCafe(ctx, w, h) {
    ctx.fillStyle = "#2a1510";
    ctx.fillRect(0, h * 0.58, w, h * 0.42);
    ctx.fillStyle = "#f7b267";
    ctx.fillRect(w * 0.15, h * 0.18, w * 0.7, h * 0.36);
    ctx.fillStyle = "#6f2c1f";
    ctx.fillRect(w * 0.18, h * 0.22, w * 0.64, h * 0.28);
    ctx.fillStyle = "#ffd166";
    for (let i = 0; i < 5; i += 1) {
      ctx.fillRect(w * 0.24 + i * w * 0.11, h * 0.28, 34, 34);
    }
    ctx.fillStyle = "#3a211b";
    ctx.fillRect(w * 0.38, h * 0.6, w * 0.24, 18);
    ctx.fillRect(w * 0.42, h * 0.62, 12, 52);
    ctx.fillRect(w * 0.56, h * 0.62, 12, 52);
    ctx.fillStyle = "#ffcad4";
    ctx.fillRect(w * 0.46, h * 0.56, 18, 14);
    ctx.fillRect(w * 0.53, h * 0.56, 18, 14);
  }

  function drawPark(ctx, w, h, t) {
    ctx.fillStyle = "#244f34";
    ctx.fillRect(0, h * 0.68, w, h * 0.32);
    for (let i = 0; i < 9; i += 1) {
      const x = i * (w / 8) - 24;
      ctx.fillStyle = "#5b3a1e";
      ctx.fillRect(x + 24, h * 0.43, 16, h * 0.24);
      ctx.fillStyle = i % 2 ? "#2e8a52" : "#3fb06b";
      ctx.fillRect(x, h * 0.33 + Math.sin(t + i) * 3, 64, 58);
      ctx.fillStyle = "#ff8ab3";
      ctx.fillRect(x + 18, h * 0.35, 8, 8);
      ctx.fillRect(x + 42, h * 0.41, 8, 8);
    }
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.72);
    ctx.quadraticCurveTo(w * 0.5, h * 0.58, w * 0.9, h * 0.72);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  function drawRooftop(ctx, w, h, t) {
    ctx.fillStyle = "#ffd166";
    for (let i = 0; i < 70; i += 1) {
      const x = (i * 73) % w;
      const y = (i * 41) % (h * 0.52);
      const twinkle = 1 + Math.sin(t * 2 + i) * 0.8;
      ctx.fillRect(x, y, twinkle + 1, twinkle + 1);
    }
    ctx.fillStyle = "#ffe8a3";
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.16, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#171b3f";
    ctx.fillRect(0, h * 0.66, w, h * 0.34);
    ctx.fillStyle = "#2d356f";
    ctx.fillRect(0, h * 0.62, w, 24);
    ctx.fillStyle = "#ff8ab3";
    for (let i = 0; i < 10; i += 1) ctx.fillRect(i * w / 10 + 20, h * 0.6, 8, 8);
  }

  function drawPixelRoad(ctx, w, h) {
    ctx.fillStyle = "#2c2c44";
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.58);
    ctx.lineTo(w * 0.65, h * 0.58);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f7d46b";
    for (let y = h * 0.65; y < h; y += 42) {
      const width = 22 + (y / h) * 45;
      ctx.fillRect(w / 2 - width / 2, y, width, 8);
    }
  }

  function drawFast(ctx, x, y, scale = 3, t = 0, facing = "right") {
    drawPixelPerson(ctx, x, y, scale, {
      skin: "#fcd5ce",
      hair: "#20232b",
      top: "#ffffff",
      jacket: "#1b5f8f",
      pants: "#20263a",
      blush: "#ff6b9d",
      flower: false,
      facing,
      bob: Math.sin(t * 3) * 2
    });
  }

  function drawMuay(ctx, x, y, scale = 3, t = 0, facing = "left") {
    drawPixelPerson(ctx, x, y, scale, {
      skin: "#ffe3e0",
      hair: "#4a2b25",
      top: "#ffb7c5",
      jacket: "#ff6b9d",
      pants: "#ffd1dc",
      blush: "#ff6b9d",
      flower: true,
      facing,
      bob: Math.sin(t * 3 + 1) * 2
    });
  }

  function drawPixelPerson(ctx, x, y, scale, c) {
    const s = scale;
    const left = x - 10 * s;
    const top = y - 42 * s + c.bob;
    ctx.save();
    if (c.facing === "left") {
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      x = 0;
    }
    const baseX = c.facing === "left" ? -10 * s : left;
    ctx.fillStyle = c.hair;
    ctx.fillRect(baseX + 3 * s, top, 15 * s, 9 * s);
    ctx.fillRect(baseX, top + 7 * s, 5 * s, 16 * s);
    ctx.fillStyle = c.skin;
    ctx.fillRect(baseX + 4 * s, top + 7 * s, 14 * s, 14 * s);
    ctx.fillStyle = "#221c23";
    ctx.fillRect(baseX + 7 * s, top + 12 * s, 2 * s, 2 * s);
    ctx.fillRect(baseX + 14 * s, top + 12 * s, 2 * s, 2 * s);
    ctx.fillStyle = c.blush;
    ctx.fillRect(baseX + 10 * s, top + 17 * s, 5 * s, 2 * s);
    ctx.fillStyle = c.jacket;
    ctx.fillRect(baseX + 3 * s, top + 23 * s, 16 * s, 18 * s);
    ctx.fillStyle = c.top;
    ctx.fillRect(baseX + 8 * s, top + 24 * s, 6 * s, 16 * s);
    ctx.fillStyle = c.skin;
    ctx.fillRect(baseX - 1 * s, top + 25 * s, 5 * s, 13 * s);
    ctx.fillRect(baseX + 18 * s, top + 25 * s, 5 * s, 13 * s);
    ctx.fillStyle = c.pants;
    ctx.fillRect(baseX + 5 * s, top + 41 * s, 5 * s, 13 * s);
    ctx.fillRect(baseX + 13 * s, top + 41 * s, 5 * s, 13 * s);
    ctx.fillStyle = "#111";
    ctx.fillRect(baseX + 4 * s, top + 54 * s, 7 * s, 3 * s);
    ctx.fillRect(baseX + 12 * s, top + 54 * s, 7 * s, 3 * s);
    if (c.flower) {
      ctx.fillStyle = "#ff5f9d";
      ctx.fillRect(baseX + 16 * s, top + 2 * s, 4 * s, 4 * s);
      ctx.fillStyle = "#fff9fb";
      ctx.fillRect(baseX + 17 * s, top + 3 * s, 2 * s, 2 * s);
    }
    ctx.restore();
  }

  function drawFloatingHearts(ctx, w, h, t) {
    ctx.fillStyle = "#ff6b9d";
    for (let i = 0; i < 8; i += 1) {
      const x = (w * 0.5 - 90) + i * 26 + Math.sin(t + i) * 5;
      const y = h * 0.35 + Math.sin(t * 1.6 + i) * 16;
      drawPixelHeart(ctx, x, y, 2 + (i % 2), i % 3 === 0 ? "#ffd166" : "#ff6b9d");
    }
  }

  function drawPixelHeart(ctx, x, y, scale, color) {
    const s = scale;
    ctx.fillStyle = color;
    const cells = [
      [1, 0], [2, 0], [4, 0], [5, 0],
      [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
      [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
      [1, 3], [2, 3], [3, 3], [4, 3], [5, 3],
      [2, 4], [3, 4], [4, 4],
      [3, 5]
    ];
    cells.forEach(([cx, cy]) => ctx.fillRect(x + cx * s, y + cy * s, s, s));
  }

  function startMinigame(game) {
    if (!game) return;
    showScreen(game);
    if (game === "heartcatch") resetHeartCatch();
    if (game === "lovepuzzle") resetLovePuzzle();
    if (game === "starlove") resetStarLove();
    if (game === "loveletter") resetLoveLetter();
  }

  function resetHeartCatch() {
    stopHeartCatch(false);
    $("#hc-overlay")?.classList.remove("hidden");
    setText("#hc-score", "0");
    setText("#hc-timer", "30");
    resizeCanvas(heartCatch.canvas);
    drawHeartCatchFrame(performance.now());
  }

  function startHeartCatch() {
    resizeCanvas(heartCatch.canvas);
    heartCatch.running = true;
    heartCatch.score = 0;
    heartCatch.timeLeft = 30;
    heartCatch.items = [];
    heartCatch.spawn = 0;
    heartCatch.playerX = heartCatch.canvas.width / 2;
    heartCatch.lastTime = performance.now();
    $("#hc-overlay")?.classList.add("hidden");
    setText("#hc-score", "0");
    setText("#hc-timer", "30");
    const loop = (time) => {
      heartCatch.raf = 0;
      updateHeartCatch(time);
      if (heartCatch.running && state.screen === "heartcatch") {
        heartCatch.raf = requestAnimationFrame(loop);
      }
    };
    heartCatch.raf = requestAnimationFrame(loop);
  }

  function updateHeartCatch(time) {
    const canvas = heartCatch.canvas;
    if (!canvas) return;
    const dt = Math.min(0.04, (time - heartCatch.lastTime) / 1000 || 0.016);
    heartCatch.lastTime = time;
    heartCatch.timeLeft -= dt;
    if (state.keys.arrowleft || state.keys.a) heartCatch.playerX -= 260 * dt;
    if (state.keys.arrowright || state.keys.d) heartCatch.playerX += 260 * dt;
    heartCatch.playerX = clamp(heartCatch.playerX, 35, canvas.width - 35);

    heartCatch.spawn -= dt;
    if (heartCatch.spawn <= 0) {
      heartCatch.spawn = rand(0.35, 0.72);
      const typeRoll = Math.random();
      heartCatch.items.push({
        x: rand(28, canvas.width - 28),
        y: -30,
        vy: rand(120, 210),
        size: rand(2.2, 3.5),
        type: typeRoll > 0.9 ? "gold" : typeRoll < 0.15 ? "dark" : "heart",
        phase: rand(0, Math.PI * 2)
      });
    }

    const playerY = canvas.height - 74;
    heartCatch.items.forEach((item) => {
      item.y += item.vy * dt;
      item.x += Math.sin(time / 240 + item.phase) * 0.9;
    });
    heartCatch.items = heartCatch.items.filter((item) => {
      const hit = Math.abs(item.x - heartCatch.playerX) < 46 && Math.abs(item.y - playerY) < 48;
      if (hit) {
        if (item.type === "dark") {
          heartCatch.score = Math.max(0, heartCatch.score - 2);
          shakeActiveScreen();
        } else {
          heartCatch.score += item.type === "gold" ? 5 : 1;
          createHeartBurst(item.x, item.y);
        }
        setText("#hc-score", String(heartCatch.score));
        return false;
      }
      return item.y < canvas.height + 40;
    });

    setText("#hc-timer", String(Math.max(0, Math.ceil(heartCatch.timeLeft))));
    drawHeartCatchFrame(time);

    if (heartCatch.timeLeft <= 0) {
      finishHeartCatch();
    }
  }

  function drawHeartCatchFrame(time) {
    const ctx = heartCatch.ctx;
    const canvas = heartCatch.canvas;
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    drawScene(ctx, w, h, "park", time / 1000);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let x = 0; x < w; x += 32) ctx.fillRect(x, h - 28, 16, 4);
    heartCatch.items.forEach((item) => {
      const color = item.type === "gold" ? "#ffd166" : item.type === "dark" ? "#635985" : "#ff4d88";
      drawPixelHeart(ctx, item.x, item.y, item.size, color);
    });
    drawMuay(ctx, heartCatch.playerX, h - 18, 2.4, time / 1000, "right");
    ctx.fillStyle = "#ffcad4";
    ctx.fillRect(heartCatch.playerX - 44, h - 58, 88, 10);
    ctx.fillStyle = "#ff6b9d";
    ctx.fillRect(heartCatch.playerX - 38, h - 52, 76, 8);
  }

  function finishHeartCatch() {
    stopHeartCatch(false);
    const won = heartCatch.score >= 20;
    if (won) {
      unlockGallery("heartcatch");
      addLove(8);
    }
    showResult({
      icon: won ? "💝" : "💗",
      title: won ? "รับหัวใจได้เต็มอ้อมแขน!" : "หัวใจยังลอยอยู่ใกล้ ๆ",
      msg: won
        ? `Muay รับหัวใจได้ ${heartCatch.score} ดวง Fast ยิ้มจนไฟในสวนสว่างกว่าเดิม`
        : `รับได้ ${heartCatch.score} ดวง ลองอีกครั้งเพื่อเก็บความรักให้ครบกว่านี้`,
      stars: won ? 3 : 1,
      retryLabel: copy.retry,
      hubLabel: copy.hub,
      onRetry: startHeartCatch,
      onHub: () => showScreen("minigame")
    });
  }

  function stopHeartCatch(cancelFrame = true) {
    heartCatch.running = false;
    if (cancelFrame && heartCatch.raf) cancelAnimationFrame(heartCatch.raf);
    heartCatch.raf = 0;
  }

  function resetLovePuzzle() {
    stopLovePuzzle(false);
    $("#lp-overlay")?.classList.remove("hidden");
    setText("#lp-pairs", "0/8");
    setText("#lp-timer", "60");
    $("#puzzle-board").innerHTML = "";
  }

  function startLovePuzzle() {
    const board = $("#puzzle-board");
    if (!board) return;
    stopLovePuzzle(false);
    $("#lp-overlay")?.classList.add("hidden");
    lovePuzzle.timer = 60;
    lovePuzzle.locked = false;
    lovePuzzle.first = null;
    lovePuzzle.second = null;
    lovePuzzle.matched = 0;
    const icons = ["💗", "🌸", "⭐", "☕", "🌙", "🎀", "💌", "✨"];
    const cards = shuffle([...icons, ...icons]);
    board.innerHTML = "";
    cards.forEach((icon, index) => {
      const card = document.createElement("button");
      card.className = "puzzle-card";
      card.type = "button";
      card.dataset.icon = icon;
      card.dataset.index = String(index);
      card.innerHTML = `<span class="card-back">FM</span><span class="card-front">${icon}</span>`;
      card.addEventListener("click", () => flipPuzzleCard(card));
      board.appendChild(card);
    });
    setText("#lp-pairs", "0/8");
    setText("#lp-timer", "60");
    lovePuzzle.interval = window.setInterval(() => {
      lovePuzzle.timer -= 1;
      setText("#lp-timer", String(lovePuzzle.timer));
      if (lovePuzzle.timer <= 0) finishLovePuzzle(false);
    }, 1000);
  }

  function flipPuzzleCard(card) {
    if (lovePuzzle.locked || card.classList.contains("flipped") || card.classList.contains("matched")) return;
    card.classList.add("flipped");
    if (!lovePuzzle.first) {
      lovePuzzle.first = card;
      return;
    }
    lovePuzzle.second = card;
    lovePuzzle.locked = true;
    if (lovePuzzle.first.dataset.icon === lovePuzzle.second.dataset.icon) {
      lovePuzzle.first.classList.add("matched");
      lovePuzzle.second.classList.add("matched");
      createHeartBurst(window.innerWidth / 2, window.innerHeight / 2);
      lovePuzzle.matched += 1;
      setText("#lp-pairs", `${lovePuzzle.matched}/8`);
      lovePuzzle.first = null;
      lovePuzzle.second = null;
      lovePuzzle.locked = false;
      if (lovePuzzle.matched >= 8) finishLovePuzzle(true);
    } else {
      window.setTimeout(() => {
        lovePuzzle.first?.classList.remove("flipped");
        lovePuzzle.second?.classList.remove("flipped");
        lovePuzzle.first = null;
        lovePuzzle.second = null;
        lovePuzzle.locked = false;
      }, 650);
    }
  }

  function finishLovePuzzle(won) {
    stopLovePuzzle(false);
    if (won) {
      unlockGallery("lovepuzzle");
      addLove(8);
    }
    showResult({
      icon: won ? "🧩" : "💫",
      title: won ? "ความทรงจำเข้าคู่กันแล้ว" : "ยังมีความทรงจำรออยู่",
      msg: won
        ? "Fast และ Muay เปิดการ์ดครบทุกคู่ เหมือนหัวใจที่จำกันได้เสมอ"
        : "เวลาหมดก่อนจับคู่ครบ ลองอีกครั้งแล้วค่อย ๆ จำจังหวะของหัวใจ",
      stars: won ? 3 : 1,
      retryLabel: copy.retry,
      hubLabel: copy.hub,
      onRetry: startLovePuzzle,
      onHub: () => showScreen("minigame")
    });
  }

  function stopLovePuzzle(clearBoard = true) {
    window.clearInterval(lovePuzzle.interval);
    lovePuzzle.interval = 0;
    if (clearBoard) $("#puzzle-board") && ($("#puzzle-board").innerHTML = "");
  }

  function resetStarLove() {
    stopStarLove(false);
    $("#sl-overlay")?.classList.remove("hidden");
    setText("#sl-stars", "0/10");
    resizeCanvas(starLove.canvas);
    createStarMap();
    drawStarLoveFrame(performance.now());
  }

  function startStarLove() {
    resizeCanvas(starLove.canvas);
    createStarMap();
    starLove.running = true;
    starLove.current = 0;
    starLove.lastTime = performance.now();
    $("#sl-overlay")?.classList.add("hidden");
    setText("#sl-stars", "0/10");
    const loop = (time) => {
      starLove.raf = 0;
      drawStarLoveFrame(time);
      if (starLove.running && state.screen === "starlove") {
        starLove.raf = requestAnimationFrame(loop);
      }
    };
    starLove.raf = requestAnimationFrame(loop);
  }

  function createStarMap() {
    const w = starLove.canvas?.width || 800;
    const h = starLove.canvas?.height || 500;
    const coords = [
      [0.18, 0.34], [0.29, 0.22], [0.43, 0.32], [0.54, 0.18], [0.68, 0.3],
      [0.78, 0.44], [0.62, 0.55], [0.5, 0.45], [0.37, 0.58], [0.24, 0.5]
    ];
    starLove.stars = coords.map(([x, y], index) => ({ x: x * w, y: y * h, index }));
  }

  function handleStarClick(event) {
    if (!starLove.running) return;
    const canvas = starLove.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    const next = starLove.stars[starLove.current];
    const distance = Math.hypot(x - next.x, y - next.y);
    if (distance < 34) {
      starLove.current += 1;
      setText("#sl-stars", `${starLove.current}/10`);
      createHeartBurst(event.clientX, event.clientY);
      if (starLove.current >= starLove.stars.length) finishStarLove(true);
    } else {
      shakeActiveScreen();
    }
  }

  function drawStarLoveFrame(time) {
    const ctx = starLove.ctx;
    const canvas = starLove.canvas;
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    drawRooftop(ctx, w, h, time / 1000);
    ctx.strokeStyle = "rgba(255, 209, 102, 0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    starLove.stars.slice(0, starLove.current).forEach((star, index) => {
      if (index === 0) ctx.moveTo(star.x, star.y);
      else ctx.lineTo(star.x, star.y);
    });
    ctx.stroke();
    starLove.stars.forEach((star, index) => {
      const active = index === starLove.current;
      const done = index < starLove.current;
      ctx.fillStyle = done ? "#ffd166" : active ? "#ff8ab3" : "rgba(255,255,255,0.75)";
      const size = active ? 7 + Math.sin(time / 150) * 2 : 5;
      ctx.fillRect(star.x - size, star.y - size, size * 2, size * 2);
      ctx.fillStyle = "#101629";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(index + 1), star.x, star.y + 5);
    });
    drawFast(ctx, w * 0.38, h - 18, 2.5, time / 1000, "right");
    drawMuay(ctx, w * 0.62, h - 18, 2.5, time / 1000, "left");
  }

  function finishStarLove(won) {
    stopStarLove(false);
    if (won) {
      unlockGallery("starlove");
      addLove(8);
    }
    showResult({
      icon: "🌙",
      title: "คำสัญญาสว่างครบสิบดวง",
      msg: "Fast และ Muay เชื่อมดาวครบทั้งฟ้า แสงนั้นกลายเป็นทางกลับมาหากันเสมอ",
      stars: 3,
      retryLabel: copy.retry,
      hubLabel: copy.hub,
      onRetry: startStarLove,
      onHub: () => showScreen("minigame")
    });
  }

  function stopStarLove(cancelFrame = true) {
    starLove.running = false;
    if (cancelFrame && starLove.raf) cancelAnimationFrame(starLove.raf);
    starLove.raf = 0;
  }

  function resetLoveLetter() {
    $("#ll-overlay")?.classList.remove("hidden");
    setText("#ll-score", "0");
    $("#letter-text-area").innerHTML = "";
    $("#letter-word-bank").innerHTML = "";
    $("#letter-progress-bar").style.width = "0%";
  }

  function startLoveLetter() {
    $("#ll-overlay")?.classList.add("hidden");
    loveLetter.score = 0;
    const textArea = $("#letter-text-area");
    const bank = $("#letter-word-bank");
    const answers = ["รอยยิ้ม", "หัวใจ", "อยู่ข้างกัน", "ขอบคุณ", "ตลอดไป"];
    loveLetter.blanks = [];
    textArea.innerHTML = `
      ถึง Muay,<br>
      ตั้งแต่วันที่ได้เจอเธอ โลกของ Fast ก็เต็มไปด้วย
      <span class="letter-blank" data-answer="${answers[0]}"></span>
      และทุกครั้งที่ได้คุยกัน ฉันรู้สึกว่า
      <span class="letter-blank" data-answer="${answers[1]}"></span>
      ของฉันกลับบ้านถูกทางเสมอ<br>
      ฉันอยาก
      <span class="letter-blank" data-answer="${answers[2]}"></span>
      ในวันที่ดีและวันที่เหนื่อย
      <span class="letter-blank" data-answer="${answers[3]}"></span>
      ที่ทำให้โลกเล็ก ๆ นี้สวยขึ้น และขอรักเธอแบบ
      <span class="letter-blank" data-answer="${answers[4]}"></span>
    `;
    loveLetter.blanks = $$(".letter-blank", textArea);
    const words = shuffle([...answers, "สายฝน", "เกม", "ดวงไฟ"]);
    bank.innerHTML = "";
    words.forEach((word) => {
      const chip = document.createElement("button");
      chip.className = "word-chip";
      chip.type = "button";
      chip.textContent = word;
      chip.addEventListener("click", () => fillLetterBlank(chip, word));
      bank.appendChild(chip);
    });
    updateLetterProgress();
  }

  function fillLetterBlank(chip, word) {
    if (chip.classList.contains("used")) return;
    const blank = loveLetter.blanks.find((item) => !item.classList.contains("filled"));
    if (!blank) return;
    if (blank.dataset.answer === word) {
      blank.textContent = word;
      blank.classList.add("filled", "correct");
      chip.classList.add("used");
      loveLetter.score += 20;
      setText("#ll-score", String(loveLetter.score));
      updateLetterProgress();
      createHeartBurst(window.innerWidth * 0.5, window.innerHeight * 0.5);
      if (loveLetter.score >= 100) finishLoveLetter();
    } else {
      chip.classList.add("wrong-tap");
      blank.classList.add("wrong");
      shakeActiveScreen();
      window.setTimeout(() => {
        chip.classList.remove("wrong-tap");
        blank.classList.remove("wrong");
      }, 450);
    }
  }

  function updateLetterProgress() {
    const percent = loveLetter.score;
    const bar = $("#letter-progress-bar");
    if (bar) bar.style.width = `${percent}%`;
  }

  function finishLoveLetter() {
    unlockGallery("loveletter");
    addLove(10);
    showResult({
      icon: "💌",
      title: "จดหมายรักสมบูรณ์แล้ว",
      msg: "ทุกคำวางถูกที่ เหมือนความรู้สึกของ Fast ที่ตั้งใจส่งไปถึง Muay พอดี",
      stars: 3,
      retryLabel: copy.retry,
      hubLabel: copy.hub,
      onRetry: startLoveLetter,
      onHub: () => showScreen("minigame")
    });
  }

  function renderGallery() {
    const grid = $("#gallery-grid");
    if (!grid) return;
    grid.innerHTML = "";
    galleryItems.forEach((item) => {
      const unlocked = state.gallery.has(item.id);
      const node = document.createElement("button");
      node.type = "button";
      node.className = `gallery-item${unlocked ? "" : " locked"}`;
      node.innerHTML = `
        <div class="g-icon">${unlocked ? item.icon : "🔒"}</div>
        <div class="g-title">${item.title}</div>
      `;
      node.addEventListener("click", () => {
        if (!unlocked) {
          toast("เล่นเนื้อเรื่องหรือมินิเกมเพื่อปลดล็อก");
          return;
        }
        showResult({
          icon: item.icon,
          title: item.title,
          msg: item.desc,
          stars: item.id === "ending" ? 3 : 2,
          hubLabel: copy.close,
          onHub: () => showScreen("gallery")
        });
      });
      grid.appendChild(node);
    });
  }

  function showEnding() {
    unlockGallery("ending");
    persist();
    const title = state.love >= 85 ? "Perfect Love Ending" : "True Love Ending";
    const line = state.love >= 85
      ? "หัวใจสองดวงสว่างเต็มจอ เพราะทุกคำตอบมีความตั้งใจอยู่ข้างใน"
      : "แม้เส้นทางจะมีจังหวะเขิน ๆ บ้าง แต่ความรักของทั้งคู่ก็ไปถึงฉากสำคัญ";
    const content = $("#ending-content");
    if (content) {
      content.innerHTML = `
        <div class="ending-chars">Fast ♥ Muay</div>
        <h2 class="ending-title">${title}</h2>
        <p class="ending-subtitle">${line}<br>ขอให้ทุกวันของ Fast และ Muay เป็นด่านใหม่ที่อยากเล่นต่อด้วยกัน</p>
        <div class="ending-love-score">Love Meter ${state.love}%</div>
        <div class="ending-actions">
          <button class="btn-pixel btn-primary" id="btn-ending-gallery">ดูความทรงจำ</button>
          <button class="btn-pixel btn-secondary" id="btn-ending-home">กลับหน้าแรก</button>
        </div>
      `;
      $("#btn-ending-gallery")?.addEventListener("click", () => {
        renderGallery();
        showScreen("gallery");
      });
      $("#btn-ending-home")?.addEventListener("click", () => showScreen("intro"));
    }
    showScreen("ending");
  }

  function startEndingCanvas() {
    if (ending.raf || !ending.ctx) return;
    ending.sparks = [];
    const loop = (time) => {
      ending.raf = 0;
      drawEnding(time);
      if (state.screen === "ending") ending.raf = requestAnimationFrame(loop);
    };
    ending.raf = requestAnimationFrame(loop);
  }

  function drawEnding(time) {
    const canvas = ending.canvas;
    const ctx = ending.ctx;
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    drawRooftop(ctx, w, h, time / 1000);
    if (Math.random() < 0.09) {
      const cx = rand(w * 0.18, w * 0.82);
      const cy = rand(h * 0.12, h * 0.44);
      for (let i = 0; i < 18; i += 1) {
        ending.sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos((Math.PI * 2 * i) / 18) * rand(40, 120),
          vy: Math.sin((Math.PI * 2 * i) / 18) * rand(40, 120),
          life: 1,
          color: pick(["#ff6b9d", "#ffd166", "#7be0ad", "#87ceeb"])
        });
      }
    }
    ending.sparks.forEach((spark) => {
      spark.x += spark.vx * 0.016;
      spark.y += spark.vy * 0.016;
      spark.vy += 18 * 0.016;
      spark.life -= 0.016;
      ctx.globalAlpha = Math.max(0, spark.life);
      drawPixelHeart(ctx, spark.x, spark.y, 1.5, spark.color);
      ctx.globalAlpha = 1;
    });
    ending.sparks = ending.sparks.filter((spark) => spark.life > 0);
    drawFast(ctx, w * 0.43, h * 0.74, 3, time / 1000, "right");
    drawMuay(ctx, w * 0.57, h * 0.74, 3, time / 1000, "left");
    ctx.fillStyle = "#ffcad4";
    ctx.fillRect(w * 0.49, h * 0.55, w * 0.02, 8);
  }

  function showResult({ icon, title, msg, stars = 3, retryLabel, hubLabel, onRetry, onHub }) {
    state.resultAction = onRetry || null;
    state.resultHubAction = onHub || null;
    ui.resultIcon.textContent = icon || "💗";
    ui.resultTitle.textContent = title || "สำเร็จ!";
    ui.resultMsg.textContent = msg || "";
    ui.resultStars.textContent = "★".repeat(stars) + "☆".repeat(Math.max(0, 3 - stars));
    ui.resultRetry.classList.toggle("hidden", !onRetry);
    ui.resultRetry.textContent = retryLabel || copy.retry;
    ui.resultHub.textContent = hubLabel || copy.hub;
    ui.result.classList.remove("hidden");
  }

  function hideResult() {
    ui.result.classList.add("hidden");
    state.resultAction = null;
    state.resultHubAction = null;
  }

  function toast(text) {
    const node = document.createElement("div");
    node.className = "pixel-toast";
    node.textContent = text;
    document.body.appendChild(node);
    window.setTimeout(() => node.classList.add("show"), 20);
    window.setTimeout(() => {
      node.classList.remove("show");
      window.setTimeout(() => node.remove(), 250);
    }, 1700);
  }

  function createHeartBurst(x, y) {
    for (let i = 0; i < 12; i += 1) {
      const node = document.createElement("div");
      node.className = "pixel-particle";
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      node.style.setProperty("--dx", `${rand(-90, 90)}px`);
      node.style.setProperty("--dy", `${rand(-120, 40)}px`);
      node.style.setProperty("--color", pick(["#ff6b9d", "#ffd166", "#7be0ad", "#87ceeb"]));
      document.body.appendChild(node);
      window.setTimeout(() => node.remove(), 850);
    }
  }

  function shakeActiveScreen() {
    const active = $(".screen.active");
    if (!active) return;
    active.classList.remove("shake");
    void active.offsetWidth;
    active.classList.add("shake");
  }

  function startParticles() {
    window.setInterval(() => {
      if (document.hidden) return;
      const layer = $("#particle-layer");
      if (!layer) return;
      const petal = document.createElement("div");
      petal.className = "sakura-particle";
      petal.textContent = pick(["✦", "♡", "✧", "♥"]);
      petal.style.left = `${rand(0, 100)}vw`;
      petal.style.animationDuration = `${rand(5, 9)}s`;
      petal.style.color = pick(["#ffb7c5", "#ffd166", "#7be0ad", "#87ceeb"]);
      layer.appendChild(petal);
      window.setTimeout(() => petal.remove(), 9500);
    }, 650);
  }

  function buildStars() {
    const layer = $("#star-layer");
    if (!layer || layer.children.length) return;
    for (let i = 0; i < 60; i += 1) {
      const star = document.createElement("div");
      star.className = "star-particle";
      star.style.left = `${rand(0, 100)}vw`;
      star.style.top = `${rand(0, 100)}vh`;
      star.style.animationDuration = `${rand(1.6, 4)}s`;
      star.style.animationDelay = `${rand(0, 3)}s`;
      layer.appendChild(star);
    }
  }

  function resizeAllCanvases() {
    [storyCanvas, heartCatch.canvas, starLove.canvas, ending.canvas].forEach(resizeCanvas);
    if (state.screen === "starlove") createStarMap();
  }

  function resizeCanvas(canvas) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width || window.innerWidth));
    const height = Math.max(240, Math.floor(rect.height || window.innerHeight));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.imageSmoothingEnabled = false;
    }
  }

  function shuffle(items) {
    const copyItems = [...items];
    for (let i = copyItems.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copyItems[i], copyItems[j]] = [copyItems[j], copyItems[i]];
    }
    return copyItems;
  }
})();
