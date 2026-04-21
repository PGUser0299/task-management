variable "project_name" {
  description = "Project name used as a prefix for all resource names"
  type        = string
}

variable "secret_arns" {
  description = "List of Secrets Manager secret ARNs that ECS tasks need access to"
  type        = list(string)
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
}
