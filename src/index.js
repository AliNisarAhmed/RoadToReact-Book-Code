import React from "react";
import ReactDOM from "react-dom";
import axios from 'axios';
import styled, { injectGlobal } from 'styled-components';

import "./styles.css";

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = "20";  //Hits per page, results to show on a search

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search?';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = `page=`
const PARAM_HPP = 'hitsPerPage=';

// const CORS = 'https://cors-anywhere.herokuapp.com/'

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
      results: null,
      searchKey: '',  // Since searchTerm changes as the user types, we need searchKey, which is set equal to searchTerm as soon as the user 
                    // searches, this is done in the componentDidMount() and onSearchSubmit() methods
      searchTerm: DEFAULT_QUERY,
      error: null,
    };
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchStories(this.state.searchTerm);
  }

  render() {
    const { searchKey, results, searchTerm, error } = this.state;
    
    const page = ( 
      results && 
      results[searchKey] && 
      results[searchKey].page ) || 0;
    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

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
          error 
          ? <p>Somthing went wrong.</p>
          : 
            <Table
              list={list}
              onDismiss={this.onHandleDismiss}
            />
        }
        <div>
          <Button
            onClick={() => this.fetchSearchStories(searchKey, page + 1)}
            disabled={error}
          >
            More
              </Button>
        </div>
      </Page>
    );
  }

  setSearchTopStories = (result) => {
    const { hits, page } = result;
    const { searchKey, results } = this.state;
    const oldHits = results && results[searchKey]  // if old hits already exist in state, we use them, else we set up a new array
      ? results[searchKey].hits
      : [];

    const updatedHits = [
      ...oldHits,
      ...hits
    ];

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page }  // old results object is now combined with new searchKey, which stores { hits, page }
      }
    });
  }

  onHandleDismiss = (id) => {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const updatedHits = hits.filter(item => item.objectID !== id);
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page}
      }
    })
  }

  onSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  }

  fetchSearchStories = (searchTerm, page = 0) => {
    axios.get(`${PATH_BASE}${PATH_SEARCH}${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      // .then(response => response.json())   // no longer necessary with axios instead of fetch
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => this.setState({ error }));
  }

  onSearchSubmit = (e) => {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if (this.needsToSearchTopStores(searchTerm)) {  // we make the fetch call only when results are not already available inside the state
      this.fetchSearchStories(searchTerm);
    }

    e.preventDefault();
  }

  needsToSearchTopStores = (searchTerm) => {   // This method checks whether we already have search results for the 'searchTerm' in the state
    return !this.state.results[searchTerm];
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
