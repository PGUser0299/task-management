# VPC

resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr

  # Interface endpoint の private DNS 解決に必須
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-vpc"
  })
}


# Public subnets — ALB を配置 (Internet-facing)

resource "aws_subnet" "public_app" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_app_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  # ALB への public IP 自動割り当て
  map_public_ip_on_launch = true

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-subnet-public-app-${var.availability_zones[count.index]}"
    Tier = "public-app"
  })
}


# Private subnets — ECS(ALB から受信、RDS へ送信 将来用)

resource "aws_subnet" "private_app" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_app_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-subnet-private-app-${var.availability_zones[count.index]}"
    Tier = "private-app"
  })
}


# Private subnets — RDS(ECS からのみ受信)

resource "aws_subnet" "private_db" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_db_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-subnet-private-db-${var.availability_zones[count.index]}"
    Tier = "private-db"
  })
}


# Internet Gateway

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-igw"
  })
}


# Public route table
# Internet → IGW → ALB (public_app subnets)

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-rt-public"
  })
}

resource "aws_route_table_association" "public_app" {
  count          = length(aws_subnet.public_app)
  subnet_id      = aws_subnet.public_app[count.index].id
  route_table_id = aws_route_table.public.id
}


# Private app route table
# ALB → ECS (private_app subnets)

resource "aws_route_table" "private_app" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-rt-private-app"
  })
}

resource "aws_route_table_association" "private_app" {
  count          = length(aws_subnet.private_app)
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private_app.id
}


# Private DB route table
# ECS → RDS (private_db subnets)
# インターネットへの経路なし

resource "aws_route_table" "private_db" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-rt-private-db"
  })
}

resource "aws_route_table_association" "private_db" {
  count          = length(aws_subnet.private_db)
  subnet_id      = aws_subnet.private_db[count.index].id
  route_table_id = aws_route_table.private_db.id
}


# Security Group 本体 (ルールは後述 — 循環参照を回避するため分離)

resource "aws_security_group" "alb" {
  name        = "${var.project_name}-sg-alb"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-sg-alb"
  })
}

resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-sg-ecs"
  description = "Security group for ECS Fargate tasks"
  vpc_id      = aws_vpc.main.id

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-sg-ecs"
  })
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-sg-db"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-sg-db"
  })
}


# ALB ルール
#   Ingress : 80/443 from Internet
#   Egress  : 8000 to ECS

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTP from internet"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTPS from internet"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "alb_to_ecs" {
  security_group_id            = aws_security_group.alb.id
  description                  = "To ECS app port"
  from_port                    = 8000
  to_port                      = 8000
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ecs.id
}


# ECS ルール
#   Ingress : 8000 from ALB
#   Egress  : 443 to Internet (ECR / CloudWatch Logs / Secrets Manager)
#             5432 to RDS

resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  security_group_id            = aws_security_group.ecs.id
  description                  = "App port from ALB"
  from_port                    = 8000
  to_port                      = 8000
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.alb.id
}

resource "aws_vpc_security_group_egress_rule" "ecs_egress_https" {
  security_group_id = aws_security_group.ecs.id
  description       = "HTTPS to AWS services (ECR, CloudWatch Logs, Secrets Manager, S3)"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "ecs_to_db" {
  security_group_id            = aws_security_group.ecs.id
  description                  = "PostgreSQL to RDS"
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.db.id
}


# DB ルール
#   Ingress : 5432 from ECS

resource "aws_vpc_security_group_ingress_rule" "db_from_ecs" {
  security_group_id            = aws_security_group.db.id
  description                  = "PostgreSQL from ECS"
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ecs.id
}


# S3 マネージドプレフィックスリスト (ECS SG の egress ルールで参照)

data "aws_ec2_managed_prefix_list" "s3" {
  name = "com.amazonaws.${var.aws_region}.s3"
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"

  # ECS が存在する public route table と、private_app に両対応
  route_table_ids = [
    aws_route_table.public.id,
    aws_route_table.private_app.id,
  ]

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-vpce-s3"
  })
}
