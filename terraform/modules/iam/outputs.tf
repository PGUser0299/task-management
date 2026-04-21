output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task.arn
}

output "ecs_task_execution_role_name" {
  description = "Name of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution.name
}

output "ecs_task_execution_policy_attachment_id" {
  description = "ID of the managed policy attachment (for depends_on)"
  value       = aws_iam_role_policy_attachment.ecs_task_execution_managed.id
}

output "ecs_task_execution_secrets_policy_id" {
  description = "ID of the secrets inline policy (for depends_on)"
  value       = aws_iam_role_policy.ecs_task_execution_secrets.id
}
