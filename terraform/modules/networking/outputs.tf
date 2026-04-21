output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

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

output "alb_security_group_id" {
  description = "Security group ID for ALB"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  value       = aws_security_group.ecs.id
}

output "db_security_group_id" {
  description = "Security group ID for RDS"
  value       = aws_security_group.db.id
}

output "vpce_s3_id" {
  description = "VPC Endpoint ID for S3 (Gateway)"
  value       = aws_vpc_endpoint.s3.id
}
