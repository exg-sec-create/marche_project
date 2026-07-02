# マルシェ2026 キックオフ・ダッシュボード

GitHub Pages などでそのまま公開できる静的 HTML ダッシュボードです。

## ファイル構成

- `index.html` — ダッシュボード本体（HTML/CSS/JavaScript/初期データを内包）
- `.github/workflows/pages.yml` — GitHub Pages へ自動公開する Actions ワークフロー

## 見る方法

### 1. GitHub 上で見る（公開 URL）

このリポジトリを GitHub に push したあと、GitHub Pages を有効化すると次の形式の URL で見られます。

```text
https://<GitHubユーザー名またはOrganization名>.github.io/<リポジトリ名>/
```

このリポジトリ名が `marche2026` の場合は、通常は次のような URL です。

```text
https://<GitHubユーザー名またはOrganization名>.github.io/marche2026/
```

### 2. GitHub Pages の設定

GitHub 側で最初に 1 回だけ設定が必要です。

1. GitHub のリポジトリ画面を開く
2. **Settings** を開く
3. 左メニューの **Pages** を開く
4. **Build and deployment** の **Source** を **GitHub Actions** にする
5. このブランチを push する、または **Actions** タブから `Deploy static dashboard to GitHub Pages` を手動実行する
6. Actions が成功すると、**Settings > Pages** に公開 URL が表示されます

> もし **Source** を `Deploy from a branch` にする場合は、Branch に `main`（または公開したいブランチ）と `/ (root)` を指定してください。

### 3. 自分のPCでローカル確認する方法

GitHub Pages の設定前でも、ファイルを直接開くか、簡易サーバーで確認できます。

```bash
python3 -m http.server 8000
```

その後、ブラウザで次を開きます。

```text
http://localhost:8000/
```

## よくある原因

- GitHub Pages がまだ有効化されていない
- **Settings > Pages** の Source が未設定、または意図したブランチになっていない
- push 直後で Pages の反映待ち（通常 1〜数分）
- URL が `/index.html` ではなくリポジトリの Pages URL になっていない
- リポジトリが private の場合、プランやOrganization設定により Pages 公開に制限がある

## 編集内容をGitHubへ反映する方法

画面上の編集モードで変更した内容は、ブラウザの `localStorage` に保存されます。これはその端末・ブラウザ内の保存なので、クリックしただけでは GitHub の `index.html` は書き換わりません。

GitHub に反映する方法は次のどちらかです。

1. 画面の **JSON書き出し** でデータを書き出し、`index.html` 内の `DEFAULT_DATA` を更新して commit / push する
2. GitHub API と認証トークンを使う保存機能を追加し、画面から直接リポジトリへ commit できるようにする

現在の実装は安全性を優先して、GitHub へ直接書き込む機能は入れていません。直接書き込みを行う場合は、認証トークンの扱いと書き込み権限の設計が必要です。

## 編集できる項目

- KPI の目標値
- 運営体制の責任者・サポート・責任内容
- メンバー一覧のバックメンバー
- 予算の 2026 草案
- スケジュールの日時、タスク名、担当、ステータス

## JSON書き出し後にGitHubへ反映する手順

画面で編集した内容を全員が見られるGitHub Pagesへ反映するには、次の流れで `index.html` 内の `DEFAULT_DATA` を更新して commit / push します。

### 方法A：補助スクリプトで反映する（推奨）

1. ダッシュボード画面で **編集モード** を使って内容を修正する
2. **JSON書き出し** ボタンを押して `marche_2026_data.json` をダウンロードする
3. ダウンロードしたJSONをリポジトリ内に置く（例：`downloads/marche_2026_data.json`）
4. 次のコマンドを実行する

```bash
node scripts/update-default-data.mjs downloads/marche_2026_data.json
```

5. 差分を確認する

```bash
git diff -- index.html
```

6. 問題なければ commit / push する

```bash
git add index.html
git commit -m "Update Marche 2026 dashboard data"
git push
```

GitHub Pages の workflow が有効になっていれば、push 後に公開ページへ反映されます。

### 方法B：手動で反映する

`index.html` 内の `const DEFAULT_DATA = ...` の中身を、JSON書き出しで得た内容に置き換えて commit / push します。手作業だと括弧やカンマのミスが起きやすいため、通常は方法Aを推奨します。

### 画面から直接GitHubへ書き込む場合

画面の保存ボタンからGitHubへ直接 commit することも技術的には可能ですが、次の追加実装が必要です。

- GitHub Personal Access Token または GitHub App 認証
- 書き込み先ブランチの指定
- GitHub Contents API で `index.html` を更新する処理
- トークンをブラウザに置かないためのサーバーまたは安全な認証設計

トークンをHTML内に直接埋め込むのは危険なので、現在の実装では採用していません。

## Firebase Auth + Firestore連携（特定メンバーだけ編集）

このリポジトリには、Googleログインした特定メンバーだけがFirestoreへ保存できる連携コードを追加しています。

### できること

- Googleログインしたユーザーのメールアドレスで編集権限を判定
- 許可された役員・責任者だけ **編集モード** と **Firestore保存** を利用可能にする
- Firestoreの `dashboards/marche2026` に最新データを保存
- `dashboards/marche2026/auditLogs` に「誰が保存したか」をメールアドレス・表示名・UID付きで記録
- Firebase未設定時はこれまで通りローカル編集モードで動作

### 許可済み編集者

役員と、Slack登録メンバーデータから読み取った責任者メールを `src/firebase-dashboard.js` と `firestore.rules` に反映しています。

### Firebase設定手順

1. Firebase Consoleでプロジェクトを作成
2. Authenticationで **Google** を有効化
3. Firestore Databaseを作成
4. `firestore.rules` をFirebase ConsoleのRulesへ貼り付けて公開
5. FirebaseのWebアプリ設定を `firebase-config.js` に入力
6. GitHubへcommit / push
7. GitHub Pagesを開き、許可済みGoogleアカウントでログイン

### 注意

Firebase Web configの `apiKey` は秘密鍵ではありません。実際の書き込み制限は `firestore.rules` で行います。ただし、許可メールの追加・削除をした場合は `src/firebase-dashboard.js` と `firestore.rules` の両方を更新してください。
