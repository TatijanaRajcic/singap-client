import React, { Component } from "react";
import ReactMapboxGl, { MapContext, Layer, Feature } from "react-mapbox-gl";
import Autocomplete from "../components/LocationAutoComplete";
import "../styles/Home.css";
import apiHandler from "../api/apiHandler";
import { booleanPointInPolygon } from "@turf/turf";

const myMarker = new Image(40, 20); // Image constructor
myMarker.src = "images/house.png";

const Map = ReactMapboxGl({
  accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
});

const paintLayer = {
  "fill-extrusion-color": "#aaa",
  "fill-extrusion-height": [
    "interpolate",
    ["linear"],
    ["zoom"],
    15,
    0,
    15.05,
    ["get", "height"],
  ],
  "fill-extrusion-base": [
    "interpolate",
    ["linear"],
    ["zoom"],
    15,
    0,
    15.05,
    ["get", "min_height"],
  ],
  "fill-extrusion-opacity": 0.6,
};

export default class Home extends Component {
  state = {
    searchedAddress: null,
    allPlaces: [],
    searchDone: false,
    showDetails: false,
    allBuildingsOnMap: null,
    map: null,
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

    // look for all the places at the searched address
    let placesInDb = this.state.allPlaces.filter((onePlace) => {
      return this.arraysEqual(onePlace.coordinates, searchedAddressCoordinates);
    });

    // center the map on the given address + display building in another color if present in DB
    this.showDetails(searchedAddressCoordinates);

    // show different text according to presence in DB
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

  showDetails = (searchedAddressCoordinates) => {
    let point = [searchedAddressCoordinates[0], searchedAddressCoordinates[1]];

    this.state.allBuildingsOnMap.forEach((polygone, i) => {
      if (booleanPointInPolygon(point, polygone.geometry)) {
        console.log("this is the feature of the searched place", polygone.id);
        this.selectFeatures(polygone.id);
      }
    });
  };

  selectFeatures = (id) => {
    // map.setFeatureState(
    //   { source: "composite", sourceLayer: "building", id },
    //   { highlight: "true" }
    // );
    // map.setLight({
    //   color: "hsl(0, 100%, 50%)",
    // });
  };

  getBuildings = (map) => {
    if (!map.loaded()) {
      return;
    }

    const all_features = map.queryRenderedFeatures({
      layers: ["3d-buildings"],
      // ,filter: ["==", "id", clicked.properties.parent]
    });

    if (!this.state.allBuildingsOnMap && all_features.length > 0) {
      this.setState({ allBuildingsOnMap: all_features });
    }

    map.off("render", this.getBuildings); // remove this handler now that we're done.
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
          style="mapbox://styles/examples/cj68bstx01a3r2rndlud0pwpv"
          containerStyle={{
            height: "100vh",
            width: "70vw",
          }}
          center={this.mapCenter}
          zoom={[15]}
          pitch={[60]}
          bearing={[-60]}
          onRender={this.getBuildings}
        >
          <Layer
            id="3d-buildings"
            sourceId="composite"
            sourceLayer="building"
            filter={["==", "extrude", "true"]}
            type="fill-extrusion"
            minZoom={14}
            paint={paintLayer}
          />
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

// {this.state.searchedAddress && (
//   <Feature
//     coordinates={[
//       Number(this.state.searchedAddress.LONGITUDE),
//       Number(this.state.searchedAddress.LATITUDE),
//     ]}
//   />
// )}
