# Life Style Market 2026 — 予約＆受付システム

- 受付フォーム（一般用）: `index.html`
- オーナー様用受付フォーム: `owner.html`
- 一般用受付フォーム: `general.html`
- 業者用受付フォーム: `vendor.html`
- QRチケット再表示: `ticket.html`
- 受付スキャナー（スタッフ）: `checkin.html`
- 運営ダッシュボード: `admin.html`
- 設定（ここだけ編集）: `firebase-config.js`

GitHubリポジトリ **`marche_project`**（GitHub Pages）＋ Firebase **`marche2026-86ab6`** で動きます。
コードはリポジトリ名に依存しません（URLのサブパスを自動判定）。

---

## リポジトリ名を marche_project にする

### A. 既存リポジトリをリネーム（推奨）
1. GitHub の該当リポジトリ → Settings → 一番上の「Repository name」を `marche_project` に変更。
   （旧URLは自動リダイレクトされます）
2. 手元のクローンのリモートを貼り替え:
   ```bash
   git remote set-url origin https://github.com/<あなた>/marche_project.git
   ```

### B. 新規で作る場合
GitHub で `marche_project`（Public）を作成し、後述の手順で push。
※ GitHub Pages を無料で使うにはリポジトリを **Public** にしてください。

---

## 速攻セットアップ（ターミナル）

```bash
# 1) リポジトリを取得
git clone https://github.com/<あなた>/marche_project.git
cd marche_project

# 2) この一式をリポジトリ直下にコピー（index.html / firebase-config.js は上書き）

# 3) firebase-config.js の apiKey と appId を実値に置換
#    Firebaseコンソール → プロジェクトの設定 → マイアプリ → ウェブアプリ

# 4) 付属スクリプトで一気に反映（ルール反映 + commit + push）
bash setup.sh
```

`setup.sh` を使わず手動で進める場合:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules --project marche2026-86ab6
git add -A && git commit -m "reservation & check-in system" && git push
```

### GitHub Pages を有効化（1回だけ）
リポジトリ → Settings → Pages → Build and deployment →
Source: **Deploy from a branch** → Branch: **main** / **/(root)** → Save。

### Firebaseコンソール側（1回だけ）
1. Firestore Database を作成（未作成の場合）。
2. Authentication → Sign-in method → **メール/パスワード** を有効化。
3. Authentication → Users で受付・運営スタッフを追加（例 `staff@example.com`）。来場者はログイン不要。
4. ウェブアプリ未登録なら「マイアプリ → ウェブアプリを追加」で `apiKey` / `appId` を取得。

### 公開URL
```
https://exg-sec-create.github.io/marche_project/            ← 受付フォーム
https://exg-sec-create.github.io/marche_project/owner.html  ← オーナー様用
https://exg-sec-create.github.io/marche_project/general.html ← 一般用
https://exg-sec-create.github.io/marche_project/vendor.html ← 業者用
https://exg-sec-create.github.io/marche_project/checkin.html ← 受付（スタッフ）
https://exg-sec-create.github.io/marche_project/admin.html   ← 運営
```
カメラ利用（受付）は HTTPS 必須ですが、GitHub Pages は HTTPS なので問題ありません。

---

## よくある編集
- 駐車場のご案内: `firebase-config.js` の `EVENT.parkingNote` を書き換えて push。
- 時間帯・定員: `TIME_SLOTS` / `SLOT_CAPACITY`。
- 受付ページの修正: `checkin.html` を直接編集して push。QRが読めない時の名前検索→手動受付／取消も実装済み。

## 補足
- 500組でも安定: 静的配信（Pages CDN）＋ Firestore（自動スケール）。会場Wi-Fi不安定時もオフライン永続化＋起動時プリロードで継続。
- 無料枠: 予約500＋受付500で書込約1,000・読取数千。Firebase無料枠（書込2万/日・読取5万/日）に収まります。
- 公式ロゴPNG差し替え: リポジトリに置き、`index.html` の `<svg class="tent">` と `<h1 class="wordmark">` を `<img src="logo.png">` に置換。
