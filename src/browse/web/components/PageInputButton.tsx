import { OverlayTrigger, Popover, Form, Button, InputGroup, Stack } from "react-bootstrap";
import { useCallback, useRef, useState } from "react";

interface PageInputButtonProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function PageInputButton(props: PageInputButtonProps) {
  const { currentPage, totalPages, onChange } = props;
  const [value, setValue] = useState(currentPage);
  const inputRef = useRef<HTMLInputElement>(null);

  const onShow = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const onHide = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, []);

  const handleGoClick = useCallback(() => {
    if (!inputRef.current) {
      return;
    }
    const page = Number(inputRef.current.value);
    if (isNaN(page) || page === currentPage) {
      return;
    }
    const p = Math.max(Math.min(totalPages, page), 1);
    onChange(p);
  }, [currentPage, totalPages]);

  return (
    <OverlayTrigger
      trigger="click"
      rootClose
      placement="top"
      onEntered={onShow}
      onExited={onHide}
      overlay={
        <Popover>
          <Popover.Body>
            <Stack direction="horizontal">
              <span className="text-nowrap me-2">Go to:</span>
              <InputGroup>
                <Form.Control
                  ref={inputRef}
                  value={value}
                  type="number"
                  required
                  size="sm"
                  style={{width: "10em"}}
                  onChange={(e) => setValue(Number(e.target.value))} />
                <Button onClick={handleGoClick}>&#8594;</Button>
              </InputGroup>
            </Stack>
          </Popover.Body>
        </Popover>
      }
    >
      <Button variant="outline-primary">...</Button>
    </OverlayTrigger>
  )
}

export default PageInputButton;