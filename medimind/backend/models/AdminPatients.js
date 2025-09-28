const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hash this like users
  role: { type: String, default: "admin" }    // for RBAC
});
