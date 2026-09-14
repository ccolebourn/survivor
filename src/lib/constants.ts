// Season-wide constants.

// The season new groups are created for. Bump this when a new season starts.
// Season 50 groups remain readable, but nothing new can be drafted against it.
//
// This is deliberately a constant rather than a database table: it is one
// number that changes once a year. If the admin ever needs to switch seasons
// without a deploy, promote it to a table then.
export const CURRENT_SEASON = 51;
