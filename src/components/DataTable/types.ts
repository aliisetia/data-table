import { ReactNode, MouseEvent } from "react";
import {
  RowRecord,
  TableColumn,
  Alignment,
  ExpandableRowsComponent,
  TableStyles,
} from "react-data-table-component";

export interface TableRecord extends RowRecord {
  id: string;
}

export interface TableProps<T> {
  columns: Array<TableColumn<T>>;
  data: Array<T>;
  title?: string | ReactNode;
  disabled?: boolean;
  dense?: boolean;
  noDataComponent?: string | ReactNode;
  pointerOnHover?: boolean;
  highlightOnHover?: boolean;
  keyField?: string;
  fixedHeader?: boolean;
  /** Number value will be treated as pixel. String value must be followed by it's unit, e.g. "100vh" or "100%" */
  maxBodyHeight?: string | number;
  onRowClicked?: (row: T, e: MouseEvent) => void;
  loading?: boolean;
  loadingComponent?: ReactNode;
  /** Show the table head (columns) even when progressPending is true */
  persistTableHead?: boolean;
  actionsInHeader?: ReactNode | Array<ReactNode>;
  subHeaderComponent?: ReactNode | Array<ReactNode>;
  subHeaderAlign?: Alignment;
  subHeaderWrap?: boolean;
  pagination?: boolean;
  paginationCurrentPage?: number;
  paginationDataFromApi?: boolean;
  paginationTotalRows?: number;
  paginationDefaultPage?: number;
  paginationRowsPerPage?: number;
  paginationRowsPerPageOptions?: Array<number>;
  onPageChange?: (
    page: number,
    totalRows: number,
    sortBy: TableColumn<T> | null,
    sortDirection: "asc" | "desc"
  ) => void;
  onChangeRowsPerPage?: (
    currentRowsPerPage: number,
    currentPage: number
  ) => void;
  resetToDefaultPageWhenRowsPerPageChanged?: boolean;
  defaultSort?: "asc" | "desc";
  /** String value refers to column identifier, e.g. "storeId". Number value refers to the order of the column, e.g. 2 means column number 2 */
  defaultSortField?: string | number;
  sortFromServer?: boolean;
  onSort?: (column: TableColumn<T>, direction: "asc" | "desc") => void;
  selectableRows?: boolean;
  indexedDBName: string;
  highlightSelectableRows?: boolean;
  singleSelectMode?: boolean;
  noSelectAllRows?: boolean;
  onSelectedRowsChange?: ({
    allSelected,
    selectedCount,
    selectedRows,
  }: {
    allSelected: boolean;
    selectedCount: number;
    selectedRows: Array<T>;
  }) => void;
  disableRowToBeSelected?: (row: T) => boolean;
  rowSelected?: (row: T) => boolean;
  clearSelectedRows?: boolean;
  /** Will show up when there's any selected row(s) */
  contextMenuForSelectableRows?: boolean;
  contextComponentForSelectableRows?: ReactNode;
  /** Action component(s) within the contextMenu */
  contextActionsForSelectableRows?: ReactNode | Array<ReactNode>;
  expandableRows?: boolean;
  /** Must be passed as a function, not component, e.g. MyExpander, not <MyExpander />. Will have access to row data through "data" props (props.data) */
  expandableRowsComponent?: ExpandableRowsComponent;
  disableRowToBeExpanded?: (row: T) => boolean;
  rowExpanded?: (row: T) => boolean;
  /** Additional props you want to pass to your custom expandableRowsComponent */
  expandableRowsComponentProps?: Record<string, unknown>;
  hideRowExpanderIcon?: boolean;
  expandOnRowClicked?: boolean;
  onRowExpandToggled?: (expanded: boolean, row: T) => void;
  expandableInheritRowStyles?: boolean;
  /** Override default styling, check this file to know which component styles you can override https://github.com/jbetancur/react-data-table-component/blob/next/src/DataTable/styles.ts */
  customStyles?: TableStyles;
}
