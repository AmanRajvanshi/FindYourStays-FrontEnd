import React from 'react';
import Button from '../ui/Button';

function NoDataFound(props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginLeft: '250px',
      }}
    >
      <h4>{props.message}</h4>
      {props.showButton && (
        <Button  appearance="primary" className="mt-3" onClick={props.handleClick}>
          Add {props.name}
        </Button>
      )}
    </div>
  );
}

export default NoDataFound;
