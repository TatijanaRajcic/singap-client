import React, { Component } from "react";
import ReactMapboxGl, { MapContext, Layer, Feature } from "react-mapbox-gl";
import { Link } from "react-router-dom";
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
    map: null,
    mapCenter: [103.851959, 1.29027],
    zoom: 15,
  };

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
    // method to initiate the new layer for highlighted buildings
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
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "white",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            15.05,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14,
            0,
            15.05,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 1,
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

    let center = {
      lon: parseFloat(searchedAddress.LONGITUDE),
      lat: parseFloat(searchedAddress.LATITUDE),
    };

    this.setState({ mapCenter: [center.lon, center.lat], zoom: 18.5 });

    map.on("moveend", (e) => {
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
        <div className="title-container">
          <h1>Welcome to RS.com</h1>
        </div>
        <div className="flex">
          <Map
            style="mapbox://styles/examples/cj68bstx01a3r2rndlud0pwpv"
            containerStyle={{
              height: "60vh",
              width: "70vw",
              marginLeft: "20px"
            }}
            center={this.state.mapCenter}
            zoom={[this.state.zoom]}
            pitch={[60]}
            bearing={[-60]}
            onStyleLoad={this.initiateMap}
          >
            <MapContext.Consumer>
              {(map) => {
                return (
                  <React.Fragment>
                    <Autocomplete
                      searchType=""
                      onSelect={this.handlePlace}
                      onHighlight={(place) =>
                        this.highlightBuilding(place, map)
                      }
                    />
                    <Layer
                      id="3d-buildings"
                      sourceId="composite"
                      sourceLayer="building"
                      filter={["==", "extrude", "true"]}
                      type="fill-extrusion"
                      minZoom={14}
                      paint={paintLayer}
                    />
                  </React.Fragment>
                );
              }}
            </MapContext.Consumer>
          </Map>
          <div className="map-result">
            {!this.state.searchDone && <h2>No search has been made yet.</h2>}
            {this.state.searchDone && this.state.showDetails && (
              <React.Fragment>
                <h2>This address is registered on our website.</h2>
                <h3>Here are all the houses registered at this address:</h3>
                {housesAtSearchedAddress &&
                  housesAtSearchedAddress.map((onePlace, index) => (
                    <p key={index}>
                      <Link className="link" to={`/houses/${onePlace._id}`}>
                        House {index + 1}{" "}
                      </Link>
                      :{" "}
                      {onePlace.unitNumbers
                        ? onePlace.unitNumbers
                        : "Unit Numbers Not Applicable"}
                    </p>
                  ))}
              </React.Fragment>
            )}
            {this.state.searchDone && !this.state.showDetails && (
              <h2>This address is not registered on our website.</h2>
            )}
          </div>
        </div>
      </div>
    );
  }
}
