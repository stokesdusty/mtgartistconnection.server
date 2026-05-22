import { Route, Routes } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/home/Footer";
import Homepage from "./components/home/Homepage";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { login } from "./store/auth-slice";
import AddArtist from "./components/blogs/AddArtist";
import EditArtist from "./components/blogs/EditArtist";
import AdminPostReview from "./components/socialpostreview/AdminPostReview";
import NewsReview from "./components/newsreview/NewsReview";
import ManualArticleSubmit from "./components/newsreview/ManualArticleSubmit";
import News from "./components/news/News";
import NewsArticle from "./components/news/NewsArticle";
import ArtistNews from "./components/news/ArtistNews";
import Calendar from "./components/calendar/Calendar";
import EventDetail from "./components/calendar/EventDetail";
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
import AffiliateDisclosure from "./components/home/AffiliateDisclosure";
import ArtistCardAnalysis from "./components/artist/ArtistCardBreakdown";
import { LoadingProvider } from "./LoadingContext";
import Settings from "./components/settings/Settings";
import Following from "./components/settings/Following";
import YourCards from "./components/settings/YourCards";
import ScrollToTop from "./components/shared/ScrollToTop";

function App() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const dispatch = useDispatch();
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser && !isLoggedIn) {
      const user = JSON.parse(storedUser);
      dispatch(login({ token: storedToken, user }));
    }
  }, [dispatch, isLoggedIn]);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <LoadingProvider>
        <div>
          <ScrollToTop />
          <header>
            <Header />
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/calendar/:eventId" element={<EventDetail />} />
              <Route path="/signingservices" element={<SigningServices />} />
              <Route path="/add" element={<AddArtist />} />
              <Route path="/reviewsocial" element={<AdminPostReview />} />
              <Route path="/reviewnews" element={<NewsReview />} />
              <Route path="/submitarticle" element={<ManualArticleSubmit />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/artist/:artistName" element={<ArtistNews />} />
              <Route path="/news/:articleId" element={<NewsArticle />} />
              <Route path="/editartist/:artistId" element={<EditArtist />} />
              <Route path="/addevent" element={<AddEvent />} />
              <Route path="/addartisttoevent" element={<AddArtistToEvent />} />
              <Route path="/artist/:name" element={<Artist />} />
              <Route path="/allcards/:name" element={<AllCards />} />
              <Route path="/markscalendar" element={<MarksCalendar />} />
              <Route path="/randomflavortext" element={<RandomFlavorText />} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/termsofservice" element={<TermsOfService />} />
              <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/artistcardbreakdown/:name" element={<ArtistCardAnalysis />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/yourcards" element={<YourCards />} />
              <Route path="/following" element={<Following />} />
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
