import { combineReducers } from "redux";
import profileData from "./UpdateProfile";
import postCreator from "./ShowPostCreator";
import showFeed from "./ShowFeedOrSavedPosts";
import showSidebar from "./showSideBar";
import snackBarOpen from "./SnackBarOpen";

const rootReducer = combineReducers({
  profileData,
  postCreator,
  showFeed,
  showSidebar,
  snackBarOpen,
});

export default rootReducer;
