# Public subnets — ALB を配置 (Internet-facing)

resource "aws_subnet" "public_app" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_app_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  # ALB への public IP 自動割り当て
  map_public_ip_on_launch = true

  tags = merge(local.common_tags, {
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

  tags = merge(local.common_tags, {
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

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-subnet-private-db-${var.availability_zones[count.index]}"
    Tier = "private-db"
  })
}
