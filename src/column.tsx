import { TableColumn } from "react-data-table-component";
import { CheckCircleIcon } from "@heroicons/react/solid";

import { Data } from "data";

export const columns: TableColumn<Data>[] = [
  {
    name: "Store Id",
    selector: (row) => row["storeId"],
    sortable: true,
  },
  {
    name: "Store Name",
    selector: (row) => row["storeName"],
    sortable: true,
  },
  {
    name: "City",
    selector: (row) => row["city"],
    sortable: true,
  },
  {
    name: "Address",
    selector: (row) => row["address"],
    sortable: true,
  },
  {
    name: "Owner Phone Number",
    selector: (row) => row["ownerPhoneNumber"],
  },
  {
    name: "Owner Name",
    selector: (row) => row["ownerName"],
    sortable: true,
  },
  {
    name: "Created Date",
    selector: (row) => row["createdAt"],
  },
  {
    name: "Status",
    selector: (row) => row["status"],
    sortable: true,
    cell: (row) => (
      <CheckCircleIcon
        className={`${row.status === true ? "color-green" : ""} icon`}
      />
    ),
  },
  {
    name: "Supplier Status",
    selector: (row) => row["supplierStatus"],
    sortable: true,
  },
  {
    name: "Actions",
    selector: (row) => row["actions"],
  },
];
