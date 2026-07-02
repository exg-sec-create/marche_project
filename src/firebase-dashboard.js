import { firebaseConfig, dashboardDocPath } from "../firebase-config.js";

const AUTHORIZED_EDITORS = new Set([
  // 役員
  "y-togashi@ych-exceed.com",
  "koseki@ych-exceed.com",
  "yamamoto@ych-exceed.com",
  // 責任者（Slack登録メンバーデータから抽出）
  "tegawa@ych-exceed.com",
  "hidetoshi-konno@besto-haus.com",
  "homma@ych-exceed.com",
  "teppei-kikuchi@exceed-group.co.jp",
  "yamagishi@besto-haus.com",
  "nabeshima@ych-exceed.com",
  "masaki-hasegawa@besto-haus.com",
  "hayasaka@ych-exceed.com",
  "takeuchi_23@besto-haus.com",
  "senri-ishikawa@exceed-group.co.jp",
  "matsumoto@ych-exceed.com",
  "imai@ych-exceed.com",
  "yasutaka-saito@ych-exceed.com",
  "sakai@ych-exceed.com"
]);

const PLACEHOLDER_PREFIX = "REPLACE_WITH_";
const $ = (selector) => document.querySelector(selector);
const authStatus = $("#authStatus");
const loginBtn = $("#loginBtn");
const logoutBtn = $("#logoutBtn");
const syncBtn = $("#syncBtn");
const editBtn = $("#editBtn");
let app;
let auth;
let db;
let firebaseApi;
let currentUser = null;
let cloudEnabled = false;

function isConfigReady(config) {
  return config && config.apiKey && !String(config.apiKey).startsWith(PLACEHOLDER_PREFIX);
}

function setStatus(message) {
  if (authStatus) authStatus.textContent = message;
}

function canEdit(user) {
  return Boolean(user?.email && AUTHORIZED_EDITORS.has(user.email.toLowerCase()));
}

function refreshControls() {
  if (!cloudEnabled) {
    setStatus("ローカル編集モード（Firebase未設定）");
    return;
  }

  const allowed = canEdit(currentUser);
  loginBtn.hidden = Boolean(currentUser);
  logoutBtn.hidden = !currentUser;
  syncBtn.hidden = !allowed;
  editBtn.disabled = !allowed;
  editBtn.title = allowed ? "編集できます" : "編集には許可済みGoogleアカウントでのログインが必要です";

  if (!currentUser) {
    setStatus("未ログイン：編集にはGoogleログインが必要です");
  } else if (allowed) {
    setStatus(`編集権限あり：${currentUser.email}`);
  } else {
    setStatus(`閲覧のみ：${currentUser.email}`);
  }
}

async function loadCloudData() {
  const snap = await firebaseApi.getDoc(firebaseApi.doc(db, dashboardDocPath));
  if (snap.exists() && snap.data()?.data && window.setDashboardData) {
    window.setDashboardData(snap.data().data);
    setStatus(`クラウドデータ読込済：${currentUser?.email ?? "閲覧"}`);
  }
}

async function saveCloudData() {
  if (!canEdit(currentUser)) {
    alert("編集権限がありません。許可済みGoogleアカウントでログインしてください。");
    return;
  }
  const data = window.getDashboardData?.();
  if (!data) {
    alert("保存対象のダッシュボードデータを取得できませんでした。");
    return;
  }

  const userInfo = {
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName || ""
  };

  await firebaseApi.setDoc(firebaseApi.doc(db, dashboardDocPath), {
    data,
    updatedAt: firebaseApi.serverTimestamp(),
    updatedBy: userInfo
  }, { merge: true });

  await firebaseApi.addDoc(firebaseApi.collection(db, `${dashboardDocPath}/auditLogs`), {
    action: "save",
    changedAt: firebaseApi.serverTimestamp(),
    changedBy: userInfo,
    rev: data?.meta?.rev || ""
  });

  setStatus(`クラウド保存済：${currentUser.email}`);
  alert("Firestoreへ保存しました。編集者ログも記録しました。");
}

async function initFirebaseDashboard() {
  if (!isConfigReady(firebaseConfig)) {
    refreshControls();
    return;
  }

  cloudEnabled = true;
  const [appModule, authModule, firestoreModule] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
  ]);
  firebaseApi = { ...appModule, ...authModule, ...firestoreModule };

  app = firebaseApi.initializeApp(firebaseConfig);
  auth = firebaseApi.getAuth(app);
  db = firebaseApi.getFirestore(app);

  loginBtn.hidden = false;
  syncBtn.hidden = true;
  logoutBtn.hidden = true;

  loginBtn.addEventListener("click", () => firebaseApi.signInWithPopup(auth, new firebaseApi.GoogleAuthProvider()));
  logoutBtn.addEventListener("click", () => firebaseApi.signOut(auth));
  syncBtn.addEventListener("click", saveCloudData);

  editBtn.addEventListener("click", (event) => {
    if (!canEdit(currentUser)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      alert("編集には許可済みGoogleアカウントでのログインが必要です。");
    }
  }, true);

  firebaseApi.onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    refreshControls();
    if (user) await loadCloudData();
  });
}

initFirebaseDashboard().catch((error) => {
  console.error(error);
  setStatus("Firebase初期化エラー：設定を確認してください");
});
