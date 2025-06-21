import { useEffect, useReducer } from "react";
import { useBrowseSettings } from "../contexts/BrowseSettingsProvider";

const stylesheetsReducer = (currentStylesheets: string[] | null, stylesheets: string[] | null) => {
  if (currentStylesheets && stylesheets) {
    const isEqual = JSON.stringify(currentStylesheets.sort()) === JSON.stringify(stylesheets.sort());
    return isEqual ? currentStylesheets : stylesheets;
  }
  return stylesheets;
}

function Theme() {
  const { settings, options } = useBrowseSettings();
  const [ stylesheets, setStylesheets ] = useReducer(stylesheetsReducer, null);

  useEffect(() => {
    const stylesheets = options.themes.find(
      (theme) => theme.value === settings.theme)?.stylesheets || null;
    setStylesheets(stylesheets);
  }, [settings, options ]);
    
  useEffect(() => {
    if (!stylesheets || stylesheets.length === 0) {
      return;
    }
    const links = document.querySelectorAll('link[id^="theme-stylesheet-"]');
    links.forEach((link) => link.remove());
    stylesheets.forEach((sheet, i) => {
      const link = document.createElement("link");
      link.id = `theme-stylesheet-${i}`;
      link.rel = "stylesheet";
      link.href = sheet;
      document.head.prepend(link);
    })
  }, [stylesheets]);

  return null;
}

export default Theme;
