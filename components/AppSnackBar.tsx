import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { Snackbar } from "@material-ui/core";
import { FC } from "react";
import { useSelector, RootStateOrAny, useDispatch } from "react-redux";

interface Props {
  type: "error" | "info" | "success" | "warning";
  message: string;
}

const AppSnackBar: FC<Props> = ({ type, message }: Props) => {
  const snakeBarOpen: boolean = useSelector(
    (store: RootStateOrAny) => store.snackBarOpen
  );
  const dispatch = useDispatch();

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={snakeBarOpen}
      autoHideDuration={4000}
      onClose={() => {
        dispatch({ type: "CLOSE_SNACKBAR" });
      }}
    >
      <Alert
        onClose={() => {
          dispatch({ type: "CLOSE_SNACKBAR" });
        }}
        severity={type}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AppSnackBar;

const Alert: FC<AlertProps> = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};
