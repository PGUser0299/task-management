# ============================================================
# ECS サービスのターゲット追跡オートスケーリング
# CPU / メモリ使用率を基準に task 数を自動調整
# ============================================================

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
