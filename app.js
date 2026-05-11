const state = {
  fuel: true,
  oxygen: true,
  heat: true,
  gas: "air",
  quizIndex: 0,
  quizScore: 0,
  answered: false,
  missionAnswers: new Map()
};

const burnFacts = {
  fuel: "移除可燃物：關瓦斯、清開易燃物，火就缺少燃料。",
  oxygen: "隔絕助燃物：蓋鍋蓋或用沙覆蓋，可阻隔氧氣。",
  heat: "降低溫度：用水柱降溫，使物質低於燃點。"
};

const gasInfo = {
  air: {
    name: "一般空氣",
    description: "空氣中約有 21% 氧氣，所以可以支持一般燃燒。",
    recipe: "空氣主要由氮氣、氧氣，以及少量二氧化碳、氬氣等共同組成。",
    fill: "linear-gradient(180deg, rgba(15, 139, 141, 0.12), rgba(15, 139, 141, 0.35))"
  },
  oxygen: {
    name: "氧氣",
    description: "氧氣無色無味，具有助燃性，會讓點燃的線香燃燒得更旺。",
    recipe: "課本實驗：雙氧水加入切碎金針菇，可加速產生氧氣。",
    fill: "linear-gradient(180deg, rgba(242, 184, 75, 0.12), rgba(242, 184, 75, 0.48))"
  },
  co2: {
    name: "二氧化碳",
    description: "二氧化碳無色無味，不具助燃性，會使點燃的線香熄滅。",
    recipe: "課本實驗：醋加入小蘇打粉，可製造二氧化碳。",
    fill: "linear-gradient(180deg, rgba(88, 106, 122, 0.14), rgba(88, 106, 122, 0.46))"
  }
};

const missions = [
  {
    title: "戶外鐵欄杆",
    text: "長期風吹雨淋，最需要隔絕水和空氣。",
    options: ["擦乾後保持乾燥", "塗油漆形成保護層", "放在酸性水溶液中"],
    answer: 1
  },
  {
    title: "剛洗好的鐵工具",
    text: "表面有水分，短時間內就可能加速生鏽。",
    options: ["擦乾水分", "泡在醋裡", "放到潮溼角落"],
    answer: 0
  },
  {
    title: "食品鐵罐內壁",
    text: "需要避免內容物直接接觸鐵。",
    options: ["刮掉內壁塗層", "鍍上一層金屬", "加入更多水分"],
    answer: 1
  }
];

const quiz = [
  {
    question: "燃燒三要素是什麼？",
    options: ["可燃物、助燃物、達到燃點", "水、酸、氧氣", "氮氣、氧氣、二氧化碳"],
    answer: 0,
    feedback: "沒錯，三個條件同時存在，物質才會燃燒。"
  },
  {
    question: "為什麼蓋上鍋蓋可以讓油鍋的火熄滅？",
    options: ["讓油變少", "阻隔空氣中的氧氣", "增加二氧化碳的味道"],
    answer: 1,
    feedback: "正確，蓋鍋蓋的重點是隔絕助燃物。"
  },
  {
    question: "哪一種氣體會讓點燃的線香更旺？",
    options: ["氧氣", "二氧化碳", "氮氣"],
    answer: 0,
    feedback: "正確，氧氣具有助燃性。"
  },
  {
    question: "鋼棉滴醋通常比滴水更快生鏽，表示什麼？",
    options: ["酸性水溶液會加快生鏽", "醋能防鏽", "沒有氧氣也會燃燒"],
    answer: 0,
    feedback: "正確，酸性水溶液會加快鐵生鏽的速度。"
  }
];

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

function updateBurn() {
  state.fuel = qs("#fuelToggle").checked;
  state.oxygen = qs("#oxygenToggle").checked;
  state.heat = qs("#heatToggle").checked;

  const missing = [];
  if (!state.fuel) missing.push("fuel");
  if (!state.oxygen) missing.push("oxygen");
  if (!state.heat) missing.push("heat");

  const stage = qs(".burn-stage");
  const result = qs("#burnResult");
  const chips = qs("#burnChips");
  stage.classList.toggle("extinguished", missing.length > 0);
  stage.classList.toggle("low", missing.length === 1);

  if (missing.length === 0) {
    result.textContent = "三要素齊全，火會持續燃燒。";
    chips.innerHTML = ["可燃物", "助燃物", "達到燃點"].map((text) => `<span class="chip">${text}</span>`).join("");
    return;
  }

  result.textContent = `缺少${missing.length}個條件，燃燒無法持續。`;
  chips.innerHTML = missing.map((key) => `<span class="chip">${burnFacts[key]}</span>`).join("");
}

function updateGas(gas) {
  state.gas = gas;
  qsa(".gas-btn").forEach((button) => button.classList.toggle("active", button.dataset.gas === gas));
  const info = gasInfo[gas];
  qs("#gasName").textContent = info.name;
  qs("#gasDescription").textContent = info.description;
  qs("#gasRecipe").textContent = info.recipe;
  qs("#gasFill").style.background = info.fill;
  const scene = qs(".jar-scene");
  scene.classList.remove("air", "oxygen", "co2");
  scene.classList.add(gas);
}

function updateRust() {
  const water = Number(qs("#waterRange").value);
  const acid = Number(qs("#acidRange").value);
  const oxygen = qs("#rustOxygenToggle").checked;
  const time = Number(qs("#timeRange").value);
  let score = oxygen ? water * 0.42 + acid * 0.38 + time * 5 : water * 0.05 + acid * 0.04;
  score = Math.max(0, Math.min(100, Math.round(score)));

  qs("#rustScore").textContent = score;
  qs("#steelWool").style.setProperty("--rust-score", score);
  qsa(".steel-wool span").forEach((spot, index) => {
    const level = Math.max(0.08, score / 100 - index * 0.12);
    spot.style.opacity = String(Math.min(0.95, level + 0.22));
    spot.style.transform = `scale(${0.35 + level * 1.3})`;
  });

  const explanation = qs("#rustExplanation");
  if (!oxygen) {
    explanation.textContent = "氧氣不足時，鐵較不容易生鏽；燃燒和生鏽都與氧氣有關。";
  } else if (acid > 60) {
    explanation.textContent = "有氧氣又有酸性水溶液時，鐵生鏽速度會加快。";
  } else if (water > 45) {
    explanation.textContent = "有氧氣和水分時，鐵會逐漸生鏽。保持乾燥能降低生鏽機會。";
  } else {
    explanation.textContent = "水分少時，生鏽速度較慢；隔絕生鏽因素就能防鏽。";
  }

  qs("#variableHint").textContent = `目前設定：水分 ${water}、酸性 ${acid}、時間 ${time}。做正式實驗時，每次只改變一個操縱變因。`;
}

function renderMissions() {
  qs("#missionGrid").innerHTML = missions.map((mission, missionIndex) => {
    const options = mission.options.map((option, optionIndex) => {
      return `<button class="mission-option" data-mission="${missionIndex}" data-option="${optionIndex}" type="button">${option}</button>`;
    }).join("");
    return `
      <article class="mission-card">
        <h3>${mission.title}</h3>
        <p>${mission.text}</p>
        <div class="mission-options">${options}</div>
      </article>
    `;
  }).join("");
}

function chooseMission(missionIndex, optionIndex) {
  state.missionAnswers.set(missionIndex, optionIndex);
  qsa(`.mission-option[data-mission="${missionIndex}"]`).forEach((button) => {
    const selected = Number(button.dataset.option) === optionIndex;
    const correct = Number(button.dataset.option) === missions[missionIndex].answer;
    button.classList.toggle("selected", selected);
    button.classList.toggle("correct", selected && correct);
    button.classList.toggle("wrong", selected && !correct);
  });
  const done = missions.filter((mission, index) => state.missionAnswers.get(index) === mission.answer).length;
  qs("#missionScore").textContent = `${done} / ${missions.length}`;
}

function renderQuiz() {
  const item = quiz[state.quizIndex];
  state.answered = false;
  qs("#quizStep").textContent = `第 ${state.quizIndex + 1} 題`;
  qs("#quizScore").textContent = `得分 ${state.quizScore}`;
  qs("#quizQuestion").textContent = item.question;
  qs("#quizFeedback").textContent = "";
  qs("#nextQuestion").textContent = state.quizIndex === quiz.length - 1 ? "重新開始" : "下一題";
  qs("#quizOptions").innerHTML = item.options.map((option, index) => {
    return `<button class="option-btn" data-option="${index}" type="button">${option}</button>`;
  }).join("");
}

function answerQuiz(optionIndex) {
  if (state.answered) return;
  state.answered = true;
  const item = quiz[state.quizIndex];
  const correct = optionIndex === item.answer;
  if (correct) state.quizScore += 1;
  qsa(".option-btn").forEach((button) => {
    const index = Number(button.dataset.option);
    button.classList.toggle("correct", index === item.answer);
    button.classList.toggle("wrong", index === optionIndex && !correct);
  });
  qs("#quizFeedback").textContent = correct ? item.feedback : `再想一下：${item.feedback}`;
  qs("#quizScore").textContent = `得分 ${state.quizScore}`;
}

function nextQuiz() {
  if (state.quizIndex === quiz.length - 1) {
    state.quizIndex = 0;
    state.quizScore = 0;
  } else {
    state.quizIndex += 1;
  }
  renderQuiz();
}

function drawHero() {
  const canvas = qs("#heroCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  let t = 0;

  function frame() {
    t += 0.025;
    ctx.clearRect(0, 0, w, h);

    const sky = ctx.createLinearGradient(0, 0, w, h);
    sky.addColorStop(0, "#17202a");
    sky.addColorStop(0.56, "#28444a");
    sky.addColorStop(1, "#60745d");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    for (let i = 0; i < 22; i += 1) {
      const x = (i * 77 + Math.sin(t + i) * 18) % w;
      const y = 38 + (i % 6) * 24;
      ctx.beginPath();
      ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#d9e2df";
    ctx.fillRect(80, 285, 250, 30);
    ctx.fillStyle = "#9da9aa";
    for (let i = 0; i < 12; i += 1) {
      ctx.fillRect(90 + i * 20, 278 + Math.sin(t * 2 + i) * 5, 95, 4);
    }

    const rustPulse = 0.65 + Math.sin(t * 1.7) * 0.12;
    ctx.fillStyle = `rgba(180, 90, 53, ${rustPulse})`;
    for (let i = 0; i < 10; i += 1) {
      ctx.beginPath();
      ctx.ellipse(105 + i * 22, 294 + Math.sin(i) * 8, 12 + i % 3 * 4, 6 + i % 4, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#4b382e";
    ctx.fillRect(500, 265, 34, 74);
    const flicker = 1 + Math.sin(t * 8) * 0.08;
    drawFlame(ctx, 517, 238, 78 * flicker, "#e56b5d");
    drawFlame(ctx, 517, 247, 46 * flicker, "#f2b84b");

    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.font = "700 24px Microsoft JhengHei, sans-serif";
    ctx.fillText("氧氣", 455, 112);
    ctx.fillText("水分", 138, 172);
    ctx.fillText("燃點", 548, 172);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.52)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(486, 122);
    ctx.lineTo(522, 198);
    ctx.moveTo(177, 180);
    ctx.lineTo(190, 275);
    ctx.moveTo(574, 180);
    ctx.lineTo(535, 214);
    ctx.stroke();

    requestAnimationFrame(frame);
  }

  frame();
}

function drawFlame(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.45;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.5, size * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function bindEvents() {
  ["#fuelToggle", "#oxygenToggle", "#heatToggle"].forEach((selector) => {
    qs(selector).addEventListener("change", updateBurn);
  });
  qsa(".gas-btn").forEach((button) => {
    button.addEventListener("click", () => updateGas(button.dataset.gas));
  });
  ["#waterRange", "#acidRange", "#rustOxygenToggle", "#timeRange"].forEach((selector) => {
    qs(selector).addEventListener("input", updateRust);
  });
  qs("#missionGrid").addEventListener("click", (event) => {
    const button = event.target.closest(".mission-option");
    if (!button) return;
    chooseMission(Number(button.dataset.mission), Number(button.dataset.option));
  });
  qs("#quizOptions").addEventListener("click", (event) => {
    const button = event.target.closest(".option-btn");
    if (!button) return;
    answerQuiz(Number(button.dataset.option));
  });
  qs("#nextQuestion").addEventListener("click", nextQuiz);
}

renderMissions();
renderQuiz();
bindEvents();
updateBurn();
updateGas("air");
updateRust();
drawHero();
