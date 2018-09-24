import React from "react";
import axios from 'axios';
import styled, { injectGlobal } from 'styled-components';

import Button from '../Button';
import Table from '../Table';
import Search from '../Search';

import {
  DEFAULT_QUERY,
  DEFAULT_HPP,
  PATH_BASE,
  PATH_SEARCH,
  PARAM_SEARCH,
  PARAM_PAGE,
  PARAM_HPP
} from '../../constants';

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
  _isMounted = false;

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
    this._isMounted = true;

    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchStories(this.state.searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { searchKey, results, searchTerm, error } = this.state;

    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page) || 0;
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
        [searchKey]: { hits: updatedHits, page }
      }
    })
  }

  onSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  }

  fetchSearchStories = (searchTerm, page = 0) => {
    axios.get(`${PATH_BASE}${PATH_SEARCH}${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      // .then(response => response.json())   // no longer necessary with axios instead of fetch
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }));
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

export default App;