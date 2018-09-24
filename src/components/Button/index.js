import React from 'react';
import styled from 'styled-components';


const StyledButton = styled.button`
  border-width: 0;
  background: #eee;
  color: inherit;
  text-align: inherit;
  cursor: pointer;
  padding: 5px 8px;
  &:hover {
    background-color: #ccc;
  }
`;

const Button = ({ onClick, className = '', children, }) => (
  <StyledButton
    onClick={onClick}
    className={className}
    type="button"
  >
    {children}
  </StyledButton>
);

export default Button;