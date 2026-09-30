import { useEffect, useState } from "react";
import { UserCheck, PackageX } from "lucide-react";

import Layout from "../components/Layout";
import api from "../services/api";


function Operations() {
  const role = localStorage.getItem("role");
  const userBaseId = localStorage.getItem("base_id");

  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);

  const [assignmentForm, setAssignmentForm] = useState({
    base: role === "ADMIN" ? "" : userBaseId || "",
    equipment_type: "",
    assigned_to: "",
    quantity: "",
    assignment_date: "",
  });

  const [expenditureForm, setExpenditureForm] = useState({
    base: role === "ADMIN" ? "" : userBaseId || "",
    equipment_type: "",
    quantity: "",
    reason: "",
    expenditure_date: "",
  });

  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [expenditureMessage, setExpenditureMessage] = useState("");
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


  const loadOperations = async () => {
    try {
      const [assignmentRes, expenditureRes] =
        await Promise.all([
          api.get("operations/assignments/"),
          api.get("operations/expenditures/"),
        ]);

      setAssignments(assignmentRes.data);
      setExpenditures(expenditureRes.data);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    loadMasterData();
    loadOperations();
  }, []);


  const submitAssignment = async (e) => {
    e.preventDefault();

    setError("");
    setAssignmentMessage("");

    try {
      await api.post(
        "operations/assignments/",
        {
          ...assignmentForm,
          quantity: Number(assignmentForm.quantity),
        }
      );

      setAssignmentMessage(
        "Asset assigned successfully."
      );

      setAssignmentForm({
        base: role === "ADMIN" ? "" : userBaseId || "",
        equipment_type: "",
        assigned_to: "",
        quantity: "",
        assignment_date: "",
      });

      loadOperations();

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to assign asset."
      );
    }
  };


  const submitExpenditure = async (e) => {
    e.preventDefault();

    setError("");
    setExpenditureMessage("");

    try {
      await api.post(
        "operations/expenditures/",
        {
          ...expenditureForm,
          quantity: Number(expenditureForm.quantity),
        }
      );

      setExpenditureMessage(
        "Expenditure recorded successfully."
      );

      setExpenditureForm({
        base: role === "ADMIN" ? "" : userBaseId || "",
        equipment_type: "",
        quantity: "",
        reason: "",
        expenditure_date: "",
      });

      loadOperations();

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to record expenditure."
      );
    }
  };


  return (
    <Layout>

      <div className="page-header">
        <h1>Assignments & Expenditures</h1>
        <p>
          Manage asset assignments and record
          expended assets
        </p>
      </div>


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      <div className="operations-grid">

        {/* ASSIGNMENT FORM */}

        <div className="form-card">

          <div className="section-title">
            <UserCheck size={20} />
            <h3>Assign Asset</h3>
          </div>

          {assignmentMessage && (
            <div className="success-message">
              {assignmentMessage}
            </div>
          )}

          <form onSubmit={submitAssignment}>

            <label>Base</label>

            <select
              value={assignmentForm.base}
              disabled={role !== "ADMIN"}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  base: e.target.value,
                })
              }
              required
            >
              <option value="">Select Base</option>

              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </select>


            <label>Equipment Type</label>

            <select
              value={assignmentForm.equipment_type}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
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


            <label>Assigned To</label>

            <input
              type="text"
              placeholder="Personnel name / ID"
              value={assignmentForm.assigned_to}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  assigned_to: e.target.value,
                })
              }
              required
            />


            <label>Quantity</label>

            <input
              type="number"
              min="1"
              value={assignmentForm.quantity}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  quantity: e.target.value,
                })
              }
              required
            />


            <label>Assignment Date</label>

            <input
              type="date"
              value={assignmentForm.assignment_date}
              onChange={(e) =>
                setAssignmentForm({
                  ...assignmentForm,
                  assignment_date: e.target.value,
                })
              }
              required
            />


            <button className="primary-button">
              Assign Asset
            </button>

          </form>

        </div>


        {/* EXPENDITURE FORM */}

        <div className="form-card">

          <div className="section-title">
            <PackageX size={20} />
            <h3>Record Expenditure</h3>
          </div>

          {expenditureMessage && (
            <div className="success-message">
              {expenditureMessage}
            </div>
          )}

          <form onSubmit={submitExpenditure}>

            <label>Base</label>

            <select
              value={expenditureForm.base}
              disabled={role !== "ADMIN"}
              onChange={(e) =>
                setExpenditureForm({
                  ...expenditureForm,
                  base: e.target.value,
                })
              }
              required
            >
              <option value="">Select Base</option>

              {bases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </select>


            <label>Equipment Type</label>

            <select
              value={expenditureForm.equipment_type}
              onChange={(e) =>
                setExpenditureForm({
                  ...expenditureForm,
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
              value={expenditureForm.quantity}
              onChange={(e) =>
                setExpenditureForm({
                  ...expenditureForm,
                  quantity: e.target.value,
                })
              }
              required
            />


            <label>Reason</label>

            <input
              type="text"
              placeholder="Training, operation, damage..."
              value={expenditureForm.reason}
              onChange={(e) =>
                setExpenditureForm({
                  ...expenditureForm,
                  reason: e.target.value,
                })
              }
              required
            />


            <label>Expenditure Date</label>

            <input
              type="date"
              value={expenditureForm.expenditure_date}
              onChange={(e) =>
                setExpenditureForm({
                  ...expenditureForm,
                  expenditure_date: e.target.value,
                })
              }
              required
            />


            <button className="primary-button">
              Record Expenditure
            </button>

          </form>

        </div>

      </div>


      {/* ASSIGNMENT HISTORY */}

      <div className="table-card operations-table">

        <h3>Assignment History</h3>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Date</th>
                <th>Base</th>
                <th>Equipment</th>
                <th>Assigned To</th>
                <th>Quantity</th>
                <th>Created By</th>
              </tr>
            </thead>

            <tbody>

              {assignments.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-row"
                  >
                    No assignments found.
                  </td>
                </tr>
              ) : (
                assignments.map((item) => (
                  <tr key={item.id}>

                    <td>{item.assignment_date}</td>
                    <td>{item.base_name}</td>
                    <td>
                      {item.equipment_type_name}
                    </td>
                    <td>{item.assigned_to}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {item.created_by_username}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* EXPENDITURE HISTORY */}

      <div className="table-card operations-table">

        <h3>Expenditure History</h3>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Date</th>
                <th>Base</th>
                <th>Equipment</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Created By</th>
              </tr>
            </thead>

            <tbody>

              {expenditures.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-row"
                  >
                    No expenditures found.
                  </td>
                </tr>
              ) : (
                expenditures.map((item) => (
                  <tr key={item.id}>

                    <td>
                      {item.expenditure_date}
                    </td>

                    <td>{item.base_name}</td>

                    <td>
                      {item.equipment_type_name}
                    </td>

                    <td>{item.quantity}</td>
                    <td>{item.reason}</td>

                    <td>
                      {item.created_by_username}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </Layout>
  );
}


export default Operations;