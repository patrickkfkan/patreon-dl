import "../assets/styles/SidebarTrigger.scss";
import { useState } from "react";
import { Button, Offcanvas } from "react-bootstrap";
import Sidebar from "./Sidebar";

function SidebarTrigger() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button
        variant="link"
        className="sidebar-trigger d-flex align-items-center"
        onClick={() => setShow(true)}
      >
        <span className="material-icons">menu</span>
      </Button>

      <Offcanvas show={show} onHide={() => setShow(false)} placement="start">
        <Offcanvas.Body className="p-0">
          <Sidebar
            closeButton
            onClose={() => setShow(false)}/>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default SidebarTrigger;