-- OPALIA.HR DATA FLUSH SCRIPT
-- WARNING: This will delete all imported and processed HR data for testing purposes.

BEGIN;

TRUNCATE TABLE fact_absence CASCADE;
TRUNCATE TABLE fact_employee CASCADE;
TRUNCATE TABLE departure_analysis CASCADE;
TRUNCATE TABLE etl_metadata CASCADE;
TRUNCATE TABLE predictions_log CASCADE;

-- Optional: reset sequences if any
-- ALTER SEQUENCE fact_absence_id_seq RESTART WITH 1;

COMMIT;

SELECT 'DATA FLUSHED SUCCESSFULLY. SYSTEM READY FOR NEW ETL TEST.' as status;
