import { useEffect, useState } from "react";
import { ArrowRightLeft } from "lucide-react";

import Layout from "../components/Layout";
import api from "../services/api";


function Transfers() {
  const role = localStorage.getItem("role");
  const userBaseId = localStorage.getItem("base_id");

  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [form, setForm] = useState({
    from_base: role === "ADMIN" ? "" : userBaseId || "",
    to_base: "",
    equipment_type: "",
    quantity: "",
    transfer_date: "",
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


  const loadTransfers = async () => {
    try {
      const params = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params[key] = value;
        }
      });

      const response = await api.get(
        "transfers/",
        { params }
      );

      setTransfers(response.data);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    loadMasterData();
  }, []);


  useEffect(() => {
    loadTransfers();
  }, [filters]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (form.from_base === form.to_base) {
      setError(
        "Source and destination bases cannot be the same."
      );
      return;
    }

    try {
      await api.post("transfers/", {
        ...form,
        quantity: Number(form.quantity),
      });

      setMessage(
        "Transfer recorded successfully."
      );

      setForm({
        from_base:
          role === "ADMIN"
            ? ""
            : userBaseId || "",
        to_base: "",
        equipment_type: "",
        quantity: "",
        transfer_date: "",
      });

      loadTransfers();

    } catch (err) {

      const responseData = err.response?.data;

      if (responseData?.non_field_errors) {
        setError(responseData.non_field_errors[0]);
      } else {
        setError(
          responseData?.detail ||
          "Unable to record transfer."
        );
      }
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
        <h1>Transfers</h1>
        <p>
          Transfer assets between bases and
          review movement history
        </p>
      </div>


      <div className="content-grid">

        <div className="form-card">

          <div className="section-title">
            <ArrowRightLeft size={20} />
            <h3>New Transfer</h3>
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

            <label>From Base</label>

            <select
              value={form.from_base}
              onChange={(e) =>
                setForm({
                  ...form,
                  from_base: e.target.value,
                })
              }
              disabled={role !== "ADMIN"}
              required
            >
              <option value="">
                Select Source Base
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


            <label>To Base</label>

            <select
              value={form.to_base}
              onChange={(e) =>
                setForm({
                  ...form,
                  to_base: e.target.value,
                })
              }
              required
            >
              <option value="">
                Select Destination Base
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


            <label>Transfer Date</label>

            <input
              type="date"
              value={form.transfer_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  transfer_date: e.target.value,
                })
              }
              required
            />


            <button
              type="submit"
              className="primary-button"
            >
              Transfer Asset
            </button>

          </form>

        </div>


        <div className="table-card">

          <h3>Transfer History</h3>

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
                  <th>From</th>
                  <th>To</th>
                  <th>Equipment</th>
                  <th>Qty</th>
                  <th>Created By</th>
                </tr>
              </thead>

              <tbody>

                {transfers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="empty-row"
                    >
                      No transfers found.
                    </td>
                  </tr>
                ) : (
                  transfers.map((transfer) => (
                    <tr key={transfer.id}>

                      <td>
                        {transfer.transfer_date}
                      </td>

                      <td>
                        {transfer.from_base_name}
                      </td>

                      <td>
                        {transfer.to_base_name}
                      </td>

                      <td>
                        {transfer.equipment_type_name}
                      </td>

                      <td>
                        {transfer.quantity}
                      </td>

                      <td>
                        {transfer.created_by_username}
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


export default Transfers;