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
    unitNumbers1: "",
    unitNumbers2: "",
    coordinates: [],
  };

  mapCenter = [103.851959, 1.29027];

  handleChange = (event) => {
    if (event.target.name) {
      const key = event.target.name;
      if (event.target.name === "unitNumbers1" || "unitNumbers2") {
        const { value, maxLength } = event.target;
        const troncated = value.slice(0, maxLength);
        this.setState({
          [key]: troncated,
        });
      } else {
        this.setState({ [key]: event.target.value });
      }
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    let completeState = { ...this.state };
    completeState.unitNumbers = `#${this.state.unitNumbers1}-${this.state.unitNumbers2}`;
    apiHandler
      .checkHouse(completeState)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));

    // apiHandler
    //   .createOneHouse(completeState)
    //   .then((res) => {
    //     this.props.history.push(`/houses/${res._id}`);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  };

  handlePlace = (place) => {
    this.setState({
      fullAddress: place.ADDRESS,
      blocNumber: place.BLK_NO,
      textAddress: place.ROAD_NAME,
      building: place.BUILDING,
      coordinates: [Number(place.LONGITUDE), Number(place.LATITUDE)],
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
              Postal code or address
            </label>
            <LocationAutoComplete
              searchType="types=postcode&"
              onSelect={this.handlePlace}
              mapCenter={this.mapCenter}
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="unit-numbers">
              Unit numbers
            </label>
            <div id="unit-numbers">
              <span>#</span>
              <input
                className="input"
                type="text"
                name="unitNumbers1"
                value={this.state.unitNumbers1}
                onChange={this.handleChange}
                placeholder="15"
                maxLength="2"
              />
              <span>-</span>
              <input
                className="input"
                type="text"
                name="unitNumbers2"
                value={this.state.unitNumbers2}
                onChange={this.handleChange}
                placeholder="369"
                maxLength="3"
              />
            </div>
          </div>
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
          <button className="btn-submit">Next</button>
        </form>
      </div>
    );
  }
}

export default HouseForm;
