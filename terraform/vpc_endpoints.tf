# ============================================================
# dev 向け: Interface Endpoint は全て削除 (~$29/月削減)
# ECS はパブリックサブネットに配置するため、ECR / Logs /
# Secrets Manager へのアクセスは IGW 経由で行う
#
# S3 Gateway Endpoint のみ残す: 無料で、同一リージョン S3 アクセスを
# AWS 内部ネットワーク経由にできる
# ============================================================

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

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-vpce-s3"
  })
}
