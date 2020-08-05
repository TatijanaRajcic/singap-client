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
    searchedPlace: null,
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

  handlePlace = (searchedPlace) => {
    let placeInDb = this.state.allPlaces.find((onePlace) => {
      return this.arraysEqual(
        onePlace.location.coordinates,
        searchedPlace.geometry.coordinates
      );
    });
    console.log(searchedPlace);
    if (placeInDb) {
      this.setState({ searchedPlace, searchDone: true, showDetails: true });
    } else {
      this.setState({
        searchedPlace: "",
        searchDone: true,
        showDetails: false,
      });
    }
  };

  render() {
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
          {/* <Layer
            type="symbol"
            id="marker"
            images={["my-marker", myMarker]}
            layout={{ "icon-image": "my-marker" }} // custom marker
          >
            {this.state.allPlaces.map((onePlace, index) => {
              return (
                <Feature
                  key={index}
                  coordinates={onePlace.location.coordinates}
                />
              );
            })}
          </Layer> */}

          <Layer
            type="symbol"
            id="marker"
            images={["my-marker", myMarker]}
            layout={{ "icon-image": "my-marker" }} // custom marker
          >
            {this.state.searchedPlace && (
              <Feature
                coordinates={this.state.searchedPlace.geometry.coordinates}
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
              <h1>This home is registered on our website.</h1>
            )}
            {this.state.searchDone && !this.state.showDetails && (
              <h1>This home is not registered on our website.</h1>
            )}
          </div>
        </div>
      </div>
    );
  }
}
