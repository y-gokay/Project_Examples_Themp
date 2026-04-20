import { Helmet } from "react-helmet-async";

const SITE_NAME = "ATİM - Atakum Belediyesi İstihdam Merkezi";
const SITE_URL = "https://atim.atakum.bel.tr";
const DEFAULT_DESCRIPTION =
  "Atakum Belediyesi İstihdam Merkezi (ATİM), Samsun Atakum'da iş arayanlar ile işverenleri ücretsiz olarak buluşturur.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * SEO Head Component - Sayfa bazlı meta tag yönetimi
 *
 * @param {Object} props
 * @param {string} props.title - Sayfa başlığı
 * @param {string} [props.description] - Sayfa açıklaması
 * @param {string} [props.path] - Sayfa yolu (ör: "/ilanlar")
 * @param {string} [props.image] - OG image URL
 * @param {string} [props.type] - OG type (varsayılan: "website")
 * @param {Object} [props.jsonLd] - Sayfaya özel JSON-LD verisi
 * @param {boolean} [props.noindex] - Sayfayı indexleme (varsayılan: false)
 */
const SEOHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  image = DEFAULT_IMAGE,
  type = "website",
  jsonLd,
  noindex = false,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="tr_TR" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Sayfa bazlı JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
export { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_IMAGE };
