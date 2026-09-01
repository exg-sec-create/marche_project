// ============================================================
//  Firebase 設定（プロジェクト: marche2026-86ab6）
//  apiKey と appId だけ、Firebaseコンソール →「プロジェクトの設定」→
//  「マイアプリ」→ ウェブアプリ の値をコピーして貼り替えてください。
// ============================================================
window.firebaseConfig = {
  apiKey: "AIzaSyBwN5IK-S2QDe9IgJ-_vuzBwu5E5DE26VY",                 // ← 要コピー（AIza... で始まる文字列）
  authDomain: "marche2026-86ab6.firebaseapp.com",
  projectId: "marche2026-86ab6",
  storageBucket: "marche2026-86ab6.firebasestorage.app",
  messagingSenderId: "199292749394",           // = プロジェクト番号
  appId: "1:199292749394:web:53f78be7ec5fa0b39d818b",                        // ← 要コピー（1:199292749394:web:... ）
};

// ============================================================
//  イベント情報（ここを編集すれば表示が変わります）
// ============================================================
window.EVENT = {
  name: "Life Style Market",
  year: "2026",
  dateLabel: "2026.9.27",
  dow: "SUN",
  timeLabel: "9:00–15:30",
  venue: "ビッグウイング山形",
  tagline: "〜 家族で楽しむ つながるマルシェ 〜",
  // 駐車場のご案内。決まり次第ここを書き換えてpushすれば反映されます。
  parkingNote: "駐車場は随時ご案内します。詳しくはリーフレット／当日の会場案内をご確認ください。",
};

// 来場時間帯
window.TIME_SLOTS = [
  "9:00–10:00",
  "10:00–11:00",
  "11:00–12:00",
  "12:00–13:00",
  "13:00–14:00",
  "14:00–15:30",
];

// 各時間帯の定員（設けない場合は null）。例: 100
window.SLOT_CAPACITY = null;
