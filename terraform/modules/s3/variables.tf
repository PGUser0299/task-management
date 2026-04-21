variable "project_name" {
  description = "Project name used as a prefix for all resource names"
  type        = string
}

variable "frontend_bucket_name" {
  description = "S3 bucket name for the frontend (must be globally unique). Leave empty to auto-generate"
  type        = string
  default     = ""
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
}
