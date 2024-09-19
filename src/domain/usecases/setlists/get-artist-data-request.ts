export interface ArtistData {
  name: string;
  uri: 'spotify:artist:7LunbFWIm3RPQpywjOSSd8';
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

export interface GetArtistData {
  execute: () => Promise<ArtistData>;
}
