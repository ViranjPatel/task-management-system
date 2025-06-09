import React, { useState, forwardRef, useImperativeHandle } from 'react';

export const ProgressRenderer = ({ value }) => {
  const progress = value || 0;
  return (
    <div className="progress-container">
      <div style={{ flex: 1, background: 'var(--md-sys-color-outline-variant)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--md-sys-color-primary)' }} />
      </div>
      <span className="progress-text">{progress}%</span>
    </div>
  );
};

export const ProgressEditor = forwardRef((props, ref) => {
  const [value, setValue] = useState(props.value ?? 0);

  useImperativeHandle(ref, () => ({
    getValue: () => parseInt(value, 10)
  }));

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const stop = () => props.stopEditing();

  return (
    <div className="progress-container">
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={handleChange}
        onMouseUp={stop}
        onTouchEnd={stop}
        className="progress-slider"
        style={{ '--progress': `${value}%` }}
      />
      <span className="progress-text">{value}%</span>
    </div>
  );
});

