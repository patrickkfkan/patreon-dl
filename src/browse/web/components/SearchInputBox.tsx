import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

export type SearchInputBoxOnConfirmListener = (value: string) => void;

export interface SearchInputBoxHandle {
  onConfirm: (listener: SearchInputBoxOnConfirmListener | null) => void;
  setInput: (value: string) => void;
}

interface SearchInputBoxProps {
  placeholder?: string;
  onConfirm?: SearchInputBoxOnConfirmListener | null;
}

const SearchInputBox = forwardRef<SearchInputBoxHandle, SearchInputBoxProps>((props, ref) => {
  const [ onConfirm, setOnConfirmListener ] = useState<SearchInputBoxOnConfirmListener | null>(() => props.onConfirm || null);
  const [input, setInput] = useState('');

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const confirm = useCallback(() => {
    if (!onConfirm) {
      return;
    }
    onConfirm(input);
  }, [input, onConfirm]);

  const clear = useCallback(() => {
    if (input.trim() === '') {
      return;
    }
    setInput('');
    confirm();
  }, [input, confirm])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        confirm();
      }
    },
    [confirm]
  );

  useImperativeHandle(ref, () => ({
    onConfirm: (listener: SearchInputBoxOnConfirmListener | null) => {
      setOnConfirmListener(() => listener);
    },
    setInput: (value: string) => {
      setInput(value);
    }
  }));

  return (
    <InputGroup className="me-2">
      <Form.Control
        type="search"
        placeholder={props.placeholder}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <Button
        className="d-flex align-items-center"
        variant="primary"
        onClick={confirm}
      >
        <span className="material-icons">search</span>
      </Button>
    </InputGroup>
  )
});

export default SearchInputBox;