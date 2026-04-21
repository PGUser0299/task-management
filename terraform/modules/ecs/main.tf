# CloudWatch Log Group (ECS タスクログの送信先)

resource "aws_cloudwatch_log_group" "ecs_backend" {
  name              = "/ecs/${var.project_name}/backend"
  retention_in_days = 3 # dev: 短め

  tags = merge(var.common_tags, {
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

  tags = merge(var.common_tags, {
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

  execution_role_arn = var.execution_role_arn
  task_role_arn      = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${var.ecr_repository_url}:${var.backend_image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]

      # 平文の環境変数 (機密でない設定値)
      environment = [
        { name = "DEBUG", value = "False" },
        { name = "ALLOWED_HOSTS", value = var.alb_dns_name },
        { name = "CORS_ALLOW_ALL_ORIGINS", value = "False" },
        { name = "CORS_ALLOWED_ORIGINS", value = var.frontend_url },
      ]

      # Secrets Manager から注入 (機密情報)
      secrets = [
        {
          name      = "SECRET_KEY"
          valueFrom = var.django_secret_key_arn
        },
        {
          name      = "DATABASE_URL"
          valueFrom = var.database_url_arn
        },
        {
          name      = "ANTHROPIC_API_KEY"
          valueFrom = var.anthropic_api_key_arn
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

  tags = merge(var.common_tags, {
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
    subnets          = var.subnet_ids
    security_groups  = [var.security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = "backend"
    container_port   = var.container_port
  }

  # デプロイ時の循環防止 (CI/CD で image tag を更新するパターン向け)
  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-backend-service"
  })
}


# Migration Task Definition
# 単発実行用: `aws ecs run-task` で呼び出して `python manage.py migrate`

resource "aws_ecs_task_definition" "migrate" {
  family                   = "${var.project_name}-migrate"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ecs_task_cpu
  memory                   = var.ecs_task_memory

  execution_role_arn = var.execution_role_arn
  task_role_arn      = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = "migrate"
      image     = "${var.ecr_repository_url}:${var.backend_image_tag}"
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
          valueFrom = var.django_secret_key_arn
        },
        {
          name      = "DATABASE_URL"
          valueFrom = var.database_url_arn
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

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-migrate"
  })
}


# ECS サービスのターゲット追跡オートスケーリング
# CPU / メモリ使用率を基準に task 数を自動調整

resource "aws_appautoscaling_target" "ecs_backend" {
  max_capacity       = var.ecs_autoscaling_max
  min_capacity       = var.ecs_autoscaling_min
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# CPU ベースのスケーリング
resource "aws_appautoscaling_policy" "ecs_cpu" {
  name               = "${var.project_name}-ecs-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_backend.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = var.ecs_cpu_target

    # スケールイン: 負荷低下から 5 分経過で縮小
    scale_in_cooldown = 300
    # スケールアウト: 1 分で拡張 (スパイクに早く反応)
    scale_out_cooldown = 60
  }
}

# メモリベースのスケーリング
resource "aws_appautoscaling_policy" "ecs_memory" {
  name               = "${var.project_name}-ecs-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_backend.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value       = var.ecs_memory_target
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
