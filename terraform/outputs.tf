# ============================================================
# VPC
# ============================================================
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

# ============================================================
# Subnets
# ============================================================
output "public_app_subnet_ids" {
  description = "IDs of public application subnets (for ALB)"
  value       = aws_subnet.public_app[*].id
}

output "private_app_subnet_ids" {
  description = "IDs of private application subnets (for ECS)"
  value       = aws_subnet.private_app[*].id
}

output "private_db_subnet_ids" {
  description = "IDs of private DB subnets (for RDS)"
  value       = aws_subnet.private_db[*].id
}

# ============================================================
# Security Groups
# ============================================================
output "alb_sg_id" {
  description = "Security group ID for ALB"
  value       = aws_security_group.alb.id
}

output "ecs_sg_id" {
  description = "Security group ID for ECS tasks"
  value       = aws_security_group.ecs.id
}

output "db_sg_id" {
  description = "Security group ID for RDS"
  value       = aws_security_group.db.id
}

# ============================================================
# VPC Endpoints
# ============================================================
output "vpce_s3_id" {
  description = "VPC Endpoint ID for S3 (Gateway)"
  value       = aws_vpc_endpoint.s3.id
}

# ============================================================
# ECR
# ============================================================
output "ecr_repository_url" {
  description = "ECR repository URL for the backend image"
  value       = aws_ecr_repository.backend.repository_url
}

# ============================================================
# ECS
# ============================================================
output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name for the backend"
  value       = aws_ecs_service.backend.name
}

# ============================================================
# ALB
# ============================================================
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_url" {
  description = "Backend URL (HTTP)"
  value       = "http://${aws_lb.main.dns_name}"
}

# ============================================================
# RDS
# ============================================================
output "rds_endpoint" {
  description = "RDS instance endpoint (hostname)"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "rds_database_name" {
  description = "RDS initial database name"
  value       = aws_db_instance.main.db_name
}

# ============================================================
# Secrets Manager
# ============================================================
output "django_secret_key_arn" {
  description = "Secrets Manager ARN for Django SECRET_KEY"
  value       = aws_secretsmanager_secret.django_secret_key.arn
}

output "database_url_secret_arn" {
  description = "Secrets Manager ARN for DATABASE_URL"
  value       = aws_secretsmanager_secret.database_url.arn
}

# ============================================================
# S3 Frontend
# ============================================================
output "frontend_bucket_name" {
  description = "S3 bucket name for the frontend"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_website_endpoint" {
  description = "S3 static website endpoint"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "frontend_url" {
  description = "Frontend URL (S3 website)"
  value       = local.frontend_url
}

# ============================================================
# Migration
# ============================================================
output "migration_task_definition_arn" {
  description = "ECS task definition ARN for running Django migrations"
  value       = aws_ecs_task_definition.migrate.arn
}

output "migration_run_command" {
  description = "AWS CLI command to run migrations (requires jq-style subnet/SG interpolation)"
  value = join(" ", [
    "aws ecs run-task",
    "--cluster ${aws_ecs_cluster.main.name}",
    "--task-definition ${aws_ecs_task_definition.migrate.family}",
    "--launch-type FARGATE",
    "--network-configuration 'awsvpcConfiguration={subnets=[${join(",", aws_subnet.public_app[*].id)}],securityGroups=[${aws_security_group.ecs.id}],assignPublicIp=ENABLED}'",
    "--region ${var.aws_region}",
  ])
}
