# Employee Management System

A full-stack Employee Management System built using **React, Node.js, Express, and PostgreSQL**. The application provides complete CRUD functionality for managing employee records and serves as the application layer for a Cloud-Native DevOps Pipeline project.

---

## Features

* Create Employee
* View Employees
* Update Employee
* Delete Employee
* Search Employees
* Form Validation
* Responsive User Interface
* RESTful API Architecture
* PostgreSQL Database Integration

---

## Tech Stack

### Frontend

* React
* Axios
* CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### DevOps (Upcoming)

* Docker
* Docker Compose
* GitHub Actions
* AWS ECR
* Amazon EKS
* Helm
* Argo CD
* Prometheus
* Grafana

---

## Project Structure

```text
employee-management/

├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   └── Dockerfile
│
├── database/
│   └── schema.sql
│
├── docker-compose.yml
└── README.md
```

---

## Database Schema

```sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    salary NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints

### Get All Employees

```http
GET /api/employees
```

### Create Employee

```http
POST /api/employees
```

Request Body:

```json
{
  "name": "Sunil Chouhan",
  "email": "sunil@gmail.com",
  "department": "DevOps",
  "salary": 70000
}
```

### Update Employee

```http
PUT /api/employees/:id
```

### Delete Employee

```http
DELETE /api/employees/:id
```

---

## Local Setup

### Clone Repository

```bash
git clone <repository-url>
cd employee-management
```

### Backend Setup

```bash
cd backend

npm install

npm start
```

### Frontend Setup

```bash
cd frontend

npm install

npm start
```

### PostgreSQL Setup

Create database:

```sql
CREATE DATABASE employee_db;
```

Execute schema:

```sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    salary NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Docker Deployment

Build and run containers:

```bash
docker compose up --build
```

Access application:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

---

## Future Enhancements

* JWT Authentication
* Role-Based Access Control (RBAC)
* Docker Image Optimization
* CI/CD Pipeline with GitHub Actions
* Kubernetes Deployment
* Helm Charts
* GitOps with Argo CD
* Monitoring with Prometheus & Grafana
* Horizontal Pod Autoscaling

---

## Cloud-Native DevOps Integration

This application is designed to integrate with a separate Cloud-Native DevOps Pipeline repository that manages:

* Infrastructure as Code using Terraform
* Kubernetes Deployments
* Helm Charts
* GitOps Workflows with Argo CD
* Observability Stack
* Automated CI/CD Pipelines

---

## Author

**Sunil Chouhan**

Aspiring DevOps Engineer | AWS | Docker | Kubernetes | Terraform | GitOps | CI/CD
