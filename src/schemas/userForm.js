export const userFormSchema = [
  // ================= GENERAL =================
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    required: true,
    minLength: 2,
    section: "general",
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    minLength: 2,
    section: "general",
  },
  {
    name: "mobile",
    label: "Mobile",
    type: "text",
    required: true,
    validate: (val) => {
    if (!/^[0-9]{10}$/.test(val)) {
      return "Mobile must be 10 digits";
    }
  },
    section: "general",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    section: "general",
  },
  {
  name: "secondaryEmail",
  label: "Secondary Email",
  type: "text",
  section: "general",
  showIf: {
    field: "email",
    exists: true
  }
},
  {
  name: "assignedMR",
  label: "Assigned MR",
  type: "select",
  api: "/users?role=mr", // 🔥 IMPORTANT
  optionLabel: "firstName",
  optionValue: "_id",
  section: "general",
  showIf: { field: "role", equals: "doctor" }
},

  {
  name: "doctorDetailsHeader",
  label: "Doctor Details",
  type: "label",
  section: "general",
  showIf: { field: "role", equals: "doctor" },
},
  {
  name: "clinicName",
  label: "Clinic Name",
  type: "text",
  section: "general",
  showIf: { field: "role", equals: "doctor" }
},
  {
  name: "assignedDoctors",
  label: "Assigned Doctor",
  type: "select",
  api: "/users?role=doctor", // 🔥 IMPORTANT
  optionLabel: "firstName",
  optionValue: "_id",
  section: "general",
  showIf: { field: "role", equals: "mr" }
},
    {
  name: "specialization",
  label: "Specialization Doctor",
  type: "text",
  section: "general",
  showIf: { field: "role", equals: "doctor" }
},
    {
    name: "region",
    label: "Region",
    type: "text",
    section: "general",
    rules: [
    {
      if: { field: "role", equals: "mr" },
      then: { setValue: "North Zone" }
    }
  ]
  },

  // ================= ACCOUNT =================

{
  name: "accountHeader",
  label: "Account Information",
  type: "label",
  section: "account",
},

// 🔵 USERNAME (CREATE ONLY)
{
  name: "username",
  label: "Username",
  type: "text",
  section: "account",
  required: true,
  permissions: {
    view: ["users.create", "users.edit"],
    edit: ["users.create"]
  },
  showIf: (values, mode) => mode === "create"
},

// 🔵 PASSWORD (CREATE ONLY)
{
  name: "password",
  label: "Password",
  type: "text",
  section: "account",
  required: true,
  permissions: {
    view: ["users.create"],
    edit: ["users.create"]
  },
  showIf: (values, mode) => mode === "create"
},

// 🔵 ROLE (CREATE + EDIT)
{
  name: "role",
  label: "Role",
  type: "select",
  section: "account",
  options: [
    { label: "Admin", value: "admin" },
    { label: "Manager", value: "manager" },
    { label: "MR", value: "mr" },
    { label: "Doctor", value: "doctor" },
  ],
  permissions: {
    view: ["users.create", "users.edit"],
    edit: ["users.create", "users.edit"]
  },
  showIf: () => true
},

// 🔵 ACCOUNT STATUS (EDIT ONLY)
{
  name: "isActive",
  label: "Account Status",
  type: "boolean",
  section: "account",
  permissions: {
    view: ["users.edit"],
    edit: ["users.edit"]
  },
  showIf: (values, mode) => mode === "edit"
},

// 🔵 FORCE RESET PASSWORD (EDIT ONLY)
{
  name: "mustResetPassword",
  label: "Force Reset Password",
  type: "boolean",
  section: "account",
  permissions: {
    view: ["users.edit"],
    edit: ["users.edit"]
  },
  showIf: (values, mode) => mode === "edit"
},

// 🔵 RESET PASSWORD BUTTON (EDIT ONLY)
{
  name: "resetPassword",
  label: "Reset Password",
  type: "button",
  section: "account",
  permissions: {
    view: ["users.edit"],
    edit: ["users.edit"]
  },
  showIf: (values, mode) => mode === "edit"
},

// 🔵 EMPLOYMENT STATUS (EDIT ONLY)
{
  name: "employmentStatus",
  label: "Employment Status",
  type: "select",
  section: "account",
  options: [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Left", value: "LEFT" },
  ],
  permissions: {
    view: ["users.edit"],
    edit: ["users.edit"]
  },
  showIf: (values, mode) => mode === "edit"
},

// 🔵 APPROVAL STATUS (EDIT ONLY)
{
  name: "approvalStatus",
  label: "Approval Status",
  type: "select",
  section: "account",
  options: [
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ],
  permissions: {
    view: ["users.edit"],
    edit: ["users.edit"]
  },
  showIf: (values, mode) => mode === "edit"
},

// 🔵 APPROVAL NOTE (CONDITIONAL)
{
  name: "approvalNote",
  label: "Approval Note",
  type: "text",
  section: "account",
  permissions: {
    view: ["users.edit"],
    edit: ["users.edit"]
  },
  showIf: (values, mode) => mode === "edit"
}, 

 
  // ================= ADDRESS =================

  {
  name: "landmark",
  label: "Landmark",
  type: "text",
  section: "address"
},
  {
  name: "area",
  label: "Area",
  type: "text",
  section: "address"
},

  {
  name: "city",
  label: "City",
  type: "text",
  section: "address",
},
  {
  name: "state",
  label: "State",
  type: "text",
  section: "address",
},

{
  name: "clinicAddress",
  label: "Clinic Address",
  type: "text",
  section: "address",
  showIf: { field: "role", equals: "doctor" },
},
  {
  name: "geoLocation",
  label: "Confirm Location",
  type: "location", // Ensure your FormBuilder recognizes this type
  section: "address",
  showIf: (values) => values.role === "doctor",
},
  {
  name: "location_picker",
  label: "Pick Location",
  type: "custom", // Or however your button is defined
  section: "address",
  showIf: { field: "role", equals: "doctor" } // 🚩 ONLY shown for doctors
},
   {
  name: "clinicLocation",
  label: "Clinic Location",
  type: "object",
  component: "LocationPicker",
  section: "address",
  fields: {
    latitude: "number",
    longitude: "number",
  },
  showIf: { field: "role", equals: "doctor" },
},
  
];
