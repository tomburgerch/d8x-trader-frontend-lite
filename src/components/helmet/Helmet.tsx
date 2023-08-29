import { Helmet as ReactHelmet } from 'react-helmet-async';

interface HelmetPropsI {
  title?: string;
  description?: string;
}

export const Helmet = ({ title = 'D8X App', description }: HelmetPropsI) => (
  <ReactHelmet encodeSpecialCharacters={false}>
    <meta charSet="utf-8" />

    {title && <title>{title}</title>}
    {description && <meta name="description" content={description} />}

    {/* Twitter MarketplaceCard */}
    <meta name="twitter:card" content="summary_large_image" />
    {description && <meta name="twitter:description" content={description} />}
    {title && <meta name="twitter:title" content={title} />}

    {/* Open Graph */}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="D8X App" />
    {description && <meta property="og:description" content={description} />}
    {title && <meta property="og:title" content={title} />}
  </ReactHelmet>
);
