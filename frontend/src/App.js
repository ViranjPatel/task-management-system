import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncingIds, setSyncingIds] = useState(new Set());
  const [syncErrors, setSyncErrors] = useState(new Map());
  
  // Debounce timers for auto-save
  const debounceTimers = useRef(new Map());

  // Debounced update function
  const debouncedUpdate = useCallback((id, field, value, delay = 2000) => {
    // Clear existing timer for this field
    const key = `${id}-${field}`;
    if (debounceTimers.current.has(key)) {
      clearTimeout(debounceTimers.current.get(key));
    }

    // Set new timer
    const timer = setTimeout(() => {
      updateTask(id, field, value);
      debounceTimers.current.delete(key);
    }, delay);

    debounceTimers.current.set(key, timer);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

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
    // Add to syncing state
    setSyncingIds(prev => new Set([...prev, id]));
    setSyncErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(id); // Clear any previous errors
      return newMap;
    });

    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    const updatedActivity = { ...activity, [field]: value };

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
      // Update successful - sync local state with server
      setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));
    })
    .catch(error => {
      console.error('Update failed:', error);
      // Revert local change on error
      const originalActivity = activities.find(a => a.id === id);
      if (originalActivity) {
        setActivities(prev => prev.map(a => a.id === id ? originalActivity : a));
      }
      
      // Set error state
      setSyncErrors(prev => new Map(prev).set(id, `Failed to update ${field}`));
    })
    .finally(() => {
      // Remove from syncing state
      setSyncingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    });
  }, [activities]);

  const updateTaskLocal = useCallback((id, field, value) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    
    // Clear any existing error for this task
    setSyncErrors(prev => {
      if (prev.has(id)) {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      }
      return prev;
    });
  }, []);

  const handleInputChange = useCallback((id, field, value) => {
    updateTaskLocal(id, field, value);
    debouncedUpdate(id, field, value);
  }, [updateTaskLocal, debouncedUpdate]);

  const handleInputBlur = useCallback((id, field, value) => {
    // Clear debounce timer and update immediately
    const key = `${id}-${field}`;
    if (debounceTimers.current.has(key)) {
      clearTimeout(debounceTimers.current.get(key));
      debounceTimers.current.delete(key);
    }
    updateTask(id, field, value);
  }, [updateTask]);

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

  const retrySync = (id, field, value) => {
    updateTask(id, field, value);
  };

  if (loading) {
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

  if (error) {
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
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>❌ Connection Error</h2>
          <p>Failed to connect to backend: {error}</p>
          <p>Make sure your backend server is running on port 3001</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'white',
              color: '#667eea',
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
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
          Task Management System
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {syncingIds.size > 0 && (
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
              Syncing {syncingIds.size} task{syncingIds.size > 1 ? 's' : ''}...
            </div>
          )}
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
            + Add New Task
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
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Task Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Priority</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Assignee</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Progress</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => {
                  const isSync = syncingIds.has(activity.id);
                  const hasError = syncErrors.has(activity.id);
                  
                  return (
                    <tr key={activity.id} style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      background: hasError ? '#fef2f2' : (isSync ? '#f0f9ff' : 'transparent'),
                      transition: 'background-color 0.3s ease'
                    }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', position: 'relative' }}>
                        <input
                          type="text"
                          value={activity.task_name || ''}
                          onChange={(e) => handleInputChange(activity.id, 'task_name', e.target.value)}
                          onBlur={(e) => handleInputBlur(activity.id, 'task_name', e.target.value)}
                          style={{ 
                            border: 'none', 
                            background: 'transparent', 
                            width: '100%', 
                            fontWeight: 'bold',
                            opacity: isSync ? 0.7 : 1
                          }}
                        />
                        {isSync && (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            right: '8px',
                            transform: 'translateY(-50%)',
                            width: '12px',
                            height: '12px',
                            border: '2px solid #3b82f6',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={activity.status || ''}
                          onChange={(e) => updateTask(activity.id, 'status', e.target.value)}
                          style={{ border: 'none', background: 'transparent', width: '100%' }}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={activity.priority || ''}
                          onChange={(e) => updateTask(activity.id, 'priority', e.target.value)}
                          style={{ border: 'none', background: 'transparent', width: '100%' }}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', position: 'relative' }}>
                        <input
                          type="text"
                          value={activity.assignee || ''}
                          onChange={(e) => handleInputChange(activity.id, 'assignee', e.target.value)}
                          onBlur={(e) => handleInputBlur(activity.id, 'assignee', e.target.value)}
                          style={{ 
                            border: 'none', 
                            background: 'transparent', 
                            width: '100%',
                            opacity: isSync ? 0.7 : 1
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={activity.progress || 0}
                            onChange={(e) => updateTaskLocal(activity.id, 'progress', parseInt(e.target.value))}
                            onMouseUp={(e) => updateTask(activity.id, 'progress', parseInt(e.target.value))}
                            onBlur={(e) => updateTask(activity.id, 'progress', parseInt(e.target.value))}
                            style={{ flex: 1 }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: 'bold', minWidth: '40px' }}>
                            {activity.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', alignItems: 'center' }}>
                          {hasError && (
                            <button
                              onClick={() => retrySync(activity.id, 'task_name', activity.task_name)}
                              style={{
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px'
                              }}
                              title={syncErrors.get(activity.id)}
                            >
                              ⚠️ Retry
                            </button>
                          )}
                          <button 
                            onClick={() => deleteTask(activity.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '1.2rem',
                              padding: '0.25rem',
                              borderRadius: '4px'
                            }}
                            title="Delete task"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;