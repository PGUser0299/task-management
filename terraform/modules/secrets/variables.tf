variable "project_name" {
  description = "Project name used as a prefix for all resource names"
  type        = string
}

variable "db_address" {
  description = "RDS instance address (hostname)"
  type        = string
}

variable "db_port" {
  description = "RDS instance port"
  type        = number
}

variable "db_name" {
  description = "RDS database name"
  type        = string
}

variable "db_username" {
  description = "RDS master username"
  type        = string
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key for AI task decomposition"
  type        = string
  sensitive   = true
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
}
