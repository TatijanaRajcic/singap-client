import axios from "axios";

const service = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true, // Cookie is sent to client when using this service. (used for session)
});

function errorHandler(error) {
  if (error.response.data) {
    console.log(error.response && error.response.data);
    throw error;
  }
  throw error;
}

export default {
  service,

  signup(userInfo) {
    return service
      .post("/api/auth/signup", userInfo)
      .then((res) => res.data)
      .catch(errorHandler);
  },

  signin(userInfo) {
    return service
      .post("/api/auth/signin", userInfo)
      .then((res) => res.data)
      .catch(errorHandler);
  },

  isLoggedIn() {
    return service
      .get("/api/auth/isLoggedIn")
      .then((res) => res.data)
      .catch(errorHandler);
  },

  logout() {
    return service
      .get("/api/auth/logout")
      .then((res) => res.data)
      .catch(errorHandler);
  },

  getHouses() {
    return service
      .get("/api/houses")
      .then((res) => res.data)
      .catch(errorHandler);
  },

  getOneHouse(id) {
    return service
      .get(`/api/houses/${id}`)
      .then((res) => res.data)
      .catch(errorHandler);
  },

  checkHouse(search) {
    return service
      .get("/api/houses", {
        params: {
          search
        },
      })
      .then((res) => res.data)
      .catch(errorHandler);
  },

  createOneHouse(house) {
    return service
      .post("/api/houses", house)
      .then((res) => res.data)
      .catch(errorHandler);
  },

  createOneLease(lease) {
    return service
      .post("/api/leases", lease)
      .then((res) => res.data)
      .catch(errorHandler);
  },
};
