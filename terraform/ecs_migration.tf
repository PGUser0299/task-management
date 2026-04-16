# Migration Task Definition
# 単発実行用: `aws ecs run-task` で呼び出して `python manage.py migrate`

resource "aws_ecs_task_definition" "migrate" {
  family                   = "${var.project_name}-migrate"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory

  execution_role_arn = aws_iam_role.ecs_task_execution.arn
  task_role_arn      = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "migrate"
      image     = "${aws_ecr_repository.backend.repository_url}:${var.backend_image_tag}"
      essential = true

      # Dockerfile の CMD を上書きして migrate のみ実行
      command = ["python", "manage.py", "migrate", "--noinput"]

      environment = [
        { name = "DEBUG", value = "False" },
        { name = "ALLOWED_HOSTS", value = "*" },
      ]

      secrets = [
        {
          name      = "SECRET_KEY"
          valueFrom = aws_secretsmanager_secret.django_secret_key.arn
        },
        {
          name      = "DATABASE_URL"
          valueFrom = aws_secretsmanager_secret.database_url.arn
        },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "migrate"
        }
      }
    }
  ])

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-migrate"
  })
}
