export type ToastStatus = 'success' | 'error' | 'warning' | 'info';

// Backend: UserMe(BaseModel) but any field may be null.
export interface UserMe {
  id: string | null;
  email: string | null;
  created_at: string | null; // ISO datetime
  updated_at: string | null; // ISO datetime
  disabled: boolean | null;
  is_onboarded: boolean | null;
}

export interface ProfileOption {
  id: number;
  name: string;
}

// Backend: /profile/mine may include more fields; we only model the ones we use.
export interface ProfileMine {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  birth_date?: string | null; // ISO date/datetime string
  gender_id?: number | null;
  languages?: ProfileOption[];
  religion_id?: number | null;
  [key: string]: unknown;
}

export interface SetupProfileForm {
  first_name: string;
  middle_name: string;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  gender_id: string; // keep form state as string
  language_ids: string[];
  religion_id: string;
}

export interface SetupProfilePayload {
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  birth_date: string | null; // ISO datetime string
  gender_id: number | null;
  language_ids: number[];
  religion_id: number | null;
  // Updated to match backend ProfileCreate schema
  is_smoker: boolean;
  wants_children: boolean | null;
}

export interface PreferenceMine {
  user_id: string;
  age_min?: number | null;
  age_max?: number | null;
  wants_children?: boolean | null;
  is_smoker?: boolean | null;
  genders?: ProfileOption[];
  languages?: ProfileOption[];
  religions?: ProfileOption[];
}

export interface SetupPreferencesForm {
  wants_children: string; // "true", "false", or ""
  is_smoker: string; // "true", "false", or ""
  gender_ids: string[]; // keep as string[] for multi-select
  language_ids: string[];
  religion_ids: string[];
}

export interface SetupPreferencesPayload {
  age_min: number | null;
  age_max: number | null;
  wants_children: boolean | null;
  is_smoker: boolean | null;
  gender_ids: number[];
  language_ids: number[];
  religion_ids: number[];
}

export interface ChatMessage {
  id: number | string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe: boolean;
}

export interface MatchItem {
  match_id?: number | string | null;
  profile?: {
    user_id?: string | null;
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    birth_date?: string | null;
    gender_id?: number | null;
    gender?: ProfileOption | null;
    languages?: ProfileOption[];
    religion_id?: number | null;
    religion?: ProfileOption | null;
    is_smoker?: boolean | null;
    wants_children?: boolean | null;
    profilePicture?: string | null;
    avatar?: string | null;
  } | null;
  matched_at?: string | null;
}

export interface ChatEventOut {
  id: number;
  type: string;
  match_id: number;
  originator_id: string; // Adjusted to string as user ID in backend is str
  recipient_id: string; // Adjusted to string
  timestamp: string;
  content?: string | null;
  end_time?: string | null;
}
