const MODEL_FILES = {
  idle: "assets/models/dog-static.fbx",
  follow: "assets/models/dog-walk.fbx",
  happy: "assets/models/dog-rest.fbx",
  eating: "assets/models/dog-dig.fbx",
  bark: "assets/models/dog-bark.fbx",
};

const STATE_KEYS = ["idle", "follow", "happy", "eating", "bark"];
const MEDIA_PIPE_VERSION = "0.10.22";
const THREE_VERSION = "0.165.0";
const THREE_MODULE_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.js`;
const FBX_LOADER_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/loaders/FBXLoader.js`;
const TGA_LOADER_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/loaders/TGALoader.js`;
const GLTF_LOADER_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/loaders/GLTFLoader.js`;
const MEDIA_PIPE_IMPORT_URLS = [
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18",
  `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIA_PIPE_VERSION}`,
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest",
];
const HAND_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task";
const DOG_DIFFUSE_TEXTURE_PATH = "assets/models/BigDog_diff.tga";
const ROOM_DOG_HEIGHT = 1.18;
const DOG_FORWARD_ROTATION_Y = -Math.PI / 2;
const ROOM_DOG_X = -0.04;
const ROOM_FLOOR_Y = -1.88;
const ROOM_DOG_Z = -1.75;
const INITIAL_DOG_DEPTH = 0.42;
const DOG_SAFE_X_MIN = -0.68;
const DOG_SAFE_X_MAX = 0.58;
const DOG_SAFE_Z_BACK = -2.48;
const DOG_SAFE_Z_FRONT = -0.78;
const DOG_SCALE_BACK = 0.68;
const DOG_SCALE_FRONT = 1.3;
const DOG_SCREEN_Y_BACK = -1.6;
const DOG_SCREEN_Y_FRONT = -2.1;
const FLOOR_BACK_LEFT = -0.24;
const FLOOR_BACK_RIGHT = 0.26;
const FLOOR_FRONT_LEFT = -0.72;
const FLOOR_FRONT_RIGHT = 0.62;
const FOLLOW_EASE_LERP = 0.035;
const FOLLOW_X_LERP_START = 0.012;
const FOLLOW_X_LERP_FULL = 0.052;
const FOLLOW_DEPTH_LERP_START = 0.008;
const FOLLOW_DEPTH_LERP_FULL = 0.032;
const CURSOR_X_GAIN = 1.48;
const CURSOR_Y_GAIN = 1.64;
const CURSOR_X_OFFSET = 0.01;
const CURSOR_Y_OFFSET = -0.14;
const CURSOR_LERP = 0.28;
const CURSOR_VIEWPORT_MARGIN = 10;
const FOOD_MODEL_PATH = "assets/models/pet-bowl.glb";
const FOOD_PLACE_HOLD_MS = 900;
const FOOD_EAT_MS = 2200;
const FOOD_FADE_MS = 900;
const PLAY_BALL_RADIUS = 0.058;
const PLAY_BALL_GRAB_SCREEN_DISTANCE = 132;
const PLAY_BALL_ROLL_LERP = 0.038;
const PLAY_BALL_REACT_MS = 2200;
const PLAY_BALL_MIN_ROLL_DISTANCE = 0.18;
const PLAY_BALL_MAX_ROLL_DISTANCE = 0.5;
const PLAY_RETURN_DEPTH = 0.82;
const PLAY_RETURN_HOLD_MS = 1400;
const PLAY_BALL_FADE_MS = 800;
const PLAY_PICKUP_MS = 700;
const PLAY_DROP_MS = 700;
const PLAY_PICKUP_SETTLE_MS = 260;
const PLAY_PICKUP_ATTACH_DELAY_MS = 330;
const PLAY_DROP_FLOOR_DELAY_MS = 360;
const pickupDogYOffset = 0.075;
const dropDogYOffset = 0.065;
const mouthBallOffsetX = 0.13;
const mouthBallOffsetY = 0.42;
const mouthBallOffsetZ = 0.07;
const floorBallOffsetY = 0.012;
const BALL_MOUTH_DEPTH_OFFSET = 0.03;
const HAND_DEBUG_QUERY_VALUES = new Set(["1", "true", "on", "yes"]);
const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];

const canvas = document.querySelector("#petCanvas");
const roomStage = document.querySelector(".room-stage");
const video = document.querySelector("#handVideo");
const handDebugPanel = document.querySelector("#handDebugPanel");
const handDebugCanvas = document.querySelector("#handDebugCanvas");
const handDebugCtx = handDebugCanvas?.getContext("2d");
const enableButton = document.querySelector("#enableHandTracking");
const interactButton = document.querySelector("#interactButton");
const backButton = document.querySelector("#backButton");
const statusPanel = document.querySelector(".status-panel");
const radialMenu = document.querySelector("#radialMenu");
const radialOptions = Array.from(document.querySelectorAll("[data-menu-option]"));
const handCursor = document.querySelector("#handCursor");
const interactionToast = document.querySelector("#interactionToast");
const statusEls = {
  camera: document.querySelector("#cameraStatus"),
  hand: document.querySelector("#handStatus"),
  gesture: document.querySelector("#gestureStatus"),
  pet: document.querySelector("#petStateStatus"),
  file: document.querySelector("#currentFileStatus"),
  texture: document.querySelector("#textureStatus"),
  models: document.querySelector("#modelStatus"),
  error: document.querySelector("#errorStatus"),
};

let THREE = null;
let FBXLoader = null;
let TGALoader = null;
let GLTFLoader = null;
let renderer = null;
let scene = null;
let camera = null;
let clock = null;
let loadingManager = null;
let dogTextureLoader = null;
let texturedDogMaterial = null;
let fallbackDogMaterial = null;
let debugDogMaterial = null;
let dogRig = null;
let contactShadow = null;
let foodRoot = null;
let activeModelState = "";
let requestedState = "idle";
let currentPetState = "idle";
let currentControlMode = "pet-control";
let currentInteractionMode = "pet";
let radialMenuOpen = false;
let radialMenuTimer = 0;
let toastTimer = 0;
let menuCooldownUntil = 0;
let lastMenuSelection = "none";
let pettingGestureDetected = false;
let toastType = "none";
let petSuccessToastUntil = 0;
let pinchWasDown = false;
let suppressPetControlUntilPinchRelease = false;
let hoveredMenuOption = null;
let cursorPoint = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
let lastPinchClickDetected = false;
let feedObjectLoaded = false;
let foodFollowingCursor = false;
let foodPlaced = false;
let foodPosition = { x: 0, y: ROOM_FLOOR_Y, z: ROOM_DOG_Z, depth: INITIAL_DOG_DEPTH };
let foodValidSince = 0;
let dogMovingToFood = false;
let eatingActive = false;
let eatingStartedAt = 0;
let foodFadeStartedAt = 0;
let playBallRoot = null;
let playBallMesh = null;
let playBallShadow = null;
let ballVisible = false;
let ballHover = false;
let ballGrabbed = false;
let ballPosition = { x: 0, y: ROOM_FLOOR_Y, z: ROOM_DOG_Z, depth: INITIAL_DOG_DEPTH, screenX: 0.5, screenY: 0.6 };
let ballVelocity = { x: 0, depth: 0 };
let ballTarget = null;
let ballFinalPosition = { x: 0, y: ROOM_FLOOR_Y, z: ROOM_DOG_Z, depth: INITIAL_DOG_DEPTH };
let grabDistance = Infinity;
let dogMovingToBall = false;
let dogReturning = false;
let playCompleted = false;
let playPhase = "idle";
let playReturnTarget = { x: ROOM_DOG_X, y: ROOM_FLOOR_Y, z: ROOM_DOG_Z, depth: PLAY_RETURN_DEPTH };
let playSuccessTriggered = false;
let playPickupSettleStartedAt = 0;
let playPickupStartedAt = 0;
let playDropStartedAt = 0;
let playReactStartedAt = 0;
let playCompleteStartedAt = 0;
let ballFadeStartedAt = 0;
let ballOpacity = 1;
let ballAttachedToDog = false;
let ballCursorHistory = [];
let currentModelFile = "not loaded";
let textureStatus = "not loaded";
let currentGesture = "none";
let cameraStatus = "not requested";
let handStatus = "not detected";
let errorStatus = "none";
let handDebugVisible = false;
let stream = null;
let handLandmarker = null;
let handTrackingReady = false;
let handTrackingStarting = false;
let lastVideoTime = -1;
let animationFrameId = 0;
let handFrameId = 0;
let transitionId = 0;
let happyHoldUntil = 0;
let targetHand = { x: 0.5, y: 0.5 };
let targetDepth = INITIAL_DOG_DEPTH;
let followActive = false;
let attentionActive = false;
let attentionTarget = { x: 0.5, y: 0.5 };
let currentDogPosition = { x: ROOM_DOG_X, y: ROOM_FLOOR_Y, z: ROOM_DOG_Z };
let currentDepth = INITIAL_DOG_DEPTH;
let currentDogScale = DOG_SCALE_BACK + (DOG_SCALE_FRONT - DOG_SCALE_BACK) * INITIAL_DOG_DEPTH;
let followEase = 0;
let followTarget = {
  x: ROOM_DOG_X,
  z: DOG_SAFE_Z_BACK + (DOG_SAFE_Z_FRONT - DOG_SAFE_Z_BACK) * INITIAL_DOG_DEPTH,
  scale: DOG_SCALE_BACK + (DOG_SCALE_FRONT - DOG_SCALE_BACK) * INITIAL_DOG_DEPTH,
  depth: INITIAL_DOG_DEPTH,
};
let headNodes = [];
let tailNodes = [];
let handHistory = [];
let palmDownHistory = [];
let activePreparedModel = null;
let activeBox = null;
let activeBoxHelper = null;
let dogDiffuseTexture = null;
let dogDiffuseLoaded = false;
let dogDiffuseError = "";
let fallbackMaterialActive = false;

const loadedModels = new Map();
const modelLoadStatus = new Map();
let threeModulesPromise = null;
let mediaPipePromise = null;

function updateDebug(overrides = {}) {
  if (overrides.camera !== undefined) cameraStatus = overrides.camera;
  if (overrides.hand !== undefined) handStatus = overrides.hand;
  if (overrides.gesture !== undefined) currentGesture = overrides.gesture;
  if (overrides.pet !== undefined) currentPetState = overrides.pet;
  if (overrides.file !== undefined) currentModelFile = overrides.file;
  if (overrides.texture !== undefined) textureStatus = overrides.texture;
  if (overrides.error !== undefined) errorStatus = overrides.error;

  statusEls.camera.textContent = cameraStatus;
  statusEls.hand.textContent = handStatus;
  statusEls.gesture.textContent = currentGesture;
  statusEls.pet.textContent = currentPetState;
  statusEls.file.textContent = currentModelFile;
  statusEls.texture.textContent = textureStatus;
  statusEls.models.textContent = formatModelStatus();
  statusEls.error.textContent = errorStatus;
}

function formatModelStatus() {
  return STATE_KEYS.map((state) => `${state}:${modelLoadStatus.get(stateModelKey(state)) || "pending"}`).join(" | ");
}

function setModelStatus(modelKey, status) {
  modelLoadStatus.set(modelKey, status);
  updateDebug();
}

function formatError(error) {
  if (!error) return "unknown error";
  const parts = [];
  if (error.name && error.message) return `${error.name}: ${error.message}`;
  if (error.message) parts.push(error.message);
  if (error.type) parts.push(`type:${error.type}`);
  if (error.target?.status) parts.push(`status:${error.target.status}`);
  if (error.target?.statusText) parts.push(`statusText:${error.target.statusText}`);
  if (error.target?.responseURL) parts.push(`url:${error.target.responseURL}`);
  return parts.length ? parts.join(" | ") : String(error);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function mix(start, end, amount) {
  return start + (end - start) * amount;
}

function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function stateModelKey(state) {
  return state;
}

async function importModuleFromUrl(url, label) {
  try {
    return await import(url);
  } catch (error) {
    throw new Error(`${label} import failed: ${url} :: ${formatError(error)}`);
  }
}

function loadThreeModules() {
  if (!threeModulesPromise) {
    threeModulesPromise = Promise.all([
      importModuleFromUrl(THREE_MODULE_URL, "Three.js"),
      importModuleFromUrl(FBX_LOADER_URL, "FBXLoader"),
      importModuleFromUrl(TGA_LOADER_URL, "TGALoader"),
      importModuleFromUrl(GLTF_LOADER_URL, "GLTFLoader"),
    ]).then(
      ([threeModule, loaderModule, tgaModule, gltfModule]) => {
        THREE = threeModule;
        FBXLoader = loaderModule.FBXLoader;
        TGALoader = tgaModule.TGALoader;
        GLTFLoader = gltfModule.GLTFLoader;
      },
    );
  }

  return threeModulesPromise;
}

function loadMediaPipe() {
  if (!mediaPipePromise) {
    mediaPipePromise = loadMediaPipeFromCdns();
  }

  return mediaPipePromise;
}

async function loadMediaPipeFromCdns() {
  const failures = [];

  for (const url of MEDIA_PIPE_IMPORT_URLS) {
    try {
      updateDebug({ camera: `MediaPipe importing: ${url}` });
      const module = await importModuleFromUrl(url, "MediaPipe tasks-vision");

      if (!module.FilesetResolver || !module.HandLandmarker) {
        throw new Error(`Missing FilesetResolver or HandLandmarker export from ${url}`);
      }

      updateDebug({ camera: `MediaPipe imported: ${url}`, error: "none" });
      return {
        FilesetResolver: module.FilesetResolver,
        HandLandmarker: module.HandLandmarker,
        importUrl: url,
        wasmUrl: `${url}/wasm`,
      };
    } catch (error) {
      failures.push(`${url} :: ${formatError(error)}`);
    }
  }

  throw new Error(`MediaPipe Hand Landmarker import failed. Tried: ${failures.join(" || ")}`);
}

async function initThreeScene() {
  if (prototypeDisposed) return;
  updateDebug({ error: "loading Three.js, FBXLoader, TGALoader, and GLTFLoader" });
  await loadThreeModules();
  if (prototypeDisposed) return;

  scene = new THREE.Scene();
  clock = new THREE.Clock();
  camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 0.1, 4.9);
  camera.lookAt(0, -0.88, 0);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  loadingManager = new THREE.LoadingManager();
  dogTextureLoader = new TGALoader(loadingManager);
  loadingManager.addHandler(/\.tga$/i, dogTextureLoader);
  loadingManager.setURLModifier((url) => {
    const normalized = url.replace(/\\/g, "/");
    const fileName = normalized.split("/").pop();
    if (/\.swatch($|\?)/i.test(normalized) || /\.mayaSwatches[\\/]/i.test(normalized)) return url;
    if (!/\.(png|jpe?g|webp|tga|bmp|gif|tiff?)($|\?)/i.test(fileName || normalized) || !fileName) return url;
    return `assets/models/${fileName}`;
  });

  debugDogMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8,
    emissive: 0x202020,
    roughness: 0.58,
    metalness: 0,
    transparent: false,
    opacity: 1,
    side: THREE.DoubleSide,
  });
  texturedDogMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0,
    transparent: false,
    opacity: 1,
    side: THREE.DoubleSide,
  });
  fallbackDogMaterial = new THREE.MeshStandardMaterial({
    color: 0xb98c62,
    emissive: 0x180d05,
    roughness: 0.78,
    metalness: 0,
    transparent: false,
    opacity: 1,
    side: THREE.DoubleSide,
  });

  dogRig = new THREE.Group();
  syncDogRigToPersistentState();
  scene.add(dogRig);
  contactShadow = createContactShadow();
  dogRig.add(contactShadow);
  updateContactShadowForDepth();
  createFoodObject();
  loadFoodObjectModel();
  createPlayBallObject();

  activeBox = new THREE.Box3();
  activeBoxHelper = new THREE.Box3Helper(activeBox, 0xffd6a0);
  activeBoxHelper.visible = false;
  scene.add(activeBoxHelper);

  const ambient = new THREE.AmbientLight(0xffffff, 0.95);
  const hemi = new THREE.HemisphereLight(0xfff6ec, 0x6a6157, 2.6);
  const key = new THREE.DirectionalLight(0xffead2, 3.25);
  key.position.set(-2.4, 4.2, 4.8);
  key.castShadow = true;
  const fill = new THREE.DirectionalLight(0xcfd9ff, 1.25);
  fill.position.set(2.5, 2.2, 2.4);
  const front = new THREE.DirectionalLight(0xffffff, 0.8);
  front.position.set(0, 1.4, 4.5);
  scene.add(ambient, hemi, key, fill, front);

  resizeRenderer();
  window.addEventListener("resize", resizeRenderer);

  loadDogDiffuseTexture();
  await activateState("idle", "startup");
  if (prototypeDisposed) return;
  preloadModels();
  animate();
  updateDebug({ error: "none" });
}

function resizeRenderer() {
  if (!renderer || !camera) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  if (handDebugVisible) clearHandDebugCanvas();
}

async function preloadModels() {
  for (const state of STATE_KEYS) {
    loadModelForState(state).catch((error) => {
      updateDebug({ error: `${state} model preload failed: ${formatError(error)}` });
    });
  }
}

async function loadModelForState(state) {
  const modelKey = stateModelKey(state);
  if (loadedModels.has(modelKey)) return loadedModels.get(modelKey);

  const loader = new FBXLoader(loadingManager);
  const url = MODEL_FILES[state];
  setModelStatus(modelKey, "loading");

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (fbx) => {
        if (prototypeDisposed) {
          window.guardianPrototypeLifecycle.disposeObject(fbx);
          reject(new Error("Prototype closed during model load"));
          return;
        }
        const prepared = prepareFbxModel(fbx, modelKey);
        loadedModels.set(modelKey, prepared);
        dogRig.add(prepared.root);
        setModelStatus(modelKey, "loaded");
        resolve(prepared);
      },
      undefined,
      (error) => {
        setModelStatus(modelKey, "failed");
        reject(new Error(`FBX load failed: ${url} :: ${formatError(error)}`));
      },
    );
  });
}

function prepareFbxModel(fbx, modelKey) {
  const root = new THREE.Group();
  root.name = `${modelKey}-normalized-root`;

  fbx.position.set(0, 0, 0);
  fbx.rotation.set(0, 0, 0);
  fbx.scale.set(1, 1, 1);
  refreshSkinnedMeshes(fbx);

  const initialBox = new THREE.Box3().setFromObject(fbx);
  const initialSize = initialBox.getSize(new THREE.Vector3());
  const maxAxis = Math.max(initialSize.x, initialSize.y, initialSize.z, 0.001);
  const scale = ROOM_DOG_HEIGHT / maxAxis;

  fbx.scale.setScalar(scale);
  refreshSkinnedMeshes(fbx);

  const scaledBox = new THREE.Box3().setFromObject(fbx);
  const center = scaledBox.getCenter(new THREE.Vector3());
  fbx.position.x -= center.x;
  fbx.position.y -= scaledBox.min.y;
  fbx.position.z -= center.z;
  refreshSkinnedMeshes(fbx);

  root.add(fbx);
  root.rotation.y = DOG_FORWARD_ROTATION_Y;
  root.updateMatrixWorld(true);
  root.visible = false;

  const nodes = { head: [], tail: [] };
  fbx.traverse((node) => {
    const name = node.name.toLowerCase();
    if (name.includes("head") || name.includes("neck")) nodes.head.push(node);
    if (name.includes("tail")) nodes.tail.push(node);
    if (node.isMesh || node.isSkinnedMesh) {
      node.visible = true;
      node.castShadow = true;
      node.receiveShadow = true;
      node.frustumCulled = false;
      node.material = dogMaterialForCurrentTexture();
      configureDogMaterial(node.material);
    }
  });

  const finalBox = new THREE.Box3().setFromObject(root);
  const finalSize = finalBox.getSize(new THREE.Vector3());

  const mixer = new THREE.AnimationMixer(fbx);
  const action = fbx.animations.length > 0 ? mixer.clipAction(fbx.animations[0]) : null;
  if (action) {
    action.enabled = true;
    action.play();
  }

  return {
    key: modelKey,
    root,
    source: fbx,
    mixer,
    action,
    nodes,
    bounds: {
      sourceHeight: initialSize.y || 1,
      scale,
      targetHeight: ROOM_DOG_HEIGHT,
      size: finalSize,
    },
    file: modelFileForKey(modelKey),
  };
}

function refreshSkinnedMeshes(object) {
  object.traverse((node) => {
    if (node.isSkinnedMesh && node.skeleton) node.skeleton.update();
  });
  object.updateMatrixWorld(true);
}

function modelFileForKey(modelKey) {
  const entry = Object.entries(MODEL_FILES).find(([state]) => stateModelKey(state) === modelKey);
  return entry ? entry[1] : "unknown";
}

function configureDogMaterial(material) {
  if (!material) return;
  material.transparent = false;
  material.opacity = 1;
  material.side = THREE.DoubleSide;
  material.needsUpdate = true;
}

function createContactShadow() {
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 256;
  shadowCanvas.height = 128;

  const context = shadowCanvas.getContext("2d");
  const gradient = context.createRadialGradient(128, 64, 12, 128, 64, 116);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.46)");
  gradient.addColorStop(0.34, "rgba(0, 0, 0, 0.24)");
  gradient.addColorStop(0.72, "rgba(0, 0, 0, 0.07)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  context.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
  context.save();
  context.scale(1, 0.46);
  context.fillStyle = gradient;
  context.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height / 0.46);
  context.restore();

  const texture = new THREE.CanvasTexture(shadowCanvas);
  texture.needsUpdate = true;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
  });

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.44), material);
  shadow.name = "soft-contact-shadow";
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.02, 0.018, 0.03);
  shadow.renderOrder = -1;
  return shadow;
}

function createFoodObject() {
  foodRoot = new THREE.Group();
  foodRoot.name = "feed-food-root";
  foodRoot.visible = false;
  foodRoot.add(createFallbackFoodBowl());
  scene.add(foodRoot);
}

function createPlayBallObject() {
  playBallRoot = new THREE.Group();
  playBallRoot.name = "play-ball-root";
  playBallRoot.visible = false;

  const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0xdb6f44,
    roughness: 0.52,
    metalness: 0.02,
    emissive: 0x000000,
    emissiveIntensity: 0,
  });
  playBallMesh = new THREE.Mesh(new THREE.SphereGeometry(PLAY_BALL_RADIUS, 32, 18), ballMaterial);
  playBallMesh.name = "play-ball";
  playBallMesh.castShadow = true;
  playBallMesh.receiveShadow = true;
  playBallMesh.position.y = PLAY_BALL_RADIUS;

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 160;
  shadowCanvas.height = 96;
  const context = shadowCanvas.getContext("2d");
  const gradient = context.createRadialGradient(80, 48, 10, 80, 48, 68);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0.28)");
  gradient.addColorStop(0.62, "rgba(0, 0, 0, 0.08)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  playBallShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.1),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    }),
  );
  playBallShadow.name = "play-ball-shadow";
  playBallShadow.rotation.x = -Math.PI / 2;
  playBallShadow.position.y = 0.014;

  playBallRoot.add(playBallShadow, playBallMesh);
  scene.add(playBallRoot);
}

function createFallbackFoodBowl() {
  const group = new THREE.Group();
  group.name = "fallback-food-bowl";

  const bowlMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8c6aa,
    roughness: 0.68,
    metalness: 0.05,
    transparent: true,
    opacity: 1,
  });
  const foodMaterial = new THREE.MeshStandardMaterial({
    color: 0x8f5c35,
    roughness: 0.85,
    metalness: 0,
    transparent: true,
    opacity: 1,
  });

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.12, 36, 1, true), bowlMaterial);
  bowl.name = "fallback-bowl-shell";
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  bowl.position.y = 0.06;

  const food = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.14, 0.035, 32), foodMaterial);
  food.name = "fallback-bowl-food";
  food.castShadow = true;
  food.receiveShadow = true;
  food.position.y = 0.125;

  group.add(bowl, food);
  return group;
}

function loadFoodObjectModel() {
  if (!GLTFLoader || !foodRoot) return;
  const loader = new GLTFLoader(loadingManager);
  loader.load(
    FOOD_MODEL_PATH,
    (gltf) => {
      if (prototypeDisposed) { window.guardianPrototypeLifecycle.disposeObject(gltf.scene); return; }
      const model = normalizeFoodModel(gltf.scene);
      foodRoot.clear();
      foodRoot.add(model);
      feedObjectLoaded = true;
      updateDebug({ error: errorStatus === "none" ? "none" : errorStatus });
    },
    undefined,
    (error) => {
      feedObjectLoaded = false;
      updateDebug({ error: `food model fallback active: ${FOOD_MODEL_PATH} :: ${formatError(error)}` });
    },
  );
}

function normalizeFoodModel(model) {
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.set(1, 1, 1);
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z, 0.001);
  model.scale.setScalar(0.32 / maxAxis);
  model.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(model);
  const center = scaledBox.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= scaledBox.min.y;
  model.position.z -= center.z;

  model.traverse((node) => {
    if (!(node.isMesh || node.isSkinnedMesh)) return;
    node.visible = true;
    node.castShadow = true;
    node.receiveShadow = true;
    node.frustumCulled = false;
    if (node.material) {
      node.material = Array.isArray(node.material) ? node.material.map((material) => material.clone()) : node.material.clone();
      configureFoodMaterial(node.material);
    }
  });

  return model;
}

function configureFoodMaterial(material) {
  if (Array.isArray(material)) {
    material.forEach(configureFoodMaterial);
    return;
  }
  material.transparent = true;
  material.opacity = 1;
  material.depthWrite = true;
  material.needsUpdate = true;
}

function setFoodOpacity(opacity) {
  if (!foodRoot) return;
  foodRoot.traverse((node) => {
    if (!node.material) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((material) => {
      material.transparent = true;
      material.opacity = opacity;
      material.needsUpdate = true;
    });
  });
}

function dogMaterialForCurrentTexture() {
  fallbackMaterialActive = !dogDiffuseLoaded;
  return dogDiffuseLoaded ? texturedDogMaterial : fallbackDogMaterial;
}

function applyDogMaterialToLoadedModels() {
  const material = dogMaterialForCurrentTexture();
  for (const prepared of loadedModels.values()) {
    prepared.source.traverse((node) => {
      if (!(node.isMesh || node.isSkinnedMesh)) return;
      node.material = material;
      configureDogMaterial(node.material);
    });
  }
  updateTextureStatus();
}

function describeTextureLoadError(error) {
  if (!error) return "unknown texture error";
  const parts = [];
  if (error.message) parts.push(error.message);
  if (error.type) parts.push(`type:${error.type}`);
  if (error.target?.status) parts.push(`status:${error.target.status}`);
  if (error.target?.responseURL) parts.push(`url:${error.target.responseURL}`);
  return parts.length ? parts.join(" | ") : String(error);
}

function updateTextureStatus() {
  updateDebug({
    texture: dogDiffuseLoaded
      ? `loaded ${DOG_DIFFUSE_TEXTURE_PATH}`
      : `fallback ${fallbackMaterialActive ? "active" : "ready"}; ${dogDiffuseError || `loading ${DOG_DIFFUSE_TEXTURE_PATH}`}`,
  });
}

function loadDogDiffuseTexture() {
  updateDebug({ texture: `loading ${DOG_DIFFUSE_TEXTURE_PATH}` });

  return new Promise((resolve) => {
    dogTextureLoader.load(
      DOG_DIFFUSE_TEXTURE_PATH,
      (texture) => {
        if (prototypeDisposed) { texture.dispose(); resolve(); return; }
        try {
          dogDiffuseTexture = texture;
          dogDiffuseTexture.colorSpace = THREE.SRGBColorSpace;
          dogDiffuseTexture.wrapS = THREE.RepeatWrapping;
          dogDiffuseTexture.wrapT = THREE.RepeatWrapping;
          dogDiffuseTexture.flipY = true;
          texturedDogMaterial.map = dogDiffuseTexture;
          configureDogMaterial(texturedDogMaterial);
          dogDiffuseLoaded = true;
          dogDiffuseError = "";
          fallbackMaterialActive = false;
          applyDogMaterialToLoadedModels();
          updateTextureStatus();
        } catch (error) {
          dogDiffuseTexture = null;
          texturedDogMaterial.map = null;
          dogDiffuseLoaded = false;
          dogDiffuseError = `BigDog_diff.tga setup failed: ${describeTextureLoadError(error)}`;
          fallbackMaterialActive = true;
          applyDogMaterialToLoadedModels();
          updateTextureStatus();
          updateDebug({ error: dogDiffuseError });
        }
        resolve();
      },
      undefined,
      (error) => {
        dogDiffuseTexture = null;
        texturedDogMaterial.map = null;
        dogDiffuseLoaded = false;
        dogDiffuseError = `BigDog_diff.tga failed: ${describeTextureLoadError(error)}`;
        fallbackMaterialActive = true;
        applyDogMaterialToLoadedModels();
        updateTextureStatus();
        updateDebug({ error: dogDiffuseError });
        resolve();
      },
    );
  });
}

async function activateState(nextState, source = "gesture") {
  if (!STATE_KEYS.includes(nextState)) return;
  preserveDogTransform();
  requestedState = nextState;
  const myTransition = ++transitionId;
  updateDebug({ pet: nextState, gesture: source === "keyboard" ? `Alt fallback: ${nextState}` : currentGesture });

  try {
    const nextModel = await loadModelForState(nextState);
    if (prototypeDisposed || myTransition !== transitionId) return;

    for (const model of loadedModels.values()) {
      model.root.visible = false;
    }

    nextModel.root.visible = true;
    syncDogRigToPersistentState();
    activePreparedModel = nextModel;
    activeModelState = stateModelKey(nextState);
    currentModelFile = MODEL_FILES[nextState];
    headNodes = nextModel.nodes.head;
    tailNodes = nextModel.nodes.tail;
    if (nextModel.action) {
      nextModel.action.reset().play();
      nextModel.action.timeScale = animationSpeedForState(nextState);
    }

    currentPetState = nextState;
    updateDebug({
      pet: nextState,
      file: MODEL_FILES[nextState],
      error:
        errorStatus === "loading Three.js, FBXLoader, TGALoader, and GLTFLoader"
          ? `active ${stateModelKey(nextState)} scale ${nextModel.bounds.scale.toFixed(5)}`
          : errorStatus,
    });
  } catch (error) {
    updateDebug({ error: `${nextState} model failed: ${formatError(error)}` });
  }
}

function requestState(nextState, source = "gesture") {
  if (nextState === "eating" && !["feed", "play"].includes(source)) {
    updateDebug({ gesture: "eating reserved for Feed/Play", hand: dogMovementDebug("eating blocked") });
    return;
  }
  if (source !== "keyboard" && nextState === requestedState && nextState === currentPetState) return;
  activateState(nextState, source);
}

function preserveDogTransform() {
  if (!dogRig) return;
  currentDogScale = dogRig.scale.x || currentDogScale;
  currentDepth = clamp(currentDepth, 0, 1);
  currentDogPosition = {
    x: dogRig.position.x,
    y: screenYForDepth(currentDepth),
    z: dogRig.position.z,
  };
}

function syncDogRigToPersistentState() {
  if (!dogRig) return;
  currentDepth = clamp(currentDepth, 0, 1);
  const xBounds = walkableXBoundsForDepth(currentDepth);
  currentDogPosition.x = clamp(currentDogPosition.x, xBounds.min, xBounds.max);
  currentDogPosition.y = screenYForDepth(currentDepth);
  currentDogPosition.z = clamp(currentDogPosition.z, DOG_SAFE_Z_BACK, DOG_SAFE_Z_FRONT);
  currentDogScale = clamp(currentDogScale, DOG_SCALE_BACK, DOG_SCALE_FRONT);
  dogRig.position.set(currentDogPosition.x, currentDogPosition.y, currentDogPosition.z);
  dogRig.scale.setScalar(currentDogScale);
  updateContactShadowForDepth();
}

function updateContactShadowForDepth() {
  if (!contactShadow) return;
  contactShadow.scale.set(0.84 + currentDepth * 0.38, 0.88 + currentDepth * 0.18, 1);
  if (contactShadow.material) {
    contactShadow.material.opacity = mix(0.32, 0.54, currentDepth);
  }
}

function applyDogActionYOffset(offset) {
  if (!dogRig) return;
  dogRig.position.y = screenYForDepth(currentDepth) + offset;
}

function screenYForDepth(depth) {
  return mix(DOG_SCREEN_Y_BACK, DOG_SCREEN_Y_FRONT, clamp(depth, 0, 1));
}

function walkableXBoundsForDepth(depth) {
  const amount = clamp(depth, 0, 1);
  return {
    min: clamp(mix(FLOOR_BACK_LEFT, FLOOR_FRONT_LEFT, amount), DOG_SAFE_X_MIN, DOG_SAFE_X_MAX),
    max: clamp(mix(FLOOR_BACK_RIGHT, FLOOR_FRONT_RIGHT, amount), DOG_SAFE_X_MIN, DOG_SAFE_X_MAX),
  };
}

function animationSpeedForState(state) {
  if (state === "idle") return 0.08;
  if (state === "follow") return 1.05;
  if (state === "happy") return 0.8;
  if (state === "eating") return 1.0;
  if (state === "bark") return 1.12;
  return 0.8;
}

function animate() {
  if (prototypeDisposed) return;
  animationFrameId = requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  for (const model of loadedModels.values()) {
    model.mixer?.update(delta);
    if (model.action) {
      model.action.timeScale = animationSpeedForState(currentPetState);
    }
  }

  updateDogMotion(elapsed);
  updateActiveBoundingBox();
  renderer.render(scene, camera);
}

function updateActiveBoundingBox() {
  if (!activeBox || !activeBoxHelper || !activePreparedModel?.root?.visible) return;

  activeBox.setFromObject(activePreparedModel.root);
  activeBoxHelper.visible = false;
}

function updateDogMotion(elapsed) {
  if (!dogRig) return;

  if (updateFeedMotion()) {
    updateHeadAndTail(elapsed);
    return;
  }
  if (updatePlayMotion()) {
    updateHeadAndTail(elapsed);
    return;
  }
  updateFollowMovement();
  updateHeadAndTail(elapsed);
}

function updateFeedMotion() {
  updateFoodFade();

  if (dogMovingToFood && foodPlaced) {
    const targetDepth = foodPosition.depth;
    const targetX = foodPosition.x;
    currentDogPosition.x += (targetX - currentDogPosition.x) * 0.045;
    currentDepth += (targetDepth - currentDepth) * 0.04;
    currentDogPosition.z = mix(DOG_SAFE_Z_BACK, DOG_SAFE_Z_FRONT, currentDepth);
    currentDogScale = mix(DOG_SCALE_BACK, DOG_SCALE_FRONT, currentDepth);
    syncDogRigToPersistentState();

    const distance = Math.hypot(currentDogPosition.x - targetX, currentDepth - targetDepth);
    if (distance < 0.045) startEatingAtFood();
    return true;
  }

  if (eatingActive) {
    syncDogRigToPersistentState();
    if (performance.now() - eatingStartedAt >= FOOD_EAT_MS) finishEatingAtFood();
    return true;
  }

  return foodFadeStartedAt > 0;
}

function updatePlayMotion() {
  updatePlayBallFade();
  updateBallRoll();

  if (dogMovingToBall && ballVisible) {
    currentDogPosition.x += (ballPosition.x - currentDogPosition.x) * 0.045;
    currentDepth += (ballPosition.depth - currentDepth) * 0.04;
    currentDogPosition.z = mix(DOG_SAFE_Z_BACK, DOG_SAFE_Z_FRONT, currentDepth);
    currentDogScale = mix(DOG_SCALE_BACK, DOG_SCALE_FRONT, currentDepth);
    syncDogRigToPersistentState();

    const distance = Math.hypot(currentDogPosition.x - ballPosition.x, currentDepth - ballPosition.depth);
    if (distance < 0.052) startPlaySuccessAtBall();
    return true;
  }

  if (playPhase === "pickup") {
    syncDogRigToPersistentState();
    setBallInFrontOnFloor(0.035);
    const now = performance.now();
    if (!playPickupStartedAt) {
      if (now - playPickupSettleStartedAt >= PLAY_PICKUP_SETTLE_MS) {
        playPickupStartedAt = now;
        requestState("eating", "play");
      }
      return true;
    }

    applyDogActionYOffset(pickupDogYOffset);
    if (now - playPickupStartedAt >= PLAY_PICKUP_ATTACH_DELAY_MS) {
      ballAttachedToDog = true;
      attachBallToDogMouth();
    }
    if (now - playPickupStartedAt >= PLAY_PICKUP_MS) {
      startDogReturningWithBall();
    }
    return true;
  }

  if (playPhase === "drop") {
    syncDogRigToPersistentState();
    applyDogActionYOffset(dropDogYOffset);
    if (performance.now() - playDropStartedAt < PLAY_DROP_FLOOR_DELAY_MS) {
      attachBallToDogMouth();
    } else {
      setBallInFrontOnFloor(0.04);
    }
    if (performance.now() - playDropStartedAt >= PLAY_DROP_MS) {
      completePlayReturn();
    }
    return true;
  }

  if (dogReturning) {
    currentDogPosition.x += (playReturnTarget.x - currentDogPosition.x) * 0.04;
    currentDepth += (playReturnTarget.depth - currentDepth) * 0.034;
    currentDogPosition.z = mix(DOG_SAFE_Z_BACK, DOG_SAFE_Z_FRONT, currentDepth);
    currentDogScale = mix(DOG_SCALE_BACK, DOG_SCALE_FRONT, currentDepth);
    syncDogRigToPersistentState();
    attachBallToDogMouth();

    const distance = Math.hypot(currentDogPosition.x - playReturnTarget.x, currentDepth - playReturnTarget.depth);
    if (distance < 0.045) startDropBallAtReturn();
    return true;
  }

  if (playPhase === "complete") {
    if (ballVisible && !ballFadeStartedAt && performance.now() - playCompleteStartedAt >= PLAY_RETURN_HOLD_MS) {
      startPlayBallFade();
    }
    return true;
  }

  return Boolean(ballTarget) || playPhase !== "idle";
}

function updateFollowMovement() {
  if (!dogRig) return;

  if (followActive && currentPetState === "follow") {
    followEase += (1 - followEase) * FOLLOW_EASE_LERP;
    const xLerp = mix(FOLLOW_X_LERP_START, FOLLOW_X_LERP_FULL, followEase);
    const depthLerp = mix(FOLLOW_DEPTH_LERP_START, FOLLOW_DEPTH_LERP_FULL, followEase);

    currentDogPosition.x += (followTarget.x - currentDogPosition.x) * xLerp;
    currentDepth += (followTarget.depth - currentDepth) * depthLerp;
    currentDogPosition.z = mix(DOG_SAFE_Z_BACK, DOG_SAFE_Z_FRONT, currentDepth);
    currentDogScale = mix(DOG_SCALE_BACK, DOG_SCALE_FRONT, currentDepth);
    syncDogRigToPersistentState();
    return;
  }

  preserveDogTransform();
  syncDogRigToPersistentState();
}

function setFollowTargetFromHand(hand) {
  const handX = clamp(hand.x, 0, 1);
  const handY = clamp(hand.y, 0, 1);
  const depth = clamp((handY - 0.16) / 0.68, 0, 1);
  const xBounds = walkableXBoundsForDepth(depth);

  targetHand = { x: handX, y: handY };
  targetDepth = depth;
  followTarget = {
    x: mix(xBounds.min, xBounds.max, handX),
    z: mix(DOG_SAFE_Z_BACK, DOG_SAFE_Z_FRONT, depth),
    scale: mix(DOG_SCALE_BACK, DOG_SCALE_FRONT, depth),
    depth,
  };
}

function freezeFollowTargetAtCurrentDog() {
  preserveDogTransform();
  followActive = false;
  followEase = 0;
}

function clearAttention() {
  attentionActive = false;
}

function dogMovementDebug(prefix) {
  const floorBounds = walkableXBoundsForDepth(currentDepth);
  const foodSummary = `${foodPosition.x.toFixed(2)},${foodPosition.y.toFixed(2)},${foodPosition.z.toFixed(2)}`;
  const ballSummary = `${ballPosition.x.toFixed(2)},${ballPosition.y.toFixed(2)},${ballPosition.z.toFixed(2)}`;
  const ballVelocitySummary = `${ballVelocity.x.toFixed(2)},${ballVelocity.depth.toFixed(2)}`;
  const ballFinalSummary = `${ballFinalPosition.x.toFixed(2)},${ballFinalPosition.y.toFixed(2)},${ballFinalPosition.z.toFixed(2)}`;
  const dogSummary = `${currentDogPosition.x.toFixed(2)},${currentDogPosition.y.toFixed(2)},${currentDogPosition.z.toFixed(2)}`;
  return (
    `${prefix} handX:${targetHand.x.toFixed(2)} handY:${targetHand.y.toFixed(2)} ` +
    `targetX:${followTarget.x.toFixed(2)} targetDepth:${followTarget.depth.toFixed(2)} ` +
    `currentDogX:${currentDogPosition.x.toFixed(2)} currentDepth:${currentDepth.toFixed(2)} ` +
    `currentScale:${currentDogScale.toFixed(2)} floor:${floorBounds.min.toFixed(2)}..${floorBounds.max.toFixed(2)} ` +
    `currentControlMode:${currentControlMode} radialOpen:${radialMenuOpen ? "true" : "false"} ` +
    `cursor:${Math.round(cursorPoint.x)},${Math.round(cursorPoint.y)} hovered:${hoveredTargetLabel()} ` +
    `currentInteractionMode:${currentInteractionMode} menuCooldownActive:${isMenuCooldownActive() ? "true" : "false"} ` +
    `playPhase:${playPhase} ` +
    `lastMenuSelection:${lastMenuSelection} pettingGestureDetected:${pettingGestureDetected ? "true" : "false"} ` +
    `toastType:${toastType} pinchAsUIClick:${lastPinchClickDetected ? "true" : "false"} ` +
    `feedObjectLoaded:${feedObjectLoaded ? "true" : "false"} foodFollowingCursor:${foodFollowingCursor ? "true" : "false"} ` +
    `foodPlaced:${foodPlaced ? "true" : "false"} foodPosition:${foodSummary} ` +
    `dogMovingToFood:${dogMovingToFood ? "true" : "false"} eatingActive:${eatingActive ? "true" : "false"} ` +
    `ballVisible:${ballVisible ? "true" : "false"} ballHover:${ballHover ? "true" : "false"} ` +
    `ballGrabbed:${ballGrabbed ? "true" : "false"} grabDistance:${Number.isFinite(grabDistance) ? grabDistance.toFixed(0) : "n/a"} ` +
    `grabRadius:${PLAY_BALL_GRAB_SCREEN_DISTANCE} ballPosition:${ballSummary} ballVelocity:${ballVelocitySummary} ` +
    `ballFinalPosition:${ballFinalSummary} dogPosition:${dogSummary} ` +
    `dogMovingToBall:${dogMovingToBall ? "true" : "false"} dogReturning:${dogReturning ? "true" : "false"} ` +
    `ballAttachedToDog:${ballAttachedToDog ? "true" : "false"} ` +
    `playCompleted:${playCompleted ? "true" : "false"} playSuccessTriggered:${playSuccessTriggered ? "true" : "false"}`
  );
}

function isMenuCooldownActive(now = performance.now()) {
  return now < menuCooldownUntil;
}

function hoveredTargetLabel() {
  if (!hoveredMenuOption) return "none";
  if (hoveredMenuOption === interactButton) return "interact";
  return hoveredMenuOption.dataset?.menuOption || "unknown";
}

function shouldStartWithHandDebug() {
  const params = new URLSearchParams(window.location.search);
  const debugValue = params.get("handDebug");
  return HAND_DEBUG_QUERY_VALUES.has((debugValue || "").toLowerCase());
}

function toggleDebugPanel(force) {
  const shouldShow = force ?? !statusPanel.classList.contains("debug-visible");
  statusPanel.classList.toggle("debug-visible", shouldShow);
  setHandDebugMode(shouldShow);
}

function setHandDebugMode(visible) {
  handDebugVisible = Boolean(visible);
  roomStage?.classList.toggle("hand-debug-visible", handDebugVisible);
  handDebugPanel?.setAttribute("aria-hidden", String(!handDebugVisible));
  if (!handDebugVisible) clearHandDebugCanvas();
}

function resizeHandDebugCanvas() {
  if (!handDebugCanvas || !handDebugCtx) return null;
  const rect = handDebugCanvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * pixelRatio));
  const height = Math.max(1, Math.round(rect.height * pixelRatio));

  if (handDebugCanvas.width !== width || handDebugCanvas.height !== height) {
    handDebugCanvas.width = width;
    handDebugCanvas.height = height;
  }

  handDebugCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  return { width: rect.width, height: rect.height };
}

function clearHandDebugCanvas() {
  const size = resizeHandDebugCanvas();
  if (!size || !handDebugCtx) return;
  handDebugCtx.clearRect(0, 0, size.width, size.height);
}

function drawHandDebug(landmarks) {
  if (!handDebugVisible || !handDebugCtx) return;

  const size = resizeHandDebugCanvas();
  if (!size) return;
  handDebugCtx.clearRect(0, 0, size.width, size.height);
  if (!landmarks?.length) return;

  const pointFor = (landmark) => ({
    x: (1 - clamp(landmark.x, 0, 1)) * size.width,
    y: clamp(landmark.y, 0, 1) * size.height,
  });

  handDebugCtx.lineCap = "round";
  handDebugCtx.lineJoin = "round";
  handDebugCtx.lineWidth = 3;
  handDebugCtx.strokeStyle = "rgba(118, 210, 183, 0.94)";
  handDebugCtx.shadowColor = "rgba(0, 0, 0, 0.28)";
  handDebugCtx.shadowBlur = 8;

  HAND_CONNECTIONS.forEach(([startIndex, endIndex]) => {
    const start = landmarks[startIndex];
    const end = landmarks[endIndex];
    if (!start || !end) return;
    const from = pointFor(start);
    const to = pointFor(end);
    handDebugCtx.beginPath();
    handDebugCtx.moveTo(from.x, from.y);
    handDebugCtx.lineTo(to.x, to.y);
    handDebugCtx.stroke();
  });

  handDebugCtx.shadowBlur = 0;
  landmarks.forEach((landmark, index) => {
    const point = pointFor(landmark);
    const isTip = [4, 8, 12, 16, 20].includes(index);
    handDebugCtx.beginPath();
    handDebugCtx.arc(point.x, point.y, isTip ? 5 : 3.8, 0, Math.PI * 2);
    handDebugCtx.fillStyle = isTip ? "rgba(255, 237, 176, 0.98)" : "rgba(236, 255, 248, 0.96)";
    handDebugCtx.fill();
    handDebugCtx.lineWidth = 1.5;
    handDebugCtx.strokeStyle = "rgba(20, 26, 23, 0.48)";
    handDebugCtx.stroke();
  });
}

function openRadialMenu(source = "ui") {
  if (radialMenuOpen) resetRadialMenuTimer();
  radialMenuOpen = true;
  currentControlMode = "menu-selection";
  freezeFollowTargetAtCurrentDog();
  clearAttention();
  radialMenu.classList.add("is-open");
  radialMenu.setAttribute("aria-hidden", "false");
  updateDebug({ gesture: `menu selection mode (${source})`, hand: dogMovementDebug("menu open") });
  resetRadialMenuTimer();
}

function closeRadialMenu() {
  radialMenuOpen = false;
  currentControlMode = "pet-control";
  hoveredMenuOption = null;
  radialMenu.classList.remove("is-open");
  radialMenu.setAttribute("aria-hidden", "true");
  radialOptions.forEach((option) => option.classList.remove("is-hovered"));
  clearTimeout(radialMenuTimer);
  updateDebug({ gesture: "pet control mode", hand: dogMovementDebug("menu closed") });
}

function resetRadialMenuTimer() {
  clearTimeout(radialMenuTimer);
  radialMenuTimer = window.setTimeout(() => {
    if (radialMenuOpen) closeRadialMenu();
  }, 5000);
}

function selectRadialOption(option) {
  const value = option?.dataset.menuOption;
  if (!value) return;

  if (value !== "close") {
    setInteractionMode(value, "menu");
  }

  if (pinchWasDown) startPostMenuCooldown();
  closeRadialMenu();
}

function startPostMenuCooldown() {
  menuCooldownUntil = performance.now() + 800;
  suppressPetControlUntilPinchRelease = true;
  freezeFollowTargetAtCurrentDog();
  clearAttention();
}

function showInstructionToast(mode) {
  clearTimeout(toastTimer);
  const messages = {
    pet: "Use your open palm to pet Buddy.",
    feed: "Place the food on the floor for Buddy.",
    play: "Grab the ball and throw it for Buddy.",
  };
  showToast(messages[mode] || "Buddy is ready.", "instruction");
}

function showSuccessToast(mode) {
  const messages = {
    pet: "Buddy looks happy when you pet him.",
    feed: "Buddy enjoyed today's meal.",
    play: "Buddy is excited to play with you.",
  };
  showToast(messages[mode] || "Buddy feels cared for.", "success");
}

function showToast(message, type) {
  clearTimeout(toastTimer);
  toastType = type;
  interactionToast.textContent = message;
  interactionToast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    interactionToast.classList.remove("is-visible");
    toastType = "none";
    updateDebug();
  }, 2000);
}

function updateHandCursor(point, pinching) {
  const mapped = mapHandPointToViewport(point);
  cursorPoint.x += (mapped.x - cursorPoint.x) * CURSOR_LERP;
  cursorPoint.y += (mapped.y - cursorPoint.y) * CURSOR_LERP;
  handCursor.style.left = `${cursorPoint.x}px`;
  handCursor.style.top = `${cursorPoint.y}px`;
  handCursor.classList.add("is-visible");
  handCursor.classList.toggle("is-pinching", pinching);
  return { x: cursorPoint.x, y: cursorPoint.y };
}

function mapHandPointToViewport(point) {
  const normalizedX = clamp((point.x - 0.5) * CURSOR_X_GAIN + 0.5 + CURSOR_X_OFFSET, 0, 1);
  const normalizedY = clamp((point.y - 0.5) * CURSOR_Y_GAIN + 0.5 + CURSOR_Y_OFFSET, 0, 1);
  return {
    x: clamp(normalizedX * window.innerWidth, CURSOR_VIEWPORT_MARGIN, window.innerWidth - CURSOR_VIEWPORT_MARGIN),
    y: clamp(normalizedY * window.innerHeight, CURSOR_VIEWPORT_MARGIN, window.innerHeight - CURSOR_VIEWPORT_MARGIN),
  };
}

function foodFloorPointFromCursor(point = cursorPoint) {
  const sx = clamp(point.x / window.innerWidth, 0, 1);
  const sy = clamp(point.y / window.innerHeight, 0, 1);
  const depth = clamp((sy - 0.44) / 0.42, 0, 1);
  const xBounds = walkableXBoundsForDepth(depth);
  return {
    x: mix(xBounds.min, xBounds.max, sx),
    y: screenYForDepth(depth),
    z: mix(DOG_SAFE_Z_BACK, DOG_SAFE_Z_FRONT, depth),
    depth,
    screenX: sx,
    screenY: sy,
  };
}

function foodFloorScreenBounds(depth) {
  return {
    min: mix(0.36, 0.14, depth),
    max: mix(0.63, 0.86, depth),
  };
}

function isValidFoodPlacement(point) {
  const bounds = foodFloorScreenBounds(point.depth);
  return point.screenY >= 0.46 && point.screenY <= 0.88 && point.screenX >= bounds.min && point.screenX <= bounds.max;
}

function startFeedPlacement() {
  cleanupFoodObject();
  foodFollowingCursor = true;
  foodPlaced = false;
  dogMovingToFood = false;
  eatingActive = false;
  foodFadeStartedAt = 0;
  foodValidSince = 0;
  if (foodRoot) {
    foodRoot.visible = true;
    setFoodOpacity(1);
    updateFoodTransform(foodFloorPointFromCursor());
  }
}

function handleFeedPlacement(indexPoint, pinching) {
  updateHandCursor(indexPoint, pinching);
  if (!foodRoot || foodPlaced || dogMovingToFood || eatingActive) return false;

  foodFollowingCursor = true;
  const point = foodFloorPointFromCursor();
  updateFoodTransform(point);

  if (isValidFoodPlacement(point)) {
    if (!foodValidSince) foodValidSince = performance.now();
    if (performance.now() - foodValidSince >= FOOD_PLACE_HOLD_MS) {
      placeFoodAt(point);
    }
  } else {
    foodValidSince = 0;
  }

  updateDebug({ hand: dogMovementDebug(`feed placing valid:${isValidFoodPlacement(point) ? "true" : "false"}`) });
  return true;
}

function updateFoodTransform(point) {
  foodPosition = point;
  if (!foodRoot) return;
  foodRoot.position.set(point.x, point.y, point.z);
  foodRoot.scale.setScalar(mix(0.8, 1.18, point.depth));
  foodRoot.rotation.y += (0.1 - foodRoot.rotation.y) * 0.12;
}

function placeFoodAt(point = foodFloorPointFromCursor()) {
  if (!foodRoot) return;
  updateFoodTransform(point);
  foodRoot.visible = true;
  foodFollowingCursor = false;
  foodPlaced = true;
  foodValidSince = 0;
  dogMovingToFood = true;
  eatingActive = false;
  foodFadeStartedAt = 0;
  freezeFollowTargetAtCurrentDog();
  clearAttention();
  requestState("follow", "feed");
  updateDebug({ gesture: "food placed", hand: dogMovementDebug("food placed") });
}

function startEatingAtFood() {
  dogMovingToFood = false;
  eatingActive = true;
  eatingStartedAt = performance.now();
  requestState("eating", "feed");
  showSuccessToast("feed");
  updateDebug({ gesture: "eating", hand: dogMovementDebug("dog eating") });
}

function finishEatingAtFood() {
  eatingActive = false;
  requestState("idle", "feed");
  foodFadeStartedAt = performance.now();
  updateDebug({ gesture: "finished eating", hand: dogMovementDebug("food cleanup") });
}

function updateFoodFade() {
  if (!foodRoot || !foodFadeStartedAt) return;
  const progress = clamp((performance.now() - foodFadeStartedAt) / FOOD_FADE_MS, 0, 1);
  setFoodOpacity(1 - progress);
  if (progress >= 1) cleanupFoodObject();
}

function cleanupFoodObject() {
  foodFollowingCursor = false;
  foodPlaced = false;
  dogMovingToFood = false;
  eatingActive = false;
  foodFadeStartedAt = 0;
  foodValidSince = 0;
  if (foodRoot) {
    foodRoot.visible = false;
    setFoodOpacity(1);
  }
}

function isFeedInteractionActive() {
  return (
    currentInteractionMode === "feed" &&
    (foodFollowingCursor || foodPlaced || dogMovingToFood || eatingActive || foodFadeStartedAt > 0)
  );
}

function handleFeedInteraction(indexPoint, pinching) {
  if (foodFollowingCursor && !foodPlaced && !dogMovingToFood && !eatingActive) {
    return handleFeedPlacement(indexPoint, pinching);
  }

  updateHandCursor(indexPoint, pinching);
  freezeFollowTargetAtCurrentDog();
  clearAttention();
  updateDebug({ hand: dogMovementDebug("feed active"), gesture: eatingActive ? "feeding / eating" : "food placed" });
  return true;
}

function floorPointFromCursor(point = cursorPoint) {
  return foodFloorPointFromCursor(point);
}

function floorPointFromXDepth(x, depth) {
  const safeDepth = clamp(depth, 0, 1);
  const xBounds = walkableXBoundsForDepth(safeDepth);
  const safeX = clamp(x, xBounds.min, xBounds.max);
  const screenBounds = foodFloorScreenBounds(safeDepth);
  return {
    x: safeX,
    y: screenYForDepth(safeDepth),
    z: mix(DOG_SAFE_Z_BACK, DOG_SAFE_Z_FRONT, safeDepth),
    depth: safeDepth,
    screenX: mix(screenBounds.min, screenBounds.max, (safeX - xBounds.min) / Math.max(xBounds.max - xBounds.min, 0.001)),
    screenY: 0.44 + safeDepth * 0.42,
  };
}

function startPlayMode() {
  cleanupPlayObject();
  ballTarget = null;
  ballGrabbed = false;
  ballVelocity = { x: 0, depth: 0 };
  dogMovingToBall = false;
  dogReturning = false;
  playCompleted = false;
  playPhase = "ball-ready";
  playSuccessTriggered = false;
  playPickupSettleStartedAt = 0;
  playPickupStartedAt = 0;
  playDropStartedAt = 0;
  playReactStartedAt = 0;
  playCompleteStartedAt = 0;
  ballFadeStartedAt = 0;
  ballAttachedToDog = false;
  ballCursorHistory = [];
  spawnPlayBall();
}

function spawnPlayBall(point = null) {
  const defaultPoint = floorPointFromXDepth(currentDogPosition.x + 0.18, clamp(currentDepth + 0.06, 0, 1));
  const nextPoint = point || (handTrackingReady ? floorPointFromCursor() : defaultPoint);
  setBallTransform(nextPoint);
  ballVisible = true;
  ballHover = false;
  ballGrabbed = false;
  ballTarget = null;
  ballVelocity = { x: 0, depth: 0 };
  ballFinalPosition = floorPointFromXDepth(nextPoint.x, nextPoint.depth);
  grabDistance = Infinity;
  dogMovingToBall = false;
  dogReturning = false;
  playCompleted = false;
  playPhase = "ball-ready";
  playSuccessTriggered = false;
  playPickupSettleStartedAt = 0;
  playPickupStartedAt = 0;
  playDropStartedAt = 0;
  playReactStartedAt = 0;
  playCompleteStartedAt = 0;
  ballFadeStartedAt = 0;
  ballAttachedToDog = false;
  ballCursorHistory = [];
  setBallOpacity(1);
  if (playBallRoot) {
    playBallRoot.visible = true;
  }
  updateDebug({ gesture: "play ball ready", hand: dogMovementDebug("ball spawned") });
}

function setBallTransform(point) {
  ballPosition = floorPointFromXDepth(point.x, point.depth);
  if (!playBallRoot) return;
  const depthScale = mix(0.74, 1.02, ballPosition.depth);
  const feedbackScale = ballGrabbed ? 1.18 : ballHover ? 1.1 : 1;
  playBallRoot.position.set(ballPosition.x, ballPosition.y, ballPosition.z);
  playBallRoot.scale.setScalar(depthScale * feedbackScale);
  if (playBallShadow) playBallShadow.visible = true;
  if (playBallShadow?.material) {
    playBallShadow.material.opacity = mix(0.18, 0.3, ballPosition.depth) * ballOpacity;
  }
  if (playBallShadow) {
    playBallShadow.scale.setScalar(mix(0.72, 1, ballPosition.depth));
  }
  updateBallVisualFeedback();
}

function attachBallToDogMouth() {
  if (!playBallRoot) return;
  const carryDepth = clamp(currentDepth + BALL_MOUTH_DEPTH_OFFSET, 0, 1);
  const carryPoint = floorPointFromXDepth(currentDogPosition.x + mouthBallOffsetX * currentDogScale, carryDepth);
  ballPosition = carryPoint;
  const depthScale = mix(0.74, 1.02, carryPoint.depth);
  playBallRoot.visible = true;
  playBallRoot.position.set(carryPoint.x, dogRig.position.y + currentDogScale * mouthBallOffsetY, carryPoint.z + mouthBallOffsetZ);
  playBallRoot.scale.setScalar(depthScale * 0.96);
  if (playBallShadow) playBallShadow.visible = false;
  updateBallVisualFeedback();
}

function setBallInFrontOnFloor(depthOffset = 0.035) {
  const point = floorPointFromXDepth(currentDogPosition.x + mouthBallOffsetX * 0.7, clamp(currentDepth + depthOffset, 0, 1));
  setBallTransform(point);
  if (playBallRoot) {
    playBallRoot.position.y += floorBallOffsetY;
  }
}

function updateBallVisualFeedback() {
  if (!playBallMesh?.material) return;
  playBallMesh.material.emissive.setHex(ballGrabbed || ballHover ? 0xffc08a : 0x000000);
  playBallMesh.material.emissiveIntensity = ballGrabbed ? 0.34 : ballHover ? 0.18 : 0;
  playBallMesh.material.transparent = ballOpacity < 1;
  playBallMesh.material.opacity = ballOpacity;
  playBallMesh.material.needsUpdate = true;
}

function updateBallHoverFromCursor() {
  grabDistance = cursorDistanceToBall();
  ballHover =
    playPhase === "ball-ready" &&
    ballVisible &&
    !ballGrabbed &&
    !ballTarget &&
    !dogMovingToBall &&
    !playReactStartedAt &&
    grabDistance <= PLAY_BALL_GRAB_SCREEN_DISTANCE;
  if (ballVisible) {
    setBallTransform(ballPosition);
  }
}

function setBallOpacity(opacity) {
  ballOpacity = clamp(opacity, 0, 1);
  updateBallVisualFeedback();
  if (playBallShadow?.material) {
    playBallShadow.material.opacity = mix(0.18, 0.3, ballPosition.depth) * ballOpacity;
    playBallShadow.material.needsUpdate = true;
  }
}

function cursorDistanceToBall() {
  const ballX = ballPosition.screenX * window.innerWidth;
  const ballY = ballPosition.screenY * window.innerHeight;
  return Math.hypot(cursorPoint.x - ballX, cursorPoint.y - ballY);
}

function recordBallCursorPoint(point) {
  const now = performance.now();
  ballCursorHistory.push({ ...point, time: now });
  ballCursorHistory = ballCursorHistory.filter((entry) => now - entry.time <= 520);
}

function grabPlayBall(point) {
  ballGrabbed = true;
  ballHover = true;
  ballAttachedToDog = false;
  ballTarget = null;
  ballVelocity = { x: 0, depth: 0 };
  dogMovingToBall = false;
  dogReturning = false;
  playPhase = "grabbed";
  playReactStartedAt = 0;
  playSuccessTriggered = false;
  recordBallCursorPoint(point);
  setBallTransform(point);
  freezeFollowTargetAtCurrentDog();
  clearAttention();
  updateDebug({ gesture: "ball grabbed", hand: dogMovementDebug("play grab") });
}

function releasePlayBall(forceForward = false) {
  if (!ballVisible || playCompleted) return;
  ballGrabbed = false;
  ballHover = false;
  ballAttachedToDog = false;
  const now = performance.now();
  const recent = ballCursorHistory.find((entry) => now - entry.time >= 150) || ballCursorHistory[0] || ballPosition;
  let deltaX = ballPosition.x - recent.x;
  let deltaDepth = ballPosition.depth - recent.depth;
  const screenMovement = Math.hypot(ballPosition.screenX - recent.screenX, ballPosition.screenY - recent.screenY);
  const floorMovement = Math.hypot(deltaX, deltaDepth);
  if (forceForward || screenMovement < 0.018 || floorMovement < 0.025) {
    deltaX = 0;
    deltaDepth = 1;
  } else {
    const length = Math.hypot(deltaX, deltaDepth) || 1;
    deltaX /= length;
    deltaDepth /= length;
  }
  const throwDistance = forceForward ? 0.28 : clamp(screenMovement * 2.4 + floorMovement * 0.65, PLAY_BALL_MIN_ROLL_DISTANCE, PLAY_BALL_MAX_ROLL_DISTANCE);
  ballVelocity = {
    x: clamp(deltaX * throwDistance, -0.42, 0.42),
    depth: clamp(deltaDepth * throwDistance, -0.34, 0.42),
  };
  ballTarget = floorPointFromXDepth(ballPosition.x + ballVelocity.x, ballPosition.depth + ballVelocity.depth);
  ballFinalPosition = ballTarget;
  playPhase = "thrown";
  ballCursorHistory = [];
  updateBallVisualFeedback();
  updateDebug({ gesture: "ball released", hand: dogMovementDebug("play throw") });
}

function updateBallRoll() {
  if (!ballTarget || !ballVisible || ballGrabbed) return;
  const nextX = ballPosition.x + (ballTarget.x - ballPosition.x) * PLAY_BALL_ROLL_LERP;
  const nextDepth = ballPosition.depth + (ballTarget.depth - ballPosition.depth) * PLAY_BALL_ROLL_LERP;
  const previous = ballPosition;
  setBallTransform(floorPointFromXDepth(nextX, nextDepth));
  ballVelocity = { x: ballPosition.x - previous.x, depth: ballPosition.depth - previous.depth };
  if (playBallMesh) {
    playBallMesh.rotation.x += Math.abs(ballVelocity.depth) * 18;
    playBallMesh.rotation.z -= ballVelocity.x * 18;
  }
  const distance = Math.hypot(ballTarget.x - ballPosition.x, ballTarget.depth - ballPosition.depth);
  if (distance < 0.018) {
    setBallTransform(ballTarget);
    ballTarget = null;
    ballVelocity = { x: 0, depth: 0 };
    ballFinalPosition = ballPosition;
    startDogMovingToBall();
  }
}

function startDogMovingToBall() {
  if (!ballVisible || dogMovingToBall || playSuccessTriggered) return;
  dogMovingToBall = true;
  playPhase = "dog-to-ball";
  freezeFollowTargetAtCurrentDog();
  clearAttention();
  requestState("follow", "play");
  updateDebug({ gesture: "dog moving to ball", hand: dogMovementDebug("play fetch") });
}

function startPlaySuccessAtBall() {
  if (playSuccessTriggered) return;
  dogMovingToBall = false;
  playSuccessTriggered = true;
  ballAttachedToDog = false;
  playPhase = "pickup";
  playPickupSettleStartedAt = performance.now();
  playPickupStartedAt = 0;
  freezeFollowTargetAtCurrentDog();
  clearAttention();
  requestState("idle", "play");
  setBallInFrontOnFloor(0.035);
  updateDebug({ gesture: "ball pickup", hand: dogMovementDebug("dog picking up ball") });
}

function startDogReturningWithBall() {
  dogMovingToBall = false;
  dogReturning = true;
  ballAttachedToDog = true;
  playPhase = "returning";
  playPickupStartedAt = 0;
  playReactStartedAt = 0;
  playReturnTarget = floorPointFromXDepth(clamp(currentDogPosition.x * 0.45, -0.34, 0.34), PLAY_RETURN_DEPTH);
  freezeFollowTargetAtCurrentDog();
  clearAttention();
  requestState("follow", "play");
  updateDebug({ gesture: "dog returning with ball", hand: dogMovementDebug("play return") });
}

function startDropBallAtReturn() {
  dogReturning = false;
  dogMovingToBall = false;
  ballAttachedToDog = false;
  playPhase = "drop";
  playDropStartedAt = performance.now();
  freezeFollowTargetAtCurrentDog();
  clearAttention();
  requestState("eating", "play");
  setBallTransform(floorPointFromXDepth(currentDogPosition.x + 0.1, clamp(currentDepth + 0.02, 0, 1)));
  updateDebug({ gesture: "ball drop", hand: dogMovementDebug("dog dropping ball") });
}

function completePlayReturn() {
  dogReturning = false;
  dogMovingToBall = false;
  ballAttachedToDog = false;
  playCompleted = true;
  playPhase = "complete";
  playCompleteStartedAt = performance.now();
  playDropStartedAt = 0;
  ballVelocity = { x: 0, depth: 0 };
  showSuccessToast("play");
  requestState("bark", "play");
  interactionResetTimer = window.setTimeout(() => {
    if (playPhase === "complete") requestState("idle", "play");
  }, 900);
  updateDebug({ gesture: "play complete", hand: dogMovementDebug("play complete") });
}

function startPlayBallFade() {
  if (!ballVisible || ballFadeStartedAt) return;
  ballFadeStartedAt = performance.now();
}

function updatePlayBallFade() {
  if (!ballFadeStartedAt || !ballVisible) return;
  const progress = clamp((performance.now() - ballFadeStartedAt) / PLAY_BALL_FADE_MS, 0, 1);
  setBallOpacity(1 - progress);
  if (progress >= 1) {
    ballVisible = false;
    ballHover = false;
    ballGrabbed = false;
    ballTarget = null;
    ballVelocity = { x: 0, depth: 0 };
    ballFadeStartedAt = 0;
    if (playBallRoot) playBallRoot.visible = false;
    setBallOpacity(1);
    updateDebug({ gesture: "ball hidden after play", hand: dogMovementDebug("play ball hidden") });
  }
}

function cleanupPlayObject() {
  ballVisible = false;
  ballHover = false;
  ballGrabbed = false;
  ballTarget = null;
  ballVelocity = { x: 0, depth: 0 };
  ballFinalPosition = ballPosition;
  grabDistance = Infinity;
  dogMovingToBall = false;
  dogReturning = false;
  playCompleted = false;
  playPhase = "idle";
  playSuccessTriggered = false;
  playPickupSettleStartedAt = 0;
  playPickupStartedAt = 0;
  playDropStartedAt = 0;
  playReactStartedAt = 0;
  playCompleteStartedAt = 0;
  ballFadeStartedAt = 0;
  ballAttachedToDog = false;
  setBallOpacity(1);
  ballCursorHistory = [];
  if (playBallShadow) playBallShadow.visible = true;
  if (playBallRoot) playBallRoot.visible = false;
}

function isPlayInteractionActive() {
  return (
    currentInteractionMode === "play" &&
    (playPhase !== "idle" || ballVisible || ballGrabbed || Boolean(ballTarget) || dogMovingToBall || dogReturning || playReactStartedAt > 0)
  );
}

function handlePlayInteraction(indexPoint, pinching) {
  updateHandCursor(indexPoint, pinching);
  if (!playBallRoot) return false;
  if (playCompleted) {
    freezeFollowTargetAtCurrentDog();
    clearAttention();
    updateDebug({ hand: dogMovementDebug("play complete waiting for new menu selection"), gesture: "play complete" });
    return true;
  }
  if (!ballVisible) spawnPlayBall();

  const point = floorPointFromCursor();
  if (ballGrabbed) {
    if (pinching) {
      recordBallCursorPoint(point);
      setBallTransform(point);
      updateDebug({ hand: dogMovementDebug("ball following cursor"), gesture: "ball grabbed" });
      return true;
    }
    releasePlayBall();
    return true;
  }

  updateBallHoverFromCursor();

  if (pinching && ballHover) {
    grabPlayBall(point);
    return true;
  }

  freezeFollowTargetAtCurrentDog();
  clearAttention();
  updateDebug({ hand: dogMovementDebug(`play mode ballDistance:${grabDistance.toFixed(0)}`), gesture: ballHover ? "ball hover" : "play mode" });
  return true;
}

function hideHandCursor() {
  handCursor.classList.remove("is-visible", "is-pinching");
}

function optionAtPoint(point) {
  return radialOptions.find((option) => {
    const rect = option.getBoundingClientRect();
    return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
  });
}

function pointInsideElement(point, element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

function updateMenuHover(option) {
  if (hoveredMenuOption === option) return;
  hoveredMenuOption = option;
  radialOptions.forEach((item) => item.classList.toggle("is-hovered", item === option));
}

function handleRadialMenuGesture(indexPoint, pinching) {
  freezeFollowTargetAtCurrentDog();
  clearAttention();
  const cursorPoint = updateHandCursor(indexPoint, pinching);
  const option = optionAtPoint(cursorPoint);
  updateMenuHover(option || null);
  lastPinchClickDetected = pinching && !pinchWasDown && Boolean(option);
  updateDebug({ hand: dogMovementDebug(`menu cursor pinch:${pinching ? "true" : "false"} option:${option?.dataset.menuOption || "none"}`) });

  if (option) resetRadialMenuTimer();
  if (lastPinchClickDetected && option) selectRadialOption(option);
  pinchWasDown = pinching;
}

function tryOpenMenuFromHand(indexPoint, pinching) {
  const cursorPoint = updateHandCursor(indexPoint, pinching);
  const hitInteract = pointInsideElement(cursorPoint, interactButton);
  interactButton.classList.toggle("is-hovered", hitInteract);
  hoveredMenuOption = hitInteract ? interactButton : null;
  lastPinchClickDetected = pinching && !pinchWasDown && hitInteract;

  if (lastPinchClickDetected) {
    pinchWasDown = true;
    openRadialMenu("hand");
    return true;
  }

  pinchWasDown = pinching;
  return false;
}

function updateHeadAndTail(elapsed) {
  const handOffsetX = clamp((attentionTarget.x - 0.5) * 1.4, -0.42, 0.42);
  const handOffsetY = clamp((attentionTarget.y - 0.5) * 0.95, -0.26, 0.26);

  headNodes.forEach((node, index) => {
    const weight = index === 0 ? 0.6 : 0.18;
    const nextY = attentionActive ? -handOffsetX * weight : 0;
    const nextX = attentionActive ? handOffsetY * weight : 0;
    node.rotation.y += (nextY - node.rotation.y) * 0.13;
    node.rotation.x += (nextX - node.rotation.x) * 0.13;
  });

  updateBodyAttentionFallback(handOffsetX);

  tailNodes.forEach((node, index) => {
    const happyWag = currentPetState === "happy" ? Math.sin(elapsed * 18 + index * 0.55) * (0.22 + index * 0.016) : 0;
    const barkWag = currentPetState === "bark" ? Math.sin(elapsed * 13 + index * 0.4) * 0.12 : 0;
    const next = happyWag + barkWag;
    node.rotation.y += (next - node.rotation.y) * 0.16;
    node.rotation.z += (next * 0.22 - node.rotation.z) * 0.16;
  });
}

function updateBodyAttentionFallback(handOffsetX) {
  if (!activePreparedModel?.root) return;
  const canUseHead = headNodes.length > 0;
  const subtleYaw = attentionActive && !canUseHead ? -handOffsetX * 0.28 : 0;
  const nextY = DOG_FORWARD_ROTATION_Y + subtleYaw;
  activePreparedModel.root.rotation.y += (nextY - activePreparedModel.root.rotation.y) * 0.11;
}

async function enableHandTracking() {
  if (prototypeDisposed || handTrackingStarting || handTrackingReady) return;
  handTrackingStarting = true;
  enableButton.disabled = true;
  enableButton.textContent = "Starting Camera...";
  updateDebug({ camera: "requesting webcam permission", hand: "not detected", gesture: "none", error: "none" });

  try {
    const host = window.location.hostname;
    const allowedOrigin = window.isSecureContext || host === "localhost" || host === "127.0.0.1" || host === "::1";
    if (!allowedOrigin) {
      throw new Error("Camera permission requires localhost or HTTPS. Start a local server and open http://localhost:PORT.");
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("navigator.mediaDevices.getUserMedia is unavailable in this browser.");
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: "user",
      },
      audio: false,
    });
    if (prototypeDisposed) { stopCamera(); return; }
    updateDebug({ camera: "camera permission granted" });

    video.srcObject = stream;
    await video.play();
    if (prototypeDisposed) { stopCamera(); return; }
    updateDebug({ camera: `webcam running ${video.videoWidth || "?"}x${video.videoHeight || "?"}` });

    const { FilesetResolver, HandLandmarker, importUrl, wasmUrl } = await loadMediaPipe();
    updateDebug({ camera: `MediaPipe resolving WASM: ${wasmUrl}` });
    if (prototypeDisposed) return;
    const vision = await FilesetResolver.forVisionTasks(wasmUrl);
    updateDebug({ camera: `MediaPipe ready: ${importUrl}` });
    if (prototypeDisposed) return;
    const detector = await createHandLandmarker(HandLandmarker, vision);
    if (prototypeDisposed) { detector.close(); return; }
    handLandmarker = detector;

    handTrackingReady = true;
    enableButton.textContent = "Hand Tracking Enabled";
    updateDebug({
      camera: `webcam running; MediaPipe ready`,
      hand: "not detected",
      gesture: "none",
      error: errorStatus.startsWith("GPU delegate") ? errorStatus : "none",
    });
    detectHands();
  } catch (error) {
    if (prototypeDisposed) { stopCamera(); return; }
    handTrackingStarting = false;
    handTrackingReady = false;
    enableButton.disabled = false;
    enableButton.textContent = "Enable Hand Tracking";
    stopCamera();
    updateDebug({
      camera: stream ? "webcam stopped after error" : "permission/import failed",
      hand: "not detected",
      gesture: "none",
      error: formatError(error),
    });
  }
}

async function createHandLandmarker(HandLandmarker, vision) {
  const options = (delegate) => ({
    baseOptions: {
      modelAssetPath: HAND_LANDMARKER_MODEL_URL,
      delegate,
    },
    runningMode: "VIDEO",
    numHands: 1,
  });

  try {
    return await HandLandmarker.createFromOptions(vision, options("GPU"));
  } catch (gpuError) {
    if (prototypeDisposed) throw gpuError;
    const detector = await HandLandmarker.createFromOptions(vision, options("CPU"));
    updateDebug({ error: `GPU delegate failed; CPU active: ${formatError(gpuError)}` });
    return detector;
  }
}

function detectHands() {
  if (prototypeDisposed || !handTrackingReady || !handLandmarker || !video) return;
  handFrameId = requestAnimationFrame(detectHands);

  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.currentTime === lastVideoTime) {
    return;
  }

  lastVideoTime = video.currentTime;
  let result;
  try {
    result = handLandmarker.detectForVideo(video, performance.now());
  } catch (error) {
    clearHandDebugCanvas();
    updateDebug({ hand: "detection error", error: `landmark read failed: ${formatError(error)}` });
    return;
  }

  const landmarks = result.landmarks?.[0];
  drawHandDebug(landmarks);
  if (!landmarks) {
    handHistory = [];
    palmDownHistory = [];
    hideHandCursor();
    interactButton.classList.remove("is-hovered");
    pinchWasDown = false;
    lastPinchClickDetected = false;
    suppressPetControlUntilPinchRelease = false;
    if (radialMenuOpen) {
      updateDebug({ hand: dogMovementDebug("menu open no hand"), gesture: "menu selection mode" });
      return;
    }
    if (isFeedInteractionActive()) {
      updateDebug({ hand: dogMovementDebug("feed active no hand"), gesture: "feed mode" });
      return;
    }
    if (isPlayInteractionActive()) {
      updateDebug({ hand: dogMovementDebug("play active no hand"), gesture: "play mode" });
      return;
    }
    freezeFollowTargetAtCurrentDog();
    clearAttention();
    updateDebug({ hand: dogMovementDebug("not detected palmDown:false index:false"), gesture: "none" });
    requestState("idle", "gesture");
    return;
  }

  const indexPoint = { x: 1 - landmarks[8].x, y: landmarks[8].y };
  const pinching = distance2D(landmarks[4], landmarks[8]) < 0.055;
  lastPinchClickDetected = false;
  pettingGestureDetected = false;
  updateDebug({ hand: `detected (${landmarks.length} landmarks)` });

  if (radialMenuOpen) {
    handleRadialMenuGesture(indexPoint, pinching);
    return;
  }

  if (tryOpenMenuFromHand(indexPoint, pinching)) return;
  if (isMenuCooldownActive()) {
    updateHandCursor(indexPoint, pinching);
    freezeFollowTargetAtCurrentDog();
    clearAttention();
    updateDebug({ hand: dogMovementDebug(`post-menu cooldown pinch:${pinching ? "true" : "false"}`), gesture: "post-menu cooldown" });
    return;
  }
  if (suppressPetControlUntilPinchRelease) {
    updateHandCursor(indexPoint, pinching);
    updateDebug({ hand: dogMovementDebug(`pet control waiting for pinch release:${pinching ? "true" : "false"}`) });
    if (!pinching) suppressPetControlUntilPinchRelease = false;
    return;
  }
  if (isFeedInteractionActive() && handleFeedInteraction(indexPoint, pinching)) return;
  if (isPlayInteractionActive() && handlePlayInteraction(indexPoint, pinching)) return;
  applyGesture(landmarks);
}

function applyGesture(landmarks) {
  const now = performance.now();
  const palm = averageLandmarks(landmarks, [0, 5, 9, 13, 17]);
  const mirroredPalm = { x: 1 - palm.x, y: palm.y };
  const indexTarget = { x: 1 - landmarks[8].x, y: landmarks[8].y };
  setFollowTargetFromHand(mirroredPalm);

  const fingers = fingerStates(landmarks);
  const extendedCount = Object.values(fingers).filter(Boolean).length;
  const pinch = distance2D(landmarks[4], landmarks[8]) < 0.055;
  const thumbsUp = detectThumbsUp(landmarks, fingers, extendedCount, pinch);
  const fingertipCurl =
    [8, 12, 16, 20].reduce((total, index) => total + distance2D(landmarks[index], landmarks[0]), 0) / 4;
  const fist = !thumbsUp && extendedCount === 0 && fingertipCurl < 0.36;
  const indexUp = fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
  const openPalm = extendedCount >= 4;
  const palmDown = detectPalmDownStop(landmarks, mirroredPalm, openPalm, now);
  const petting = detectGentlePetting(mirroredPalm, openPalm, now);
  pettingGestureDetected = currentInteractionMode === "pet" && openPalm && petting.active;
  const gestureDebug =
    `thumbsUp:${thumbsUp ? "true" : "false"} palm:${openPalm ? "true" : "false"} palmDown:${palmDown.active ? "true" : "false"} ` +
    `index:${indexUp ? "true" : "false"} ` +
    `move:${petting.distance.toFixed(3)} pinch:${pinch ? "true" : "false"} fist:${fist ? "true" : "false"} ` +
    `petting:${petting.active ? "true" : "false"}`;

  if (pinch) {
    freezeFollowTargetAtCurrentDog();
    clearAttention();
    updateDebug({ hand: dogMovementDebug(`${gestureDebug} pinchAsUIClick:false`), gesture: "pinch reserved for UI / future grab" });
  } else if (fist) {
    freezeFollowTargetAtCurrentDog();
    clearAttention();
    updateDebug({ hand: dogMovementDebug(gestureDebug), gesture: "fist / closed hand" });
    requestState("bark", "gesture");
  } else if (thumbsUp) {
    clearAttention();
    followActive = true;
    updateDebug({ hand: dogMovementDebug(gestureDebug), gesture: "thumbs-up / follow" });
    requestState("follow", "gesture");
  } else if (openPalm && palmDown.active) {
    freezeFollowTargetAtCurrentDog();
    clearAttention();
    updateDebug({ hand: dogMovementDebug(gestureDebug), gesture: "palm-down stop / stay" });
    requestState("idle", "gesture");
  } else if (indexUp) {
    freezeFollowTargetAtCurrentDog();
    attentionActive = true;
    attentionTarget = indexTarget;
    updateDebug({ hand: dogMovementDebug(gestureDebug), gesture: "index finger attention" });
    requestState("idle", "gesture");
  } else if (openPalm && petting.active) {
    freezeFollowTargetAtCurrentDog();
    clearAttention();
    happyHoldUntil = now + 1500;
    if (currentInteractionMode === "pet" && now >= petSuccessToastUntil) {
      petSuccessToastUntil = now + 2000;
      showSuccessToast("pet");
    }
    updateDebug({ hand: dogMovementDebug(gestureDebug), gesture: "open palm gentle petting" });
    requestState("happy", "gesture");
  } else if (openPalm && now < happyHoldUntil) {
    freezeFollowTargetAtCurrentDog();
    clearAttention();
    updateDebug({ hand: dogMovementDebug(gestureDebug), gesture: "holding happy after petting" });
    requestState("happy", "gesture");
  } else if (openPalm) {
    freezeFollowTargetAtCurrentDog();
    clearAttention();
    updateDebug({ hand: dogMovementDebug(gestureDebug), gesture: "open palm held still" });
    requestState("idle", "gesture");
  } else {
    freezeFollowTargetAtCurrentDog();
    clearAttention();
    updateDebug({ hand: dogMovementDebug(gestureDebug), gesture: "hand detected" });
    requestState("idle", "gesture");
  }
}

function averageLandmarks(landmarks, indexes) {
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

function fingerStates(landmarks) {
  return {
    index: landmarks[8].y < landmarks[6].y - 0.015,
    middle: landmarks[12].y < landmarks[10].y - 0.015,
    ring: landmarks[16].y < landmarks[14].y - 0.015,
    pinky: landmarks[20].y < landmarks[18].y - 0.015,
  };
}

function detectThumbsUp(landmarks, fingers, extendedCount, pinch) {
  const wrist = landmarks[0];
  const thumbMcp = landmarks[2];
  const thumbIp = landmarks[3];
  const thumbTip = landmarks[4];
  const knuckleLine = Math.min(landmarks[5].y, landmarks[9].y, landmarks[13].y, landmarks[17].y);
  const closedNonThumbFingers = extendedCount === 0 && !fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky;
  const thumbAboveHand = thumbTip.y < knuckleLine - 0.035 && thumbTip.y < wrist.y - 0.08;
  const thumbExtended = thumbTip.y < thumbIp.y - 0.035 && distance2D(thumbTip, wrist) > distance2D(thumbMcp, wrist) + 0.03;

  return closedNonThumbFingers && thumbAboveHand && thumbExtended && !pinch;
}

function detectPalmDownStop(landmarks, palm, openPalm, now) {
  if (!openPalm) {
    palmDownHistory = [];
    return { active: false, deltaX: 0, deltaY: 0, orientation: false };
  }

  palmDownHistory.push({ x: palm.x, y: palm.y, time: now });
  palmDownHistory = palmDownHistory.filter((point) => now - point.time <= 1200);

  const usableHistory = palmDownHistory.filter((point) => now - point.time >= 350 && now - point.time <= 1200);
  const startPoint = usableHistory[0] || palmDownHistory[0] || { x: palm.x, y: palm.y, time: now };
  const deltaX = palm.x - startPoint.x;
  const deltaY = palm.y - startPoint.y;
  const elapsed = now - startPoint.time;
  const mostlyDownward = deltaY >= 0.09 && deltaY <= 0.3 && Math.abs(deltaY) > Math.abs(deltaX) * 1.25;
  const orientation = palmDownOrientationHint(landmarks);

  return {
    active: elapsed >= 350 && mostlyDownward,
    deltaX,
    deltaY,
    orientation,
  };
}

function palmDownOrientationHint(landmarks) {
  const wrist = landmarks[0];
  const indexMcp = landmarks[5];
  const pinkyMcp = landmarks[17];
  if (wrist.z === undefined || indexMcp.z === undefined || pinkyMcp.z === undefined) return false;

  const ax = indexMcp.x - wrist.x;
  const ay = indexMcp.y - wrist.y;
  const az = indexMcp.z - wrist.z;
  const bx = pinkyMcp.x - wrist.x;
  const by = pinkyMcp.y - wrist.y;
  const bz = pinkyMcp.z - wrist.z;
  const normalZ = ax * by - ay * bx;

  return Math.abs(normalZ) < 0.015 && Math.abs(az - bz) < 0.08;
}

function detectGentlePetting(palm, openPalm, now) {
  if (!openPalm) {
    handHistory = [];
    return { active: false, deltaX: 0, deltaY: 0, distance: 0 };
  }

  handHistory.push({ x: palm.x, y: palm.y, time: now, openPalm });
  handHistory = handHistory.filter((point) => now - point.time <= 1500);

  const usableHistory = handHistory.filter((point) => now - point.time >= 600 && now - point.time <= 1500);
  const startPoint = usableHistory[0] || handHistory[0] || { x: palm.x, y: palm.y, openPalm };
  const deltaX = palm.x - startPoint.x;
  const deltaY = palm.y - startPoint.y;
  const movementDistance = Math.hypot(deltaX, deltaY);
  const elapsed = now - startPoint.time;
  const handStayedOpen = handHistory.every((point) => point.openPalm);

  const pettingDetected =
    handStayedOpen &&
    elapsed >= 600 &&
    elapsed <= 1500 &&
    movementDistance >= 0.08 &&
    movementDistance <= 0.32 &&
    handHistory.length >= 2;

  return {
    active: pettingDetected,
    deltaX,
    deltaY,
    distance: movementDistance,
  };
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  video.pause();
  video.srcObject = null;
  clearHandDebugCanvas();
}

function handleKeyboardFallback(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    if (radialMenuOpen) closeRadialMenu();
    return;
  }

  if (event.key.toLowerCase() === "d" && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    toggleDebugPanel();
    return;
  }

  if (event.key.toLowerCase() === "i" && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    openRadialMenu("keyboard");
    return;
  }

  if (!event.altKey && !event.ctrlKey && !event.metaKey) {
    const modeKeyMap = { p: "pet", f: "feed", b: "play" };
    const mode = modeKeyMap[event.key.toLowerCase()];
    if (mode) {
      event.preventDefault();
      setInteractionMode(mode, "keyboard");
      if (radialMenuOpen) closeRadialMenu();
      return;
    }
  }

  if (event.key.toLowerCase() === "g" && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    if (currentInteractionMode !== "feed") setInteractionMode("feed", "keyboard");
    placeFoodAt(foodFloorPointFromCursor());
    return;
  }

  if (event.key.toLowerCase() === "h" && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    if (currentInteractionMode !== "feed") setInteractionMode("feed", "keyboard");
    if (!foodPlaced) placeFoodAt(foodFloorPointFromCursor());
    startEatingAtFood();
    return;
  }

  if (event.key.toLowerCase() === "k" && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    if (currentInteractionMode !== "play") setInteractionMode("play", "keyboard");
    else startPlayMode();
    return;
  }

  if (event.key.toLowerCase() === "l" && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    if (currentInteractionMode !== "play") setInteractionMode("play", "keyboard");
    if (!ballVisible) spawnPlayBall();
    if (ballGrabbed) {
      releasePlayBall(true);
    } else if (!ballTarget && !dogMovingToBall && !playReactStartedAt) {
      releasePlayBall(true);
    }
    return;
  }

  if (event.key.toLowerCase() === "r" && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    if (currentInteractionMode !== "play") setInteractionMode("play", "keyboard");
    if (!ballVisible) spawnPlayBall();
    ballTarget = null;
    ballGrabbed = false;
    ballHover = false;
    dogMovingToBall = false;
    playSuccessTriggered = true;
    startDogReturningWithBall();
    return;
  }

  if (!event.altKey || !/^[1-5]$/.test(event.key)) return;

  event.preventDefault();
  freezeFollowTargetAtCurrentDog();
  const nextState = STATE_KEYS[Number(event.key) - 1];
  updateDebug({ gesture: `Alt+${event.key} fallback`, hand: dogMovementDebug("keyboard fallback") });
  requestState(nextState, "keyboard");
}

function setInteractionMode(mode, source = "menu") {
  currentInteractionMode = mode;
  lastMenuSelection = mode;
  if (mode === "feed") {
    cleanupPlayObject();
    startFeedPlacement();
  } else if (mode === "play") {
    cleanupFoodObject();
    startPlayMode();
  } else {
    cleanupFoodObject();
    cleanupPlayObject();
  }
  showInstructionToast(mode);
  updateDebug({ gesture: `${source} selected: ${mode}`, hand: dogMovementDebug(`${source} mode`) });
}

function handleInteractClick() {
  openRadialMenu("mouse");
}

function handleRadialOptionClick(event) {
  selectRadialOption(event.currentTarget);
}

function handleBack() {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = "index.html";
}

// Resource ownership lives in this document, not the portfolio opener.
let prototypeDisposed = false;
let interactionResetTimer = 0;
window.guardianPrototypeLifecycle.register(() => {
  prototypeDisposed = true;
  ++transitionId;
  handTrackingReady = false;
  handTrackingStarting = false;
  cancelAnimationFrame(animationFrameId);
  cancelAnimationFrame(handFrameId);
  clearTimeout(radialMenuTimer);
  clearTimeout(toastTimer);
  clearTimeout(interactionResetTimer);
  stopCamera();
  handLandmarker?.close();
  handLandmarker = null;
  window.removeEventListener("resize", resizeRenderer);
  enableButton.removeEventListener("click", enableHandTracking);
  interactButton.removeEventListener("click", handleInteractClick);
  radialOptions.forEach(option => option.removeEventListener("click", handleRadialOptionClick));
  backButton.removeEventListener("click", handleBack);
  document.removeEventListener("keydown", handleKeyboardFallback);
  for (const model of loadedModels.values()) model.mixer?.stopAllAction();
  window.guardianPrototypeLifecycle.disposeObject(scene);
  loadedModels.clear();
  renderer?.dispose();
  renderer?.forceContextLoss();
});

if (!prototypeDisposed) {
enableButton.addEventListener("click", enableHandTracking);
interactButton.addEventListener("click", handleInteractClick);
radialOptions.forEach((option) => option.addEventListener("click", handleRadialOptionClick));
backButton.addEventListener("click", handleBack);
document.addEventListener("keydown", handleKeyboardFallback);

if (shouldStartWithHandDebug()) {
  toggleDebugPanel(true);
}

initThreeScene().catch((error) => {
  updateDebug({ error: `3D setup failed: ${formatError(error)}` });
});

}
