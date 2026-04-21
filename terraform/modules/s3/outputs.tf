output "bucket_name" {
  description = "S3 bucket name for the frontend"
  value       = aws_s3_bucket.frontend.id
}

output "website_endpoint" {
  description = "S3 static website endpoint"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "frontend_url" {
  description = "Frontend URL (S3 website)"
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}
