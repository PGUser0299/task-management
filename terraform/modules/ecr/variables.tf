variable "repository_name" {
  description = "ECR repository name for the backend image"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
}
