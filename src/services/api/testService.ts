// ============================================
// TEST SERVICE - Typing Test API Operations
// ============================================

import { httpClient } from './httpClient';
import type { 
  ApiResponse, 
  TestResult, 
  TestConfig, 
  PaginatedResponse,
  LeaderboardEntry,
  LeaderboardFilters,
} from '@/types';

export interface SaveResultRequest {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  duration: number;
  config: TestConfig;
}

export interface GetResultsParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'wpm' | 'accuracy' | 'timestamp';
  sortOrder?: 'asc' | 'desc';
}

export const testService = {
  // Test Results
  async saveResult(result: SaveResultRequest): Promise<ApiResponse<TestResult>> {
    return httpClient.post<TestResult>('/tests/results', result);
  },

  async getResults(params: GetResultsParams = {}): Promise<ApiResponse<PaginatedResponse<TestResult>>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);
    
    const query = queryParams.toString();
    return httpClient.get<PaginatedResponse<TestResult>>(`/tests/results${query ? `?${query}` : ''}`);
  },

  async getResultById(resultId: string): Promise<ApiResponse<TestResult>> {
    return httpClient.get<TestResult>(`/tests/results/${resultId}`);
  },

  async deleteResult(resultId: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(`/tests/results/${resultId}`);
  },

  // Words Generation (server-side for consistency in multiplayer)
  async generateWords(config: Partial<TestConfig>): Promise<ApiResponse<string[]>> {
    return httpClient.post<string[]>('/tests/words', config);
  },

  // Leaderboard
  async getLeaderboard(filters: LeaderboardFilters): Promise<ApiResponse<LeaderboardEntry[]>> {
    const queryParams = new URLSearchParams();
    queryParams.set('period', filters.period);
    if (filters.difficulty) queryParams.set('difficulty', filters.difficulty);
    if (filters.duration) queryParams.set('duration', filters.duration.toString());
    if (filters.limit) queryParams.set('limit', filters.limit.toString());
    
    return httpClient.get<LeaderboardEntry[]>(`/tests/leaderboard?${queryParams.toString()}`);
  },
};