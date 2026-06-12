-- Reemplazar PROJECT_ID, DATASET_ID y TABLE_ID con los valores reales de GCP
-- Ejecutar en BigQuery Console o con bq CLI:
--   bq query --use_legacy_sql=false < watches_table.sql

CREATE TABLE IF NOT EXISTS `PROJECT_ID.DATASET_ID.TABLE_ID` (
  id               STRING    NOT NULL,
  sku              STRING    NOT NULL,
  brand            STRING    NOT NULL,
  model            STRING    NOT NULL,
  price            FLOAT64   NOT NULL,
  compare_at_price FLOAT64,
  stock            INT64     NOT NULL DEFAULT 0,
  condition        STRING    NOT NULL,  -- Nuevo | Vintage
  style            STRING    NOT NULL,  -- Sport | Dress | Casual
  movement         STRING,              -- Cuarzo | Automático | Solar
  case_diameter_mm FLOAT64,
  case_material    STRING,
  strap_material   STRING,
  dial_color       STRING,
  water_resistance_m INT64,
  gender           STRING,              -- Hombre | Mujer | Unisex
  description      STRING,
  image_url        STRING,
  available        BOOL      NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP NOT NULL,
  updated_at       TIMESTAMP NOT NULL
);
