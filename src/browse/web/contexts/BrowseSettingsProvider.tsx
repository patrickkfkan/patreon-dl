import { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import copy from 'fast-copy';
import { type BrowseSettingOptions, type BrowseSettings } from "../../types/Settings";
import deepEqual from "deep-equal";
import { useAPI } from "./APIProvider";

interface SettingsProviderProps {
  children: React.ReactNode;
}

interface SettingsContextValue {
  settings: BrowseSettings;
  options: BrowseSettingOptions;
  refreshSettings: () => void;
  updateSettings: (values: BrowseSettingValues) => void;
}

const BrowseSettingsContext = createContext({} as SettingsContextValue);

export type BrowseSettingValues = {
  [T in keyof BrowseSettings]?: BrowseSettings[T];
};

const settingsReducer = (currentSettings: BrowseSettings | null, settings: BrowseSettings) => {
  return deepEqual(settings, currentSettings) ? currentSettings : settings;
}

const optionsReducer = (currentOptions: BrowseSettingOptions | null, options: BrowseSettingOptions) => {
  return deepEqual(options, currentOptions) ? currentOptions : options;
}

function BrowseSettingsProvider(props: SettingsProviderProps) {
  const { api } = useAPI();
  const [settings, setSettings] = useReducer(settingsReducer, null);
  const [options, setOptions] = useReducer(optionsReducer, null);

  const updateSettings = useCallback((values: BrowseSettingValues) => {
    if (!settings) {
      return null;
    }
    const newSettings = copy(settings);
    if (values.theme) {
      newSettings.theme = values.theme;
    }
    if (values.listItemsPerPage) {
      newSettings.listItemsPerPage = values.listItemsPerPage;
    }
    if (values.galleryItemsPerPage) {
      newSettings.galleryItemsPerPage = values.galleryItemsPerPage;
    }
    void (async () => {
      if (!deepEqual(settings, newSettings)) {
        await api.saveBrowseSettings(newSettings);
        setSettings(newSettings);
      }
    })();
  }, [api, settings]);

  const refreshSettings = useCallback(() => {
    void (async () => {
      setSettings(await api.getBrowseSettings())
      setOptions(await api.getBrowseSettingOptions())
    })();
  }, [api]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  if (!settings || !options) {
    return;
  }

  return (
    <BrowseSettingsContext.Provider value={{ settings, options, updateSettings, refreshSettings }}>
      {props.children}
    </BrowseSettingsContext.Provider>
  );
};

const useBrowseSettings = () => useContext(BrowseSettingsContext);

export { useBrowseSettings, BrowseSettingsProvider };