import { Backdrop, IconButton, Typography, Avatar } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { motion } from "framer-motion";
import { FC, SetStateAction, Dispatch } from "react";
import Link from "next/link";

interface Props {
  likes: Array<any>;
  setLikesModalOpen: Dispatch<SetStateAction<boolean>>;
}

const LikesModal: FC<Props> = ({ likes, setLikesModalOpen }: Props) => {
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
          <Typography variant="subtitle1">Likes</Typography>
          <IconButton
            onClick={() => {
              setLikesModalOpen(false);
            }}
            style={{ outline: "none" }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <div className="flex flex-col w-full mt-4 px-4 space-y-4 h-full overflow-x-hidden hide-scrollbars">
          {likes.map((like, index) => (
            <Link href={`${like.username}`} key={index}>
              <div className="flex items-center space-x-4">
                <Avatar src={like.photo} alt="profile image" />
                <Typography>{like.username}</Typography>
              </div>
            </Link>
          ))}
          {likes.length === 0 && (
            <Typography>
              <strong>0</strong> Likes
            </Typography>
          )}
        </div>
      </motion.div>
    </Backdrop>
  );
};

export default LikesModal;
