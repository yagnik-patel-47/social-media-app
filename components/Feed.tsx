import { IconButton, Typography } from "@material-ui/core";
import PostCard from "./PostCard";
import Masonry from "react-masonry-css";
import { auth, db } from "../firebase";
import { useCollection, useDocumentData } from "react-firebase-hooks/firestore";
import { FC, useState } from "react";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import MenuIcon from "@material-ui/icons/Menu";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const Feed: FC = () => {
  const showFeed = useSelector((store: RootStateOrAny) => store.showFeed);
  const [savedPosts, setSavedPosts] = useState<Array<any>>([]);
  const dispatch = useDispatch();
  const isMobbile = useMediaQuery("(max-width: 800px)");

  const breakpoints = {
    default: 3,
    1100: 2,
    700: 1,
  };
  const [allPosts] = useCollection(
    db.collection("posts").orderBy("timestamp", "desc"),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );
  const [savedPostsData] = useDocumentData(
    db.collection("users").doc(auth.currentUser.uid),
    { snapshotListenOptions: { includeMetadataChanges: true } }
  );

  useEffect(() => {
    if (allPosts) {
      const savedFilter = allPosts.docs.filter((post) =>
        savedPostsData.savedPosts.includes(post.id)
      );
      setSavedPosts(savedFilter);
    }
  }, [savedPostsData, allPosts]);

  return (
    <div className="flex flex-col space-y-3 text-white h-full">
      <div className="space-x-2 flex ml-6 items-center mt-6">
        {isMobbile && (
          <IconButton
            onClick={() => {
              dispatch({ type: "SHOW_SIDEBAR" });
            }}
            style={{ outline: "none" }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography className="!font-roboto" variant="h5">
          {showFeed ? "Feed" : "Saved Posts"}
        </Typography>
      </div>
      <Masonry
        breakpointCols={breakpoints}
        className="space-x-4 my-masonry-grid h-full overflow-x-hidden hide-scrollbars px-6 !mb-6"
        columnClassName="my-masonry-grid_column"
      >
        {showFeed
          ? allPosts &&
            allPosts.docs.map((post) => (
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
            ))
          : savedPosts &&
            savedPosts.map((post) => (
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
        {!showFeed && savedPosts && savedPosts.length === 0 && (
          <Typography>
            <strong>0</strong> Saved Posts
          </Typography>
        )}
      </Masonry>
    </div>
  );
};

export default Feed;
