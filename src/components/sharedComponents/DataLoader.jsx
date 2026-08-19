import React from 'react';
import { Loader } from 'rsuite';

function DataLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Loader size="lg" />
    </div>
  );
}

export default DataLoader;