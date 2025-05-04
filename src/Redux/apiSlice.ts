import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task } from './Slices/TaskReviewSlice';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
  endpoints: (builder) => ({
    fetchTasks: builder.query<Task[], void>({
      query: () => '/tasks',
    }),
  }),
});

export const { useFetchTasksQuery } = apiSlice;
