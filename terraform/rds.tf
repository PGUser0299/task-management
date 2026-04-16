# ============================================================
# DB サブネットグループ (private_db サブネットに RDS を配置)
# ============================================================
resource "aws_db_subnet_group" "main" {
  name       = "${lower(var.project_name)}-db-subnet-group"
  subnet_ids = aws_subnet.private_db[*].id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-db-subnet-group"
  })
}

# ============================================================
# RDS PostgreSQL (開発環境向け最小構成)
# ============================================================
resource "aws_db_instance" "main" {
  identifier = "${lower(var.project_name)}-db"

  engine         = "postgres"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = 0 # ストレージ自動拡張オフ (dev)
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_master_username
  password = random_password.db_master.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false
  multi_az               = false # dev: 単一 AZ

  # 開発環境向け最小バックアップ
  backup_retention_period = 1
  skip_final_snapshot     = true
  deletion_protection     = false

  # メンテナンスウィンドウ (UTC, 任意)
  maintenance_window = "sun:16:00-sun:17:00" # JST 日曜 1:00-2:00

  # Performance Insights は無効化 (dev)
  performance_insights_enabled = false

  # 軽量化のため拡張モニタリングも無効
  monitoring_interval = 0

  apply_immediately = true

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-db"
  })

  lifecycle {
    ignore_changes = [password]
  }
}
