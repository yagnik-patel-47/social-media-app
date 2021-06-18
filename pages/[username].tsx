import { GetStaticProps, GetStaticPaths } from "next";
import { FC, useState } from "react";
import {
  Avatar,
  Typography,
  Button,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { useSelector, RootStateOrAny, useDispatch } from "react-redux";
import { ProfileData } from "../reducers/UpdateProfile";
import Masonry from "react-masonry-css";
import { useCollection, useDocumentData } from "react-firebase-hooks/firestore";
import { useEffect } from "react";
import PostCard from "../components/PostCard";
import firebase from "firebase/app";
import { auth, db } from "../firebase";
import { useRouter } from "next/router";
import Modal from "../components/Modal";
import MenuIcon from "@material-ui/icons/Menu";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { AnimatePresence } from "framer-motion";

interface Props {
  data: {
    email: string;
    following: string[];
    followers: string[];
    fullName: string;
    username: string;
    photo: string;
    posts: string[];
    id: string;
  };
  profileFound: boolean;
}

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: 140,
    height: 140,
    [theme.breakpoints.down(801)]: {
      width: 100,
      height: 100,
    },
  },
}));

const ProfilePage: FC<Props> = ({ data, profileFound }: Props) => {
  const classes = useStyles();
  const router = useRouter();
  const dispatch = useDispatch();
  const [accPosts, setAccPosts] = useState<Array<object>>([]);
  const isMobbile = useMediaQuery("(max-width: 800px)");

  const profile: ProfileData = useSelector(
    (store: RootStateOrAny) => store.profileData
  );
  const breakpoints = {
    default: 3,
    1100: 2,
    700: 1,
  };

  const [userData] = useDocumentData(db.collection("users").doc(data?.id), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const [allPosts] = useCollection(
    db.collection("posts").orderBy("timestamp", "desc"),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  useEffect(() => {
    const accountPostsFilter = allPosts?.docs?.filter((post) =>
      data?.posts?.includes(post?.id)
    );
    if (accountPostsFilter) {
      setAccPosts(accountPostsFilter);
    }
  }, [allPosts, router.query.username]);

  useEffect(() => {
    dispatch({ type: "HIDE_SIDEBAR" });
  }, []);

  const followUser = () => {
    db.collection("users")
      .doc(data.id)
      .set(
        {
          followers: firebase.firestore.FieldValue.arrayUnion(
            auth.currentUser.uid
          ),
        },
        { merge: true }
      );
    db.collection("users")
      .doc(auth.currentUser.uid)
      .set(
        {
          following: firebase.firestore.FieldValue.arrayUnion(data.id),
        },
        { merge: true }
      );
  };

  const unFollowUser = () => {
    db.collection("users")
      .doc(data.id)
      .set(
        {
          followers: firebase.firestore.FieldValue.arrayRemove(
            auth.currentUser.uid
          ),
        },
        { merge: true }
      );
    db.collection("users")
      .doc(auth.currentUser.uid)
      .set(
        {
          following: firebase.firestore.FieldValue.arrayRemove(data.id),
        },
        { merge: true }
      );
  };

  return (
    <>
      {profileFound ? (
        <div className="flex hide-scrollbars overflow-x-hidden flex-col pt-8 md:px-16 lg:px-24 xl:px-32 bg-bg-secondary w-full text-white">
          <div className="flex items-center pl-4 md:pl-0 flex-col md:flex-row">
            {isMobbile && (
              <IconButton
                onClick={() => {
                  dispatch({ type: "SHOW_SIDEBAR" });
                }}
                className="!self-start"
                style={{ outline: "none" }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <div>
              <Avatar
                src={data.photo}
                alt="profile image"
                className={classes.avatar}
              />
            </div>
            <div className="flex mx-4 md:ml-16 my-4 md:my-6 flex-col space-y-4 items-center">
              <div className="flex md:space-x-6 flex-col md:flex-row space-y-4 md:space-y-0">
                <Typography className="!text-2xl md:!text-3xl !font-light">
                  {data.username}
                </Typography>
                {profile.email !== data.email && (
                  <Button
                    onClick={
                      profile.following.includes(data.id)
                        ? unFollowUser
                        : followUser
                    }
                    style={{ outline: "none" }}
                    variant="outlined"
                    size={isMobbile ? "small" : "medium"}
                  >
                    {profile.following.includes(data.id)
                      ? "Unfollow"
                      : "Follow"}
                  </Button>
                )}
              </div>
              <div>
                <Typography variant="button" style={{ padding: "0 0.5rem" }}>
                  {userData?.posts?.length} Posts
                </Typography>
                <Button
                  onClick={() => {
                    router.push(
                      {
                        pathname: `/${encodeURIComponent(data.username)}`,
                        query: { modalType: "followers" },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                  style={{ outline: "none" }}
                  size={isMobbile ? "small" : "medium"}
                >
                  {userData?.followers?.length} Followers
                </Button>
                <Button
                  onClick={() => {
                    router.push(
                      {
                        pathname: `/${encodeURIComponent(data.username)}`,
                        query: { modalType: "following" },
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                  style={{ outline: "none" }}
                  size={isMobbile ? "small" : "medium"}
                >
                  {userData?.following?.length} Following
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-6 h-full flex flex-col px-4 md:px-0 md:pr-12">
            <Typography variant="h6">Posts</Typography>
            {accPosts.length === 0 && <Typography>0 Posts</Typography>}
            <Masonry
              breakpointCols={breakpoints}
              className="space-x-4 my-masonry-grid mb-6"
              columnClassName="my-masonry-grid_column"
            >
              {accPosts &&
                accPosts.map((post: any) => (
                  <PostCard
                    key={post.id}
                    post={{
                      caption: post.data().caption,
                      user: post.data().user,
                      image: post.data().image,
                      likes: post.data().likes,
                      comments: post.data().comments,
                      timestamp: post.data().timestamp,
                      aspectRatio: post.data().aspectRatio,
                    }}
                    postID={post.id}
                  />
                ))}
            </Masonry>
          </div>
          <AnimatePresence>
            {router.query.modalType && (
              <Modal id={data.id} type={router.query.modalType} origin="user" />
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-bg-secondary text-white">
          <Typography variant="h6">User not found!</Typography>
        </div>
      )}
    </>
  );
};

export default ProfilePage;

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let docFound = false;
  let docData: any = {};
  let docID = "";

  const findUser = await db
    .collection("users")
    .where("userName", "==", params.username)
    .get();

  findUser.size > 0 ? (docFound = true) : (docFound = false);

  findUser.docs.forEach((doc) => {
    if (doc.exists) {
      docData = doc.data();
      docID = doc.id;
    }
  });

  if (!docFound) {
    return {
      props: {
        profileFound: false,
        data: null,
      },
    };
  }

  return {
    props: {
      profileFound: true,
      data: {
        email: docData.email,
        followers: docData.followers,
        following: docData.following,
        fullName: docData.fullName,
        photo: docData.photo,
        posts: docData.posts,
        username: docData.userName,
        id: docID,
      },
    },
  };
};
