import React from 'react';
import Button from '../ui/Button';

function NoDataFound(props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-muted">
      <div className="text-center">
        <h4>{props.message}</h4>
        {props.showButton && (
          <Button
            appearance="primary"
            className="mt-4"
            onClick={props.handleClick}
          >
            Add {props.name}
          </Button>
        )}
      </div>
    </div>
  );
}

export default NoDataFound;