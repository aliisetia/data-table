import { ChangeEventHandler, FC, useRef, useEffect } from "react";

interface ContextCheckboxProps {
  value: boolean | "indeterminate";
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export const ContextCheckbox: FC<ContextCheckboxProps> = ({
  value,
  onChange,
}) => {
  const contextCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (contextCheckboxRef.current) {
      if (value === true) {
        contextCheckboxRef.current.checked = true;
        contextCheckboxRef.current.indeterminate = false;
      } else if (value === false) {
        contextCheckboxRef.current.checked = false;
        contextCheckboxRef.current.indeterminate = false;
      } else if (value === "indeterminate") {
        contextCheckboxRef.current.checked = false;
        contextCheckboxRef.current.indeterminate = true;
      }
    }
  }, [value]);

  return (
    <input
      className="cursor-pointer"
      type="checkbox"
      ref={contextCheckboxRef}
      onChange={onChange}
    />
  );
};
