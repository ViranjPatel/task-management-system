import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import TaskGrid from './TaskGrid';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const getInitialTheme = () => {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

function App() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const syncingIds = useRef(new Set());
  const debounceTimers = useRef(new Map());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load data
  useEffect(() => {
    fetch(`${API_URL}/api/activities`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Data loaded:', data);
        setActivities(data);
        setError(null);
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  const updateTaskLocal = useCallback((id, field, value) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  }, []);

  const addNewTask = () => {
    const newTask = {
      task_name: 'New Task',
      description: 'Enter description',
      status: 'Not Started',
      priority: 'Medium',
      assignee: '',
      start_date: new Date().toISOString().split('T')[0],
      due_date: null,
      progress: 0,
      estimated_hours: 0,
      actual_hours: 0,
      tags: []
    };

    fetch(`${API_URL}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })
    .then(response => response.json())
    .then(createdTask => {
      setActivities(prev => [createdTask, ...prev]);
    })
    .catch(error => {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    });
  };

  const updateTask = useCallback((id, field, value) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;
    const updatedActivity = { ...activity, [field]: value };

    syncingIds.current.add(id);

    fetch(`${API_URL}/api/activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedActivity)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to update: ${response.status}`);
      }
      return response.json();
    })
    .then(() => {
      setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));
    })
    .catch(error => {
      console.error('Update failed:', error);
    })
    .finally(() => {
      syncingIds.current.delete(id);
    });
  }, [activities]);

  const debouncedUpdate = useCallback((id, field, value, delay = 1000) => {
    const key = `${id}-${field}`;
    if (debounceTimers.current.has(key)) {
      clearTimeout(debounceTimers.current.get(key));
    }
    debounceTimers.current.set(
      key,
      setTimeout(() => {
        updateTask(id, field, value);
        debounceTimers.current.delete(key);
      }, delay)
    );
  }, [updateTask]);

  const handleGridUpdate = useCallback((id, field, value) => {
    updateTaskLocal(id, field, value);
    debouncedUpdate(id, field, value);
  }, [debouncedUpdate, updateTaskLocal]);

  const deleteTask = (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    fetch(`${API_URL}/api/activities/${id}`, { method: 'DELETE' })
      .then(() => {
        setActivities(prev => prev.filter(a => a.id !== id));
      })
      .catch(error => {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--md-sys-color-primary)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading activities...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--md-sys-color-primary)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>❌ Connection Error</h2>
          <p>Failed to connect to backend: {error}</p>
          <p>Make sure your backend server is running on port 3001</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'white',
              color: 'var(--md-sys-color-primary)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem',
              fontWeight: 'bold'
            }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--md-sys-color-background)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--md-sys-color-primary) 0%, #7b4dff 100%)',
        color: 'white',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
          Task Management System
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={addNewTask}
            style={{
              background: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            + Add New Task
          </button>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflowX: 'auto'
        }}>
          <h2 style={{ marginTop: 0, color: '#2d3748', marginBottom: '1.5rem' }}>
            📊 Activities ({activities.length})
          </h2>
          
          {activities.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
              No activities found. Make sure your backend is running.
            </p>
          ) : (
            <TaskGrid
              activities={activities}
              onCellUpdate={handleGridUpdate}
              deleteTask={deleteTask}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;