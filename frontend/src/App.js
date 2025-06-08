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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
          📊 Task Management System
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {loading && activities.length > 0 && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Processing...
            </div>
          )}
          <button 
            onClick={addNewTask}
            disabled={loading}
            style={{
              background: loading ? 'rgba(76, 175, 80, 0.5)' : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? '⏳' : '+'} Add New Task
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #fecaca'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0.25rem'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h2 style={{ margin: 0, color: '#2d3748' }}>
              📊 Activities ({activities.length})
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem', color: '#64748b' }}>
              <span>🔄 Real-time sync</span>
              <span>•</span>
              <span>📱 AG Grid powered</span>
            </div>
          </div>
          
          {activities.length === 0 && !loading ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              padding: '4rem 2rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '2px dashed #e2e8f0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>No tasks yet</h3>
              <p style={{ margin: '0 0 1.5rem 0' }}>
                Get started by creating your first task!
              </p>
              <button 
                onClick={addNewTask}
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#2d3748' }}>
          ✏️ Edit Task
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Task Name
            </label>
            <input
              type="text"
              value={editedTask.task_name || ''}
              onChange={(e) => handleChange('task_name', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Description
            </label>
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Status
              </label>
              <select
                value={editedTask.status || 'Not Started'}
                onChange={(e) => handleChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Priority
              </label>
              <select
                value={editedTask.priority || 'Medium'}
                onChange={(e) => handleChange('priority', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Assignee
            </label>
            <input
              type="text"
              value={editedTask.assignee || ''}
              onChange={(e) => handleChange('assignee', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Start Date
              </label>
              <input
                type="date"
                value={editedTask.start_date || ''}
                onChange={(e) => handleChange('start_date', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Due Date
              </label>
              <input
                type="date"
                value={editedTask.due_date || ''}
                onChange={(e) => handleChange('due_date', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '2rem', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              color: '#374151',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;