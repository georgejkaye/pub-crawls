DROP VIEW IF EXISTS crawl_visit_count_view;

CREATE OR REPLACE VIEW crawl_visit_count_view
AS
SELECT
    crawl_visit.crawl_id,
    crawl_visit.venue_id,
    COUNT(DISTINCT crawl_visit.visit_date) AS visit_count,
    COUNT(DISTINCT crawl_visit.user_id) AS user_visit_count
FROM crawl_visit
GROUP BY
    crawl_visit.crawl_id,
    crawl_visit.venue_id;