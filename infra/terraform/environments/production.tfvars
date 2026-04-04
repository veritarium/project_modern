environment = "production"
aws_region  = "us-east-1"

# VPC
vpc_cidr             = "10.0.0.0/16"
availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]
private_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnet_cidrs  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

# EKS
node_desired_size     = 3
node_min_size         = 2
node_max_size         = 20
node_instance_types   = ["t3.large", "t3a.large"]

# RDS
db_instance_class          = "db.t3.medium"
db_allocated_storage       = 50
db_max_allocated_storage   = 500

# ElastiCache
redis_node_type = "cache.t3.small"
