import { Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/home/Footer";
import Homepage from "./components/home/Homepage";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { login } from "./store/auth-slice";
import AddArtist from "./components/blogs/AddArtist";
import Calendar from "./components/calendar/Calendar";
import SigningServices from "./components/signingservices/SigningServices";
import Auth from "./components/auth/Auth";
import Artist from "./components/artist/Artist";
import AllCards from "./components/allcards/AllCards";
import MarksCalendar from "./components/markscalendar/MarksCalendar";
import AddEvent from "./components/blogs/AddEvent";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import AddArtistToEvent from "./components/blogs/AddArtistToEvent";
import RandomFlavorText from "./components/randomflavortext/RandomFlavorText";
import { RootState } from "./store/store";
import PrivacyPolicy from "./components/home/PrivacyPolicy";
import TermsOfService from "./components/home/TermsOfService";
import ContactPage from "./components/home/Contact";
import ArtistCardAnalysis from "./components/artist/ArtistCardBreakdown";
import { LoadingProvider } from "./LoadingContext";

function App() {
  const isLoggedIn = useSelector((state: RootState) => state.isLoggedIn);
  const dispatch = useDispatch();
  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      const data = JSON.parse(storedData);
      if (data && !isLoggedIn) {
        dispatch(login());
      }
    }
  }, [dispatch, isLoggedIn]);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <LoadingProvider>
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
              <Route path="/addevent" element={<AddEvent />} />
              <Route path="/addartisttoevent" element={<AddArtistToEvent />} />
              <Route path="/artist/:name" element={<Artist />} />
              <Route path="/allcards/:name" element={<AllCards />} />
              <Route path="/markscalendar" element={<MarksCalendar />} />
              <Route path="/randomflavortext" element={<RandomFlavorText />} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/termsofservice" element={<TermsOfService />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/artistcardbreakdown/:name" element={<ArtistCardAnalysis />} />
            </Routes>
          </main>
          <footer>
            <Footer />
          </footer>
        </div>
      </LoadingProvider>
    </LocalizationProvider>
  );
}

export default App;
