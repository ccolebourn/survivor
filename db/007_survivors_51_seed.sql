-- Seed data for Survivor Season 51 (the "Open Era").
-- Run AFTER 006_add_season_to_groups.sql
--
-- 21 castaways, all new players, so previous_seasons is NULL for every row.
-- Source: Yahoo Entertainment cast announcement. Other outlets disagree on a
-- few ages and hometowns; Yahoo was chosen as the single source of truth.
--
-- Images live under /survivors/s51/ rather than flat in /survivors/ like
-- season 50. Returning players would otherwise collide on filename once a
-- castaway appears in two seasons. Season 50 rows keep their existing flat
-- paths; image_path stores the full path per row, so the two coexist.

INSERT INTO survivors (season, name, age, home_town, previous_seasons, image_path) VALUES
(51, 'Aaliyah Puglia',           25, 'Gloucester City, New Jersey',   NULL, '/survivors/s51/aaliyah-puglia.jpg'),
(51, 'Alexis Levine',            34, 'Atlanta, Georgia',              NULL, '/survivors/s51/alexis-levine.jpg'),
(51, 'Ana Sani',                 34, 'Toronto, Canada',               NULL, '/survivors/s51/ana-sani.jpg'),
(51, 'Angelica "Jelly" Loblack', 29, 'Garland, Texas',                NULL, '/survivors/s51/angelica-jelly-loblack.jpg'),
(51, 'Brady Booker',             27, 'La Salle, Illinois',            NULL, '/survivors/s51/brady-booker.jpg'),
(51, 'Carter Krull',             24, 'Rock Rapids, Iowa',             NULL, '/survivors/s51/carter-krull.jpg'),
(51, 'Cristian Chavez',          25, 'Salt Lake City, Utah',          NULL, '/survivors/s51/cristian-chavez.jpg'),
(51, 'Daniel Kilby',             30, 'Mount Forest, Ontario, Canada', NULL, '/survivors/s51/daniel-kilby.jpg'),
(51, 'Devin Way',                33, 'Lufkin, Texas',                 NULL, '/survivors/s51/devin-way.jpg'),
(51, 'Eric Macksoud',            34, 'Lincoln, Rhode Island',         NULL, '/survivors/s51/eric-macksoud.jpg'),
(51, 'Jenna Doore',              31, 'Perrysburg, Ohio',              NULL, '/survivors/s51/jenna-doore.jpg'),
(51, 'Kristin Flickinger',       49, 'Ketchum, Idaho',                NULL, '/survivors/s51/kristin-flickinger.jpg'),
(51, 'Lewis Kelly',              28, 'Dublin, Ireland',               NULL, '/survivors/s51/lewis-kelly.jpg'),
(51, 'Linnea Capobianco',        25, 'Kearny, New Jersey',            NULL, '/survivors/s51/linnea-capobianco.jpg'),
(51, 'Maggie Nestor',            40, 'Middleway, West Virginia',      NULL, '/survivors/s51/maggie-nestor.jpg'),
(51, 'Michael Pinsky',           32, 'New York City, New York',       NULL, '/survivors/s51/michael-pinsky.jpg'),
(51, 'Ori Jean-Charles',         27, 'Spring Valley, New York',       NULL, '/survivors/s51/ori-jean-charles.jpg'),
(51, 'Patt Cannaday',            33, 'Tampa, Florida',                NULL, '/survivors/s51/patt-cannaday.jpg'),
(51, 'Rob Antonson',             40, 'Johnston, Rhode Island',        NULL, '/survivors/s51/rob-antonson.jpg'),
(51, 'Sharonda Cox',             34, 'Pompano Beach, Florida',        NULL, '/survivors/s51/sharonda-cox.jpg'),
(51, 'Thien An Nguyen',          24, 'Fort Worth, Texas',             NULL, '/survivors/s51/thien-an-nguyen.jpg');
