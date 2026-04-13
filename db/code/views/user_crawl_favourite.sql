DROP VIEW IF EXISTS user_crawl_favourite;

CREATE OR REPLACE VIEW user_crawl_favourite
AS
SELECT
    user_favourite_id.user_id,
    user_favourite_id.crawl_id,
    venue.venue_id,
    venue.venue_name
FROM (
    SELECT
        DISTINCT ON(crawl_visit_view.user_id, crawl_visit_view.crawl_id)
        crawl_visit_view.user_id,
        crawl_visit_view.crawl_id,
        crawl_visit_view.venue_id
    FROM crawl_visit_view
    INNER JOIN (
        SELECT
            crawl_visit_view.user_id,
            crawl_visit_view.crawl_id,
            MAX(crawl_visit_view.rating) AS rating
        FROM crawl_visit_view
        GROUP BY user_id, crawl_id
    ) user_max_rating
    ON crawl_visit_view.user_id = user_max_rating.user_id
    AND crawl_visit_view.rating = user_max_rating.rating
    ORDER BY
        crawl_visit_view.user_id,
        crawl_visit_view.crawl_id,
        crawl_visit_view.visit_date
) user_favourite_id
INNER JOIN venue
ON user_favourite_id.venue_id = venue.venue_id;