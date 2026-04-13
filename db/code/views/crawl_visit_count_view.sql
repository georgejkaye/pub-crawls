DROP VIEW IF EXISTS crawl_visit_count_view;

CREATE OR REPLACE VIEW crawl_visit_count_view
AS
SELECT
    crawl_visit_view.crawl_id,
    crawl_visit_view.venue_id,
    COUNT(DISTINCT crawl_visit_view.visit_date) AS visit_count,
    COUNT(DISTINCT crawl_visit_view.user_id) AS user_visit_count
FROM crawl_visit_view
GROUP BY
    crawl_visit_view.crawl_id,
    crawl_visit_view.venue_id;