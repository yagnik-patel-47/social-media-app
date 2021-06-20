import {
  Drawer,
  makeStyles,
  Typography,
  Avatar,
  Button,
  Divider,
  IconButton,
} from "@material-ui/core";
import { FC } from "react";
import Image from "next/image";
import DashboardIcon from "@material-ui/icons/Dashboard";
import BookmarksIcon from "@material-ui/icons/Bookmarks";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { auth, db, storage } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocument } from "react-firebase-hooks/firestore";
import { useEffect, useRef, useState } from "react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { ProfileData } from "../reducers/UpdateProfile";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import CloseIcon from "@material-ui/icons/Close";
import { useRouter } from "next/router";
import Link from "next/link";
import { AnimateSharedLayout, motion } from "framer-motion";
import AddIcon from "@material-ui/icons/Add";
import blue from "@material-ui/core/colors/blue";
import EditIcon from "@material-ui/icons/Edit";

const useStyles = makeStyles((theme) => ({
  SideBar: {
    backgroundColor: "#282a34",
    width: "100%",
    [theme.breakpoints.up(800)]: {
      position: "relative",
      width: "35vw",
    },
    [theme.breakpoints.up(1100)]: {
      position: "relative",
      width: "25vw",
    },
  },
  avatar: {
    height: "7rem",
    width: "7rem",
  },
  avatarPlusBtn: {
    position: "absolute",
    right: "0",
    bottom: "0.2rem",
    background: `linear-gradient(to bottom right, ${blue[300]}, ${blue[700]})`,
  },
}));

const SideBar: FC = () => {
  const classes = useStyles();
  const [user] = useAuthState(auth);
  const dispatch = useDispatch();
  const profile: ProfileData = useSelector(
    (store: RootStateOrAny) => store.profileData
  );
  const showFeed = useSelector((store: RootStateOrAny) => store.showFeed);
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const isMobbile = useMediaQuery("(max-width: 800px)");
  const sideBarOpen = useSelector((store: RootStateOrAny) => store.showSidebar);
  const router = useRouter();

  const [userData] = useDocument(db.collection("users").doc(user?.uid), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  useEffect(() => {
    if (userData) {
      dispatch({
        type: "UPDATE_WHOLE_PROFILE",
        payload: userData.data(),
      });
    }
  }, [userData]);

  const updateProfileImage = () => {
    if (imageFile) {
      const imageRef = storage.ref(`profile_${user.uid}`);
      imageRef.put(imageFile).on(
        "state_changed",
        () => {},
        () => {},
        async () => {
          const url = await imageRef.getDownloadURL();
          const doc = await db
            .collection("users")
            .where("email", "==", user.email)
            .get();
          const reqID = doc.docs[0].id;
          db.collection("users").doc(reqID).set(
            {
              photo: url,
            },
            { merge: true }
          );
        }
      );
    }
  };

  useEffect(updateProfileImage, [imageFile]);

  const togglePostCreator = () => {
    dispatch({ type: "HIDE_SIDEBAR" });
    dispatch({ type: "SHOW_POST_CREATOR" });
  };

  return (
    <Drawer
      classes={{ paper: classes.SideBar }}
      variant={isMobbile ? "temporary" : "permanent"}
      anchor="left"
      open={sideBarOpen}
    >
      <div className="p-4 items-center flex justify-between">
        <div className="flex items-center space-x-4">
          <Image src="/moments.png" alt="Logo" height={45} width={45} />
          <Typography variant="h6">Moments</Typography>
        </div>
        {router.route !== "/" ? (
          <button
            onClick={() => {
              router.push("/", undefined, { shallow: true });
              dispatch({ type: "HIDE_SIDEBAR" });
            }}
            className="app-btn"
          >
            Back
          </button>
        ) : (
          <button onClick={togglePostCreator} className="app-btn">
            Add Post
          </button>
        )}
        {isMobbile && (
          <IconButton
            onClick={() => {
              dispatch({ type: "HIDE_SIDEBAR" });
            }}
            style={{ outline: "none" }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </div>
      <div className="flex flex-col items-center space-y-3 mt-4">
        {profile.photo.length === 0 ? (
          <div className="relative">
            <Avatar
              onClick={() => {
                fileInputRef.current.click();
              }}
              style={{ background: "#34a853", color: "#fff" }}
              alt="profile"
              className={classes.avatar}
            >
              <Typography variant="h5">
                {profile?.fullName[0]?.toUpperCase()}
              </Typography>
            </Avatar>
            <IconButton
              className={classes.avatarPlusBtn}
              disableRipple
              style={{ outline: "none" }}
              disableFocusRipple
              disableTouchRipple
              size="small"
              onClick={() => {
                fileInputRef.current.click();
              }}
            >
              <AddIcon />
            </IconButton>
          </div>
        ) : (
          <div className="relative">
            <Avatar
              src={profile.photo}
              alt="profile"
              className={classes.avatar}
              onClick={() => {
                fileInputRef.current.click();
              }}
            />
            <IconButton
              className={classes.avatarPlusBtn}
              disableRipple
              style={{ outline: "none" }}
              disableFocusRipple
              disableTouchRipple
              size="small"
              onClick={() => {
                fileInputRef.current.click();
              }}
            >
              <AddIcon />
            </IconButton>
          </div>
        )}
        <input
          type="file"
          style={{ display: "none" }}
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            if (e?.target?.files[0]?.size > 10000000) {
              alert("Please select file less than size of 10mb");
            } else {
              setImageFile(e.target.files[0]);
            }
          }}
        />
        <Typography variant="h6">{profile.fullName}</Typography>
        <Typography color="textSecondary">
          <Link
            href="/[username]"
            as={`/${encodeURIComponent(profile.userName)}`}
          >
            {`@${profile.userName}`}
          </Link>
        </Typography>
      </div>
      <div className="grid grid-cols-3 bg-bg-secondary mt-4 gap-0.5">
        <div className="flex flex-col items-center p-4 space-y-2 bg-bg-primary">
          <Typography variant="subtitle1">{profile.posts.length}</Typography>
          <Typography variant="caption" color="textSecondary">
            Posts
          </Typography>
        </div>
        <div className="flex flex-col items-center p-4 space-y-2 bg-bg-primary">
          <Typography variant="subtitle1">
            {profile.followers.length}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Followers
          </Typography>
        </div>
        <div className="flex flex-col items-center p-4 space-y-2 bg-bg-primary">
          <Typography variant="subtitle1">
            {profile.following.length}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Followings
          </Typography>
        </div>
      </div>
      <div className="flex flex-col py-4 pl-10 mt-2 space-y-4">
        <AnimateSharedLayout>
          <Button
            className="!justify-start !p-3"
            startIcon={<DashboardIcon style={{ marginRight: "1rem" }} />}
            size="large"
            onClick={() => {
              if (router.pathname === "/[username]") {
                router.push("/");
              }
              dispatch({ type: "SHOW_FEED" });
              dispatch({ type: "HIDE_SIDEBAR" });
            }}
            style={{ outline: "none" }}
            disableTouchRipple
          >
            Feed
            {showFeed && <Widget />}
          </Button>
          <Button
            className="!justify-start !p-3"
            startIcon={<BookmarksIcon style={{ marginRight: "1rem" }} />}
            size="large"
            onClick={() => {
              if (router.pathname === "/[username]") {
                router.push("/");
              }
              dispatch({ type: "SHOW_SAVED_POSTS" });
              dispatch({ type: "HIDE_SIDEBAR" });
            }}
            style={{ outline: "none" }}
            disableTouchRipple
          >
            Saved
            {!showFeed && <Widget />}
          </Button>
        </AnimateSharedLayout>
        <Divider className="!mr-10" />
        <Button
          className="!justify-start !p-3"
          startIcon={<EditIcon style={{ marginRight: "1rem" }} />}
          size="large"
          style={{ outline: "none" }}
          onClick={() => {
            router.push("/edit_profile");
            dispatch({ type: "HIDE_SIDEBAR" });
          }}
        >
          Edit Profile
        </Button>
        <Button
          className="!justify-start !p-3"
          startIcon={<ExitToAppIcon style={{ marginRight: "1rem" }} />}
          size="large"
          onClick={() => {
            auth.signOut();
          }}
          style={{ outline: "none" }}
        >
          Logout
        </Button>
      </div>
    </Drawer>
  );
};

export default SideBar;

const Widget: FC = () => {
  const spring = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    duration: 0.4,
  };

  return (
    <motion.div
      className="absolute right-0 h-6 bg-blue-400"
      style={{
        borderTopLeftRadius: "4px",
        borderBottomLeftRadius: "4px",
        width: "5px",
      }}
      layoutId="widget"
      transition={spring}
    ></motion.div>
  );
};
