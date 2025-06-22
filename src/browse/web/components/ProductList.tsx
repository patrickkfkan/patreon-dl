import "../assets/styles/ProductList.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Product } from "../../../entities";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: Product[];
}

const MIN_CARD_WIDTH = 300;
const GAP = 16;

function ProductList(props: ProductListProps ) {
  const { products } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

   useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const layoutProps = useMemo(() => {
    if (!containerWidth) {
      return {
        cardWidth: MIN_CARD_WIDTH,
        lastRowFirstItemIndex: 0
      };
    }
    const cardsPerRow = Math.floor((containerWidth + GAP) / (MIN_CARD_WIDTH + GAP));
    const cardWidth = (((containerWidth + GAP) / cardsPerRow) - GAP).toFixed(2);
    const lastRowFirstItemIndex = Math.floor((products.length - 1) / cardsPerRow) * cardsPerRow;
    return {
      cardWidth,
      lastRowFirstItemIndex
    }
  }, [containerWidth]);

  const { cardWidth, lastRowFirstItemIndex } = layoutProps;

  return (
    <div
      ref={containerRef}
      className="product-list mb-4"
      style={{
        '--card-width': `${cardWidth}px`,
        '--gap': `${GAP}px`
      } as React.CSSProperties}
    >
      {
        products.map((product, index) => (
          <div
            className={`product-list__card-wrapper ${index >= lastRowFirstItemIndex ? 'product-list__card-wrapper--fixed' : ''}`}
          >
            <ProductCard key={`product-card-${product.id}`}product={product} variant="compact" />
          </div>
        ))
      }
    </div>
  )
}

export default ProductList;