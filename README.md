# Employee Management System — Application & Deployment

<<<<<<< HEAD
<<<<<<< HEAD
A production-style Employee Management System deployed on AWS using a secure, scalable **3-tier architecture** with automated CI/CD.

=======
# Employee Management System — AWS 3-Tier Architecture

A production-style Employee Management System deployed on AWS using a secure, scalable **3-tier architecture** with automated CI/CD.

>>>>>>> bed8b90afb8ad4bedd027512f5d2bb6dff575b29
=======
# Employee Management System — AWS 3-Tier Architecture

A production-style Employee Management System deployed on AWS using a secure, scalable **3-tier architecture** with automated CI/CD.

>>>>>>> bed8b90afb8ad4bedd027512f5d2bb6dff575b29
This repository contains the **React frontend, Node.js backend, PostgreSQL integration, and GitHub Actions CI/CD pipeline**. The AWS infrastructure is provisioned separately using Terraform.

---

# Architecture

```text
                           Users
                             │
                             ▼
                       ┌─────────────┐
                       │ CloudFront  │
                       └──────┬──────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
             S3 Frontend               /api/*
                                          │
                                          ▼
                                  ┌─────────────────┐
                                  │       ALB       │
                                  └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ EC2 Auto Scaling│
                                  │      Group      │
                                  └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ Node.js /       │
                                  │ Express Backend │
                                  └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ RDS PostgreSQL  │
                                  └─────────────────┘
```

---

# Technology Stack

## Application

* React
* Node.js
* Express.js
* PostgreSQL
* Axios
* JWT
* bcryptjs

## AWS

* Amazon CloudFront
* Amazon S3
* Application Load Balancer
* Amazon EC2
* EC2 Auto Scaling
* Amazon RDS PostgreSQL
* AWS Systems Manager
* AWS Secrets Manager
* Amazon CloudWatch

## DevOps

* Git
* GitHub
* GitHub Actions
* Terraform
* AWS OIDC
* Shell Scripting

---

# Project Structure

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

The frontend is developed using React and deployed as static files to Amazon S3.

```text
React Source Code
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
       │
       ▼
     Users
```

CloudFront provides the public entry point for the frontend application.

---

## Backend

The backend is built using Node.js and Express.js and runs on EC2 instances managed by an Auto Scaling Group.

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

### API Endpoints

```text
GET     /api/health
GET     /api/employees
POST    /api/employees
PUT     /api/employees/:id
DELETE  /api/employees/:id
```

---

# CI/CD Pipeline

GitHub Actions automates the application build and deployment process.

The pipeline is triggered using Git version tags.

```text
                          Git Tag
                            │
                            ▼
                     GitHub Actions
                            │
                     ┌──────┴──────┐
                     │             │
                     ▼             ▼
                  Backend       Frontend
                  CI Build       CI Build
                     │             │
                     ▼             ▼
               ZIP Artifact     React Build
                     │             │
                     ▼             ▼
                  S3 Bucket      S3 Bucket
                     │             │
                     ▼             ▼
                  SSM → EC2     CloudFront
                     │          Invalidation
                     ▼
              Backend Deployment
```

The pipeline follows the **build once, deploy the same artifact** approach.

---

# CI — Continuous Integration

## Backend

The backend dependencies are installed and the application is packaged into a versioned ZIP artifact.

```bash
npm ci
```

Example artifact:

```text
employee-backend-v1.0.0.zip
```

The artifact is uploaded to Amazon S3.

```text
S3
└── backend/
    ├── employee-backend-v1.0.0.zip
    ├── employee-backend-v1.0.1.zip
    └── ...
```

---

## Frontend

The React frontend is built using:

```bash
npm install
npm run build
```

The production build is generated in:

```text
frontend/build/
```

The build output is synchronized to the frontend S3 bucket.

---

# CD — Continuous Deployment

After CI completes successfully, the CD stage deploys the application.

## Backend Deployment

```text
S3 Backend Artifact
        │
        ▼
SSM Parameter Store
        │
        ▼
AWS Systems Manager
        │
        ▼
EC2 Instance
        │
        ▼
deploy.sh
        │
        ▼
Application Release
        │
        ▼
systemd
        │
        ▼
Health Check
```

The current application version is stored in AWS Systems Manager Parameter Store:

```text
/app/ems-dev/backend/current-version
```

Example:

```text
v1.0.0
```

The deployment process uses this version to identify the corresponding S3 artifact.

---

# Versioned Backend Releases

Backend releases are maintained separately on the EC2 application server.

Example:

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

This provides clear application version tracking on the EC2 instance.

---

# Frontend Deployment

The frontend deployment process is:

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

After the new frontend files are uploaded, the pipeline creates a CloudFront cache invalidation.

```bash
aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/*"
```

The CloudFront distribution ID is retrieved dynamically from AWS Systems Manager Parameter Store instead of being hardcoded in the GitHub Actions workflow.

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
GitHub CI Role
      │
      ▼
Temporary AWS Credentials
```

The workflow uses:

```yaml
permissions:
  contents: read
  id-token: write
```

No long-lived AWS access keys are stored in GitHub.

---

# Deployment Security

The application deployment uses separate permissions for GitHub Actions and EC2.

## GitHub Actions

The GitHub CI role is used for:

* Uploading backend artifacts to S3
* Uploading frontend files to S3
* Reading deployment parameters from SSM
* Updating the current application version
* Sending commands through AWS Systems Manager
* Monitoring deployment commands
* Creating CloudFront invalidations

## EC2

The EC2 instance role is used for application-side AWS operations such as accessing deployment artifacts and required configuration.

Sensitive application configuration is not committed to the repository.

---

# Application Configuration

The frontend API endpoint is configured during the React build.

Example:

```text
REACT_APP_API_URL=https://<cloudfront-domain>
```

The Axios client uses:

```javascript
const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`
});
```

Therefore an API request such as:

```text
/api/employees
```

flows through:

```text
CloudFront
    │
    ▼
ALB
    │
    ▼
EC2
    │
    ▼
Node.js Backend
```

---

# Backend Configuration

Sensitive backend configuration is kept outside the Git repository.

The deployment process uses AWS services for configuration and secrets management:

* AWS Systems Manager Parameter Store
* AWS Secrets Manager

Database credentials and other sensitive values are not stored directly in application source code.

---

# Environment

Current implementation:

```text
Project      : ems
Environment  : dev
AWS Region   : ap-south-1
```

Environment-aware naming is used for AWS parameters and resources.

Example:

```text
/app/ems-dev/backend/current-version
```

The deployment design can be extended to additional environments without changing the application architecture.

---

# Deployment Process

## 1. Make Application Changes

Update the React frontend or Node.js backend.

## 2. Commit the Changes

```bash
git add .
git commit -m "feat: update employee management application"
git push origin main
```

## 3. Create a Release Tag

```bash
git tag -a v1.0.0 -m "EMS application release v1.0.0"
git push origin v1.0.0
```

## 4. CI Starts Automatically

The GitHub Actions workflow:

* Installs dependencies
* Builds the backend package
* Builds the React frontend
* Publishes artifacts to S3

## 5. CD Starts After CI

The deployment stage:

* Verifies the backend artifact
* Updates the SSM application version
* Sends the deployment command through SSM
* Deploys the backend to EC2
* Performs deployment status monitoring
* Invalidates CloudFront cache

---

# Deployment Verification

The backend provides a health endpoint:

```text
GET /api/health
```

Example response:

```json
{
  "status": "ok"
}
```

The deployment workflow also monitors the AWS Systems Manager command execution.

Deployment failures such as the following cause the workflow to fail:

```text
Failed
Cancelled
TimedOut
```

---

# Versioning

Application releases are versioned using Git tags.

Examples:

```text
v1.0.0
v1.0.1
v1.1.0
```

The backend artifact uses the same application version.

Example:

```text
employee-backend-v1.0.0.zip
```

This provides traceability across:

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

The project uses two separate repositories.

## Application Repository

This repository contains:

* React frontend
* Node.js backend
* Application configuration
* GitHub Actions CI/CD
* Application packaging
* Application deployment workflow

## Infrastructure Repository

The separate Terraform repository contains:

* VPC
* Public and private subnets
* Route tables
* Internet Gateway
* NAT Gateway
* Security groups
* Application Load Balancer
* EC2 Auto Scaling
* RDS PostgreSQL
* S3
* CloudFront
* IAM
* SSM
* Monitoring infrastructure

This separation keeps **application lifecycle** and **infrastructure lifecycle** independent.

---

# Related Repository

## AWS Infrastructure

The AWS infrastructure required by this application is provisioned using Terraform in a separate repository.

**EMS AWS Infrastructure Repository:**

`https://github.com/sunilchouhan07/aws-devops-3tier-infra`

The infrastructure repository contains the Terraform modules and AWS resource definitions required to run this application.

---

# Key Design Principles

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

## Immutable Backend Artifacts

Backend releases use versioned artifact names:

```text
employee-backend-v1.0.0.zip
employee-backend-v1.0.1.zip
```

## OIDC Authentication

GitHub Actions uses AWS OIDC authentication instead of long-lived AWS access keys.

## Automated Deployment

Backend deployment is performed through AWS Systems Manager rather than manually connecting to EC2 through SSH.

## Environment-Aware Configuration

Application deployment parameters follow the project/environment naming convention:

```text
ems-dev
```

---

# Technologies Used

| Category        | Technologies              |
| --------------- | ------------------------- |
| Frontend        | React, Axios              |
| Backend         | Node.js, Express.js       |
| Database        | PostgreSQL                |
| Cloud           | AWS                       |
| Object Storage  | Amazon S3                 |
| CDN             | Amazon CloudFront         |
| Compute         | Amazon EC2                |
| Load Balancing  | Application Load Balancer |
| Database        | Amazon RDS PostgreSQL     |
| Deployment      | AWS Systems Manager       |
| Secrets         | AWS Secrets Manager       |
| Monitoring      | Amazon CloudWatch         |
| CI/CD           | GitHub Actions            |
| Authentication  | GitHub OIDC + AWS IAM     |
| Infrastructure  | Terraform                 |
| Version Control | Git / GitHub              |

---

# Project Status

```text
Application              : Completed
Backend Deployment       : Automated
Frontend Deployment      : Automated
CI/CD Pipeline           : Implemented
AWS OIDC                 : Configured
S3 Artifact Storage      : Configured
SSM Deployment           : Configured
CloudFront Routing       : Configured
CloudFront Invalidation  : Automated
Health Check             : Implemented
CloudWatch Monitoring    : Implemented
```

---

# Author

**Sunil Chouhan**

Cloud Engineer Intern

AWS | Terraform | CI/CD | Kubernetes

B.Tech — Cloud Computing

