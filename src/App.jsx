import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";

export default function FabricStockPrototype() {
  const initialStock = [];

  const parseFabric = (text) => {
    const match = text.match(/^(\d+)\s+(.*?)\s+(C#\d+)$/i);

    if (!match) {
      return {
        code: "",
        fabricName: text,
        colourCode: "",
      };
    }

    return {
      code: match[1],
      fabricName: match[2],
      colourCode: match[3],
    };
  };

  const [stock, setStock] = useState([]);

  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);

      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      const parsedData = [];

      jsonData.forEach((row, index) => {
        const rowString = row.join(" ").replace(/\s+/g, " ").trim();

        if (!rowString) return;

        const match = rowString.match(/(\d+)\s+(.*?)\s+(C#\d+)/i);

        if (match) {
          parsedData.push({
            id: index + 1,
            code: match[1],
            fabricName: match[2],
            colourCode: match[3],
            quantity:
              Number(row.find((cell) => !isNaN(cell) && cell !== "")) || 0,
          });
        }
      });

      console.log(parsedData);

      setStock(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const [newEntry, setNewEntry] = useState({
    code: "",
    fabricName: "",
    colourCode: "",
    quantity: "",
  });

  const [search, setSearch] = useState("");

  const filteredStock = useMemo(() => {
    return stock.filter((item) => {
      const searchText =
        `${item.code} ${item.fabricName} ${item.colourCode}`.toLowerCase();
      return searchText.includes(search.toLowerCase());
    });
  }, [stock, search]);

  const addStock = () => {
    if (!newEntry.code || !newEntry.fabricName || !newEntry.colourCode) return;

    const newItem = {
      id: Date.now(),
      code: newEntry.code,
      fabricName: newEntry.fabricName,
      colourCode: newEntry.colourCode,
      quantity: Number(newEntry.quantity || 0),
    };

    setStock((prev) => [newItem, ...prev]);

    setNewEntry({
      code: "",
      fabricName: "",
      colourCode: "",
      quantity: "",
    });
  };

  const updateQuantity = (id, value) => {
    setStock((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Number(value),
            }
          : item
      )
    );
  };

  const totalStock = stock.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Fabric Stock Live Update</h1>
            <p className="text-gray-600 mt-1">
              Live stock tracker with automatic Excel upload, parsing and
              real-time stock updates.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md px-5 py-4">
            <div className="text-sm text-gray-500">Total Quantity</div>
            <div className="text-3xl font-bold">{totalStock}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Upload Excel Stock File</h2>
              <p className="text-gray-600 text-sm mt-1">
                Upload your STOCK SUMMARY Excel file and the system will
                automatically fetch all rows.
              </p>
            </div>

            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleExcelUpload}
              className="border rounded-xl px-4 py-3"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-md p-5 space-y-4">
            <h2 className="text-xl font-semibold">Add New Fabric</h2>

            <input
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Fabric Code (Example: 5007)"
              value={newEntry.code}
              onChange={(e) =>
                setNewEntry((prev) => ({ ...prev, code: e.target.value }))
              }
            />

            <input
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Fabric Name"
              value={newEntry.fabricName}
              onChange={(e) =>
                setNewEntry((prev) => ({ ...prev, fabricName: e.target.value }))
              }
            />

            <input
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Colour Code (Example: C#2)"
              value={newEntry.colourCode}
              onChange={(e) =>
                setNewEntry((prev) => ({ ...prev, colourCode: e.target.value }))
              }
            />

            <input
              type="number"
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Quantity"
              value={newEntry.quantity}
              onChange={(e) =>
                setNewEntry((prev) => ({ ...prev, quantity: e.target.value }))
              }
            />

            <button
              onClick={addStock}
              className="w-full bg-black text-white rounded-xl py-3 font-medium hover:opacity-90"
            >
              Add Stock Item
            </button>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-5 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
              <h2 className="text-xl font-semibold">Current Stock</h2>

              <input
                className="border rounded-xl px-4 py-3 w-full md:w-80"
                placeholder="Search fabric code, name or colour"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 rounded-l-xl">Fabric Code</th>
                    <th className="p-3">Fabric Name</th>
                    <th className="p-3">Colour Code</th>
                    <th className="p-3 rounded-r-xl">Quantity</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStock.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium">{item.code}</td>
                      <td className="p-3">{item.fabricName}</td>
                      <td className="p-3">{item.colourCode}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, e.target.value)
                          }
                          className="border rounded-lg px-3 py-2 w-28"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-xl font-semibold mb-3">
            Automatic Excel Parsing Structure
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Fabric Code</div>
              <div className="text-lg font-semibold">5005</div>
            </div>

            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Fabric Name</div>
              <div className="text-lg font-semibold">VADALASH JAMSHA</div>
            </div>

            <div className="border rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Colour Code</div>
              <div className="text-lg font-semibold">C#1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
