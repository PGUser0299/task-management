variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project name used as a prefix for all resource names"
  type        = string
  default     = "task-management"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.128.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones to deploy resources into"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

# Public subnets (ALB)
variable "public_app_subnet_cidrs" {
  description = "CIDR blocks for public application subnets (one per AZ, used for ALB)"
  type        = list(string)
  default     = ["10.128.1.0/24", "10.128.2.0/24"]
}

# Private subnets (ECS将来用)
variable "private_app_subnet_cidrs" {
  description = "CIDR blocks for private application subnets (one per AZ, used for ECS)"
  type        = list(string)
  default     = ["10.128.11.0/24", "10.128.12.0/24"]
}

# Private subnets (RDS)
variable "private_db_subnet_cidrs" {
  description = "CIDR blocks for private DB subnets (one per AZ, used for RDS)"
  type        = list(string)
  default     = ["10.128.21.0/24", "10.128.22.0/24"]
}


# ECR

variable "ecr_repository_name" {
  description = "ECR repository name for the backend image"
  type        = string
  default     = "task-management-backend"
}


# ECS

variable "ecs_task_cpu" {
  description = "ECS Fargate task CPU units"
  type        = string
  default     = "256" # dev: minimal
}

variable "ecs_task_memory" {
  description = "ECS Fargate task memory (MiB)"
  type        = string
  default     = "512" # dev: minimal
}

variable "ecs_container_port" {
  description = "Container port exposed by the backend application"
  type        = number
  default     = 8000
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1 # dev: single task
}

variable "backend_image_tag" {
  description = "Tag of the backend Docker image to deploy"
  type        = string
  default     = "latest"
}


# ECS Autoscaling

variable "ecs_autoscaling_min" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 1 # dev
}

variable "ecs_autoscaling_max" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 2 # dev
}

variable "ecs_cpu_target" {
  description = "Target CPU utilization for ECS autoscaling (percent)"
  type        = number
  default     = 70
}

variable "ecs_memory_target" {
  description = "Target memory utilization for ECS autoscaling (percent)"
  type        = number
  default     = 75
}


# RDS PostgreSQL

variable "db_engine_version" {
  description = "PostgreSQL engine version (must be available in target region — check with: aws rds describe-db-engine-versions --engine postgres)"
  type        = string
  default     = "16.9"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro" # dev: minimal
}

variable "db_allocated_storage" {
  description = "RDS allocated storage (GB)"
  type        = number
  default     = 20 # GP3 minimum
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "taskmanagement"
}

variable "db_master_username" {
  description = "Master username for RDS"
  type        = string
  default     = "dbadmin"
}


# S3 (Frontend static hosting)

variable "frontend_bucket_name" {
  description = "S3 bucket name for the frontend (must be globally unique). Leave empty to auto-generate from project name + account ID"
  type        = string
  default     = ""
}


