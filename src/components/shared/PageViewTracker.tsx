import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOG_PAGE_VIEW } from '../graphql/mutations';

// First-party page load counter, independent of Google Analytics/cookie
// consent — gives a ground-truth number to sanity-check GA against.
const PageViewTracker = () => {
  const { pathname } = useLocation();
  const [logPageView] = useMutation(LOG_PAGE_VIEW);

  useEffect(() => {
    logPageView({ variables: { path: pathname } });
  }, [pathname, logPageView]);

  return null;
};

export default PageViewTracker;
