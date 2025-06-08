#!/bin/bash

# Simple script to deploy the frontend to GitHub Pages

# Change to frontend directory
cd frontend

# Install dependencies (if needed)
echo "Installing dependencies..."
npm install

# Deploy to GitHub Pages
echo "Deploying to GitHub Pages..."
npm run deploy

echo "Done! Your app should be available at https://viranjpatel.github.io/task-management-system/"
echo "Note: It might take a few minutes for the changes to be visible."