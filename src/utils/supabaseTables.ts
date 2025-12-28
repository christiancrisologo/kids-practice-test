export const TABLES = {
  USERS: 'game_players',
  RECORDS: 'game_history',
  APPS: 'game_apps',
};

export const APP = {
  NAME: 'kids-practice-test',
  ID: 'ea0f66f6-1998-4b7e-b29f-93191ef2ed8e'
};

export const COLUMNS = {
  USERS: {
    ID: 'id',
    USERNAME: 'username',
  },
  RECORDS: {
    ID: 'id',
    PLAYER_ID: 'player_id',
    SCORE: 'score',
    ACHIEVEMENT: 'achievement',
    GAME_DURATION: 'game_duration',
    PLAYER_LEVEL: 'player_level',
    GAME_SETTINGS: 'game_settings',
  },
  GAME_APPS: {
    ID: 'id',
    GAME_SETTINGS: 'game_settings',
  },
};
