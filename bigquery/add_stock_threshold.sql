-- Ejecutar en BigQuery Console para agregar el campo stock_min_threshold
-- Reemplazar PROJECT_ID, DATASET_ID y TABLE_ID con los valores reales

ALTER TABLE `PROJECT_ID.DATASET_ID.TABLE_ID`
ADD COLUMN IF NOT EXISTS stock_min_threshold INT64 DEFAULT 5;
