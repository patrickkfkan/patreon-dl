import { forwardRef, type ImgHTMLAttributes, useCallback } from 'react';

interface MediaImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  mediaId: string;
  thumbnail?: boolean;
}

const MediaImage = forwardRef<HTMLImageElement, MediaImageProps>((props, ref) => {
  const { mediaId, thumbnail = false, ...rest } = props;

  const src = `/media/${mediaId}${ thumbnail ? '?t=1' : ''}`;

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  }, []);

  return (
    <img
      ref={ref}
      src={src}
      onError={handleError}
      {...rest}
    />
  )
});

export default MediaImage;