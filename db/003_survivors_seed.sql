\encoding UTF8
-- Seed data for Survivor Season 50: In the Hands of the Fans
-- image_path will be populated once images are downloaded to public/survivors/
-- Run AFTER 002_app_tables.sql

INSERT INTO survivors (season, name, age, home_town, previous_seasons, image_path) VALUES

-- CILA TRIBE (Orange)
(50, 'Cirie Fields',         55, 'Jersey City, New Jersey',
  'Season 12 (Panama), Season 16 (Micronesia - Fans vs. Favorites), Season 20 (Heroes vs. Villains), Season 34 (Game Changers)',
  '/survivors/cirie-fields.jpg'),

(50, 'Ozzy Lusth',           43, 'Guanajuato, Mexico',
  'Season 13 (Cook Islands), Season 16 (Micronesia - Fans vs. Favorites), Season 23 (South Pacific), Season 34 (Game Changers)',
  '/survivors/ozzy-lusth.jpg'),

(50, 'Christian Hubicki',    39, 'Baltimore, Maryland',
  'Season 37 (David vs. Goliath)',
  '/survivors/christian-hubicki.jpg'),

(50, 'Joe Hunter',           46, 'Vacaville, California',
  'Season 48',
  '/survivors/joe-hunter.jpg'),

(50, 'Rick Devens',          41, 'Blacksburg, Virginia',
  'Season 38 (Edge of Extinction - 4th place)',
  '/survivors/rick-devens.jpg'),

(50, 'Emily Flippen',        30, 'McKinney, Texas',
  'Season 45 (7th place)',
  '/survivors/emily-flippen.jpg'),

(50, 'Savannah Louie',       31, 'Walnut Creek, California',
  'Season 49 (Winner)',
  '/survivors/savannah-louie.jpg'),

-- KALO TRIBE (Green)
(50, 'Benjamin "Coach" Wade', NULL, NULL,
  'Season 18 (Tocantins - 5th place), Season 20 (Heroes vs. Villains), Season 23 (South Pacific - 2nd place)',
  '/survivors/benjamin-coach-wade.jpg'),

(50, 'Jenna Lewis-Dougherty', 47, 'Franklin, New Hampshire',
  'Season 1 (Borneo), Season 8 (All-Stars - 3rd place)',
  '/survivors/jenna-lewis-dougherty.jpg'),

(50, 'Mike White',           54, 'Pasadena, California',
  'Season 37 (David vs. Goliath - 2nd place)',
  '/survivors/mike-white.jpg'),

(50, 'Dee Valladares',       28, 'Miami, Florida',
  'Season 45 (Winner)',
  '/survivors/dee-valladares.jpg'),

(50, 'Kamilla Karthigesu',   31, 'Toronto, Ontario, Canada',
  'Season 48 (Finalist)',
  '/survivors/kamilla-karthigesu.jpg'),

(50, 'Charlie Davis',        27, 'Manchester, Massachusetts',
  'Season 46 (2nd place)',
  '/survivors/charlie-davis.jpg'),

(50, 'Tiffany Ervin',        34, 'Franklin Township, New Jersey',
  'Season 46 (8th place)',
  '/survivors/tiffany-ervin.jpg'),

(50, 'Jonathan Young',       32, 'Gulf Shores, Alabama',
  'Season 42 (Finalist)',
  '/survivors/jonathan-young.jpg'),

-- VATU TRIBE (Pink)
(50, 'Colby Donaldson',      51, 'Christoval, Texas',
  'Season 2 (The Australian Outback - 2nd place), Season 8 (All-Stars), Season 20 (Heroes vs. Villains)',
  '/survivors/colby-donaldson.jpg'),

(50, 'Stephenie LaGrossa Kendrick', 45, 'Glenolden, Pennsylvania',
  'Season 10 (Palau - 7th place), Season 11 (Guatemala - 2nd place), Season 20 (Heroes vs. Villains)',
  '/survivors/stephenie-lagrossa-kendrick.jpg'),

(50, 'Genevieve Mushaluk',   34, 'Winnipeg, Manitoba, Canada',
  'Season 47 (5th place)',
  '/survivors/genevieve-mushaluk.jpg'),

(50, 'Angelina Keeley',      35, 'Sparks, Nevada',
  'Season 37 (David vs. Goliath)',
  '/survivors/angelina-keeley.jpg'),

(50, 'Q Burdette',           31, 'Senatobia, Mississippi',
  'Season 46',
  '/survivors/q-burdette.jpg'),

(50, 'Kyle Fraser',          NULL, NULL,
  'Season 48 (Winner)',
  '/survivors/kyle-fraser.jpg'),

(50, 'Rizo Velovic',         26, 'Yonkers, New York',
  'Season 49 (4th place)',
  '/survivors/rizo-velovic.jpg'),

(50, 'Aubry Bracco',         39, 'Hampton Falls, New Hampshire',
  'Season 32 (Kaôh Rōng - 2nd place), Season 34 (Game Changers), Season 38 (Edge of Extinction)',
  '/survivors/aubry-bracco.jpg'),

(50, 'Chrissy Hofbeck',      NULL, NULL,
  'Season 35 (Heroes vs. Healers vs. Hustlers - 2nd place)',
  '/survivors/chrissy-hofbeck.jpg');
