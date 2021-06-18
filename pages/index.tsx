import Head from "next/head";
import { FC } from "react";
import SideBar from "../components/SideBar";
import PostCreator from "../components/PostCreator";
import Feed from "../components/Feed";

const Home: FC = () => {
  return (
    <>
      <Head>
        <title>Moments</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="bg-bg-secondary h-full w-full">
        <PostCreator />
        <Feed />
      </div>
    </>
  );
};

export default Home;
