# ServiceNow App Template

[![CI](https://github.com/h13/servicenow-app-template/actions/workflows/ci.yml/badge.svg)](https://github.com/h13/servicenow-app-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/h13/servicenow-app-template/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![ServiceNow SDK](https://img.shields.io/badge/ServiceNow%20SDK-Fluent-4285F4.svg)](https://servicenow.github.io/sdk/)

[English](README.md)

**モダンなツールチェーンによる、ソースコード駆動の ServiceNow アプリ開発。**

このテンプレートからリポジトリを作成し、インスタンスに認証すれば、開発環境が即座に整います — リント、型チェック、テスト、PR でのビルド検証、マージ時の自動デプロイ。パイプラインの手動セットアップは不要です。

**[→ クイックスタート](#クイックスタート)** · [含まれるもの](#含まれるもの) · [デプロイ戦略](#デプロイ戦略) · [FAQ](#faq)

## 課題

ブラウザ上で構築された ServiceNow アプリには、開発者が他のプラットフォームで当然とする機能が欠けています：

- **バージョン管理がない** — 変更は Update Set で追跡され、Git コミットではない
- **コードレビューがない** — プルリクエストも、本番前のピアレビューもない
- **自動テストがない** — インスタンス上での手動検証のみ
- **再現性のあるビルドがない** — 「自分のインスタンスでは動く」が唯一の保証
- **コラボレーションツールがない** — ブランチ戦略も CI/CD も依存管理もない

アプリが 1 つなら何とかなります。5 つになると負荷です。誰かが本番で不正な変更をしたとき、簡単なロールバック手段がありません。

## 解決策

このテンプレートは、ServiceNow アプリ開発を他のコードベースと同じワークフローに載せます：

- **Git ベースのソース管理** — すべての変更はコミット、すべての機能はブランチ
- **プルリクエストワークフロー** — インスタンスに届く前にコードレビュー
- **CI/CD パイプライン** — ビルド検証 + デプロイの自動化
- **モダンなツール** — TypeScript、Oxlint、Oxfmt、Vitest

[ServiceNow SDK](https://servicenow.github.io/sdk/) がこれを可能にします。アプリのメタデータを Fluent DSL でコードとして記述し、サーバーサイドスクリプトを TypeScript で書き、CLI でコンパイル・デプロイします。

## 含まれるもの

| カテゴリ     | ツール                                                  |
| ------------ | ------------------------------------------------------- |
| 言語         | TypeScript（strict モード）                             |
| SDK          | ServiceNow SDK（Fluent DSL + サーバースクリプト）       |
| リント       | Oxlint                                                  |
| フォーマット | Oxfmt                                                   |
| テスト       | Vitest                                                  |
| 型チェック   | `tsc --noEmit`                                          |
| CI/CD        | GitHub Actions（ビルド検証 + 自動デプロイ）             |
| 依存管理     | Renovate（h13/renovate-config による自動更新）          |
| テンプレ同期 | 週次の上流同期（ツーリング更新を自動 PR）               |
| サンプル     | CI 検証済みのビジネスルール + 単体テスト（`examples/`） |

## クイックスタート

### 1. テンプレートからリポジトリを作成

GitHub の **"Use this template"** ボタンをクリック。

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. アプリの設定

`now.config.json` を編集：

```json
{
  "scope": "x_yourcompany_yourapp",
  "name": "Your App Name",
  "tsconfigPath": "./src/server/tsconfig.json"
}
```

### 4. インスタンスへの認証

```bash
npx @servicenow/sdk auth --add https://<your-instance>.service-now.com
```

### 5. 既存アプリの取り込み

```bash
# インスタンスの sys_app.list から sys_id を取得
npx @servicenow/sdk init --from <sys_id>

# XML メタデータを Fluent TypeScript に変換
npx @servicenow/sdk transform --from .

# プラットフォームの型定義をダウンロード
npx @servicenow/sdk dependencies

# 確認
pnpm run build
```

### 6. CI/CD シークレットの設定

リポジトリの Settings → Environments → `dev` を作成し、以下を設定：

| Secret                | 値                             |
| --------------------- | ------------------------------ |
| `SN_SDK_INSTANCE_URL` | dev インスタンスの URL         |
| `SN_SDK_USER`         | サービスアカウントのユーザー名 |
| `SN_SDK_USER_PWD`     | サービスアカウントのパスワード |

**サービスアカウントの運用:** 個人アカウントではなく専用のサービスアカウントを
使ってください — 監査・ローテーション・権限の絞り込みが容易になります。アプリの
インストールには対象インスタンスの管理者相当の権限が必要なため、アカウントは
dev インスタンスのみに限定し、パスワードは定期的にローテーションしてください。

<details>
<summary><b>可能なら OAuth を推奨（basic 認証の代替）</b></summary>

SDK は CI での OAuth 2.0 `client_credentials` グラントもサポートしています。
ユーザーパスワードがシークレットストアの外に出ることがなく、ローテーションも
パスワードではなくクライアントシークレットの差し替えで済みます。

1. インスタンス側: **System OAuth → Application Registry → New → Create an
   OAuth API endpoint for external clients** を作成。_Public Client_ を `false`
   にし、_OAuth Application User_ に専用の `sys_user`（_Identity Type = Human_、
   アプリインストールに十分なロール付き）をマッピングし、_Client Credentials_
   グラントタイプを有効化。
2. システムプロパティ
   `glide.oauth.inbound.client.credential.grant_type.enabled` を `true` に設定
   （存在しない場合は `sys_properties` に作成 — ServiceNow KB1645212 参照）。
3. `dev` environment に **variable** `SN_SDK_AUTH_TYPE=oauth` と、secrets
   `SN_SDK_OAUTH_CLIENT_ID` / `SN_SDK_OAUTH_CLIENT_SECRET` を設定
   （`SN_SDK_USER` / `SN_SDK_USER_PWD` は不要）。

`deploy.yml` は自動的に切り替わります。

</details>

## 開発ワークフロー

```bash
# Fluent コードまたはサーバースクリプトを編集
vim src/fluent/business-rules/my-rule.now.ts

# チェック実行
pnpm run check          # lint + typecheck + test

# ビルド
pnpm run build

# インスタンスでテスト（任意、ローカルイテレーション）
pnpm run install:instance

# コミット、プッシュ、PR 作成
git add -A && git commit -m "feat: add approval rule"
git push -u origin feature/approval-rule
```

### 開発の内部ループ

```
編集 → check → build → install:instance → インスタンスで検証 → 繰り返し
```

ローカルの `install:instance` は高速なイテレーション用。正式なデプロイは CI が担当します。

## デプロイ戦略

| 環境              | 方法                       | トリガー          |
| ----------------- | -------------------------- | ----------------- |
| dev インスタンス  | `now-sdk install` via CI   | `main` へのマージ |
| prod インスタンス | App Repo (Install/Upgrade) | Publish 後、手動  |

### なぜ本番に CI デプロイしないのか？

ServiceNow のプラットフォームは、本番デプロイを [App Repo](https://www.servicenow.com/docs/r/application-development/share-an-application/application-repository.html) 経由で行うことを前提にしています。これにより：

- プラットフォームネイティブのバージョン管理
- 前バージョンへのロールバック
- Change Management との連携
- 依存関係の検証

CI は dev にデプロイします。本番への昇格は意図的で監査可能な行為です。

### 本番への昇格手順

`main` のビルドを dev インスタンスで検証したら：

1. **Publish** — dev インスタンスで **All → System Applications →
   My Company Applications**（または Studio / App Manager）を開き、アプリを
   選択してバージョン番号を上げ、**Publish to Application Repository** を
   クリック。
2. **Install / Upgrade** — prod インスタンスの **Application Manager** で
   アプリを検索し、公開したバージョンをインストール／アップグレード。この
   ステップは Change Management のプロセスに紐づけてください。
3. **ロールバック** — 問題が起きたら、同じ手順で App Repo から前バージョンを
   インストール。

対応するコミットにタグを打っておくと（`git tag v1.2.0 && git push --tags`）、
Git 履歴と App Repo のバージョンが対応づきます。

### リリースフロー

```
feature branch → PR (CI で検証) → main にマージ
                                     ↓
                           CI: build + install → dev インスタンス
                                     ↓
                           dev インスタンスで動作確認
                                     ↓
                           Publish → App Repo
                                     ↓
                           Prod: Install/Upgrade
```

## CI/CD パイプライン

```
Push / PR  →  共有 CI (ci-node.yml)  →  Frozen Keys チェック
               ├── Lint                    └── now-sdk build --frozenKeys
               ├── Typecheck
               ├── Test
               └── Build

main マージ  →  Deploy
                  └── now-sdk build + install → dev インスタンス
```

| トリガー      | パイプライン     | 動作                                         |
| ------------- | ---------------- | -------------------------------------------- |
| 全 push + PR  | CI + frozen keys | lint → typecheck → test → build → frozenKeys |
| `main` マージ | Deploy           | build → dev インスタンスに install           |

### なぜ `--frozenKeys`？

`keys.ts` は Fluent の識別子（`Now.ID['my-rule']`）を ServiceNow の `sys_id` にマッピングします。開発者が新しい識別子を追加したのに、再生成された `keys.ts` をコミットしていない場合：

- マシンごとに同じ論理レコードに異なる sys_id が生成される
- 更新が新規挿入になる — インスタンス上にレコードが重複
- 後続のマージで間違った ID が伝播する

`--frozenKeys` はマージ前に CI でこれを検知します。

## コマンド

| コマンド                    | 説明                                        |
| --------------------------- | ------------------------------------------- |
| `pnpm run check`            | lint + typecheck + test（コミット前に実行） |
| `pnpm run build`            | ServiceNow SDK ビルド                       |
| `pnpm run build:ci`         | `--frozenKeys` 検証付きビルド               |
| `pnpm run lint`             | Oxlint（自動修正付き）                      |
| `pnpm run typecheck`        | TypeScript 型チェック                       |
| `pnpm run test`             | Vitest でテスト実行                         |
| `pnpm run format`           | Oxfmt でフォーマット                        |
| `pnpm run install:instance` | 認証済みインスタンスへデプロイ              |
| `pnpm run deploy`           | ビルド + インストール（一括）               |
| `pnpm run transform`        | XML メタデータを Fluent に変換              |
| `pnpm run download`         | インスタンスからメタデータを同期            |
| `pnpm run dependencies`     | プラットフォーム型定義をダウンロード        |

## プロジェクト構成

```
your-app/
├── src/
│   ├── fluent/
│   │   ├── index.now.ts           # Fluent エントリポイント
│   │   ├── business-rules/        # ビジネスルール (.now.ts)
│   │   ├── client-scripts/        # クライアントスクリプト (.now.ts)
│   │   └── generated/
│   │       └── keys.ts            # レコード ID マッピング（コミット必須）
│   └── server/
│       ├── tsconfig.json          # サーバーサイド TypeScript 設定
│       └── scripts/               # サーバーサイドスクリプト
├── examples/                      # CI 検証済みサンプル（デプロイ対象外）
├── test/                          # Vitest テスト
├── metadata/                      # XML メタデータ（Fluent 未対応）
├── .github/workflows/
│   ├── ci.yml                     # CI: 共有ワークフロー + frozenKeys
│   ├── deploy.yml                 # CD: main マージ時にデプロイ
│   └── sync-template.yml         # 週次テンプレート同期
├── now.config.json                # アプリスコープ・メタデータ
├── package.json
├── tsconfig.json
├── .oxlintrc.json
├── .oxfmtrc.json
└── renovate.json
```

### サンプルコード

[`examples/`](examples/) には、推奨するレイヤリングを示す動くビジネスルールが
入っています：純粋ロジック（`utils/` — Glide API 非依存、Vitest で単体テスト）
→ 薄い Glide ラッパー（`business-rules/` — スタブレコードでテスト）→ Fluent
配線（`fluent/` — `BusinessRule` 宣言）。

サンプルは push のたびに CI で型チェック・リント・テストされますが、`src/` の
外にあるためビルド・デプロイには含まれません。導入方法（と削除方法）は
[`examples/README.md`](examples/README.md) を参照してください。

## リポジトリの同期

### Template Sync

`sync-template.yml` ワークフローが週次で上流テンプレートの更新をチェックします。更新がある場合、`template-sync` ラベル付きの PR が自動作成されます。

`.templatesyncignore` はホワイトリスト形式 — リストされたファイル（ワークフロー、ツーリング設定、`examples/`）のみが同期対象です。ソースコード、テスト、`now.config.json`、`README.md` は上書きされません。

### Renovate

[`h13/renovate-config:node`](https://github.com/h13/renovate-config) で設定：

- minor / patch: オートマージ
- major: 手動レビュー用 PR（`breaking` ラベル付き）
- devDependencies: グループ化してオートマージ
- 7 日間の安定性バッファ
- 毎週日曜に実行

## FAQ

### 新規アプリ（グリーンフィールド）でも使える？

はい。ステップ 5 をスキップし、`npx @servicenow/sdk init` に `--appName`、`--scopeName`、`--template` フラグを付けてスキャフォールドしてください。

### Fluent が未対応のアーティファクトがある場合は？

`metadata/` に XML として残り、Fluent アーティファクトと一緒にデプロイされます。Fluent のカバレッジが拡大すれば、`transform` で段階的に変換できます。

### ServiceNow IDE や VS Code 拡張は必要？

不要です。SDK CLI だけで完結します。好きなエディタを使ってください。

### 複数の開発者が同じアプリを開発できる？

はい — それがこのテンプレートの目的です。ブランチを切り、PR を出し、マージする。`keys.ts` が全員の `sys_id` マッピングの一貫性を保証します。

### Vitest だけで十分？ATF は？

カバーする層が違います。Vitest は純粋ロジックをローカルでテストします —
高速で、インスタンス不要です（パターンは [`examples/`](examples/) 参照）。
プラットフォーム上でしか存在しない挙動 — ACL、ビジネスルールの実行順序、
フォーム、REST エンドポイント — は [Automated Test Framework](https://www.servicenow.com/docs/r/application-development/automated-test-framework.html)
の領域です。SDK の Fluent `Test()` API を使えば ATF テストも `src/fluent/` に
コードとして定義でき、他のすべてと同様にバージョン管理・レビューできます。
テストピラミッドを保ちましょう：ロジックは多数の高速な Vitest ユニット、
プラットフォーム挙動は少数の ATF テスト。

## ライセンス

[MIT](LICENSE)
