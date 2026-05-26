import React from 'react';
import { Loader } from 'rsuite';

function DataLoader() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '250px',
      }}
    >
      <Loader />
    </div>
  );
}

export default DataLoader;
