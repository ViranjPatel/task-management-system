// server.js - SQLite Version (No Password Required!)
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// More permissive CORS configuration for deployment troubleshooting
app.use(cors({
  origin: true, // Allow all origins temporarily
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// SQLite database setup - creates database.sqlite file in your project
const dbPath = path.join(__dirname, 'database.sqlite');
console.log('📁 Database file location:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database successfully!');
    // Enable Write-Ahead Logging for better concurrency and performance
    db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;', (pragmaErr) => {
      if (pragmaErr) {
        console.error('❌ Error setting PRAGMA options:', pragmaErr.message);
      } else {
        console.log('⚙️  SQLite PRAGMA options set for performance');
      }
    });
  }
});

// Initialize database with sample data
const initDB = () => {
  console.log('🚀 Initializing database...');

  // Create activities table
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'Not Started',
      priority TEXT DEFAULT 'Medium',
      assignee TEXT,
      start_date DATE,
      due_date DATE,
      progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      estimated_hours REAL CHECK (estimated_hours >= 0),
      actual_hours REAL CHECK (actual_hours >= 0),
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err.message);
    } else {
      console.log('✅ Activities table created successfully');

      // Create indexes to speed up common queries
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
        CREATE INDEX IF NOT EXISTS idx_activities_assignee ON activities(assignee);
        CREATE INDEX IF NOT EXISTS idx_activities_priority ON activities(priority);
        CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
        CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
      `, (indexErr) => {
        if (indexErr) {
          console.error('❌ Error creating indexes:', indexErr.message);
        } else {
          console.log('⚡️ Indexes created successfully');
        }
      });
      
      // Check if we need to insert sample data
      db.get('SELECT COUNT(*) as count FROM activities', (err, row) => {
        if (err) {
          console.error('❌ Error checking data:', err.message);
        } else if (row.count === 0) {
          insertSampleData();
        } else {
          console.log(`📊 Database contains ${row.count} activities`);
          console.log('🎉 Database initialization completed successfully!');
        }
      });
    }
  });
};

// Insert sample data
const insertSampleData = () => {
  console.log('📝 Inserting sample data...');
  
  const sampleData = [
    ['Setup Development Environment', 'Configure development tools and dependencies', 'In Progress', 'High', 'John Doe', '2025-06-01', '2025-06-10', 75, 8.0, 6.0, 'setup,development'],
    ['Design Database Schema', 'Create database tables and relationships', 'Completed', 'High', 'Jane Smith', '2025-05-20', '2025-05-30', 100, 12.0, 10.0, 'database,design'],
    ['Implement User Authentication', 'Add login and registration functionality', 'Not Started', 'Medium', 'Mike Johnson', '2025-06-15', '2025-06-25', 0, 16.0, 0.0, 'auth,security'],
    ['Create API Endpoints', 'Develop REST API for task management', 'In Progress', 'High', 'Sarah Wilson', '2025-06-05', '2025-06-20', 40, 20.0, 8.0, 'api,backend'],
    ['Frontend UI Development', 'Build React components and AG Grid integration', 'In Progress', 'Medium', 'Alex Brown', '2025-06-08', '2025-06-30', 30, 24.0, 7.2, 'frontend,ui'],
    ['Write Unit Tests', 'Create comprehensive test suite', 'Not Started', 'Medium', 'Chris Davis', '2025-06-20', '2025-07-05', 0, 14.0, 0.0, 'testing,unit-tests'],
    ['Setup CI/CD Pipeline', 'Configure automated deployment', 'Not Started', 'Low', 'Taylor Johnson', '2025-07-01', '2025-07-15', 0, 10.0, 0.0, 'devops,ci-cd'],
    ['Performance Optimization', 'Optimize queries and improve performance', 'Not Started', 'Medium', 'Jordan Lee', '2025-07-10', '2025-07-25', 0, 18.0, 0.0, 'performance,optimization']
  ];

  const stmt = db.prepare(`
    INSERT INTO activities (
      task_name, description, status, priority, assignee, 
      start_date, due_date, progress, estimated_hours, actual_hours, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let insertedCount = 0;
  sampleData.forEach(data => {
    stmt.run(data, (err) => {
      if (err) {
        console.error('❌ Error inserting data:', err.message);
      } else {
        insertedCount++;
        if (insertedCount === sampleData.length) {
          console.log(`✅ Successfully inserted ${insertedCount} sample activities`);
          console.log('🎉 Database initialization completed successfully!');
        }
      }
    });
  });

  stmt.finalize();
};

// Helper function to parse tags
const parseTags = (tagsString) => {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
};

// Helper function to format tags for storage
const formatTags = (tagsArray) => {
  if (!Array.isArray(tagsArray)) return '';
  return tagsArray.join(',');
};

// Routes

// Get all activities
app.get('/api/activities', (req, res) => {
  db.all('SELECT * FROM activities ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Parse tags for each activity
      const activities = rows.map(row => ({
        ...row,
        tags: parseTags(row.tags)
      }));
      res.json(activities);
    }
  });
});

// Get single activity
app.get('/api/activities/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM activities WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      res.status(404).json({ error: 'Activity not found' });
    } else {
      res.json({
        ...row,
        tags: parseTags(row.tags)
      });
    }
  });
});

// Create new activity
app.post('/api/activities', (req, res) => {
  const {
    task_name,
    description,
    status = 'Not Started',
    priority = 'Medium',
    assignee,
    start_date,
    due_date,
    progress = 0,
    estimated_hours,
    actual_hours,
    tags = []
  } = req.body;

  const tagsString = formatTags(tags);

  db.run(
    `INSERT INTO activities (task_name, description, status, priority, assignee, start_date, due_date, progress, estimated_hours, actual_hours, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [task_name, description, status, priority, assignee, start_date, due_date, progress, estimated_hours, actual_hours, tagsString],
    function(err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        // Get the created activity
        db.get('SELECT * FROM activities WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            res.status(201).json({
              ...row,
              tags: parseTags(row.tags)
            });
          }
        });
      }
    }
  );
});

// Update activity
app.put('/api/activities/:id', (req, res) => {
  const { id } = req.params;
  const {
    task_name,
    description,
    status,
    priority,
    assignee,
    start_date,
    due_date,
    progress,
    estimated_hours,
    actual_hours,
    tags
  } = req.body;

  const tagsString = formatTags(tags);

  db.run(
    `UPDATE activities 
     SET task_name = ?, description = ?, status = ?, priority = ?, assignee = ?, 
         start_date = ?, due_date = ?, progress = ?, estimated_hours = ?, actual_hours = ?, 
         tags = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [task_name, description, status, priority, assignee, start_date, due_date, progress, estimated_hours, actual_hours, tagsString, id],
    function(err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Activity not found' });
      } else {
        // Get the updated activity
        db.get('SELECT * FROM activities WHERE id = ?', [id], (err, row) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            res.json({
              ...row,
              tags: parseTags(row.tags)
            });
          }
        });
      }
    }
  );
});

// Delete activity
app.delete('/api/activities/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM activities WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Activity not found' });
    } else {
      res.json({ message: 'Activity deleted successfully' });
    }
  });
});

// Get unique assignees
app.get('/api/assignees', (req, res) => {
  db.all('SELECT DISTINCT assignee FROM activities WHERE assignee IS NOT NULL AND assignee != "" ORDER BY assignee', [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows.map(row => row.assignee));
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'SQLite',
    timestamp: new Date().toISOString(),
    cors: 'Permissive for debugging'
  });
});

// Root endpoint to confirm the server is running
app.get('/', (req, res) => {
  res.json({
    message: 'Task Management API is running',
    endpoints: [
      '/api/activities',
      '/api/activities/:id',
      '/api/assignees',
      '/api/health'
    ],
    documentation: 'https://github.com/ViranjPatel/task-management-system',
    cors: 'All origins allowed'
  });
});

// Initialize database and start server
initDB();

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 API available at http://localhost:${port}/api`);
  console.log(`💾 Database: SQLite (file-based, no password required)`);
  console.log(`📄 Database file: ${dbPath}`);
  console.log(`🌐 CORS: Allowing all origins for debugging`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database connection closed');
    }
    process.exit(0);
  });
});

module.exports = app;