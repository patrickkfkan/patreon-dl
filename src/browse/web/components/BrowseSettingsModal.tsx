import { useCallback, useEffect } from "react";
import { useBrowseSettings } from "../contexts/BrowseSettingsProvider";
import { Col, Form, Modal, Row } from "react-bootstrap";

interface BrowseSettingsModalProps {
  show?: boolean;
  onClose: () => void;
}

function BrowseSettingsModal(props: BrowseSettingsModalProps) {
  const { show, onClose } = props;
  const { settings, options, updateSettings, refreshSettings } = useBrowseSettings();

  useEffect(() => {
    if (!show) {
      return;
    }
    refreshSettings();
  },[show, refreshSettings]);

  const handleSelectChange = useCallback((
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const key = e.target.dataset.setting;
    const valueType = e.target.dataset.type;
    if (!key) {
      return;
    }
    const value = valueType === 'number' ? Number(e.target.value) : e.target.value;
    if (typeof value === 'number' && isNaN(value)) {
      return;
    }
    const setting = {[key]: value};
    updateSettings(setting);
  }, [updateSettings]);

  if (!settings || !options) {
    return null;
  }

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      scrollable
    >
      <Modal.Header closeButton />

      <Modal.Body>
        <Form>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={5}>
              Theme:
            </Form.Label>
            <Col sm={7}>
              <Form.Select
                data-setting="theme"
                value={settings.theme}
                onChange={handleSelectChange}
              >
                {
                  options.themes.map((theme) => (
                    <option key={`theme-${theme.value}`} value={theme.value}>{theme.name}</option>
                  ))
                }
              </Form.Select>
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={5}>
              List items per page:
            </Form.Label>
            <Col sm={7}>
              {
                <Form.Select
                  data-setting="listItemsPerPage"
                  data-type="number"
                  value={settings.listItemsPerPage}
                  onChange={handleSelectChange}
                >
                  {
                    options.listItemsPerPage.map((value) => (
                      <option key={`listItemsPerPage-${value}`} value={value}>{value}</option>
                    ))
                  }
                </Form.Select>
              }
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3">
            <Form.Label column sm={5}>
              Gallery items per page:
            </Form.Label>
            <Col sm={7}>
              {
                <Form.Select
                  data-setting="galleryItemsPerPage"
                  data-type="number"
                  value={settings.galleryItemsPerPage}
                  onChange={handleSelectChange}
                >
                  {
                    options.galleryItemsPerPage.map((value) => (
                      <option key={`galleryItemsPerPage-${value}`} value={value}>{value}</option>
                    ))
                  }
                </Form.Select>
              }
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  )
}

export default BrowseSettingsModal;