// Firebase Console > Project settings > General > Your apps > Web app の config に置き換えてください。
// apiKey 等の Firebase Web config は公開情報です。書き込み権限は Firestore Rules で保護します。
export const firebaseConfig = {
  apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_PROJECT_ID.firebaseapp.com",
  projectId: "REPLACE_WITH_PROJECT_ID",
  storageBucket: "REPLACE_WITH_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_WITH_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_APP_ID"
};

export const dashboardDocPath = "dashboards/marche2026";
