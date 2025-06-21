import { type ForwardedRef, forwardRef } from "react";
import "../assets/styles/CustomScrollbars.scss";
import Scrollbars from "react-custom-scrollbars-4";

interface CustomScrollbarsProps {
  viewClassName?: string;
  children: React.ReactNode;
}

const CustomScrollbars = forwardRef((props: CustomScrollbarsProps, ref: ForwardedRef<Scrollbars>) => {
  const { viewClassName, children } = props;

  return (
    <Scrollbars
      ref={ref}
      className="scrollbars"
      autoHide
      hideTracksWhenNotNeeded
      renderTrackHorizontal={(props) => (
        <div {...props} className="custom-scrollbars__track-horizontal" />
      )}
      renderTrackVertical={(props) => (
        <div {...props} className="custom-scrollbars__track-vertical" />
      )}
      renderThumbHorizontal={(props) => (
        <div {...props} className="custom-scrollbars__thumb-horizontal" />
      )}
      renderThumbVertical={(props) => (
        <div {...props} className="custom-scrollbars__thumb-vertical" />
      )}
      renderView={(props) => <div {...props} className={viewClassName} />}
    >
      {children}
    </Scrollbars>
  );
});

export default CustomScrollbars;
