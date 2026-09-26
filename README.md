# Life Style Market 2026 — 予約＆受付システム

- オーナー様用・事前受付フォーム（来場希望時間あり）: `owner.html`
- オーナー様用・当日受付フォーム（来場希望時間なし）: `owner-today.html`
- 一般用受付フォーム: `general.html`
- OB様紹介のお客様用・当日受付フォーム: `referral.html`
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

# 2) この一式をリポジトリ直下にコピー（registration.html / firebase-config.js は上書き）

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
https://exg-sec-create.github.io/marche_project/            ← 削除済み（専用フォームをご利用ください）
https://exg-sec-create.github.io/marche_project/owner.html  ← オーナー様用（事前受付・来場希望時間あり）
https://exg-sec-create.github.io/marche_project/owner-today.html ← オーナー様用（当日受付・来場希望時間なし）
https://exg-sec-create.github.io/marche_project/general.html ← 一般用
https://exg-sec-create.github.io/marche_project/referral.html ← OB様紹介のお客様用（当日登録）
https://exg-sec-create.github.io/marche_project/vendor.html ← 業者用
https://exg-sec-create.github.io/marche_project/checkin.html ← 受付（スタッフ）
https://exg-sec-create.github.io/marche_project/admin.html   ← 運営
```
カメラ利用（受付）は HTTPS 必須ですが、GitHub Pages は HTTPS なので問題ありません。

---

## よくある編集
- 時間帯・定員: `TIME_SLOTS` / `SLOT_CAPACITY`。
- 受付ページの修正: `checkin.html` を直接編集して push。QRが読めない時の名前検索→手動受付／取消も実装済み。

## 来場人数の保存項目
来場者向けフォームでは、来場人数を次の2項目に分けて回答・保存します（業者用フォームでは空文字を保存します）。

- `adultCount`: 大人の人数（1〜5名、または6名以上）
- `childCount`: 子どもの人数（0〜5名、または6名以上）。子どもは小学生以下です。

これらの項目を含む新規登録を許可するため、`firestore.rules` も更新しています。GitHub Pages への push に加えて、次のコマンドでルールを Firebase に反映してください。

```bash
npx firebase-tools deploy --only firestore:rules --project marche2026-86ab6
```

## 運営ダッシュボードで登録内容を保存できない場合
登録内容の編集には、リポジトリ内の `firestore.rules` を Firebase に反映する必要があります。
GitHub Pages への push だけではセキュリティルールは更新されないため、ルール変更後は次のコマンドも実行してください。

```bash
npx firebase-tools deploy --only firestore:rules --project marche2026-86ab6
```

`Missing or insufficient permissions` と表示される場合は、先に Firebase CLI へログインし、上記コマンドで最新ルールを反映してください。

## 既存顧客CSVと申込データを突合する

運営ダッシュボードの「顧客突合」タブでは、既存の顧客管理スプレッドシートをCSVとして取り込み、申込データとの一致候補を確認できます。

1. Googleスプレッドシートで対象シートを開き、「ファイル」→「ダウンロード」→「カンマ区切り形式（.csv）」を選びます。
2. `admin.html` にスタッフアカウントでログインし、「顧客突合」タブを開きます。
   タブを開く際は、専用パスワード `123456` を入力します（ページを再読み込み、またはログアウトすると再入力が必要です）。
3. CSVを選択して「CSVを取り込む」を押します。必須列は `顧客ID` と `顧客名1氏名` です。
4. 電話番号、氏名、住所による候補を確認し、「候補を選ぶ」から担当者が顧客を確定します。同姓同名など候補が一意にならない場合は「要確認」と表示されます。

取り込んだ内容は Firestore の `customerMasters` コレクションへ顧客ID単位で登録・更新されます。同じ顧客IDは更新、未登録のIDは新規追加となり、実行前に件数と変更項目を確認できます。CSVで省略した列の既存値は保持されますが、CSV上に存在する列の空欄は空文字で更新されます。取込後の現在値と直近の変更箇所は「取込データを表示」から確認できます。

突合候補が見つかると、担当者による確定操作なしでCSVの「引渡」「ランク」「アフター案件あり」が顧客一覧と受付カメラの読取結果に表示されます。「自動候補」「要確認」の状態を確認し、誤りがある場合だけ候補を修正できます。アフター案件がある顧客は、対応完了後に顧客一覧のチェック欄で完了状態を保存できます。顧客マスターは認証済みスタッフだけが参照でき、削除は管理画面から行いません。初回利用前に、上記の `firebase deploy --only firestore:rules` を実行して最新のセキュリティルールを反映してください。

## 補足
- 500組でも安定: 静的配信（Pages CDN）＋ Firestore（自動スケール）。会場Wi-Fi不安定時もオフライン永続化＋起動時プリロードで継続。
- 無料枠: 予約500＋受付500で書込約1,000・読取数千。Firebase無料枠（書込2万/日・読取5万/日）に収まります。
- 公式ロゴPNG差し替え: リポジトリに置き、`registration.html` の `<svg class="tent">` と `<h1 class="wordmark">` を `<img src="logo.png">` に置換。
