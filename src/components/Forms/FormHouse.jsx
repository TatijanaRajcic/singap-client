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
    unitRelevance: null,
    coordinates: [],
    errors: [],
  };

  mapCenter = [103.851959, 1.29027];

  handleChange = (event) => {
    if (!event.target.name) return;
    let key = event.target.name;
    if (key === "unitNumbers1" || key === "unitNumbers2") {
      let { value, maxLength } = event.target;
      let troncated = value.slice(0, maxLength);
      this.setState({
        [key]: troncated,
      });
    } else {
      let value = event.target.value;
      if (event.target.type === "radio") {
        value === "true" ? (value = true) : (value = false);
      }
      this.setState({ [key]: value });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    let completeState = { ...this.state };
    completeState.unitNumbers = `#${this.state.unitNumbers1}-${this.state.unitNumbers2}`;
    console.log("COMPLETE STATE", completeState);

    // handling errors
    let errors = [];
    let errorMessages = {
      fullAddress: "Please choose an address provided by the autocomplete",
      unitRelevance: "Please select one option for Unit Numbers",
      unitNumbers: "Please specify both unit numbers digits",
    };
    if (completeState.fullAddress === "")
      errors.push(errorMessages.fullAddress);
    if (completeState.unitRelevance === null)
      errors.push(errorMessages.unitRelevance);
    if (
      completeState.unitRelevance &&
      (this.state.unitNumbers1.length < 2 || this.state.unitNumbers2.length < 3)
    ) {
      errors.push(errorMessages.unitNumbers);
    }

    if (errors.length > 0) {
      this.setState({ errors });
      return;
    }

    apiHandler
      .checkHouse(completeState)
      .then((houseFound) => {
        if (houseFound.length > 0) {
          this.props.history.push(`/houses/${houseFound[0]._id}`);
        } else {
          apiHandler
            .createOneHouse(completeState)
            .then((res) => {
              this.props.history.push(`/houses/${res._id}`);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((err) => console.log(err));

    //
    // need to set the state of errors again, to set it to 0
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
              Postal code or address *
            </label>
            <LocationAutoComplete
              searchType="types=postcode&"
              onSelect={this.handlePlace}
              mapCenter={this.mapCenter}
            />
          </div>
          <div className="form-group">
            <p className="label">
              Unit numbers {this.state.unitRelevance && "*"}
            </p>
            <div className="flex">
              <p>Does your address contains unit numbers?</p>
              <div className="flex">
                <div>
                  <input
                    type="radio"
                    id="relevance1"
                    name="unitRelevance"
                    value={true}
                    checked={this.state.unitRelevance === true}
                    onChange={this.handleChange}
                  />
                  <label htmlFor="contactChoice1">Yes</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="relevance2"
                    name="unitRelevance"
                    value={false}
                    checked={this.state.unitRelevance === false}
                    onChange={this.handleChange}
                  />
                  <label htmlFor="contactChoice2">No</label>
                </div>
              </div>
            </div>
            {this.state.unitRelevance && (
              <div className="flex align-c">
                <p>Please specify:</p>
                <div className="unit-numbers flex align-c">
                  <span>#</span>
                  <label className="for-accessibility" htmlFor="unitNumbers1">
                    First two digits
                  </label>
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
                  <label className="for-accessibility" htmlFor="unitNumbers2">
                    Last three digits
                  </label>
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
            )}
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

          {this.state.errors.map((error) => {
            return <p>{error}</p>;
          })}

          <button className="btn-submit">Next</button>
        </form>
      </div>
    );
  }
}

export default HouseForm;
