import {
  Button,
  TextField,
  Avatar,
  Typography,
  makeStyles,
  IconButton,
} from "@material-ui/core";
import { useRef, useState } from "react";
import { useSelector, RootStateOrAny, useDispatch } from "react-redux";
import { ProfileData } from "../reducers/UpdateProfile";
import { db, auth, storage } from "../firebase";
import AppSnackBar from "../components/AppSnackBar";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: 140,
    height: 140,
    [theme.breakpoints.down(801)]: {
      width: 120,
      height: 120,
    },
  },
}));

const EditProfile = () => {
  const classes = useStyles();
  const isMobbile = useMediaQuery("(max-width: 800px)");
  const newImageRef = useRef(null);
  const profile: ProfileData = useSelector(
    (store: RootStateOrAny) => store.profileData
  );
  const dispatch = useDispatch();
  const [newImage, setNewImage] = useState<any>(profile.photo);
  const [newUsername, setNewUsername] = useState<String>(profile.userName);
  const [newFullName, setNewFullName] = useState<String>(profile.fullName);
  const [newDemoImage, setNewDemoImage] = useState<any>("");

  const SubmitChanges = () => {
    if (!(newUsername && newFullName)) {
      return alert(
        "Please enter all fields. if you not have to change all fields, rewrite that fields as before."
      );
    }
    if (!newImage) {
      return alert("Please reselect image.");
    }
    const storageRef = storage.ref(`profile_${auth.currentUser.uid}`);
    storageRef.put(newImage).on(
      "state_changed",
      () => {},
      () => {},
      async () => {
        const url: string = await storageRef.getDownloadURL();
        db.collection("users")
          .doc(auth.currentUser.uid)
          .set(
            typeof newImage === "string"
              ? {
                  fullName: newFullName,
                  userName: newUsername,
                }
              : {
                  fullName: newFullName,
                  userName: newUsername,
                  photo: url,
                },
            { merge: true }
          );
        setNewDemoImage("");
        dispatch({ type: "OPEN_SNACKBAR" });
      }
    );
  };

  return (
    <div className="flex flex-col px-12 py-8 space-y-4 w-full h-full bg-bg-secondary text-white">
      {isMobbile && (
        <div>
          <IconButton
            onClick={() => {
              dispatch({ type: "SHOW_SIDEBAR" });
            }}
            style={{ outline: "none" }}
          >
            <MenuIcon />
          </IconButton>
        </div>
      )}
      <Typography align="center" variant="h6">
        Edit Your Profile.
      </Typography>
      <div className="flex items-center flex-col space-y-6">
        <Avatar
          className={classes.avatar}
          src={newDemoImage ? newDemoImage : profile.photo}
          alt="profile image"
        />
        <Button
          onClick={() => {
            newImageRef.current.click();
          }}
          variant="outlined"
          style={{ outline: "none" }}
        >
          Change Profile Image
        </Button>
        {newDemoImage && (
          <Button
            onClick={() => {
              setNewDemoImage("");
              setNewImage(profile.photo);
            }}
            variant="outlined"
            style={{ outline: "none" }}
          >
            Reset Profile Image
          </Button>
        )}
        <input
          type="file"
          style={{ display: "none" }}
          accept="image/*"
          ref={newImageRef}
          onChange={(e) => {
            if (e?.target?.files[0]?.size > 10000000) {
              alert("Please select file less than size of 10mb");
            } else {
              setNewImage(e.target.files[0]);
              const reader: FileReader = new FileReader();
              reader.addEventListener("load", (e) => {
                setNewDemoImage(e.target.result);
              });
              if (e.target.files[0]) {
                reader.readAsDataURL(e.target.files[0]);
              }
            }
          }}
        />
      </div>
      <div className="container flex flex-col mx-auto items-center">
        <div className="flex flex-col md:flex-row">
          <TextField
            label="Full Name"
            variant="filled"
            color="secondary"
            className="!m-2"
            value={newFullName}
            onChange={(e) => {
              setNewFullName(e.target.value);
            }}
          />
          <TextField
            label="Username"
            variant="filled"
            color="secondary"
            className="!m-2"
            value={newUsername}
            onChange={(e) => {
              setNewUsername(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="flex w-full justify-center">
        <Button
          onClick={SubmitChanges}
          style={{ outline: "none" }}
          variant="contained"
          color="primary"
        >
          Save
        </Button>
      </div>
      <AppSnackBar type="success" message="Successfully changed your data." />
    </div>
  );
};

export default EditProfile;
