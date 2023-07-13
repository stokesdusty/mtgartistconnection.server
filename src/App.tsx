import { Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/home/Footer";
import Homepage from "./components/home/Homepage";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { authActions } from "./store/auth-slice";
import AddArtist from "./components/blogs/AddArtist";
import Calendar from "./components/calendar/Calendar";
import SigningServices from "./components/signingservices/SigningServices";
import Auth from "./components/auth/Auth";
import Artist from "./components/artist/Artist";
import AllCards from "./components/allcards/AllCards";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const data: string = localStorage.getItem("userData") as string;
    if(JSON.parse(data) !== null) {
      dispatch(authActions.login());
    }
  });
  return (
    <div >
      <header>
        <Header />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/signingservices" element={<SigningServices />} />
          <Route path="/add" element={<AddArtist />} />
          <Route path="/artist/:name" element={<Artist />} />
          <Route path="/allcards/:name" element={<AllCards />} />
        </Routes>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
