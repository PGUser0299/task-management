output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "service_name" {
  description = "ECS service name for the backend"
  value       = aws_ecs_service.backend.name
}

output "migration_task_definition_arn" {
  description = "ECS task definition ARN for running Django migrations"
  value       = aws_ecs_task_definition.migrate.arn
}

output "migration_task_definition_family" {
  description = "ECS task definition family for migrations"
  value       = aws_ecs_task_definition.migrate.family
}
