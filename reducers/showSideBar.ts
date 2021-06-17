const showSidebar = (state: boolean = true, action) => {
  switch (action.type) {
    case "SHOW_SIDEBAR":
      return true;
    case "HIDE_SIDEBAR":
      return false;
    default:
      return state;
  }
};

export default showSidebar;
