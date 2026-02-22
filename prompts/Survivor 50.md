# Survivor 50 Game
I'd like to create a simple website to allow a group of people to draft survivors in the Survivor season 50.
## Definitions
* Survivor - These are players in the game of survivor.  There are 24 survivors in season 50. They are listed on this website with background information:  https://www.survivor50challenge.com/castaways    You can also cross reference that information here:  https://en.wikipedia.org/wiki/Survivor_50:_In_the_Hands_of_the_Fans#Contestants
	* For each survivor you should at least store their name, age, home town and previous survivor information (season, etc.), and a profile image.
	* Profile images are downloaded from official sources and hosted locally in the project (e.g. `public/survivors/`).
* Group - A set of individuals that are signing up to play this game together.
* Player - A single individual playing this game.  They must have a unique email.
* Administrator - The person running the group.  There can be only one.   They are also a player in their group.
* An Administrator can run more than one group and play in more than one group.  A Player can also participate in more than one group.   An individual could be an administrator in one group and a player in another group.
## Here's how it would work
An Administrator signs up on the site and creates a group with a unique name.   They send an invite in email to players they want to invite.

Each member signs up on the site and selects all their survivors in order.   They must rank them all.  Provide a feature where if the user wants it can randomly rank any survivors they have not yet ranked.   More details are listed below on the "My Survivors" page.

When it is time for the Draft - The Administrator initiates the draft.  There must be at least two players in the draft.   Draft is a series of rounds where each players picks exactly one in a round and rounds continue until there are no longer enough survivors for each player to pick at least one.   There are two steps in the draft:
1. Post the draft order:  This is an algorithm that will automatically pick an order or rank for the player in the group.  Each   player will be assigned one rank.  If there are 10 players each will be assigned a rank from 1 to 10.
2. The draft:  It will initiate a "snake draft".  This is where in round one, the player with rank one will pick first in the first round, but last in the second round.  The player rank two  will pick second in the first round but second to last in the last round.
	1. When an individual player drafts, the algorithm will select the highest ranked survivor on that players list that is still available (not yet drafted).
	2. Once they are drafted, an survivor cannot be drafted again.  If there is no survivor's left available on the list, the algorithm will select from the available players at random.
	3. There will very likely be some survivors left un-picked at the end of the draft.
## The Game
After the draft has completed the game begins.   Each week a survivor will be eliminated from the game.   For each group playing that means the player that has drafted that survivor loses them.  Once all of a players survivors have been eliminated they are out from the game.

Early in the game, there may be extra survivors that went un-drafted.   When a player loses one of their survivors as they are eliminated, they get to select a survivor from the un-drafted survivors as long as there are some left.

The winner of the game is the player with a non-eliminated survivor once all other players are out of the game.
## Authentication
- Login with BetterAuth (https://www.better-auth.com/).  All routes in the application need login access.
- Configure Better Auth to use snake_case column names
- Use Email/password authentication in Better Auth.   Do not setup Social Providers.
- Provide a sign-up page to sign users up for the first time.
## Technical Stack
* Next.js
* Postgres
* Tailwind CSS
* Better Auth for Authentication
* Brevo for email (https://www.brevo.com/)
* Package manager: bun
* Please ask if you feel the need for additional items not listed.
## Database and Data
- Use Postgres.  There is a local server and I've already created a DB named survivor50
- User: postgres
- PWD: admin
- port: 5432
- Always use snake case for table names and column names
- Don't try to access the DB directly, just create SQL files and I will execute
- If you have any questions on the data or necessary tables just ask.  If you think I've missed a table and it needs to be added to this list please ask.
### Tables
There will be some tables required by Better Auth
#### survivors
Columns: `id`, `season` (integer, e.g. 50), `name`, `age`, `home_town`, `previous_seasons` (text, free-form notes on prior appearances), `image_path` (local path to hosted profile image, e.g. `/survivors/filename.jpg`), `week_eliminated` (integer, nullable — null means still in the game), `eliminated_at` (timestamp, nullable), `created_at`.

This table will be initially populated with data for all 24 season 50 castaways.
#### groups
Columns: `id`, `name` (unique), `admin_user_id` (FK to BetterAuth user), `status` (enum: `signup` | `draft_order_posted` | `draft_complete` | `in_progress` | `complete`), `draft_scheduled_at` (timestamp, nullable), `created_at`.
#### group_members
Links users to groups with a role.
Columns: `group_id`, `user_id`, `role` (`player` | `admin`), `joined_at`.
Primary key: (`group_id`, `user_id`).
#### invitations
Tracks pending email invitations to join a group.
Columns: `id`, `group_id`, `email`, `token` (unique, used in invite link), `status` (`pending` | `accepted` | `expired`), `created_at`.
#### ranked_survivors
This will store the rank a player gives to a survivor.
Columns: `group_id`, `player_id`, `survivor_id`, `rank`.
Primary key: (`group_id`, `player_id`, `survivor_id`).
#### draft_order
This table will be populated for a group when that administrator posts the draft order.   There should be one row for each player in a group and their assigned rank.
#### drafted
Columns: `group_id`, `player_id`, `survivor_id`, `round_drafted`, `rank_drafted`, `is_free_agent_pick` (boolean, default false — true when a player picks an un-drafted survivor after losing one of their own mid-game).
Primary key: (`group_id`, `player_id`, `survivor_id`).  A survivor cannot be assigned to more than one player in a group.
## UI
### Navigation Bar
All authenticated pages share a top navigation bar. It includes:
- A **group selector link** showing the currently active group name. Clicking it opens a modal dialog listing all groups the user belongs to, allowing them to switch groups. The modal also includes a "Create Group" option.
- If the user belongs to **no groups**, the link is replaced with a **"Create Group"** button, which takes them directly to group creation. This is the flow for a first-time admin.
- On login, if the user belongs to multiple groups, default to the most recently active one.
### My Survivors
Default to this page when logging in
1. If the draft has not yet started, it will explain the game and allow a player to select their top survivors in order.    They must order all 24 survivors.  Provide a button that allows them to randomly select the order for an "un-ordered" survivors.  For example a player may rank their top five but then lose attention.  They should be able to select this button and it will randomly pick a rank for each of the remaining survivors they haven't ranked yet.
2. Once the Draft has completed.  This page will show a read-only list of the survivors that a player has drafted.  Before the draft it will just show a message indicating that the draft has not yet started.
3. If the game is in progress, then the read-only list should also indicate for each survivor if they are eliminated or not.
4. If all survivors are eliminated for this player it should show the player is eliminated from the game.
### Group
This page will show a groups current game status.  It will list each player in a table view.  For each player it will show which survivors they have drafted and if that survivor has been eliminated or not yet.    If a player has all of their survivors eliminated it will show the player as eliminated.   If the game is over it will show the winner.
### Draft
If the draft has not yet started it will share the day & time the draft is planned for.
If the current logged in user is the admin, they can see settings where they can set the day/time of the draft.   And also, the admin will be able to see buttons to post the draft order and run the draft.
If the draft order has been posted this page will show the players in rank order for the draft along with their rank.
If the draft has completed it will show each round of the draft in rank order and the survivor the player selected in that round.
At the bottom it will also show the remaining survivors along with if they have been picked or not during the game yet and if so who picked them.
