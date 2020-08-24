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

let flying = false;

export default class Home extends Component {
  state = {
    searchedAddress: null,
    allPlaces: [],
    searchDone: false,
    showDetails: false,
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
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  initiateMap = (map) => {
    let layers = map.getStyle().layers;
    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    map.addSource("currentBuildings", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    map.addLayer(
      {
        id: "highlight",
        source: "currentBuildings",
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#f0f",
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
        },
      },
      labelLayerId
    );
  };

  handlePlace = (searchedAddress) => {
    let searchedAddressCoordinates = [
      Number(searchedAddress.LONGITUDE),
      Number(searchedAddress.LATITUDE),
    ];

    // look for all the places at the searched address
    let placesInDb = this.state.allPlaces.filter((onePlace) => {
      return this.arraysEqual(onePlace.coordinates, searchedAddressCoordinates);
    });

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

  getBuildings = (map, callback) => {
    const all_features = map.queryRenderedFeatures({
      layers: ["3d-buildings"],
    });
    if (callback) callback(all_features);
  };

  highlightBuilding = (searchedAddress, map) => {
    let point = [
      Number(searchedAddress.LONGITUDE),
      Number(searchedAddress.LATITUDE),
    ];

    map.flyTo({
      center: point,
      zoom: 19,
      speed: 0.7,
      curve: 1,
      easing(t) {
        return t;
      },
    });

    map.once("moveend", () => {
      this.getBuildings(map, (allFeatures) => {
        allFeatures.forEach((polygone) => {
          if (booleanPointInPolygon(point, polygone.geometry)) {
            this.selectFeatures(polygone, map);
          }
        });
      });
    });
  };

  selectFeatures = (polygone, map) => {
    map.getSource("currentBuildings").setData({
      type: "FeatureCollection",
      features: [polygone],
    });
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
          onStyleLoad={this.initiateMap}
        >
          <MapContext.Consumer>
            {(map) => {
              return (
                <React.Fragment>
                  <Layer
                    id="3d-buildings"
                    sourceId="composite"
                    sourceLayer="building"
                    filter={["==", "extrude", "true"]}
                    type="fill-extrusion"
                    minZoom={14}
                    paint={paintLayer}
                  />
                  <Autocomplete
                    searchType=""
                    onSelect={this.handlePlace}
                    onHighlight={(place) => this.highlightBuilding(place, map)}
                    mapCenter={this.mapCenter}
                  />
                </React.Fragment>
              );
            }}
          </MapContext.Consumer>
        </Map>
        <div className="map-result">
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
