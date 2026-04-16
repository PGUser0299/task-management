# ============================================================
# Application Load Balancer (public_app サブネットに配置)
# ============================================================
resource "aws_lb" "main" {
  name               = "${lower(var.project_name)}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public_app[*].id

  # 本番では true (削除保護) を検討
  enable_deletion_protection = false

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-alb"
  })
}

# ============================================================
# Target Group (ECS Fargate → target_type = ip)
# ============================================================
resource "aws_lb_target_group" "backend" {
  name        = "${lower(var.project_name)}-tg-backend"
  port        = var.ecs_container_port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  # Django のヘルスチェック対象 URL
  health_check {
    enabled             = true
    path                = "/api/"
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  deregistration_delay = 30

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-tg-backend"
  })
}

# ============================================================
# HTTP Listener (forward to target group)
# ============================================================
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-listener-http"
  })
}
