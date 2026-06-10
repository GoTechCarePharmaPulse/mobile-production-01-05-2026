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
  label: "Assigned Doctors",
  type: "select",
  multiple: true,
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
  showIf: () => false

},

// 🔵 USERNAME (CREATE ONLY)
{
  name: "username",
  label: "Username",
  type: "text",
  section: "account",
  required: true,
  editable: false,
  permissions: {
    view: ["users.create", "users.update"],
    edit: ["users.create", "users.update"]
  },
  showIf: () => true
},

// 🔵 PASSWORD (CREATE ONLY)
{
  name: "password",
  label: "Password",
  type: "password",
  section: "account",
  required: false,
  permissions: {
    view: ["users.create", "users.update"],
    edit: ["users.create", "users.update"] // allow editing if needed
  },
  showIf: (values, mode) => mode === "create"
},

// 🔵 NEW PASSWORD (RESET ONLY)
{
  name: "newPassword",
  label: "New Password",
  type: "password",
  section: "account",
  required: false,
  permissions: {
    edit: ["users.update"]
  },
  showIf: (values, mode) =>
    mode === "edit" &&
    values.mustResetPassword === true
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
    view: ["users.create", "users.update"],
    edit: ["users.create", "users.update"]
  },
  showIf: () => true
},

// 🔵 ACCOUNT STATUS (EDIT ONLY)
{
  name: "isActive",
  label: "Account Status",
  type: "boolean",
  editable: true,
  section: "account",
  permissions: {
    view: ["users.update"],
    edit: ["users.update"]
  },
  showIf: (values, mode) => mode === "edit"
},

// 🔵 FORCE RESET PASSWORD (EDIT ONLY)
{
  name: "mustResetPassword",
  label: "Force Reset Password",
  type: "boolean",
  editable: true,
  section: "account",
  permissions: {
    view: ["users.update"],
    edit: ["users.update"]
  },
  showIf: (values, mode) => mode === "edit"
},

// 🔵 EMPLOYMENT STATUS (EDIT ONLY)
{
  name: "employmentStatus",
  label: "Employment Status",
  type: "select",
  editable: true,
  section: "account",
  options: [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Left", value: "LEFT" },
  ],
  permissions: {
    edit: ["users.update"],
  },
  showIf: (values, mode) => mode === "edit"
},
{
  name: "isVerified",
  label: "Verified User",
  type: "boolean",
  editable: true,
  section: "account",
    permissions: {
    edit: ["users.update"],
  },

  showIf: (values, mode) => mode === "edit",
}, 
 {
  name: "isLocked",
  label: "Lock Account",
  type: "boolean",
  editable: true,
  section: "account",
  permissions: {
    edit: ["users.update"],
  },

  showIf: (values, mode) => mode === "edit",
},

// 🔵 APPROVAL STATUS (EDIT ONLY)
{
  name: "approvalStatus",
  label: "Approval Status",
  type: "select",
  editable: true,
  section: "account",
  options: [
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ],
  permissions: {
    view: ["users.update"],
    edit: ["users.update"]
  },
  showIf: (values, mode) => mode === "edit"
},

// 🔵 APPROVAL NOTE (CONDITIONAL)
{
  name: "approvalNote",
  label: "Approval Note",
  type: "text",
  editable: true,
  section: "account",
  permissions: {
    view: ["users.update"],
    edit: ["users.update"]
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
    edit: ["users.update"],
  },
  showIf: (values, mode) => mode === "edit"
},
 
  // ================= ADDRESS =================

   {
  name: "address.line1",
  label: "Address Line1",
  type: "text",
  section: "address"
},
  {
  name: "address.line2",
  label: "Address Line2",
  type: "text",
  section: "address"
},
  {
  name: "address.landmark",
  label: "Landmark",
  type: "text",
  section: "address"
},
  {
  name: "address.area",
  label: "Area",
  type: "text",
  section: "address"
},

  {
  name: "address.city",
  label: "City",
  type: "text",
  section: "address",
},
  {
  name: "address.state",
  label: "State",
  type: "text",
  section: "address",
},
  {
  name: "address.country",
  label: "Country",
  type: "text",
  section: "address"
},
  {
  name: "address.pincode",
  label: "Pincode",
  type: "text",
  section: "address"
},
 {
  name: "geoLocation",
  label: "Clinic Location",
  component: "LocationPicker",
  section: "address",
  showIf: { field: "role", equals: "doctor" },
},
{
  name: "clinicLocation.latitude",
  label: "Clinic Latitude",
  type: "text",
  section: "address",
  editable: false,
  showIf: { field: "role", equals: "doctor" },
},
{
  name: "clinicLocation.longitude",
  label: "Clinic Longitude",
  type: "text",
  section: "address",
  editable: false,
  showIf: { field: "role", equals: "doctor" },
},
];
