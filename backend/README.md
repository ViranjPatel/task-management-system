# Task Management System Backend

A backend API for task management application using Node.js, Express, and SQLite.

## Features

- RESTful API for task management
- SQLite database (no password required)
- CORS enabled for cross-origin requests
- Sample data included for testing

## API Endpoints

- `GET /api/activities` - Get all activities
- `GET /api/activities/:id` - Get single activity
- `POST /api/activities` - Create new activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `GET /api/assignees` - Get unique assignees
- `GET /api/health` - Health check

## Deployment

This backend is deployed on Render and accessible at:
`https://task-management-system-backend-latest.onrender.com`

Last updated: 2025-06-08 - CORS configuration updated for GitHub Pages compatibility