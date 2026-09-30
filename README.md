# Employee Management System — Application & Deployment

Employee Management System (EMS) application with an automated AWS CI/CD pipeline.

This repository contains the **frontend, backend, and GitHub Actions workflow** used to build, package, and deploy the application to the AWS infrastructure provisioned through Terraform.

---

# Architecture

```text
                         Users
                           │
                           ▼
                      ┌───────────┐
                      │ CloudFront│
                      └─────┬─────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
           Frontend Assets           /api/*
                 │                     │
                 ▼                     ▼
                S3                    ALB
                                       │
                                       ▼
                                EC2 Auto Scaling
                                       │
                                       ▼
                                Node.js Backend
                                       │
                                       ▼
                                RDS PostgreSQL
```

---

# Application Stack

## Frontend

* React
* Axios
* React Scripts
* HTML / CSS / JavaScript

## Backend

* Node.js
* Express.js
* PostgreSQL
* JWT
* bcryptjs
* dotenv

## AWS

* Amazon S3
* Amazon CloudFront
* Application Load Balancer
* Amazon EC2
* Amazon RDS PostgreSQL
* AWS Systems Manager
* AWS Secrets Manager

## CI/CD

* GitHub Actions
* GitHub OIDC
* Amazon S3
* AWS Systems Manager
* CloudFront Cache Invalidation

---

# Repository Structure

```text
employee_management_system/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
└── README.md
```

---

# Application Architecture

## Frontend

The React frontend is built as static files and deployed to an Amazon S3 bucket.

```text
React Application
       │
       ▼
 npm run build
       │
       ▼
frontend/build/
       │
       ▼
Amazon S3
       │
       ▼
CloudFront
```

CloudFront serves the frontend application to users.

---

## Backend

The Node.js/Express backend runs on EC2 instances managed by an Auto Scaling Group.

```text
CloudFront
    │
    │ /api/*
    ▼
Application Load Balancer
    │
    ▼
EC2 Auto Scaling Group
    │
    ▼
Node.js / Express
    │
    ▼
RDS PostgreSQL
```

The backend exposes REST API endpoints under `/api`.

### Example API Endpoints

```text
GET    /api/employees
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
GET    /api/health
```

---

# CI/CD Pipeline

The deployment pipeline is implemented using **GitHub Actions**.

The pipeline follows a **build once, deploy the same artifact** approach.

```text
Git Tag
   │
   ▼
GitHub Actions
   │
   ├─────────────── CI ───────────────┐
   │                                  │
   ▼                                  ▼
Backend                          Frontend
npm ci                           npm install
   │                                  │
   ▼                                  ▼
Package ZIP                     npm run build
   │                                  │
   └──────────────┬───────────────────┘
                  │
                  ▼
           AWS OIDC Authentication
                  │
                  ▼
           Publish Application
           ┌────────┴─────────┐
           │                  │
           ▼                  ▼
       Backend S3          Frontend S3
       Artifact               Build
           │                  │
           ▼                  ▼
      CD Deployment       CloudFront
           │             Invalidation
           ▼
         AWS SSM
           │
           ▼
          EC2
           │
           ▼
      Deploy Script
           │
           ▼
     Node.js Application
```

---

# GitHub Actions

The workflow is triggered when a version tag is pushed.

```yaml
on:
  push:
    tags:
      - "v*"
```

### Create a Release Tag

```bash
git tag -a v1.0.0 -m "Final EMS application deployment"
git push origin v1.0.0
```

This starts the CI/CD pipeline automatically.

---

# CI — Continuous Integration

The CI stage performs the application build and packaging.

## Backend

```text
backend/
    │
    ▼
  npm ci
    │
    ▼
Backend package
    │
    ▼
employee-backend-v1.0.0.zip
    │
    ▼
Amazon S3
```

Backend artifacts are stored using versioned filenames:

```text
backend/
├── employee-backend-v1.0.0.zip
├── employee-backend-v1.0.1.zip
└── ...
```

This keeps deployment artifacts **immutable** and allows a specific application version to be deployed again when required.

---

## Frontend

The React application is built using:

```bash
npm run build
```

The generated production files are located in:

```text
frontend/build/
```

The build output is uploaded to the frontend S3 bucket.

---

# CD — Continuous Deployment

After CI completes successfully, the CD stage deploys the application.

## Backend Deployment

The backend deployment flow is:

```text
S3 Backend Artifact
        │
        ▼
Update SSM Parameter
        │
        ▼
AWS Systems Manager
        │
        ▼
EC2 Application Server
        │
        ▼
deploy.sh
        │
        ▼
Application Release
        │
        ▼
systemd restart
        │
        ▼
Health Check
```

The current application version is stored in **AWS Systems Manager Parameter Store**.

```text
/app/ems-dev/backend/current-version
```

For example:

```text
v1.0.0
```

The EC2 deployment script uses this version to download the corresponding artifact from S3.

---

# Backend Release Structure

Application releases are maintained separately on the EC2 instance.

```text
/opt/employee-app/
│
├── current -> releases/v1.0.0
│
├── releases/
│   ├── v1.0.0/
│   ├── v1.0.1/
│   └── ...
│
└── scripts/
    └── deploy.sh
```

The `current` symlink points to the active application release.

This allows the deployment process to maintain **versioned releases** instead of replacing application files directly.

---

# Frontend Deployment

The frontend build is uploaded to Amazon S3.

```text
React Source
     │
     ▼
npm run build
     │
     ▼
frontend/build/
     │
     ▼
Amazon S3
     │
     ▼
CloudFront
```

After uploading a new frontend build, the workflow creates a CloudFront cache invalidation.

```bash
aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*"
```

The CloudFront distribution ID is retrieved dynamically from **AWS Systems Manager Parameter Store** rather than being hardcoded in the workflow.

---

# AWS Authentication

GitHub Actions authenticates with AWS using **GitHub OIDC**.

```text
GitHub Actions
      │
      ▼
GitHub OIDC Token
      │
      ▼
AWS IAM
      │
      ▼
GitHub CI IAM Role
      │
      ▼
Temporary AWS Credentials
```

No long-lived AWS access keys are stored in GitHub.

The workflow uses:

```yaml
permissions:
  contents: read
  id-token: write
```

AWS credentials are configured using:

```yaml
uses: aws-actions/configure-aws-credentials@v4
```

---

# Deployment Permissions

The GitHub Actions IAM role is used for application deployment operations such as:

* Uploading backend artifacts to S3
* Uploading frontend build files to S3
* Reading the CloudFront distribution ID from SSM
* Updating the current application version in SSM
* Sending deployment commands through AWS Systems Manager
* Monitoring SSM command execution
* Creating CloudFront cache invalidations

The EC2 instance uses its own IAM role for application-side AWS operations.

---

# Environment Configuration

The current deployment environment is:

```text
Environment : dev
AWS Region  : ap-south-1
Project     : ems
```

Application deployment parameters follow the environment-aware naming convention:

```text
/app/<project>-<environment>/
```

Example:

```text
/app/ems-dev/backend/current-version
```

This structure allows the deployment workflow to be extended to additional environments without changing the application architecture.

---

# Application Configuration

The frontend API endpoint is configured at build time.

Example:

```text
REACT_APP_API_URL=https://<cloudfront-domain>
```

The frontend API client uses:

```javascript
const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`
});
```

Therefore:

```text
/api/employees
```

is routed through:

```text
CloudFront
    │
    ▼
ALB
    │
    ▼
Node.js Backend
```

---

# Backend Configuration

Sensitive backend configuration is not stored in the Git repository.

The backend retrieves configuration from AWS services during deployment/runtime.

The deployment process uses:

* AWS Systems Manager Parameter Store
* AWS Secrets Manager

Database credentials and other sensitive values are therefore kept outside the application source code.

---

# Deployment Workflow

## 1. Make Application Changes

Modify the frontend or backend application.

## 2. Commit Changes

```bash
git add .
git commit -m "feat: update employee management application"
git push origin main
```

## 3. Create a Version Tag

```bash
git tag -a v1.0.0 -m "EMS application release v1.0.0"
git push origin v1.0.0
```

## 4. GitHub Actions Starts

The tag triggers the CI/CD workflow.

## 5. CI Builds the Application

```text
Backend  → ZIP artifact
Frontend → Production build
```

## 6. Artifacts Are Published

```text
Backend  → S3
Frontend → S3
```

## 7. CD Deploys the Backend

```text
SSM → EC2 → deploy.sh → systemd → health check
```

## 8. CloudFront Cache Is Invalidated

```text
S3 frontend
     │
     ▼
CloudFront invalidation
     │
     ▼
Latest frontend available
```

---

# Deployment Verification

After deployment, the backend health endpoint can be used to verify the application.

```text
GET /api/health
```

Expected response:

```json
{
  "status": "ok"
}
```

The deployment pipeline also monitors the AWS Systems Manager command status.

Deployment is considered unsuccessful if the SSM command returns:

```text
Failed
Cancelled
TimedOut
```

---

# Versioning

Application releases use Git tags.

Example:

```text
v1.0.0
v1.0.1
v1.1.0
```

The same version is used for the backend artifact.

Example:

```text
employee-backend-v1.0.0.zip
```

This provides traceability between:

```text
Git Commit
    │
    ▼
Git Tag
    │
    ▼
S3 Artifact
    │
    ▼
EC2 Release
```

---

# Repository Separation

The project uses separate repositories for infrastructure and application deployment.

## Infrastructure Repository

Responsible for:

* Terraform
* VPC
* Subnets
* Route tables
* Security groups
* ALB
* EC2 Auto Scaling
* RDS
* S3
* CloudFront
* IAM
* SSM
* Monitoring
* AWS infrastructure lifecycle

## Application Repository

Responsible for:

* React frontend
* Node.js backend
* Application source code
* Application packaging
* GitHub Actions CI/CD
* Application deployment

This separation keeps **infrastructure lifecycle** and **application lifecycle** independent.

---

# Related Repository

## Infrastructure Repository

The AWS infrastructure used by this application is maintained in a separate Terraform repository.

```text
Employee Management System — AWS Infrastructure
```

The infrastructure repository provisions the AWS resources required by this application.

---

# Key Deployment Principles

## Build Once, Deploy the Same Artifact

The application is built during CI and the generated artifact is used for deployment.

```text
Source
  ↓
Build
  ↓
Artifact
  ↓
S3
  ↓
Deployment
```

## Immutable Application Artifacts

Backend releases use versioned artifact names:

```text
employee-backend-v1.0.0.zip
employee-backend-v1.0.1.zip
```

## OIDC Authentication

GitHub Actions uses AWS OIDC instead of storing long-lived AWS access keys.

## Environment-Aware Configuration

AWS resources and parameters use project/environment naming:

```text
ems-dev
```

## Automated Deployment

Application deployment is performed through **GitHub Actions and AWS Systems Manager** without manually SSHing into EC2 instances.

---

# Technologies Used

| Category        | Technologies              |
| --------------- | ------------------------- |
| Frontend        | React, Axios              |
| Backend         | Node.js, Express.js       |
| Database        | PostgreSQL                |
| Cloud           | AWS                       |
| Storage         | Amazon S3                 |
| CDN             | Amazon CloudFront         |
| Compute         | Amazon EC2                |
| Load Balancing  | Application Load Balancer |
| Deployment      | AWS Systems Manager       |
| Secrets         | AWS Secrets Manager       |
| CI/CD           | GitHub Actions            |
| Authentication  | GitHub OIDC + AWS IAM     |
| Version Control | Git / GitHub              |

---

# Project Status

```text
Application          : Completed
Backend Deployment   : Automated
Frontend Deployment  : Automated
CI/CD Pipeline       : Implemented
AWS OIDC             : Configured
S3 Artifact Storage  : Configured
SSM Deployment       : Configured
CloudFront Routing   : Configured
Cache Invalidation   : Automated
Health Check         : Implemented
```

---

# Author

**Sunil Chouhan**

Cloud Engineer Intern | AWS | Terraform | CI/CD

B.Tech — Cloud Computing
