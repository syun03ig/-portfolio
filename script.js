// ==========================================================================
// 1. BOOT LOGIC (システム起動カタカタアニメーション)
// ==========================================================================
const logData = [
  "> LOADING SHUN SYSTEM v2026...",
  "> SKILLS: HTML5, CSS3, JAVASCRIPT, GITHUB [DETECTED]",
  "> LOADING WORKS: MONO-COFFEE... [SUCCESS]",
  "> LOADING WORKS: PURE-CARE...   [SUCCESS]",
  "> LOADING WORKS: HAIR-SALON...  [SUCCESS]",
  "> SYSTEM OK."
];

const logContainer = document.getElementById("log-container");

function startBooting() {
  if (!logContainer) return;
  let currentLine = 0;

  function printLine() {
    if (currentLine < logData.length) {
      const p = document.createElement("p");
      p.className = "boot-line";
      if (currentLine === logData.length - 1) {
        p.classList.add("boot-ok");
      }
      p.textContent = logData[currentLine];
      
      logContainer.appendChild(p);
      p.offsetHeight; // アニメーション発火用リフラックス
      p.classList.add("show");
      
      if (currentLine === logData.length - 1) {
        setTimeout(() => {
          transitionToTitle();
        }, 1200);
      } else {
        currentLine++;
        setTimeout(printLine, 400);
      }
    }
  }

  const initialCursor = document.createElement("span");
  initialCursor.className = "cursor-blink";
  logContainer.appendChild(initialCursor);

  setTimeout(() => {
    initialCursor.remove();
    printLine();
  }, 1000);
}

window.onload = function() {
  // 'Orbitron' と 'Share Tech Mono' の両方がスマホに読み込まれたのを確認してから起動！
  Promise.all([
    document.fonts.load("700 12px 'Orbitron'"),
    document.fonts.load("900 12px 'Orbitron'"),
    document.fonts.load("100 12px 'Share Tech Mono'")
  ]).then(() => {
    startBooting();
    initShutterGrid();
  }).catch(() => {
    startBooting();
    initShutterGrid();
  });
};

// ==========================================================================
// 2. TITLE EXPLOSION LOGIC (タイトルドットモザイク爆発Canvas)
// ==========================================================================
const titleScreen = document.getElementById("title-call-screen");
const titleCanvas = document.getElementById("title-canvas");

let particles = [];
let titleAnimationId;

function transitionToTitle() {
  const bootLoader = document.getElementById("boot-loader");
  if (bootLoader) bootLoader.style.display = "none";
  if (!titleScreen || !titleCanvas) {
    transitionToMainScreen();
    return;
  }
  
  titleScreen.classList.add("active");

  titleCanvas.width = window.innerWidth;
  titleCanvas.height = window.innerHeight;

  createTitleParticles();
  animateTitleExplosion();
}

function createTitleParticles() {
  const titleCtx = titleCanvas.getContext("2d");
  const text = "SHUN PORTFOLIO";
  
  // スマホとPCで最適な文字サイズと間隔を出し分ける計算式
  const isMobile = window.innerWidth <= 768;
  // スマホの文字サイズを最大42pxから「最大32px」へ一回りコンパクトにし、はみ出しを防ぎます！
  const fontSize = isMobile ? Math.min(window.innerWidth * 0.085, 32) : Math.min(window.innerWidth * 0.08, 65);
  
  titleCtx.fillStyle = "#ffffff";
  titleCtx.font = "900 " + fontSize + "px 'Orbitron'";
  titleCtx.textAlign = "center";
  titleCtx.textBaseline = "middle";
  
  const x = titleCanvas.width / 2;
  const y = titleCanvas.height / 2;
  
  // スマホの文字潰れ防止：スマホの時は一文字ずつ少し離してCanvasに描画する
  if (isMobile) {
    // 文字同士の間隔（余白）を 6 から「4.5」に少しだけ引き算して全体幅を圧縮！
    const letterSpacing = 4.5;
    const characters = text.split("");
    const totalWidth = titleCtx.measureText(text).width + (characters.length - 1) * letterSpacing;
    let startX = x - totalWidth / 2 + titleCtx.measureText(characters[0]).width / 2;
    
    characters.forEach((char, index) => {
      titleCtx.fillText(char, startX, y);
      if (index < characters.length - 1) {
        startX += (titleCtx.measureText(char).width / 2) + (titleCtx.measureText(characters[index + 1]).width / 2) + letterSpacing;
      }
    });
  } else {
    // PCの場合は普通に一発で真ん中に描画
    titleCtx.fillText(text, x, y);
  }

  const imgData = titleCtx.getImageData(0, 0, titleCanvas.width, titleCanvas.height);
  const data = imgData.data;
  particles = [];

  // ドットの間引き間隔（スマホでは少し荒くして潰れを防ぐ）
  const step = isMobile ? 5 : 4;
  for (let tY = 0; tY < titleCanvas.height; tY += step) {
    for (let tX = 0; tX < titleCanvas.width; tX += step) {
      const index = (tY * titleCanvas.width + tX) * 4;
      const alpha = data[index + 3];
      if (alpha > 128) {
        particles.push({
          x: tX,
          y: tY,
          origX: tX,
          origY: tY,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          color: "#ffffff",
          size: isMobile ? (Math.random() * 1.5 + 1.2) : (Math.random() * 2 + 1),
          delay: Math.random() * 20 + 120
        });
      }
    }
  }
  titleCtx.clearRect(0, 0, titleCanvas.width, titleCanvas.height);
}

let frameCount = 0;
function animateTitleExplosion() {
  const titleCtx = titleCanvas.getContext("2d");
  titleCtx.clearRect(0, 0, titleCanvas.width, titleCanvas.height);
  frameCount++;

  let activeCount = 0;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    if (frameCount < p.delay) {
      p.x = p.origX + (Math.random() - 0.5) * 2;
      p.y = p.origY + (Math.random() - 0.5) * 2;
      titleCtx.fillStyle = p.color;
      titleCtx.fillRect(p.x, p.y, p.size, p.size);
      activeCount++;
    } else {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 1.02; 
      p.vy *= 1.02;

      if (p.x >= 0 && p.x <= titleCanvas.width && p.y >= 0 && p.y <= titleCanvas.height) {
        titleCtx.fillStyle = p.color;
        titleCtx.fillRect(p.x, p.y, p.size, p.size);
        activeCount++;
      }
    }
  }

  if (activeCount > 50 && frameCount < 290) {
    titleAnimationId = requestAnimationFrame(animateTitleExplosion);
  } else {
    cancelAnimationFrame(titleAnimationId);
    transitionToMainScreen();
  }
}

// ==========================================================================
// 3. MAIN MENU & STATUS SCREEN LOGIC
// ==========================================================================
const mainScreen = document.getElementById("main-game-screen");
const startGameBtn = document.getElementById("start-game-btn");
const startMenuItem = document.getElementById("start-menu-item");

function transitionToMainScreen() {
  if (titleScreen) titleScreen.classList.remove("active");
  if (mainScreen) mainScreen.classList.add("active");
}

if (startGameBtn) {
  startGameBtn.addEventListener("click", () => {
    if (startMenuItem) startMenuItem.classList.add("pi-keen");

    setTimeout(() => {
      triggerShutterWipe(() => {
        if (mainScreen) mainScreen.classList.remove("active");
        const stageSelect = document.getElementById("stage-select-screen");
        if (stageSelect) stageSelect.classList.add("active");
        startFallingShapes();
      });
    }, 500);
  });
}

// ==========================================================================
// 4. SHUTTER WIPE (ドットシャッター切り替え)
// ==========================================================================
const shutter = document.getElementById("shutter");
const rows = 10;
const cols = 10;
let panels = [];

function initShutterGrid() {
  if (!shutter) return;
  shutter.innerHTML = "";
  panels = [];
  for (let i = 0; i < rows * cols; i++) {
    const panel = document.createElement("div");
    panel.className = "shutter-panel";
    shutter.appendChild(panel);
    panels.push(panel);
  }
}

function triggerShutterWipe(middleCallback) {
  const delayMatrix = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      if (panels[index]) {
        delayMatrix.push({
          el: panels[index],
          delay: (r + c) * 35 
        });
      }
    }
  }

  delayMatrix.forEach(item => {
    setTimeout(() => {
      item.el.classList.add("filled");
    }, item.delay);
  });

  const maxDelay = (rows + cols) * 35;
  setTimeout(() => {
    if (middleCallback) middleCallback();

    delayMatrix.forEach(item => {
      setTimeout(() => {
        item.el.classList.remove("filled");
      }, maxDelay + 200 + (item.delay));
    });
  }, maxDelay + 100);
}

// ==========================================================================
// 5. STAGE SELECT BACKGROUND EFFECTS (こだわりの落ち物物理図形システム)
// ==========================================================================
const shapesCanvas = document.getElementById("falling-shapes-canvas");
let shapeList = [];
let shapesAnimationId;
let isShapesRunning = false;

class FallingShape {
  constructor(type) {
    this.type = type; 
    this.x = Math.random() * (shapesCanvas ? shapesCanvas.width : 500);
    this.y = -20;
    this.size = Math.random() * 10 + 10;
    
    if (this.type === 'square') {
      this.speed = Math.random() * 0.5 + 0.3; 
      this.opacity = 0.8; 
      this.fadeStartY = (shapesCanvas ? shapesCanvas.height : 500) * (Math.random() * 0.4 + 0.3); 
    } else if (this.type === 'cross') {
      this.speed = Math.random() * 0.6 + 0.4; 
      this.angle = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03; 
      this.opacity = 0.7; 
    } else if (this.type === 'dot') {
      this.speed = Math.random() * 1.5 + 1.5; 
      this.size = Math.random() * 3 + 4;
      this.opacity = 0.9; 
      this.vy = this.speed;
      this.bounceCount = 0;
      this.maxBounces = 2; 
      this.isBouncing = false;
    }
  }

  update() {
    const canvasHeight = shapesCanvas ? shapesCanvas.height : 500;
    if (this.type === 'square') {
      this.y += this.speed;
      if (this.y > this.fadeStartY) {
        this.opacity -= 0.01; 
      }
    } 
    else if (this.type === 'cross') {
      this.y += this.speed;
      this.angle += this.rotSpeed; 
    } 
    else if (this.type === 'dot') {
      if (this.isBouncing) {
        this.vy += 0.2; 
        this.y += this.vy;

        if (this.y >= canvasHeight - this.size) {
          this.y = canvasHeight - this.size;
          this.bounceCount++;
          if (this.bounceCount >= this.maxBounces) {
            this.opacity = 0; 
          } else {
            this.vy = -this.vy * 0.5; 
          }
        }
      } else {
        this.y += this.speed;
        if (this.y >= canvasHeight - this.size) {
          this.y = canvasHeight - this.size;
          this.isBouncing = true;
          this.vy = -this.speed * 0.6; 
          this.bounceCount++;
        }
      }
    }
  }

  draw() {
    if (!shapesCanvas) return;
    const sCtx = shapesCanvas.getContext("2d");
    sCtx.save();
    sCtx.globalAlpha = Math.max(0, this.opacity);
    sCtx.strokeStyle = "#aaaaaa";
    sCtx.fillStyle = "#aaaaaa";
    sCtx.lineWidth = 1.5;

    if (this.type === 'square') {
      if (this.size > 15) {
        sCtx.strokeRect(this.x, this.y, this.size, this.size);
      } else {
        sCtx.fillRect(this.x, this.y, this.size, this.size);
      }
    } 
    else if (this.type === 'cross') {
      sCtx.translate(this.x + this.size / 2, this.y + this.size / 2);
      sCtx.rotate(this.angle);
      sCtx.beginPath();
      sCtx.moveTo(-this.size / 2, 0);
      sCtx.lineTo(this.size / 2, 0);
      sCtx.moveTo(0, -this.size / 2);
      sCtx.lineTo(0, this.size / 2);
      sCtx.stroke();
    } 
    else if (this.type === 'dot') {
      sCtx.beginPath();
      sCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      sCtx.fill();
    }

    sCtx.restore();
  }

  isDead() {
    const canvasHeight = shapesCanvas ? shapesCanvas.height : 500;
    return this.y > canvasHeight + 30 || this.opacity <= 0;
  }
}

function initShapesCanvasSize() {
  if (!shapesCanvas) return;
  shapesCanvas.width = window.innerWidth;
  shapesCanvas.height = window.innerHeight;
}

function startFallingShapes() {
  if (!shapesCanvas) return;
  initShapesCanvasSize();
  window.addEventListener('resize', initShapesCanvasSize);
  shapeList = [];
  isShapesRunning = true;
  animateFallingShapes();
}

function animateFallingShapes() {
  if (!isShapesRunning || !shapesCanvas) return;
  const sCtx = shapesCanvas.getContext("2d");
  sCtx.clearRect(0, 0, shapesCanvas.width, shapesCanvas.height);

  if (Math.random() < 0.15) {
    const types = ['square', 'cross', 'dot'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    shapeList.push(new FallingShape(chosenType));
  }

  for (let i = shapeList.length - 1; i >= 0; i--) {
    const s = shapeList[i];
    s.update();
    s.draw();

    if (s.isDead()) {
      shapeList.splice(i, 1);
    }
  }

  shapesAnimationId = requestAnimationFrame(animateFallingShapes);
}

function pauseFallingShapes() {
  isShapesRunning = false; 
}

// ==========================================================================
// 6. STAGEブリーフィング（案2 作品詳細）と出撃URLジャンプ
// ==========================================================================
const stageItems = document.querySelectorAll(".stage-item");
const selectCard = document.getElementById("select-card");

const briefing = document.getElementById("briefing-screen");
const briefingStageNum = document.getElementById("briefing-stage-num");
const briefingTitle = document.getElementById("briefing-title");
const briefingPeriod = document.getElementById("briefing-period");
const briefingDesc = document.getElementById("briefing-desc");
const closeBriefingBtn = document.getElementById("briefing-close-btn");

const launchBtn = document.getElementById("mission-launch-btn");

const worksUrls = {
  "1": "https://syun03ig.github.io/mono-coffe/", 
  "2": "https://syun03ig.github.io/pure-care/",   
  "3": "https://syun03ig.github.io/hair-salon/"   
};

const worksBriefingData = {
  "1": {
    num: "STAGE 01",
    title: "MONO COFFEE",
    period: "14 days",
    desc: "極限まで引き算された、無駄のない静寂なコーヒーショップ ブランドサイト。余白とタイポグラフィ、コーヒーの湯気のアニメーションだけに焦点を当て、洗練された空間をWeb上にそのまま移植しました。"
  },
  "2": {
    num: "STAGE 02",
    title: "PURE CARE",
    period: "20 days",
    desc: "クリーンでオーガニックなスキンケア商品のオンラインショップ。清潔感のあるアースカラー、なめらかに吸い付くようなホバーインタラクション、視覚的な透明感をコードの最適化と美しいCSSレイアウトで実現しました。"
  },
  "3": {
    num: "STAGE 03",
    title: "HAIR SALON",
    period: "25 days",
    desc: "ストリートカルチャーの熱量をそのまま落とし込んだ、実機ライクなスマホ操作をベースにした最高傑作。全画面写真、トガった二重罫線、実機を忠実に模倣したメニューモーダルなど、私の技術をフル投入したボスステージです。"
  }
};

let currentTargetUrl = "";

stageItems.forEach(item => {
  item.addEventListener("click", () => {
    const stageId = item.getAttribute("data-stage");
    const data = worksBriefingData[stageId];
    currentTargetUrl = worksUrls[stageId];

    item.classList.add("locked-on");
    pauseFallingShapes();

    setTimeout(() => {
      if (!briefing) return;
      briefingStageNum.textContent = data.num;
      briefingTitle.textContent = data.title;
      briefingPeriod.textContent = data.period;
      briefingDesc.textContent = data.desc;
      briefing.classList.add("active");
    }, 600);
  });
});

if (closeBriefingBtn) {
  closeBriefingBtn.addEventListener("click", () => {
    if (briefing) briefing.classList.remove("active");
    stageItems.forEach(item => item.classList.remove("locked-on"));
    startFallingShapes();
  });
}

if (launchBtn) {
  launchBtn.addEventListener("click", () => {
    if (selectCard) {
      selectCard.classList.add("zoom-out");
    }

    setTimeout(() => {
      if (currentTargetUrl) {
        // スマホのポップアップブロックを完全回避し、同じタブで移動する最適化処理
        window.location.href = currentTargetUrl;
      }
      
      setTimeout(() => {
        if (selectCard) selectCard.classList.remove("zoom-out");
        if (briefing) briefing.classList.remove("active");
        stageItems.forEach(item => item.classList.remove("locked-on"));
        startFallingShapes();
      }, 500);

    }, 1800);
  });
}
