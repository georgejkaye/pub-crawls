CREATE OR REPLACE VIEW visit_view
AS
SELECT
    visit.visit_id,
    visit.user_id,
    app_user.display_name,
    venue.venue_id,
    venue.venue_name,
    visit.visit_date,
    visit.notes,
    visit.rating,
    visit.drink,
    visit_crawls.crawls
FROM visit
INNER JOIN app_user
ON visit.user_id = app_user.user_id
INNER JOIN venue
ON visit.venue_id = venue.venue_id
INNER JOIN (
    SELECT
        crawl_detail.visit_id,
        ARRAY_AGG(
            (
                crawl_detail.crawl_id,
                crawl_detail.crawl_name,
                crawl_detail.crawl_bg,
                crawl_detail.crawl_fg,
                crawl_detail.visit_no
            )::visit_crawl_data
        ) AS crawls
    FROM (
        SELECT
            visit.visit_id,
            crawl.crawl_id,
            crawl.crawl_name,
            crawl.crawl_bg,
            crawl.crawl_fg,
            ROW_NUMBER() OVER (
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
        ON visit.venue_id = crawl_venue.venue_id
        AND visit.visit_date::date <@ crawl.crawl_dates
    ) crawl_detail
    GROUP BY crawl_detail.visit_id
) visit_crawls
ON visit.visit_id = visit_crawls.visit_id;