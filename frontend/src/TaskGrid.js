import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './TaskGrid.css';

// Custom cell renderers
const StatusRenderer = (params) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Not Started': return 'status-not-started';
      case 'In Progress': return 'status-in-progress';
      case 'Completed': return 'status-completed';
      case 'On Hold': return 'status-on-hold';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-not-started';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(params.value)}`}>
      {params.value || 'Not Started'}
    </span>
  );
};

const PriorityRenderer = (params) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Low': return 'priority-low';
      case 'Medium': return 'priority-medium';
      case 'High': return 'priority-high';
      case 'Critical': return 'priority-critical';
      default: return 'priority-medium';
    }
  };

  return (
    <span className={`priority-badge ${getPriorityClass(params.value)}`}>
      {params.value || 'Medium'}
    </span>
  );
};

const ProgressRenderer = (params) => {
  const progress = params.value || 0;
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="progress-text">{progress}%</span>
    </div>
  );
};

const ActionsRenderer = (params) => {
  const { onDelete, onEdit, onDuplicate } = params;
  
  return (
    <div className="action-buttons">
      <button 
        className="md-icon-button"
        onClick={() => onEdit(params.data)}
        title="Edit task"
        style={{ color: '#1976d2' }}
      >
        ✏️
      </button>
      <button 
        className="md-icon-button"
        onClick={() => onDuplicate(params.data)}
        title="Duplicate task"
        style={{ color: '#388e3c' }}
      >
        📋
      </button>
      <button 
        className="md-icon-button delete-button"
        onClick={() => onDelete(params.data.id)}
        title="Delete task"
      >
        🗑️
      </button>
    </div>
  );
};

// Custom progress editor
const ProgressEditor = React.forwardRef((props, ref) => {
  const [value, setValue] = useState(props.value || 0);

  const getValue = () => value;

  const handleChange = (e) => {
    setValue(parseInt(e.target.value));
  };

  return (
    <input
      ref={ref}
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={handleChange}
      className="progress-slider"
      style={{ width: '100%' }}
    />
  );
});

function TaskGrid({ 
  activities, 
  updateTask, 
  deleteTask, 
  onTaskEdit, 
  onTaskDuplicate,
  loading = false,
  error = null 
}) {
  const gridRef = useRef();
  const [quickFilter, setQuickFilter] = useState('');
  const [columnState, setColumnState] = useState(null);
  const [filterState, setFilterState] = useState(null);
  const [sortState, setSortState] = useState(null);

  // Save grid state to localStorage
  const saveGridState = useCallback(() => {
    if (gridRef.current) {
      const columnState = gridRef.current.api.getColumnState();
      const filterState = gridRef.current.api.getFilterModel();
      const sortState = gridRef.current.api.getSortModel();
      
      localStorage.setItem('taskGrid_columnState', JSON.stringify(columnState));
      localStorage.setItem('taskGrid_filterState', JSON.stringify(filterState));
      localStorage.setItem('taskGrid_sortState', JSON.stringify(sortState));
    }
  }, []);

  // Restore grid state from localStorage
  const restoreGridState = useCallback(() => {
    try {
      const savedColumnState = localStorage.getItem('taskGrid_columnState');
      const savedFilterState = localStorage.getItem('taskGrid_filterState');
      const savedSortState = localStorage.getItem('taskGrid_sortState');

      if (savedColumnState) setColumnState(JSON.parse(savedColumnState));
      if (savedFilterState) setFilterState(JSON.parse(savedFilterState));
      if (savedSortState) setSortState(JSON.parse(savedSortState));
    } catch (error) {
      console.warn('Error restoring grid state:', error);
    }
  }, []);

  // Load saved state on mount
  useEffect(() => {
    restoreGridState();
  }, [restoreGridState]);

  // Apply saved state when grid is ready
  const onGridReady = useCallback((params) => {
    if (columnState) params.api.applyColumnState({ state: columnState });
    if (filterState) params.api.setFilterModel(filterState);
    if (sortState) params.api.setSortModel(sortState);
  }, [columnState, filterState, sortState]);

  const columnDefs = useMemo(() => [
    { 
      headerName: 'Task Name', 
      field: 'task_name', 
      editable: true,
      flex: 2,
      minWidth: 200,
      cellClass: 'cell-task-name',
      headerTooltip: 'Click to edit task name'
    },
    {
      headerName: 'Status',
      field: 'status',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellRenderer: StatusRenderer,
      cellEditorParams: {
        values: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
      },
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled']
      },
      width: 150,
      headerTooltip: 'Task status'
    },
    {
      headerName: 'Priority',
      field: 'priority',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellRenderer: PriorityRenderer,
      cellEditorParams: { 
        values: ['Low', 'Medium', 'High', 'Critical'] 
      },
      filter: 'agSetColumnFilter',
      filterParams: {
        values: ['Low', 'Medium', 'High', 'Critical']
      },
      width: 120,
      headerTooltip: 'Task priority level'
    },
    { 
      headerName: 'Assignee', 
      field: 'assignee', 
      editable: true,
      filter: 'agTextColumnFilter',
      width: 150,
      headerTooltip: 'Person assigned to this task'
    },
    {
      headerName: 'Progress',
      field: 'progress',
      editable: true,
      cellEditor: ProgressEditor,
      cellRenderer: ProgressRenderer,
      filter: 'agNumberColumnFilter',
      width: 150,
      headerTooltip: 'Task completion percentage'
    },
    {
      headerName: 'Start Date',
      field: 'start_date',
      editable: true,
      cellEditor: 'agDateCellEditor',
      filter: 'agDateColumnFilter',
      width: 130,
      headerTooltip: 'Task start date'
    },
    {
      headerName: 'Due Date',
      field: 'due_date',
      editable: true,
      cellEditor: 'agDateCellEditor',
      filter: 'agDateColumnFilter',
      width: 130,
      headerTooltip: 'Task due date',
      cellStyle: (params) => {
        if (params.value) {
          const dueDate = new Date(params.value);
          const today = new Date();
          const diffTime = dueDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            return { backgroundColor: '#ffebee', color: '#c62828' }; // Overdue
          } else if (diffDays <= 3) {
            return { backgroundColor: '#fff3e0', color: '#ef6c00' }; // Due soon
          }
        }
        return null;
      }
    },
    {
      headerName: 'Estimated Hours',
      field: 'estimated_hours',
      editable: true,
      filter: 'agNumberColumnFilter',
      width: 140,
      headerTooltip: 'Estimated hours to complete'
    },
    {
      headerName: 'Actual Hours',
      field: 'actual_hours',
      editable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      headerTooltip: 'Actual hours spent'
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      editable: false,
      pinned: 'right',
      width: 120,
      cellRenderer: ActionsRenderer,
      cellRendererParams: {
        onDelete: deleteTask,
        onEdit: onTaskEdit,
        onDuplicate: onTaskDuplicate
      },
      headerTooltip: 'Task actions'
    },
  ], [deleteTask, onTaskEdit, onTaskDuplicate]);

  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
    resizable: true,
    editable: false,
    headerHeight: 50,
    rowHeight: 60
  }), []);

  const gridOptions = useMemo(() => ({
    animateRows: true,
    enableCellTextSelection: true,
    ensureDomOrder: true,
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [10, 20, 50, 100],
    rowSelection: 'multiple',
    suppressCellFocus: false,
    suppressRowClickSelection: true,
    enableRangeSelection: true,
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 20,
    stopEditingWhenCellsLoseFocus: true,
    enterMovesDown: true,
    enterMovesDownAfterEdit: true,
    suppressMenuHide: false,
    floatingFilter: true,
    sideBar: {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: true,
            suppressValues: true,
            suppressPivots: true,
            suppressPivotMode: true,
            suppressColumnFilter: false,
            suppressColumnSelectAll: false,
            suppressColumnExpandAll: false
          }
        },
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel'
        }
      ]
    }
  }), []);

  const onCellValueChanged = useCallback((params) => {
    if (params.oldValue !== params.newValue) {
      let value = params.newValue;
      
      // Type conversion based on field
      if (params.colDef.field === 'progress') {
        value = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
      } else if (params.colDef.field === 'estimated_hours' || params.colDef.field === 'actual_hours') {
        value = Math.max(0, parseFloat(value) || 0);
      }
      
      updateTask(params.data.id, params.colDef.field, value);
      
      // Save grid state after edit
      setTimeout(saveGridState, 100);
    }
  }, [updateTask, saveGridState]);

  const onFilterChanged = useCallback(() => {
    setTimeout(saveGridState, 100);
  }, [saveGridState]);

  const onSortChanged = useCallback(() => {
    setTimeout(saveGridState, 100);
  }, [saveGridState]);

  const onColumnMoved = useCallback(() => {
    setTimeout(saveGridState, 100);
  }, [saveGridState]);

  const onColumnResized = useCallback(() => {
    setTimeout(saveGridState, 100);
  }, [saveGridState]);

  const exportToCsv = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `tasks_${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  }, []);

  const resetFilters = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.setFilterModel(null);
      setQuickFilter('');
    }
  }, []);

  const autoSizeColumns = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.autoSizeAllColumns();
    }
  }, []);

  if (error) {
    return (
      <div className="grid-error">
        <div className="error-content">
          <h3>❌ Error Loading Tasks</h3>
          <p>{error}</p>
          <button className="md-outlined-button" onClick={() => window.location.reload()}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-grid-container">
      {/* Grid Controls */}
      <div className="grid-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Quick search..."
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            className="md-text-field search-input"
          />
        </div>
        
        <div className="grid-actions">
          <button 
            className="md-outlined-button"
            onClick={resetFilters}
            title="Clear all filters"
          >
            🔄 Reset
          </button>
          <button 
            className="md-outlined-button"
            onClick={autoSizeColumns}
            title="Auto-size columns"
          >
            📏 Fit
          </button>
          <button 
            className="md-outlined-button"
            onClick={exportToCsv}
            title="Export to CSV"
          >
            📊 Export
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="grid-loading-overlay">
          <div className="md-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      )}

      {/* AG Grid */}
      <div className="ag-theme-alpine task-grid" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={activities}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          onCellValueChanged={onCellValueChanged}
          onFilterChanged={onFilterChanged}
          onSortChanged={onSortChanged}
          onColumnMoved={onColumnMoved}
          onColumnResized={onColumnResized}
          onGridReady={onGridReady}
          quickFilterText={quickFilter}
          maintainColumnOrder={true}
          suppressContextMenu={false}
          allowContextMenuWithControlKey={true}
          enableBrowserTooltips={true}
        />
      </div>

      {/* Grid Stats */}
      <div className="grid-stats">
        <span>📊 {activities.length} tasks total</span>
        {quickFilter && <span>🔍 Filtered view</span>}
      </div>
    </div>
  );
}

export default TaskGrid;