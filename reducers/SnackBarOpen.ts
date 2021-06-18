const snackBarOpen = (state: boolean = false, action) => {
  switch (action.type) {
    case "OPEN_SNACKBAR":
      return true;
    case "CLOSE_SNACKBAR":
      return false;
    default:
      return state;
  }
};

export default snackBarOpen;
