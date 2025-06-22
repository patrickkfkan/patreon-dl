import { createContext, useCallback, useContext, useRef } from "react";
import CustomScrollbars from "../components/CustomScrollbars";
import type Scrollbars from "react-custom-scrollbars-4";

interface MainContentScrollProviderProps {
  children: React.ReactNode;
}

interface MainContentScrollContextValue {
  scrollTo: (x: number, y: number) => void;
}

const MainContentScrollContext = createContext({} as MainContentScrollContextValue);

function MainContentScrollProvider(props: MainContentScrollProviderProps) {
  const { children } = props;
  const scrollbarsRef = useRef<Scrollbars>(null);

  const scrollTo = useCallback((x: number, y: number) => {
    if (scrollbarsRef.current) {
      scrollbarsRef.current.scrollLeft(x);
      scrollbarsRef.current.scrollTop(y);
    }
  }, []);

  return (
    <MainContentScrollContext.Provider value={{ scrollTo }}>
      <CustomScrollbars ref={scrollbarsRef}>
        {children}
      </CustomScrollbars>
    </MainContentScrollContext.Provider>
  );
};

const useScroll = () => useContext(MainContentScrollContext);

export { useScroll, MainContentScrollProvider as ScrollProvider };