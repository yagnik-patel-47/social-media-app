import { Backdrop, IconButton, Typography } from "@material-ui/core";
import { FC } from "react";
import CloseIcon from "@material-ui/icons/Close";
import { useRouter } from "next/router";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "../firebase";
import FolAction from "../components/FolAction";
import { motion } from "framer-motion";

interface Props {
  id: string;
  type: string | string[];
  origin: string;
}

const Modal: FC<Props> = ({ id, type, origin }: Props) => {
  const router = useRouter();

  const [data] = useDocumentData(db.collection("users").doc(id), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  const usernameRoute: any = router.query.username;

  const handleRouteChange = () => {
    if (origin === "user") {
      router.push(
        { pathname: `/${encodeURIComponent(usernameRoute)}` },
        undefined,
        { shallow: true }
      );
    }
  };

  return (
    <Backdrop open={true} style={{ zIndex: 10000 }}>
      <motion.div
        className="w-11/12 md:w-1/3 h-2/3 flex rounded-lg flex-col p-6 bg-gray-700 items-center"
        animate={{ scale: 1, opacity: 1, y: 0 }}
        initial={{ scale: 0.8, opacity: 0, y: -100 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
          duration: 0.5,
        }}
      >
        <div className="flex justify-between w-full items-center">
          <Typography variant="subtitle1">
            {type === "following" ? "Following" : "Followers"}
          </Typography>
          <IconButton onClick={handleRouteChange} style={{ outline: "none" }}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="flex flex-col w-full mt-4 px-4 space-y-4 h-full overflow-x-hidden hide-scrollbars">
          {type === "followers" &&
            data &&
            data.followers.map((user: string) => (
              <FolAction key={user} id={user} type={router.query.modalType} />
            ))}
          {type === "followers" && data && data.followers.length === 0 && (
            <p>
              <strong>0</strong> Followers
            </p>
          )}
          {type === "following" &&
            data &&
            data.following.map((user: string) => (
              <FolAction key={user} id={user} type={router.query.modalType} />
            ))}
          {type === "following" && data && data.following.length === 0 && (
            <p>
              <strong>0</strong> Followings
            </p>
          )}
        </div>
      </motion.div>
    </Backdrop>
  );
};

export default Modal;
