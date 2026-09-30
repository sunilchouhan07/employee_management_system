# Employee Management System — AWS Infrastructure

Terraform-based AWS infrastructure for the Employee Management System.

This repository provisions and manages the AWS infrastructure required to run the application using a secure, scalable, and highly available **3-tier architecture**.

---

## Architecture

```text
                         Users
                           │
                           ▼
                       CloudFront
                      /          \
                     /            \
              Frontend            /api/*
                  │                  │
                  ▼                  ▼
                 S3                 ALB
                                     │
                                     ▼
                              EC2 Auto Scaling
                                     │
                                     ▼
                                RDS PostgreSQL
```

---

## AWS Services

### Networking

* Amazon VPC
* Public Subnets
* Private Subnets
* Internet Gateway
* NAT Gateway
* Route Tables
* Security Groups

### Compute & Load Balancing

* Amazon EC2
* EC2 Auto Scaling Group
* Application Load Balancer

### Database

* Amazon RDS PostgreSQL

### Storage & Content Delivery

* Amazon S3
* Amazon CloudFront

### Security & Access

* AWS IAM
* AWS Systems Manager
* AWS Secrets Manager
* AWS WAF

### Monitoring

* Amazon CloudWatch
* CloudWatch Agent

### Infrastructure as Code

* Terraform
* Amazon S3 — Remote Terraform State
* Amazon DynamoDB — Terraform State Locking

---

# High-Level Architecture

```text
                            Internet
                               │
                               ▼
                           CloudFront
                          /         \
                         /           \
                   Frontend          API
                      │               │
                      ▼               ▼
                     S3              ALB
                                  │
                           ┌──────┴──────┐
                           │             │
                           ▼             ▼
                        EC2-A         EC2-B
                           │             │
                           └──────┬──────┘
                                  │
                                  ▼
                             RDS PostgreSQL
```

The frontend is delivered from **Amazon S3 through CloudFront**.

API requests using `/api/*` are routed through **CloudFront to the Application Load Balancer**.

The ALB distributes traffic to EC2 instances managed by an **Auto Scaling Group**.

The EC2 application tier communicates with PostgreSQL running on **Amazon RDS**.

---

# Network Architecture

The infrastructure uses a **multi-AZ VPC design** with separate public and private subnets.

```text
VPC
│
├── Availability Zone 1
│   │
│   ├── Public Subnet
│   │   ├── Application Load Balancer
│   │   └── NAT Gateway
│   │
│   ├── Private Application Subnet
│   │   └── EC2 Auto Scaling
│   │
│   └── Private Database Subnet
│       └── RDS PostgreSQL
│
└── Availability Zone 2
    │
    ├── Public Subnet
    │   └── Application Load Balancer
    │
    ├── Private Application Subnet
    │   └── EC2 Auto Scaling
    │
    └── Private Database Subnet
        └── RDS PostgreSQL
```

---

# Application Traffic Flow

```text
User
 │
 ▼
CloudFront
 │
 └── /api/*
        │
        ▼
       ALB
        │
        ▼
EC2 Auto Scaling Group
        │
        ▼
Node.js Application
        │
        ▼
RDS PostgreSQL
```

The application servers are deployed in **private subnets** and are not directly exposed to the internet.

Outbound internet access required by private instances is provided through the **NAT Gateway**.

---

# Security Architecture

Security groups control communication between the application tiers.

```text
Internet
   │
   ▼
ALB
80 / 443
   │
   ▼
EC2
5000
   │
   ▼
RDS
5432
```

## Security Rules

* ALB accepts HTTP/HTTPS traffic from the internet.
* EC2 accepts application traffic only from the ALB security group.
* RDS accepts PostgreSQL traffic only from the application security group.
* Database instances are deployed in private subnets.
* EC2 instances are managed using AWS Systems Manager.
* IAM roles are used instead of hard-coded AWS credentials.
* GitHub Actions uses OIDC-based authentication.

---

# Terraform Infrastructure

The infrastructure is implemented using **reusable Terraform modules**.

## Repository Structure

```text
.
├── terraform/
│   │
│   ├── modules/
│   │   ├── vpc/
│   │   ├── iam/
│   │   ├── ec2/
│   │   ├── alb/
│   │   ├── rds/
│   │   ├── s3/
│   │   ├── cloudfront/
│   │   ├── ssm/
│   │   └── monitoring/
│   │
│   ├── environments/
│   │   └── dev/
│   │
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── providers.tf
│   └── terraform.tfvars
│
└── README.md
```

---

# Terraform Remote State Management

Terraform state is managed remotely using **Amazon S3 for remote state storage** and **Amazon DynamoDB for state locking**.

```text
                    Terraform
                        │
                        ▼
              Amazon S3 Backend
                        │
                        ▼
               Terraform State
                        │
                        │
                        ▼
               DynamoDB Table
                 State Locking
```

## Amazon S3 — Remote State Storage

Amazon S3 is used to store the Terraform state file remotely.

This provides:

* Centralized state storage
* Persistent state management
* Shared access for team and CI/CD workflows
* Protection against losing local Terraform state

## Amazon DynamoDB — State Locking

Amazon DynamoDB is used for **Terraform state locking**.

State locking prevents multiple Terraform operations from modifying the same infrastructure state simultaneously.

```text
Terraform Operation
        │
        ▼
   Acquire Lock
        │
        ▼
  DynamoDB Table
        │
        ▼
Modify Infrastructure
        │
        ▼
   Update S3 State
        │
        ▼
   Release Lock
```

### State Management Flow

```text
Terraform
   │
   ├──► DynamoDB
   │      └── Acquire State Lock
   │
   ├──► AWS Infrastructure
   │      └── Create / Update Resources
   │
   └──► S3
          └── Store Updated Terraform State
```

> **S3 stores the Terraform state, while DynamoDB provides state locking.** These services have separate responsibilities and work together to provide reliable remote state management.

---

# Terraform Commands

## Initialize Terraform

```bash
terraform init
```

Terraform initializes the providers, modules, and remote backend.

## Format Terraform

```bash
terraform fmt -recursive
```

## Validate Configuration

```bash
terraform validate
```

## Create Execution Plan

```bash
terraform plan
```

## Apply Infrastructure

```bash
terraform apply
```

## Destroy Infrastructure

```bash
terraform destroy
```

> **Always review the Terraform plan before applying or destroying infrastructure.**

---

# Terraform Modules

The infrastructure is divided into reusable modules.

| Module       | Responsibility                               |
| ------------ | -------------------------------------------- |
| `vpc`        | VPC, subnets, routing and NAT                |
| `iam`        | IAM roles and policies                       |
| `ec2`        | Launch template and Auto Scaling             |
| `alb`        | Application Load Balancer                    |
| `rds`        | PostgreSQL database                          |
| `s3`         | Frontend and application artifact storage    |
| `cloudfront` | CDN and API routing                          |
| `ssm`        | Parameter Store and deployment configuration |
| `monitoring` | CloudWatch and monitoring configuration      |

---

# CI/CD Authentication

GitHub Actions authenticates with AWS using **OpenID Connect (OIDC)**.

No long-lived AWS access keys are required for the CI/CD workflow.

```text
GitHub Actions
      │
      ▼
GitHub OIDC
      │
      ▼
AWS IAM Role
      │
      ▼
AWS Resources
```

The GitHub Actions IAM role provides the permissions required for application build, artifact upload, deployment, and CloudFront cache invalidation.

---

# Application and Infrastructure Separation

The infrastructure and application are maintained in separate repositories.

```text
┌─────────────────────────────┐
│ Infrastructure Repository   │
│                             │
│ Terraform                   │
│     │                       │
│     ▼                       │
│ AWS Infrastructure          │
└─────────────────────────────┘


┌─────────────────────────────┐
│ Application Repository      │
│                             │
│ React + Node.js             │
│     │                       │
│     ▼                       │
│ GitHub Actions              │
│     │                       │
│     ▼                       │
│ AWS Deployment              │
└─────────────────────────────┘
```

The infrastructure repository manages the **AWS platform**.

The application repository manages **application source code and application CI/CD**.

---

# Application Deployment Architecture

```text
Application Repository
        │
        ▼
   GitHub Actions
        │
        ├─────────────────────┐
        │                     │
        ▼                     ▼
   Frontend Build       Backend Package
        │                     │
        ▼                     ▼
       S3                 S3 Artifact
        │                     │
        ▼                     ▼
   CloudFront                SSM
                              │
                              ▼
                             EC2
```

---

# Backend Deployment

Backend releases are packaged as **immutable, versioned artifacts**.

Example:

```text
employee-backend-v3.zip
```

## Deployment Flow

```text
GitHub Actions
      │
      ▼
S3 Artifact Bucket
      │
      ▼
SSM Run Command
      │
      ▼
EC2 Application Server
      │
      ▼
Node.js Backend
      │
      ▼
Health Check
```

The currently deployed application version is maintained using **AWS Systems Manager Parameter Store**.

---

# Frontend Deployment

The React frontend is built and uploaded to Amazon S3.

```text
React Build
    │
    ▼
S3
    │
    ▼
CloudFront
    │
    ▼
Users
```

After deployment, GitHub Actions triggers a **CloudFront cache invalidation** so that the latest frontend version is served.

---

# Monitoring and Logging

Amazon CloudWatch is used for application and infrastructure monitoring.

The **CloudWatch Agent** collects application logs and system metrics from EC2 instances.

```text
EC2
 │
 ├── Application Logs
 │
 ├── System Metrics
 │
 └── CloudWatch Agent
          │
          ▼
       CloudWatch
          │
          ▼
       Monitoring
```

Environment-aware log groups are used for application monitoring.

Example:

```text
/dev/backend
/dev/backend/error
```

---

# Environment

## Current Implementation

```text
Environment: dev
AWS Region: ap-south-1
```

The Terraform configuration is environment-aware and uses environment-specific resource naming and configuration.

Example:

```text
ems-dev-*
```

The infrastructure design can support additional environments such as **staging** and **production** when required.

---

# Important Infrastructure Outputs

Terraform exposes important infrastructure values including:

* CloudFront Distribution ID
* CloudFront Domain Name
* Frontend S3 Bucket
* Backend Artifact S3 Bucket
* GitHub Actions IAM Role ARN
* VPC resources

---

# Related Repository

The application source code and application CI/CD are maintained separately.

**Application Repository:**

```text
employee_management_system
```

---

# Author

**Sunil Chouhan**

Cloud Engineer Intern
B.Tech — Cloud Computing
