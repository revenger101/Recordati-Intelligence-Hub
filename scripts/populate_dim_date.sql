-- ==========================================
-- OPALIA.HR: Populate Calendar (dim_date)
-- ==========================================
-- This script generates sequential dates from 2015-01-01 to 2035-12-31
-- and populates the dimension required by Power BI DAX expressions.

INSERT INTO dim_date (date_id, full_date, day_name, month_name, month_number, year, quarter, is_weekend, is_holiday)
SELECT 
    TO_CHAR(datum, 'YYYYMMDD')::INT AS date_id,
    datum AS full_date,
    TO_CHAR(datum, 'Day') AS day_name,
    TO_CHAR(datum, 'Month') AS month_name,
    EXTRACT(MONTH FROM datum) AS month_number,
    EXTRACT(YEAR FROM datum) AS year,
    EXTRACT(QUARTER FROM datum) AS quarter,
    CASE WHEN EXTRACT(ISODOW FROM datum) IN (6, 7) THEN true ELSE false END AS is_weekend,
    false AS is_holiday
FROM (
    -- Generate dates from Jan 1, 2015 to Dec 31, 2035
    SELECT '2015-01-01'::DATE + sequence.day AS datum
    FROM generate_series(0, (DATE '2035-12-31' - DATE '2015-01-01')) AS sequence(day)
    GROUP BY sequence.day
) dq
ON CONFLICT (date_id) DO NOTHING;

-- Populate basic French Holidays (Example)
UPDATE dim_date SET is_holiday = true WHERE month_number = 1 AND EXTRACT(DAY FROM full_date) = 1; -- Jour de l'An
UPDATE dim_date SET is_holiday = true WHERE month_number = 5 AND EXTRACT(DAY FROM full_date) = 1; -- Fête du Travail
UPDATE dim_date SET is_holiday = true WHERE month_number = 7 AND EXTRACT(DAY FROM full_date) = 14; -- Fête Nationale
UPDATE dim_date SET is_holiday = true WHERE month_number = 12 AND EXTRACT(DAY FROM full_date) = 25; -- Noël
