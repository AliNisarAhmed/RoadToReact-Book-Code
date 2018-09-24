import React from 'react';
import styled from 'styled-components';

import Button from '../Button'


const StyledSpan = styled.span`
  color: #232323;
  font-size: 14px;
  margin-right: 10px;

  & a {
    color: #232323;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledTable = styled.div`
  margin: 20px 0;
`;

const TableRow = styled.div`
  border: 1px solid #e3e3e3;
  display: flex;
  line-height: 24px;
  white-space: nowrap;
  padding: 10px;
  margin: 10px 0;
  background: #fff;
`;

const Table = ({ list, onDismiss }) => {
  // if (!list) return null;
  return (
    <StyledTable>
      {
        list.map(item =>
          <TableRow key={item.objectID}>
            <StyledSpan>
              <a href={item.url}>{item.title}:</a>
            </StyledSpan>
            <StyledSpan>Author: {item.author}</StyledSpan>
            <StyledSpan>Comments: {item.num_comments}</StyledSpan>
            <StyledSpan>Points: {item.points}</StyledSpan>
            <StyledSpan>
              <Button
                onClick={() => onDismiss(item.objectID)}
              >
                Dismiss
                </Button>
            </StyledSpan>
          </TableRow>
        )
      }
    </StyledTable>
  );
};

export default Table;