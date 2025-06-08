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
- **JWT** - Secure authentication

## 🎨 Material Design 3 Implementation

This application implements Google's Material Design 3 (Material You) design system with:

### Design Tokens
- **Color System**: Dynamic color tokens with light/dark theme support
- **Typography Scale**: Hierarchical text styles for optimal readability
- **Shape System**: Consistent border radius and corner treatments
- **Elevation**: Layered shadow system for depth perception
- **Motion**: Smooth animations with easing curves

### Components
- **Filled Buttons**: Primary actions with elevation and state layers
- **Outlined Buttons**: Secondary actions with stroke emphasis
- **Cards**: Elevated surfaces for content grouping
- **Data Tables**: Structured information display
- **Text Fields**: Material input components with focus states
- **Progress Indicators**: Visual feedback for loading states

### Accessibility Features
- **High Contrast Mode**: Enhanced visibility for accessibility needs
- **Reduced Motion**: Respects user's motion preferences
- **Focus Management**: Clear focus indicators for keyboard navigation
- **Screen Reader Support**: Semantic HTML and ARIA labels

### Theme Support
```css
/* Automatic dark mode detection */
@media (prefers-color-scheme: dark) { ... }

/* Manual theme toggle */
[data-theme="dark"] { ... }
```

## 🚀 Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ViranjPatel/task-management-system.git
cd task-management-system
```

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

3. **Install backend dependencies:**
```bash
cd ../backend
npm install
```

4. **Environment Configuration:**
Create `.env` files:

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3001
```

**Backend (.env):**
```env
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
```

5. **Start development servers:**

**Frontend (port 3000):**
```bash
cd frontend
npm start
```

**Backend (port 3001):**
```bash
cd backend
npm start
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### Run All Tests
```bash
# From root directory
npm run test:all
```

## 📦 Deployment

### Automatic Deployment
- **GitHub Actions** configured for automatic deployment
- Push to `main` branch triggers GitHub Pages deployment
- Backend auto-deploys to Render on push

### Manual Deployment
```bash
# Frontend to GitHub Pages
cd frontend
npm run deploy

# Build for production
npm run build
```

### Deployment Script
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🎯 Material Design 3 Guidelines

### Color Usage
```css
/* Primary colors for main actions */
--md-sys-color-primary: #6200ea;
--md-sys-color-on-primary: #ffffff;

/* Surface colors for backgrounds */
--md-sys-color-surface: #fef7ff;
--md-sys-color-on-surface: #1c1b1f;
```

### Component Styling
```css
/* Buttons follow M3 specifications */
.md-filled-button {
  border-radius: var(--md-sys-shape-corner-large);
  padding: 0.625rem 1.5rem;
  box-shadow: var(--md-sys-elevation-1);
}
```

### Motion Design
```css
/* Standard easing curves */
--md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
--md-sys-motion-duration-short4: 200ms;
```

## 🔧 Customization

### Theme Customization
Modify CSS custom properties in `App.css`:
```css
:root {
  --md-sys-color-primary: #your-color;
  --md-sys-shape-corner-medium: 16px;
}
```

### Component Customization
Create new Material Design components:
```css
.your-component {
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-shape-corner-medium);
  box-shadow: var(--md-sys-elevation-2);
}
```

## 📱 Progressive Web App

The application supports PWA features:
- **Offline functionality** (service worker)
- **Install prompt** for mobile devices
- **App-like experience** on mobile

## 🐛 Troubleshooting

### Common Issues

**1. Backend not connecting:**
- Ensure backend is running on port 3001
- Check CORS configuration
- Verify environment variables

**2. Dark theme not working:**
- Check browser's color scheme preference
- Ensure CSS custom properties are loaded
- Verify theme toggle implementation

**3. Render backend sleeping:**
- First request after sleep takes 10-20 seconds
- Consider upgrading to paid Render plan for always-on

## 📊 Performance

### Optimizations Implemented
- **Code splitting** for faster initial load
- **Image optimization** and lazy loading
- **Bundle analysis** with webpack-bundle-analyzer
- **CSS purging** for smaller stylesheets

### Performance Metrics
- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** Material Design 3 guidelines
4. **Test** your changes thoroughly
5. **Commit** with descriptive messages
6. **Push** to your branch
7. **Create** a Pull Request

### Code Style
- Use **Material Design 3** components and tokens
- Follow **React hooks** best practices
- Write **comprehensive tests**
- Document **accessibility features**

## 📋 Roadmap

- [ ] **Advanced filtering** and search
- [ ] **Drag-and-drop** task reordering
- [ ] **Team collaboration** features
- [ ] **File attachments** support
- [ ] **Push notifications**
- [ ] **Offline sync** capabilities

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Google Material Design Team** for the design system
- **React Team** for the amazing framework
- **Open source community** for inspiration and tools

---

**Built with ❤️ using Material Design 3**