import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock fetch API
global.fetch = jest.fn();

// Mock console methods to reduce test noise
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  fetch.mockClear();
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Mock successful API responses
const mockActivities = [
  {
    id: 1,
    task_name: 'Test Task',
    status: 'In Progress',
    priority: 'High',
    assignee: 'John Doe',
    progress: 50
  },
  {
    id: 2,
    task_name: 'Another Task',
    status: 'Not Started',
    priority: 'Medium',
    assignee: 'Jane Smith',
    progress: 0
  }
];

const mockFetchSuccess = (data) => {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data)
  });
};

const mockFetchError = (status = 500, message = 'Server Error') => {
  fetch.mockRejectedValue(new Error(message));
};

describe('App Component', () => {
  test('renders loading state initially', () => {
    mockFetchSuccess(mockActivities);
    render(<App />);
    expect(screen.getByText('Loading activities...')).toBeInTheDocument();
  });

  test('renders activities after successful load', async () => {
    mockFetchSuccess(mockActivities);
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Task Management System')).toBeInTheDocument();
    });
    
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Another Task')).toBeInTheDocument();
  });

  test('renders error state when API fails', async () => {
    mockFetchError();
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Connection Error/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Failed to connect to backend/i)).toBeInTheDocument();
  });

  test('updates task name locally while typing', async () => {
    mockFetchSuccess(mockActivities);
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
    
    const taskInput = screen.getByDisplayValue('Test Task');
    
    // Type in the input
    await userEvent.clear(taskInput);
    await userEvent.type(taskInput, 'Updated Task Name');
    
    // Should update locally immediately
    expect(screen.getByDisplayValue('Updated Task Name')).toBeInTheDocument();
  });

  test('syncs changes to backend on blur', async () => {
    mockFetchSuccess(mockActivities);
    
    // Mock successful update
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockActivities)
    }).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ...mockActivities[0], task_name: 'Updated Task' })
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
    
    const taskInput = screen.getByDisplayValue('Test Task');
    
    // Update and blur
    await userEvent.clear(taskInput);
    await userEvent.type(taskInput, 'Updated Task');
    fireEvent.blur(taskInput);
    
    // Should call API to update
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/activities/1',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Updated Task')
        })
      );
    });
  });

  test('shows sync indicator when updating', async () => {
    mockFetchSuccess(mockActivities);
    
    // Mock delayed update response
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockActivities)
    }).mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({})
        }), 100)
      )
    );
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
    
    const statusSelect = screen.getAllByDisplayValue('In Progress')[0];
    
    // Change status
    fireEvent.change(statusSelect, { target: { value: 'Completed' } });
    
    // Should show syncing indicator
    await waitFor(() => {
      expect(screen.getByText(/Syncing/)).toBeInTheDocument();
    });
  });

  test('handles update errors gracefully', async () => {
    mockFetchSuccess(mockActivities);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
    
    // Mock failed update
    fetch.mockRejectedValueOnce(new Error('Update failed'));
    
    const taskInput = screen.getByDisplayValue('Test Task');
    
    // Update and blur
    await userEvent.clear(taskInput);
    await userEvent.type(taskInput, 'This will fail');
    fireEvent.blur(taskInput);
    
    // Should show retry button
    await waitFor(() => {
      expect(screen.getByText(/Retry/)).toBeInTheDocument();
    });
  });

  test('retries failed sync when retry button clicked', async () => {
    mockFetchSuccess(mockActivities);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
    
    // Mock failed update followed by successful retry
    fetch.mockRejectedValueOnce(new Error('Update failed'))
         .mockResolvedValueOnce({
           ok: true,
           status: 200,
           json: () => Promise.resolve({})
         });
    
    const taskInput = screen.getByDisplayValue('Test Task');
    fireEvent.blur(taskInput);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Retry/)).toBeInTheDocument();
    });
    
    // Click retry
    const retryButton = screen.getByText(/Retry/);
    fireEvent.click(retryButton);
    
    // Should retry the API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3); // Initial load + failed update + retry
    });
  });

  test('adds new task when button clicked', async () => {
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

  test('deletes task when delete button clicked', async () => {
    mockFetchSuccess(mockActivities);
    
    // Mock successful deletion
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockActivities)
    }).mockResolvedValueOnce({
      ok: true,
      status: 200
    });
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getAllByTitle('Delete task')).toHaveLength(2);
    });
    
    const deleteButton = screen.getAllByTitle('Delete task')[0];
    fireEvent.click(deleteButton);
    
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

  test('updates progress with range slider', async () => {
    mockFetchSuccess(mockActivities);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
    
    const progressSlider = screen.getAllByRole('slider')[0];
    
    // Change progress value
    fireEvent.change(progressSlider, { target: { value: '75' } });
    
    // Should update locally
    expect(progressSlider.value).toBe('75');
    
    // Mock successful update for mouseup
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({})
    });
    
    // Trigger mouseup to sync
    fireEvent.mouseUp(progressSlider);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/activities/1',
        expect.objectContaining({
          method: 'PUT'
        })
      );
    });
  });

  test('debounces input changes', async () => {
    jest.useFakeTimers();
    
    mockFetchSuccess(mockActivities);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
    
    const taskInput = screen.getByDisplayValue('Test Task');
    
    // Mock update API
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({})
    });
    
    // Type rapidly
    await userEvent.clear(taskInput);
    await userEvent.type(taskInput, 'A');
    await userEvent.type(taskInput, 'B');
    await userEvent.type(taskInput, 'C');
    
    // Fast forward past debounce delay
    jest.advanceTimersByTime(2100);
    
    await waitFor(() => {
      // Should only call API once due to debouncing
      expect(fetch).toHaveBeenCalledTimes(2); // Initial load + one debounced update
    });
    
    jest.useRealTimers();
  });

  test('cancels debounce timer on blur', async () => {
    jest.useFakeTimers();
    
    mockFetchSuccess(mockActivities);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    });
    
    const taskInput = screen.getByDisplayValue('Test Task');
    
    // Mock update API
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({})
    });
    
    // Type and blur before debounce
    await userEvent.clear(taskInput);
    await userEvent.type(taskInput, 'Quick Update');
    
    // Advance time slightly but not past debounce
    jest.advanceTimersByTime(1000);
    
    // Blur should trigger immediate update
    fireEvent.blur(taskInput);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2); // Initial load + blur update
    });
    
    // Advance past debounce time - should not trigger another call
    jest.advanceTimersByTime(2000);
    
    expect(fetch).toHaveBeenCalledTimes(2); // Still just 2 calls
    
    jest.useRealTimers();
  });
});