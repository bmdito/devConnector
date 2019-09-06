import { REGISTER_SUCCESS, REGISTER_FAIL } from "../actions/types";

//access local storage
const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  //once we get data this will change to false
  loading: true,
  user: null
};
//created variable above to make below neat
export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case REGISTER_SUCCESS:
      //if token is there set token
      localStorage.setItem("token", payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false
      };
    case REGISTER_FAIL:
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false
      };

    default:
      return state;
  }
}
