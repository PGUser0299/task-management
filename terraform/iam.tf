# ============================================================
# ECS タスク用 AssumeRole ポリシー (共通)
# ============================================================
data "aws_iam_policy_document" "ecs_task_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# ============================================================
# ECS Task Execution Role
# コンテナ起動時に ECR からイメージを pull したり、
# CloudWatch Logs にログを書き込んだり、
# Secrets Manager からシークレットを取得するためのロール
# ============================================================
resource "aws_iam_role" "ecs_task_execution" {
  name               = "${var.project_name}-ecs-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-ecs-task-execution"
  })
}

# AWS マネージドポリシー (ECR pull, CloudWatch Logs 書き込み)
resource "aws_iam_role_policy_attachment" "ecs_task_execution_managed" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Secrets Manager から SECRET_KEY / DATABASE_URL を取得する権限
resource "aws_iam_role_policy" "ecs_task_execution_secrets" {
  name = "${var.project_name}-ecs-task-execution-secrets"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue",
      ]
      Resource = [
        aws_secretsmanager_secret.django_secret_key.arn,
        aws_secretsmanager_secret.database_url.arn,
      ]
    }]
  })
}

# ============================================================
# ECS Task Role
# アプリケーションが AWS API を呼び出すためのロール
# (現状は特に権限不要だが、将来 S3 upload 等で拡張可能)
# ============================================================
resource "aws_iam_role" "ecs_task" {
  name               = "${var.project_name}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume.json

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-ecs-task"
  })
}
