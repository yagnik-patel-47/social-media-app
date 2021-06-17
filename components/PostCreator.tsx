import {
  Backdrop,
  Box,
  makeStyles,
  IconButton,
  Typography,
  TextField,
  CircularProgress,
  LinearProgress,
  FormControl,
  RadioGroup,
  Radio,
  FormLabel,
  FormControlLabel,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { FC, useRef, useState } from "react";
import { db, storage, auth } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion } from "framer-motion";

const useStyles = makeStyles({
  backdrop: {
    zIndex: 10000,
  },
});

const PostCreator: FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const showCreateModal = useSelector(
    (store: RootStateOrAny) => store.postCreator
  );
  const postFileInput = useRef<HTMLInputElement>(null);
  const [captionText, setCaptionText] = useState<string>("");
  const [postImage, setPostImage] = useState(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [previewURL, setPreviewURL] = useState<string | ArrayBuffer | any>("");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [posting, setPosting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [user] = useAuthState(auth);

  const handlePost = () => {
    if (!postImage) {
      alert("Please select an image.");
      return;
    }
    setPosting(true);
    const id = uuidv4();
    const imageStorageRef = storage.ref(`post_${id}`);
    imageStorageRef.put(postImage).on(
      "state_changed",
      (snap) => {
        let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
        setProgress(percentage);
      },
      () => {},
      async () => {
        const url = await imageStorageRef.getDownloadURL();
        db.collection("posts").doc(id).set({
          caption: captionText,
          image: url,
          likes: [],
          comments: [],
          user: user.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          aspectRatio: aspectRatio,
        });
        db.collection("users")
          .doc(auth.currentUser.uid)
          .set(
            {
              posts: firebase.firestore.FieldValue.arrayUnion(id),
            },
            { merge: true }
          );
        dispatch({ type: "HIDE_POST_CREATOR" });
        setImageLoading(false);
        setPostImage(null);
        setCaptionText("");
        setPreviewURL("");
        setPosting(false);
        setAspectRatio("16:9");
      }
    );
  };

  const handleRadioChange = (e) => {
    setAspectRatio(e.target.value);
  };

  return (
    <Backdrop className={classes.backdrop} open={showCreateModal}>
      <Box className="bg-gray-700 text-white w-3/4 flex flex-col items-center space-y-4 rounded-md p-4 md:space-y-8 h-3/4 overflow-x-hidden hide-scrollbars">
        {!posting ? (
          <>
            <div className="flex justify-between items-center p-4 w-full">
              <Typography>Create Post</Typography>
              <IconButton
                style={{ outline: "none" }}
                onClick={() => {
                  dispatch({ type: "HIDE_POST_CREATOR" });
                  setImageLoading(false);
                  setPostImage(null);
                  setCaptionText("");
                  setPreviewURL("");
                  setPosting(false);
                }}
              >
                <CloseIcon />
              </IconButton>
            </div>
            <div className="flex w-full flex-col justify-center md:flex-row md:space-x-4 space-y-4">
              <div
                className="border-gray-200 border-2 p-4 h-full md:w-1/2 rounded-md grid place-items-center w-full relative"
                onClick={() => {
                  postFileInput.current.click();
                }}
              >
                {postImage ? (
                  imageLoading ? (
                    <CircularProgress color="secondary" />
                  ) : (
                    <img
                      src={previewURL}
                      alt="post image"
                      style={{ height: "auto", width: "50%" }}
                    />
                  )
                ) : (
                  <Typography variant="button">Click to add Image.</Typography>
                )}
                <input
                  type="file"
                  style={{ display: "none" }}
                  accept="image/*"
                  ref={postFileInput}
                  onChange={(e) => {
                    setImageLoading(true);
                    setPostImage(e.target.files[0]);
                    const reader: FileReader = new FileReader();
                    reader.addEventListener("load", (e) => {
                      setPreviewURL(e.target.result);
                      setImageLoading(false);
                    });
                    if (e.target.files[0]) {
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
              </div>
              <TextField
                variant="outlined"
                color="secondary"
                label="Caption"
                multiline
                rows={4}
                value={captionText}
                onChange={(e) => {
                  setCaptionText(e.target.value);
                }}
              />
            </div>
            <FormControl
              variant="filled"
              component="div"
              className="!flex-row items-center"
              required
            >
              <FormLabel color="secondary" component="legend" className="mx-4">
                Aspect Ratio
              </FormLabel>
              <RadioGroup onChange={handleRadioChange} row value={aspectRatio}>
                <FormControlLabel
                  value="16:9"
                  control={<Radio />}
                  label="16:9"
                />
                <FormControlLabel value="1:1" control={<Radio />} label="1:1" />
              </RadioGroup>
            </FormControl>
            <button className="app-btn" onClick={handlePost}>
              <Typography variant="button">Post</Typography>
            </button>
          </>
        ) : (
          <div className="flex w-full h-full justify-center items-center flex-col space-y-8">
            <Typography variant="h6">Posting your post...</Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              style={{ width: "100%" }}
            />
          </div>
        )}
      </Box>
    </Backdrop>
  );
};

export default PostCreator;
