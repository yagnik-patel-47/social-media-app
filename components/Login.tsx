import { TextField, Typography, Divider, Button } from "@material-ui/core";
import Image from "next/image";
import { FC, useState } from "react";
import Head from "next/head";
import { auth, googleProvider, db } from "../firebase";
import { motion, AnimatePresence, AnimateSharedLayout } from "framer-motion";
import { useEffect } from "react";

const Login = ({ setLogged }) => {
  const [register, setRegister] = useState(true);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleRes, setGoogleRes] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (auth.currentUser) setLogged(true);
  }, []);

  const resetFeilds = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setImage("");
  };

  const ContinueGoogleSignUp = async () => {
    if (!(username && password)) {
      alert("please fill all fields.");
      return;
    }
    const findExistingUsername = await db
      .collection("users")
      .where("userName", "==", username)
      .get();
    findExistingUsername.size !== 0
      ? alert("username had already taken")
      : (() => {
          db.collection("users")
            .doc(auth.currentUser.uid)
            .set(
              {
                fullName: fullName,
                userName: username,
                email: email,
                password: password,
                photo: !!image ? image : "",
                posts: [],
                followers: [],
                following: [],
                savedPosts: [],
                likedPosts: [],
              },
              { merge: true }
            );
          setGoogleRes(false);
          alert("succesfully created your account.");
          setLogged(true);
        })();
  };

  const handleEmailSignUp = async () => {
    if (googleRes) {
      ContinueGoogleSignUp();
      resetFeilds();
      return;
    }
    if (!(username && password && email && fullName)) {
      alert("please fill all fields.");
      return;
    }

    const ExistingUsername = await db
      .collection("users")
      .where("userName", "==", username)
      .get();

    if (ExistingUsername.size === 0) {
      auth
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
          (() => {
            db.collection("users").doc(auth.currentUser.uid).set(
              {
                fullName: fullName,
                userName: username,
                email: email,
                password: password,
                photo: "",
                posts: [],
                followers: [],
                following: [],
                savedPosts: [],
                likedPosts: [],
              },
              { merge: true }
            );
            alert("succesfully created your account.");
            resetFeilds();
            setLogged(true);
          })();
        })
        .catch((err) => {
          alert(err.message);
        });
    } else {
      alert("username had already taken");
    }
  };

  const handleGoogleSignUp = async () => {
    const data = await auth.signInWithPopup(googleProvider);
    const findExistingAccount = await db
      .collection("users")
      .where("email", "==", data.user.email)
      .get();
    findExistingAccount.size !== 0
      ? (() => {
          auth.signOut();
          alert("Already an account with same email.");
        })()
      : (() => {
          setGoogleRes(true);
          setEmail(data.user.email);
          setFullName(data.user.displayName);
          setImage(data.user.photoURL);
        })();
  };

  const handleGoogleLogIn = async () => {
    const data = await auth.signInWithPopup(googleProvider);
    const findExistingAccount = await db
      .collection("users")
      .where("email", "==", data.user.email)
      .get();
    findExistingAccount?.size !== 0
      ? (() => {
          alert("succesfully logged in your account.");
          resetFeilds();
          setLogged(true);
        })()
      : (() => {
          auth.signOut();
          alert("Account not found! Sign up please.");
        })();
  };

  const handleEmailLogIn = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        alert("succesfully logged in your account.");
        resetFeilds();
        setLogged(true);
      })
      .catch((err) => {
        if (
          err.message ===
          "The password is invalid or the user does not have a password."
        ) {
          alert(
            "The password is invalid. ( If you had signup with google, please login with google. )"
          );
        } else {
          alert(err.message);
        }
      });
  };

  return (
    <>
      <Head>
        <title>{register ? "Sign Up" : "Log In"}</title>
      </Head>
      <div className="grid place-items-center h-full bg-[#282a34] p-4">
        <AnimateSharedLayout>
          <motion.div
            className="p-4 sm:px-4 flex w-full flex-col items-center md:w-1/2 bg-[#3c3f51] text-gray-50"
            layout
          >
            <motion.span layout>
              <Image src="/moments.png" alt="logo" width={100} height={100} />
            </motion.span>
            {!googleRes && (
              <motion.button
                onClick={register ? handleGoogleSignUp : handleGoogleLogIn}
                className="flex border-[#004aad] items-center border-solid border-2 mt-2"
                layout
              >
                <Typography className="px-3" variant="button">
                  {register ? "Sign Up with Google" : "Login with Google"}
                </Typography>
                <div className="p-2 bg-[#004aad] grid place-items-center h-full w-auto">
                  <Image
                    src="/google_logo.png"
                    alt="google"
                    width={35}
                    height={35}
                  />
                </div>
              </motion.button>
            )}
            {googleRes && (
              <>
                <div className="flex flex-col md:flex-row">
                  <TextField
                    label="Username"
                    variant="filled"
                    color="secondary"
                    className="!m-2"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                    }}
                  />
                  <TextField
                    label="Password"
                    variant="filled"
                    color="secondary"
                    className="!m-2"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                </div>
              </>
            )}
            {!googleRes && (
              <motion.div className="w-full my-2 py-4" layout>
                <Divider />
                <Typography className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#3c3f51] py-2 px-4">
                  OR
                </Typography>
              </motion.div>
            )}
            <motion.div className="flex flex-col" layout>
              {!googleRes && (
                <>
                  <AnimatePresence>
                    {register && (
                      <motion.div
                        className="flex flex-col md:flex-row w-full"
                        exit={{
                          opacity: 0,
                          scale: [1, 0.8, 0.8],
                          y: [0, 0, 40],
                        }}
                        transition={{ duration: 0.5 }}
                        layout
                      >
                        <TextField
                          label="Full Name"
                          variant="filled"
                          color="secondary"
                          className="!m-2"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                          }}
                        />
                        <TextField
                          label="Username"
                          variant="filled"
                          color="secondary"
                          className="!m-2"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className="flex flex-col md:flex-row w-full"
                    layout
                  >
                    <TextField
                      label="Email"
                      variant="filled"
                      color="secondary"
                      className="!m-2"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                    />
                    <TextField
                      label="Password"
                      variant="filled"
                      color="secondary"
                      className="!m-2"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                    />
                  </motion.div>
                </>
              )}
            </motion.div>
            <motion.span layout>
              <Button
                onClick={register ? handleEmailSignUp : handleEmailLogIn}
                variant="contained"
                color="primary"
                style={{ margin: "1rem 0" }}
              >
                {register ? "Sign Up" : "Log In"}
              </Button>
            </motion.span>
            {!!(register && !googleRes) && (
              <motion.span layout>
                <Typography>
                  Already have an account?{" "}
                  <Button
                    onClick={() => {
                      setRegister(false);
                    }}
                  >
                    {"Log In"}
                  </Button>
                </Typography>
              </motion.span>
            )}
            {!!(!register && !googleRes) && (
              <motion.span layout>
                <Typography>
                  Don't have an account?{" "}
                  <Button
                    onClick={() => {
                      setRegister(true);
                    }}
                  >
                    {"Sign Up"}
                  </Button>
                </Typography>
              </motion.span>
            )}
          </motion.div>
        </AnimateSharedLayout>
      </div>
    </>
  );
};

export default Login;
