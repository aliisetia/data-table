import { ReactNode, FC, MouseEventHandler } from "react";

interface SubHeaderProps {
  selectAllFlag: boolean;
  allSelected?: boolean;
  currentPageRowCount?: number;
  totalRowCount?: number;
  onSelectAllChange?: MouseEventHandler<HTMLButtonElement>;
  component: ReactNode;
}

export const SubHeader: FC<SubHeaderProps> = ({
  selectAllFlag,
  allSelected,
  currentPageRowCount,
  totalRowCount,
  onSelectAllChange,
  component,
}) => (
  <>
    {selectAllFlag && (
      <div className="flex items-center">
        <p className="mr-2 text-sm">
          {!allSelected ? (
            <span>
              All <span className="font-bold">{currentPageRowCount}</span> items
              on this page are selected.
            </span>
          ) : (
            <span>
              All <span className="font-bold">{totalRowCount}</span> items are
              selected.
            </span>
          )}
        </p>
        <button
          className="px-2 py-3 text-sm rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
          onClick={onSelectAllChange}
        >
          {!allSelected
            ? `Select all ${totalRowCount} items`
            : "Clear selection"}
        </button>
      </div>
    )}
    <div className="flex items-center">{component}</div>
  </>
);
