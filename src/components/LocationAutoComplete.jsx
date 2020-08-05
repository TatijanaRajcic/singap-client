import React, { Component } from "react";
import "../styles/LocationAutoComplete.css";
import axios from "axios";

class LocationAutoComplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      results: [],
      isLoading: false,
    };
    this.handleSearchChange = this.handleSearchChange.bind(this);
  }

  handleSearchChange(e) {
    this.setState({
      search: e.target.value,
      isLoading: true,
    });

    // Stop the previous setTimeout if there is one in progress
    clearTimeout(this.timeoutId);

    // Launch a new request in 1000ms (1s) => Avoids excessive requests to the end point.
    this.timeoutId = setTimeout(() => {
      this.performSearch();
    }, 1000);
  }

  performSearch() {
    if (this.state.search === "") {
      this.setState({
        results: [],
        isLoading: false,
      });
      return;
    }

    axios
      .get(
        `https://developers.onemap.sg/commonapi/search?searchVal=${this.state.search}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
      )
      .then((response) => {
        console.log(response);
        this.setState({
          results: response.data.results,
          isLoading: false,
        });
      });
  }

  handleItemClicked(place) {
    this.setState({
      search: place.ADDRESS,
      results: [],
    });

    this.props.onSelect(place);
  }

  render() {
    return (
      <div className="LocationAutoComplete">
        <input
          className="input"
          type="text"
          value={this.state.search}
          onChange={this.handleSearchChange}
          placeholder="Enter an address in Singapore"
        />
        <ul className="LocationAutoComplete-results">
          {this.state.results.map((place) => (
            <li
              key={place.X}
              className="LocationAutoComplete-items"
              onClick={() => this.handleItemClicked(place)}
            >
              {place.ADDRESS}
            </li>
          ))}
          {this.state.isLoading && (
            <li className="LocationAutoComplete-items">Loading...</li>
          )}
        </ul>
      </div>
    );
  }
}

export default LocationAutoComplete;
