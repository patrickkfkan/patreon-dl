import { createContext, useCallback, useContext, useState } from "react";
import BrowseSettingsModal from "../components/BrowseSettingsModal";

interface GlobalModalsProviderProps {
  children: React.ReactNode;
}

interface GlobalModalsContextValue {
  showBrowseSettingsModal: () => void;
  closeBrowseSettingsModal: () => void;
}

const GlobalModalsContext = createContext({} as GlobalModalsContextValue);

function GlobalModalsProvider(props: GlobalModalsProviderProps) {
  const { children } = props;
  const [ browseSettingsModalVisible, setBrowseSettingsModalVisible ] = useState(false);

  const showBrowseSettingsModal = useCallback(() => {
    setBrowseSettingsModalVisible(true);
  }, []);

  const closeBrowseSettingsModal = useCallback(() => {
    setBrowseSettingsModalVisible(false);
  }, [])
  
  return (
    <GlobalModalsContext.Provider
      value={{
        showBrowseSettingsModal,
        closeBrowseSettingsModal
      }}
    >
      {children}
      <BrowseSettingsModal
        show={browseSettingsModalVisible}
        onClose={closeBrowseSettingsModal}
      />
    </GlobalModalsContext.Provider>
  );
};

const useGlobalModals = () => useContext(GlobalModalsContext);

export { useGlobalModals, GlobalModalsProvider };