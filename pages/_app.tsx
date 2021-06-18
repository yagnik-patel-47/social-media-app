import "../styles/globals.css";
// import "tailwindcss/tailwind.css";
import { AppProps } from "next/app";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/blue";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import Login from "../components/Login";
import Loading from "../components/Loading";
import { Provider } from "react-redux";
import store from "../store";
import SideBar from "../components/SideBar";

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [logged, setLogged] = useState<boolean>(true);
  const [user, loading] = useAuthState(auth);

  const theme = createMuiTheme({
    palette: {
      type: "dark",
      secondary: {
        main: blue[400],
      },
    },
  });

  useEffect(() => {
    if (!user) {
      setLogged(false);
    }
  }, [user]);

  if (loading)
    return (
      <ThemeProvider theme={theme}>
        <Loading />
      </ThemeProvider>
    );

  if (!(logged && user))
    return (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <Login setLogged={setLogged} />
        </Provider>
      </ThemeProvider>
    );

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <div className="flex h-full w-full">
          <SideBar />
          <Component {...pageProps} />
        </div>
      </Provider>
    </ThemeProvider>
  );
};

export default MyApp;
