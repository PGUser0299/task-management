# Django SECRET_KEY (ランダム生成)

resource "random_password" "django_secret_key" {
  length  = 50
  special = true
  # Django SECRET_KEY で問題になりがちな文字を除外
  override_special = "!@#$%^&*()-_=+[]{}"
}

resource "aws_secretsmanager_secret" "django_secret_key" {
  name                    = "${var.project_name}/django-secret-key"
  description             = "Django SECRET_KEY for ${var.project_name}"
  recovery_window_in_days = 0 # 即時削除を許可 (本番は 7〜30 日)

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-django-secret-key"
  })
}

resource "aws_secretsmanager_secret_version" "django_secret_key" {
  secret_id     = aws_secretsmanager_secret.django_secret_key.id
  secret_string = random_password.django_secret_key.result
}


# RDS master password (ランダム生成)

resource "random_password" "db_master" {
  length  = 32
  special = false # 特殊文字を回避
}


# DATABASE_URL
# RDS作成後に構築し、ECS タスクへ環境変数として注入

resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.project_name}/database-url"
  description             = "PostgreSQL DATABASE_URL for Django"
  recovery_window_in_days = 0

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-database-url"
  })
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id = aws_secretsmanager_secret.database_url.id
  secret_string = format(
    "postgres://%s:%s@%s:%d/%s",
    aws_db_instance.main.username,
    random_password.db_master.result,
    aws_db_instance.main.address,
    aws_db_instance.main.port,
    aws_db_instance.main.db_name,
  )
}
