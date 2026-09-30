import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import Layout from "../components/Layout";
import api from "../services/api";


function Purchases() {
  const role = localStorage.getItem("role");
  const userBaseId = localStorage.getItem("base_id");

  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [form, setForm] = useState({
    base: role === "ADMIN" ? "" : userBaseId || "",
    equipment_type: "",
    quantity: "",
    purchase_date: "",
  });

  const [filters, setFilters] = useState({
    base: "",
    equipment_type: "",
    date: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  const loadMasterData = async () => {
    try {
      const [baseRes, equipmentRes] = await Promise.all([
        api.get("bases/"),
        api.get("equipment-types/"),
      ]);

      setBases(baseRes.data);
      setEquipmentTypes(equipmentRes.data);
    } catch (err) {
      console.error(err);
    }
  };


  const loadPurchases = async () => {
    try {
      const params = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params[key] = value;
        }
      });

      const response = await api.get("purchases/", {
        params,
      });

      setPurchases(response.data);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    loadMasterData();
  }, []);


  useEffect(() => {
    loadPurchases();
  }, [filters]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      await api.post("purchases/", {
        ...form,
        quantity: Number(form.quantity),
      });

      setMessage("Purchase recorded successfully.");

      setForm({
        base: role === "ADMIN" ? "" : userBaseId || "",
        equipment_type: "",
        quantity: "",
        purchase_date: "",
      });

      loadPurchases();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to record purchase."
      );
    }
  };


  const resetFilters = () => {
    setFilters({
      base: "",
      equipment_type: "",
      date: "",
    });
  };


  return (
    <Layout>

      <div className="page-header">
        <div>
          <h1>Purchases</h1>
          <p>
            Record and review asset purchases
          </p>
        </div>
      </div>


      <div className="content-grid">

        <div className="form-card">

          <div className="section-title">
            <Plus size={20} />
            <h3>Record Purchase</h3>
          </div>

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <label>Base</label>

            <select
              value={form.base}
              onChange={(e) =>
                setForm({
                  ...form,
                  base: e.target.value,
                })
              }
              disabled={role !== "ADMIN"}
              required
            >
              <option value="">
                Select Base
              </option>

              {bases.map((base) => (
                <option
                  key={base.id}
                  value={base.id}
                >
                  {base.name}
                </option>
              ))}
            </select>


            <label>Equipment Type</label>

            <select
              value={form.equipment_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  equipment_type: e.target.value,
                })
              }
              required
            >
              <option value="">
                Select Equipment
              </option>

              {equipmentTypes.map((equipment) => (
                <option
                  key={equipment.id}
                  value={equipment.id}
                >
                  {equipment.name}
                </option>
              ))}
            </select>


            <label>Quantity</label>

            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity: e.target.value,
                })
              }
              required
            />


            <label>Purchase Date</label>

            <input
              type="date"
              value={form.purchase_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  purchase_date: e.target.value,
                })
              }
              required
            />


            <button
              type="submit"
              className="primary-button"
            >
              Record Purchase
            </button>

          </form>

        </div>


        <div className="table-card">

          <h3>Purchase History</h3>

          <div className="table-filters">

            {role === "ADMIN" && (
              <select
                value={filters.base}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    base: e.target.value,
                  })
                }
              >
                <option value="">
                  All Bases
                </option>

                {bases.map((base) => (
                  <option
                    key={base.id}
                    value={base.id}
                  >
                    {base.name}
                  </option>
                ))}
              </select>
            )}


            <select
              value={filters.equipment_type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  equipment_type: e.target.value,
                })
              }
            >
              <option value="">
                All Equipment
              </option>

              {equipmentTypes.map((equipment) => (
                <option
                  key={equipment.id}
                  value={equipment.id}
                >
                  {equipment.name}
                </option>
              ))}
            </select>


            <input
              type="date"
              value={filters.date}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  date: e.target.value,
                })
              }
            />

            <button
              className="secondary-button"
              onClick={resetFilters}
            >
              Reset
            </button>

          </div>


          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Base</th>
                  <th>Equipment</th>
                  <th>Quantity</th>
                  <th>Created By</th>
                </tr>
              </thead>

              <tbody>

                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No purchases found.
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase.id}>

                      <td>
                        {purchase.purchase_date}
                      </td>

                      <td>
                        {purchase.base_name}
                      </td>

                      <td>
                        {purchase.equipment_type_name}
                      </td>

                      <td>
                        {purchase.quantity}
                      </td>

                      <td>
                        {purchase.created_by_username}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </Layout>
  );
}


export default Purchases;