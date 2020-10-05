const fs = require("fs");
const path = require("path");
const indexFileForStore = "../../client_store/build/index.html";
const indexFileForMain = "../../client_main/build/index.html";
const { siteName, motto } = require("../config/siteDetails");

/**
 * Function is used to configure meta tags in React public/index.html file
 * @param {object=} req refers the request obj, where the hostname can be gotten from
 * @param {string=} page refers to which index.html to use - 'main' or 'store'
 * @param {object=} pageDetails which includes url, title, description, keywords, author, imageUrl
 * @returns {string} the html file with the applied configurations
 */
const configMeta = (req, page, pageDetails) => {
  const url = `${req.protocol}://${req.hostname}${req.url}`;
  const {
    title = `${siteName} - ${motto}`,
    description = `${siteName} - ${motto}`,
    keywords = "",
    author = "Benjamin Busari and Dillion Megida",
    imageUrl = "%PUBLIC_URL%/assets/img/logo.png",
  } = pageDetails;
  let index;
  if (page === "store") {
    index = indexFileForStore;
  } else {
    index = indexFileForMain;
  }

  try {
    const replacements =
    `<link rel='canonical' href='${url}' />` + `<title>${title}</title>` + 
    `<meta name='description' content='${description}' />` +
    `<meta name="theme-color" content="#000000" />` +
    `<meta name='keywords' content='market, skulmart, school market, ${keywords}' />` +
    `<meta name='author' content='Benjamin Busari and Dillion Megida' />` +
    `<meta property='og:image' content='${imageUrl}' />` +
    `<meta property='og:url' content='ecommerce' />` +
    `<meta property="og:title" content='${title}'} />` +
    `<meta property="og:description" content='${description}' />` +
    `<meta name="twitter:card" content="summary" />` +
    `<meta name="twitter:site" content="@benjamin" />` +
    `<meta name="twitter:title" content='${title}' />` +
    `<meta name="twitter:description" content='${description}' />` +
    `<meta name="twitter:image" content='${imageUrl}' />` +
    `<meta name="twitter:creator" content="@benjamin" />`;

    let configuredFile = fs
      .readFileSync(path.join(__dirname, index))
      .toString();
    configuredFile = configuredFile.replace(
      "<title>Connecting buyers with sellers</title>",
      replacements
    );

    return configuredFile;
  } catch (err) {
    console.log(`Error in config-meta: ${err}`);
  }
};

module.exports = configMeta;
