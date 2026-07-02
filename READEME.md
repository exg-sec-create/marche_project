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
