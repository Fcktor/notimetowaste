const { BigQuery } = require('@google-cloud/bigquery');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PROJECT_ID = process.env.PROJECT_ID;
const DATASET_ID = process.env.DATASET_ID;
const TABLE_ID = process.env.TABLE_ID;
const SHOP_NAME = process.env.SHOP_NAME;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const URL_PRODUCTS = process.env.URL_PRODUCTS;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const SCHEMA = {
  fields: [
    { name: 'id', type: 'STRING' },
    { name: 'title', type: 'STRING' },
    { name: 'description', type: 'STRING' },
    { name: 'price', type: 'FLOAT' },
    { name: 'compare_at_price', type: 'FLOAT' },
    { name: 'availability', type: 'STRING' },
    { name: 'image_link', type: 'STRING' },
    { name: 'link', type: 'STRING' },
    { name: 'brand', type: 'STRING' },
    { name: 'sku', type: 'STRING' },
    { name: 'barcode', type: 'STRING' },
    { name: 'variant_id', type: 'STRING' },
    { name: 'quantity', type: 'INTEGER' }
  ]
};

const STAGING = TABLE_ID + '_staging';

async function getAccessToken() {
  var response = await axios.post(
    'https://' + SHOP_NAME + '/admin/oauth/access_token',
    { client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'client_credentials' },
    { httpsAgent }
  );
  return response.data.access_token;
}

async function fetchAllProducts(accessToken) {
  var products = [];
  var url = 'https://' + SHOP_NAME + '/admin/api/2024-01/products.json?limit=250';

  while (url) {
    var response = await axios.get(url, {
      httpsAgent,
      headers: { 'X-Shopify-Access-Token': accessToken }
    });

    products = products.concat(response.data.products);

    var linkHeader = response.headers['link'] || '';
    var nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }

  return products;
}

function mapProduct(product) {
  var variant = (product.variants && product.variants[0]) || {};
  return {
    id: product.admin_graphql_api_id,
    title: product.title,
    description: (product.body_html || '').replace(/<[^>]*>/g, ''),
    price: parseFloat(variant.price) || 0,
    compare_at_price: parseFloat(variant.compare_at_price) || 0,
    availability: variant.inventory_quantity > 0 ? 'in stock' : 'out of stock',
    image_link: (product.images && product.images[0]) ? product.images[0].src : '',
    link: (URL_PRODUCTS || '') + product.handle,
    brand: product.vendor || '',
    sku: variant.sku || '',
    barcode: variant.barcode || '',
    variant_id: variant.admin_graphql_api_id || '',
    quantity: variant.inventory_quantity != null ? variant.inventory_quantity : 0
  };
}

exports.productFeedShopify = async function(req, res) {
  var tmpFile = path.join(os.tmpdir(), 'products_staging.json');
  try {
    var accessToken = await getAccessToken();
    var products = await fetchAllProducts(accessToken);
    var rows = products.map(mapProduct);

    var ndjson = rows.map(function(r) { return JSON.stringify(r); }).join('\n');
    fs.writeFileSync(tmpFile, ndjson);

    var bq = new BigQuery({ projectId: PROJECT_ID });

    // 1. Cargar en tabla staging (reemplaza completamente)
    var stagingTable = bq.dataset(DATASET_ID).table(STAGING);
    var loadResult = await stagingTable.load(tmpFile, {
      sourceFormat: 'NEWLINE_DELIMITED_JSON',
      writeDisposition: 'WRITE_TRUNCATE',
      schema: SCHEMA
    });

    var loadJob = loadResult[0];
    if (loadJob.status.errors && loadJob.status.errors.length > 0) {
      throw new Error('BigQuery staging load error: ' + JSON.stringify(loadJob.status.errors));
    }

    var full = '`' + PROJECT_ID + '.' + DATASET_ID + '.' + TABLE_ID + '`';
    var staging = '`' + PROJECT_ID + '.' + DATASET_ID + '.' + STAGING + '`';

    // 2. MERGE: actualiza campos de catálogo pero NO quantity (preserva valores manuales)
    //    Productos nuevos en Shopify sí obtienen su quantity real
    await bq.query({
      query: [
        'MERGE ' + full + ' T',
        'USING ' + staging + ' S ON T.id = S.id',
        'WHEN MATCHED THEN UPDATE SET',
        '  T.title = S.title,',
        '  T.description = S.description,',
        '  T.price = S.price,',
        '  T.compare_at_price = S.compare_at_price,',
        '  T.availability = S.availability,',
        '  T.image_link = S.image_link,',
        '  T.link = S.link,',
        '  T.brand = S.brand,',
        '  T.sku = S.sku,',
        '  T.barcode = S.barcode,',
        '  T.variant_id = S.variant_id',
        'WHEN NOT MATCHED BY TARGET THEN INSERT',
        '  (id, title, description, price, compare_at_price, availability,',
        '   image_link, link, brand, sku, barcode, variant_id, quantity)',
        '  VALUES (S.id, S.title, S.description, S.price, S.compare_at_price,',
        '   S.availability, S.image_link, S.link, S.brand, S.sku, S.barcode,',
        '   S.variant_id, S.quantity)',
        'WHEN NOT MATCHED BY SOURCE THEN DELETE'
      ].join(' ')
    });

    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    res.status(200).send('OK - ' + rows.length + ' productos sincronizados');
  } catch (err) {
    console.error(err.message);
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    res.status(500).send(err.message);
  }
};
