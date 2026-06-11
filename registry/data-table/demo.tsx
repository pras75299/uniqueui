// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "data-table/basic": ({ theme = "dark" }) => {
    const rows = [
      { id: "1", name: "Alex Kim", role: "Engineer", department: "Platform", status: "Active", joined: new Date("2023-01-09") },
      { id: "2", name: "Sara Chen", role: "Designer", department: "Product", status: "Active", joined: new Date("2023-03-14") },
      { id: "3", name: "Jordan Lee", role: "PM", department: "Growth", status: "Away", joined: new Date("2023-06-02") },
      { id: "4", name: "Maya Patel", role: "Engineer", department: "Platform", status: "Active", joined: new Date("2024-01-22") },
      { id: "5", name: "Ryan Wu", role: "Designer", department: "Product", status: "Away", joined: new Date("2024-02-11") },
      { id: "6", name: "Priya Shah", role: "PM", department: "Growth", status: "Active", joined: new Date("2024-04-30") },
      { id: "7", name: "Sam Rivera", role: "Engineer", department: "Platform", status: "Active", joined: new Date("2024-05-18") },
      { id: "8", name: "Jess Taylor", role: "Designer", department: "Product", status: "Active", joined: new Date("2024-06-07") },
      { id: "9", name: "Noah Park", role: "Engineer", department: "Growth", status: "Active", joined: new Date("2024-08-25") },
      { id: "10", name: "Lena Voss", role: "Analyst", department: "Platform", status: "Away", joined: new Date("2024-10-13") },
      { id: "11", name: "Omar Haddad", role: "Engineer", department: "Product", status: "Active", joined: new Date("2025-01-06") },
      { id: "12", name: "Ivy Nguyen", role: "PM", department: "Platform", status: "Active", joined: new Date("2025-03-19") },
    ];
    type Row = (typeof rows)[number];
    return (
      <div className="w-full p-6">
        <DataTable
          data={rows}
          getRowId={(row: Row) => row.id}
          preset="basic"
          pageSize={6}
          theme={theme}
          columns={[
            { id: "name", header: "Name", accessor: (row: Row) => row.name },
            { id: "role", header: "Role", accessor: (row: Row) => row.role },
            { id: "department", header: "Department", accessor: (row: Row) => row.department },
            { id: "status", header: "Status", accessor: (row: Row) => row.status },
            {
              id: "joined",
              header: "Joined",
              accessor: (row: Row) => row.joined,
              cell: (row: Row) => row.joined.toISOString().slice(0, 10),
            },
          ]}
        />
      </div>
    );
  },
  "data-table/advanced": ({ theme = "dark" }) => {
    const rows = Array.from({ length: 24 }, (_, i) => ({
      id: `ord-${i + 1}`,
      order: `#${String(2400 + i)}`,
      customer: ["Alex Kim", "Sara Chen", "Jordan Lee", "Maya Patel", "Ryan Wu", "Priya Shah"][i % 6],
      total: Math.round((i * 53.7 + 24) * 100) / 100,
      status: ["Paid", "Pending", "Refunded"][i % 3],
      placed: new Date(2026, i % 12, (i % 27) + 1),
    }));
    type Row = (typeof rows)[number];
    return (
      <div className="w-full p-6">
        <DataTable
          data={rows}
          getRowId={(row: Row) => row.id}
          preset="advanced"
          pageSize={8}
          theme={theme}
          border
          renderExpanded={(row: Row) => (
            <div className="text-xs opacity-80">
              Order {row.order} for {row.customer} — placed{" "}
              {row.placed.toDateString()}, status {row.status}.
            </div>
          )}
          columns={[
            { id: "order", header: "Order", accessor: (row: Row) => row.order },
            { id: "customer", header: "Customer", accessor: (row: Row) => row.customer },
            {
              id: "total",
              header: "Total",
              accessor: (row: Row) => row.total,
              cell: (row: Row) => `$${row.total.toFixed(2)}`,
              align: "right",
            },
            { id: "status", header: "Status", accessor: (row: Row) => row.status },
            {
              id: "placed",
              header: "Placed",
              accessor: (row: Row) => row.placed,
              cell: (row: Row) => row.placed.toISOString().slice(0, 10),
            },
          ]}
        />
      </div>
    );
  },
  "data-table/virtualized": ({ theme = "dark" }) => {
    const rows = Array.from({ length: 10000 }, (_, i) => ({
      id: `evt-${i}`,
      event: `Event ${i + 1}`,
      service: ["api", "web", "worker", "cron"][i % 4],
      latency: ((i * 37) % 900) + 12,
      status: i % 13 === 0 ? "error" : "ok",
    }));
    type Row = (typeof rows)[number];
    return (
      <div className="w-full p-6">
        <DataTable
          data={rows}
          getRowId={(row: Row) => row.id}
          preset="enterprise"
          maxHeight={400}
          rowHeight={44}
          theme={theme}
          columns={[
            { id: "event", header: "Event", accessor: (row: Row) => row.event },
            { id: "service", header: "Service", accessor: (row: Row) => row.service },
            {
              id: "latency",
              header: "Latency (ms)",
              accessor: (row: Row) => row.latency,
              align: "right",
            },
            { id: "status", header: "Status", accessor: (row: Row) => row.status },
          ]}
        />
      </div>
    );
  },
  "data-table/grouped": ({ theme = "dark" }) => {
    const rows = [
      { id: "1", name: "Alex Kim", team: "Platform", region: "West", oncall: "Yes" },
      { id: "2", name: "Maya Patel", team: "Platform", region: "West", oncall: "No" },
      { id: "3", name: "Sam Rivera", team: "Platform", region: "East", oncall: "No" },
      { id: "4", name: "Sara Chen", team: "Product", region: "East", oncall: "Yes" },
      { id: "5", name: "Ryan Wu", team: "Product", region: "Central", oncall: "No" },
      { id: "6", name: "Jordan Lee", team: "Growth", region: "Central", oncall: "No" },
      { id: "7", name: "Priya Shah", team: "Growth", region: "West", oncall: "Yes" },
    ];
    type Row = (typeof rows)[number];
    return (
      <div className="w-full p-6">
        <DataTable
          data={rows}
          getRowId={(row: Row) => row.id}
          groupBy="team"
          border
          theme={theme}
          columns={[
            { id: "team", header: "Team", accessor: (row: Row) => row.team },
            { id: "name", header: "Name", accessor: (row: Row) => row.name },
            { id: "region", header: "Region", accessor: (row: Row) => row.region, rowSpan: true },
            { id: "oncall", header: "On call", accessor: (row: Row) => row.oncall },
          ]}
        />
      </div>
    );
  },
  "data-table/column-groups": ({ theme = "dark" }) => {
    const rows = [
      { id: "1", name: "Alex Kim", q1: 42, q2: 51, h1Target: 90, q3: 48, q4: 60, h2Target: 105, owner: "Platform" },
      { id: "2", name: "Sara Chen", q1: 38, q2: 47, h1Target: 88, q3: 52, q4: 58, h2Target: 102, owner: "Product" },
      { id: "3", name: "Jordan Lee", q1: 51, q2: 44, h1Target: 95, q3: 47, q4: 63, h2Target: 110, owner: "Growth" },
      { id: "4", name: "Maya Patel", q1: 45, q2: 55, h1Target: 92, q3: 50, q4: 61, h2Target: 108, owner: "Platform" },
    ];
    type Row = (typeof rows)[number];
    return (
      <div className="w-full p-6">
        <DataTable
          data={rows}
          getRowId={(row: Row) => row.id}
          sortable
          border
          theme={theme}
          columns={[
            {
              id: "name",
              header: "Name",
              accessor: (row: Row) => row.name,
              freeze: "left",
              width: 140,
            },
            {
              id: "h1",
              header: "H1",
              accessor: () => null,
              columns: [
                { id: "q1", header: "Q1", accessor: (row: Row) => row.q1, align: "right" },
                { id: "q2", header: "Q2", accessor: (row: Row) => row.q2, align: "right" },
                { id: "h1Target", header: "Target", accessor: (row: Row) => row.h1Target, align: "right" },
              ],
            },
            {
              id: "h2",
              header: "H2",
              accessor: () => null,
              columns: [
                { id: "q3", header: "Q3", accessor: (row: Row) => row.q3, align: "right" },
                { id: "q4", header: "Q4", accessor: (row: Row) => row.q4, align: "right" },
                { id: "h2Target", header: "Target", accessor: (row: Row) => row.h2Target, align: "right" },
              ],
            },
            { id: "owner", header: "Owner", accessor: (row: Row) => row.owner },
          ]}
        />
      </div>
    );
  }
} as const;
