// scripts/initDatabase.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'task_manager',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const createTables = async () => {
  try {
    console.log('🚀 Initializing database...');

    // Create activities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        task_name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Not Started',
        priority VARCHAR(20) DEFAULT 'Medium',
        assignee VARCHAR(100),
        start_date DATE,
        due_date DATE,
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        estimated_hours DECIMAL(5,2) CHECK (estimated_hours >= 0),
        actual_hours DECIMAL(5,2) CHECK (actual_hours >= 0),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Activities table created successfully');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
      CREATE INDEX IF NOT EXISTS idx_activities_assignee ON activities(assignee);
      CREATE INDEX IF NOT EXISTS idx_activities_priority ON activities(priority);
      CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
      CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
    `);

    console.log('✅ Indexes created successfully');

    // Create trigger to update updated_at timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
      CREATE TRIGGER update_activities_updated_at
        BEFORE UPDATE ON activities
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
    `);

    console.log('✅ Triggers created successfully');

    // Insert sample data if table is empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM activities');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO activities (
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
        ) VALUES
        (
          'Setup Development Environment', 
          'Configure development tools, IDE settings, and install necessary dependencies for the project',
          'In Progress', 
          'High', 
          'John Doe', 
          '2025-06-01', 
          '2025-06-10', 
          75, 
          8.0, 
          6.0, 
          ARRAY['setup', 'development', 'tools']
        ),
        (
          'Design Database Schema', 
          'Create comprehensive database tables, relationships, and constraints for the task management system',
          'Completed', 
          'High', 
          'Jane Smith', 
          '2025-05-20', 
          '2025-05-30', 
          100, 
          12.0, 
          10.0, 
          ARRAY['database', 'design', 'schema']
        ),
        (
          'Implement User Authentication', 
          'Add secure login and registration functionality with JWT tokens and password hashing',
          'Not Started', 
          'Medium', 
          'Mike Johnson', 
          '2025-06-15', 
          '2025-06-25', 
          0, 
          16.0, 
          0.0, 
          ARRAY['auth', 'security', 'jwt']
        ),
        (
          'Create API Endpoints', 
          'Develop comprehensive REST API endpoints for task management with proper error handling',
          'In Progress', 
          'High', 
          'Sarah Wilson', 
          '2025-06-05', 
          '2025-06-20', 
          40, 
          20.0, 
          8.0, 
          ARRAY['api', 'backend', 'rest']
        ),
        (
          'Frontend UI Development', 
          'Build responsive React components with AG Grid integration and modern styling',
          'In Progress', 
          'Medium', 
          'Alex Brown', 
          '2025-06-08', 
          '2025-06-30', 
          30, 
          24.0, 
          7.2, 
          ARRAY['frontend', 'ui', 'react']
        ),
        (
          'Write Unit Tests', 
          'Create comprehensive test suite for both frontend and backend components',
          'Not Started', 
          'Medium', 
          'Chris Davis', 
          '2025-06-20', 
          '2025-07-05', 
          0, 
          14.0, 
          0.0, 
          ARRAY['testing', 'unit-tests', 'jest']
        ),
        (
          'Setup CI/CD Pipeline', 
          'Configure automated testing and deployment pipeline using GitHub Actions',
          'Not Started', 
          'Low', 
          'Taylor Johnson', 
          '2025-07-01', 
          '2025-07-15', 
          0, 
          10.0, 
          0.0, 
          ARRAY['devops', 'ci-cd', 'automation']
        ),
        (
          'Performance Optimization', 
          'Optimize database queries, implement caching, and improve frontend performance',
          'Not Started', 
          'Medium', 
          'Jordan Lee', 
          '2025-07-10', 
          '2025-07-25', 
          0, 
          18.0, 
          0.0, 
          ARRAY['performance', 'optimization', 'caching']
        ),
        (
          'Documentation', 
          'Create user documentation, API documentation, and deployment guides',
          'Not Started', 
          'Low', 
          'Casey Morgan', 
          '2025-07-15', 
          '2025-07-30', 
          0, 
          12.0, 
          0.0, 
          ARRAY['documentation', 'guides', 'api-docs']
        ),
        (
          'Security Audit', 
          'Conduct thorough security review and implement security best practices',
          'Not Started', 
          'Critical', 
          'Sam Wilson', 
          '2025-07-20', 
          '2025-08-05', 
          0, 
          16.0, 
          0.0, 
          ARRAY['security', 'audit', 'compliance']
        )
      `);

      console.log('✅ Sample data inserted successfully');
    } else {
      console.log('ℹ️  Sample data already exists, skipping insertion');
    }

    console.log(`📊 Database contains ${rows[0].count} activities`);
    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the initialization
if (require.main === module) {
  createTables();
}

module.exports = { createTables };