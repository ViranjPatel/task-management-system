import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import TaskGrid from './TaskGrid';

// Mock AG Grid
jest.mock('ag-grid-react', () => ({
  AgGridReact: jest.fn(({ onCellValueChanged, onGridReady, ...props }) => {
    // Create a mock grid with basic functionality
    const mockApi = {
      getColumnState: jest.fn(() => []),
      getFilterModel: jest.fn(() => ({})),
      getSortModel: jest.fn(() => []),
      applyColumnState: jest.fn(),
      setFilterModel: jest.fn(),
      setSortModel: jest.fn(),
      exportDataAsCsv: jest.fn(),
      autoSizeAllColumns: jest.fn()
    };

    // Simulate grid ready
    React.useEffect(() => {
      if (onGridReady) {
        onGridReady({ api: mockApi });
      }
    }, []);

    return (
      <div data-testid="ag-grid-mock">
        <div data-testid="grid-controls">
          <input 
            data-testid="quick-filter"
            placeholder="🔍 Quick search..."
            onChange={(e) => {
              // Simulate filter change
              if (props.onFilterChanged) props.onFilterChanged();
            }}
          />
          <button data-testid="reset-filters">Reset</button>
          <button data-testid="auto-size">Fit</button>
          <button data-testid="export-csv">Export</button>
        </div>
        <div data-testid="grid-content">
          {props.rowData && props.rowData.map((row, index) => (
            <div key={row.id || index} data-testid={`grid-row-${row.id}`}>
              <span data-testid={`task-name-${row.id}`}>{row.task_name}</span>
              <span data-testid={`status-${row.id}`}>{row.status}</span>
              <span data-testid={`priority-${row.id}`}>{row.priority}</span>
              <span data-testid={`progress-${row.id}`}>{row.progress}%</span>
              <button 
                data-testid={`edit-${row.id}`}
                onClick={() => props.cellRendererParams?.onEdit?.(row)}
              >
                Edit
              </button>
              <button 
                data-testid={`duplicate-${row.id}`}
                onClick={() => props.cellRendererParams?.onDuplicate?.(row)}
              >
                Duplicate
              </button>
              <button 
                data-testid={`delete-${row.id}`}
                onClick={() => props.cellRendererParams?.onDelete?.(row.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  })
}));

// Mock AG Grid CSS imports
jest.mock('ag-grid-community/styles/ag-grid.css', () => ({}));
jest.mock('ag-grid-community/styles/ag-theme-alpine.css', () => ({}));

// Mock fetch API
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock console methods to reduce test noise
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  fetch.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Mock data
const mockActivities = [
  {
    id: 1,
    task_name: 'Test Task 1',
    status: 'In Progress',
    priority: 'High',
    assignee: 'John Doe',
    progress: 75,
    start_date: '2025-06-01',
    due_date: '2025-06-15',
    estimated_hours: 40,
    actual_hours: 30
  },
  {
    id: 2,
    task_name: 'Test Task 2',
    status: 'Not Started',
    priority: 'Medium',
    assignee: 'Jane Smith',
    progress: 0,
    start_date: '2025-06-05',
    due_date: '2025-06-20',
    estimated_hours: 20,
    actual_hours: 0
  }
];

const mockFetchSuccess = (data) => {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data)
  });
};

const mockFetchError = (message = 'Server Error') => {
  fetch.mockRejectedValue(new Error(message));
};

describe('TaskGrid Component', () => {
  test('renders grid with activities', () => {
    render(
      <TaskGrid
        activities={mockActivities}
        updateTask={jest.fn()}
        deleteTask={jest.fn()}
        onTaskEdit={jest.fn()}
        onTaskDuplicate={jest.fn()}
      />
    );

    expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    expect(screen.getByTestId('task-name-1')).toHaveTextContent('Test Task 1');
    expect(screen.getByTestId('status-1')).toHaveTextContent('In Progress');
    expect(screen.getByTestId('priority-1')).toHaveTextContent('High');
    expect(screen.getByTestId('progress-1')).toHaveTextContent('75%');
  });

  test('handles quick filter input', async () => {
    render(
      <TaskGrid
        activities={mockActivities}
        updateTask={jest.fn()}
        deleteTask={jest.fn()}
        onTaskEdit={jest.fn()}
        onTaskDuplicate={jest.fn()}
      />
    );

    const quickFilter = screen.getByTestId('quick-filter');
    await userEvent.type(quickFilter, 'Test Task 1');
    
    expect(quickFilter.value).toBe('Test Task 1');
  });

  test('calls edit handler when edit button clicked', async () => {
    const mockOnEdit = jest.fn();
    render(
      <TaskGrid
        activities={mockActivities}
        updateTask={jest.fn()}
        deleteTask={jest.fn()}
        onTaskEdit={mockOnEdit}
        onTaskDuplicate={jest.fn()}
      />
    );

    const editButton = screen.getByTestId('edit-1');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockActivities[0]);
  });

  test('calls duplicate handler when duplicate button clicked', async () => {
    const mockOnDuplicate = jest.fn();
    render(
      <TaskGrid
        activities={mockActivities}
        updateTask={jest.fn()}
        deleteTask={jest.fn()}
        onTaskEdit={jest.fn()}
        onTaskDuplicate={mockOnDuplicate}
      />
    );

    const duplicateButton = screen.getByTestId('duplicate-1');
    fireEvent.click(duplicateButton);

    expect(mockOnDuplicate).toHaveBeenCalledWith(mockActivities[0]);
  });

  test('calls delete handler when delete button clicked', async () => {
    const mockOnDelete = jest.fn();
    render(
      <TaskGrid
        activities={mockActivities}
        updateTask={jest.fn()}
        deleteTask={mockOnDelete}
        onTaskEdit={jest.fn()}
        onTaskDuplicate={jest.fn()}
      />
    );

    const deleteButton = screen.getByTestId('delete-1');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  test('shows loading overlay when loading', () => {
    render(
      <TaskGrid
        activities={mockActivities}
        updateTask={jest.fn()}
        deleteTask={jest.fn()}
        onTaskEdit={jest.fn()}
        onTaskDuplicate={jest.fn()}
        loading={true}
      />
    );

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  test('shows error state when error provided', () => {
    render(
      <TaskGrid
        activities={[]}
        updateTask={jest.fn()}
        deleteTask={jest.fn()}
        onTaskEdit={jest.fn()}
        onTaskDuplicate={jest.fn()}
        error="Test error message"
      />
    );

    expect(screen.getByText('❌ Error Loading Tasks')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  test('handles grid control buttons', async () => {
    render(
      <TaskGrid
        activities={mockActivities}
        updateTask={jest.fn()}
        deleteTask={jest.fn()}
        onTaskEdit={jest.fn()}
        onTaskDuplicate={jest.fn()}
      />
    );

    // Test reset button
    const resetButton = screen.getByTestId('reset-filters');
    fireEvent.click(resetButton);

    // Test auto-size button
    const autoSizeButton = screen.getByTestId('auto-size');
    fireEvent.click(autoSizeButton);

    // Test export button
    const exportButton = screen.getByTestId('export-csv');
    fireEvent.click(exportButton);

    // These should not throw errors
    expect(resetButton).toBeInTheDocument();
    expect(autoSizeButton).toBeInTheDocument();
    expect(exportButton).toBeInTheDocument();
  });
});

describe('Enhanced App Component with AG Grid', () => {
  test('renders loading state initially', () => {
    mockFetchSuccess(mockActivities);
    render(<App />);
    expect(screen.getByText('Loading activities...')).toBeInTheDocument();
  });

  test('renders AG Grid after successful load', async () => {
    mockFetchSuccess(mockActivities);
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('📊 Task Management System')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    expect(screen.getByTestId('task-name-1')).toHaveTextContent('Test Task 1');
  });

  test('renders error state when API fails', async () => {
    mockFetchError('Connection failed');
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Connection Error/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Failed to connect to backend/i)).toBeInTheDocument();
  });

  test('shows empty state when no activities', async () => {
    mockFetchSuccess([]);
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Get started by creating your first task!')).toBeInTheDocument();
    expect(screen.getByText('+ Create First Task')).toBeInTheDocument();
  });

  test('creates new task when add button clicked', async () => {
    mockFetchSuccess(mockActivities);
    
    const newTask = {
      id: 3,
      task_name: 'New Task',
      status: 'Not Started',
      priority: 'Medium'
    };
    
    // Mock successful creation
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockActivities)
    }).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(newTask)
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('+ Add New Task')).toBeInTheDocument();
    });
    
    const addButton = screen.getByText('+ Add New Task');
    fireEvent.click(addButton);
    
    // Should call API to create task
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/activities',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
  });

  test('opens edit dialog when edit button clicked', async () => {
    mockFetchSuccess(mockActivities);
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
    });
    
    const editButton = screen.getByTestId('edit-1');
    fireEvent.click(editButton);
    
    // Should open edit dialog
    await waitFor(() => {
      expect(screen.getByText('✏️ Edit Task')).toBeInTheDocument();
    });
    
    expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
  });

  test('duplicates task when duplicate button clicked', async () => {
    mockFetchSuccess(mockActivities);
    
    const duplicatedTask = {
      id: 3,
      task_name: 'Test Task 1 (Copy)',
      status: 'Not Started'
    };
    
    // Mock successful duplication
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockActivities)
    }).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(duplicatedTask)
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('duplicate-1')).toBeInTheDocument();
    });
    
    const duplicateButton = screen.getByTestId('duplicate-1');
    fireEvent.click(duplicateButton);
    
    // Should call API to create duplicated task
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/activities',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });
  });

  test('deletes task when delete button clicked with confirmation', async () => {
    mockFetchSuccess(mockActivities);
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    // Mock successful deletion
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockActivities)
    }).mockResolvedValueOnce({
      ok: true,
      status: 200
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByTestId('delete-1');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    
    // Should call API to delete task
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/activities/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  test('shows error banner when API errors occur', async () => {
    mockFetchSuccess(mockActivities);
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
    
    // Mock failed update
    fetch.mockRejectedValueOnce(new Error('Update failed'));
    
    // Simulate an update that will fail
    const editButton = screen.getByTestId('edit-1');
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByText('✏️ Edit Task')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Should show error banner
    await waitFor(() => {
      expect(screen.getByText(/Failed to save task/)).toBeInTheDocument();
    });
  });

  test('handles edit dialog save and cancel', async () => {
    mockFetchSuccess(mockActivities);
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
    });
    
    // Open edit dialog
    const editButton = screen.getByTestId('edit-1');
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByText('✏️ Edit Task')).toBeInTheDocument();
    });
    
    // Test cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText('✏️ Edit Task')).not.toBeInTheDocument();
    
    // Open again and test save
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByText('✏️ Edit Task')).toBeInTheDocument();
    });
    
    // Mock successful save
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockActivities[0])
    });
    
    const taskNameInput = screen.getByDisplayValue('Test Task 1');
    await userEvent.clear(taskNameInput);
    await userEvent.type(taskNameInput, 'Updated Task Name');
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    // Should call API and close dialog
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/activities/1',
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });
  });

  test('clears error banner when close button clicked', async () => {
    mockFetchError('Test error');
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test error/)).toBeInTheDocument();
    });
    
    // Reset fetch for subsequent calls
    mockFetchSuccess([]);
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText(/Test error/)).not.toBeInTheDocument();
  });

  test('shows processing indicator during operations', async () => {
    mockFetchSuccess(mockActivities);
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('+ Add New Task')).toBeInTheDocument();
    });
    
    // Mock slow response
    fetch.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 3, task_name: 'New Task' })
        }), 100)
      )
    );
    
    const addButton = screen.getByText('+ Add New Task');
    fireEvent.click(addButton);
    
    // Should show processing indicator
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });
});

describe('TaskGrid Integration Features', () => {
  test('persists grid state to localStorage', async () => {
    const mockOnFilterChanged = jest.fn();
    
    render(
      <TaskGrid
        activities={mockActivities}
        updateTask={jest.fn()}
        deleteTask={jest.fn()}
        onTaskEdit={jest.fn()}
        onTaskDuplicate={jest.fn()}
      />
    );
    
    // Simulate filter change
    const quickFilter = screen.getByTestId('quick-filter');
    fireEvent.change(quickFilter, { target: { value: 'test' } });
    
    // Should eventually call localStorage.setItem
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  test('handles grid statistics display', () => {
    render(
      <TaskGrid
        activities={mockActivities}
        updateTask={jest.fn()}
        deleteTask={jest.fn()}
        onTaskEdit={jest.fn()}
        onTaskDuplicate={jest.fn()}
      />
    );
    
    expect(screen.getByText('📊 2 tasks total')).toBeInTheDocument();
  });

  test('renders empty grid when no activities', () => {
    render(
      <TaskGrid
        activities={[]}
        updateTask={jest.fn()}
        deleteTask={jest.fn()}
        onTaskEdit={jest.fn()}
        onTaskDuplicate={jest.fn()}
      />
    );
    
    expect(screen.getByText('📊 0 tasks total')).toBeInTheDocument();
  });
});