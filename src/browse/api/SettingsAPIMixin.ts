import { type APIConstructor } from ".";
import { type BrowseSettingOptions, type BrowseSettings, type BrowseTheme } from "../types/Settings.js";

const BROWSE_SETTINGS_ENV_KEY = 'browse_settings';

const THEMES: BrowseTheme[] = [
  {
    name: 'Default',
    value: 'default',
    stylesheets: ['/themes/bootstrap/default/css/bootstrap.min.css']
  },
  ...[
    'brite',
    'cerulean',
    'cosmo',
    'cyborg',
    'darkly',
    'flatly',
    'journal',
    'litera',
    'lumen',
    'lux',
    'materia',
    'minty',
    'morph',
    'pulse',
    'quartz',
    'sandstone',
    'simplex',
    'sketchy',
    'slate',
    'solar',
    'spacelab',
    'superhero',
    'united',
    'vapor',
    'yeti',
    'zephyr'
  ].map((bootswatchThemeName) => ({
    name: bootswatchThemeName.charAt(0).toUpperCase() + bootswatchThemeName.slice(1),
    value: bootswatchThemeName,
    stylesheets: [`/themes/bootswatch/${bootswatchThemeName}/bootstrap.min.css`]
  }))
]

const DEFAULT_BROWSE_SETTINGS: BrowseSettings = {
  theme: THEMES[0].value,
  listItemsPerPage: 20,
  galleryItemsPerPage: 100
};

export function SettingsAPIMixin<TBase extends APIConstructor>(Base: TBase) {
  return class SettingsAPI extends Base {
    getBrowseSettings() {
      const settings = this.db.getEnvValue<BrowseSettings>(BROWSE_SETTINGS_ENV_KEY);
      if (settings) {
        return {
          ...DEFAULT_BROWSE_SETTINGS,
          ...settings
        };
      }
      return {...DEFAULT_BROWSE_SETTINGS};
    }

    saveBrowseSettings(settings: BrowseSettings) {
      return this.db.saveEnvValue(BROWSE_SETTINGS_ENV_KEY, settings);
    }

    getBrowseSettingOptions(): BrowseSettingOptions {
      return {
        themes: THEMES,
        listItemsPerPage: [10, 20, 30, 50],
        galleryItemsPerPage: [50, 100, 150, 200]
      };
    }
  }
}