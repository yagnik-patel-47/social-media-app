const showFeed = (state: boolean = true, action) => {
  switch (action.type) {
    case "SHOW_FEED":
      return true;
    case "SHOW_SAVED_POSTS":
      return false;
    default:
      return state;
  }
};

export default showFeed;
