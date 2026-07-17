#!/bin/bash

set -euo pipefail

############################################
# Variables
############################################

APP_NAME="employee-management-system"

S3_BUCKET="${S3_BUCKET:?S3_BUCKET not set}"
ARTIFACT_NAME="${ARTIFACT_NAME:?ARTIFACT_NAME not set}"

TMP_DIR="/tmp/${APP_NAME}"

DEPLOY_DIR="/opt/${APP_NAME}"

ARTIFACT_PATH="${TMP_DIR}/${ARTIFACT_NAME}"


NGINX_ROOT="/var/www/html"


HEALTH_ENDPOINT="http://localhost/api/health"
MAX_RETRIES=10
RETRY_INTERVAL=5


EXTRACT_DIR="${TMP_DIR}/extracted"

BACKEND_DIR="${DEPLOY_DIR}/backend"
FRONTEND_DIR="${DEPLOY_DIR}/frontend"
CURRENT_BACKEND="${DEPLOY_DIR}/backend"
NEW_BACKEND="${EXTRACT_DIR}/backend"
CURRENT_FRONTEND="$NGINX_ROOT"
NEW_FRONTEND="${EXTRACT_DIR}/frontend/build"

############################################
# Logging
############################################

log() {

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"

}






############################################
# Validate Server
############################################



check_command() {
    local command=$1

    if ! command -v "$command" >/dev/null 2>&1; then
        log "ERROR: $command is not installed."

        exit 1
    fi

}

validate_environment() {

    log "Validating deployment environment"

    ########################################
    # Required Commands
    ########################################

    check_command aws 
    check_command unzip
    check_command npm 
    check_command pm2
    check_command nginx


    ########################################
    # Deployment Directory
    ########################################

    if [ ! -d "$DEPLOY_DIR" ]; then
        log "Creating deployment directory..."
        mkdir -p "$DEPLOY_DIR"
    fi



    ########################################
    # Nginx Status
    ########################################

    if ! systemctl is-active --quiet nginx; then
        log "ERROR: Nginx service is not runnign"
        exit 1
    fi 



    ########################################
    # Amazon get-caller-identity
    ########################################

    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        log "ERROR: Unable to authenticate with AWS usign the EC2 IAM role."
        exit 1
    fi


    ########################################
    # Validation Success
    ########################################

    log "Environment validation completed."

}








############################################
# Download Artifact
############################################

download_artifact() {

    log "Downloading latest artifact"

    mkdir -p "$(dirname "$ARTIFACT_PATH")"


    if ! aws s3 ls "s3://${S3_BUCKET}/${ARTIFACT_NAME}" >/dev/null 2>&1; then
        log "ERROR: Artifact not found."
        exit 1 
    fi 


    aws s3 cp \
        "s3://${S3_BUCKET}/${ARTIFACT_NAME}" \
        "$ARTIFACT_PATH"
    
    log "Artifact downloaded successfull."

}







############################################
# Extract Artifact
############################################

extract_artifact() {

    log "Extracting artifact"

    rm -rf "$EXTRACT_DIR"
    mkdir -p "$EXTRACT_DIR"

    unzip -q "$ARTIFACT_PATH" -d "$EXTRACT_DIR"


    if [ ! -d "$EXTRACT_DIR/backend" ]; then
        log "ERROR: Backend directory not found."
        exit 1 
    fi 

    if [ ! -d "$EXTRACT_DIR/frontend/build" ]; then

        log "ERROR: Frontend build missing."

        exit 1

    fi

    log "Artifact extracted successfull."

}








############################################
# Deploy Backend
############################################

deploy_backend() {

    log "Deploying backend"

    ########################################
    # Backup .env
    ########################################

    if [ -f "${CURRENT_BACKEND}/.env" ]; then 
        cp \
        "${CURRENT_BACKEND}/.env" \
        "${TMP_DIR}/.env"

    fi 

    

    ########################################
    # Remove old backend
    ########################################

    rm -rf "${CURRENT_BACKEND}"


    ########################################
    # Copy new backend
    ########################################

    cp -r \
    "${NEW_BACKEND}" \
    "${CURRENT_BACKEND}"


    ########################################
    # Restore .env
    ########################################

    if [ -f "${TMP_DIR}/.env" ]; then
        mv \
        "${TMP_DIR}/.env" \
        "${CURRENT_BACKEND}/.env"
    fi 


    ########################################
    # Install Dependencies
    ########################################

    cd "${CURRENT_BACKEND}"
    npm ci 
    log "Backend deployment completed."

}









############################################
# Deploy Frontend
############################################

deploy_frontend() {

    log "Deploying frontend"

    ########################################
    # Remove old React build
    ########################################

    rm -rf "${CURRENT_FRONTEND:?}"/*


    ########################################
    # Copy new build
    ########################################

    cp -r \
        "${NEW_FRONTEND}/." \
        "${CURRENT_FRONTEND}"

    log "Frontend deployment completed."

}







############################################
# Restart Services
############################################

restart_services() {

    log "Restarting services"

    ########################################
    # PM2
    ########################################

    if pm2 describe backend >/dev/null 2>&1; then 
        log "Reloading backend..."
        pm2 reload backend
    else
        log "Starting backend..."
        cd "${CURRENT_BACKEND}"
        pm2 start server.js --name backend
    fi 

    pm2 save 


    ########################################
    # Nginx
    ########################################

    nginx -t 

    systemctl reload nginx 
    log "Services restarted successfully."

}









############################################
# Health Check
############################################

health_check() {

    log "Running health check"

    for (( i=1; i<=MAX_RETRIES; i++))
    do 
        if curl -fs "$HEALTH_ENDPOINT" >/dev/null; then 
            log "Application is healthy."
            return 0
        fi 

        log "Health check failed. Retry ${i}/${MAX_RETRIES}..."
        sleep "$RETRY_INTERVAL"
    done 

    log "ERROR: APllication failed health check."

    exit 1
    

}







############################################
# Cleanup
############################################

cleanup() {

    log "Cleaning temporary files"

    rm -rf "$TMP_DIR"

    log "Cleanup completed."

}







############################################
# Main
############################################

main() {

    validate_environment

    download_artifact

    extract_artifact

    deploy_backend

    deploy_frontend

    restart_services

    health_check

    cleanup

    log "Deployment completed successfully"

}

main