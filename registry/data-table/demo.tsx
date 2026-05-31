// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {
  "data-table/default": ({ theme = "dark" }) => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "email", label: "Email" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
      { key: "status", label: "Status" },
      { key: "joined", label: "Joined" },
    ];
    const data = [
      {
        name: "Alex Kim",
        role: "Engineer",
        email: "alex@example.com",
        department: "Platform",
        status: "Active",
        joined: "2023-01",
      },
      {
        name: "Sara Chen",
        role: "Designer",
        email: "sara@example.com",
        department: "Product",
        status: "Active",
        joined: "2023-03",
      },
      {
        name: "Jordan Lee",
        role: "PM",
        email: "jordan@example.com",
        department: "Growth",
        status: "Away",
        joined: "2023-06",
      },
      {
        name: "Maya Patel",
        role: "Engineer",
        email: "maya@example.com",
        department: "Platform",
        status: "Active",
        joined: "2024-01",
      },
      {
        name: "Ryan Wu",
        role: "Designer",
        email: "ryan@example.com",
        department: "Product",
        status: "Away",
        joined: "2024-02",
      },
      {
        name: "Priya Shah",
        role: "PM",
        email: "priya@example.com",
        department: "Growth",
        status: "Active",
        joined: "2024-04",
      },
      {
        name: "Sam Rivera",
        role: "Engineer",
        email: "sam@example.com",
        department: "Platform",
        status: "Active",
        joined: "2024-05",
      },
      {
        name: "Jess Taylor",
        role: "Designer",
        email: "jess@example.com",
        department: "Product",
        status: "Active",
        joined: "2024-06",
      },
    ];
    return (
      <div className="w-full p-6">
        <DataTable
          columns={columns}
          data={withDemoLocation(data)}
          paginated
          pageSize={5}
          theme={theme}
        />
      </div>
    );
  },
  "data-table/freeze-left": ({ theme = "dark" }) => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "department", label: "Department" },
      { key: "region", label: "Region" },
      { key: "location", label: "Location" },
      { key: "project", label: "Project" },
      { key: "division", label: "Division" },
      { key: "site", label: "Site" },
      { key: "timezone", label: "TZ" },
      { key: "costCenter", label: "Cost ctr" },
      { key: "joined", label: "Joined" },
      { key: "status", label: "Status" },
      { key: "actions", label: "Actions" },
    ];
    const data = [
      {
        id: "1",
        name: "Alex Kim",
        email: "alex@example.com",
        role: "Engineer",
        department: "Platform",
        region: "West",
        joined: "2023-01",
        status: "Active",
        actions: "Edit · View",
      },
      {
        id: "2",
        name: "Sara Chen",
        email: "sara@example.com",
        role: "Designer",
        department: "Product",
        region: "East",
        joined: "2023-03",
        status: "Active",
        actions: "Edit · View",
      },
      {
        id: "3",
        name: "Jordan Lee",
        email: "jordan@example.com",
        role: "PM",
        department: "Growth",
        region: "Central",
        joined: "2023-06",
        status: "Away",
        actions: "Edit · View",
      },
      {
        id: "4",
        name: "Maya Patel",
        email: "maya@example.com",
        role: "Engineer",
        department: "Platform",
        region: "West",
        joined: "2024-01",
        status: "Active",
        actions: "Edit · View",
      },
      {
        id: "5",
        name: "Ryan Wu",
        email: "ryan@example.com",
        role: "Designer",
        department: "Product",
        region: "East",
        joined: "2024-02",
        status: "Away",
        actions: "Edit · View",
      },
      {
        id: "6",
        name: "Priya Shah",
        email: "priya@example.com",
        role: "PM",
        department: "Growth",
        region: "Central",
        joined: "2024-04",
        status: "Active",
        actions: "Edit · View",
      },
      {
        id: "7",
        name: "Sam Rivera",
        email: "sam@example.com",
        role: "Engineer",
        department: "Platform",
        region: "West",
        joined: "2024-05",
        status: "Active",
        actions: "Edit · View",
      },
      {
        id: "8",
        name: "Jess Taylor",
        email: "jess@example.com",
        role: "Designer",
        department: "Product",
        region: "East",
        joined: "2024-06",
        status: "Active",
        actions: "Edit · View",
      },
    ];
    return (
      <div className="w-full p-6">
        <DataTable
          columns={columns}
          data={withDemoLocation(withDemoFreezeExtras(data))}
          freezeColumns="left"
          freezeLeftCount={2}
          paginated
          pageSize={5}
          theme={theme}
        />
      </div>
    );
  },
  "data-table/freeze-right": ({ theme = "dark" }) => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "department", label: "Department" },
      { key: "region", label: "Region" },
      { key: "project", label: "Project" },
      { key: "division", label: "Division" },
      { key: "site", label: "Site" },
      { key: "timezone", label: "TZ" },
      { key: "costCenter", label: "Cost ctr" },
      { key: "location", label: "Location" },
      { key: "status", label: "Status" },
      { key: "email", label: "Email" },
      { key: "joined", label: "Joined" },
      { key: "lastActive", label: "Last active" },
      { key: "actions", label: "Actions" },
    ];
    const data = [
      {
        name: "Alex Kim",
        role: "Engineer",
        department: "Platform",
        region: "West",
        status: "Active",
        email: "alex@example.com",
        joined: "2023-01",
        lastActive: "2024-03",
        actions: "Edit · View",
      },
      {
        name: "Sara Chen",
        role: "Designer",
        department: "Product",
        region: "East",
        status: "Active",
        email: "sara@example.com",
        joined: "2023-03",
        lastActive: "2024-03",
        actions: "Edit · View",
      },
      {
        name: "Jordan Lee",
        role: "PM",
        department: "Growth",
        region: "Central",
        status: "Away",
        email: "jordan@example.com",
        joined: "2023-06",
        lastActive: "2024-02",
        actions: "Edit · View",
      },
      {
        name: "Maya Patel",
        role: "Engineer",
        department: "Platform",
        region: "West",
        status: "Active",
        email: "maya@example.com",
        joined: "2024-01",
        lastActive: "2024-03",
        actions: "Edit · View",
      },
      {
        name: "Ryan Wu",
        role: "Designer",
        department: "Product",
        region: "East",
        status: "Away",
        email: "ryan@example.com",
        joined: "2024-02",
        lastActive: "2024-01",
        actions: "Edit · View",
      },
      {
        name: "Priya Shah",
        role: "PM",
        department: "Growth",
        region: "Central",
        status: "Active",
        email: "priya@example.com",
        joined: "2024-04",
        lastActive: "2024-03",
        actions: "Edit · View",
      },
      {
        name: "Sam Rivera",
        role: "Engineer",
        department: "Platform",
        region: "West",
        status: "Active",
        email: "sam@example.com",
        joined: "2024-05",
        lastActive: "2024-03",
        actions: "Edit · View",
      },
      {
        name: "Jess Taylor",
        role: "Designer",
        department: "Product",
        region: "East",
        status: "Active",
        email: "jess@example.com",
        joined: "2024-06",
        lastActive: "2024-03",
        actions: "Edit · View",
      },
    ];
    return (
      <div className="w-full p-6">
        <DataTable
          columns={columns}
          data={withDemoLocation(withDemoFreezeExtras(data))}
          freezeColumns="right"
          freezeRightCount={1}
          paginated
          pageSize={5}
          theme={theme}
        />
      </div>
    );
  },
  "data-table/freeze-both": ({ theme = "dark" }) => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "department", label: "Department" },
      { key: "region", label: "Region" },
      { key: "location", label: "Location" },
      { key: "project", label: "Project" },
      { key: "division", label: "Division" },
      { key: "site", label: "Site" },
      { key: "timezone", label: "TZ" },
      { key: "costCenter", label: "Cost ctr" },
      { key: "joined", label: "Joined" },
      { key: "status", label: "Status" },
      { key: "actions", label: "Actions" },
    ];
    const data = [
      {
        id: "1",
        name: "Alex Kim",
        email: "alex@example.com",
        role: "Engineer",
        department: "Platform",
        region: "West",
        joined: "2023-01",
        status: "Active",
        actions: "Edit · View",
      },
      {
        id: "2",
        name: "Sara Chen",
        email: "sara@example.com",
        role: "Designer",
        department: "Product",
        region: "East",
        joined: "2023-03",
        status: "Active",
        actions: "Edit · View",
      },
      {
        id: "3",
        name: "Jordan Lee",
        email: "jordan@example.com",
        role: "PM",
        department: "Growth",
        region: "Central",
        joined: "2023-06",
        status: "Away",
        actions: "Edit · View",
      },
      {
        id: "4",
        name: "Maya Patel",
        email: "maya@example.com",
        role: "Engineer",
        department: "Platform",
        region: "West",
        joined: "2024-01",
        status: "Active",
        actions: "Edit · View",
      },
      {
        id: "5",
        name: "Ryan Wu",
        email: "ryan@example.com",
        role: "Designer",
        department: "Product",
        region: "East",
        joined: "2024-02",
        status: "Away",
        actions: "Edit · View",
      },
      {
        id: "6",
        name: "Priya Shah",
        email: "priya@example.com",
        role: "PM",
        department: "Growth",
        region: "Central",
        joined: "2024-04",
        status: "Active",
        actions: "Edit · View",
      },
      {
        id: "7",
        name: "Sam Rivera",
        email: "sam@example.com",
        role: "Engineer",
        department: "Platform",
        region: "West",
        joined: "2024-05",
        status: "Active",
        actions: "Edit · View",
      },
      {
        id: "8",
        name: "Jess Taylor",
        email: "jess@example.com",
        role: "Designer",
        department: "Product",
        region: "East",
        joined: "2024-06",
        status: "Active",
        actions: "Edit · View",
      },
    ];
    return (
      <div className="w-full p-6">
        <DataTable
          columns={columns}
          data={withDemoLocation(withDemoFreezeExtras(data))}
          freezeColumns="both"
          freezeLeftCount={2}
          freezeRightCount={1}
          paginated
          pageSize={5}
          theme={theme}
        />
      </div>
    );
  },
  "data-table/bordered": ({ theme = "dark" }) => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "email", label: "Email" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
      { key: "status", label: "Status" },
      { key: "joined", label: "Joined" },
    ];
    const data = [
      {
        name: "Alex Kim",
        role: "Engineer",
        email: "alex@example.com",
        department: "Platform",
        status: "Active",
        joined: "2023-01",
      },
      {
        name: "Sara Chen",
        role: "Designer",
        email: "sara@example.com",
        department: "Product",
        status: "Active",
        joined: "2023-03",
      },
      {
        name: "Jordan Lee",
        role: "PM",
        email: "jordan@example.com",
        department: "Growth",
        status: "Away",
        joined: "2023-06",
      },
      {
        name: "Maya Patel",
        role: "Engineer",
        email: "maya@example.com",
        department: "Platform",
        status: "Active",
        joined: "2024-01",
      },
      {
        name: "Ryan Wu",
        role: "Designer",
        email: "ryan@example.com",
        department: "Product",
        status: "Away",
        joined: "2024-02",
      },
      {
        name: "Priya Shah",
        role: "PM",
        email: "priya@example.com",
        department: "Growth",
        status: "Active",
        joined: "2024-04",
      },
      {
        name: "Sam Rivera",
        role: "Engineer",
        email: "sam@example.com",
        department: "Platform",
        status: "Active",
        joined: "2024-05",
      },
      {
        name: "Jess Taylor",
        role: "Designer",
        email: "jess@example.com",
        department: "Product",
        status: "Active",
        joined: "2024-06",
      },
    ];
    return (
      <div className="w-full p-6">
        <DataTable
          columns={columns}
          data={withDemoLocation(data)}
          border
          paginated
          pageSize={5}
          theme={theme}
        />
      </div>
    );
  },
  "data-table/sortable": ({ theme = "dark" }) => {
    const columns = [
      { key: "name", label: "Name", sortKey: "name" },
      { key: "role", label: "Role", sortKey: "role" },
      { key: "department", label: "Department", sortKey: "department" },
      { key: "location", label: "Location", sortKey: "location" },
      { key: "joined", label: "Joined", sortKey: "joined" },
      { key: "status", label: "Status", sortKey: "status" },
    ];
    const data = [
      {
        name: "Jordan Lee",
        role: "PM",
        department: "Growth",
        joined: "2024-03",
        status: "Away",
      },
      {
        name: "Alex Kim",
        role: "Engineer",
        department: "Platform",
        joined: "2024-01",
        status: "Active",
      },
      {
        name: "Sara Chen",
        role: "Designer",
        department: "Product",
        joined: "2024-02",
        status: "Active",
      },
      {
        name: "Maya Patel",
        role: "Engineer",
        department: "Platform",
        joined: "2023-11",
        status: "Active",
      },
      {
        name: "Ryan Wu",
        role: "Designer",
        department: "Product",
        joined: "2024-05",
        status: "Away",
      },
      {
        name: "Priya Shah",
        role: "PM",
        department: "Growth",
        joined: "2023-08",
        status: "Active",
      },
      {
        name: "Sam Rivera",
        role: "Engineer",
        department: "Platform",
        joined: "2024-06",
        status: "Active",
      },
      {
        name: "Jess Taylor",
        role: "Designer",
        department: "Product",
        joined: "2023-09",
        status: "Active",
      },
    ];
    return (
      <div className="w-full p-6">
        <DataTable
          columns={columns}
          data={withDemoLocation(data)}
          sortable
          paginated
          pageSize={5}
          theme={theme}
        />
      </div>
    );
  },
  "data-table/custom-colors": ({ theme = "dark" }) => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "email", label: "Email" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
      { key: "status", label: "Status" },
      { key: "joined", label: "Joined" },
    ];
    const data = [
      {
        name: "Alex Kim",
        role: "Engineer",
        email: "alex@example.com",
        department: "Platform",
        status: "Active",
        joined: "2023-01",
      },
      {
        name: "Sara Chen",
        role: "Designer",
        email: "sara@example.com",
        department: "Product",
        status: "Active",
        joined: "2023-03",
      },
      {
        name: "Jordan Lee",
        role: "PM",
        email: "jordan@example.com",
        department: "Growth",
        status: "Away",
        joined: "2023-06",
      },
      {
        name: "Maya Patel",
        role: "Engineer",
        email: "maya@example.com",
        department: "Platform",
        status: "Active",
        joined: "2024-01",
      },
      {
        name: "Ryan Wu",
        role: "Designer",
        email: "ryan@example.com",
        department: "Product",
        status: "Away",
        joined: "2024-02",
      },
      {
        name: "Priya Shah",
        role: "PM",
        email: "priya@example.com",
        department: "Growth",
        status: "Active",
        joined: "2024-04",
      },
      {
        name: "Sam Rivera",
        role: "Engineer",
        email: "sam@example.com",
        department: "Platform",
        status: "Active",
        joined: "2024-05",
      },
      {
        name: "Jess Taylor",
        role: "Designer",
        email: "jess@example.com",
        department: "Product",
        status: "Active",
        joined: "2024-06",
      },
    ];
    return (
      <div className="w-full p-6">
        <DataTable
          columns={columns}
          data={withDemoLocation(data)}
          headerTextColor="text-purple-900"
          bodyTextColor="text-neutral-800"
          headerBackground="bg-purple-100"
          bodyBackground="bg-purple-50/50"
          paginated
          pageSize={5}
          border
          theme={theme}
        />
      </div>
    );
  },
  "data-table/full": ({ theme = "dark" }) => {
    const columns = [
      { key: "id", label: "ID" },
      { key: "name", label: "Name", sortKey: "name" },
      { key: "role", label: "Role", sortKey: "role" },
      { key: "department", label: "Dept" },
      { key: "region", label: "Region" },
      { key: "location", label: "Location" },
      { key: "project", label: "Project" },
      { key: "division", label: "Division" },
      { key: "site", label: "Site" },
      { key: "timezone", label: "TZ" },
      { key: "costCenter", label: "Cost ctr" },
      { key: "joined", label: "Joined" },
      { key: "actions", label: "Actions" },
    ];
    const data = [
      {
        id: "1",
        name: "Jordan Lee",
        role: "PM",
        department: "Growth",
        region: "Central",
        joined: "2023-06",
        actions: "Edit",
      },
      {
        id: "2",
        name: "Alex Kim",
        role: "Engineer",
        department: "Platform",
        region: "West",
        joined: "2023-01",
        actions: "Edit",
      },
      {
        id: "3",
        name: "Sara Chen",
        role: "Designer",
        department: "Product",
        region: "East",
        joined: "2023-03",
        actions: "Edit",
      },
      {
        id: "4",
        name: "Maya Patel",
        role: "Engineer",
        department: "Platform",
        region: "West",
        joined: "2024-01",
        actions: "Edit",
      },
      {
        id: "5",
        name: "Ryan Wu",
        role: "Designer",
        department: "Product",
        region: "East",
        joined: "2024-02",
        actions: "Edit",
      },
      {
        id: "6",
        name: "Priya Shah",
        role: "PM",
        department: "Growth",
        region: "Central",
        joined: "2024-04",
        actions: "Edit",
      },
      {
        id: "7",
        name: "Sam Rivera",
        role: "Engineer",
        department: "Platform",
        region: "West",
        joined: "2024-05",
        actions: "Edit",
      },
      {
        id: "8",
        name: "Jess Taylor",
        role: "Designer",
        department: "Product",
        region: "East",
        joined: "2024-06",
        actions: "Edit",
      },
    ];
    return (
      <div className="w-full p-6">
        <DataTable
          columns={columns}
          data={withDemoLocation(withDemoFreezeExtras(data))}
          freezeColumns="left"
          freezeLeftCount={1}
          headerTextColor="text-neutral-100"
          bodyTextColor="text-neutral-300"
          headerBackground="bg-neutral-800"
          bodyBackground="bg-neutral-950"
          border
          sortable
          paginated
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
          onPageChange={(page, pageSize) =>
            console.log("page changed", page, "pageSize", pageSize)
          }
          theme={theme}
        />
      </div>
    );
  }} as const;
