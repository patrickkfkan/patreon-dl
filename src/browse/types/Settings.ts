export interface BrowseTheme {
  name: string;
  value: string;
  stylesheets: string[];
}

export interface BrowseSettings {
  theme: string;
  listItemsPerPage: number;
  galleryItemsPerPage: number;
}

export interface BrowseSettingOptions {
  themes: BrowseTheme[];
  listItemsPerPage: number[];
  galleryItemsPerPage: number[];
}