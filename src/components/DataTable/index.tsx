import { useState, memo, useRef, useEffect, useMemo, ChangeEvent } from "react";
import DataTable, {
  TableStyles,
  TableColumn
} from "react-data-table-component";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

import { ContextCheckbox } from "./context-checkbox";
import { SubHeader } from "./sub-header";
import { TableProps, TableRecord } from "./types";
import "./style.scss";

interface PageSelectAllStatus {
  page: number;
  checked: boolean | "indeterminate";
}

class TableIndexedDB extends Dexie {
  selectedData: Dexie.Table<TableRecord, string>;

  constructor(dbName: string) {
    super(dbName);
    this.version(1).stores({
      selectedData: "id"
    });

    this.selectedData = this.table("selectedData");
  }
}

const Table = <T extends TableRecord>(props: TableProps<T>): JSX.Element => {
  const [resetPagination, setResetPagination] = useState(false);
  const [data, setData] = useState<Array<T>>(props.data);
  const [clearPage, setClearPage] = useState(false);
  const indexedDB = useMemo(
    () => new TableIndexedDB(props.indexedDBName),
    [props.indexedDBName]
  );
  const selectedData =
    useLiveQuery(() => indexedDB.selectedData.toArray(), []) ?? [];
  const [pagesSelectAllStatus, setPagesSelectAllStatus] = useState<
    Array<PageSelectAllStatus>
  >([{ page: 1, checked: false }]);
  const [selectAllFlag, setSelectAllFlag] = useState(false);
  const [allDataSelected, setAllDataSelected] = useState(false);
  const [clearSelectedData, setClearSelectedData] = useState(false);
  const sortRef = useRef<{
    sortedColumn: TableColumn<T> | null;
    sortDirection: "asc" | "desc";
  }>({
    sortedColumn: null,
    sortDirection: "desc"
  });
  const fixedHeaderScrollHeight =
    typeof props.maxBodyHeight === "number"
      ? `${props.maxBodyHeight}px`
      : props.maxBodyHeight;
  const defaultSortAsc =
    props.defaultSort !== undefined && props.defaultSort === "desc"
      ? false
      : true;
  const defaultStyles: TableStyles = {
    contextMenu: {
      style: {
        padding: 16,
        height: "unset"
      }
    },
    subHeader: {
      style: {
        color: "black",
        padding: "4px 16px",
        fontSize: 16,
        minHeight: "unset",
        justifyContent: selectAllFlag ? "space-between" : "flex-end"
      }
    },
    header: {
      style: {
        padding: 16,
        minHeight: "unset"
      }
    }
  };

  const handlePersistSelectedRowsChange = (
    selectedRows: Array<T>,
    selectedCount: number
  ): void => {
    if (clearPage) {
      return setClearPage(!clearPage);
    }
    if (selectedRows.length === 0) {
      // Change this page select all value to false
      const tempPagesSelectAllStatus = [...pagesSelectAllStatus];
      const currentPageSelectAllStatus =
        tempPagesSelectAllStatus[props.paginationCurrentPage! - 1];
      currentPageSelectAllStatus.checked = false;
      tempPagesSelectAllStatus[props.paginationCurrentPage! - 1] =
        currentPageSelectAllStatus;
      setPagesSelectAllStatus(tempPagesSelectAllStatus);

      // indexedDB.selectedData.clear();
    } else {
      let indeterminateCount = 0;

      selectedRows.forEach((row) => {
        const isInData = data.some((datum) => datum.id === row.id);

        if (isInData) {
          indeterminateCount = indeterminateCount + 1;
        }
      });

      console.log(
        "check 1 ",
        pagesSelectAllStatus[props.paginationCurrentPage! - 1].checked ===
          "indeterminate",
        pagesSelectAllStatus[props.paginationCurrentPage! - 1].checked,
        selectedRows
      );
      if (
        pagesSelectAllStatus[props.paginationCurrentPage! - 1].checked ===
        "indeterminate"
      ) {
        console.log("check in 1");
        selectedRows.forEach(async (row) => {
          const isInDB = await indexedDB.selectedData.get(row.id);

          if (!isInDB) {
            indexedDB.selectedData.add({ id: row.id });
          }
        });
      }

      const hashMapSelectedRows = selectedRows.reduce(
        (map: Record<string, any>, obj: T) => {
          map[obj.id] = obj.id;
          return map;
        },
        {}
      );

      selectedData?.forEach((row) => {
        const isSelected = hashMapSelectedRows[row.id];

        if (!isSelected) {
          indexedDB.selectedData.delete(row.id);
        }
      });

      const indeterminate: boolean =
        indeterminateCount === data.length || indeterminateCount === 0
          ? false
          : true;
      const checked: boolean =
        indeterminateCount === data.length ? true : false;

      const tempPagesSelectAllStatus = [...pagesSelectAllStatus];
      const currentPageSelectAllStatus =
        tempPagesSelectAllStatus[props.paginationCurrentPage! - 1];
      currentPageSelectAllStatus.checked = indeterminate
        ? "indeterminate"
        : checked;
      tempPagesSelectAllStatus[props.paginationCurrentPage! - 1] =
        currentPageSelectAllStatus;

      console.log("check indeterminate", indeterminate);
      setPagesSelectAllStatus(tempPagesSelectAllStatus);

      if (checked) {
        setSelectAllFlag(true);
      } else {
        setSelectAllFlag(false);
      }
    }
  };

  const toggleCheckAllPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      handleCheckContextCheckbox();
    } else {
      handleUncheckContextCheckbox();
    }
  };

  const handleCheckContextCheckbox = () => {
    const tempPagesSelectAllStatus = pagesSelectAllStatus;
    const currentPageSelectAllStatus =
      tempPagesSelectAllStatus[props.paginationCurrentPage! - 1];
    currentPageSelectAllStatus.checked = true;
    tempPagesSelectAllStatus[props.paginationCurrentPage! - 1] =
      currentPageSelectAllStatus;
    setPagesSelectAllStatus(tempPagesSelectAllStatus);
    setSelectAllFlag(true);

    data.forEach(async (row) => {
      const isInDB = await indexedDB.selectedData.get(row.id);

      if (!isInDB) {
        indexedDB.selectedData.add({ id: row.id });
      }
    });
  };

  const handleUncheckContextCheckbox = () => {
    setClearPage(true);
    const tempPagesSelectAllStatus = pagesSelectAllStatus;
    const currentPageSelectAllStatus =
      tempPagesSelectAllStatus[props.paginationCurrentPage! - 1];
    currentPageSelectAllStatus.checked = false;
    tempPagesSelectAllStatus[props.paginationCurrentPage! - 1] =
      currentPageSelectAllStatus;
    setPagesSelectAllStatus(tempPagesSelectAllStatus);
    // setClearSelectedData(() => true);
    setSelectAllFlag(false);
    console.log("check data", data);

    data.forEach(async (row) => {
      indexedDB.selectedData.delete(row.id);
    });
    // indexedDB.selectedData.clear();
  };

  const toggleAllDataSelected = () => {
    if (allDataSelected === false) {
      setAllDataSelected(true);
    } else {
      setSelectAllFlag(false);
      setAllDataSelected(false);
      setClearSelectedData((prevVal) => !prevVal);
      indexedDB.selectedData.clear();
    }
  };

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  useEffect(() => {
    console.log("check useEffect selectedData.length", selectedData.length);
    // Re-render by reset data props
    // if (selectedData.length === 0 || selectedData.length === data.length) {
    const reCreatedData = [...data.slice()];
    setData(reCreatedData);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedData.length]);

  const initiateData = async () => {
    try {
      await indexedDB.selectedData.add({ id: "1" });
      await indexedDB.selectedData.add({ id: "5" });
    } catch (e) {
      console.log("id already exists");
    }
  };

  useEffect(() => {
    initiateData();
  }, []);

  return (
    <div className="snb-table">
      {props.loading &&
        data.length > 0 &&
        (props.loadingComponent ? (
          props.loadingComponent
        ) : (
          <div className="snb-table__loader-wrapper">
            <div className="snb-table__loader" />
          </div>
        ))}
      <DataTable
        columns={props.columns}
        data={data}
        title={props.title}
        disabled={props.disabled}
        dense={props.dense}
        noDataComponent={props.noDataComponent}
        pointerOnHover={props.pointerOnHover}
        highlightOnHover={props.highlightOnHover}
        keyField={props.keyField}
        fixedHeader={props.fixedHeader}
        fixedHeaderScrollHeight={fixedHeaderScrollHeight}
        onRowClicked={props.onRowClicked}
        persistTableHead={props.persistTableHead}
        actions={props.actionsInHeader}
        subHeader={props.subHeaderComponent !== undefined}
        subHeaderComponent={
          <SubHeader
            selectAllFlag={selectAllFlag}
            currentPageRowCount={data.length}
            totalRowCount={props.paginationTotalRows}
            onSelectAllChange={toggleAllDataSelected}
            allSelected={allDataSelected}
            component={props.subHeaderComponent}
          />
        }
        subHeaderAlign={props.subHeaderAlign}
        subHeaderWrap={props.subHeaderWrap}
        pagination={props.pagination}
        paginationServer={props.paginationDataFromApi}
        paginationPerPage={props.paginationRowsPerPage}
        paginationTotalRows={props.paginationTotalRows}
        paginationDefaultPage={props.paginationDefaultPage}
        paginationRowsPerPageOptions={props.paginationRowsPerPageOptions}
        onChangePage={(page, totalRows) => {
          console.log("check onChangePage");
          if (props.onPageChange) {
            if (page > pagesSelectAllStatus.length) {
              pagesSelectAllStatus.push({
                page: pagesSelectAllStatus.length + 1,
                checked: false
              });
            }

            props.onPageChange(
              page,
              totalRows,
              sortRef.current.sortedColumn,
              sortRef.current.sortDirection
            );
          }
        }}
        onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
          if (props.resetToDefaultPageWhenRowsPerPageChanged) {
            setResetPagination((prevResetValue) => !prevResetValue);
          }

          if (props.onChangeRowsPerPage) {
            props.onChangeRowsPerPage(currentRowsPerPage, currentPage);
          }

          setClearSelectedData((prevClearValue) => !prevClearValue);
        }}
        paginationResetDefaultPage={resetPagination}
        paginationServerOptions={{
          persistSelectedOnPageChange: true,
          persistSelectedOnSort: true
        }}
        paginationComponentOptions={{ rowsPerPageText: "Items per page:" }}
        defaultSortAsc={defaultSortAsc}
        defaultSortFieldId={props.defaultSortField}
        sortServer={props.sortFromServer}
        onSort={(column, direction) => {
          sortRef.current.sortDirection = direction;
          sortRef.current.sortedColumn = column;

          if (props.onSort) {
            props.onSort(column, direction);
          }
        }}
        selectableRows={props.selectableRows}
        selectableRowsHighlight={props.highlightSelectableRows}
        selectableRowsSingle={props.singleSelectMode}
        selectableRowsNoSelectAll={props.noSelectAllRows}
        onSelectedRowsChange={({
          allSelected,
          selectedCount,
          selectedRows
        }) => {
          console.log(
            "check onSelectedRowsChange",
            allSelected,
            selectedCount,
            selectedRows
          );
          if (props.onSelectedRowsChange) {
            props.onSelectedRowsChange({
              allSelected,
              selectedCount,
              selectedRows
            });
          }

          handlePersistSelectedRowsChange(selectedRows, selectedCount);
        }}
        selectableRowDisabled={props.disableRowToBeSelected}
        selectableRowSelected={(row) => {
          console.log(
            "selectableRowSelected",
            selectedData,
            selectedData!.some((data) => data.id === row.id)
          );
          // if (props.rowSelected) {
          //   return props.rowSelected(row);
          // } else {
          return selectedData!.some((data) => data.id === row.id);
          // }
        }}
        clearSelectedRows={clearSelectedData}
        noContextMenu={!props.contextMenuForSelectableRows}
        contextComponent={props.contextComponentForSelectableRows}
        contextActions={
          <ContextCheckbox
            value={
              pagesSelectAllStatus[props.paginationCurrentPage! - 1].checked
            }
            onChange={toggleCheckAllPerPage}
          />
        }
        expandableRows={props.expandableRows}
        expandableRowsComponent={props.expandableRowsComponent}
        expandableRowDisabled={props.disableRowToBeExpanded}
        expandableRowExpanded={props.rowExpanded}
        expandableRowsComponentProps={props.expandableRowsComponentProps}
        expandableRowsHideExpander={props.hideRowExpanderIcon}
        expandOnRowClicked={props.expandOnRowClicked}
        onRowExpandToggled={props.onRowExpandToggled}
        expandableInheritConditionalStyles={props.expandableInheritRowStyles}
        customStyles={{ ...defaultStyles, ...props.customStyles }}
      />
    </div>
  );
};

export default memo(Table) as typeof Table;
