import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import TaskGrid from './TaskGrid';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

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

  const addNewTask = useCallback(() => {
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

    setLoading(true);
    fetch(`${API_URL}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`);
      }
      return response.json();
    })
    .then(createdTask => {
      setActivities(prev => [createdTask, ...prev]);
      // Auto-edit the new task
      setEditingTask(createdTask);
      setShowTaskDialog(true);
    })
    .catch(error => {
      console.error('Error creating task:', error);
      setError(`Failed to create task: ${error.message}`);
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const updateTask = useCallback((id, field, value) => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    const updatedActivity = { ...activity, [field]: value };

    // Optimistic update
    setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));

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
    .catch(error => {
      console.error('Update failed:', error);
      // Revert optimistic update on error
      setActivities(prev => prev.map(a => a.id === id ? activity : a));
      setError(`Failed to update task: ${error.message}`);
    });
  }, [activities]);

  const deleteTask = useCallback((id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    // Optimistic delete
    const originalActivities = activities;
    setActivities(prev => prev.filter(a => a.id !== id));

    fetch(`${API_URL}/api/activities/${id}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to delete: ${response.status}`);
        }
      })
      .catch(error => {
        console.error('Error deleting task:', error);
        // Revert optimistic delete on error
        setActivities(originalActivities);
        setError(`Failed to delete task: ${error.message}`);
      });
  }, [activities]);

  const handleTaskEdit = useCallback((task) => {
    setEditingTask(task);
    setShowTaskDialog(true);
  }, []);

  const handleTaskDuplicate = useCallback((task) => {
    const duplicatedTask = {
      ...task,
      id: undefined, // Remove ID so backend creates new one
      task_name: `${task.task_name} (Copy)`,
      created_at: undefined,
      updated_at: undefined
    };

    setLoading(true);
    fetch(`${API_URL}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicatedTask)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to duplicate task: ${response.status}`);
      }
      return response.json();
    })
    .then(createdTask => {
      setActivities(prev => [createdTask, ...prev]);
    })
    .catch(error => {
      console.error('Error duplicating task:', error);
      setError(`Failed to duplicate task: ${error.message}`);
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const saveTaskEdit = useCallback((updatedTask) => {
    if (!updatedTask.id) return;

    fetch(`${API_URL}/api/activities/${updatedTask.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to save: ${response.status}`);
      }
      return response.json();
    })
    .then(() => {
      setActivities(prev => prev.map(a => a.id === updatedTask.id ? updatedTask : a));
      setShowTaskDialog(false);
      setEditingTask(null);
    })
    .catch(error => {
      console.error('Save failed:', error);
      setError(`Failed to save task: ${error.message}`);
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  if (loading && activities.length === 0) {
    return (
      <div className="loading-container">
        <div className="md-spinner"></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="app-header">
        <h1>📊 Task Management System</h1>
        <div className="header-actions">
          {loading && activities.length > 0 && (
            <div className="sync-indicator">
              <div className="md-spinner-small"></div>
              Processing...
            </div>
          )}
          <button 
            onClick={addNewTask}
            disabled={loading}
            className="md-filled-button"
          >
            {loading ? '⏳' : '+'} Add New Task
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={clearError} className="error-close">
            ✕
          </button>
        </div>
      )}

      {/* Content */}
      <div className="grid-container">
        <div className="md-card md-card-elevated">
          <div className="grid-content">
            <div className="grid-header">
              <h2>📊 Activities ({activities.length})</h2>
              <div className="grid-info">
                <span>🔄 Real-time sync</span>
                <span>•</span>
                <span>📱 AG Grid powered</span>
              </div>
            </div>
            
            {activities.length === 0 && !loading ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No tasks yet</h3>
                <p>Get started by creating your first task!</p>
                <button 
                  onClick={addNewTask}
                  className="md-filled-button"
                >
                  + Create First Task
                </button>
              </div>
            ) : (
              <TaskGrid
                activities={activities}
                updateTask={updateTask}
                deleteTask={deleteTask}
                onTaskEdit={handleTaskEdit}
                onTaskDuplicate={handleTaskDuplicate}
                loading={loading}
                error={null} // Don't pass error to grid, we handle it at app level
              />
            )}
          </div>
        </div>
      </div>

      {/* Task Edit Dialog */}
      {showTaskDialog && editingTask && (
        <TaskEditDialog
          task={editingTask}
          onSave={saveTaskEdit}
          onCancel={() => {
            setShowTaskDialog(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

// Simple Task Edit Dialog Component
function TaskEditDialog({ task, onSave, onCancel }) {
  const [editedTask, setEditedTask] = useState(task);

  const handleChange = (field, value) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editedTask);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content md-card">
        <h3 className="dialog-title">✏️ Edit Task</h3>
        
        <div className="dialog-form">
          <div className="form-field">
            <label className="form-label">Task Name</label>
            <input
              type="text"
              value={editedTask.task_name || ''}
              onChange={(e) => handleChange('task_name', e.target.value)}
              className="md-text-field"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Description</label>
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="md-text-field"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Status</label>
              <select
                value={editedTask.status || 'Not Started'}
                onChange={(e) => handleChange('status', e.target.value)}
                className="md-select"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Priority</label>
              <select
                value={editedTask.priority || 'Medium'}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="md-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Assignee</label>
            <input
              type="text"
              value={editedTask.assignee || ''}
              onChange={(e) => handleChange('assignee', e.target.value)}
              className="md-text-field"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={editedTask.start_date || ''}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className="md-text-field"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={editedTask.due_date || ''}
                onChange={(e) => handleChange('due_date', e.target.value)}
                className="md-text-field"
              />
            </div>
          </div>
        </div>

        <div className="dialog-actions">
          <button onClick={onCancel} className="md-outlined-button">
            Cancel
          </button>
          <button onClick={handleSave} className="md-filled-button">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;