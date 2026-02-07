import apiClient from './client';
import { Meditation, MantraElement } from '@/store/features/meditationSlice';

export interface CreateMantraRequest {
  title: string;
  description?: string;
  visibility: 'public' | 'private';
  mantraArray: MantraElement[];
}

export interface CreateMantraResponse {
  message: string;
  queueId: number;
  filePath: string;
}

export interface GetAllMantrasResponse {
  mantras: Meditation[];
  mantrasArray?: Meditation[];
}

export interface FavoriteMantraResponse {
  message: string;
  mantraId: number;
  favorite: boolean;
}

export interface DeleteMantraResponse {
  message: string;
  mantraId: number;
}

export interface UpdateMantraRequest {
  title?: string;
  description?: string;
  visibility?: 'public' | 'private';
}

export interface UpdateMantraResponse {
  message: string;
  mantra: Meditation;
}

// GET /mantras/all
// Authentication is optional - if provided, returns public + user's private mantras
// If not provided, returns only public mantras
export const getAllMantras = async (
  accessToken?: string | null
): Promise<GetAllMantrasResponse> => {
  const response = await apiClient.get<GetAllMantrasResponse>('/mantras/all', {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  const data = response.data;
  return {
    ...data,
    mantras: data.mantras ?? data.mantrasArray ?? [],
  };
};

// POST /mantras/create
export const createMantra = async (data: CreateMantraRequest): Promise<CreateMantraResponse> => {
  const response = await apiClient.post<CreateMantraResponse>('/mantras/create', data);
  return response.data;
};

// GET /mantras/:id/stream - Returns stream URL
export const getStreamUrl = (id: number): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/mantras/${id}/stream`;
};

// POST /mantras/favorite/:mantraId/:trueOrFalse
export const favoriteMantra = async (
  mantraId: number,
  isFavorite: boolean
): Promise<FavoriteMantraResponse> => {
  const trueOrFalse = isFavorite ? 'true' : 'false';
  const response = await apiClient.post<FavoriteMantraResponse>(
    `/mantras/favorite/${mantraId}/${trueOrFalse}`
  );
  return response.data;
};

// PATCH /mantras/update/:id
export const updateMantra = async (
  id: number,
  data: UpdateMantraRequest
): Promise<UpdateMantraResponse> => {
  const response = await apiClient.patch<UpdateMantraResponse>(
    `/mantras/update/${id}`,
    data
  );
  return response.data;
};

// DELETE /mantras/:id
export const deleteMantra = async (id: number): Promise<DeleteMantraResponse> => {
  const response = await apiClient.delete<DeleteMantraResponse>(`/mantras/${id}`);
  return response.data;
};
