# Task Management System

A full-stack task management application built with React and Node.js.

## Features

- User authentication (register/login)
- Create, read, update, and delete tasks
- Task categorization with priorities
- Responsive design
- Real-time task management

## Deployment Status

🚀 **Auto-deployment enabled!** 

This application is automatically deployed to GitHub Pages when changes are pushed to the main branch.

- **Frontend URL**: https://viranjpatel.github.io/task-management-system/
- **Backend URL**: https://task-management-system-backend-latest.onrender.com

## Tech Stack

### Frontend
- React.js
- Axios for API calls
- Responsive CSS

### Backend
- Node.js
- Express.js
- SQLite database
- JWT authentication

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ViranjPatel/task-management-system.git
cd task-management-system
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Start the development servers:

Frontend:
```bash
cd frontend
npm start
```

Backend:
```bash
cd backend
npm start
```

## Deployment

### Automatic Deployment
The application is configured with GitHub Actions for automatic deployment:
- Push to `main` branch triggers automatic deployment to GitHub Pages
- The deployment workflow builds the React app and deploys it

### Manual Deployment
You can also deploy manually using the deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Important Notes

1. **First-time GitHub Pages deployment** might take 5-10 minutes to become available.
2. **Render Backend Sleep**: The backend on Render's free tier goes to sleep after 15 minutes of inactivity. First request will be slow (10-20 seconds) while it wakes up.
3. **Database Persistence**: SQLite database on Render resets on each deployment or maintenance.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to your branch
5. Create a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
