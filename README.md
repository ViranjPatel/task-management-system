# Task Management System

A modern, full-stack task management application built with React and Node.js, following Google's Material Design 3 guidelines.

## ✨ Features

- 🎯 **Complete Task Management**: Create, read, update, and delete tasks
- 🏷️ **Smart Organization**: Task categorization with priorities and status tracking  
- 🎨 **Material Design 3**: Modern UI following Google's latest design system
- 🌙 **Dark Mode Support**: Automatic and manual dark theme switching
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚡ **Real-time Updates**: Live task synchronization
- ♿ **Accessibility**: High contrast mode and screen reader support
- 🔒 **User Authentication**: Secure register/login system

## 🚀 Deployment Status

**Auto-deployment enabled!** This application is automatically deployed when changes are pushed to the main branch.

- **📱 Frontend**: https://viranjpatel.github.io/task-management-system/
- **🖥️ Backend**: https://task-management-system-backend-latest.onrender.com

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern JavaScript framework
- **Material Design 3** - Google's latest design system
- **CSS Custom Properties** - Dynamic theming support
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight database
- **JWT** - Secure authentication tokens

## 🎨 Material Design 3 Implementation

This application fully implements Google's Material Design 3 system:

### Design Tokens
- **Color System**: Dynamic color palettes with light/dark theme support
- **Typography Scale**: Consistent text hierarchy using Material 3 type scale
- **Elevation**: Subtle shadows following Material 3 elevation system
- **Shape**: Rounded corners using Material 3 shape tokens
- **Motion**: Smooth animations with Material 3 motion curves

### Components
- **Buttons**: Filled and outlined buttons with state layers
- **Cards**: Elevated surfaces with proper elevation
- **Data Tables**: Material 3 compliant data presentation
- **Text Fields**: Borderless inputs with focus indicators
- **Progress Indicators**: Custom sliders with Material 3 styling

### Accessibility Features
- **High Contrast**: Support for high contrast color schemes
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Proper focus indicators for keyboard navigation
- **Screen Readers**: Semantic HTML with proper ARIA labels

### Theming
```css
/* Light Theme (Default) */
--md-sys-color-primary: #6200ea;
--md-sys-color-surface: #fef7ff;
--md-sys-color-background: #fef7ff;

/* Dark Theme */
--md-sys-color-primary: #d0bcff;
--md-sys-color-surface: #141218;
--md-sys-color-background: #141218;
```

## 🖥️ Development Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Git**

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/ViranjPatel/task-management-system.git
cd task-management-system
```

2. **Install frontend dependencies**:
```bash
cd frontend
npm install
```

3. **Install backend dependencies**:
```bash
cd ../backend
npm install
```

4. **Environment Setup**:
Create a `.env` file in the frontend directory:
```bash
# Frontend .env
REACT_APP_API_URL=http://localhost:3001
```

Create a `.env` file in the backend directory:
```bash
# Backend .env
PORT=3001
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### Development Commands

**Start Frontend** (runs on http://localhost:3000):
```bash
cd frontend
npm start
```

**Start Backend** (runs on http://localhost:3001):
```bash
cd backend
npm start
```

**Run Tests**:
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

**Build for Production**:
```bash
cd frontend
npm run build
```

## 🚀 Deployment

### Automatic Deployment
- **GitHub Actions** workflow automatically deploys to GitHub Pages
- Push to `main` branch triggers deployment
- Build status visible in Actions tab

### Manual Deployment
```bash
# Deploy frontend to GitHub Pages
cd frontend
npm run deploy

# Or use the deployment script
chmod +x deploy.sh
./deploy.sh
```

### Backend Deployment (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

## 📊 Performance Features

- **Code Splitting**: Lazy loading for optimal bundle size
- **Caching**: Efficient caching strategies
- **Optimized Images**: Responsive image loading
- **Bundle Analysis**: webpack-bundle-analyzer for size monitoring

## 🧪 Testing

### Frontend Testing
- **Unit Tests**: Jest and React Testing Library
- **Component Tests**: Comprehensive component testing
- **Accessibility Tests**: Automated a11y testing
- **Visual Regression**: Prevent UI breaking changes

### Backend Testing
- **API Tests**: Comprehensive endpoint testing
- **Database Tests**: SQLite in-memory testing
- **Authentication Tests**: JWT token validation

## 📱 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+

## 🔧 Customization

### Theme Customization
Modify CSS custom properties in `src/App.css`:

```css
:root {
  --md-sys-color-primary: #your-primary-color;
  --md-sys-color-secondary: #your-secondary-color;
  /* Add more custom colors */
}
```

### Component Styling
All components use Material Design 3 classes:
- `.md-filled-button` - Primary action buttons
- `.md-outlined-button` - Secondary action buttons
- `.md-card` - Container surfaces
- `.md-data-table` - Data presentation

## 📋 API Documentation

### Endpoints
- `GET /api/activities` - Fetch all tasks
- `POST /api/activities` - Create new task
- `PUT /api/activities/:id` - Update task
- `DELETE /api/activities/:id` - Delete task
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration

### Request Examples
```javascript
// Create a new task
POST /api/activities
{
  "task_name": "Complete project",
  "description": "Finish the task management system",
  "status": "In Progress",
  "priority": "High",
  "assignee": "John Doe",
  "progress": 75
}
```

## 🐛 Troubleshooting

### Common Issues

**Backend Connection Error**:
- Check if backend server is running on port 3001
- Verify `REACT_APP_API_URL` in frontend `.env`
- Check network connectivity

**Render Backend Sleep**:
- First request takes 10-20 seconds (cold start)
- Subsequent requests are fast
- Consider upgrading to paid tier for always-on

**GitHub Pages Deployment**:
- Check Actions tab for build status
- Verify `homepage` field in `package.json`
- Ensure repository has Pages enabled

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow Material Design 3 principles
- Write comprehensive tests
- Update documentation
- Use semantic commit messages
- Ensure accessibility compliance

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Material Design** team for the excellent design system
- **React** team for the amazing framework
- **Open Source Community** for the tools and libraries used

---

**Built with ❤️ using Material Design 3**