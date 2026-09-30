import { useEffect, useState } from "react";
import {
  PackageOpen,
  PackageCheck,
  ArrowRightLeft,
  UserCheck,
  PackageX,
  X,
} from "lucide-react";

import Layout from "../components/Layout";
import api from "../services/api";


function Dashboard() {

  const [data, setData] = useState(null);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] =
    useState([]);

  const [filters, setFilters] = useState({
    base: "",
    equipment_type: "",
    start_date: "",
    end_date: "",
  });

  const [showMovement, setShowMovement] =
    useState(false);

  const role = localStorage.getItem("role");


  const loadMasterData = async () => {
    try {
      const [baseResponse, equipmentResponse] =
        await Promise.all([
          api.get("bases/"),
          api.get("equipment-types/"),
        ]);

      setBases(baseResponse.data);
      setEquipmentTypes(equipmentResponse.data);

    } catch (error) {
      console.error(error);
    }
  };


  const loadDashboard = async () => {

    try {

      const params = {};

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      const response = await api.get(
        "dashboard/",
        { params }
      );

      setData(response.data);

    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    loadMasterData();
  }, []);


  useEffect(() => {
    loadDashboard();
  }, [filters]);


  const handleFilter = (e) => {

    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };


  const resetFilters = () => {

    setFilters({
      base: "",
      equipment_type: "",
      start_date: "",
      end_date: "",
    });
  };


  if (!data) {
    return (
      <Layout>
        <div className="loading">
          Loading dashboard...
        </div>
      </Layout>
    );
  }


  return (
    <Layout>

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Asset inventory and movement overview
          </p>
        </div>
      </div>


      <div className="filter-card">

        {role === "ADMIN" && (
          <select
            name="base"
            value={filters.base}
            onChange={handleFilter}
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
          name="equipment_type"
          value={filters.equipment_type}
          onChange={handleFilter}
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
          name="start_date"
          value={filters.start_date}
          onChange={handleFilter}
        />

        <input
          type="date"
          name="end_date"
          value={filters.end_date}
          onChange={handleFilter}
        />


        <button
          className="secondary-button"
          onClick={resetFilters}
        >
          Reset
        </button>

      </div>


      <div className="metrics-grid">

        <MetricCard
          title="Opening Balance"
          value={data.opening_balance}
          icon={<PackageOpen />}
        />

        <MetricCard
          title="Closing Balance"
          value={data.closing_balance}
          icon={<PackageCheck />}
        />

        <MetricCard
          title="Net Movement"
          value={data.net_movement}
          icon={<ArrowRightLeft />}
          clickable
          onClick={() =>
            setShowMovement(true)
          }
        />

        <MetricCard
          title="Assigned"
          value={data.assigned}
          icon={<UserCheck />}
        />

        <MetricCard
          title="Expended"
          value={data.expended}
          icon={<PackageX />}
        />

      </div>


      <div className="dashboard-info-card">

        <h3>Inventory Summary</h3>

        <div className="summary-row">
          <span>Purchases</span>
          <strong>
            {data.movement_details.purchases}
          </strong>
        </div>

        <div className="summary-row">
          <span>Transfers In</span>
          <strong>
            {data.movement_details.transfer_in}
          </strong>
        </div>

        <div className="summary-row">
          <span>Transfers Out</span>
          <strong>
            {data.movement_details.transfer_out}
          </strong>
        </div>

      </div>


      {showMovement && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowMovement(false)
          }
        >

          <div
            className="modal-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>Net Movement</h2>
                <p>
                  Detailed movement breakdown
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() =>
                  setShowMovement(false)
                }
              >
                <X />
              </button>

            </div>


            <div className="movement-detail">

              <div>
                <span>Purchases</span>
                <strong>
                  +{data.movement_details.purchases}
                </strong>
              </div>

              <div>
                <span>Transfer In</span>
                <strong>
                  +{data.movement_details.transfer_in}
                </strong>
              </div>

              <div>
                <span>Transfer Out</span>
                <strong>
                  -{data.movement_details.transfer_out}
                </strong>
              </div>

              <div className="movement-total">
                <span>Net Movement</span>
                <strong>
                  {data.net_movement}
                </strong>
              </div>

            </div>

          </div>

        </div>

      )}

    </Layout>
  );
}


function MetricCard({
  title,
  value,
  icon,
  clickable,
  onClick,
}) {

  return (
    <div
      className={
        clickable
          ? "metric-card clickable"
          : "metric-card"
      }
      onClick={onClick}
    >

      <div className="metric-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>
        <h2>{value}</h2>
      </div>

    </div>
  );
}


export default Dashboard;