# Task Management System

A modern, Excel-like task management application built with React frontend and Node.js backend.

![Task Management System](https://via.placeholder.com/800x400/667eea/ffffff?text=Task+Management+System)

## ✨ Features

- 📊 **Interactive Data Grid** - Excel-like editing experience
- ✏️ **Inline Editing** - Click any cell to edit directly
- 🔄 **Real-time Updates** - Changes saved automatically
- 🎨 **Modern UI** - Beautiful gradient design
- 📱 **Responsive** - Works on desktop and mobile
- 🔍 **Advanced Filtering** - Built-in search and filter
- 📈 **Progress Tracking** - Visual progress bars
- 🏷️ **Task Management** - Status, priority, assignees, tags
- ⚡ **Fast Performance** - Optimized for large datasets

## 🛠️ Tech Stack

### Frontend
- **React 18/19** - Modern React with hooks
- **Modern CSS** - Gradients, animations, responsive design
- **Fetch API** - For backend communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **JSON File Database** - Lightweight file-based storage
- **RESTful API** - Standard API architecture

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/task-management-system.git
   cd task-management-system
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
task-management-system/
├── backend/
│   ├── server.js              # Express server
│   ├── package.json          # Backend dependencies
│   ├── .env.example          # Environment template
│   └── database.json         # JSON database file (auto-created)
├── frontend/
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Styles
│   │   └── index.js         # React entry point
│   ├── package.json         # Frontend dependencies
│   └── public/
├── .gitignore               # Git ignore rules
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend folder based on `.env.example`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | Get all activities |
| GET | `/api/activities/:id` | Get single activity |
| POST | `/api/activities` | Create new activity |
| PUT | `/api/activities/:id` | Update activity |
| DELETE | `/api/activities/:id` | Delete activity |
| GET | `/api/assignees` | Get unique assignees |
| GET | `/api/health` | Health check |

## 🎯 Usage

### Adding Tasks
1. Click "Add New Task" button
2. Edit the new row inline
3. Changes save automatically

### Editing Tasks
- **Text Fields**: Click to edit directly
- **Dropdown Menus**: Status and Priority have preset options
- **Progress**: Use slider to adjust percentage
- **Assignees**: Type names directly

### Task Properties
- **Task Name**: Description of the task
- **Status**: Not Started, In Progress, Completed, On Hold, Cancelled
- **Priority**: Low, Medium, High, Critical
- **Assignee**: Person responsible
- **Progress**: Completion percentage (0-100%)
- **Estimated/Actual Hours**: Time tracking

## 🎨 Customization

### Styling
- Update `frontend/src/App.css` for custom themes
- Modify inline styles in components
- Add new status/priority options in dropdown arrays

### Adding Features
- New fields: Update both frontend and backend
- Custom styling: Modify CSS classes
- New API endpoints: Extend the Express server

## 🚀 Deployment

### Frontend (React)
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your web server
```

### Backend (Node.js)
```bash
cd backend
npm start
# Use PM2 for production process management
```

### Database
- JSON File: Simple file-based storage, perfect for development
- Easy to backup (just copy the database.json file)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework
- Modern CSS techniques for beautiful UI design

## 📞 Support

If you have any questions or run into issues:

1. Check the [Issues](../../issues) page
2. Create a new issue if your problem isn't listed
3. Provide detailed information about your environment and the problem

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Basic task management functionality
- ✅ Excel-like editing interface
- ✅ Real-time data updates
- ✅ Modern responsive design
- ✅ JSON file database support
- ✅ RESTful API architecture

### Upcoming Features
- 🔜 User authentication
- 🔜 Team collaboration
- 🔜 File attachments
- 🔜 Advanced reporting
- 🔜 Mobile app

---

**Built with ❤️ using React and Node.js**