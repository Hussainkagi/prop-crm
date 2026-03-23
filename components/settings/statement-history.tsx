import React from "react";

export function StatementHistory() {
  const statements = [
    {
      id: 1,
      date: "2024-03-15",
      amount: "$500",
      status: "Paid",
      reference: "INV-001",
    },
    {
      id: 2,
      date: "2024-03-10",
      amount: "$1,200",
      status: "Paid",
      reference: "INV-002",
    },
    {
      id: 3,
      date: "2024-03-05",
      amount: "$800",
      status: "Pending",
      reference: "INV-003",
    },
    {
      id: 4,
      date: "2024-02-28",
      amount: "$450",
      status: "Paid",
      reference: "INV-004",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Statement History</h2>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Reference
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {statements.map((statement) => (
              <tr key={statement.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{statement.date}</td>
                <td className="px-4 py-3 text-sm">{statement.reference}</td>
                <td className="px-4 py-3 text-sm font-medium">
                  {statement.amount}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      statement.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {statement.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
