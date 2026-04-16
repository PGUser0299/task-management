data "aws_caller_identity" "current" {}

locals {
  # バケット名未指定時は project_name + account ID で自動生成
  frontend_bucket_name = coalesce(
    var.frontend_bucket_name != "" ? var.frontend_bucket_name : null,
    "${lower(var.project_name)}-frontend-${data.aws_caller_identity.current.account_id}",
  )
}


# S3 バケット (フロントエンド静的ファイル配信)

resource "aws_s3_bucket" "frontend" {
  bucket = local.frontend_bucket_name

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-frontend"
  })
}


# 静的ウェブサイトホスティング設定
# SPA 用に error_document も index.html を指定
# (React Router の client-side routing のため)

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}


# パブリックアクセスブロック解除 (S3 静的ウェブサイトとして直接公開)

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


# バケットポリシー (パブリック読み取り)

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}
