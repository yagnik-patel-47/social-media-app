const postCreator = (state: boolean = false, action) => {
  switch (action.type) {
    case "SHOW_POST_CREATOR":
      return true;
    case "HIDE_POST_CREATOR":
      return false;
    default:
      return state;
  }
};

export default postCreator;
