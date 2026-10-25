-- =============================================================================
-- MediBook Hospital Appointment Booking System
-- Database Creation & Role Setup Script
-- =============================================================================

-- Run this script in PostgreSQL (via pgAdmin Query Tool or psql as postgres superuser):

CREATE DATABASE "Hospital";

ALTER USER postgres WITH PASSWORD 'papuchellakutty12345';

GRANT ALL PRIVILEGES ON DATABASE "Hospital" TO postgres;

\c "Hospital"

-- Ensure schema public has all necessary privileges
GRANT ALL ON SCHEMA public TO postgres;
