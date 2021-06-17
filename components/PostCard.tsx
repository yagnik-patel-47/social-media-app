import {
  Card,
  CardActions,
  CardContent,
  Collapse,
  Avatar,
  IconButton,
  Typography,
  Button,
  Popover,
  TextField,
} from "@material-ui/core";
import FavoriteIcon from "@material-ui/icons/Favorite";
import CommentIcon from "@material-ui/icons/Comment";
import BookmarkIcon from "@material-ui/icons/Bookmark";
import BookmarkBorderOutlinedIcon from "@material-ui/icons/BookmarkBorderOutlined";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import { db, storage, auth } from "../firebase";
import { FC, useState, MouseEvent } from "react";
import firebase from "firebase/app";
import { RootStateOrAny, useSelector } from "react-redux";
import { ProfileData } from "../reducers/UpdateProfile";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import LikesModal from "../components/LikesModal";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";

interface Props {
  post: {
    caption: string;
    image: string;
    likes: object[];
    comments: Array<any>;
    user: string;
    timestamp: string;
    aspectRatio: string;
  };
  postID: string;
}

const PostCard: FC<Props> = ({ post, postID }: Props) => {
  const [photo, setPhoto] = useState<string>("");
  const [uname, setUname] = useState<string>("");
  const [commentText, setCommentText] = useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(false);
  const [likesModalOpen, setLikesModalOpen] = useState<boolean>(false);
  const profile: ProfileData = useSelector(
    (store: RootStateOrAny) => store.profileData
  );

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClickPopOver = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopOver = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  db.collection("users")
    .doc(post.user)
    .get()
    .then((doc) => {
      if (doc.exists) {
        setPhoto(doc.data().photo);
        setUname(doc.data().userName);
      }
    });

  const addToLiked = () => {
    db.collection("posts")
      .doc(postID)
      .set(
        {
          likes: firebase.firestore.FieldValue.arrayUnion({
            photo: profile.photo,
            username: profile.userName,
          }),
        },
        { merge: true }
      );

    db.collection("users")
      .doc(auth.currentUser.uid)
      .set(
        {
          likedPosts: firebase.firestore.FieldValue.arrayUnion(postID),
        },
        { merge: true }
      );
  };

  const removeFromLiked = () => {
    db.collection("posts")
      .doc(postID)
      .set(
        {
          likes: firebase.firestore.FieldValue.arrayRemove({
            photo: profile.photo,
            username: profile.userName,
          }),
        },
        { merge: true }
      );

    db.collection("users")
      .doc(auth.currentUser.uid)
      .set(
        {
          likedPosts: firebase.firestore.FieldValue.arrayRemove(postID),
        },
        { merge: true }
      );
  };

  const savePost = () => {
    db.collection("users")
      .doc(auth.currentUser.uid)
      .set(
        {
          savedPosts: firebase.firestore.FieldValue.arrayUnion(postID),
        },
        { merge: true }
      );
  };

  const removeSavedPost = () => {
    db.collection("users")
      .doc(auth.currentUser.uid)
      .set(
        {
          savedPosts: firebase.firestore.FieldValue.arrayRemove(postID),
        },
        { merge: true }
      );
  };

  const commentPost = () => {
    if (commentText) {
      db.collection("posts")
        .doc(postID)
        .set(
          {
            comments: firebase.firestore.FieldValue.arrayUnion({
              username: profile.userName,
              photo: profile.photo,
              comment: commentText,
            }),
          },
          { merge: true }
        );
      setCommentText("");
    } else {
      alert("please write your comment first!");
    }
  };

  const deletePost = () => {
    db.collection("posts").doc(postID).delete();
    db.collection("users")
      .doc(auth.currentUser.uid)
      .set(
        {
          posts: firebase.firestore.FieldValue.arrayRemove(postID),
        },
        { merge: true }
      );
    storage.ref(`post_${postID}`).delete();
  };

  return (
    <AnimateSharedLayout>
      <motion.figure layout>
        <Card style={{ background: "transparent" }} elevation={0}>
          <div className="flex items-center p-4 justify-between">
            <Link href={`/${encodeURIComponent(uname)}`}>
              <div className="flex items-center space-x-4">
                <Avatar src={photo} alt="profile image" />
                <Typography>{uname}</Typography>
              </div>
            </Link>
            {profile.posts.includes(postID) && (
              <IconButton
                onClick={handleClickPopOver}
                style={{ outline: "none" }}
                size="medium"
              >
                <MoreVertIcon />
              </IconButton>
            )}
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClosePopOver}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Button
                style={{ outline: "none", color: "#fff" }}
                startIcon={<DeleteForeverIcon />}
                color="primary"
                variant="contained"
                onClick={deletePost}
              >
                Delete Post
              </Button>
            </Popover>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={post.image}
              alt="post image"
              width={post.aspectRatio === "16:9" ? 340 : 256}
              height={post.aspectRatio === "16:9" ? 191.25 : 256}
              objectFit="cover"
              placeholder="blur"
              blurDataURL={
                post.aspectRatio === "16:9" ? "/dummy16_9.jpg" : "/dummy1_1.jpg"
              }
            />
          </div>
          <CardContent>
            <Typography>{post.caption}</Typography>
          </CardContent>
          <div className="px-4">
            <Typography variant="body2">
              Liked by{" "}
              <Button
                onClick={() => {
                  setLikesModalOpen(true);
                }}
                style={{ outline: "none" }}
                size="small"
              >
                {post.likes.length} {post.likes.length < 2 ? "User" : "Users"}
              </Button>
            </Typography>
          </div>
          <CardActions>
            <div className="w-full flex justify-between">
              <span>
                {profile.likedPosts.includes(postID) ? (
                  <IconButton
                    onClick={removeFromLiked}
                    style={{ outline: "none" }}
                  >
                    <FavoriteIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={addToLiked} style={{ outline: "none" }}>
                    <FavoriteBorderIcon />
                  </IconButton>
                )}
                <IconButton
                  onClick={() => {
                    setExpanded((prev) => !prev);
                  }}
                  style={{ outline: "none" }}
                >
                  <CommentIcon />
                </IconButton>
              </span>
              {profile?.savedPosts?.includes(postID) ? (
                <IconButton
                  style={{ outline: "none" }}
                  onClick={removeSavedPost}
                >
                  <BookmarkIcon />
                </IconButton>
              ) : (
                <IconButton style={{ outline: "none" }} onClick={savePost}>
                  <BookmarkBorderOutlinedIcon />
                </IconButton>
              )}
            </div>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <div className="w-full flex justify-between mb-4">
              <TextField
                className="!mx-4"
                color="secondary"
                label="write comment"
                value={commentText}
                onChange={(e) => {
                  setCommentText(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commentPost();
                  }
                }}
                variant="filled"
                size="small"
              />
              <button
                onClick={commentPost}
                className="app-btn text-sm py-2 px-4 bg-none focus:outline-none"
              >
                Post
              </button>
            </div>
            {post.comments.map((comment, index) => (
              <div key={index} className="w-full flex flex-col px-4 mt-2">
                <div className="flex space-x-2">
                  <Avatar
                    src={comment.photo}
                    alt="user profile image"
                    style={{ width: "30px", height: "30px" }}
                  />
                  <Typography variant="subtitle1">
                    <span className="font-medium">{comment.username}</span>
                    {` ${comment.comment}`}
                  </Typography>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <Typography className="!mx-4">
                <strong>0</strong> Comments
              </Typography>
            )}
          </Collapse>
        </Card>
      </motion.figure>
      <AnimatePresence>
        {likesModalOpen && (
          <LikesModal
            setLikesModalOpen={setLikesModalOpen}
            likes={post.likes}
          />
        )}
      </AnimatePresence>
    </AnimateSharedLayout>
  );
};

export default PostCard;
