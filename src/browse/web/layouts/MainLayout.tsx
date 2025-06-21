import { Container, Row, Col, Stack } from "react-bootstrap";
import { Link, Outlet } from "react-router";
import Sidebar from "../components/Sidebar";
import { ScrollProvider } from "../contexts/MainContentScrollProvider";
import SidebarTrigger from "../components/SidebarTrigger";

function MainLayout() {
  return (
    <Container fluid className="p-0 vh-100">
      <Row className="g-0 h-100">
        <Col lg={3} className="p-0 sticky-top d-none d-lg-block" style={{ maxWidth: '18em' }}>
          <Sidebar />
        </Col>
        <Col className="p-0">
          <ScrollProvider>
            <Stack direction="horizontal" className="d-lg-none sticky-top bg-body py-2">
              <SidebarTrigger />
              <div className="fs-5">
                <Link className="text-body" to="/">patreon-dl</Link>
              </div>
            </Stack>
            <Outlet />
          </ScrollProvider>
        </Col>
      </Row>
    </Container>
  )
}

export default MainLayout;