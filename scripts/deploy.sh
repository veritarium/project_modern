#!/bin/bash
set -e

# Project Modern Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Environments: local, staging, production
# Actions: up, down, status, logs

ENVIRONMENT=${1:-local}
ACTION=${2:-up}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Project Modern Deployment"
echo "Environment: $ENVIRONMENT"
echo "Action: $ACTION"
echo ""

deploy_local() {
  case $ACTION in
    up)
      echo "📦 Starting local development environment..."
      cd "$PROJECT_ROOT"
      docker-compose up -d
      echo ""
      echo "✅ Services started:"
      echo "  - Evaluation API: http://localhost:3000"
      echo "  - Semantic Search: http://localhost:3001"
      echo "  - PostgreSQL: localhost:5432"
      echo "  - Redis: localhost:6379"
      ;;
    down)
      echo "🛑 Stopping local environment..."
      cd "$PROJECT_ROOT"
      docker-compose down
      echo "✅ Environment stopped"
      ;;
    status)
      echo "📊 Service status:"
      docker-compose ps
      ;;
    logs)
      echo "📜 Showing logs (Ctrl+C to exit)..."
      docker-compose logs -f
      ;;
    *)
      echo "❌ Unknown action: $ACTION"
      exit 1
      ;;
  esac
}

deploy_k8s() {
  local overlay="$PROJECT_ROOT/infra/k8s/overlays/$ENVIRONMENT"
  
  if [ ! -d "$overlay" ]; then
    echo "❌ Environment not found: $ENVIRONMENT"
    exit 1
  fi

  case $ACTION in
    up)
      echo "☸️  Deploying to Kubernetes ($ENVIRONMENT)..."
      kubectl apply -k "$overlay"
      echo ""
      echo "⏳ Waiting for deployments..."
      kubectl rollout status deployment/evaluation-service -n project-modern --timeout=300s
      kubectl rollout status deployment/semantic-search-service -n project-modern --timeout=300s
      echo ""
      echo "✅ Deployment complete!"
      echo ""
      echo "Services:"
      kubectl get svc -n project-modern
      ;;
    down)
      echo "🛑 Removing from Kubernetes ($ENVIRONMENT)..."
      kubectl delete -k "$overlay"
      echo "✅ Deployment removed"
      ;;
    status)
      echo "📊 Pod status:"
      kubectl get pods -n project-modern
      echo ""
      echo "📊 Service status:"
      kubectl get svc -n project-modern
      ;;
    logs)
      echo "📜 Showing logs..."
      kubectl logs -l app=evaluation-service -n project-modern --tail=100 -f
      ;;
    *)
      echo "❌ Unknown action: $ACTION"
      exit 1
      ;;
  esac
}

deploy_terraform() {
  local tfvars="$PROJECT_ROOT/infra/terraform/environments/$ENVIRONMENT.tfvars"
  
  if [ ! -f "$tfvars" ]; then
    echo "❌ Environment not found: $ENVIRONMENT"
    exit 1
  fi

  cd "$PROJECT_ROOT/infra/terraform"

  case $ACTION in
    up)
      echo "☁️  Deploying to AWS ($ENVIRONMENT)..."
      terraform init
      terraform plan -var-file="$tfvars"
      read -p "Proceed with apply? (y/n) " -n 1 -r
      echo
      if [[ $REPLY =~ ^[Yy]$ ]]; then
        terraform apply -var-file="$tfvars"
        echo ""
        echo "✅ Infrastructure deployed!"
        echo ""
        echo "Outputs:"
        terraform output
      else
        echo "Cancelled"
      fi
      ;;
    down)
      echo "🛑 Destroying AWS infrastructure ($ENVIRONMENT)..."
      read -p "Are you sure? This will delete all resources! (yes/no) " -r
      if [[ $REPLY == "yes" ]]; then
        terraform destroy -var-file="$tfvars"
        echo "✅ Infrastructure destroyed"
      else
        echo "Cancelled"
      fi
      ;;
    status)
      echo "📊 Terraform state:"
      terraform show
      ;;
    *)
      echo "❌ Unknown action: $ACTION"
      exit 1
      ;;
  esac
}

# Main
case $ENVIRONMENT in
  local)
    deploy_local
    ;;
  staging|production)
    if command -v kubectl &> /dev/null && kubectl config current-context &> /dev/null; then
      deploy_k8s
    elif command -v terraform &> /dev/null; then
      echo "☸️  Kubernetes not configured, using Terraform..."
      deploy_terraform
    else
      echo "❌ Neither kubectl nor terraform available"
      exit 1
    fi
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "Usage: $0 [local|staging|production] [up|down|status|logs]"
    exit 1
    ;;
esac
