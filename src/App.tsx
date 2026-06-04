import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { login, logout, tokenRefreshed, refreshAccessToken, getTokenExpiry } from "./store/auth-slice";
import { RootState } from "./store/store";
import { LoadingProvider } from "./LoadingContext";
import { ColorModeProvider } from "./ColorModeContext";

// Eager — present on every page load (homepage, deep-linked artist pages)
import Header from "./components/header/Header";
import Footer from "./components/home/Footer";
import Homepage from "./components/home/Homepage";
import Artist from "./components/artist/Artist";
import ScrollToTop from "./components/shared/ScrollToTop";

// ─── Lazy route chunks ───────────────────────────────────────────────────────

const Auth = lazy(() => import(/* webpackChunkName: "auth" */ "./components/auth/Auth"));
const Calendar = lazy(() => import(/* webpackChunkName: "calendar" */ "./components/calendar/Calendar"));
const EventDetail = lazy(() => import(/* webpackChunkName: "event-detail" */ "./components/calendar/EventDetail"));
const SigningServices = lazy(() => import(/* webpackChunkName: "signing-services" */ "./components/signingservices/SigningServices"));
const News = lazy(() => import(/* webpackChunkName: "news" */ "./components/news/News"));
const NewsArticle = lazy(() => import(/* webpackChunkName: "news-article" */ "./components/news/NewsArticle"));
const ArtistNews = lazy(() => import(/* webpackChunkName: "artist-news" */ "./components/news/ArtistNews"));
const AllCards = lazy(() => import(/* webpackChunkName: "all-cards", webpackPrefetch: true */ "./components/allcards/AllCards"));
const ArtistCardAnalysis = lazy(() => import(/* webpackChunkName: "artist-card-breakdown" */ "./components/artist/ArtistCardBreakdown"));
const RandomFlavorText = lazy(() => import(/* webpackChunkName: "random-flavor-text" */ "./components/randomflavortext/RandomFlavorText"));
const PrivacyPolicy = lazy(() => import(/* webpackChunkName: "privacy-policy" */ "./components/home/PrivacyPolicy"));
const TermsOfService = lazy(() => import(/* webpackChunkName: "terms-of-service" */ "./components/home/TermsOfService"));
const AffiliateDisclosure = lazy(() => import(/* webpackChunkName: "affiliate-disclosure" */ "./components/home/AffiliateDisclosure"));
const ContactPage = lazy(() => import(/* webpackChunkName: "contact" */ "./components/home/Contact"));
const Settings = lazy(() => import(/* webpackChunkName: "settings" */ "./components/settings/Settings"));
const Following = lazy(() => import(/* webpackChunkName: "following" */ "./components/settings/Following"));
const YourCards = lazy(() => import(/* webpackChunkName: "your-cards" */ "./components/settings/YourCards"));
const SigningTracker = lazy(() => import(/* webpackChunkName: "signing-tracker" */ "./components/signingtracker/SigningTracker"));
const ArtistSheet = lazy(() => import(/* webpackChunkName: "artist-sheet" */ "./components/artistsheet/ArtistSheet"));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ "./components/dashboard/Dashboard"));

// Admin-only — routes absent for non-admin sessions so chunks are never fetched
const AddArtist = lazy(() => import(/* webpackChunkName: "admin-add-artist" */ "./components/blogs/AddArtist"));
const EditArtist = lazy(() => import(/* webpackChunkName: "admin-edit-artist" */ "./components/blogs/EditArtist"));
const AdminPostReview = lazy(() => import(/* webpackChunkName: "admin-post-review" */ "./components/socialpostreview/AdminPostReview"));
const NewsReview = lazy(() => import(/* webpackChunkName: "admin-news-review" */ "./components/newsreview/NewsReview"));
const ManualArticleSubmit = lazy(() => import(/* webpackChunkName: "admin-manual-article" */ "./components/newsreview/ManualArticleSubmit"));
const AddEvent = lazy(() => import(/* webpackChunkName: "admin-add-event" */ "./components/blogs/AddEvent"));
const AddArtistToEvent = lazy(() => import(/* webpackChunkName: "admin-add-artist-to-event" */ "./components/blogs/AddArtistToEvent"));
const AnalyticsDashboard = lazy(() => import(/* webpackChunkName: "admin-analytics" */ "./components/analytics/AnalyticsDashboard"));

// ─── Suspense fallback ───────────────────────────────────────────────────────

// Reserves the viewport height so header/footer don't snap together while a
// chunk is in flight. No spinner — avoids a flash for fast connections.
function RouteFallback() {
  return <div style={{ minHeight: 'calc(100vh - 64px)' }} />;
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isAdmin = authUser?.role === 'admin';
  const dispatch = useDispatch();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser && !isLoggedIn) {
      const storedRefreshToken = localStorage.getItem('refreshToken') || '';
      dispatch(login({ token: storedToken, refreshToken: storedRefreshToken, user: JSON.parse(storedUser) }));
      return;
    }

    if (storedToken) {
      const exp = getTokenExpiry(storedToken);
      if (exp && Date.now() / 1000 > exp) {
        refreshAccessToken().then(newToken => {
          if (newToken) {
            dispatch(tokenRefreshed(newToken));
          } else {
            dispatch(logout());
          }
        });
      }
    }
  }, [dispatch, isLoggedIn]);

  return (
    <ColorModeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <LoadingProvider>
          <div>
            <ScrollToTop />
            <header>
              <Header />
            </header>
            <main>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/calendar/:eventId" element={<EventDetail />} />
                  <Route path="/signingservices" element={<SigningServices />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/artist/:artistName" element={<ArtistNews />} />
                  <Route path="/news/:articleId" element={<NewsArticle />} />
                  <Route path="/artist/:name" element={<Artist />} />
                  <Route path="/allcards/:name" element={<AllCards />} />
                  <Route path="/artistcardbreakdown/:name" element={<ArtistCardAnalysis />} />                  
                  <Route path="/randomflavortext" element={<RandomFlavorText />} />
                  <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                  <Route path="/termsofservice" element={<TermsOfService />} />
                  <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/yourcards" element={<YourCards />} />
                  <Route path="/following" element={<Following />} />
                  <Route path="/signingtracker" element={<SigningTracker />} />
                  <Route path="/artistsheet" element={<ArtistSheet />} />
                  {isAdmin && <>
                    <Route path="/add" element={<AddArtist />} />
                    <Route path="/editartist/:artistId" element={<EditArtist />} />
                    <Route path="/reviewsocial" element={<AdminPostReview />} />
                    <Route path="/reviewnews" element={<NewsReview />} />
                    <Route path="/submitarticle" element={<ManualArticleSubmit />} />
                    <Route path="/addevent" element={<AddEvent />} />
                    <Route path="/addartisttoevent" element={<AddArtistToEvent />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                  </>}
                </Routes>
              </Suspense>
            </main>
            <footer>
              <Footer />
            </footer>
          </div>
        </LoadingProvider>
      </LocalizationProvider>
    </ColorModeProvider>
  );
}

export default App;
