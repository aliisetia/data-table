import { FC, useEffect, useState } from "react";
import { TableColumn } from "react-data-table-component";
import { BanIcon } from "@heroicons/react/outline";
import orderBy from "lodash.orderby";
import { useHistory } from "react-router";

import Table from "./index";

interface Passenger {
  _id: string;
  id: string;
  name: string;
  trips: number;
  airline: Array<{ name: string; country: string }>;
}

const columns: TableColumn<Passenger>[] = [
  {
    name: "ID",
    selector: (row) => row["id"],
    sortable: true,
  },
  {
    name: "Name",
    selector: (row) => row["name"],
    sortable: true,
  },
  {
    name: "Trips",
    selector: (row) => row["trips"],
    sortable: true,
  },
  {
    name: "Airline Name",
    selector: (row) => row["airline"][0]["name"],
    sortable: true,
  },
  {
    name: "Airline Country",
    selector: (row) => row["airline"][0]["country"],
    sortable: true,
  },
];

export const TablePage: FC = () => {
  const [data, setData] = useState<Array<Passenger>>([]);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(5);
  const [sortBy, setSortBy] = useState<TableColumn<Passenger> | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const history = useHistory();

  const goToPage = () => {
    history.push("/zonk");
  };

  const handlePageChange = (
    newPage: number,
    _: number,
    column: TableColumn<Passenger> | null,
    direction: "asc" | "desc"
  ) => {
    setPage(newPage);
    setSortBy(column);
    setSortDirection(direction);
  };

  const handleRowsPerPageChange = (newRows: number) => {
    setRows(newRows);
  };

  useEffect(() => {
    const fetchPassengers = async () => {
      setLoading(true);
      const result = await window.fetch(
        `http://localhost:4000/data?_page=${page}&_limit=${rows}`,
        {
          method: "GET",
        }
      );
      const json = await result.json();
      const fetchedData = json.map((datum: Passenger) => {
        datum.id = datum._id;
        return datum;
      });
      const sortedData = sortBy
        ? orderBy(fetchedData, sortBy.selector, sortDirection)
        : fetchedData;

      setData(sortedData);
      setTotalData(12);
      setLoading(false);
    };

    fetchPassengers();
  }, [page, rows, sortBy, sortDirection]);

  return (
    <div className="flex flex-col items-center w-full">
      <Table
        title="TABLE"
        indexedDBName="table-1"
        paginationCurrentPage={page}
        columns={columns}
        data={data}
        disabled={loading}
        highlightOnHover={true}
        noDataComponent={
          <div className="p-32 flex flex-col items-center">
            <BanIcon className="w-12 h-12 mb-2" />
            <span>No Data</span>
          </div>
        }
        loading={loading}
        persistTableHead={true}
        actionsInHeader={[
          <h3 key="Show" className="mr-4">
            Show
          </h3>,
          <select key="All" className="mr-4">
            <option>All</option>
          </select>,
          <input
            key="Input Action"
            className="px-3 py-2 rounded border border-solid border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:text-gray-500"
            placeholder="Type Keyword"
          />,
        ]}
        subHeaderComponent={[
          <h3 key="Show Sub" className="mr-4">
            Show
          </h3>,
          <select key="All Sub" className="mr-4">
            <option>All</option>
          </select>,
          <input
            key="Input Sub"
            className="px-3 py-2 rounded border border-solid border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:text-gray-500"
            placeholder="Type Keyword"
          />,
        ]}
        pagination={true}
        paginationDataFromApi={true}
        paginationTotalRows={totalData}
        paginationRowsPerPageOptions={[5, 10, 15]}
        paginationRowsPerPage={rows}
        onPageChange={handlePageChange}
        onChangeRowsPerPage={handleRowsPerPageChange}
        defaultSort="desc"
        selectableRows={true}
        contextMenuForSelectableRows={true}
      />
      <button
        className="py-3 px-4 rounded-2xl mt-6 text-base bg-green-500 font-bold"
        onClick={goToPage}
      >
        Zonk
      </button>
    </div>
  );
};
