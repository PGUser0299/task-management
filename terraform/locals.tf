locals {
  common_tags = {
    Project   = var.project_name
    ManagedBy = "terraform"
  }

  # フロントエンド URL (CORS_ALLOWED_ORIGINS で使用)
  frontend_url = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"

  # ALLOWED_HOSTS (ALB DNS 名のみ)
  django_allowed_hosts = aws_lb.main.dns_name
}
