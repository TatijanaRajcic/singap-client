import React, { Component } from "react";
import ReactMapboxGl, { Layer, Feature } from "react-mapbox-gl";
import Autocomplete from "../components/LocationAutoComplete";
import "../styles/Home.css";
import apiHandler from "../api/apiHandler";

const myMarker = new Image(40, 20); // Image constructor
myMarker.src = "images/house.png";

const Map = ReactMapboxGl({
  accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
});

export default class Home extends Component {
  state = {
    searchedAddress: null,
    allPlaces: [],
    searchDone: false,
    showDetails: false,
  };

  mapCenter = [103.851959, 1.29027];

  componentDidMount() {
    apiHandler
      .getHouses()
      .then((res) => {
        this.setState({ allPlaces: res });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  handlePlace = (searchedAddress) => {
    let searchedAddressCoordinates = [
      Number(searchedAddress.LONGITUDE),
      Number(searchedAddress.LATITUDE),
    ];
    let placesInDb = this.state.allPlaces.filter((onePlace) => {
      return this.arraysEqual(onePlace.coordinates, searchedAddressCoordinates);
    });
    if (placesInDb.length > 0) {
      this.setState({ searchedAddress, searchDone: true, showDetails: true });
    } else {
      this.setState({
        searchedAddress: "",
        searchDone: true,
        showDetails: false,
      });
    }
  };

  render() {
    let housesAtSearchedAddress =
      this.state.searchedAddress &&
      this.state.allPlaces.filter((onePlace) => {
        return onePlace.fullAddress === this.state.searchedAddress.ADDRESS;
      });

    return (
      <div className="Home">
        <Map
          style="mapbox://styles/mapbox/streets-v8"
          containerStyle={{
            height: "100vh",
            width: "70vw",
          }}
          center={this.mapCenter}
        >
          <Layer
            type="symbol"
            id="marker"
            images={["my-marker", myMarker]}
            layout={{ "icon-image": "my-marker" }} // custom marker
          >
            {this.state.searchedAddress && (
              <Feature
                coordinates={[
                  Number(this.state.searchedAddress.LONGITUDE),
                  Number(this.state.searchedAddress.LATITUDE),
                ]}
              />
            )}
          </Layer>
        </Map>
        <div className="map-result">
          <Autocomplete
            searchType=""
            onSelect={this.handlePlace}
            mapCenter={this.mapCenter}
          />
          <div>
            {this.state.searchDone && this.state.showDetails && (
              <React.Fragment>
                <h1>This address is registered on our website.</h1>
                <h2>Here are all the houses registered at this address:</h2>
                {housesAtSearchedAddress &&
                  housesAtSearchedAddress.map((onePlace, index) => (
                    <p key={index}>{onePlace.unitNumbers}</p>
                  ))}
              </React.Fragment>
            )}
            {this.state.searchDone && !this.state.showDetails && (
              <h1>This address is not registered on our website.</h1>
            )}
          </div>
        </div>
      </div>
    );
  }
}
