import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'MtG Artist Connection';
const DEFAULT_IMAGE = 'https://www.mtgartistconnection.com/logo.png';
const BASE_URL = 'https://www.mtgartistconnection.com';

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  jsonLd?: object;
}

const PageMeta = ({ title, description, path, image = DEFAULT_IMAGE, jsonLd }: PageMetaProps) => {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default PageMeta;
