# VPC

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.networking.vpc_id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = module.networking.vpc_cidr
}


# Subnets

output "public_app_subnet_ids" {
  description = "IDs of public application subnets (for ALB)"
  value       = module.networking.public_app_subnet_ids
}

output "private_app_subnet_ids" {
  description = "IDs of private application subnets (for ECS)"
  value       = module.networking.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  description = "IDs of private DB subnets (for RDS)"
  value       = module.networking.private_db_subnet_ids
}


# Security Groups

output "alb_sg_id" {
  description = "Security group ID for ALB"
  value       = module.networking.alb_security_group_id
}

output "ecs_sg_id" {
  description = "Security group ID for ECS tasks"
  value       = module.networking.ecs_security_group_id
}

output "db_sg_id" {
  description = "Security group ID for RDS"
  value       = module.networking.db_security_group_id
}


# VPC Endpoints

output "vpce_s3_id" {
  description = "VPC Endpoint ID for S3 (Gateway)"
  value       = module.networking.vpce_s3_id
}


# ECR

output "ecr_repository_url" {
  description = "ECR repository URL for the backend image"
  value       = module.ecr.repository_url
}


# ECS

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name for the backend"
  value       = module.ecs.service_name
}


# ALB

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.dns_name
}

output "alb_url" {
  description = "Backend URL (HTTP)"
  value       = module.alb.url
}


# RDS

output "rds_endpoint" {
  description = "RDS instance endpoint (hostname)"
  value       = module.rds.endpoint
}

output "rds_port" {
  description = "RDS instance port"
  value       = module.rds.port
}

output "rds_database_name" {
  description = "RDS initial database name"
  value       = module.rds.database_name
}


# Secrets Manager

output "django_secret_key_arn" {
  description = "Secrets Manager ARN for Django SECRET_KEY"
  value       = module.secrets.django_secret_key_arn
}

output "database_url_secret_arn" {
  description = "Secrets Manager ARN for DATABASE_URL"
  value       = module.secrets.database_url_arn
}


# S3 Frontend

output "frontend_bucket_name" {
  description = "S3 bucket name for the frontend"
  value       = module.s3.bucket_name
}

output "frontend_website_endpoint" {
  description = "S3 static website endpoint"
  value       = module.s3.website_endpoint
}

output "frontend_url" {
  description = "Frontend URL (S3 website)"
  value       = module.s3.frontend_url
}


# Migration

output "migration_task_definition_arn" {
  description = "ECS task definition ARN for running Django migrations"
  value       = module.ecs.migration_task_definition_arn
}

output "migration_run_command" {
  description = "AWS CLI command to run migrations"
  value = join(" ", [
    "aws ecs run-task",
    "--cluster ${module.ecs.cluster_name}",
    "--task-definition ${module.ecs.migration_task_definition_family}",
    "--launch-type FARGATE",
    "--network-configuration 'awsvpcConfiguration={subnets=[${join(",", module.networking.public_app_subnet_ids)}],securityGroups=[${module.networking.ecs_security_group_id}],assignPublicIp=ENABLED}'",
    "--region ${var.aws_region}",
  ])
}
