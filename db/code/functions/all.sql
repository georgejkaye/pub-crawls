DROP FUNCTION IF EXISTS insert_user;
DROP FUNCTION IF EXISTS insert_crawl;
DROP FUNCTION IF EXISTS insert_crawls;
DROP FUNCTION IF EXISTS insert_venue;
DROP FUNCTION IF EXISTS insert_venues;
DROP FUNCTION IF EXISTS insert_visit;
DROP FUNCTION IF EXISTS update_visit;
DROP FUNCTION IF EXISTS select_user_by_user_id;
DROP FUNCTION IF EXISTS select_user_by_email;
DROP FUNCTION IF EXISTS select_venues;
DROP FUNCTION IF EXISTS select_venues_by_user;
DROP FUNCTION IF EXISTS select_visits;
DROP FUNCTION IF EXISTS select_visit;
DROP FUNCTION IF EXISTS select_user_summary;
DROP FUNCTION IF EXISTS select_user_counts;
DROP FUNCTION IF EXISTS update_user;

DROP FUNCTION IF EXISTS update_user_display_name;
DROP FUNCTION IF EXISTS delete_user;

CREATE OR REPLACE FUNCTION insert_user (
    p_email TEXT,
    p_display_name TEXT,
    p_hashed_password TEXT
)
RETURNS user_data
LANGUAGE SQL
AS
$$
INSERT INTO app_user (
    email,
    display_name,
    hashed_password,
    is_active,
    is_superuser,
    is_verified
)
VALUES (
    p_email,
    p_display_name,
    p_hashed_password,
    TRUE,
    FALSE,
    FALSE
)
RETURNING (
    user_id,
    email,
    display_name,
    hashed_password,
    is_active,
    is_superuser,
    is_verified,
    last_verify_request)
$$;

CREATE OR REPLACE FUNCTION insert_crawl (
    p_crawl_name TEXT_NOTNULL,
    p_start_date TIMESTAMP_NOTNULL,
    p_end_date TIMESTAMP_NOTNULL,
    p_is_public BOOLEAN_NOTNULL,
    p_crawl_bg TEXT,
    p_crawl_fg TEXT
)
RETURNS SETOF insert_crawl_result
LANGUAGE PLPGSQL
AS
$$
DECLARE
    v_existing_crawl_id INTEGER_NOTNULL := -1;
BEGIN
    IF EXISTS(SELECT * FROM crawl WHERE crawl_name = p_crawl_name)
    THEN
        SELECT crawl_id INTO v_existing_crawl_id
        FROM crawl
        WHERE crawl_name = p_crawl_name;

        RETURN QUERY SELECT v_existing_crawl_id;
    ELSE
        INSERT INTO crawl (
            crawl_name,
            crawl_dates,
            is_public,
            crawl_bg,
            crawl_fg
        )
        VALUES (
            p_crawl_name,
            DATERANGE(
                DATE_TRUNC('day', p_start_date)::date,
                DATE_TRUNC('day', p_end_date)::date
            ),
            p_is_public,
            p_crawl_bg,
            p_crawl_fg
        )
        RETURNING crawl_id INTO v_existing_crawl_id;

        RETURN QUERY SELECT v_existing_crawl_id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION insert_crawls (
    p_crawls crawl_input_data[]
)
RETURNS VOID
LANGUAGE SQL
AS
$$
INSERT INTO crawl (
    crawl_name,
    crawl_dates,
    is_public,
    crawl_bg,
    crawl_fg
)
SELECT
    v_crawl.crawl_name,
    DATERANGE(
        DATE_TRUNC('day', v_crawl.start_date)::date,
        DATE_TRUNC('day', V_crawl.end_date)::date
    ),
    v_crawl.is_public,
    v_crawl.crawl_bg,
    v_crawl.crawl_fg
FROM UNNEST(p_crawls) AS v_crawl;
$$;

CREATE OR REPLACE FUNCTION insert_venue (
    p_venue_name TEXT,
    p_address TEXT,
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_crawl_ids INTEGER_NOTNULL[],
    p_facts venue_fact_data_notnull[]
)
RETURNS SETOF insert_venue_result
LANGUAGE PLPGSQL
AS
$$
DECLARE
    v_venue_id INTEGER_NOTNULL := -1;
BEGIN
    IF EXISTS (
        SELECT * FROM venue
        WHERE venue_name = p_venue_name
        AND venue_address = p_address
    ) THEN
        SELECT venue_id
        INTO v_venue_id
        FROM venue;
    ELSE
        INSERT INTO venue (
            venue_name,
            venue_address,
            latitude,
            longitude
        )
        VALUES (
            p_venue_name,
            p_address,
            p_latitude,
            p_longitude
        )
        ON CONFLICT (venue_name, venue_address) DO NOTHING
        RETURNING venue_id INTO v_venue_id;
    END IF;

    INSERT INTO crawl_venue (
        crawl_id,
        venue_id
    )
    SELECT
        v_crawl_id,
        v_venue_id
    FROM UNNEST(p_crawl_ids)
    AS v_crawl_id
    ON CONFLICT DO NOTHING;

    INSERT INTO venue_fact (
        venue_id,
        fact_key,
        fact_value
    )
    SELECT
        v_venue_id,
        v_fact.fact_key,
        v_fact.fact_value
    FROM UNNEST(p_facts)
    AS v_fact
    ON CONFLICT DO NOTHING;

    RETURN QUERY SELECT v_venue_id;
END;
$$;

CREATE OR REPLACE FUNCTION insert_venues (
    p_venues venue_input_data[]
)
RETURNS VOID
LANGUAGE PLPGSQL
AS
$$
DECLARE
    v_venue_id INTEGER_NOTNULL := -1;
BEGIN
    FOR i IN 1 .. CARDINALITY(p_venues) LOOP
        PERFORM insert_venue(
            p_venues[i].venue_name,
            p_venues[i].venue_address,
            p_venues[i].latitude,
            p_venues[i].longitude,
            p_venues[i].crawl_ids,
            p_venues[i].facts
        );
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION insert_visit (
    p_user_id INTEGER,
    p_venue_id INTEGER,
    p_visit_date TIMESTAMP WITH TIME ZONE,
    p_notes TEXT,
    p_rating INTEGER,
    p_drink TEXT
)
RETURNS insert_visit_result
LANGUAGE SQL
AS
$$
INSERT INTO visit (
    user_id,
    venue_id,
    visit_date,
    notes,
    rating,
    drink
)
VALUES (
    p_user_id,
    p_venue_id,
    p_visit_date,
    p_notes,
    p_rating,
    p_drink
)
RETURNING visit_id AS new_visit_id;
$$;

CREATE OR REPLACE FUNCTION update_visit (
    p_user_id INTEGER,
    p_visit_id INTEGER,
    p_notes TEXT,
    p_rating INTEGER,
    p_drink TEXT
)
RETURNS VOID
LANGUAGE SQL
AS
$$
UPDATE visit
SET
    notes = p_notes,
    rating = p_rating,
    drink = p_drink
WHERE visit_id = p_visit_id
AND user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION delete_visit (
    p_user_id INTEGER_NOTNULL,
    p_visit_id INTEGER_NOTNULL
)
RETURNS VOID
LANGUAGE SQL
AS
$$
DELETE FROM visit
WHERE user_id = p_user_id
AND visit_id = p_visit_id;
$$;

CREATE OR REPLACE FUNCTION select_user_by_user_id (
    p_user_id INTEGER
)
RETURNS SETOF user_data
LANGUAGE SQL
AS
$$
SELECT
    app_user.user_id,
    app_user.email,
    app_user.display_name,
    app_user.hashed_password,
    app_user.is_active,
    app_user.is_superuser,
    app_user.is_verified,
    app_user.last_verify_request
FROM app_user
WHERE app_user.user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION select_user_by_email (
    p_email TEXT
)
RETURNS SETOF user_data
LANGUAGE SQL
AS
$$
SELECT
    app_user.user_id,
    app_user.email,
    app_user.display_name,
    app_user.hashed_password,
    app_user.is_active,
    app_user.is_superuser,
    app_user.is_verified,
    app_user.last_verify_request
FROM app_user
WHERE app_user.email = p_email;
$$;

CREATE OR REPLACE FUNCTION select_venues (
    p_user_id INTEGER
)
RETURNS SETOF venue_data
LANGUAGE SQL
AS
$$
SELECT
    venue.venue_id,
    venue.venue_name,
    venue.venue_address,
    venue.latitude,
    venue.longitude,
    COALESCE(
        venue_crawl.crawls,
        ARRAY[]::venue_crawl_data_notnull[]
    ) AS crawls,
    COALESCE(visit_count.users_visited, 0) AS users_visited,
    COALESCE(visit_count.total_visits, 0) AS total_visits,
    visit_count.average_rating,
    COALESCE(
        venue_fact.facts,
        ARRAY[]::venue_fact_data_notnull[]
    ) AS facts
FROM venue
LEFT JOIN (
    SELECT
        crawl_venue.venue_id,
        ARRAY_AGG(
            (
                crawl.crawl_id,
                crawl.crawl_name,
                LOWER(crawl.crawl_dates),
                UPPER(crawl.crawl_dates),
                crawl.crawl_bg,
                crawl.crawl_fg,
                COALESCE(crawl_visit_count_view.visit_count, 0),
                COALESCE(crawl_visit_count_view.user_visit_count, 0)
            )::venue_crawl_data
            ORDER BY crawl.crawl_dates
        ) AS crawls
    FROM crawl_venue
    INNER JOIN crawl
    ON crawl_venue.crawl_id = crawl.crawl_id
    LEFT JOIN crawl_visit_count_view
    ON crawl_venue.crawl_id = crawl_visit_count_view.crawl_id
    AND crawl_venue.venue_id = crawl_visit_count_view.venue_id
    LEFT JOIN crawl_user
    ON crawl.crawl_id = crawl_user.crawl_id
    WHERE p_user_id IS NULL OR crawl_user.user_id = p_user_id
    GROUP BY crawl_venue.venue_id
) venue_crawl
ON venue.venue_id = venue_crawl.venue_id
LEFT JOIN (
    SELECT
        visit.venue_id,
        COUNT(DISTINCT user_id) AS users_visited,
        COUNT(*) AS total_visits,
        ROUND(AVG(rating), 2) AS average_rating
    FROM visit
    GROUP BY visit.venue_id
) visit_count
ON venue.venue_id = visit_count.venue_id
LEFT JOIN (
    SELECT
        venue_fact.venue_id,
        ARRAY_AGG(
            (
                venue_fact.fact_key,
                venue_fact.fact_value
            )::venue_fact_data
            ORDER BY venue_fact.fact_key
        ) AS facts
    FROM venue_fact
    GROUP BY venue_fact.venue_id
) venue_fact
ON venue.venue_id = venue_fact.venue_id;
$$;

CREATE OR REPLACE FUNCTION select_venues_by_crawl_id (
    p_crawl_id INTEGER_NOTNULL
)
RETURNS SETOF crawl_venue_data
LANGUAGE SQL
AS
$$
SELECT
    venue.venue_id,
    venue.venue_name,
    venue.venue_address,
    venue.latitude,
    venue.longitude,
    COALESCE(venue_visit.visits, ARRAY[]::crawl_venue_visit_data[]) AS visits
FROM venue
LEFT JOIN (
    SELECT
        visit_view.venue_id,
        ARRAY_AGG(
            (
                visit_view.visit_id,
                visit_view.user_id,
                visit_view.display_name,
                visit_view.visit_date,
                visit_view.notes,
                visit_view.rating,
                visit_view.drink
            )::crawl_venue_visit_data
        ) AS visits
    FROM visit_view
    INNER JOIN crawl_visit
    ON visit_view.visit_id = crawl_visit.visit_id
    WHERE crawl_visit.crawl_id = p_crawl_id
    GROUP BY visit_view.venue_id
) venue_visit
ON venue.venue_id = venue_visit.venue_id
INNER JOIN crawl_venue
ON venue.venue_id = crawl_venue.venue_id
WHERE crawl_venue.crawl_id = p_crawl_id
ORDER BY venue.venue_name ASC;
$$;


CREATE OR REPLACE FUNCTION select_venue_by_venue_id (
    p_user_id INTEGER,
    p_venue_id INTEGER_NOTNULL
)
RETURNS SETOF single_venue_data
LANGUAGE SQL
AS
$$
SELECT
    venue.venue_id,
    venue.venue_name,
    venue.venue_address,
    venue.latitude,
    venue.longitude,
    COALESCE(venue_crawl.crawls, ARRAY[]::venue_crawl_data_notnull[]) AS crawls,
    COALESCE(venue_visit.visits, ARRAY[]::venue_visit_data_notnull[]) AS visits,
    COALESCE(venue_fact.facts, ARRAY[]::venue_fact_data_notnull[]) AS facts
FROM venue
LEFT JOIN (
    SELECT
        crawl_venue.venue_id,
        ARRAY_AGG(
            (
                crawl.crawl_id,
                crawl.crawl_name,
                LOWER(crawl.crawl_dates),
                UPPER(crawl.crawl_dates),
                crawl.crawl_bg,
                crawl.crawl_fg,
                crawl_visit_count_view.visit_count,
                crawl_visit_count_view.user_visit_count
            )::venue_crawl_data
        ) AS crawls
    FROM crawl_venue
    INNER JOIN crawl
    ON crawl_venue.crawl_id = crawl.crawl_id
    LEFT JOIN crawl_visit_count_view
    ON crawl_venue.crawl_id = crawl_visit_count_view.crawl_id
    AND crawl_venue.venue_id = crawl_visit_count_view.venue_id
    LEFT JOIN crawl_user
    ON crawl.crawl_id = crawl_user.crawl_id
    WHERE p_user_id IS NULL OR crawl_user.user_id = p_user_id
    GROUP BY crawl_venue.venue_id
) venue_crawl
ON venue.venue_id = venue_crawl.venue_id
LEFT JOIN (
    SELECT
        visit_view.venue_id,
        ARRAY_AGG(
            (
                visit_view.visit_id,
                visit_view.user_id,
                visit_view.display_name,
                visit_view.visit_date,
                visit_view.notes,
                visit_view.rating,
                visit_view.drink,
                visit_view.crawls
            )::venue_visit_data
        ) AS visits
    FROM visit_view
    GROUP BY visit_view.venue_id
) venue_visit
ON venue.venue_id = venue_visit.venue_id
LEFT JOIN (
    SELECT
        venue_fact.venue_id,
        ARRAY_AGG(
            (
                venue_fact.fact_key,
                venue_fact.fact_value
            )::venue_fact_data
        ) AS facts
    FROM venue_fact
    GROUP BY venue_fact.venue_id
) venue_fact
ON venue.venue_id = venue_fact.venue_id
WHERE venue.venue_id = p_venue_id;
$$;

CREATE OR REPLACE FUNCTION select_venues_by_user (
    p_user_id INTEGER_NOTNULL
)
RETURNS SETOF user_venue_data
LANGUAGE SQL
AS
$$
SELECT
    venue.venue_id,
    venue.venue_name,
    venue.venue_address,
    venue.latitude,
    venue.longitude,
    COALESCE(venue_crawl.crawls, ARRAY[]::venue_crawl_data_notnull[]) AS visits,
    COALESCE(venue_visit.visits, ARRAY[]::user_venue_visit_data_notnull[]) AS visits
FROM venue
LEFT JOIN (
    SELECT
        crawl_venue.venue_id,
        ARRAY_AGG(
            (
                crawl.crawl_id,
                crawl.crawl_name,
                LOWER(crawl.crawl_dates),
                UPPER(crawl.crawl_dates),
                crawl.crawl_bg,
                crawl.crawl_fg,
                crawl_visit_count_view.visit_count,
                crawl_visit_count_view.user_visit_count
            )::venue_crawl_data
        ) AS crawls
    FROM crawl_venue
    INNER JOIN crawl
    ON crawl_venue.crawl_id = crawl.crawl_id
    LEFT JOIN crawl_visit_count_view
    ON crawl_venue.crawl_id = crawl_visit_count_view.crawl_id
    AND crawl_venue.venue_id = crawl_visit_count_view.venue_id
    LEFT JOIN crawl_user
    ON crawl.crawl_id = crawl_user.crawl_id
    WHERE p_user_id IS NULL OR crawl_user.user_id = p_user_id
    GROUP BY crawl_venue.venue_id
) venue_crawl
ON venue.venue_id = venue_crawl.venue_id
INNER JOIN (
    SELECT
        visit_view.venue_id,
        ARRAY_AGG(
            (
                visit_view.visit_id,
                visit_view.visit_date,
                visit_view.notes,
                visit_view.rating,
                visit_view.drink,
                visit_view.crawls
            )::user_venue_visit_data
        ) AS visits
    FROM visit_view
    WHERE visit_view.user_id = p_user_id
    GROUP BY visit_view.venue_id
) venue_visit
ON venue.venue_id = venue_visit.venue_id;
$$;

CREATE OR REPLACE FUNCTION select_visits ()
RETURNS SETOF visit_data
LANGUAGE SQL
AS
$$
SELECT
    visit_view.visit_id,
    visit_view.user_id,
    visit_view.display_name AS user_display_name,
    visit_view.venue_id,
    visit_view.venue_name,
    visit_view.visit_date,
    visit_view.notes,
    visit_view.rating,
    visit_view.drink,
    visit_view.crawls
FROM visit_view;
$$;

CREATE OR REPLACE FUNCTION select_visits_by_crawl_id (
    p_crawl_id INTEGER_NOTNULL
)
RETURNS SETOF crawl_visit_data
LANGUAGE SQL
AS
$$
SELECT
    visit_view.visit_id,
    visit_view.user_id,
    visit_view.display_name AS user_display_name,
    visit_view.venue_id,
    visit_view.venue_name,
    visit_view.visit_date,
    visit_view.notes,
    visit_view.rating,
    visit_view.drink
FROM visit_view
INNER JOIN crawl_visit
ON visit_view.visit_id = crawl_visit.visit_id
WHERE crawl_visit.crawl_id = p_crawl_id;
$$;

CREATE OR REPLACE FUNCTION select_visit (
    p_visit_id INTEGER_NOTNULL
)
RETURNS SETOF visit_data
LANGUAGE SQL
AS
$$
SELECT
    visit_view.visit_id,
    visit_view.user_id,
    visit_view.display_name AS user_display_name,
    visit_view.venue_id,
    visit_view.venue_name,
    visit_view.visit_date,
    visit_view.notes,
    visit_view.rating,
    visit_view.drink,
    visit_view.crawls
FROM visit_view
WHERE visit_view.visit_id = p_visit_id
$$;

CREATE OR REPLACE FUNCTION select_user_summary (
    p_user_id INTEGER
)
RETURNS SETOF user_summary_data
LANGUAGE SQL
AS
$$
SELECT
    app_user.user_id,
    app_user.display_name,
    user_count.visit_count,
    user_count.venue_count,
    user_count.crawl_count,
    COALESCE(user_crawl.crawls, ARRAY[]::single_user_crawl_data[]) AS crawls,
    COALESCE(user_visit.visits, ARRAY[]::single_user_visit_data[]) AS visits
FROM app_user
LEFT JOIN (
    SELECT
        crawl_visit.user_id,
        COUNT(crawl_visit.visit_id) AS visit_count,
        COUNT(DISTINCT crawl_visit.venue_id) AS venue_count,
        COUNT(DISTINCT crawl_visit.crawl_id) AS crawl_count
    FROM crawl_visit
    GROUP BY crawl_visit.user_id
) user_count
ON app_user.user_id = user_count.user_id
LEFT JOIN (
    SELECT
        user_crawl_visit.user_id,
        ARRAY_AGG(
            (
                crawl.crawl_id,
                crawl.crawl_name,
                LOWER(crawl.crawl_dates),
                UPPER(crawl.crawl_dates),
                crawl.crawl_bg,
                crawl.crawl_fg,
                crawl_venue_count.venue_count,
                COALESCE(crawl_milestone_agg.milestones, ARRAY[]::INTEGER[]),
                user_crawl_visit.venue_count
            )::single_user_crawl_data
        ) AS crawls
    FROM (
        SELECT DISTINCT
            crawl_visit.user_id,
            crawl_visit.crawl_id,
            COUNT(DISTINCT crawl_visit.venue_id) AS venue_count
        FROM crawl_visit
        GROUP BY
            crawl_visit.user_id,
            crawl_visit.crawl_id
    ) user_crawl_visit
    INNER JOIN crawl
    ON user_crawl_visit.crawl_id = crawl.crawl_id
    INNER JOIN (
        SELECT
            crawl_venue.crawl_id,
            COUNT(crawl_venue.venue_id) AS venue_count
        FROM crawl_venue
        GROUP BY crawl_venue.crawl_id
    ) crawl_venue_count
    ON crawl.crawl_id = crawl_venue_count.crawl_id
    LEFT JOIN (
        SELECT
            crawl_milestone.crawl_id,
            ARRAY_AGG(crawl_milestone.venues_required) AS milestones
        FROM crawl_milestone
        GROUP BY crawl_milestone.crawl_id
    ) crawl_milestone_agg
    ON crawl.crawl_id = crawl_milestone_agg.crawl_id
    GROUP BY user_crawl_visit.user_id
) user_crawl
ON app_user.user_id = user_crawl.user_id
LEFT JOIN (
    SELECT
        visit.user_id,
        ARRAY_AGG(
            (
                visit.visit_id,
                venue.venue_id,
                venue.venue_name,
                visit.visit_date,
                visit.notes,
                visit.rating,
                visit.drink,
                visit_crawl.crawls
            )::single_user_visit_data
            ORDER BY visit.visit_date
        ) AS visits
    FROM visit
    INNER JOIN venue
    ON visit.venue_id = venue.venue_id
    INNER JOIN (
        SELECT
            crawl_visit.visit_id,
            ARRAY_AGG(
                (
                    crawl_visit.crawl_id,
                    crawl.crawl_name,
                    crawl.crawl_bg,
                    crawl.crawl_fg,
                    crawl_visit.visit_no
                )::visit_crawl_data
                ORDER BY crawl_visit.crawl_id
            ) AS crawls
        FROM crawl_visit
        INNER JOIN crawl
        ON crawl_visit.crawl_id = crawl.crawl_id
        GROUP BY crawl_visit.visit_id
    ) visit_crawl
    ON visit.visit_id = visit_crawl.visit_id
    GROUP BY visit.user_id
) user_visit
ON app_user.user_id = user_visit.user_id
WHERE app_user.user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION select_user_counts ()
RETURNS SETOF user_count_data
LANGUAGE SQL
AS
$$
SELECT
    app_user.user_id,
    app_user.display_name,
    COALESCE(user_visit_count.visits, 0) AS visit_count,
    COALESCE(user_visit_count.venues, 0) AS visit_count,
    COALESCE(user_crawl_agg.crawl_count, 0) AS crawl_count,
    CASE
        WHEN user_favourite.venue_id IS NULL
        THEN NULL
        ELSE (
            user_favourite.venue_id,
            user_favourite.venue_name
        )::user_favourite_venue_data
    END AS favourite_venue,
    COALESCE(
        user_crawl_agg.crawls,
        ARRAY[]::user_crawl_count_data[]
    ) AS crawls
FROM app_user
LEFT JOIN (
    SELECT
        visit.user_id,
        COUNT(visit.visit_id) AS visits,
        COUNT(DISTINCT visit.venue_id) AS venues
    FROM visit
    GROUP BY visit.user_id
) user_visit_count
ON app_user.user_id = user_visit_count.user_id
LEFT JOIN user_favourite
ON app_user.user_id = user_favourite.user_id
LEFT JOIN (
    SELECT
        user_crawl.user_id,
        COUNT(user_crawl.crawl_id) AS crawl_count,
        ARRAY_AGG(
            (
                user_crawl.crawl_id,
                user_crawl.crawl_name,
                user_crawl.visit_count,
                user_crawl.unique_visit_count,
                user_crawl.favourite_venue
            )::user_crawl_count_data
        ) AS crawls
    FROM (
        SELECT
            user_crawl_count.user_id,
            user_crawl_count.crawl_id,
            crawl.crawl_name,
            user_crawl_count.visit_count,
            user_crawl_count.unique_visit_count,
            CASE
                WHEN user_crawl_favourite.venue_id IS NULL
                THEN NULL
                ELSE (
                    user_crawl_favourite.venue_id,
                    user_crawl_favourite.venue_name
                )::user_favourite_venue_data
            END AS favourite_venue
        FROM (
            SELECT
                crawl_visit.user_id,
                crawl_visit.crawl_id,
                COUNT(crawl_visit.*) AS visit_count,
                COUNT(DISTINCT crawl_visit.venue_id) AS unique_visit_count
            FROM crawl_visit
            GROUP BY crawl_visit.user_id, crawl_visit.crawl_id
        ) user_crawl_count
        INNER JOIN crawl
        ON user_crawl_count.crawl_id = crawl.crawl_id
        INNER JOIN user_crawl_favourite
        ON user_crawl_count.crawl_id = user_crawl_favourite.crawl_id
        AND user_crawl_count.user_id = user_crawl_favourite.user_id
    ) user_crawl
    GROUP BY user_crawl.user_id
) user_crawl_agg
ON app_user.user_id = user_crawl_agg.user_id
ORDER BY app_user.user_id;
$$;

CREATE OR REPLACE FUNCTION select_crawls ()
RETURNS SETOF crawl_summary_data
LANGUAGE SQL
AS
$$
SELECT
    crawl.crawl_id,
    crawl.crawl_name,
    LOWER(crawl.crawl_dates) AS crawl_start,
    UPPER(crawl.crawl_dates) AS crawl_end,
    crawl.is_public,
    crawl.crawl_bg,
    crawl.crawl_fg,
    COALESCE(crawl_venue_count.venue_count, 0) AS venue_count,
    COALESCE(crawl_visit_count.visit_count, 0) AS visit_count,
    COALESCE(crawl_visit_count.user_count, 0) AS user_count,
    COALESCE(
        crawl_milestone_agg.milestones,
        ARRAY[]::INTEGER_NOTNULL[]
    ) AS milestones
FROM crawl
LEFT JOIN (
    SELECT
        crawl_venue.crawl_id,
        COUNT(crawl_venue.venue_id) AS venue_count
    FROM crawl_venue
    GROUP BY crawl_venue.crawl_id
) crawl_venue_count
ON crawl.crawl_id = crawl_venue_count.crawl_id
LEFT JOIN (
    SELECT
        crawl_visit.crawl_id,
        COUNT(crawl_visit.visit_id) AS visit_count,
        COUNT(DISTINCT crawl_visit.user_id) AS user_count
    FROM crawl_visit
    GROUP BY crawl_visit.crawl_id
) crawl_visit_count
ON crawl.crawl_id = crawl_visit_count.crawl_id
LEFT JOIN (
    SELECT
        crawl_milestone.crawl_id,
        ARRAY_AGG(
            crawl_milestone.venues_required
            ORDER BY crawl_milestone.venues_required
        ) AS milestones
    FROM crawl_milestone
    GROUP BY crawl_milestone.crawl_id
) crawl_milestone_agg
ON crawl.crawl_id = crawl_milestone_agg.crawl_id;
$$;

CREATE OR REPLACE FUNCTION select_crawl_by_crawl_id(
    p_crawl_id INTEGER_NOTNULL
)
RETURNS SETOF crawl_data
LANGUAGE SQL
AS
$$
SELECT
    crawl.crawl_id,
    crawl.crawl_name,
    LOWER(crawl.crawl_dates) AS crawl_start,
    UPPER(crawl.crawl_dates) AS crawl_end,
    crawl.is_public,
    crawl.crawl_bg,
    crawl.crawl_fg,
    COALESCE(
        crawl_milestone_agg.milestones,
        ARRAY[]::INTEGER_NOTNULL[]
    ) AS milestones,
    COALESCE(crawl_venue_count.venue_count, 0) AS venue_count,
    COALESCE(crawl_visit_count.visit_count, 0) AS visit_count,
    COALESCE(crawl_visit_count.user_count, 0) AS user_count,
    COALESCE(
        crawl_venue_agg.venues,
        ARRAY[]::crawl_venue_summary_data[]
    ) AS venues,
    COALESCE(
        crawl_visit_agg.visits,
        ARRAY[]::crawl_visit_data[]
    ) AS visits
FROM crawl
LEFT JOIN (
    SELECT
        crawl_venue.crawl_id,
        COUNT(crawl_venue.venue_id) AS venue_count
    FROM crawl_venue
    GROUP BY crawl_venue.crawl_id
) crawl_venue_count
ON crawl.crawl_id = crawl_venue_count.crawl_id
LEFT JOIN (
    SELECT
        crawl_visit.crawl_id,
        COUNT(crawl_visit.visit_id) AS visit_count,
        COUNT(DISTINCT crawl_visit.user_id) AS user_count
    FROM crawl_visit
    GROUP BY crawl_visit.crawl_id
) crawl_visit_count
ON crawl.crawl_id = crawl_visit_count.crawl_id
LEFT JOIN (
    SELECT
        crawl_milestone.crawl_id,
        ARRAY_AGG(
            crawl_milestone.venues_required
            ORDER BY crawl_milestone.venues_required
        ) AS milestones
    FROM crawl_milestone
    GROUP BY crawl_milestone.crawl_id
) crawl_milestone_agg
ON crawl.crawl_id = crawl_milestone_agg.crawl_id
LEFT JOIN (
    SELECT
        crawl_venue.crawl_id,
        ARRAY_AGG(
            (
                crawl_venue.venue_id,
                venue.venue_name,
                venue.venue_address,
                venue.latitude,
                venue.longitude,
                COALESCE(venue_visit_count.visit_count, 0),
                COALESCE(venue_visit_count.user_count, 0)
            )::crawl_venue_summary_data
            ORDER BY venue.venue_name
        ) AS venues
    FROM crawl_venue
    INNER JOIN venue
    ON crawl_venue.venue_id = venue.venue_id
    LEFT JOIN (
        SELECT
            crawl_visit.crawl_id,
            crawl_visit.venue_id,
            COUNT(crawl_visit.visit_id) AS visit_count,
            COUNT(DISTINCT crawl_visit.user_id) AS user_count
        FROM crawl_visit
        GROUP BY
            crawl_visit.crawl_id,
            crawl_visit.venue_id
    ) venue_visit_count
    ON crawl_venue.venue_id = venue_visit_count.venue_id
    AND crawl_venue.crawl_id = venue_visit_count.crawl_id
    GROUP BY crawl_venue.crawl_id
) crawl_venue_agg
ON crawl.crawl_id = crawl_venue_agg.crawl_id
LEFT JOIN (
    SELECT
        crawl_visit.crawl_id,
        ARRAY_AGG(
            (
                crawl_visit.visit_id,
                crawl_visit.user_id,
                app_user.display_name,
                crawl_visit.venue_id,
                venue.venue_name,
                crawl_visit.visit_date,
                visit.notes,
                visit.rating,
                visit.drink
            )::crawl_visit_data_notnull
        ) AS visits
    FROM crawl_visit
    INNER JOIN app_user
    ON crawl_visit.user_id = app_user.user_id
    INNER JOIN venue
    ON crawl_visit.venue_id = venue.venue_id
    INNER JOIN visit
    ON crawl_visit.visit_id = visit.visit_id
    GROUP BY crawl_visit.crawl_id
) crawl_visit_agg
ON crawl.crawl_id = crawl_visit_agg.crawl_id
WHERE crawl.crawl_id = p_crawl_id;
$$;

CREATE OR REPLACE FUNCTION update_user (
    p_user_id INTEGER,
    p_email TEXT,
    p_display_name TEXT,
    p_new_hashed_password TEXT,
    p_is_active BOOLEAN,
    p_is_superuser BOOLEAN,
    p_is_verified BOOLEAN,
    p_last_verify_request TIMESTAMP WITH TIME ZONE
)
RETURNS SETOF user_data
LANGUAGE SQL
AS
$$
UPDATE app_user
SET
    email = COALESCE(p_email, email),
    display_name = COALESCE(p_display_name, display_name),
    hashed_password = COALESCE(p_new_hashed_password, hashed_password),
    is_active = COALESCE(p_is_active, is_active),
    is_superuser = COALESCE(p_is_superuser, is_superuser),
    is_verified = COALESCE(p_is_verified, is_verified),
    last_verify_request = COALESCE(p_last_verify_request, last_verify_request)
WHERE user_id = p_user_id
RETURNING
    user_id,
    email,
    display_name,
    hashed_password,
    is_active,
    is_superuser,
    is_verified,
    last_verify_request
$$;

CREATE OR REPLACE FUNCTION update_user_display_name (
    p_user_id INTEGER,
    p_new_display_name TEXT
)
RETURNS VOID
LANGUAGE SQL
AS
$$
UPDATE app_user
SET display_name = p_new_display_name
WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION update_user_last_verify_request (
    p_user_id INTEGER,
    p_new_last_verify_request TIMESTAMP WITH TIME ZONE
)
RETURNS VOID
LANGUAGE SQL
AS
$$
UPDATE app_user
SET last_verify_request = p_new_last_verify_request
WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION delete_user (
    p_user_id INTEGER
)
RETURNS VOID
LANGUAGE SQL
AS
$$
DELETE FROM app_user
WHERE user_id = p_user_id;
$$;