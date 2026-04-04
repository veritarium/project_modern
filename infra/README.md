# Project Modern - Infrastructure

This directory contains all infrastructure-as-code configurations for deploying Project Modern to production.

## Structure

```
infra/
├── k8s/                    # Kubernetes manifests
│   ├── base/              # Base Kustomize configuration
│   └── overlays/          # Environment-specific overlays
│       ├── production/    # Production configuration
│       └── staging/       # Staging configuration
├── terraform/             # Terraform configurations
│   ├── environments/      # Environment-specific variables
│   ├── main.tf           # Main infrastructure
│   ├── variables.tf      # Variable definitions
│   └── outputs.tf        # Output definitions
└── README.md             # This file
```

## Quick Start

### Local Development (Docker Compose)

```bash
docker-compose up -d
```

This starts:
- PostgreSQL with pgvector
- Redis
- Evaluation Service
- Semantic Search Service

### Kubernetes Deployment

#### Prerequisites

- kubectl configured
- Kustomize installed
- Access to a Kubernetes cluster

#### Deploy to Staging

```bash
cd infra/k8s
kubectl apply -k overlays/staging
```

#### Deploy to Production

```bash
cd infra/k8s
kubectl apply -k overlays/production
```

### Terraform Cloud Deployment

#### Prerequisites

- Terraform >= 1.5.0
- AWS CLI configured
- Access to AWS account

#### Initialize

```bash
cd infra/terraform
terraform init
```

#### Plan

```bash
terraform plan -var-file=environments/production.tfvars
```

#### Apply

```bash
terraform apply -var-file=environments/production.tfvars
```

#### Destroy

```bash
terraform destroy -var-file=environments/production.tfvars
```

## Components

### Kubernetes

| Component | Description |
|-----------|-------------|
| Evaluation Service | Fastify API for tool evaluation |
| Semantic Search Service | OpenAI embeddings + pgvector |
| PostgreSQL | Database with pgvector extension |
| Redis | Caching layer |
| Ingress | NGINX ingress controller |

### AWS Resources (Terraform)

| Resource | Purpose |
|----------|---------|
| EKS | Kubernetes cluster |
| RDS PostgreSQL | Managed PostgreSQL with pgvector |
| ElastiCache Redis | Managed Redis |
| VPC | Networking infrastructure |
| ALB | Application Load Balancer |

## Monitoring

### Prometheus Metrics

- HTTP request latency
- Error rates
- Pod resource usage
- Database connections

### Grafana Dashboards

Access Grafana at: `https://grafana.projectmodern.io`

Default dashboards:
- Node metrics
- Pod metrics
- Application metrics
- Database metrics

### Alerts

Alerts are configured in `infra/k8s/base/monitoring.yaml`:

- HighErrorRate: Error rate > 10%
- HighLatency: P95 latency > 1s
- PodCrashLooping: Pod restarting frequently
- HighMemoryUsage: Memory > 85%
- HighCPUUsage: CPU > 80%

## Security

### Secrets Management

Secrets are stored in Kubernetes Secrets:

```bash
kubectl create secret generic project-modern-secrets \
  --from-literal=GITHUB_TOKEN=$GITHUB_TOKEN \
  --from-literal=LIBRARIES_IO_API_KEY=$LIBRARIES_IO_API_KEY \
  --from-literal=OPENAI_API_KEY=$OPENAI_API_KEY \
  --from-literal=POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -n project-modern
```

For production, use Sealed Secrets or external secret operators.

### Network Security

- Private subnets for databases and internal services
- Security groups restrict access between components
- TLS termination at ingress
- Network policies for pod-to-pod communication

## Scaling

### Horizontal Pod Autoscaler (HPA)

Configured in production overlay:
- Min replicas: 3
- Max replicas: 10
- Target CPU: 70%
- Target memory: 80%

### Database Scaling

- RDS: Storage auto-scaling enabled
- ElastiCache: Cluster mode for Redis scaling

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n project-modern
kubectl describe pod <pod-name> -n project-modern
kubectl logs <pod-name> -n project-modern
```

### Check Service Status

```bash
kubectl get svc -n project-modern
kubectl get ingress -n project-modern
```

### Database Connection

```bash
kubectl exec -it postgres-0 -n project-modern -- psql -U projectmodern
```

## Cost Optimization

### Development

- Use Docker Compose locally
- Use staging environment with smaller instances
- Enable spot instances for non-critical workloads

### Production

- Reserved instances for steady-state workloads
- Savings plans for compute
- Right-size instances based on metrics

## Maintenance

### Updates

1. Update container images in kustomization.yaml
2. Apply changes: `kubectl apply -k overlays/production`
3. Monitor rollout: `kubectl rollout status deployment/<name>`

### Backups

- RDS: Automated backups with 30-day retention
- Manual snapshots before major changes

## Support

For infrastructure issues, contact the DevOps team or create an issue in the repository.
