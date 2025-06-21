import "../assets/styles/SliderArrow.scss";
import { Button }from "react-bootstrap";

interface ArrowProps {
  type: 'prev' | 'next';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Provides custom arrow for react-slick slider
 * @param props 
 * @returns 
 */

function SliderArrow(props: ArrowProps) {
  const { type, className, style, onClick } = props;
  const iconName = type === 'prev' ? 'chevron_left' : 'chevron_right';

  return (
    <Button
      className={`slider-arrow slider-arrow--${type} rounded-circle ${className || ''}`}
      style={style}
      onClick={onClick}
      variant="primary"
    >
      <span className="slider-arrow__icon material-icons">{iconName}</span>
    </Button>
  )
}

export default SliderArrow;