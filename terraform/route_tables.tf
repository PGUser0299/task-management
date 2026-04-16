# ============================================================
# Public route table
# Internet → IGW → ALB (public_app subnets)
# ============================================================
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-rt-public"
  })
}

resource "aws_route_table_association" "public_app" {
  count          = length(aws_subnet.public_app)
  subnet_id      = aws_subnet.public_app[count.index].id
  route_table_id = aws_route_table.public.id
}

# ============================================================
# Private app route table
# ALB → ECS (private_app subnets)
# S3 Gateway endpoint のルートはエンドポイント作成時に自動追加される
# ============================================================
resource "aws_route_table" "private_app" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-rt-private-app"
  })
}

resource "aws_route_table_association" "private_app" {
  count          = length(aws_subnet.private_app)
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private_app.id
}

# ============================================================
# Private DB route table
# ECS → RDS (private_db subnets)
# インターネットへの経路なし
# ============================================================
resource "aws_route_table" "private_db" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-rt-private-db"
  })
}

resource "aws_route_table_association" "private_db" {
  count          = length(aws_subnet.private_db)
  subnet_id      = aws_subnet.private_db[count.index].id
  route_table_id = aws_route_table.private_db.id
}
