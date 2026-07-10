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
  startBooting();
  initShutterGrid();
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
  titleCtx.fillStyle = "#ffffff";
  titleCtx.font = "bold " + Math.min(window.innerWidth * 0.08, 70) + "px 'Share Tech Mono'";
  titleCtx.textAlign = "center";
  titleCtx.textBaseline = "middle";
  
  const x = titleCanvas.width / 2;
  const y = titleCanvas.height / 2;
  titleCtx.fillText(text, x, y);

  const imgData = titleCtx.getImageData(0, 0, titleCanvas.width, titleCanvas.height);
  const data = imgData.data;
  particles = [];

  const step = 4;
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
          size: Math.random() * 2 + 1,
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
// 6. STAGE TRANSITION (ステージ決定 ＆ 爆速Webサイトジャンプシステム)
// ==========================================================================
const stageItems = document.querySelectorAll(".stage-item");
const selectCard = document.getElementById("select-card");

// 【本番URL設定】Shunさんの実際の各作品ページURLを完璧にセットしました！
const worksUrls = {
  "1": "https://syun03ig.github.io/mono-coffe/", 
  "2": "https://syun03ig.github.io/pure-care/",   
  "3": "https://syun03ig.github.io/hair-salon/"   
};

stageItems.forEach(item => {
  item.addEventListener("click", () => {
    const stageId = item.getAttribute("data-stage");
    const targetUrl = worksUrls[stageId];

    // 1. ロックオン点滅演出
    item.classList.add("locked-on");
    
    // 2. 背景図形の完全静止
    pauseFallingShapes();

    // 3. 親カード全体の巨大化（ズームインロード）
    if (selectCard) {
      setTimeout(() => {
        selectCard.classList.add("zoom-out");
      }, 600);
    }

    // 4. ズームインが完全に完了した瞬間（1.8秒後）、別タブで実際のWebサイトへ出撃！
    setTimeout(() => {
      if (targetUrl) {
        window.open(targetUrl, "_blank");
      }
      
      // ユーザーがポートフォリオタブに戻ってきたときのために、画面の状態を元通りに修復しておく
      setTimeout(() => {
        if (selectCard) selectCard.classList.remove("zoom-out");
        item.classList.remove("locked-on");
        startFallingShapes(); 
      }, 500);

    }, 1800);
  });
});
