# Planna Deployment Guide

## Docker Compose (Local/Staging)

Quick local deployment with all services:

```bash
docker-compose up -d
```

- Frontend available at http://localhost:5000
- Backend API at http://localhost:3000
- AI Service at http://localhost:8000
- All services auto-restart on failure
- Health checks ensure service availability

To stop:
```bash
docker-compose down
```

To view logs:
```bash
docker-compose logs -f backend
docker-compose logs -f ai
docker-compose logs -f frontend
```

## Production Deployment (Cloud)

### Prerequisites
- Docker & Docker Compose installed
- Cloud provider (AWS, GCP, Azure, DigitalOcean, etc.)
- Domain name (optional)
- SSL certificate (recommended)

### Recommended: Docker Swarm or Kubernetes

For production, consider:
- **Docker Swarm**: Lightweight orchestration built into Docker
- **Kubernetes**: Enterprise-grade container orchestration
- **Managed Services**: AWS ECS, Google Cloud Run, Azure Container Instances

### Environment Variables

Create `.env` file at root:

```
NODE_ENV=production
PORT=3000
AI_PORT=8000
DATABASE_URL=./db/planna.db
REACT_APP_API_URL=https://yourdomain.com
```

### Scaling Considerations

1. **Database**: SQLite works for small deployments. For scale, migrate to PostgreSQL:
   - Update backend to use `pg` driver
   - Update AI service to connect to PostgreSQL

2. **AI Service**: Can be horizontally scaled:
   - Run multiple AI service instances
   - Use load balancer (nginx) to distribute requests

3. **Frontend**: Serve via CDN for better performance:
   - Build and push to S3 + CloudFront (AWS)
   - Or use Netlify, Vercel for simpler setup

### Example: AWS ECS Deployment

1. Push images to ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag planna-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/planna-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/planna-backend:latest
```

2. Create ECS Task Definition with all three services
3. Deploy via ECS Service with load balancer

### Monitoring & Logging

- Use CloudWatch, Stackdriver, or Datadog for logs
- Set up alerts for:
  - High API latency (>500ms)
  - AI prediction errors
  - Database lock contention
  - Low system resources (CPU, memory)

### Health Checks

All services include health checks in docker-compose.yml:
- Backend: `/api/bookings`
- AI: `/docs` (FastAPI docs)
- Frontend: Responds to HTTP requests

Configure in production load balancer accordingly.

### Database Backup

Set up automated backups:
```bash
# Manual backup
cp backend/db/planna.db backups/planna_$(date +%s).db

# Automated (cron job)
0 2 * * * cp /path/to/planna.db /backups/planna_$(date +\%s).db
```

For PostgreSQL deployment, use native backup tools:
```bash
pg_dump -U postgres planna > backup.sql
```

### Security Checklist

- [ ] Use HTTPS/TLS for all traffic
- [ ] Validate all API inputs
- [ ] Use environment variables for secrets (API keys, DB passwords)
- [ ] Set CORS properly (restrict to your domain)
- [ ] Rate limit API endpoints
- [ ] Run security scan on Docker images
- [ ] Keep dependencies updated

### Rollback Plan

1. Tag each release: `docker tag planna-backend:v1.0.0 <repo>/planna-backend:v1.0.0`
2. Keep previous versions available in registry
3. In case of failure: `docker-compose down && git checkout <previous-tag> && docker-compose up`
