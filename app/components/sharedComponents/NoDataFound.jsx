import React from 'react';

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
        <button className="btn btn-thm mt-3" onClick={props.handleClick}>
          Add {props.name}
        </button>
      )}
    </div>
  );
}

export default NoDataFound;
