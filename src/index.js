import React from "react";
import ReactDOM from "react-dom";
import styled, { injectGlobal } from 'styled-components';

import "./styles.css";

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = "20";

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search?';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = `page=`
const PARAM_HPP = 'hitsPerPage=';

const CORS = 'https://cors-anywhere.herokuapp.com/'

const url = `${PATH_BASE}${PATH_SEARCH}${PARAM_SEARCH}${DEFAULT_QUERY}`;

// const isSearched = searchTerm => item => item.title.toLowerCase().includes(searchTerm.toLowerCase());

injectGlobal`
  body {
    color: #222;
    background: #f4f4f4;
    font: 400 14px CoreSans, Arial, sans-serif;
  }

  a {
    color: #222;
  }

  a:hover {
    text-decoration: underline;
  }

  ul, li {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  input {
    padding: 10px;
    border-radius: 5px;
    outline: none;
    margin-right: 10px;
    border: 1px solid #ddd;
  }

  button {
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
    background: transparent;
    color: #808080;
    cursor: pointer;

    &:hover {
      color: #222;
    }
  }

  *:focus {
    outline: none;
  }
`;

const Page = styled.div`
  margin: 20px;
`;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      searchTerm: '',
    };
  }

  componentDidMount() {
    this.fetchSearchStories(this.state.searchTerm);
  }

  render() {
    const { result, searchTerm } = this.state;
    const page = (result && result.page) || 0;
    if(!result) return null;
    console.log(result);
    return (
      <Page>
        <Search 
          onChange={this.onSearchChange} 
          value={this.state.searchTerm}
          onSubmit={this.onSearchSubmit}
        >
          <span>Search</span>
        </Search>
        {
          result &&
          <Table
            list={result.hits}
            onDismiss={this.onHandleDismiss}
          /> 
        }
        <div>
          <Button
            onClick={() => this.fetchSearchStories(searchTerm, page + 1)}
          >
            More
          </Button>
        </div>
    </Page>
    );
  }

  setSearchTopStories = (result) => {
    const { hits, page } = result;
    const oldHits = page === 0
      ? []
      : this.state.result.hits;

    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({ result: { hits: updatedHits, page} });
  }

  onHandleDismiss = (id) => {
    const updatedHits = this.state.result.hits.filter(item => item.objectID !== id);
    this.setState(() => ({result: { ...this.state.result, hits: updatedHits }}));
  }

  onSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  }

  fetchSearchStories = (searchTerm, page = 0) => {
    fetch(`${PATH_BASE}${PATH_SEARCH}${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => error);
  }

  onSearchSubmit = (e) => {
    const { searctTerm } = this.state;
    this.fetchSearchStories(searctTerm);
    e.preventDefault();
  } 
}


const Search = ({ value, onChange, children, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <input
      type="text"
      value={value}
      onChange={onChange}
    />
    <button type="submit">
      {children}    
    </button>
  </form>
);

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

const Button = ({ onClick, className = '', children,}) => (
    <StyledButton
      onClick={onClick}
      className={className}
      type="button"
    >
      {children}
    </StyledButton>
  );

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
