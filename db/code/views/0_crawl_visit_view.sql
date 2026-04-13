CREATE OR REPLACE VIEW crawl_visit_view
AS
SELECT
    crawl.crawl_id,
    visit.visit_id,
    visit.user_id,
    visit.venue_id,
    visit.rating,
    visit.visit_date,
    row_number() OVER (
        PARTITION BY
            visit.user_id,
            visit.venue_id,
            crawl.crawl_id
        ORDER BY visit_date
    ) AS visit_no
FROM crawl
INNER JOIN crawl_venue
ON crawl.crawl_id = crawl_venue.crawl_id
INNER JOIN visit
ON crawl_venue.venue_id = visit.venue_id
AND visit.visit_date::date <@ crawl.crawl_dates;