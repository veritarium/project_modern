environment = "staging"
aws_region  = "us-east-1"

# VPC
vpc_cidr             = "10.1.0.0/16"
availability_zones   = ["us-east-1a", "us-east-1b"]
private_subnet_cidrs = ["10.1.1.0/24", "10.1.2.0/24"]
public_subnet_cidrs  = ["10.1.101.0/24", "10.1.102.0/24"]

# EKS
node_desired_size     = 2
node_min_size         = 1
node_max_size         = 5
node_instance_types   = ["t3.medium", "t3a.medium"]

# RDS
db_instance_class          = "db.t3.micro"
db_allocated_storage       = 20
db_max_allocated_storage   = 100

# ElastiCache
redis_node_type = "cache.t3.micro"
