import { FC } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../firebase";
import Link from "next/link";
import { Avatar, Typography, Button } from "@material-ui/core";
import { useSelector, RootStateOrAny } from "react-redux";
import { ProfileData } from "../reducers/UpdateProfile";
import { auth } from "../firebase";
import firebase from "firebase/app";

interface Props {
  type: string | string[];
  id: string;
}

const FolAction: FC<Props> = ({ type, id }: Props) => {
  const profile: ProfileData = useSelector(
    (store: RootStateOrAny) => store.profileData
  );
  const [data] = useDocumentData(db.collection("users").doc(id), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const FollowUser = () => {
    db.collection("users")
      .doc(auth.currentUser.uid)
      .set(
        {
          following: firebase.firestore.FieldValue.arrayUnion(id),
        },
        { merge: true }
      );
  };

  const UnFollowUser = () => {
    db.collection("users")
      .doc(auth.currentUser.uid)
      .set(
        {
          following: firebase.firestore.FieldValue.arrayRemove(id),
        },
        { merge: true }
      );
  };

  return (
    <div className="flex items-center justify-between">
      <Link href={`/${encodeURIComponent(data?.userName)}`}>
        <div className="flex space-x-4 items-center">
          <Avatar src={data?.photo} alt="profile image" />
          <Typography>{data?.userName}</Typography>
        </div>
      </Link>
      <div>
        {profile.userName !== data?.userName && type === "followers" && (
          <Button
            onClick={profile.following.includes(id) ? UnFollowUser : FollowUser}
          >
            {profile.following.includes(id) ? "Unfollow" : "Follow"}
          </Button>
        )}
        {profile.userName !== data?.userName && type === "following" && (
          <Button
            onClick={profile.following.includes(id) ? UnFollowUser : FollowUser}
          >
            {profile.following.includes(id) ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FolAction;
