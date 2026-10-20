const scenes = [
  {
    id: "entry",
    title: "Entry",
    type: "component",
    image: "assets/references/01-entry.png",
    width: 1448,
    height: 1086,
    component: renderEntryScene,
  },
  {
    id: "login",
    title: "Sign-in Confirmation",
    type: "component",
    image: "assets/references/02-login.png",
    width: 1448,
    height: 1086,
    component: renderLoginScene,
  },
  {
    id: "region",
    title: "Region Filter",
    type: "component",
    image: "assets/references/03-region-filter.png",
    width: 2896,
    height: 2172,
    component: renderRegionScene,
  },
  {
    id: "organization",
    title: "Organization Detail",
    type: "component",
    image: "assets/references/03b-organization-detail.png",
    width: 1448,
    height: 1086,
    component: renderOrganizationScene,
  },
  {
    id: "pets",
    title: "Recommended Pets",
    type: "component",
    image: "assets/references/04-pet-browser.png",
    width: 2896,
    height: 2172,
    component: renderRecommendedPetsScene,
  },
  {
    id: "detail",
    title: "Pet Detail",
    type: "component",
    image: "assets/references/05-pet-detail.png",
    width: 1448,
    height: 1086,
    component: renderPetDetailScene,
  },
  {
    id: "plan",
    title: "Guardian Plan",
    type: "component",
    image: "assets/references/06-guardian-plan.png",
    width: 1447,
    height: 1087,
    component: renderGuardianPlanScene,
  },
  {
    id: "activated",
    title: "Guardian Activated",
    type: "transition",
    image: "assets/guardian-transition/guardian-activated.png",
    width: 1447,
    height: 1087,
  },
  {
    id: "update",
    title: "Today's Update",
    type: "component",
    image: "assets/references/08-update-card.png",
    width: 2896,
    height: 2172,
    component: renderTodayUpdateScene,
  },
  {
    id: "radial",
    title: "Radial Menu",
    type: "component",
    image: "assets/references/09-radial-menu.png",
    width: 2896,
    height: 2172,
    component: renderRadialMenuScene,
  },
  {
    id: "dashboard",
    title: "Guardian Dashboard",
    type: "component",
    image: "assets/references/10-dashboard.png",
    width: 2896,
    height: 2172,
    component: renderDashboardScene,
  },
  {
    id: "pet3d",
    title: "3D Pet Interaction",
    type: "component",
    image: "assets/references/09-radial-menu.png",
    width: 2896,
    height: 2172,
    component: renderPet3DInteractionScene,
  },
];

const sceneRoot = document.querySelector("#sceneRoot");
const FLOW_SCENE_IDS = [
  "entry",
  "login",
  "region",
  "organization",
  "pets",
  "detail",
  "plan",
  "activated",
  "update",
  "radial",
  "dashboard",
];

let currentSceneIndex = 0;
let debugHotspots = false;
let referenceOverlay = false;
let petDetailFavorite = false;
let petDetailMediaMode = "Picture";
let selectedGuardianPlan = "medical";
let radialFeedback = "";
let radialBallSelected = false;
let radialPlayOpen = false;
let dashboardActivePet = "xiao-hua";
let activePet3DController = null;
let guardianTransitionTimer = null;
const prototypeListeners = new AbortController();
window.guardianPrototypeLifecycle.register(() => {
  prototypeListeners.abort();
  clearTimeout(guardianTransitionTimer);
  teardownPet3DLayer();
});

const GUARDIAN_TRANSITION_REDIRECT_DELAY_MS = 2500;
let threeModulesPromise = null;
let mediaPipeVisionPromise = null;

const PET_3D_SCENES = new Set(["pet3d"]);
const PET_3D_MODEL_PATH = "assets/models/dog-animated.glb";
const PET_3D_STATES = ["idle", "attention", "follow", "happy", "play-ready"];

const pet3DSceneConfig = {
  pet3d: {
    center: { x: 0.5, y: 0.6 },
    base: { x: -0.02, y: -0.68, z: 0 },
    height: 0.9,
    idleScale: 0.78,
    followScale: 1.08,
    rotationY: -0.02,
    handRadius: 0.34,
  },
};

function loadThreeModules() {
  if (!threeModulesPromise) {
    threeModulesPromise = Promise.all([import("three"), import("three/addons/loaders/GLTFLoader.js")]).then(
      ([THREE, loaderModule]) => ({
        THREE,
        GLTFLoader: loaderModule.GLTFLoader,
      }),
    );
  }

  return threeModulesPromise;
}

function loadMediaPipeVision() {
  if (!mediaPipeVisionPromise) {
    mediaPipeVisionPromise = import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/vision_bundle.mjs");
  }

  return mediaPipeVisionPromise;
}

function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

class Pet3DController {
  constructor(sceneId, frame, stage) {
    this.sceneId = sceneId;
    this.frame = frame;
    this.stage = stage;
    this.config = pet3DSceneConfig[sceneId];
    this.state = "idle";
    this.stateSource = "startup";
    this.disposed = false;
    this.modelReady = false;
    this.handTrackingReady = false;
    this.handTrackingEnabled = false;
    this.handHistory = [];
    this.followOffset = 0;
    this.targetFollowOffset = 0;
    this.approachProgress = 0;
    this.targetHand = { x: this.config.center.x, y: this.config.center.y };
    this.currentGesture = "none";
    this.cameraStatus = "not requested";
    this.handStatusText = "not detected";
    this.errorText = "none";
    this.lastWaveAt = 0;
    this.lastVideoTime = -1;
    this.animationFrameId = 0;
    this.handFrameId = 0;
    this.stream = null;
    this.resizeObserver = null;
    this.handleResize = this.resize.bind(this);
  }

  async init() {
    this.createElements();

    try {
      const { THREE, GLTFLoader } = await loadThreeModules();
      if (this.disposed) return;

      this.THREE = THREE;
      this.GLTFLoader = GLTFLoader;
      this.setupScene();
      await this.loadModel();
      if (this.disposed) return;

      this.modelReady = true;
      this.frame.classList.add("pet3d-active");
      this.setError("none");
      this.updateStatus("3D pet ready. Alt+1-5 test states.");
      this.animate();
    } catch (error) {
      this.setError(`3D load failed: ${this.formatError(error)}`);
      this.updateStatus("3D model fallback is active.");
      this.disableHandButton();
      console.warn("3D pet layer unavailable:", error);
    }
  }

  createElements() {
    this.layer = document.createElement("div");
    this.layer.className = "pet-3d-layer";
    this.layer.dataset.petState = this.state;

    this.video = document.createElement("video");
    this.video.className = "pet-hand-video";
    this.video.setAttribute("playsinline", "");
    this.video.muted = true;

    this.handPanel = document.createElement("div");
    this.handPanel.className = "pet-hand-panel";

    this.handButton = document.createElement("button");
    this.handButton.className = "pet-hand-toggle";
    this.handButton.type = "button";
    this.handButton.textContent = "Enable Hand Tracking";
    this.handButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.enableHandTracking();
    });

    this.handStatus = document.createElement("span");
    this.handStatus.className = "pet-hand-status";
    this.handStatus.textContent = "3D pet loading...";

    this.debugGrid = document.createElement("div");
    this.debugGrid.className = "pet-debug-grid";
    this.debugRows = {
      camera: this.createDebugRow("camera status", this.cameraStatus),
      hand: this.createDebugRow("hand", this.handStatusText),
      gesture: this.createDebugRow("gesture", this.currentGesture),
      state: this.createDebugRow("pet state", this.state),
      error: this.createDebugRow("error", this.errorText),
    };
    Object.values(this.debugRows).forEach((row) => this.debugGrid.appendChild(row));

    const header = document.createElement("div");
    header.className = "pet-hand-header";
    header.append(this.handButton, this.handStatus);
    this.handPanel.append(header, this.debugGrid);
    this.stage.append(this.layer, this.video, this.handPanel);
    this.updateDebugPanel();
  }

  createDebugRow(label, value) {
    const row = document.createElement("div");
    row.className = "pet-debug-row";
    row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    return row;
  }

  disableHandButton() {
    if (!this.handButton) return;
    this.handButton.disabled = true;
    this.handButton.textContent = "Hand Tracking Unavailable";
  }

  updateStatus(message) {
    if (this.handStatus) {
      this.handStatus.textContent = message;
    }
  }

  formatError(error) {
    if (!error) return "unknown error";
    if (error.name && error.message) return `${error.name}: ${error.message}`;
    if (error.message) return error.message;
    return String(error);
  }

  setError(message) {
    this.errorText = message || "none";
    this.updateDebugPanel();
  }

  updateDebugPanel() {
    if (!this.debugRows) return;

    const values = {
      camera: this.cameraStatus,
      hand: this.handStatusText,
      gesture: this.currentGesture,
      state: this.state,
      error: this.errorText,
    };

    Object.entries(values).forEach(([key, value]) => {
      const row = this.debugRows[key];
      if (row) {
        row.querySelector("strong").textContent = value;
      }
    });
  }

  setupScene() {
    const { THREE } = this;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    this.camera.position.set(0, 0.26, 4);
    this.camera.lookAt(0, -0.38, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.domElement.className = "pet-3d-canvas";
    this.layer.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.modelRoot = new THREE.Group();
    this.modelRoot.position.set(this.config.base.x, this.config.base.y, this.config.base.z);
    this.modelRoot.rotation.y = this.config.rotationY;
    this.scene.add(this.modelRoot);

    const hemisphere = new THREE.HemisphereLight(0xfff7e8, 0x6e6258, 2.15);
    const key = new THREE.DirectionalLight(0xfff2dc, 2.35);
    key.position.set(-2.2, 3.8, 3.6);
    const fill = new THREE.DirectionalLight(0xc9d5ff, 0.9);
    fill.position.set(2.5, 2.2, 2);
    this.scene.add(hemisphere, key, fill);

    this.resize();
    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.layer);
    } else {
      window.addEventListener("resize", this.handleResize);
    }
  }

  loadModel() {
    return new Promise((resolve, reject) => {
      const loader = new this.GLTFLoader();
      loader.load(
        PET_3D_MODEL_PATH,
        (gltf) => {
          if (this.disposed) {
            window.guardianPrototypeLifecycle.disposeObject(gltf.scene);
            resolve();
            return;
          }

          this.prepareModel(gltf);
          resolve();
        },
        undefined,
        reject,
      );
    });
  }

  prepareModel(gltf) {
    const { THREE } = this;
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const modelHeight = size.y || 1;
    const scale = this.config.height / modelHeight;

    model.position.set(-center.x, -box.min.y, -center.z);
    model.scale.setScalar(scale);
    this.headNodes = [];
    this.tailNodes = [];
    model.traverse((node) => {
      const nodeName = node.name.toLowerCase();
      if (nodeName.includes("head") || nodeName.includes("neck")) {
        this.headNodes.push(node);
      }
      if (nodeName.includes("tail")) {
        this.tailNodes.push(node);
      }
      if (node.isMesh) {
        node.castShadow = false;
        node.receiveShadow = false;
        node.frustumCulled = false;
      }
    });

    this.modelRoot.add(model);
    this.mixer = new THREE.AnimationMixer(model);

    if (gltf.animations.length > 0) {
      this.primaryAction = this.mixer.clipAction(gltf.animations[0]);
      this.primaryAction.enabled = true;
      this.primaryAction.play();
    }
  }

  resize() {
    if (!this.renderer || !this.camera || !this.layer) return;

    const rect = this.layer.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const aspect = width / height;

    this.camera.left = -aspect;
    this.camera.right = aspect;
    this.camera.top = 1;
    this.camera.bottom = -1;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  animate() {
    if (this.disposed || !this.renderer || !this.scene || !this.camera) return;

    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;

    if (this.primaryAction) {
      this.primaryAction.timeScale = this.animationSpeedForState();
    }

    if (this.mixer) {
      this.mixer.update(delta);
    }

    this.updateModelMotion(elapsed);
    this.renderer.render(this.scene, this.camera);
  }

  animationSpeedForState() {
    if (this.state === "attention") return 0.35;
    if (this.state === "follow") return 1.2;
    if (this.state === "happy") return 0.72;
    if (this.state === "play-ready") return 1.05;
    return 0.18;
  }

  updateModelMotion(elapsed) {
    if (!this.modelRoot) return;

    const base = this.config.base;
    const bob = this.state === "play-ready" ? Math.sin(elapsed * 5) * 0.008 : Math.sin(elapsed * 1.8) * 0.003;

    this.followOffset += (this.targetFollowOffset - this.followOffset) * 0.08;
    const targetApproach = this.state === "follow" ? 1 : 0;
    this.approachProgress += (targetApproach - this.approachProgress) * 0.045;
    const desiredX = base.x + this.followOffset * (0.3 + this.approachProgress * 0.7);
    const desiredY = base.y + this.approachProgress * 0.12 + bob;

    this.modelRoot.position.x += (desiredX - this.modelRoot.position.x) * 0.1;
    this.modelRoot.position.y += (desiredY - this.modelRoot.position.y) * 0.1;
    this.modelRoot.position.z = base.z;

    const attentionTurn = this.state === "attention" || this.state === "follow" ? -this.followOffset * 0.75 : 0;
    const readyLean = this.state === "play-ready" ? -0.05 : 0;
    this.modelRoot.rotation.y += (this.config.rotationY + attentionTurn - this.modelRoot.rotation.y) * 0.09;
    this.modelRoot.rotation.x += (readyLean - this.modelRoot.rotation.x) * 0.08;

    const stateScale = this.config.idleScale + (this.config.followScale - this.config.idleScale) * this.approachProgress;
    const readyScale = this.state === "play-ready" ? 1.02 : 1;
    this.modelRoot.scale.setScalar(stateScale * readyScale);
    this.updateHeadAndTailMotion(elapsed);
  }

  updateHeadAndTailMotion(elapsed) {
    const handOffsetX = clamp((this.targetHand.x - this.config.center.x) * 1.6, -0.42, 0.42);
    const handOffsetY = clamp((this.targetHand.y - this.config.center.y) * 1.2, -0.28, 0.28);
    const headActive = this.state === "attention" || this.state === "follow";

    (this.headNodes || []).forEach((node, index) => {
      const weight = index === 0 ? 0.6 : 0.18;
      const targetY = headActive ? -handOffsetX * weight : 0;
      const targetX = headActive ? handOffsetY * weight : 0;
      node.rotation.y += (targetY - node.rotation.y) * 0.12;
      node.rotation.x += (targetX - node.rotation.x) * 0.12;
    });

    (this.tailNodes || []).forEach((node, index) => {
      const wag = this.state === "happy" ? Math.sin(elapsed * 18 + index * 0.65) * (0.24 + index * 0.018) : 0;
      node.rotation.y += (wag - node.rotation.y) * 0.18;
      node.rotation.z += (wag * 0.26 - node.rotation.z) * 0.18;
    });
  }

  setState(nextState, source = "manual") {
    if (!PET_3D_STATES.includes(nextState) || this.state === nextState) return;

    this.state = nextState;
    this.stateSource = source;
    if (this.layer) {
      this.layer.dataset.petState = nextState;
    }

    const label = nextState.charAt(0).toUpperCase() + nextState.slice(1);
    this.updateStatus(`${label} state${source === "keyboard" ? " (Alt fallback)" : ""}.`);
    this.updateDebugPanel();
  }

  setFollowTargetFromHand(palmX) {
    const mirroredX = 1 - palmX;
    const offset = (mirroredX - this.config.center.x) * 0.55;
    this.targetFollowOffset = clamp(offset, -0.22, 0.22);
  }

  async enableHandTracking() {
    if (this.handTrackingEnabled || this.disposed) return;

    if (!this.modelReady) {
      this.updateStatus("Wait for the 3D pet to finish loading.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      this.updateStatus("Camera is unavailable in this browser.");
      this.disableHandButton();
      return;
    }

    const host = window.location.hostname;
    const cameraAllowedOrigin = window.isSecureContext || host === "localhost" || host === "127.0.0.1" || host === "::1";
    if (!cameraAllowedOrigin) {
      this.cameraStatus = "blocked: use localhost or https";
      this.setError("Camera permission requires localhost or HTTPS.");
      this.updateDebugPanel();
      return;
    }

    this.handTrackingEnabled = true;
    this.handButton.disabled = true;
    this.handButton.textContent = "Starting Camera...";
    this.cameraStatus = "requesting permission";
    this.setError("none");
    this.updateStatus("Requesting camera permission...");
    this.updateDebugPanel();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });
      if (this.disposed || window.guardianPrototypeLifecycle.exited) { this.stopCamera(); return; }
      this.cameraStatus = "permission granted";
      this.updateStatus("Camera active. Loading hand tracker...");
      this.updateDebugPanel();

      this.video.srcObject = this.stream;
      await this.video.play();
      if (this.disposed) { this.stopCamera(); return; }
      this.cameraStatus = `video ${this.video.videoWidth || "?"}x${this.video.videoHeight || "?"}`;
      this.updateDebugPanel();

      const { FilesetResolver, HandLandmarker } = await loadMediaPipeVision();
      if (this.disposed) return;

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm",
      );
      if (this.disposed) return;
      const detector = await this.createHandLandmarker(HandLandmarker, vision);
      if (this.disposed) { detector.close(); return; }
      this.handLandmarker = detector;
      if (this.errorText === "none") {
        this.setError("none");
      }

      if (this.disposed) return;
      this.handTrackingReady = true;
      this.handButton.textContent = "Hand Tracking Enabled";
      this.handStatusText = "not detected";
      this.currentGesture = "none";
      this.updateStatus("Show your hand near the dog.");
      this.updateDebugPanel();
      this.detectHands();
    } catch (error) {
      if (this.disposed) { this.stopCamera(); return; }
      this.handTrackingEnabled = false;
      this.handButton.disabled = false;
      this.handButton.textContent = "Enable Hand Tracking";
      this.cameraStatus = this.stream ? "camera stopped after error" : "permission/load failed";
      this.setError(this.formatError(error));
      this.updateStatus("Hand tracking failed. See debug error.");
      this.stopCamera();
      console.warn("Hand tracking unavailable:", error);
    }
  }

  async createHandLandmarker(HandLandmarker, vision) {
    const options = (delegate) => ({
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
        delegate,
      },
      runningMode: "VIDEO",
      numHands: 1,
    });

    try {
      return await HandLandmarker.createFromOptions(vision, options("GPU"));
    } catch (gpuError) {
      if (this.disposed) throw gpuError;
      const handLandmarker = await HandLandmarker.createFromOptions(vision, options("CPU"));
      this.setError(`GPU delegate failed; CPU active: ${this.formatError(gpuError)}`);
      return handLandmarker;
    }
  }

  detectHands() {
    if (this.disposed || !this.handTrackingReady || !this.handLandmarker || !this.video) return;

    this.handFrameId = requestAnimationFrame(() => this.detectHands());

    if (this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || this.video.currentTime === this.lastVideoTime) {
      return;
    }

    this.lastVideoTime = this.video.currentTime;
    let result;
    try {
      result = this.handLandmarker.detectForVideo(this.video, performance.now());
    } catch (error) {
      this.handStatusText = "detection error";
      this.setError(`landmark read failed: ${this.formatError(error)}`);
      this.updateDebugPanel();
      return;
    }
    const landmarks = result.landmarks?.[0];

    if (!landmarks) {
      this.handHistory = [];
      this.targetFollowOffset *= 0.92;
      this.handStatusText = "not detected";
      this.currentGesture = "none";
      this.setState("idle", "gesture");
      this.updateDebugPanel();
      return;
    }

    this.handStatusText = `detected (${landmarks.length} landmarks)`;
    this.applyGestureState(landmarks);
  }

  applyGestureState(landmarks) {
    const now = performance.now();
    const palm = this.averageLandmarks(landmarks, [0, 5, 9, 13, 17]);
    const mirroredPalm = { x: 1 - palm.x, y: palm.y };
    this.targetHand = mirroredPalm;
    const nearPet = distance2D(mirroredPalm, this.config.center) < this.config.handRadius;
    const fingers = this.fingerStates(landmarks);
    const extended = Object.values(fingers).filter(Boolean).length;
    const pinch = distance2D(landmarks[4], landmarks[8]) < 0.055;
    const indexPoint = fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
    const openPalm = fingers.index && fingers.middle && fingers.ring && fingers.pinky;
    const wave = this.detectWave(mirroredPalm.x, now);

    this.setFollowTargetFromHand(palm.x);

    if (pinch) {
      this.currentGesture = "pinch";
      this.setState("play-ready", "gesture");
    } else if (wave) {
      this.currentGesture = "left-right wave";
      this.setState("happy", "gesture");
    } else if (openPalm || extended >= 4) {
      this.currentGesture = "open palm";
      this.setState("follow", "gesture");
    } else if (indexPoint) {
      this.currentGesture = "index pointing";
      this.setState("attention", "gesture");
    } else if (nearPet) {
      this.currentGesture = "hand near pet";
      this.setState("attention", "gesture");
    } else {
      this.currentGesture = "hand detected";
      this.setState("idle", "gesture");
    }

    this.updateDebugPanel();
  }

  averageLandmarks(landmarks, indexes) {
    const total = indexes.reduce(
      (sum, index) => ({
        x: sum.x + landmarks[index].x,
        y: sum.y + landmarks[index].y,
      }),
      { x: 0, y: 0 },
    );

    return {
      x: total.x / indexes.length,
      y: total.y / indexes.length,
    };
  }

  fingerStates(landmarks) {
    return {
      index: landmarks[8].y < landmarks[6].y - 0.015,
      middle: landmarks[12].y < landmarks[10].y - 0.015,
      ring: landmarks[16].y < landmarks[14].y - 0.015,
      pinky: landmarks[20].y < landmarks[18].y - 0.015,
    };
  }

  detectWave(palmX, now) {
    this.handHistory.push({ x: palmX, time: now });
    this.handHistory = this.handHistory.filter((point) => now - point.time < 900);

    if (now - this.lastWaveAt < 1200 || this.handHistory.length < 8) {
      return false;
    }

    const xs = this.handHistory.map((point) => point.x);
    const range = Math.max(...xs) - Math.min(...xs);
    if (range < 0.2) return false;

    const recent = this.handHistory.slice(-6);
    const deltas = recent.slice(1).map((point, index) => point.x - recent[index].x);
    const changedDirection = deltas.some((delta) => delta > 0.018) && deltas.some((delta) => delta < -0.018);

    if (changedDirection) {
      this.lastWaveAt = now;
      this.handHistory = [];
      return true;
    }

    return false;
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
    }
  }

  destroy() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.animationFrameId);
    cancelAnimationFrame(this.handFrameId);
    this.stopCamera();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    } else {
      window.removeEventListener("resize", this.handleResize);
    }

    if (this.handLandmarker?.close) {
      this.handLandmarker.close();
    }

    window.guardianPrototypeLifecycle.disposeObject(this.scene);
    this.mixer?.stopAllAction();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }

    this.frame?.classList.remove("pet3d-active");
    this.layer?.remove();
    this.video?.remove();
    this.handPanel?.remove();
  }
}

function currentScene() {
  return scenes[currentSceneIndex];
}

function sceneIndexById(id) {
  return scenes.findIndex((scene) => scene.id === id);
}

function goToScene(id) {
  const nextIndex = sceneIndexById(id);
  if (nextIndex === -1) return;
  currentSceneIndex = nextIndex;
  render();
}

function goToIndex(index) {
  currentSceneIndex = (index + scenes.length) % scenes.length;
  render();
}

function goToFlowIndex(index) {
  const sceneId = FLOW_SCENE_IDS[(index + FLOW_SCENE_IDS.length) % FLOW_SCENE_IDS.length];
  goToScene(sceneId);
}

function goToFlowOffset(offset) {
  const flowIndex = FLOW_SCENE_IDS.indexOf(currentScene().id);
  const baseIndex = flowIndex === -1 ? FLOW_SCENE_IDS.indexOf("dashboard") : flowIndex;
  goToFlowIndex(baseIndex + offset);
}

function nextScene() {
  goToFlowOffset(1);
}

function previousScene() {
  goToFlowOffset(-1);
}

function handleAction(action) {
  if (action.startsWith("go:")) {
    goToScene(action.slice(3));
  }
}

function renderBackIcon() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M29.5 13.5 19 24l10.5 10.5" />
    </svg>
  `;
}

function renderHeartIcon() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 37.5S10.5 29.3 10.5 18.7c0-4.4 3.4-7.7 7.6-7.7 2.6 0 4.7 1.2 5.9 3.1 1.2-1.9 3.3-3.1 5.9-3.1 4.2 0 7.6 3.3 7.6 7.7C37.5 29.3 24 37.5 24 37.5Z" />
    </svg>
  `;
}

function renderShareIcon() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M24 29V10.5" />
      <path d="m16.5 18 7.5-7.5 7.5 7.5" />
      <path d="M16 22.5h-2.5a4 4 0 0 0-4 4v7.8a4 4 0 0 0 4 4h21a4 4 0 0 0 4-4v-7.8a4 4 0 0 0-4-4H32" />
    </svg>
  `;
}

function renderPlanIcon(type) {
  const icons = {
    food: `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M7.5 15.5h17l-2.2 8.3H9.7L7.5 15.5Z" /><path d="M9.8 15.5a6.3 6.3 0 0 1 12.4 0" /><path d="M12.5 12.5c.3-1.9 1.4-3.1 3.5-3.9" /></svg>`,
    shield: `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 5.8 24 9v6.6c0 5.2-3.2 9-8 10.8-4.8-1.8-8-5.6-8-10.8V9l8-3.2Z" /><path d="m12.6 16.1 2.2 2.2 4.8-5" /></svg>`,
    id: `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="6.8" y="9" width="18.4" height="14" rx="2.2" /><circle cx="12.7" cy="15" r="2" /><path d="M9.6 20c.6-1.9 1.6-2.8 3.1-2.8s2.5.9 3.1 2.8" /><path d="M18.7 13.2h3.4M18.7 16.2h3.4M18.7 19.2h2.6" /></svg>`,
    medical: `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6V7Z" /></svg>`,
    heart: `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 25.5S7.5 20.1 7.5 13.6c0-2.9 2.2-5.1 5-5.1 1.7 0 3 .8 3.8 2 .8-1.2 2.1-2 3.8-2 2.8 0 5 2.2 5 5.1 0 6.5-8.5 11.9-8.5 11.9Z" /></svg>`,
  };

  return icons[type] || icons.shield;
}

function renderEntryScene() {
  return `
    <img class="component-bg" src="assets/background/living-room-bg-pre.png" alt="" aria-hidden="true" />
    <div class="component-vignette"></div>
    <section class="real-scene" aria-label="Guardian Space entry">
      <article class="glass-panel entry-panel">
        <div class="entry-icon" aria-hidden="true">
          <svg class="paw-symbol" viewBox="0 0 64 64" focusable="false">
            <circle cx="32" cy="32" r="30" class="symbol-glass" />
            <ellipse cx="19.5" cy="25.5" rx="5.4" ry="7.1" transform="rotate(-22 19.5 25.5)" />
            <ellipse cx="29" cy="19.2" rx="5.4" ry="7.5" transform="rotate(-7 29 19.2)" />
            <ellipse cx="39" cy="19.2" rx="5.4" ry="7.5" transform="rotate(7 39 19.2)" />
            <ellipse cx="48" cy="26.6" rx="5.4" ry="7.1" transform="rotate(22 48 26.6)" />
            <path d="M20.8 43.4c0-8.2 5.3-14.1 11.6-14.1 6.4 0 11.9 5.9 11.9 14.1 0 4.4-3.8 6.7-8.4 5-2.3-.9-4.5-.9-6.9 0-4.5 1.7-8.2-.6-8.2-5Z" />
          </svg>
        </div>
        <h1 class="entry-title">Guardian Space</h1>
        <p class="entry-copy">Connect with real rescued animals through spatial companionship.</p>
        <button class="real-button entry-button" data-action="go:login">Enter Guardian Space</button>
      </article>
    </section>
  `;
}

function renderLoginScene() {
  return `
    <img class="component-bg" src="assets/background/living-room-bg-pre.png" alt="" aria-hidden="true" />
    <div class="component-vignette"></div>
    <section class="real-scene" aria-label="Sign-in confirmation">
      <article class="glass-panel login-panel">
        <h1 class="login-title">Welcome Back</h1>
        <div class="login-avatar" aria-hidden="true">
          <img src="assets/ui/tina-avatar.png" alt="" />
        </div>
        <p class="login-name">Tina</p>
        <div class="login-actions">
          <button class="real-button login-button" data-action="go:region">Continue as Tina</button>
          <button class="real-button login-button secondary" data-action="stay">
            <svg class="button-icon apple-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path d="M20.7 4.1c.2 2.4-1.5 4.6-4.1 5.1-.3-2.2 1.4-4.6 4.1-5.1Z" />
              <path d="M25.8 21.8c-.7 1.8-1.1 2.6-2 4.2-1.3 2.2-3.1 5-5.4 5-2 0-2.6-1.3-5.3-1.3-2.8 0-3.5 1.3-5.4 1.3-2.3 0-4.1-2.6-5.4-4.8C-1.4 19.5 1 10 7.7 9.9c2.6-.1 4.6 1.5 5.4 1.5.9 0 3-1.8 5.8-1.5 1.2.1 4.4.5 6.5 3.5-5.7 3.1-4.8 10-.6 12.4Z" />
            </svg>
            Use Apple ID
          </button>
          <button class="real-button login-button secondary" data-action="stay">
            <svg class="button-icon scan-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path d="M4 11V5h6M22 5h6v6M28 21v6h-6M10 27H4v-6" />
              <rect x="12" y="8" width="4" height="8" rx="1.2" />
              <rect x="18" y="8" width="3.6" height="5.2" rx="1.2" />
              <rect x="10.2" y="18" width="4.2" height="6" rx="1.2" />
              <rect x="16.5" y="15.5" width="5.2" height="8.5" rx="1.2" />
            </svg>
            Scan to Sign In
          </button>
        </div>
      </article>
    </section>
  `;
}

function renderMapIcon() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M9 14.4 19.4 9l9.2 5.4L39 9.4v24.2L28.6 39l-9.2-5.4L9 38.6V14.4Z" />
      <path d="M19.4 9v24.6M28.6 14.4V39" />
    </svg>
  `;
}

function renderPawIcon() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <ellipse cx="15" cy="18" rx="4" ry="5.2" transform="rotate(-24 15 18)" />
      <ellipse cx="22" cy="13" rx="4" ry="5.4" transform="rotate(-8 22 13)" />
      <ellipse cx="30" cy="13" rx="4" ry="5.4" transform="rotate(8 30 13)" />
      <ellipse cx="37" cy="18" rx="4" ry="5.2" transform="rotate(24 37 18)" />
      <path d="M14.4 32.6c0-6.8 4.8-11.4 10.8-11.4 6.1 0 11 4.6 11 11.4 0 3.7-3.2 5.7-7.2 4.4-2.7-.9-5-.9-7.5 0-4 1.3-7.1-.7-7.1-4.4Z" />
    </svg>
  `;
}

function renderUserIcon() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="18" r="6.8" />
      <path d="M12.6 38c1.8-7.1 5.8-10.7 11.4-10.7S33.6 30.9 35.4 38" />
      <circle cx="24" cy="24" r="19" />
    </svg>
  `;
}

function renderHouseIcon() {
  return `
    <svg viewBox="0 0 42 42" aria-hidden="true" focusable="false">
      <path d="M8.5 20.5 21 10l12.5 10.5v13H25v-8h-8v8H8.5v-13Z" />
      <path d="M6.4 21.6 21 9.2l14.6 12.4" />
    </svg>
  `;
}

function renderRegionScene() {
  const cities = ["Fuzhou", "Xiamen", "Quanzhou", "Zhangzhou", "Putian", "Ningde", "Longyan", "Sanming"];
  const provinces = ["Zhejiang Province", "Guangdong Province", "Jiangsu Province", "Sichuan Province"];

  return `
    <img class="component-bg" src="assets/background/living-room-bg-pre.png" alt="" aria-hidden="true" />
    <div class="component-vignette"></div>
    <section class="real-scene traced-scene traced-region-scene" aria-label="Region Filter">
      <div class="trace-stage region-trace-stage">
        <nav class="trace-nav region-trace-nav glass-nav" aria-label="Spatial navigation">
          <button class="trace-nav-button glass-button-secondary active" data-action="stay" aria-label="Map">${renderMapIcon()}</button>
          <button class="trace-nav-button glass-button-secondary" data-action="go:pets" aria-label="Recommended Pets">${renderPawIcon()}</button>
          <button class="trace-nav-button glass-button-secondary" data-action="stay" aria-label="Profile">${renderUserIcon()}</button>
        </nav>

        <article class="glass-panel trace-region-panel">
          <aside class="trace-region-sidebar glass-panel" aria-label="Select Region">
            <h1>Select Region</h1>
            <label class="trace-region-search glass-card">
              <span>Search region</span>
              <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                <circle cx="14" cy="14" r="7.6" />
                <path d="m20 20 6 6" />
              </svg>
            </label>

            <div class="trace-province-group">
              <button class="trace-province-row open" data-action="stay">
                <span>Fujian Province</span>
                <span class="trace-chevron">v</span>
              </button>
              <div class="trace-city-list">
                ${cities
                  .map(
                    (city) => `
                      <button class="trace-city-row${city === "Xiamen" ? " selected glass-chip" : ""}" data-action="stay">
                        <span>${city}</span>
                        ${city === "Xiamen" ? "<strong>13</strong>" : ""}
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </div>

            <div class="trace-province-list">
              ${provinces
                .map(
                  (province) => `
                    <button class="trace-province-row collapsed" data-action="stay">
                      <span>${province}</span>
                      <span class="trace-chevron">&gt;</span>
                    </button>
                  `,
                )
                .join("")}
            </div>
          </aside>

          <section class="trace-map-panel" aria-label="Organization map">
            <header class="trace-map-header glass-panel">
              <h2>Organization</h2>
              <div class="trace-current-label">
                <span>Current Location</span>
                <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
                  <circle cx="20" cy="20" r="9" />
                  <circle class="locator-dot" cx="20" cy="20" r="2.4" />
                  <path d="M20 3v7M20 30v7M3 20h7M30 20h7" />
                </svg>
              </div>
            </header>

            <div class="trace-map-canvas" aria-label="Xiamen organization map">
              <div class="trace-map-roads" aria-hidden="true"></div>
              <div class="trace-search-radius" aria-hidden="true"></div>
              <div class="trace-current-marker" aria-label="Current Location">${renderPawIcon()}</div>

              <button class="trace-org-marker marker-stray marker-soon glass-chip" data-action="stay" aria-label="Xiamen Stray Animal Rescue">
                <span class="trace-marker-icon">${renderHouseIcon()}</span>
                <span class="trace-marker-text">Xiamen Stray<br />Animal Rescue</span>
              </button>
              <button class="trace-org-marker marker-love marker-soon glass-chip" data-action="stay" aria-label="Love Paws Rescue Center">
                <span class="trace-marker-icon">${renderHouseIcon()}</span>
                <span class="trace-marker-text">Love Paws<br />Rescue Center</span>
              </button>
              <button class="trace-org-marker marker-help glass-chip" data-action="go:organization" aria-label="Open Help Tails Shelter">
                <span class="trace-marker-icon">${renderHouseIcon()}</span>
                <span class="trace-marker-text">Help Tails<br />Shelter</span>
              </button>

              <div class="trace-radius-chip glass-chip">Search Radius: 5 km</div>
            </div>
          </section>
        </article>
      </div>
    </section>
  `;
}

function renderOrganizationScene() {
  return `
    <img class="component-bg" src="assets/background/living-room-bg-pre.png" alt="" aria-hidden="true" />
    <div class="component-vignette"></div>
    <section class="real-scene traced-scene traced-organization-scene" aria-label="Organization Detail">
      <div class="trace-stage organization-trace-stage">
        <article class="glass-panel trace-organization-panel">
          <header class="trace-organization-topbar">
            <div class="trace-organization-titlebar">
              <button class="trace-round-button glass-button-secondary" data-action="go:region" aria-label="Back to Region Filter">
                <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false">
                  <path d="m16.8 7.8-6.2 6.2 6.2 6.2" />
                </svg>
              </button>
              <span>Organization Detail</span>
            </div>
            <div class="trace-organization-tools" aria-hidden="true">
              <span class="trace-tool-dot">
                <svg viewBox="0 0 28 28" focusable="false">
                  <path d="M10 9h8v8M18 9 9 18" />
                  <path d="M10 5H7.8A2.8 2.8 0 0 0 5 7.8v12.4A2.8 2.8 0 0 0 7.8 23h12.4a2.8 2.8 0 0 0 2.8-2.8V18" />
                </svg>
              </span>
              <span class="trace-tool-dot">...</span>
            </div>
          </header>

          <div class="trace-organization-grid">
            <section class="trace-organization-copy">
              <h1>Help Tails Shelter</h1>
              <div class="trace-org-tags" aria-label="Organization tags">
                <span>Animal Rescue Shelter</span>
                <span>Verified Organization</span>
                <span>Fujian, China</span>
              </div>

              <section class="trace-about-section">
                <h2>About</h2>
                <p>
                  Help Tails Shelter is a local animal rescue organization dedicated to helping stray dogs and cats in need.
                  We provide them with a safe haven, medical care, recovery support, and warm companionship while working
                  hard to find them loving forever homes.
                </p>
              </section>

              <div class="trace-stat-grid" aria-label="Organization statistics">
                <article class="glass-card">
                  <span class="trace-stat-icon">CAL</span>
                  <small>Established</small>
                  <strong>2020</strong>
                </article>
                <article class="glass-card">
                  <span class="trace-stat-icon">PAW</span>
                  <small>Rescued Animals</small>
                  <strong>200+</strong>
                </article>
                <article class="glass-card">
                  <span class="trace-stat-icon">CARE</span>
                  <small>Available for Adoption</small>
                  <strong>36</strong>
                </article>
                <article class="glass-card">
                  <span class="trace-stat-icon">TEAM</span>
                  <small>Volunteers</small>
                  <strong>18</strong>
                </article>
              </div>

              <section class="trace-info-band glass-card">
                <h2>
                  <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false"><path d="M14 25s8-7 8-14a8 8 0 0 0-16 0c0 7 8 14 8 14Z" /><circle cx="14" cy="11" r="2.8" /></svg>
                  Location
                </h2>
                <strong>Fujian, China</strong>
                <p>Serving nearby communities and surrounding areas</p>
              </section>

              <section class="trace-info-band trace-contact-band glass-card">
                <h2>
                  <svg viewBox="0 0 28 28" aria-hidden="true" focusable="false"><path d="M8 6c2.8 6 8 11.2 14 14l-2.5 3c-.8.9-2.1 1.2-3.2.7C10.2 21 7 17.8 4.3 11.7c-.5-1.1-.2-2.4.7-3.2L8 6Z" /></svg>
                  Contact / Visiting Hours
                </h2>
                <div class="trace-contact-grid">
                  <div>
                    <span>+86 138 0000 0000</span>
                    <span>helptails.shelter@rescue.org</span>
                  </div>
                  <div>
                    <strong>Mon - Sun</strong>
                    <span>09:00 - 17:00</span>
                    <small>Open daily for visits</small>
                  </div>
                </div>
              </section>

              <section class="trace-services-section">
                <h2>Services</h2>
                <div class="trace-service-tags">
                  <span class="glass-chip">Rescue</span>
                  <span class="glass-chip">Medical Care</span>
                  <span class="glass-chip">Foster Support</span>
                  <span class="glass-chip">Adoption Service</span>
                </div>
              </section>
            </section>

            <section class="trace-organization-media" aria-label="Organization photos">
              <div class="trace-photo-main" role="img" aria-label="Help Tails Shelter outdoor rescue area">
                <span>Help Tails Shelter</span>
              </div>
              <div class="trace-thumbnails">
                <div class="trace-thumb thumb-yard" role="img" aria-label="Shelter walkway"></div>
                <div class="trace-thumb thumb-dogs" role="img" aria-label="Rescued dogs"></div>
                <div class="trace-thumb thumb-care" role="img" aria-label="Volunteer care"></div>
              </div>
              <div class="trace-organization-actions">
                <button class="real-button trace-org-primary-action glass-button-primary" data-action="go:pets">
                  ${renderPawIcon()}
                  Browse Pets
                </button>
                <button class="real-button trace-org-secondary-action glass-button-secondary" data-action="go:region">
                  ${renderMapIcon()}
                  Back to Map
                </button>
              </div>
            </section>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderRecommendedPetsScene() {
  const filters = ["All", "Dogs", "Cats", "Birds", "Others"];
  const pets = [
    {
      name: "Milo",
      breed: "Golden Retriever",
      age: "2 years old",
      status: "Medical Recovery",
      image: "assets/pets/recommended/milo.png",
      action: "stay",
    },
    {
      name: "Mimi",
      breed: "Cat",
      age: "1 year old",
      status: "Available",
      image: "assets/pets/recommended/mimi.png",
      action: "stay",
    },
    {
      name: "Buddy",
      breed: "Dog",
      age: "3 years old",
      status: "Shelter Care",
      image: "assets/pets/recommended/buddy.png",
      action: "go:detail",
    },
    {
      name: "Toffee",
      breed: "Cat",
      age: "8 months old",
      status: "Available",
      image: "assets/pets/recommended/toffee.png",
      action: "stay",
    },
    {
      name: "Lulu",
      breed: "Dog",
      age: "4 years old",
      status: "Waiting for Guardian",
      image: "assets/pets/recommended/lulu.png",
      action: "stay",
    },
    {
      name: "Snowball",
      breed: "Cat",
      age: "2 years old",
      status: "Medical Support",
      image: "assets/pets/recommended/snowball.png",
      action: "stay",
    },
  ];

  return `
    <img class="component-bg" src="assets/background/living-room-bg-pre.png" alt="" aria-hidden="true" />
    <div class="component-vignette"></div>
    <section class="real-scene traced-scene traced-pets-scene" aria-label="Recommended Pets">
      <div class="trace-stage pets-trace-stage">
        <nav class="trace-nav pets-trace-nav vertical-nav glass-nav" aria-label="Spatial navigation">
          <button class="trace-nav-button nav-icon glass-button-secondary" data-action="go:region" aria-label="Map">${renderMapIcon()}</button>
          <button class="trace-nav-button nav-icon glass-button-secondary active" data-action="stay" aria-label="Recommended Pets">
            ${renderPawIcon()}
          </button>
          <button class="trace-nav-button nav-icon glass-button-secondary" data-action="stay" aria-label="Profile">${renderUserIcon()}</button>
        </nav>

        <article class="spatial-panel pets-browser-panel">
          <aside class="pets-filter-column glass-card" aria-label="Pet type filter">
            <h2 class="section-title">Pet Type</h2>
            <div class="pets-filter-list">
              ${filters
                .map(
                  (filter) => `
                    <button class="pets-filter-button glass-button-secondary${filter === "All" ? " active" : ""}" data-action="stay">
                      ${filter}
                    </button>
                  `,
                )
                .join("")}
            </div>
          </aside>

          <section class="pets-browser-content" aria-label="Recommended pet browser">
            <header class="pets-browser-header">
              <h1 class="section-title">Recommended Pets</h1>
            </header>

            <div class="recommended-pets-grid" aria-label="Recommended pets">
              ${pets
                .map(
                  (pet) => `
                    <button class="pet-card recommended-pet-card" data-action="${pet.action}" aria-label="${pet.name}, ${pet.breed}">
                      <span class="recommended-pet-media">
                        <img src="${pet.image}" alt="${pet.name}" />
                      </span>
                      <span class="recommended-pet-scrim" aria-hidden="true"></span>
                      <span class="recommended-pet-copy">
                        <strong>${pet.name}</strong>
                        <span>${pet.breed}</span>
                      </span>
                      <span class="recommended-pet-meta">
                        <span>${pet.age}</span>
                        <span class="status-badge">${pet.status}</span>
                      </span>
                    </button>
                  `,
                )
                .join("")}
            </div>
          </section>
        </article>
      </div>
    </section>
  `;
}

function renderPetDetailScene() {
  const mediaModes = [
    {
      label: "Picture",
      icon: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect x="10" y="12" width="28" height="24" rx="4.5" /><path d="m14.5 31 7.2-7.2 5.6 5.6 3.5-3.5 4.7 5.1" /><circle cx="30.5" cy="19.2" r="2.8" /></svg>`,
    },
    {
      label: "Video",
      icon: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="15" /><path d="m21 17.5 10 6.5-10 6.5v-13Z" /></svg>`,
    },
  ];
  const activePetDetailMediaMode = mediaModes.some((mode) => mode.label === petDetailMediaMode)
    ? petDetailMediaMode
    : "Picture";
  const isVideoMode = activePetDetailMediaMode === "Video";

  return `
    <img class="component-bg" src="assets/background/living-room-bg-pre.png" alt="" aria-hidden="true" />
    <div class="component-vignette detail-vignette"></div>
    <section class="real-scene traced-scene traced-detail-scene" aria-label="Pet Detail">
      <div class="trace-stage detail-trace-stage">
        <article class="pet-detail-panel" aria-label="Buddy profile">
          <button class="detail-icon-button detail-back-button" data-action="go:pets" aria-label="Back to Recommended Pets">
            ${renderBackIcon()}
          </button>

          <div class="detail-top-actions" aria-label="Pet actions">
            <button class="detail-icon-button detail-heart-button${petDetailFavorite ? " selected" : ""}" data-detail-action="favorite" aria-label="${petDetailFavorite ? "Remove Buddy from favorites" : "Favorite Buddy"}">
              ${renderHeartIcon()}
            </button>
            <button class="detail-icon-button" data-action="stay" aria-label="Share Buddy">
              ${renderShareIcon()}
            </button>
          </div>

          <section class="pet-detail-copy" aria-label="Buddy information">
            <header class="pet-detail-heading">
              <h1>Buddy</h1>
              <p>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 21s7-6.1 7-12.1A7 7 0 0 0 5 8.9C5 14.9 12 21 12 21Z" />
                  <circle cx="12" cy="8.9" r="2.2" />
                </svg>
                Xiamen, Fujian
              </p>
            </header>

            <div class="pet-detail-info-grid" aria-label="Buddy stats">
              <article class="pet-info-card">
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <rect x="7" y="8.5" width="18" height="17" rx="3.2" />
                  <path d="M11 6v5M21 6v5M7 14h18" />
                  <path d="M12 18h3M17 18h3M12 22h3" />
                </svg>
                <span>Age</span>
                <strong>2 years</strong>
              </article>
              <article class="pet-info-card">
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <circle cx="13.2" cy="18.8" r="6.1" />
                  <path d="M17.6 14.4 24.4 7.6M19.2 7.6h5.2v5.2" />
                </svg>
                <span>Gender</span>
                <strong>Male</strong>
              </article>
              <article class="pet-info-card">
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path d="M10.5 13.5h11l2.7 11H7.8l2.7-11Z" />
                  <path d="M13 13.5c0-3 1.2-5 3-5s3 2 3 5" />
                  <path d="m13.2 18.3 2.8 2.8 3.6-4" />
                </svg>
                <span>Weight</span>
                <strong>28 kg</strong>
              </article>
            </div>

            <section class="pet-detail-text-section">
              <h2>About Me</h2>
              <p>Buddy was rescued near an industrial area and later brought to safety by local volunteers. He is friendly, gentle, and very people-oriented. He enjoys attention, adapts well to calm environments, and is currently in stable health while waiting for a loving forever home.</p>
            </section>

            <section class="pet-detail-text-section">
              <h2>Organization</h2>
              <p>This pet is currently cared for by a local rescue organization dedicated to protecting stray animals, providing medical support, temporary shelter, rehabilitation, and responsible adoption services.</p>
            </section>
          </section>

          <section class="pet-detail-media-column" aria-label="Buddy media">
            <figure class="pet-detail-media-frame">
              ${
                isVideoMode
                  ? `<video src="assets/pets/recommended/buddy-detail-video.mp4" controls preload="metadata" aria-label="Buddy shelter video"></video>`
                  : `<img src="assets/pets/recommended/buddy-detail-new.jpg" alt="Buddy with rescued dogs in the shelter" />`
              }
              <button class="expand-view-pill" data-action="stay" aria-label="Expand View">
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path d="M12.5 7.5h-5v5M19.5 7.5h5v5M7.5 19.5v5h5M24.5 19.5v5h-5" />
                  <path d="m7.8 7.8 6.2 6.2M24.2 7.8 18 14M7.8 24.2l6.2-6.2M24.2 24.2 18 18" />
                </svg>
                Expand View
              </button>
            </figure>

            <button class="adopt-me-button" data-action="go:plan" aria-label="Adopt Me and choose guardian plan">
              <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                <ellipse cx="14.7" cy="19.2" rx="3.8" ry="5" transform="rotate(-18 14.7 19.2)" />
                <ellipse cx="21.4" cy="13.8" rx="3.8" ry="5.4" transform="rotate(-5 21.4 13.8)" />
                <ellipse cx="28.6" cy="13.8" rx="3.8" ry="5.4" transform="rotate(5 28.6 13.8)" />
                <ellipse cx="35.3" cy="19.2" rx="3.8" ry="5" transform="rotate(18 35.3 19.2)" />
                <path d="M15.9 32.2c0-6.7 4.1-11.2 9.1-11.2s9.1 4.5 9.1 11.2c0 3.8-3.2 5.7-7 4.2-1.4-.5-2.8-.5-4.2 0-3.8 1.5-7-.4-7-4.2Z" />
              </svg>
              Adopt Me
            </button>
          </section>
        </article>

        <nav class="pet-media-switcher" aria-label="Pet media type">
          ${mediaModes
            .map(
              (mode) => `
                <button class="media-switch-button${activePetDetailMediaMode === mode.label ? " active" : ""}" data-media-mode="${mode.label}" aria-pressed="${activePetDetailMediaMode === mode.label}">
                  ${mode.icon}
                  <span>${mode.label}</span>
                </button>
              `,
            )
            .join("")}
        </nav>
      </div>
    </section>
  `;
}

function renderGuardianPlanScene() {
  const plans = [
    {
      id: "basic",
      title: "Basic Guardian",
      price: "¥19",
      features: [
        ["food", "Daily food support"],
        ["shield", "Update access"],
        ["id", "Exclusive guardian ID"],
      ],
    },
    {
      id: "medical",
      title: "Medical Support",
      price: "¥69",
      features: [
        ["food", "Daily food support"],
        ["medical", "Medical expense support"],
        ["heart", "Recovery care support"],
        ["shield", "Update access"],
        ["id", "Exclusive guardian ID"],
      ],
    },
  ];

  return `
    <img class="component-bg" src="assets/background/living-room-bg-pre.png" alt="" aria-hidden="true" />
    <div class="component-vignette plan-vignette"></div>
    <section class="real-scene traced-scene traced-plan-scene" aria-label="Guardian Plan">
      <div class="trace-stage plan-trace-stage">
        <article class="guardian-plan-panel" aria-label="Choose Your Guardian Plan">
          <button class="plan-close-button" data-action="go:detail" aria-label="Close Guardian Plan">
            <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path d="M10 10 22 22M22 10 10 22" />
            </svg>
          </button>

          <header class="guardian-plan-heading">
            <h1>Choose Your Guardian Plan</h1>
            <p>Select the plan that best fits your needs.</p>
          </header>

          <div class="guardian-plan-cards" aria-label="Guardian plan options">
            ${plans
              .map((plan) => {
                const selected = selectedGuardianPlan === plan.id;
                return `
                  <button class="guardian-plan-card${selected ? " selected" : ""}" data-plan-option="${plan.id}" aria-pressed="${selected}" aria-label="${plan.title}">
                    ${selected ? `<span class="plan-selected-check" aria-hidden="true"><svg viewBox="0 0 32 32" focusable="false"><path d="m10 16.4 4.1 4.1L22.8 12" /></svg></span>` : ""}
                    <span class="plan-card-title">${plan.title}</span>
                    <span class="plan-price-row"><strong>${plan.price}</strong><span>/ month</span></span>
                    <span class="plan-divider" aria-hidden="true"></span>
                    <span class="plan-feature-list">
                      ${plan.features
                        .map(
                          ([icon, label]) => `
                            <span class="plan-feature">
                              ${renderPlanIcon(icon)}
                              <span>${label}</span>
                            </span>
                          `,
                        )
                        .join("")}
                    </span>
                  </button>
                `;
              })
              .join("")}
          </div>

          <button class="confirm-guardian-button" data-action="go:activated">Confirm Guardian</button>
        </article>
      </div>
    </section>
  `;
}

function renderMenuIcon() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d="M11 15h26M11 24h26M11 33h26" />
    </svg>
  `;
}

function renderPlayIcon() {
  return `
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="29" />
      <path d="m27 21 18 11-18 11V21Z" />
    </svg>
  `;
}

function renderRadialIcon(type) {
  const icons = {
    pet: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M18.2 23.8v-7.2c0-1.9 1.5-3.4 3.4-3.4s3.4 1.5 3.4 3.4v6" /><path d="M25 22V12.5c0-1.9 1.5-3.4 3.4-3.4s3.4 1.5 3.4 3.4v11" /><path d="M31.8 23.5v-7.7c0-1.8 1.5-3.3 3.3-3.3s3.3 1.5 3.3 3.3v14.5c0 6.1-4.9 11-11 11h-2.7c-4.5 0-8.5-2.8-10.2-7l-3.9-9.8c-.7-1.8.1-3.7 1.8-4.5 1.7-.7 3.7 0 4.5 1.7l2.4 5.2" /><path d="M11.8 18.4v-2.2c0-1.8 1.5-3.3 3.3-3.3s3.1 1.4 3.1 3.1" /></svg>`,
    play: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M15 32.3c2.5-3.5 7.2-8.5 13.2-12.5 2.6-1.8 5.9-1.7 7.7.1 1.9 1.9 1.7 5.2-.3 7.7-4.2 5.5-9.4 9.8-13.2 12.2" /><path d="M15.2 32.2 8.8 38.6c-.8.8-.9 2 0 2.8.8.8 2 .8 2.8 0l6.4-6.4" /><circle cx="18.5" cy="30.6" r="5.1" /><path d="M33.5 15.5 38.2 11M38.3 19.5h5.4M29.6 10.8V5.4" /></svg>`,
    feed: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M10 24h28l-3.4 13.8H13.4L10 24Z" /><path d="M15.3 24a8.7 8.7 0 0 1 17.4 0" /><path d="M20.4 18.6c.3-2.8 2-4.6 5.1-5.8" /><path d="M22.2 31.4h3.6M24 29.6v3.6" /></svg>`,
    close: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M14 14 34 34M34 14 14 34" /></svg>`,
    feather: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M11 37c10.2-3.1 17.6-10 24.5-25.5 3.6 9.6-.7 19.2-9.9 23.1" /><path d="M16.4 34.4 10 40.8" /><path d="M25.5 18.5 36.8 14M22.8 24.1l10.5-1.6M19.5 29.5l8.3 1" /></svg>`,
    ball: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="14.5" /><path d="M12.4 20.4c6.1 1.2 11.7-1 15.8-6.6" /><path d="M20.2 37.7c1.2-6.2 5-10.5 11.7-12.9" /><path d="M35.1 31.8c-5.4-3.3-8.4-8-8.9-14" /></svg>`,
  };

  return icons[type] || icons.pet;
}

function renderTodayUpdateScene() {
  return `
    <img class="component-bg" src="assets/background/living-room-bg-post.png" alt="" aria-hidden="true" />
    <div class="component-vignette update-vignette"></div>
    <section class="real-scene traced-scene today-update-scene" aria-label="Today's Update">
      <div class="trace-stage update-trace-stage">
        <button class="update-menu-button" data-action="go:dashboard" aria-label="Open Guardian Dashboard">
          ${renderMenuIcon()}
        </button>

        <img class="update-main-pet" src="assets/pets/main/golden-sit1.png" alt="Buddy, the active golden retriever" />
        <button class="update-pet-zone" data-action="go:radial" aria-label="Open Buddy interaction menu"></button>

        <button class="new-update-bubble" data-action="go:radial" aria-label="Open Buddy interaction menu">
          <span>New Update</span>
        </button>

        <article class="today-update-card" data-action="go:radial" aria-label="Buddy's shelter update">
          <header class="update-card-header">
            <h1>Update</h1>
            <time datetime="PT2H">2h ago</time>
          </header>

          <figure class="update-media-preview">
            <img src="assets/organizations/help-tails-care.png" alt="Shelter volunteer checking Buddy at the rescue kennel" />
            <span class="update-play-button" aria-hidden="true">${renderPlayIcon()}</span>
          </figure>

          <section class="update-note-copy" aria-label="Shelter Note">
            <h2>Shelter Note</h2>
            <p>
              The weather has been getting hotter, so today we gave Buddy a summer grooming session and trimmed his coat.
              He stayed calm while the staff cared for him, rested well afterward, and is settling into the shelter more
              confidently each day.
            </p>
          </section>

          <button class="update-view-more-button" data-action="stay" type="button">View More</button>
        </article>
      </div>
    </section>
  `;
}

function renderRadialMenuScene() {
  const feedbackCopy = {
    happy: "Buddy is happy.",
    ball: "Ball selected.",
    feed: "Confirm food support with the shelter.",
    wand: "Feather Wand selected.",
  };

  return `
    <img class="component-bg" src="assets/background/living-room-bg-post.png" alt="" aria-hidden="true" />
    <div class="component-vignette radial-vignette"></div>
    <section class="real-scene traced-scene radial-menu-scene" aria-label="Pet Interaction Radial Menu">
      <div class="trace-stage radial-trace-stage">
        <button class="update-menu-button radial-dashboard-button" data-action="go:dashboard" aria-label="Open Guardian Dashboard">
          ${renderMenuIcon()}
        </button>

        <div class="radial-ring" aria-hidden="true"></div>
        <div class="radial-floor-marker" aria-hidden="true"></div>
        <img class="radial-main-pet${radialFeedback === "happy" ? " is-happy" : ""}" src="assets/pets/main/golden-sit2.png" alt="Buddy, the active golden retriever" />

        <button class="radial-action radial-action-pet${radialFeedback === "happy" ? " active" : ""}" data-radial-action="happy" type="button" aria-label="Pet Buddy">
          <span class="radial-action-icon">${renderRadialIcon("pet")}</span>
          <span>Pet</span>
        </button>

        <button class="radial-action radial-action-play${radialFeedback === "wand" || radialBallSelected ? " active" : ""}" data-radial-action="play" type="button" aria-label="Show play options">
          <span class="radial-action-icon">${renderRadialIcon("play")}</span>
          <span>Play</span>
        </button>

        <button class="radial-action radial-action-feed${radialFeedback === "feed" ? " active" : ""}" data-radial-action="feed" type="button" aria-label="Open feed support confirmation">
          <span class="radial-action-icon">${renderRadialIcon("feed")}</span>
          <span>Feed</span>
        </button>

        <button class="radial-action radial-action-close" data-action="go:update" type="button" aria-label="Close radial menu and return to today's update">
          <span class="radial-action-icon">${renderRadialIcon("close")}</span>
        </button>

        <div class="radial-play-options${radialPlayOpen ? " is-open" : ""}" aria-label="Play options">
          <button class="radial-play-option${radialFeedback === "wand" ? " active" : ""}" data-radial-action="wand" type="button">
            <span>${renderRadialIcon("feather")}</span>
            Feather Wand
          </button>
          <button class="radial-play-option${radialBallSelected ? " active" : ""}" data-radial-action="ball" type="button">
            <span>${renderRadialIcon("ball")}</span>
            Ball
          </button>
        </div>

        ${
          radialFeedback
            ? `<div class="radial-feedback radial-feedback-${radialFeedback}" role="status">${feedbackCopy[radialFeedback]}</div>`
            : ""
        }
      </div>
    </section>
  `;
}

function renderDashboardIcon(type) {
  const icons = {
    heart: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M24 38S11 30.1 11 19.7c0-4.2 3.2-7.4 7.3-7.4 2.5 0 4.5 1.1 5.7 3 1.2-1.9 3.2-3 5.7-3 4.1 0 7.3 3.2 7.3 7.4C37 30.1 24 38 24 38Z" /></svg>`,
    care: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M13 26h22l-2.8 10.6H15.8L13 26Z" /><path d="M17 26a7 7 0 0 1 14 0" /><path d="M20 21c.4-2.4 1.8-3.9 4.5-4.8" /><path d="M21.5 32h5M24 29.5v5" /></svg>`,
    clock: `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="15" /><path d="M24 15.5V24l6.5 4" /></svg>`,
  };

  return icons[type] || icons.heart;
}

function renderDashboardScene() {
  const companions = [
    {
      id: "xiao-hua",
      name: "Xiao Hua",
      status: "Medical recovery",
      image: "assets/pets/main/golden-avatar.png",
      primary: true,
    },
    {
      id: "mimi",
      name: "Mimi",
      status: "Resting",
      image: "assets/pets/companions/cat1-avatar.png",
    },
    {
      id: "lulu",
      name: "Lulu",
      status: "Calm",
      image: "assets/pets/companions/dog1-avatar.png",
    },
    {
      id: "shadow",
      name: "Shadow",
      status: "Observing",
      image: "assets/pets/companions/cat2-avatar.png",
    },
  ];
  const activeCompanion = companions.find((pet) => pet.id === dashboardActivePet) || companions[0];
  const supportItems = [
    {
      icon: "heart",
      label: "Current Plan",
      value: "Medical Support",
    },
    {
      icon: "care",
      label: "Recent Care",
      value: "Food + recovery care",
    },
    {
      icon: "clock",
      label: "Last Update",
      value: "Today",
    },
  ];

  return `
    <img class="component-bg" src="assets/background/living-room-bg-post.png" alt="" aria-hidden="true" />
    <div class="component-vignette dashboard-vignette"></div>
    <section class="real-scene traced-scene dashboard-scene" aria-label="Guardian Dashboard">
      <div class="trace-stage dashboard-trace-stage">
        <nav class="dashboard-nav glass-nav" aria-label="Dashboard spatial navigation">
          <button class="dashboard-nav-button" data-action="go:region" type="button" aria-label="Room map">${renderMapIcon()}</button>
          <button class="dashboard-nav-button" data-action="go:pets" type="button" aria-label="Companions">${renderPawIcon()}</button>
          <button class="dashboard-nav-button active" data-action="stay" type="button" aria-label="Guardian profile">${renderUserIcon()}</button>
        </nav>

        <img class="dashboard-room-pet" src="assets/pets/main/golden-stand.png" alt="Xiao Hua standing in the guardian room" />
        <div class="dashboard-floor-marker" aria-hidden="true"></div>

        <article class="dashboard-panel" aria-label="Guardian companion dashboard">
          <button class="dashboard-close-button" data-action="go:radial" type="button" aria-label="Return to radial menu">
            ${renderRadialIcon("close")}
          </button>

          <header class="dashboard-header">
            <div class="dashboard-user">
              <span class="dashboard-avatar">
                <img src="assets/ui/tina-avatar.png" alt="" aria-hidden="true" />
              </span>
              <span class="dashboard-user-copy">
                <strong>Tina</strong>
                <span>Your guardian room is active and connected to your rescued companions.</span>
              </span>
            </div>
            <div class="dashboard-days-pill">Supporting for 128 days</div>
          </header>

          <section class="dashboard-companions" aria-label="Companions in Room">
            <h1>Companions in Room</h1>
            <div class="dashboard-card-grid">
              ${companions
                .map((pet) => {
                  const isActive = dashboardActivePet === pet.id;
                  return `
                    <article class="dashboard-pet-card${isActive ? " selected" : ""}${pet.primary ? " primary" : ""}">
                      <button class="dashboard-pet-select" data-dashboard-pet="${pet.id}" type="button" aria-pressed="${isActive}" aria-label="${isActive ? `${pet.name} is active` : `Set ${pet.name} as active`}">
                        <span class="dashboard-pet-photo">
                          <img src="${pet.image}" alt="${pet.name}" />
                        </span>
                        <span class="dashboard-pet-name">${pet.name}</span>
                        <span class="dashboard-pet-status">${pet.status}</span>
                        <span class="dashboard-active-pill">${isActive ? "Active" : "Set as Active"}</span>
                      </button>
                    </article>
                  `;
                })
                .join("")}
            </div>
            <p class="dashboard-active-line">Active Companion: <strong>${activeCompanion.name}</strong></p>
          </section>

          <section class="dashboard-summary" aria-label="Recent Support Summary">
            <h2>Recent Support Summary</h2>
            <div class="dashboard-summary-grid">
              ${supportItems
                .map(
                  (item) => `
                    <article class="dashboard-summary-card">
                      <span class="dashboard-summary-icon">${renderDashboardIcon(item.icon)}</span>
                      <span class="dashboard-summary-copy">
                        <span>${item.label}</span>
                        <strong>${item.value}</strong>
                      </span>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </section>
        </article>
      </div>
    </section>
  `;
}

function renderPet3DInteractionScene() {
  return `
    <img class="component-bg" src="assets/background/living-room-bg-post.png" alt="" aria-hidden="true" />
    <div class="component-vignette pet3d-vignette"></div>
    <section class="real-scene traced-scene pet3d-scene" aria-label="3D Pet Interaction">
      <div class="trace-stage pet3d-trace-stage">
        <button class="pet3d-back-button" data-action="go:dashboard" type="button" aria-label="Back to Guardian Dashboard">
          ${renderBackIcon()}
          <span>Dashboard</span>
        </button>

        <div class="pet3d-room-depth" aria-hidden="true"></div>
        <div class="pet3d-floor-marker" aria-hidden="true"></div>
        <img class="pet-3d-fallback" src="assets/pets/main/golden-lie.png" alt="Xiao Hua resting in the guardian room" />

        <article class="pet3d-intro-panel" aria-label="3D pet gesture test">
          <p>3D Pet Interaction</p>
          <h1>Xiao Hua gesture room</h1>
          <span>Use hand tracking or Alt+1-5 to test states.</span>
        </article>
      </div>
    </section>
  `;
}

function renderHotspots(scene) {
  return (scene.hotspots || [])
    .map(
      (hotspot) => `
        <button
          class="hotspot"
          style="--x:${hotspot.x}; --y:${hotspot.y}; --w:${hotspot.w}; --h:${hotspot.h};"
          data-action="${hotspot.action}"
          aria-label="${hotspot.label}"
          title="${hotspot.label}"
        ></button>
      `,
    )
    .join("");
}

function renderReferenceOverlay(scene) {
  if (scene.type === "transition") return "";
  if (!referenceOverlay) return "";

  return `
    <img class="reference-overlay" src="${scene.image}" alt="" aria-hidden="true" />
    <div class="reference-badge">Reference overlay</div>
  `;
}

function renderSceneContent(scene) {
  if (scene.type === "component") {
    return `${scene.component()}${renderReferenceOverlay(scene)}`;
  }

  if (scene.type === "transition") {
    return `<img class="scene-image guardian-transition-image" src="${scene.image}" alt="${scene.title}" />`;
  }

  return `
    <img class="scene-image" src="${scene.image}" alt="${scene.title}" />
    ${renderHotspots(scene)}
    ${renderReferenceOverlay(scene)}
  `;
}

function teardownPet3DLayer() {
  if (!activePet3DController) return;

  activePet3DController.destroy();
  activePet3DController = null;
}

function mountPet3DLayer(scene) {
  if (!PET_3D_SCENES.has(scene.id)) return;

  const frame = sceneRoot.querySelector(".scene-frame");
  const stage = frame?.querySelector(".trace-stage");
  if (!frame || !stage) return;

  activePet3DController = new Pet3DController(scene.id, frame, stage);
  activePet3DController.init();
}

function render() {
  if (window.guardianPrototypeLifecycle.exited) return;
  teardownPet3DLayer();
  window.clearTimeout(guardianTransitionTimer);
  guardianTransitionTimer = null;

  const scene = currentScene();
  const aspect = scene.width / scene.height;

  document.body.dataset.scene = scene.id;
  sceneRoot.classList.toggle("debug-hotspots", debugHotspots);
  sceneRoot.innerHTML = `
    <div class="scene-frame" style="--scene-aspect:${aspect};" data-scene="${scene.id}" data-type="${scene.type}">
      ${renderSceneContent(scene)}
    </div>
  `;

  mountPet3DLayer(scene);

  if (scene.type === "transition") {
    guardianTransitionTimer = window.setTimeout(() => {
      window.location.href = "gesture-room.html";
    }, GUARDIAN_TRANSITION_REDIRECT_DELAY_MS);
  }
}

document.addEventListener("click", (event) => {
  const favoriteTarget = event.target.closest("[data-detail-action='favorite']");
  if (favoriteTarget) {
    petDetailFavorite = !petDetailFavorite;
    render();
    return;
  }

  const mediaTarget = event.target.closest("[data-media-mode]");
  if (mediaTarget) {
    petDetailMediaMode = mediaTarget.dataset.mediaMode;
    render();
    return;
  }

  const planTarget = event.target.closest("[data-plan-option]");
  if (planTarget) {
    selectedGuardianPlan = planTarget.dataset.planOption;
    render();
    return;
  }

  const radialTarget = event.target.closest("[data-radial-action]");
  if (radialTarget) {
    const radialAction = radialTarget.dataset.radialAction;
    if (radialAction === "play") {
      radialFeedback = "";
      radialPlayOpen = true;
    } else if (radialAction === "ball") {
      radialFeedback = "ball";
      radialBallSelected = true;
      radialPlayOpen = true;
    } else if (radialAction === "wand") {
      radialFeedback = "wand";
      radialBallSelected = false;
      radialPlayOpen = true;
    } else {
      radialFeedback = radialAction;
      radialBallSelected = false;
      radialPlayOpen = false;
    }
    render();
    return;
  }

  const dashboardPetTarget = event.target.closest("[data-dashboard-pet]");
  if (dashboardPetTarget) {
    dashboardActivePet = dashboardPetTarget.dataset.dashboardPet;
    render();
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  handleAction(actionTarget.dataset.action);
}, {signal: prototypeListeners.signal});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (currentScene().type === "transition") {
    event.preventDefault();
    return;
  }

  if (event.altKey && /^[1-5]$/.test(event.key)) {
    event.preventDefault();
    const nextState = PET_3D_STATES[Number(event.key) - 1];
    if (activePet3DController) {
      activePet3DController.currentGesture = `Alt+${event.key} fallback`;
      activePet3DController.setState(nextState, "keyboard");
      activePet3DController.updateDebugPanel();
    }
    return;
  }

  if (key === "h") {
    debugHotspots = !debugHotspots;
    render();
    return;
  }

  if (key === "r") {
    referenceOverlay = !referenceOverlay;
    render();
    return;
  }

  if (key === "g") {
    window.location.href = "gesture-room.html";
    return;
  }

  if (event.key === "ArrowRight") {
    nextScene();
    return;
  }

  if (event.key === "ArrowLeft") {
    previousScene();
    return;
  }

  if (/^[1-9]$/.test(event.key)) {
    goToFlowIndex(Number(event.key) - 1);
    return;
  }

  if (event.key === "0") {
    goToScene("dashboard");
  }
}, {signal: prototypeListeners.signal});

render();
