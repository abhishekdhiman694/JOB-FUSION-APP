import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Job {
  job_id: string; // Standardized ID
  job_title: string;
  employer_name: string;
  job_city?: string;
  job_country?: string;
  job_description?: string;
  job_required_skills?: string[];
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_employment_type?: string;
  job_publisher?: string;
  job_google_link?: string;
  employer_logo?: string;
  job_posted_at_datetime_utc?: string | Date;
  job_is_remote?: boolean;
}

interface JobsState {
  trending: Job[];
  recommended: Job[];
  searchResults: Job[];
  savedJobs: Job[];
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  trending: [],
  recommended: [],
  searchResults: [],
  savedJobs: [],
  loading: false,
  error: null,
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setTrending: (state, action: PayloadAction<Job[]>) => {
      state.trending = action.payload;
    },
    setRecommended: (state, action: PayloadAction<Job[]>) => {
      state.recommended = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Job[]>) => {
      state.searchResults = action.payload;
    },
    setSavedJobs: (state, action: PayloadAction<Job[]>) => {
      state.savedJobs = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addSavedJob: (state, action: PayloadAction<Job>) => {
      state.savedJobs.unshift(action.payload);
    },
    removeSavedJob: (state, action: PayloadAction<string>) => {
      state.savedJobs = state.savedJobs.filter(job => job.job_id !== action.payload);
    },
  },
});

export const { setTrending, setRecommended, setSearchResults, setSavedJobs, setLoading, setError, addSavedJob, removeSavedJob } = jobsSlice.actions;
export default jobsSlice.reducer;
