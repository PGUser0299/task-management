# CloudWatch Log Group (ECS タスクログの送信先)

resource "aws_cloudwatch_log_group" "ecs_backend" {
  name              = "/ecs/${var.project_name}/backend"
  retention_in_days = 3 # dev: 短め

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-ecs-backend-logs"
  })
}


# ECS Cluster (Fargate)

resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  # dev: Container Insights 無効化
  setting {
    name  = "containerInsights"
    value = "disabled"
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-cluster"
  })
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 1
  }
}


# Task Definition (Backend = Django + Gunicorn)

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory

  execution_role_arn = aws_iam_role.ecs_task_execution.arn
  task_role_arn      = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:${var.backend_image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = var.ecs_container_port
          protocol      = "tcp"
        }
      ]

      # 平文の環境変数 (機密でない設定値)
      environment = [
        { name = "DEBUG", value = "False" },
        { name = "ALLOWED_HOSTS", value = local.django_allowed_hosts },
        { name = "CORS_ALLOW_ALL_ORIGINS", value = "False" },
        { name = "CORS_ALLOWED_ORIGINS", value = local.frontend_url },
      ]

      # Secrets Manager から注入 (機密情報)
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
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-task"
  })
}


# ECS Service

resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  # dev: public サブネットに配置し、タスクに public IP を付与
  network_configuration {
    subnets          = aws_subnet.public_app[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = var.ecs_container_port
  }

  # デプロイ時の循環防止 (CI/CD で image tag を更新するパターン向け)
  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  depends_on = [
    aws_lb_listener.http,
    aws_iam_role_policy_attachment.ecs_task_execution_managed,
    aws_iam_role_policy.ecs_task_execution_secrets,
  ]

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-backend-service"
  })
}
