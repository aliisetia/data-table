import { useState, memo, useRef, useEffect, useMemo } from "react";
import DataTable, {
  TableStyles,
  TableColumn
} from "react-data-table-component";
import Dexie from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

import { SubHeader } from "./sub-header";
import { TableProps, TableRecord } from "./types";
import { usePreviousState } from "./usePreviousState";
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
  const [currentPage, setCurrentPage] = useState(1);
  const prevPage = usePreviousState(currentPage);
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

  const handlePersistSelectedRowsChange = async (
    selectedRows: any,
    selectedCount: number
  ): Promise<void> => {
    console.log("from selectedRows.length === 0", {
      selectedRows,
      selectedCount,
      selectedData,
      // indeterminate:
      //   pagesSelectAllStatus[props.paginationCurrentPage! - 1].checked ===
      //   "indeterminate",
      // checked: pagesSelectAllStatus[props.paginationCurrentPage! - 1].checked,
      
    },props.paginationCurrentPage, data);

    const filterSelected = data.filter(d => selectedRows.filter((row:any) => d.id === row.id).length);

    filterSelected.forEach(async (row) => {
      const isInDB = await indexedDB.selectedData.get(row.id);

      if (!isInDB) {
        indexedDB.selectedData.add({ id: row.id }, row.id);
      }
    });

    const filterDeleted = data.filter(d => !selectedRows.filter((row:any) => d.id === row.id).length);


    console.log('check filterDeleted', data, selectedData, filterDeleted)

    filterDeleted.forEach(async (row) => {
      const isInDB = await indexedDB.selectedData.get(row.id);
      console.log('check isInDB', isInDB, row);
      if (isInDB) {
        console.log('check deleted', row.id)
        indexedDB.selectedData.delete(row.id);
      }
    });

    setSelectAllFlag(filterSelected.length === data.length)

    // if (selectedRows.length === 0) {
    //   // Change this page select all value to false
    //   // if (selectedCount === 0 && currentPage !== prevPage) {
    //   //   handleUncheckContextCheckbox();
    //   // } else {
    //   //   const tempPagesSelectAllStatus = pagesSelectAllStatus;
    //   //   const currentPageSelectAllStatus = tempPagesSelectAllStatus[
    //   //     props.paginationCurrentPage! - 1
    //   //   ] ?? { page: props.paginationCurrentPage! - 1, checked: false };
    //   //   currentPageSelectAllStatus.checked = false;
    //   //   tempPagesSelectAllStatus[props.paginationCurrentPage! - 1] =
    //   //     currentPageSelectAllStatus;
    //   //   setPagesSelectAllStatus(tempPagesSelectAllStatus);
    //   //   setSelectAllFlag(false);
    //   // }
    //   handleUncheckContextCheckbox();
    // } else if (selectedRows.length === data.length) {
    //   handleCheckContextCheckbox();
    // } else {
    //   let indeterminateCount = 0;

    //   selectedRows.forEach((row) => {
    //     const isInData = data.some((datum) => datum.id === row.id);

    //     if (isInData) {
    //       indeterminateCount = indeterminateCount + 1;
    //     }
    //   });

    //   if (
    //     pagesSelectAllStatus[props.paginationCurrentPage! - 1].checked !== true
    //   ) {
    //     console.log("masuk sini checked !== true");
    //     selectedRows.forEach(async (row) => {
    //       const isInDB = await indexedDB.selectedData.get(row.id);

    //       if (!isInDB) {
    //         await indexedDB.selectedData.add({ id: row.id });
    //       }
    //     });
    //   }

    //   const hashMapSelectedRows = selectedRows.reduce(
    //     (map: Record<string, any>, obj: T) => {
    //       map[obj.id] = obj.id;
    //       return map;
    //     },
    //     {}
    //   );

    //   console.log({ hashMapSelectedRows });

    //   selectedData?.forEach(async (row) => {
    //     const isSelected = hashMapSelectedRows[row.id];

    //     if (!isSelected) {
    //       await indexedDB.selectedData.delete(row.id);
    //     }
    //   });

    //   const indeterminate: boolean =
    //     indeterminateCount === data.length || indeterminateCount === 0
    //       ? false
    //       : true;
    //   const checked: boolean =
    //     indeterminateCount === data.length ? true : false;

    //   console.log({ indeterminate, indeterminateCount, checked });

    //   const tempPagesSelectAllStatus = [...pagesSelectAllStatus];
    //   const currentPageSelectAllStatus =
    //     tempPagesSelectAllStatus[props.paginationCurrentPage! - 1];
    //   currentPageSelectAllStatus.checked = indeterminate
    //     ? "indeterminate"
    //     : checked;
    //   tempPagesSelectAllStatus[props.paginationCurrentPage! - 1] =
    //     currentPageSelectAllStatus;
    //   setPagesSelectAllStatus(tempPagesSelectAllStatus);

    //   if (checked) {
    //     setSelectAllFlag(true);
    //   } else {
    //     setSelectAllFlag(false);
    //   }
    // }
  };

  const handleCheckContextCheckbox = () => {
    console.log("from handleCheckContextCheckbox");
    const tempPagesSelectAllStatus = pagesSelectAllStatus;
    const currentPageSelectAllStatus = tempPagesSelectAllStatus[
      props.paginationCurrentPage! - 1
    ] ?? {
      page: props.paginationCurrentPage! - 1,
      checked: false
    };
    currentPageSelectAllStatus.checked = true;
    tempPagesSelectAllStatus[props.paginationCurrentPage! - 1] =
      currentPageSelectAllStatus;
    setPagesSelectAllStatus(tempPagesSelectAllStatus);
    setSelectAllFlag(true);

    data.forEach(async (row) => {
      const isInDB = await indexedDB.selectedData.get(row.id);

      if (!isInDB) {
        await indexedDB.selectedData.add({ id: row.id });
      }
    });
  };

  const handleUncheckContextCheckbox = () => {
    const tempPagesSelectAllStatus = pagesSelectAllStatus;
    const currentPageSelectAllStatus = tempPagesSelectAllStatus[
      props.paginationCurrentPage! - 1
    ] ?? {
      page: props.paginationCurrentPage! - 1,
      checked: false
    };
    currentPageSelectAllStatus.checked = false;
    tempPagesSelectAllStatus[props.paginationCurrentPage! - 1] =
      currentPageSelectAllStatus;
    setPagesSelectAllStatus(tempPagesSelectAllStatus);
    setSelectAllFlag(false);

    console.log("from handleUncheckContextCheckbox", { data, selectedData });

    data.forEach(async (row) => {
      await indexedDB.selectedData.delete(row.id);
    });
  };

  const toggleAllDataSelected = async () => {
    if (allDataSelected === false) {
      setAllDataSelected(true);
    } else {
      setSelectAllFlag(false);
      setAllDataSelected(false);
      setClearSelectedData((prevClearValue) => !prevClearValue);
      await indexedDB.selectedData.clear();
    }
  };

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  // useEffect(() => {
  //   // Rerender by manually resetting data state
  //   const reCreatedData = [...data];
  //   setData(reCreatedData);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedData.length]);

  useEffect((
  )=>{
    // if(!selectAllFlag)
    //   setAllDataSelected(selectAllFlag)
  },[selectAllFlag])

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
      <div
        className="absolute top-0 left-0 w-full z-10 flex justify-between items-center text-lg p-4 text-black"
        style={{
          backgroundColor: "#e3f2fd",
          transitionDuration: "125ms",
          transitionTimingFunction: "cubic-bezier(0,0,0.2,1)",
          willChange: "transform",
          transitionProperty: "transform, opacity",
          height: "unset",
          opacity: selectedData.length > 0 ? 1 : 0,
          transform:
            selectedData.length > 0
              ? "translate3d(0,0,0)"
              : "translate3d(0,-100%,0)"
        }}
      >
        <span>{`${selectedData.length} item${selectedData.length > 1 ? 's' : ''} selected`}</span>
      </div>
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
          console.log('onChangePage')
          if (props.onPageChange) {
            if (page > pagesSelectAllStatus.length) {
              pagesSelectAllStatus.push({
                page: pagesSelectAllStatus.length + 1,
                checked: false
              });
            }

            setCurrentPage(page);

            props.onPageChange(
              page,
              totalRows,
              sortRef.current.sortedColumn,
              sortRef.current.sortDirection
            );
          }
        }}
        onChangeRowsPerPage={(currentRowsPerPage, currentPaginationPage) => {
          if (props.resetToDefaultPageWhenRowsPerPageChanged) {
            setResetPagination((prevResetValue) => !prevResetValue);
          }

          if (props.onChangeRowsPerPage) {
            props.onChangeRowsPerPage(
              currentRowsPerPage,
              currentPaginationPage
            );
          }

          setClearSelectedData((prevClearValue) => !prevClearValue);
        }}
        paginationResetDefaultPage={resetPagination}
        paginationServerOptions={{
          persistSelectedOnPageChange: false,
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
          if (props.onSelectedRowsChange) {
            props.onSelectedRowsChange({
              allSelected,
              selectedCount,
              selectedRows
            });
          }

          const param = (selectedRows.length ? selectedRows : selectedData)

          handlePersistSelectedRowsChange( param , selectedCount);
        }}
        selectableRowDisabled={props.disableRowToBeSelected}
        // selectableRowSelected={(row) => {
        // //   // console.log('checking 1', row, selectedData.some((datum) => datum.id === row.id))
        //   if (props.rowSelected) {
        //     return props.rowSelected(row);
        //   } else {
        //     return true
        // //     return allDataSelected || selectedData.some((datum) => datum.id === row.id);
        //   }
        // }}
        // selectableRowsComponentProps={{
        //   indeterminate:
        //     pagesSelectAllStatus[props.paginationCurrentPage! - 1]?.checked ===
        //     "indeterminate"
        // }}
        clearSelectedRows={clearSelectedData}
        noContextMenu={true}
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
