# AI チームタスクボード

チームでタスクを管理するための Web アプリケーション。AI によるタスク自動分解・優先度サジェスト機能を備える。

## 技術スタック

### バックエンド

| 技術 | バージョン | 用途 |
|---|---|---|
| Python | 3.12 | ランタイム |
| Django | 5.2+ | Web フレームワーク |
| Django REST Framework | 3.15+ | REST API |
| djangorestframework-simplejwt | 5.3+ | JWT 認証 |
| django-cors-headers | 4.4+ | CORS 設定 |
| django-environ | 0.11+ | 環境変数管理 |
| WhiteNoise | 6.7+ | 静的ファイル配信 |
| Anthropic SDK | 0.92+ | Claude API（AI タスク分解） |
| Gunicorn | — | WSGI サーバー（本番） |
| SQLite（開発）/ PostgreSQL（本番） | — | データベース |

### インフラ

| 技術 | 用途 |
|---|---|
| AWS ECS Fargate | バックエンドコンテナ実行 |
| AWS ALB | ロードバランサー |
| AWS RDS PostgreSQL | データベース（本番） |
| AWS ECR | Docker イメージレジストリ |
| AWS S3 | フロントエンド静的ホスティング |
| AWS Secrets Manager | 機密情報管理 |
| Terraform | インフラ定義 (IaC) |
| Docker | コンテナ化 |

### フロントエンド

| 技術 | バージョン | 用途 |
|---|---|---|
| React | 18.3 | UI ライブラリ |
| TypeScript | 5.9 | 型安全 |
| Vite | 7.x | ビルドツール |
| MUI (Material UI) | v6 | コンポーネントライブラリ |
| TanStack React Query | v5 | サーバー状態管理 |
| Axios | 1.7 | HTTP クライアント |
| React Router | v7 | ルーティング |

---

## プロジェクト構成

```
task-management/
├── backend/              # Django アプリケーション
│   ├── config/           # プロジェクト設定・グローバル URL
│   ├── users/            # ユーザー認証・チーム管理
│   ├── tasks/            # プロジェクト・タスク管理
│   ├── ai_assist/        # AI タスク支援
│   ├── Dockerfile        # 本番用コンテナ定義
│   ├── manage.py
│   └── requirements.txt
├── frontend/             # React アプリケーション
│   ├── src/
│   │   ├── components/   # 再利用可能コンポーネント
│   │   ├── screens/      # ページコンポーネント
│   │   ├── lib/          # ユーティリティ（apiClient, apiError, queries）
│   │   ├── state/        # AuthContext
│   │   ├── types/        # 共通型定義
│   │   └── router.tsx    # ルーティング定義
│   ├── package.json
│   └── tsconfig.json
├── terraform/            # AWS インフラ定義 (Terraform)
│   ├── *.tf              # VPC / ECS / ALB / RDS / S3 / ECR 等
│   └── .terraform.lock.hcl
├── command.md            # デプロイ手順書 (PowerShell)
├── 基本設計.md
└── 詳細設計.md
```

---

## セットアップ

### 前提条件

- Python 3.12 以上
- Node.js 20 以上
- npm 10 以上

---

### バックエンド

```bash
cd backend

# 仮想環境作成・有効化
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 依存パッケージインストール
pip install -r requirements.txt

# 環境変数設定（.env ファイルを作成）
cp .env.example .env   # または後述の内容で手動作成

# マイグレーション
python manage.py migrate

# 開発サーバー起動
python manage.py runserver
```

バックエンドは `http://localhost:8000` で起動する。

#### 環境変数（`.env`）

```ini
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOW_ALL_ORIGINS=True
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

- 本番環境では `DEBUG=False`、`CORS_ALLOW_ALL_ORIGINS=False`、`CORS_ALLOWED_ORIGINS=https://your-domain.com` に変更すること。
- `ANTHROPIC_API_KEY` は [Anthropic Console](https://console.anthropic.com/) で取得する。未設定の場合、AI タスク分解はヒューリスティックにフォールバックする。

#### スーパーユーザー作成（任意）

```bash
python manage.py createsuperuser
```

Django Admin (`http://localhost:8000/admin/`) からデータを直接操作できる。

#### 管理者グループ運用

- `python manage.py migrate` 実行時に、データマイグレーション `users/migrations/0002_admin_group.py` により **`管理者` という名前の Django Group** が自動作成される。
- **チームおよびプロジェクトの作成はこの `管理者` グループに所属するユーザー（またはスーパーユーザー）のみが実行できる**。
- 管理者権限を付与したいユーザーは、Django Admin の「認証と認可 > ユーザー」画面で対象ユーザーを開き、`Groups` に `管理者` を追加する。
- Django のスーパーユーザー（`is_superuser=True`）はチームメンバーや担当者候補から除外されるため、`管理者` グループに追加する場合は別途一般用アカウントを用意することを推奨する。

---

### フロントエンド

```bash
cd frontend

# 依存パッケージインストール
npm install

# 環境変数設定
# src/vite.config.ts のデフォルト値 (http://localhost:8000) を使う場合は設定不要
# バックエンドの URL を変える場合は .env.local を作成
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

# 開発サーバー起動
npm run dev
```

フロントエンドは `http://localhost:5173` で起動する。

#### フロントエンド環境変数

| 変数名 | デフォルト | 説明 |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | バックエンド API の URL |

---

## 開発サーバー起動手順（まとめ）

1. バックエンド起動:
   ```bash
   cd backend && python manage.py runserver
   ```

2. フロントエンド起動（別ターミナル）:
   ```bash
   cd frontend && npm run dev
   ```

3. ブラウザで `http://localhost:5173` を開く

---

## 主な機能

| 機能 | 説明 |
|---|---|
| ユーザー認証 | JWT ベースのログイン・新規登録。トークン期限切れ時は自動ログアウト |
| プロフィール管理 | 表示名変更（パスワード確認あり）・パスワード変更 |
| チーム管理 | チーム作成・メンバー招待（作成は管理者グループ所属者のみ、メンバー招待は Django のスーパーユーザーを除いた全ユーザーから選択可） |
| プロジェクト管理 | チームごとのプロジェクト作成（管理者グループ所属者のみ）・一覧表示 |
| カンバンボード | Pending / To Do / In Progress / Done の 4列。タスクカードのクリックで詳細ドロワーを表示 |
| タスク管理 | ステータス・優先度・担当者・期限・見積の設定。サブタスクの追加・担当者アサイン |
| AI タスク分解 | Claude API（Sonnet 4.6）で自然言語テキストからタスク・サブタスク・優先度・見積を自動生成。API 未設定時はヒューリスティックにフォールバック |
| AI サジェスト | 今日フォーカスすべきタスクを優先度・期限に基づいて提案 |
| ダッシュボード | チーム別のスタットカード・進行中プロジェクト・進行中メンバー・AI サジェスト表示 |

---

## API 概要

Base URL: `http://localhost:8000/api`

認証が必要なエンドポイントには `Authorization: Bearer {access_token}` ヘッダーを付与すること。

| メソッド | エンドポイント | 説明 |
|---|---|---|
| POST | `/auth/register/` | 新規ユーザー登録 |
| POST | `/auth/login/` | ログイン（JWT 取得） |
| POST | `/auth/token/refresh/` | アクセストークン更新 |
| GET | `/auth/me/` | ログインユーザー情報取得（`is_admin` 含む） |
| PATCH | `/auth/me/display-name/` | 表示名変更（パスワード確認あり） |
| POST | `/auth/me/password/` | パスワード変更 |
| GET/POST | `/teams/` | チーム一覧・作成（作成は管理者グループ所属者のみ） |
| GET/POST | `/team-memberships/` | メンバー一覧・追加（`?team={id}` フィルタ対応、追加はオーナーのみ） |
| GET | `/users/` | 全ユーザー一覧（Django のスーパーユーザーを除外） |
| GET/POST | `/projects/` | プロジェクト一覧・作成（`?team={id}` フィルタ対応、作成は管理者グループ所属者のみ） |
| GET/POST | `/tasks/` | タスク一覧・作成（`?project`, `?parent`, `?status` 等フィルタ対応） |
| PATCH/DELETE | `/tasks/{id}/` | タスク更新・削除 |
| GET/POST | `/tasks/{id}/comments/` | コメント取得・投稿 |
| POST | `/ai/parse-task/` | 自然言語テキストからタスク情報を抽出 |
| POST | `/ai/suggest-today/` | 今日フォーカスすべきタスクを提案 |

詳細な仕様は `詳細設計.md` を参照。

---

## 認証フロー

1. `/auth/login/` でログインすると `{ access, refresh }` トークンを取得
2. トークンは `localStorage` の `taskapp_tokens` キーに保存
3. 全 API リクエストに `Authorization: Bearer {access}` を自動付与
4. アクセストークン期限切れ（401）時は自動ログアウトし `/login` にリダイレクト

---

## ビルド

### フロントエンド本番ビルド

```bash
cd frontend
npm run build
# dist/ ディレクトリに成果物が生成される
```

### バックエンド本番設定

本番環境は AWS ECS Fargate 上で Docker コンテナとして稼働する。

```bash
# Docker イメージビルド
docker build -t task-management-backend:latest ./backend

# ECR にログイン & push
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com
docker tag task-management-backend:latest <ECR_URL>:latest
docker push <ECR_URL>:latest

# ECS サービス再デプロイ
aws ecs update-service --cluster task-management-cluster --service task-management-backend-service --force-new-deployment
```

環境変数は Terraform により自動設定される:
- `SECRET_KEY` / `DATABASE_URL`: AWS Secrets Manager から注入
- `ALLOWED_HOSTS` / `CORS_ALLOWED_ORIGINS`: ALB DNS 名 / S3 URL から自動設定
- 静的ファイルは WhiteNoise ミドルウェアにより Gunicorn から直接配信

---

## AWS インフラ構築

### 前提条件

- AWS CLI（`aws configure` で IAM 認証情報設定済み）
- Terraform 1.9 以上
- Docker Desktop

### 構築手順

```bash
cd terraform
terraform init
terraform plan
terraform apply   # "yes" を入力

# DB マイグレーション（ECS run-task で単発実行）
# 詳細は command.md を参照
```

### 主要リソース

| リソース | 説明 |
|---|---|
| VPC | 10.128.0.0/16, 2 AZ |
| ECS Fargate | Django + Gunicorn コンテナ |
| ALB | HTTP ロードバランサー |
| RDS PostgreSQL | db.t4g.micro, 16.9 |
| S3 | フロントエンド静的ホスティング |
| ECR | Docker イメージレジストリ |
| Secrets Manager | SECRET_KEY, DATABASE_URL |

