---
sidebar_position: 5
sidebar_label: minio
title: minio
---

# vkdr minio

Use these commands to install and manage MinIO object storage service in your `vkdr` cluster.

MinIO is a high-performance, S3-compatible object storage system. It's useful for storing application data, backups, and artifacts locally.

## vkdr minio install

Install MinIO service in your cluster.

```bash
vkdr minio install [-hsV] [--api] [--silent] [-d=<domain>] [-p=<admin_password>]
```

### Flags

| Flag | Shorthand | Description | Default |
|------|-----------|-------------|---------|
| `--domain` | `-d` | Domain name for the generated ingress | `localhost` |
| `--secure` | `-s` | Enable HTTPS | `false` |
| `--admin` | `-p` | MinIO admin password | `vkdr1234` |
| `--api` | | Expose API endpoint at `minio-api.DOMAIN` | `false` |

### Examples

#### Basic Installation

```bash
vkdr infra up
vkdr nginx install --default-ic
vkdr minio install
# Access MinIO Console at http://minio.localhost:8000
# Default credentials: minioadmin / vkdr1234
```

#### With Custom Password

```bash
vkdr minio install -p mysecretpassword
```

#### With API Endpoint

Expose both the console and API endpoints:

```bash
vkdr minio install --api
# Console: http://minio.localhost:8000
# API: http://minio-api.localhost:8000
```

#### With HTTPS

```bash
vkdr minio install -d example.com -s --api
# Console: https://minio.example.com
# API: https://minio-api.example.com
```

## vkdr minio remove

Remove MinIO service from your cluster.

```bash
vkdr minio remove [-hV] [--silent]
```

### Example

```bash
vkdr minio remove
```

## Complete Examples

### Local Object Storage Setup

```bash
# Start cluster with ingress
vkdr infra up
vkdr nginx install --default-ic

# Install MinIO
vkdr minio install -p minio123 --api

# Access MinIO Console
open http://minio.localhost:8000
# Login: minioadmin / minio123

# Use MinIO API with AWS CLI
aws configure set aws_access_key_id minioadmin
aws configure set aws_secret_access_key minio123
aws --endpoint-url http://minio-api.localhost:8000 s3 ls

# Clean up
vkdr minio remove
```

### DevPortal with MinIO for TechDocs

MinIO can be used as storage backend for Backstage TechDocs:

```bash
# Start cluster
vkdr infra up

# Install Kong (required for DevPortal)
vkdr kong install --default-ic

# Install MinIO for TechDocs storage
vkdr minio install --api

# Install DevPortal
vkdr devportal install --samples

# Configure DevPortal to use MinIO for TechDocs
# (requires custom values merge)
```

## Using MinIO

### Access Credentials

- **Username**: `minioadmin`
- **Password**: Value of `--admin` flag (default: `vkdr1234`)

### S3-Compatible API

MinIO is fully S3-compatible. Use any S3 client:

```bash
# Using AWS CLI
aws --endpoint-url http://minio-api.localhost:8000 s3 mb s3://my-bucket
aws --endpoint-url http://minio-api.localhost:8000 s3 cp file.txt s3://my-bucket/

# Using mc (MinIO Client)
mc alias set local http://minio-api.localhost:8000 minioadmin vkdr1234
mc mb local/my-bucket
mc cp file.txt local/my-bucket/
```

### MinIO Console Features

The MinIO Console provides:
- Bucket management
- Object browser
- User and policy management
- Metrics and monitoring
