variable "project_name" {
  description = "Project name used as a prefix for all resource names"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for ECS tasks"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "execution_role_arn" {
  description = "ARN of the ECS task execution role"
  type        = string
}

variable "task_role_arn" {
  description = "ARN of the ECS task role"
  type        = string
}

variable "ecr_repository_url" {
  description = "ECR repository URL for the backend image"
  type        = string
}

variable "backend_image_tag" {
  description = "Tag of the backend Docker image to deploy"
  type        = string
}

variable "target_group_arn" {
  description = "ARN of the ALB target group"
  type        = string
}

variable "alb_dns_name" {
  description = "DNS name of the ALB (for ALLOWED_HOSTS)"
  type        = string
}

variable "frontend_url" {
  description = "Frontend URL (for CORS_ALLOWED_ORIGINS)"
  type        = string
}

variable "django_secret_key_arn" {
  description = "Secrets Manager ARN for Django SECRET_KEY"
  type        = string
}

variable "database_url_arn" {
  description = "Secrets Manager ARN for DATABASE_URL"
  type        = string
}

variable "anthropic_api_key_arn" {
  description = "Secrets Manager ARN for Anthropic API Key"
  type        = string
}

variable "container_port" {
  description = "Container port exposed by the backend application"
  type        = number
}

variable "ecs_task_cpu" {
  description = "ECS Fargate task CPU units"
  type        = string
}

variable "ecs_task_memory" {
  description = "ECS Fargate task memory (MiB)"
  type        = string
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
}

variable "ecs_autoscaling_min" {
  description = "Minimum number of ECS tasks"
  type        = number
}

variable "ecs_autoscaling_max" {
  description = "Maximum number of ECS tasks"
  type        = number
}

variable "ecs_cpu_target" {
  description = "Target CPU utilization for ECS autoscaling (percent)"
  type        = number
}

variable "ecs_memory_target" {
  description = "Target memory utilization for ECS autoscaling (percent)"
  type        = number
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
}
