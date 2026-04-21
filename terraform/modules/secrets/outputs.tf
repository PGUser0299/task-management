output "django_secret_key_arn" {
  description = "Secrets Manager ARN for Django SECRET_KEY"
  value       = aws_secretsmanager_secret.django_secret_key.arn
}

output "database_url_arn" {
  description = "Secrets Manager ARN for DATABASE_URL"
  value       = aws_secretsmanager_secret.database_url.arn
}

output "anthropic_api_key_arn" {
  description = "Secrets Manager ARN for Anthropic API Key"
  value       = aws_secretsmanager_secret.anthropic_api_key.arn
}
