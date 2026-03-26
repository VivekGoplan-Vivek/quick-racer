(() => {
  // ═══════════════════════════
  //  AUDIO ENGINE (Web Audio)
  // ═══════════════════════════
  let audioCtx;
  function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }

  let engineNode, engineGain;
  function startEngineSound() {
    initAudio();
    engineGain = audioCtx.createGain(); engineGain.gain.value = 0.06;
    engineGain.connect(audioCtx.destination);
    engineNode = [];
    [82, 85].forEach(freq => {
      const osc = audioCtx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = freq;
      const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 200;
      osc.connect(filter); filter.connect(engineGain); osc.start();
      engineNode.push({ osc, filter });
    });
  }
  function setEnginePitch(speed) {
    if (!engineNode) return;
    const f = 75 + speed * 8;
    engineNode[0].osc.frequency.value = f; engineNode[1].osc.frequency.value = f + 3;
    engineNode[0].filter.frequency.value = 150 + speed * 30;
    engineNode[1].filter.frequency.value = 150 + speed * 30;
    engineGain.gain.value = 0.04 + speed * 0.004;
  }
  function stopEngineSound() { if (engineNode) { engineNode.forEach(n => n.osc.stop()); engineNode = null; } }

  function playFuelSound() {
    initAudio();
    const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.connect(g); g.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    setTimeout(() => {
      const o2 = audioCtx.createOscillator(), g2 = audioCtx.createGain();
      o2.type = 'sine'; o2.frequency.value = 1400;
      g2.gain.setValueAtTime(0.12, audioCtx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      o2.connect(g2); g2.connect(audioCtx.destination); o2.start(); o2.stop(audioCtx.currentTime + 0.3);
    }, 150);
  }

  function playBreakdownSound() {
    initAudio();
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.8, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.15));
    const n = audioCtx.createBufferSource(); n.buffer = buf;
    const f = audioCtx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400;
    const g = audioCtx.createGain(); g.gain.setValueAtTime(0.3, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
    n.connect(f); f.connect(g); g.connect(audioCtx.destination); n.start();
    const boom = audioCtx.createOscillator(), bg = audioCtx.createGain();
    boom.type = 'sine'; boom.frequency.setValueAtTime(80, audioCtx.currentTime);
    boom.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.5);
    bg.gain.setValueAtTime(0.25, audioCtx.currentTime);
    bg.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    boom.connect(bg); bg.connect(audioCtx.destination); boom.start(); boom.stop(audioCtx.currentTime + 0.6);
  }

  function playCrashSound() {
    initAudio();
    // metallic crash
    [200, 350, 500].forEach((freq, i) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
        osc.type = 'sawtooth'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0.2, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.connect(g); g.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.25);
      }, i * 60);
    });
    playBreakdownSound();
  }

  function playGameOverSound() {
    initAudio();
    [400, 350, 280, 200].forEach((freq, i) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
        osc.type = 'square'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0.1, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.connect(g); g.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.35);
      }, i * 250);
    });
  }

  function playVictorySound() {
    initAudio();
    [523, 659, 784, 1047, 784, 1047].forEach((freq, i) => {
      setTimeout(() => {
        const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
        osc.type = 'square'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0.1, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(g); g.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.3);
      }, i * 180);
    });
  }

  // ═══════════════════════════
  //  RANDOMIZE QUESTIONS
  // ═══════════════════════════
  function pickRandomQuestions(pool, count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  let sessionQuestions = [];

  // ═══════════════════════════
  //  LEADERBOARD (localStorage)
  // ═══════════════════════════
  const LB_KEY = "race_to_goa_leaderboard";
  function loadLeaderboard() {
    try { return JSON.parse(localStorage.getItem(LB_KEY)) || []; } catch { return []; }
  }
  function saveScore(racerName, podName, score) {
    const lb = loadLeaderboard();
    lb.push({ racer: racerName, pod: podName, score, ts: Date.now() });
    lb.sort((a, b) => b.score - a.score || a.racer.localeCompare(b.racer));
    localStorage.setItem(LB_KEY, JSON.stringify(lb));
    // Also persist to leaderboard.json via our API
    fetch("/api/score", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ racer: racerName, pod: podName, score })
    }).catch(() => {}); // silently fail if server doesn't support it
    return lb;
  }
  function renderLeaderboard(lb, currentRacer) {
    const body = document.getElementById("leaderboard-body");
    body.innerHTML = "";
    lb.slice(0, 15).forEach((entry, i) => {
      const tr = document.createElement("tr");
      if (entry.racer === currentRacer) tr.className = "me";
      tr.innerHTML = `<td>${i + 1}</td><td>${esc(entry.racer)}</td><td>${esc(entry.pod)}</td><td>${entry.score}/5</td>`;
      body.appendChild(tr);
    });
    document.getElementById("leaderboard-section").classList.remove("hidden");
  }
  function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  // ═══════════════════════════
  //  THREE.JS SETUP
  // ═══════════════════════════
  const container = document.getElementById("game-container");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1500);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  scene.background = new THREE.Color(0x1a1a2e);
  scene.fog = new THREE.FogExp2(0x1a1a2e, 0.004);

  // Lights
  scene.add(new THREE.AmbientLight(0x8888cc, 0.4));
  const sun = new THREE.DirectionalLight(0xffeedd, 0.8);
  sun.position.set(50, 80, -30); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.near = 1; sc.far = 300; sc.left = -80; sc.right = 80; sc.top = 80; sc.bottom = -80;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0x6688cc, 0x333344, 0.35));

  // Ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 1200), new THREE.MeshLambertMaterial({ color: 0x2a2a2a }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -0.01, -400);
  ground.receiveShadow = true; scene.add(ground);

  // Road
  const road = new THREE.Mesh(new THREE.PlaneGeometry(24, 1200), new THREE.MeshLambertMaterial({ color: 0x3a3a3a }));
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.01, -400);
  road.receiveShadow = true; scene.add(road);

  // Road markings
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffff88 });
  [-12.2, 12.2].forEach(x => {
    const e = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1200), lineMat);
    e.rotation.x = -Math.PI / 2; e.position.set(x, 0.02, -400); scene.add(e);
  });
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let d = 0; d < 150; d++) {
    [-4, 0, 4, 8, -8].forEach(x => {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 2.5), dashMat);
      dash.rotation.x = -Math.PI / 2; dash.position.set(x, 0.02, 20 - d * 8); scene.add(dash);
    });
  }

  // ─── City Buildings ───
  const buildingColors = [0x2a3a5c, 0x3a2a4c, 0x1a2a3c, 0x4a3a3c, 0x2a2a3a, 0x3a4a5c, 0x1a3a4a, 0x2a1a3c];
  function createBuilding(x, z, w, d, h) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshPhongMaterial({ color: buildingColors[Math.floor(Math.random() * buildingColors.length)], specular: 0x111122, shininess: 10 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z); mesh.castShadow = true; mesh.receiveShadow = true;
    scene.add(mesh);
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffeeaa });
    const rows = Math.floor(h / 3), cols = Math.floor(w / 2.5);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.3) {
          const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), winMat);
          win.position.set(x - w / 2 + 1.5 + c * 2.5, 2 + r * 3, z + d / 2 + 0.01);
          scene.add(win);
        }
      }
    }
  }
  for (let i = 0; i < 25; i++) {
    const w = 8 + Math.random() * 12, d = 8 + Math.random() * 10, h = 15 + Math.random() * 45;
    createBuilding(-22 - w / 2 - Math.random() * 10, -i * 40 + Math.random() * 10, w, d, h);
    createBuilding(22 + w / 2 + Math.random() * 10, -i * 40 + Math.random() * 10, 8 + Math.random() * 12, 8 + Math.random() * 10, 15 + Math.random() * 45);
  }

  // Street lamps
  for (let i = 0; i < 30; i++) {
    [-14, 14].forEach(side => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7, 6), new THREE.MeshLambertMaterial({ color: 0x666666 }));
      pole.position.set(side, 3.5, -i * 35); scene.add(pole);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffdd88 }));
      bulb.position.set(side, 7.2, -i * 35); scene.add(bulb);
      const l = new THREE.PointLight(0xffaa55, 0.3, 18);
      l.position.set(side, 7, -i * 35); scene.add(l);
    });
  }

  // ─── Finish Line ───
  const FINISH_Z = -800;
  const finishGroup = new THREE.Group();
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 12; c++) {
      const mat = new THREE.MeshLambertMaterial({ color: (r + c) % 2 === 0 ? 0x111111 : 0xffffff });
      const tile = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      tile.rotation.x = -Math.PI / 2; tile.position.set(-11 + c * 2, 0.03, r * 2);
      finishGroup.add(tile);
    }
  }
  const archMat = new THREE.MeshPhongMaterial({ color: 0xffd166 });
  [-12, 12].forEach(x => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 8), archMat);
    pole.position.set(x, 5, 5); finishGroup.add(pole);
  });
  const archBar = new THREE.Mesh(new THREE.BoxGeometry(24.6, 1, 1), archMat);
  archBar.position.set(0, 10, 5); finishGroup.add(archBar);
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(20, 3), new THREE.MeshLambertMaterial({ color: 0xff416c, side: THREE.DoubleSide }));
  banner.position.set(0, 8, 5); finishGroup.add(banner);
  finishGroup.position.z = FINISH_Z; scene.add(finishGroup);

  // ═══════════════════════════
  //  LANES & PLAYER CAR
  // ═══════════════════════════
  const LANES = [-8, -4, 0, 4, 8];
  let currentLane = 2; // start center
  let targetLaneX = LANES[currentLane];
  let playerX = LANES[currentLane];

  // Arrow key input
  const keys = {};
  addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
    if (keys[e.key]) return; // prevent repeat
    keys[e.key] = true;
    if ((state === "running" || state === "driving_finish") && !keys._handled) {
      if (e.key === "ArrowLeft" && currentLane > 0) { currentLane--; targetLaneX = LANES[currentLane]; keys._handled = true; }
      if (e.key === "ArrowRight" && currentLane < LANES.length - 1) { currentLane++; targetLaneX = LANES[currentLane]; keys._handled = true; }
    }
  });
  addEventListener("keyup", e => { keys[e.key] = false; keys._handled = false; });

  // ─── Traffic Cars (normal + Bugs) ───
  const safeColors = [0x2196f3, 0x4caf50, 0xff9800, 0x9c27b0, 0x00bcd4, 0xffeb3b, 0x3f51b5];
  const BUG_COLOR = 0xff0000;
  const trafficCars = [];

  function createTrafficCar(lane, z, isBug) {
    const col = isBug ? BUG_COLOR : safeColors[Math.floor(Math.random() * safeColors.length)];
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1, 4), new THREE.MeshPhongMaterial({ color: col }));
    body.position.y = 0.8; body.castShadow = true; group.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 2), new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: isBug ? 0.15 : 0.05 }));
    cabin.position.y = 1.6; group.add(cabin);
    // Wheels
    const wMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
    [[-1.1, 0.3, -1.2], [1.1, 0.3, -1.2], [-1.1, 0.3, 1.2], [1.1, 0.3, 1.2]].forEach(p => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8), wMat);
      w.rotation.z = Math.PI / 2; w.position.set(...p); group.add(w);
    });
    if (isBug) {
      // "BUG" label - red glow ring
      const glow = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 6, 16), new THREE.MeshBasicMaterial({ color: 0xff4444 }));
      glow.rotation.x = Math.PI / 2; glow.position.y = 1.5; group.add(glow);
      // Tail lights brighter
      [[-0.7, 0.6, 2.05], [0.7, 0.6, 2.05]].forEach(p => {
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        tl.position.set(...p); group.add(tl);
      });
    } else {
      [[-0.7, 0.6, 2.05], [0.7, 0.6, 2.05]].forEach(p => {
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.05), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
        tl.position.set(...p); group.add(tl);
      });
    }
    const laneX = LANES[lane];
    group.position.set(laneX, 0, z);
    group.userData = { speed: 0.1 + Math.random() * 0.15, lane, isBug, laneX };
    scene.add(group);
    trafficCars.push(group);
    return group;
  }

  function spawnTraffic() {
    // Clear existing
    trafficCars.forEach(t => scene.remove(t)); trafficCars.length = 0;
    for (let i = 0; i < 25; i++) {
      const lane = Math.floor(Math.random() * LANES.length);
      const isBug = Math.random() < 0.25; // 25% chance of Bug
      createTrafficCar(lane, -i * 45 - 30 + Math.random() * 15, isBug);
    }
  }
  spawnTraffic();

  // ─── Player Buggy ───
  function createBuggy() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xff416c, specular: 0x444444, shininess: 40 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 5.2), bodyMat);
    body.position.y = 1.1; body.castShadow = true; g.add(body);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 1.8), bodyMat);
    hood.position.set(0, 1.8, -1.4); hood.rotation.x = -0.15; g.add(hood);
    const cabMat = new THREE.MeshPhongMaterial({ color: 0xcc2255 });
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1, 2.2), cabMat);
    cab.position.set(0, 2.2, 0.2); g.add(cab);
    const wMat = new THREE.MeshPhongMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3, specular: 0xffffff, shininess: 120 });
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), wMat);
    ws.position.set(0, 2.4, -0.95); ws.rotation.x = -0.2; g.add(ws);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [[-0.9, 0.9, -2.65], [0.9, 0.9, -2.65]].forEach(p => {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), hlMat);
      hl.position.set(...p); g.add(hl);
    });
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
    [[-0.9, 0.9, 2.65], [0.9, 0.9, 2.65]].forEach(p => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.05), tlMat);
      tl.position.set(...p); g.add(tl);
    });
    const wheels = [];
    [[-1.5, 0.4, -1.6], [1.5, 0.4, -1.6], [-1.5, 0.4, 1.6], [1.5, 0.4, 1.6]].forEach(p => {
      const wg = new THREE.Group();
      wg.add(new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.18, 8, 16), new THREE.MeshLambertMaterial({ color: 0x222222 })));
      wg.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 8), new THREE.MeshLambertMaterial({ color: 0xaaaaaa })));
      wg.children[0].rotation.y = Math.PI / 2; wg.children[1].rotation.z = Math.PI / 2;
      wg.position.set(...p); wg.castShadow = true; g.add(wg);
      wheels.push(wg);
    });
    const spMat = new THREE.MeshPhongMaterial({ color: 0xcc2255 });
    g.add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.6), spMat).translateY(2.5).translateZ(2.5));
    [[-1.1], [1.1]].forEach(([x]) => {
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 4), spMat).translateX(x).translateY(2.1).translateZ(2.5));
    });
    g.wheels = wheels;
    g.position.set(0, 0, 10);
    scene.add(g);
    return g;
  }
  const buggy = createBuggy();

  // Driver
  function createDriver() {
    const d = new THREE.Group();
    d.add(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.4), new THREE.MeshLambertMaterial({ color: 0xff416c })));
    d.children[0].position.y = 0.45;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshLambertMaterial({ color: 0xffcc80 }));
    head.position.y = 1.15; d.add(head);
    d.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xffffff })));
    d.children[2].position.y = 1.15;
    const armMat = new THREE.MeshLambertMaterial({ color: 0xff416c });
    const lA = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), armMat); lA.position.set(-0.5, 0.7, 0); d.add(lA);
    const rA = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.16), armMat); rA.position.set(0.5, 0.7, 0); d.add(rA);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x1565c0 });
    d.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.65, 0.2), legMat).translateX(-0.15).translateY(-0.33));
    d.add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.65, 0.2), legMat).translateX(0.15).translateY(-0.33));
    d.lA = lA; d.rA = rA; d.visible = false;
    scene.add(d);
    return d;
  }
  const driver = createDriver();

  // Confetti & smoke
  const confetti = [], confettiCols = [0xff0050, 0x00c878, 0xffc800, 0x0096ff, 0xc832ff, 0xff6400];
  function spawnConfetti(x, y, z, n) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.2 + Math.random() * 0.3, 0.04, 0.15 + Math.random() * 0.2),
        new THREE.MeshBasicMaterial({ color: confettiCols[Math.floor(Math.random() * confettiCols.length)] }));
      m.position.set(x + (Math.random() - 0.5) * 5, y + Math.random() * 2, z + (Math.random() - 0.5) * 5);
      m.userData = { vx: (Math.random() - 0.5) * 0.12, vy: 0.08 + Math.random() * 0.18, vz: (Math.random() - 0.5) * 0.12, rx: (Math.random() - 0.5) * 0.08, rz: (Math.random() - 0.5) * 0.08, life: 1 };
      scene.add(m); confetti.push(m);
    }
  }
  const smokes = [];
  function spawnSmoke(x, y, z) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 5, 5),
      new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.5 }));
    m.position.set(x + (Math.random() - 0.5), y, z + (Math.random() - 0.5));
    m.userData = { vy: 0.02 + Math.random() * 0.03, life: 1 };
    scene.add(m); smokes.push(m);
  }

  // Flame particles (exhaust flames on acceleration)
  const flames = [];
  const flameColors = [0xff4400, 0xff6600, 0xff8800, 0xffaa00, 0xffcc00];
  function spawnFlame(x, y, z) {
    const col = flameColors[Math.floor(Math.random() * flameColors.length)];
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.12 + Math.random() * 0.15, 4, 4),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 }));
    m.position.set(x + (Math.random() - 0.5) * 0.4, y + (Math.random() - 0.5) * 0.2, z + Math.random() * 0.3);
    m.userData = { vx: (Math.random() - 0.5) * 0.02, vy: 0.01 + Math.random() * 0.02, vz: 0.08 + Math.random() * 0.12, life: 1 };
    scene.add(m); flames.push(m);
  }

  // ═══════════════════════════
  //  GAME STATE
  // ═══════════════════════════
  let state = "start";
  let racerName = "", podName = "", score = 0;
  let currentQ = 0, fuel = 100, carZ = 10, baseSpeed = 6, time = 0;
  let timerValue = 30, timerInterval = null;
  let breakdownT = 0, celebrateT = 0, driverOut = false;
  let nextQAt = 0; const Q_INTERVAL_DIST = 120;
  let crashReason = "";
  let bugImmunityUntilZ = -Infinity; // car Z must be below this to be vulnerable
  let flameTimer = 0; // frames remaining for flame effect

  function resetAll() {
    currentQ = 0; score = 0; fuel = 100; carZ = 10; time = 0;
    breakdownT = 0; celebrateT = 0; driverOut = false;
    nextQAt = Q_INTERVAL_DIST; crashReason = "";
    bugImmunityUntilZ = 10 - 30; // immune for first 30 units of travel
    flameTimer = 0;
    currentLane = 2; targetLaneX = LANES[2]; playerX = LANES[2];
    driver.visible = false;
    clearInterval(timerInterval);
    updateFuelBar();
    confetti.forEach(p => scene.remove(p)); confetti.length = 0;
    smokes.forEach(p => scene.remove(p)); smokes.length = 0;
    flames.forEach(p => scene.remove(p)); flames.length = 0;
    spawnTraffic();
    sessionQuestions = pickRandomQuestions(QUESTIONS, 5);
  }

  function updateFuelBar() {
    document.getElementById("fuel-bar").style.width = Math.max(0, fuel) + "%";
    document.getElementById("fuel-pct").textContent = Math.round(Math.max(0, fuel)) + "%";
  }
  function flashFuelBar() {
    const fl = document.getElementById("fuel-flash");
    fl.classList.add("flash"); setTimeout(() => fl.classList.remove("flash"), 200);
  }

  // ═══════════════════════════
  //  COLLISION DETECTION
  // ═══════════════════════════
  function checkBugCollision() {
    if (carZ > bugImmunityUntilZ) return false; // immune near start/standstill
    for (const tc of trafficCars) {
      if (!tc.userData.isBug) continue;
      const dz = Math.abs(tc.position.z - buggy.position.z);
      const dx = Math.abs(tc.position.x - buggy.position.x);
      if (dz < 4 && dx < 2.8) return true;
    }
    return false;
  }

  // ═══════════════════════════
  //  UI LOGIC
  // ═══════════════════════════
  // Form validation
  const racerInput = document.getElementById("racer-name");
  const podInput = document.getElementById("pod-name");
  const startBtn = document.getElementById("start-btn");
  const formHint = document.getElementById("form-hint");

  function validateForm() {
    const valid = racerInput.value.trim().length > 0 && podInput.value.trim().length > 0;
    startBtn.disabled = !valid;
    if (valid) { formHint.textContent = "Ready to race!"; formHint.className = "form-hint ok"; }
    else { formHint.textContent = "Enter both names to begin"; formHint.className = "form-hint"; }
  }
  racerInput.addEventListener("input", validateForm);
  podInput.addEventListener("input", validateForm);

  function startGame() {
    if (!racerInput.value.trim() || !podInput.value.trim()) return;
    racerName = racerInput.value.trim();
    podName = podInput.value.trim();
    initAudio();
    resetAll();
    state = "running";
    startEngineSound();
    document.getElementById("start-screen").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
  }

  function showQuestion() {
    state = "question";
    const q = sessionQuestions[currentQ];
    document.getElementById("q-number").textContent = `Question ${currentQ + 1} / 5`;
    document.getElementById("q-text").textContent = q.question;
    const opts = document.getElementById("q-options");
    opts.innerHTML = "";
    ["A", "B", "C", "D"].forEach((lbl, i) => {
      const btn = document.createElement("button");
      btn.className = "opt-btn";
      btn.textContent = `${lbl}. ${q.options[i]}`;
      btn.addEventListener("click", () => onAnswer(i));
      opts.appendChild(btn);
    });
    document.getElementById("question-bar").classList.remove("hidden");
    timerValue = 30;
    document.getElementById("timer").textContent = timerValue;
    document.getElementById("q-timer").classList.remove("warning");
    // Show top timer
    const topTimer = document.getElementById("top-timer");
    const topTimerVal = document.getElementById("top-timer-value");
    topTimer.classList.add("visible");
    topTimerVal.textContent = timerValue;
    topTimerVal.classList.remove("warning");
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timerValue--;
      document.getElementById("timer").textContent = timerValue;
      topTimerVal.textContent = timerValue;
      if (timerValue <= 10) {
        document.getElementById("q-timer").classList.add("warning");
        topTimerVal.classList.add("warning");
      }
      if (timerValue <= 0) { clearInterval(timerInterval); onAnswer(-1); }
    }, 1000);
  }

  function onAnswer(idx) {
    clearInterval(timerInterval);
    document.getElementById("top-timer").classList.remove("visible");
    const q = sessionQuestions[currentQ];
    const correct = idx === q.correct;
    document.querySelectorAll(".opt-btn").forEach((btn, i) => {
      btn.classList.add("disabled");
      if (i === q.correct) btn.classList.add("correct");
      if (i === idx && !correct) btn.classList.add("wrong");
    });
    const fb = document.getElementById("feedback");
    if (correct) {
      score++;
      fb.textContent = "⛽ REFUELED!"; fb.className = "correct";
      playFuelSound();
      fuel = Math.min(100, fuel + 30);
      flashFuelBar(); updateFuelBar();
      flameTimer = 120; // ~2 seconds of flames on acceleration
      setTimeout(() => {
        fb.className = "hidden";
        document.getElementById("question-bar").classList.add("hidden");
        currentQ++;
        if (currentQ >= 5) { state = "driving_finish"; }
        else { nextQAt = carZ - Q_INTERVAL_DIST; state = "running"; }
      }, 1000);
    } else {
      fb.textContent = idx === -1 ? "⏱️ OUT OF TIME!" : "💥 BREAKDOWN!";
      fb.className = idx === -1 ? "timeout" : "wrong";
      document.getElementById("question-bar").classList.add("hidden");
      crashReason = idx === -1 ? "Time ran out!" : "Wrong answer!";
      playBreakdownSound(); stopEngineSound();
      state = "breakdown"; breakdownT = 0;
      setTimeout(() => { fb.className = "hidden"; }, 2000);
    }
  }

  function triggerBugCrash() {
    crashReason = "You hit a Bug! 🐛";
    playCrashSound(); stopEngineSound();
    document.getElementById("top-timer").classList.remove("visible");
    state = "breakdown"; breakdownT = 0;
    const fb = document.getElementById("feedback");
    fb.textContent = "🐛 BUG CRASH!"; fb.className = "wrong";
    document.getElementById("question-bar").classList.add("hidden");
    setTimeout(() => { fb.className = "hidden"; }, 2000);
  }

  function showEnd(won) {
    state = "ended";
    document.getElementById("hud").classList.add("hidden");
    const t = document.getElementById("end-title");
    t.textContent = won ? "🏆 RACE WON!" : "💥 GAME OVER!";
    t.className = won ? "win" : "lose";
    document.getElementById("end-message").textContent = won
      ? `${racerName} from ${podName} scored ${score}/5 and crossed the finish line!`
      : `${racerName} from ${podName} scored ${score}/5. ${crashReason || "Better luck next time!"}`;
    if (won) playVictorySound(); else playGameOverSound();
    // Save & show leaderboard
    const lb = saveScore(racerName, podName, score);
    renderLeaderboard(lb, racerName);
    document.getElementById("end-screen").classList.remove("hidden");
  }

  // ═══════════════════════════
  //  GAME LOOP
  // ═══════════════════════════
  function animate() {
    requestAnimationFrame(animate);
    time += 0.016;
    const speed = (state === "running" || state === "driving_finish") ? baseSpeed : 0;

    // Fuel drain
    if (state === "running") {
      fuel -= 0.04; updateFuelBar();
      if (fuel <= 0) {
        fuel = 0; updateFuelBar(); crashReason = "Ran out of fuel!";
        playBreakdownSound(); stopEngineSound();
        state = "breakdown"; breakdownT = 0;
      }
    }

    // Lane movement (smooth)
    if (state === "running" || state === "driving_finish" || state === "question") {
      playerX += (targetLaneX - playerX) * 0.12;
    }

    // Movement
    if (state === "running") {
      carZ -= speed * 0.16; setEnginePitch(baseSpeed);
      if (currentQ < 5 && carZ <= nextQAt) showQuestion();
      // Bug collision check
      if (checkBugCollision()) triggerBugCrash();
    } else if (state === "driving_finish") {
      carZ -= speed * 0.16; setEnginePitch(baseSpeed);
      if (checkBugCollision()) triggerBugCrash();
      if (carZ <= FINISH_Z + 15) { stopEngineSound(); state = "celebrating"; celebrateT = 0; }
    } else if (state === "question") {
      carZ -= 0.02; setEnginePitch(1);
      if (checkBugCollision()) { clearInterval(timerInterval); document.getElementById("question-bar").classList.add("hidden"); triggerBugCrash(); }
    } else if (state === "breakdown") {
      breakdownT++;
      if (breakdownT < 90 && breakdownT % 3 === 0) spawnSmoke(buggy.position.x, 2.5, buggy.position.z - 1.5);
      if (breakdownT < 60) buggy.position.x = playerX + (Math.random() - 0.5) * (0.4 - breakdownT * 0.006);
      else buggy.position.x = playerX;
      if (breakdownT > 160) showEnd(false);
    } else if (state === "celebrating") {
      celebrateT++;
      if (celebrateT === 45) {
        driverOut = true; driver.visible = true;
        driver.position.set(buggy.position.x + 3.5, 0, buggy.position.z);
      }
      if (driverOut) {
        driver.lA.rotation.z = Math.sin(time * 5) * 1.3;
        driver.rA.rotation.z = -Math.sin(time * 5 + 1) * 1.3;
        driver.lA.position.y = 0.7 + Math.sin(time * 5) * 0.25;
        driver.rA.position.y = 0.7 + Math.sin(time * 5 + 1) * 0.25;
      }
      if (celebrateT > 45 && celebrateT % 12 === 0 && celebrateT < 280)
        spawnConfetti(driver.position.x, 3.5, driver.position.z, 14);
      if (celebrateT > 320) showEnd(true);
    } else if (state === "start") {
      carZ = 10 + Math.sin(time * 0.3) * 1.5;
      playerX = LANES[2];
    }

    // Update buggy position
    if (state !== "breakdown") buggy.position.x = playerX;
    buggy.position.z = carZ;
    buggy.position.y = Math.sin(time * 3.5) * 0.04;
    buggy.wheels.forEach(w => { w.children[0].rotation.x += speed * 0.04; });
    buggy.rotation.x = speed > 0 ? -0.015 : 0;
    // Tilt on lane change
    const dx = targetLaneX - playerX;
    buggy.rotation.z = -dx * 0.04;

    // Flame exhaust effect after correct answer
    if (flameTimer > 0 && (state === "running" || state === "driving_finish")) {
      flameTimer--;
      if (flameTimer % 2 === 0) {
        spawnFlame(buggy.position.x - 0.5, 0.6, buggy.position.z + 2.8);
        spawnFlame(buggy.position.x + 0.5, 0.6, buggy.position.z + 2.8);
      }
    }

    // Traffic
    trafficCars.forEach(tc => {
      tc.position.z += tc.userData.speed;
      if (tc.position.z > carZ + 80) {
        tc.position.z = carZ - 200 - Math.random() * 100;
        const newLane = Math.floor(Math.random() * LANES.length);
        tc.userData.lane = newLane; tc.userData.laneX = LANES[newLane];
        tc.position.x = LANES[newLane];
      }
    });

    // Camera
    const cx = playerX + 3, cy = 4.5, cz = carZ + 13;
    camera.position.x += (cx - camera.position.x) * 0.06;
    camera.position.y += (cy - camera.position.y) * 0.06;
    camera.position.z += (cz - camera.position.z) * 0.06;
    camera.lookAt(playerX, 1.5, carZ - 10);

    sun.position.set(playerX + 50, 80, carZ - 30);
    sun.target.position.set(playerX, 0, carZ);

    // Particles
    for (let i = confetti.length - 1; i >= 0; i--) {
      const p = confetti[i], d = p.userData;
      p.position.x += d.vx; p.position.y += d.vy; p.position.z += d.vz;
      d.vy -= 0.0025; p.rotation.x += d.rx; p.rotation.z += d.rz; d.life -= 0.004;
      if (d.life <= 0 || p.position.y < -1) { scene.remove(p); confetti.splice(i, 1); }
    }
    for (let i = smokes.length - 1; i >= 0; i--) {
      const p = smokes[i], d = p.userData;
      p.position.y += d.vy; p.scale.multiplyScalar(1.006); d.life -= 0.008;
      p.material.opacity = d.life * 0.4;
      if (d.life <= 0) { scene.remove(p); smokes.splice(i, 1); }
    }
    // Flame particles
    for (let i = flames.length - 1; i >= 0; i--) {
      const p = flames[i], d = p.userData;
      p.position.x += d.vx; p.position.y += d.vy; p.position.z += d.vz;
      d.life -= 0.03; p.scale.multiplyScalar(0.97);
      p.material.opacity = d.life * 0.8;
      if (d.life <= 0) { scene.remove(p); flames.splice(i, 1); }
    }

    // HUD
    const displaySpeed = speed > 0 ? Math.floor(baseSpeed * 25 + Math.sin(time * 2) * 5) : 0;
    document.getElementById("hud-speed").textContent = `🏎️ ${displaySpeed} km/h`;
    document.getElementById("hud-q").textContent = `❓ ${Math.min(score, 5)} / 5`;

    renderer.render(scene, camera);
  }

  // ─── Events ───
  startBtn.addEventListener("click", startGame);
  document.getElementById("restart-btn").addEventListener("click", () => {
    stopEngineSound();
    document.getElementById("end-screen").classList.add("hidden");
    document.getElementById("question-bar").classList.add("hidden");
    document.getElementById("feedback").className = "hidden";
    document.getElementById("hud").classList.add("hidden");
    document.getElementById("top-timer").classList.remove("visible");
    document.getElementById("leaderboard-section").classList.add("hidden");
    document.getElementById("start-screen").classList.remove("hidden");
    resetAll(); state = "start";
  });

  animate();
})();
