import React, { Component } from "react";
import apiHandler from "../api/apiHandler";
import "../styles/form.css";
import "../styles/OneHouse.css";

const ratings = [
  {
    name: "good",
    img: "/images/good.png",
  },
  {
    name: "neutral",
    img: "/images/neutral.png",
  },
  {
    name: "bad",
    img: "/images/bad.png",
  },
];

export default class OneHouse extends Component {
  state = {
    house: null,
    houseId: null,
    rating: null,
    discrimination: false,
    abuseOnRent: false,
    abuseOnDeposit: false,
    displayReviews: false,
    displayForm: false,
    decription: "",
  };

  componentDidMount() {
    apiHandler
      .getOneHouse(this.props.match.params.houseId)
      .then((house) => {
        this.setState({ house, houseId: house._id });
      })
      .catch((err) => console.log(err));
  }

  handleChange = (event) => {
    const value =
      event.target.type === "file"
        ? event.target.files[0]
        : event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    const key = event.target.name;

    this.setState({ [key]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const fd = new FormData();
    for (const key in this.state) {
      fd.append(`${key}`, this.state[key]);
    }
    apiHandler
      .createOneLease(fd)
      .then((lease) => {
        this.setState({ lease });
      })
      .catch((err) => console.log(err));
  };

  displayForm = () => {
    this.setState({ displayForm: true, displayReviews: false });
  };

  displayReviews = () => {
    this.setState({ displayForm: false, displayReviews: true });
  };

  render() {
    return (
      <div className="OneHouse">
        {this.state.house && (
          <React.Fragment>
            <div className="form">
              <h2 className="title">Recap of your search</h2>
              <div className="form-group">
                <p className="label">Bloc number:</p>
                <p>{this.state.house.blocNumber}</p>
              </div>
              <div className="form-group">
                <p className="label">Address:</p>
                <p>{this.state.house.textAddress}</p>
              </div>
              <div className="form-group">
                <p className="label">Building:</p>
                <p>{this.state.house.building}</p>
              </div>
              {this.state.house.unitNumbers && (
                <div className="form-group">
                  <p className="label">Unit Numbers:</p>
                  <p>{this.state.house.unitNumbers}</p>
                </div>
              )}
              <div className="form-group">
                <p className="label">Category:</p>
                <p>{this.state.house.category}</p>
              </div>
              <div className="buttons flex">
                <button onClick={this.displayReviews}>
                  See all existing reviews
                </button>
                <button onClick={this.displayForm}>Add my own review</button>
              </div>
            </div>

            {this.state.displayReviews && (
              <div className="form">
                {this.state.house.leases.length > 0 ? (
                  <React.Fragment>
                    <h2 className="title">
                      There are {this.state.house.leases.length} reviews for
                      this house.
                    </h2>
                    <div className="form-group">
                      <p className="label">Verified reviews:</p>
                      <div>
                        {this.state.house.leases
                          .filter((oneLease) => oneLease.isVerified === true)
                          .map((oneLease, index) => (
                            <div className="form-group review" key={index}>
                              <p className="label">Review #{index + 1}</p>
                              <div className="form-group flex align-c">
                                <p>Overall satisfaction:</p>
                                <img
                                  src={`/images/${oneLease.rating}.png`}
                                  style={{ width: "50px", marginLeft: "10px" }}
                                  alt="overall satisfaction"
                                />
                              </div>
                              <div className="form-group">
                                <p>Has been victim of ...</p>
                                <ul>
                                  <li>
                                    discrimination:
                                    {oneLease.discrimination ? " Yes" : " No"}
                                  </li>
                                  <li>
                                    abuse on rent:
                                    {oneLease.abuseOnRent ? " Yes" : " No"}
                                  </li>
                                  <li>
                                    abuse on deposit:
                                    {oneLease.discrimination ? " Yes" : " No"}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <p className="label">Unverified reviews:</p>
                      <div>
                        {this.state.house.leases
                          .filter((oneLease) => oneLease.isVerified === false)
                          .map((oneLease, index) => (
                            <div className="form-group review" key={index}>
                              <p className="label">Review #{index + 1}</p>
                              <div className="form-group flex align-c">
                                <p>Overall satisfaction:</p>
                                <img
                                  src={`/images/${oneLease.rating}.png`}
                                  style={{ width: "50px", marginLeft: "10px" }}
                                  alt="overall satisfaction"
                                />
                              </div>
                              <div className="form-group">
                                <p>Has been victim of ...</p>
                                <ul>
                                  <li>
                                    discrimination:
                                    {oneLease.discrimination ? " Yes" : " No"}
                                  </li>
                                  <li>
                                    abuse on rent:
                                    {oneLease.abuseOnRent ? " Yes" : " No"}
                                  </li>
                                  <li>
                                    abuse on deposit:
                                    {oneLease.discrimination ? " Yes" : " No"}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </React.Fragment>
                ) : (
                  <h2 className="title">
                    There are no existing reviews for this house
                  </h2>
                )}
                <button onClick={this.displayForm}>Add my own</button>
              </div>
            )}

            {this.state.displayForm && (
              <form
                className="form"
                onChange={this.handleChange}
                onSubmit={this.handleSubmit}
              >
                <h2 className="title">Detailed information about my rental</h2>
                <div className="form-group">
                  <p className="label spaced-b">
                    Please upload a proof of lease:
                  </p>
                  <label className="custom-file-upload" htmlFor="leasePicture">
                    Upload my proof
                  </label>
                  <input type="file" id="leasePicture" name="leasePicture" />
                </div>
                <div className="form-group spaced-t">
                  <label className="label" htmlFor="rating">
                    How would you rate your experience?
                  </label>
                  <div className="rating-container">
                    {ratings.map((rating) => {
                      return (
                        <div key={rating.name}>
                          <label
                            htmlFor={rating.name}
                            className="ratingSelector"
                          >
                            <input
                              type="radio"
                              id={rating.name}
                              name="rating"
                              value={rating.name}
                              defaultChecked={this.state.rating === rating.name}
                            />
                            <img src={rating.img} alt={rating.name} />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <p className="label">
                    Have you experienced any of the following?
                  </p>
                  <label className="flex align-c" htmlFor="discrimination">
                    Discrimination:
                    <input
                      id="discrimination"
                      name="discrimination"
                      type="checkbox"
                      defaultChecked={this.state.discrimination}
                    />
                  </label>
                  <label className="flex align-c" htmlFor="abuseOnRent">
                    Abuse on rent:
                    <input
                      id="abuseOnRent"
                      name="abuseOnRent"
                      type="checkbox"
                      defaultChecked={this.state.abuseOnRent}
                    />
                  </label>
                  <label className="flex align-c" htmlFor="abuseOnDeposit">
                    Abuse on deposit:
                    <input
                      id="abuseOnDeposit"
                      name="abuseOnDeposit"
                      type="checkbox"
                      defaultChecked={this.state.abuseOnDeposit}
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label className="label">
                    Please describe your experience
                  </label>
                  <p style={{ fontStyle: "italic" }}>
                    Remember, no diffamation allowed
                  </p>
                  <textarea name="description" id="description"></textarea>
                </div>
                <button className="btn-submit">Next</button>
              </form>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}
