import { FunctionComponent, useState } from "react";
import DataTable, { ConditionalStyles } from "react-data-table-component";

import { data, Data } from "data";
import { columns } from "column";
import "./App.css";

interface Expandables {
  data: Data;
  resetPagination: boolean;
}

const Expandable: FunctionComponent<Expandables> = ({
  data: propsData,
  resetPagination,
}) => {
  console.log({ propsData, resetPagination });
  return <div style={{ padding: 16 }}>City: {propsData.city}</div>;
};

const conditionalRowStyles: ConditionalStyles<Data>[] = [
  {
    when: (row) => !row.status,
    style: {
      backgroundColor: "green",
      color: "white",
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
  // You can also pass a callback to style for additional customization
  {
    when: (row) => row.supplierStatus === "Pending",
    style: (row: Data) => ({
      backgroundColor: row.status ? "pink" : "inerit",
    }),
  },
];

function App() {
  const [resetPagination, setResetPagination] = useState(false);
  const fetcha = async (id: number) => {
    const result = await window.fetch(
      `https://jsonplaceholder.typicode.com/todos/${id}`,
      {
        method: "GET",
      }
    );
    const json = await result.json();
    console.log({ id, json });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ width: "90%", padding: 32 }} className="data-table">
          <DataTable
            data={data}
            columns={columns}
            title="First Try"
            paginationPerPage={10}
            paginationTotalRows={12}
            pagination={true}
            paginationRowsPerPageOptions={[2, 3, 4]}
            onChangePage={(nextPage) => {
              // fetch next or prev page
              fetcha(nextPage);
            }}
            onChangeRowsPerPage={() => {
              setResetPagination((prevResetValue) => !prevResetValue);
            }}
            paginationResetDefaultPage={resetPagination}
            paginationComponentOptions={{
              rowsPerPageText: "Items per page:",
              rangeSeparatorText: "of",
              noRowsPerPage: false,
              selectAllRowsItem: false,
              selectAllRowsItemText: "All",
            }}
            actions={
              <input
                style={{
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "wheat",
                  borderRadius: 4,
                  marginRight: 8,
                  marginTop: 16,
                  marginBottom: 8,
                }}
                placeholder="Type Keyword"
              />
            }
            subHeader
            subHeaderComponent={[
              <button
                style={{
                  borderRadius: 4,
                  padding: "0.5rem 0.75rem",
                  backgroundColor: "aquamarine",
                  flex: "1 1 0%",
                }}
              >
                Add
              </button>,
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: "80%",
                  gap: 16,
                }}
              >
                <button style={{ borderRadius: 4, padding: "0.5rem 0.75rem" }}>
                  Import
                </button>
                <button style={{ borderRadius: 4, padding: "0.5rem 0.75rem" }}>
                  Export
                </button>
              </div>,
            ]}
            defaultSortAsc={false}
            defaultSortFieldId={null}
            onSort={(column, direction) => {
              console.log({ column, direction });
            }}
            fixedHeader
            fixedHeaderScrollHeight="300px"
            theme="dark"
            selectableRows
            contextActions={
              <div
                style={{
                  padding: 16,
                  backgroundColor: "aquamarine",
                  color: "white",
                }}
              >
                Hehe
              </div>
            }
            selectableRowsVisibleOnly={true}
            selectableRowsHighlight
            onSelectedRowsChange={({
              allSelected,
              selectedCount,
              selectedRows,
            }) => {
              console.log({ allSelected, selectedCount, selectedRows });
            }}
            selectableRowSelected={(row) => row.status}
            expandableRows={false}
            expandableRowsComponent={Expandable}
            expandableRowDisabled={(row) => row.status === true}
            expandableRowExpanded={(row) => row.storeName.includes("Holy")}
            expandableRowsComponentProps={{ resetPagination }}
            expandOnRowClicked
            expandableRowsHideExpander
            onRowExpandToggled={(expanded, row) => {
              console.log({ expanded, row });
            }}
            conditionalRowStyles={conditionalRowStyles}
            expandableInheritConditionalStyles
            onRowClicked={(row) => {
              alert(row.address);
            }}
          />
        </div>
      </header>
    </div>
  );
}

export default App;
