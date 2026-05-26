import { useEffect, useState } from 'react';
import Editor from 'react-simple-wysiwyg';

export default function QuillEditorWrapper({ height = 300, value, onChange }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (value) {
      setHtml(value);
    }
  }, [value]);

  const handleChange = (e) => {
    setHtml(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div
      style={{
        height: `${height}px`,
        backgroundColor: '#fff',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <Editor
        value={html}
        onChange={handleChange}
        style={{
          height: '98%',
          minHeight: '30px',
          boxSizing: 'border-box',
          width: '100%',
          resize: 'none',
          border: 'none',
          outline: 'none',
          fontSize: '1rem',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}
