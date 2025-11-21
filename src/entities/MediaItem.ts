export interface MediaLike {
  type: string;
  id: string;
  filename: string | null;
  mimeType: string | null;
}

export type ImageType =
  'single' |
  'default' |
  'campaignCoverPhoto' |
  'postCoverImage' |
  'postThumbnail' |
  'collectionThumbnail';

export interface SingleImageMediaItem extends MediaLike {
  type: 'image';
  imageType: 'single';
  imageURL: string | null;
  thumbnailURL: string | null;
}

export interface DefaultImageMediaItem extends MediaLike {
  type: 'image';
  imageType: 'default';
  createdAt: string | null;
  downloadURL: string | null;
  imageURLs: {
    default: string | null;
    defaultSmall: string | null;
    original: string | null; // This is not the same as downloadURL (which has smaller filesize)
    thumbnail: string | null;
    thumbnailLarge: string | null;
    thumbnailSmall: string | null;
  };
  thumbnailURL: string | null;
}

export interface CampaignCoverPhotoMediaItem extends MediaLike {
  type: 'image';
  imageType: 'campaignCoverPhoto';
  imageURLs: {
    large: string | null;
    medium: string | null;
    small: string | null;
    xlarge: string | null;
    xsmall: string | null;
  }
}

export interface PostCoverImageMediaItem extends MediaLike {
  type: 'image';
  imageType: 'postCoverImage';
  imageURLs: {
    large: string | null;
    thumbSquareLarge: string | null;
    thumbSquare: string | null;
    thumb: string | null;
    default: string | null;
  }
}

export interface PostThumbnailMediaItem extends MediaLike {
  type: 'image';
  imageType: 'postThumbnail';
  imageURLs: {
    large: string | null;
    large2: string | null;
    square: string | null;
    default: string | null;
  }
}

export interface CollectionThumbnailMediaItem extends MediaLike {
  type: 'image';
  imageType: 'collectionThumbnail';
  imageURLs: {
    url: string | null;
    original: string | null;
    default: string | null;
    defaultBlurred: string | null;
    defaultSmall: string | null;
    defaultLarge: string | null;
    thumbnail: string | null;
    thumbnailLarge: string | null;
    thumbnailSmall: string | null;
  };
}

export type ImageMediaItem<T extends ImageType> =
  T extends 'single' ? SingleImageMediaItem :
  T extends 'default' ? DefaultImageMediaItem :
  T extends 'campaignCoverPhoto' ? CampaignCoverPhotoMediaItem :
  T extends 'postCoverImage' ? PostCoverImageMediaItem :
  T extends 'postThumbnail' ? PostThumbnailMediaItem :
  T extends 'collectionThumbnail' ? CollectionThumbnailMediaItem :
  never;

export interface VideoMediaItem extends MediaLike {
  type: 'video';
  createdAt: string | null;
  size: {
    width: number | null;
    height: number | null;
  },
  duration: number | null; // Seconds
  downloadURL: string | null;
  displayURL: string | null; // URL of video displayed on-screen
  thumbnailURL: string | null;
}

export interface AudioMediaItem extends MediaLike {
  type: 'audio';
  createdAt: string | null;
  url: string | null;
  thumbnailURL: string | null;
}

export interface FileMediaItem extends MediaLike {
  type: 'file';
  createdAt: string | null;
  downloadURL: string | null;
}

export interface AttachmentMediaItem extends MediaLike {
  type: 'attachment';
  downloadURL: string | null;
}

/**
 * Minimal `MediaItem` typically used to represent media-type properties of elements, such
 * as video thumbnails and campaign avatar / cover photos.
 * As a `MediaItem` type, and hence also a `Downloadable` type, it can be used to create
 * `MediaFilenameResolver` and `DownloadTask` instances.
 */
export interface DummyMediaItem extends MediaLike {
  type: 'dummy';
  // { variant: url }
  srcURLs: Record<string, string | null>;
}

export type MediaItem =
  ImageMediaItem<any> |
  VideoMediaItem |
  AudioMediaItem |
  FileMediaItem |
  AttachmentMediaItem |
  DummyMediaItem;
