import { combineReducers } from "redux";
import profileData from "./UpdateProfile";
import postCreator from "./ShowPostCreator";
import showFeed from "./ShowFeedOrSavedPosts";
import showSidebar from "./showSideBar";

const rootReducer = combineReducers({
  profileData,
  postCreator,
  showFeed,
  showSidebar
});

export default rootReducer;