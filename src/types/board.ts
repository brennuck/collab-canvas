export interface Board {
  id: string;
  name: string;
  updatedAt: Date;
  memberCount: number;
  thumbnail: string | null;
  ownerName?: string;
  isOwned: boolean;
  isPinned: boolean;
}

// API response types (mirror of tRPC output)
export interface OwnedBoardResponse {
  id: string;
  name: string;
  thumbnail: string | null;
  updatedAt: Date;
  memberCount: number;
  isOwned: boolean;
  isPinned: boolean;
}

export interface SharedBoardResponse {
  id: string;
  name: string;
  thumbnail: string | null;
  updatedAt: Date;
  memberCount: number;
  ownerName: string;
  isOwned: boolean;
  isPinned: boolean;
}
