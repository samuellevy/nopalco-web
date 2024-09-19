export interface ArtistData {
  name: string;
  uri: string;
  images: [
    {
      height: number;
      url: string;
      width: number;
    },
    {
      height: number;
      url: string;
      width: number;
    },
    {
      height: number;
      url: string;
      width: number;
    },
  ];
}

export interface SpotifyToken {
  clientId: string;
  accessToken: string;
  accessTokenExpirationTimestampMs: string;
  isAnonymous: boolean;
}

export interface GetArtistData {
  getToken: () => Promise<SpotifyToken>;
  execute: () => Promise<ArtistData>;
}
