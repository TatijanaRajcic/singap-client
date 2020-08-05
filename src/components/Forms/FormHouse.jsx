import React, { Component } from "react";
import LocationAutoComplete from "../LocationAutoComplete";
import { Link } from "react-router-dom";
import "../../styles/form.css";
import apiHandler from "../../api/apiHandler";

class HouseForm extends Component {
  state = {
    fullAddress: "",
    blocNumber: "",
    textAddress: "",
    building: "",
    category: "",
    coordinates: [],
    alreadyExist: false,
    houseId: "",
  };

  mapCenter = [103.851959, 1.29027];

  handleChange = (event) => {
    if (event.target.name) {
      const key = event.target.name;
      this.setState({ [key]: event.target.value });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    apiHandler
      .createOneHouse(this.state)
      .then((res) => {
        this.props.history.push(`/houses/${res._id}`);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handlePlace = (place) => {
    apiHandler
      .checkHouse(place.ADDRESS)
      .then((res) => {
        if (res.length > 0) {
          this.setState({ alreadyExist: true, houseId: res[0]._id });
        } else {
          this.setState({
            fullAddress: place.ADDRESS,
            blocNumber: place.BLK_NO,
            textAddress: place.ROAD_NAME,
            building: place.BUILDING,
            coordinates: [Number(place.LONGITUDE), Number(place.LATITUDE)],
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    return (
      <div className="ItemForm-container">
        <form
          className="form"
          onChange={this.handleChange}
          onSubmit={this.handleSubmit}
        >
          <h2 className="title">Detailed information about the location</h2>
          <div className="form-group">
            <label className="label" htmlFor="location">
              Postal code
            </label>
            <LocationAutoComplete
              searchType="types=postcode&"
              onSelect={this.handlePlace}
              mapCenter={this.mapCenter}
            />
          </div>
          <p>OR</p>
          <div className="form-group">
            <label className="label" htmlFor="location">
              Address
            </label>
            <LocationAutoComplete
              searchType="types=address&"
              onSelect={this.handlePlace}
              mapCenter={this.mapCenter}
            />
          </div>
          {!this.state.alreadyExist && (
            <React.Fragment>
              <div className="form-group">
                <label className="label" htmlFor="category">
                  House category
                </label>

                <select id="category" name="category" defaultValue="-1">
                  <option value="-1" disabled>
                    Select a category
                  </option>
                  <option value="Condo">Condo</option>
                  <option value="House">House</option>
                  <option value="Social Housing">Social Housing</option>
                </select>
              </div>
              <button className="btn-submit">Add house</button>
            </React.Fragment>
          )}
          {this.state.alreadyExist && (
            <React.Fragment>
              <div>This house is already in our database.</div>
              <Link className="link" to={this.state.houseId}>
                Add a new review
              </Link>
            </React.Fragment>
          )}
        </form>
      </div>
    );
  }
}

export default HouseForm;
