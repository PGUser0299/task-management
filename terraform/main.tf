terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region
}


locals {
  common_tags = {
    Project   = var.project_name
    ManagedBy = "terraform"
  }
}


# Networking (VPC, Subnets, IGW, Route Tables, Security Groups, VPC Endpoints)

module "networking" {
  source = "./modules/networking"

  project_name             = var.project_name
  aws_region               = var.aws_region
  vpc_cidr                 = var.vpc_cidr
  availability_zones       = var.availability_zones
  public_app_subnet_cidrs  = var.public_app_subnet_cidrs
  private_app_subnet_cidrs = var.private_app_subnet_cidrs
  private_db_subnet_cidrs  = var.private_db_subnet_cidrs
  common_tags              = local.common_tags
}


# ECR

module "ecr" {
  source = "./modules/ecr"

  repository_name = var.ecr_repository_name
  common_tags     = local.common_tags
}


# S3 (静的ウェブサイトホスティング)

module "s3" {
  source = "./modules/s3"

  project_name         = var.project_name
  frontend_bucket_name = var.frontend_bucket_name
  common_tags          = local.common_tags
}


# ALB

module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  vpc_id            = module.networking.vpc_id
  subnet_ids        = module.networking.public_app_subnet_ids
  security_group_id = module.networking.alb_security_group_id
  container_port    = var.ecs_container_port
  common_tags       = local.common_tags
}


# RDS

module "rds" {
  source = "./modules/rds"

  project_name         = var.project_name
  subnet_ids           = module.networking.private_db_subnet_ids
  security_group_id    = module.networking.db_security_group_id
  db_engine_version    = var.db_engine_version
  db_instance_class    = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_name              = var.db_name
  db_master_username   = var.db_master_username
  common_tags          = local.common_tags
}


# Secrets Manager

module "secrets" {
  source = "./modules/secrets"

  project_name      = var.project_name
  db_address        = module.rds.endpoint
  db_port           = module.rds.port
  db_name           = module.rds.database_name
  db_username       = module.rds.username
  db_password       = module.rds.master_password
  anthropic_api_key = var.anthropic_api_key
  common_tags       = local.common_tags
}


# IAM

module "iam" {
  source = "./modules/iam"

  project_name = var.project_name
  secret_arns = [
    module.secrets.django_secret_key_arn,
    module.secrets.database_url_arn,
    module.secrets.anthropic_api_key_arn,
  ]
  common_tags = local.common_tags
}


# ECS (Cluster, Task Definitions, Service, Autoscaling)

module "ecs" {
  source = "./modules/ecs"

  project_name        = var.project_name
  aws_region          = var.aws_region
  subnet_ids          = module.networking.public_app_subnet_ids
  security_group_id   = module.networking.ecs_security_group_id
  execution_role_arn  = module.iam.ecs_task_execution_role_arn
  task_role_arn       = module.iam.ecs_task_role_arn
  ecr_repository_url  = module.ecr.repository_url
  backend_image_tag   = var.backend_image_tag
  target_group_arn    = module.alb.target_group_arn
  alb_dns_name        = module.alb.dns_name
  frontend_url        = module.s3.frontend_url
  django_secret_key_arn = module.secrets.django_secret_key_arn
  database_url_arn      = module.secrets.database_url_arn
  anthropic_api_key_arn = module.secrets.anthropic_api_key_arn
  container_port      = var.ecs_container_port
  ecs_task_cpu        = var.ecs_task_cpu
  ecs_task_memory     = var.ecs_task_memory
  ecs_desired_count   = var.ecs_desired_count
  ecs_autoscaling_min = var.ecs_autoscaling_min
  ecs_autoscaling_max = var.ecs_autoscaling_max
  ecs_cpu_target      = var.ecs_cpu_target
  ecs_memory_target   = var.ecs_memory_target
  common_tags         = local.common_tags
}
