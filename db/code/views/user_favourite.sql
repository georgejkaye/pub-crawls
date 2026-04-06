DROP VIEW user_favourite;

CREATE OR REPLACE VIEW user_favourite
AS
SELECT
    user_favourite_id.user_id,
    venue.venue_id,
    venue.venue_name
FROM (
    SELECT
        DISTINCT ON(visit.user_id)
        visit.user_id,
        visit.venue_id
    FROM visit
    INNER JOIN (
        SELECT
            visit.user_id,
            MAX(visit.rating) AS rating
        FROM visit
        GROUP BY user_id
    ) user_max_rating
    ON visit.user_id = user_max_rating.user_id
    AND visit.rating = user_max_rating.rating
    ORDER BY
        visit.user_id,
        visit.visit_date
) user_favourite_id
INNER JOIN venue
ON user_favourite_id.venue_id = venue.venue_id;