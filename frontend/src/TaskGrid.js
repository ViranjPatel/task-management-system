import React, { useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import './App.css';

const myTheme = themeQuartz.withParams({
  backgroundColor: '#1f2836',
  browserColorScheme: 'inherit',
  chromeBackgroundColor: {
    ref: 'foregroundColor',
    mix: 0.07,
    onto: 'backgroundColor',
  },
  foregroundColor: '#FFF',
  headerFontSize: 14,
  fontFamily: [
    { googleFont: 'Inter' },
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen-Sans',
    'Ubuntu',
    'Cantarell',
    'Helvetica Neue',
    'sans-serif',
  ],
});

function TaskGrid({ activities, onCellUpdate, deleteTask }) {
  const gridRef = useRef();
  const [quickFilter, setQuickFilter] = useState('');

  const columnDefs = useMemo(
    () => [
      { headerName: 'Task Name', field: 'task_name', editable: true },
      {
        headerName: 'Status',
        field: 'status',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
        },
      },
      {
        headerName: 'Priority',
        field: 'priority',
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: ['Low', 'Medium', 'High', 'Critical'] },
      },
      { headerName: 'Assignee', field: 'assignee', editable: true },
      {
        headerName: 'Progress',
        field: 'progress',
        editable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => `${params.value || 0}%`,
      },
      {
        headerName: 'Actions',
        field: 'actions',
        sortable: false,
        filter: false,
        editable: false,
        width: 100,
        cellRendererFramework: (params) => (
          <button className="btn-delete" onClick={() => deleteTask(params.data.id)}>
            🗑️
          </button>
        ),
      },
    ],
    [deleteTask]
  );

  const defaultColDef = useMemo(
    () => ({ flex: 1, minWidth: 120, sortable: true, filter: true, resizable: true }),
    []
  );

  const onCellValueChanged = (params) => {
    if (params.oldValue !== params.newValue) {
      const value = params.colDef.field === 'progress' ? parseInt(params.newValue, 10) : params.newValue;
      onCellUpdate(params.data.id, params.colDef.field, value);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search..."
          value={quickFilter}
          onChange={(e) => setQuickFilter(e.target.value)}
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>
      <div style={{ height: 500, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={activities}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme={myTheme}
          pagination={true}
          paginationPageSize={10}
          onCellValueChanged={onCellValueChanged}
          quickFilterText={quickFilter}
        />
      </div>
    </div>
  );
}

export default TaskGrid;
