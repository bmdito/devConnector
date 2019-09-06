import axios from "axios";

//takes in token as a parameter and checks for it, token from local storage
const setAuthToken = token => {
  //if token set global header
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    //if not a token delete it
    delete axios.defaults.headers.common["x-auth-token"];
  }
};

export default setAuthToken;
