import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Container, Row, Col } from "react-bootstrap";
import { useAPI } from "../contexts/APIProvider";
import { type Product } from "../../../entities";
import ProductCard from "../components/ProductCard";

function ProductContent() {
  const {id: productId} = useParams();
  const { api } = useAPI();
  const [product, setContent] = useState<Product | null>(null);

  useEffect(() => {
    if (!productId) {
      return;
    }
    const abortController = new AbortController();
    void (async () => {
      const product = await api.getProduct(productId);
      if (!abortController.signal.aborted) {
        setContent(product);
      }
    })();

    return () => abortController.abort();
  }, [api, productId]);

  if (!product) {
    return null;
  }

  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col lg={8} md={10} sm={12}>
          <div className="my-4">
            <ProductCard product={product} showCampaign />
         </div>
        </Col>
      </Row>
    </Container>
  )
}

export default ProductContent;