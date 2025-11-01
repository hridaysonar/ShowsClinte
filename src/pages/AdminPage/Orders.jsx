import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import LoadingSpinner from "../../components/Shared/Spinner/LoadingSpinner";
import Swal from "sweetalert2";

const statusBadges = (status) =>
  ({
    Pending: "bg-yellow-100 text-yellow-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
    Done: "bg-blue-100 text-blue-700",
    Success: "bg-emerald-100 text-emerald-700",
  }[status] || "bg-gray-100 text-gray-700");

const money = (v) =>
  typeof v === "number" && isFinite(v) ? v.toLocaleString() : v || "—";

const Orders = () => {
  const queryClient = useQueryClient();

  // ====== Local UI state ======
  const [editingOrder, setEditingOrder] = useState(null); // for /orders (general)
  const [updatedStatus, setUpdatedStatus] = useState("");

  const [editingFoodOrder, setEditingFoodOrder] = useState(null); // for /foodorders
  const [updatedFoodStatus, setUpdatedFoodStatus] = useState("");

  // ====== Queries ======
  // General orders (/orders)
  const {
    data: orders = [],
    isLoading: loadingOrders,
    isError: errorOrders,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/orders");
      return res.data;
    },
  });

  // Food orders (/foodorders)
  const {
    data: foodOrdersPayload,
    isLoading: loadingFoodOrders,
    isError: errorFoodOrders,
  } = useQuery({
    queryKey: ["foodorders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/foodorders", {
        // চাইলে এখানে query param দিতে পারো: { params: { email, page, limit } }
      });
      return res.data; // { success, items, total, ... }
    },
  });

  const foodOrders = foodOrdersPayload?.items || [];

  // ====== Handlers: /orders (general) ======
  const handleDeleteOrder = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This order will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await axiosSecure.delete(`/orders/${id}`);
      if (res.data.success) {
        Swal.fire("Deleted!", "Order has been removed.", "success");
        queryClient.invalidateQueries(["orders"]);
      } else {
        Swal.fire("Error", res.data.message || "Failed to delete order.", "error");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setUpdatedStatus(order.status || "Pending");
  };

  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosSecure.patch(`/orders/${editingOrder._id}`, {
        status: updatedStatus,
      });
      if (res.data.success) {
        Swal.fire("✅ Updated!", "Order status updated successfully!", "success");
        setEditingOrder(null);
        queryClient.invalidateQueries(["orders"]);
      } else {
        Swal.fire("❌ Failed", res.data.message || "Could not update order status", "error");
      }
    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  // ====== Handlers: /foodorders ======
  const handleDeleteFoodOrder = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This food order will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await axiosSecure.delete(`/foodorders/${id}`);
      if (res.data.success) {
        Swal.fire("Deleted!", "Food order has been removed.", "success");
        queryClient.invalidateQueries(["foodorders"]);
      } else {
        Swal.fire("Error", res.data.message || "Failed to delete food order.", "error");
      }
    } catch (error) {
      console.error("Delete Food Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  const handleEditFoodOrder = (order) => {
    setEditingFoodOrder(order);
    setUpdatedFoodStatus(order.status || "Pending");
  };

  const handleUpdateFoodOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosSecure.patch(`/foodorders/${editingFoodOrder._id}`, {
        status: updatedFoodStatus,
      });
      if (res.data.success) {
        Swal.fire("✅ Updated!", "Food order status updated successfully!", "success");
        setEditingFoodOrder(null);
        queryClient.invalidateQueries(["foodorders"]);
      } else {
        Swal.fire("❌ Failed", res.data.message || "Could not update order status", "error");
      }
    } catch (error) {
      console.error("Food Update Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  // ====== Loading/Error UI ======
  if (loadingOrders || loadingFoodOrders) return <LoadingSpinner />;
  if (errorOrders || errorFoodOrders)
    return (
      <div className="text-center text-red-600 font-medium mt-10">
        Failed to load orders.
      </div>
    );

  return (
    <div className="space-y-10">
      {/* ============= General Orders Table (/orders) ============= */}
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          All Customer Orders
        </h2>

        {orders.length === 0 ? (
          <p className="text-center text-gray-500">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr className="text-gray-700 text-sm">
                  <th className="border px-4 py-3 text-left">#</th>
                  <th className="border px-4 py-3 text-left">Customer Info</th>
                  <th className="border px-4 py-3 text-left">Product Details</th>
                  <th className="border px-4 py-3 text-left">Order Info</th>
                  <th className="border px-4 py-3 text-left">Status</th>
                  <th className="border px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order, idx) => (
                  <tr key={order._id} className="hover:bg-gray-50 text-sm">
                    <td className="border px-4 py-3 font-medium text-gray-700">
                      {idx + 1}
                    </td>

                    <td className="border px-4 py-3 text-gray-600">
                      <p className="font-semibold">{order.fullName || order.name}</p>
                      <p>{order.phone}</p>
                      <p>{order.email}</p>
                      <p>
                        {order.streetAddress || order.address},{" "}
                        {order.city} {order.postalCode ? `(${order.postalCode})` : ""}
                      </p>
                    </td>

                    <td className="border px-4 py-3 text-gray-600">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.image}
                          alt={order.productTitle || order.title}
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                        <div>
                          <p className="font-semibold">{order.productTitle || order.title}</p>
                          <p className="text-xs text-gray-500">
                            Category: {order.category || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Size: {order.shoeSize || order.size || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Color: {order.color || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="border px-4 py-3 text-gray-600">
                      <p>
                        ৳ <strong>{money(order.price || order.coverageRange)}</strong>
                      </p>
                      <p>Qty: {order.quantity || 1}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleString()
                          : order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </td>

                    <td className="border px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadges(
                          order.status || "Pending"
                        )}`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>

                    <td className="border px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============= Food Orders Table (/foodorders) ============= */}
      <div className="p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Food Orders
        </h2>

        {foodOrders.length === 0 ? (
          <p className="text-center text-gray-500">No food orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr className="text-gray-700 text-sm">
                  <th className="border px-4 py-3 text-left">#</th>
                  <th className="border px-4 py-3 text-left">Customer</th>
                  <th className="border px-4 py-3 text-left">Product</th>
                  <th className="border px-4 py-3 text-left">Price & Qty</th>
                  <th className="border px-4 py-3 text-left">Status</th>
                  <th className="border px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {foodOrders.map((fo, idx) => (
                  <tr key={fo._id} className="hover:bg-gray-50 text-sm">
                    <td className="border px-4 py-3 font-medium text-gray-700">{idx + 1}</td>

                    <td className="border px-4 py-3 text-gray-600">
                      <p className="font-semibold">{fo.name || "—"}</p>
                      <p>{fo.phone || "—"}</p>
                      <p>{fo.email}</p>
                      <p className="text-xs">
                        {fo.address || "—"}
                      </p>
                    </td>

                    <td className="border px-4 py-3 text-gray-600">
                      <div className="flex items-center gap-3">
                        <img
                          src={fo.image}
                          alt={fo.title}
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                        <div>
                          <p className="font-semibold">{fo.title}</p>
                          <p className="text-xs text-gray-500">PID: {fo.productId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="border px-4 py-3 text-gray-600">
                      <p>Unit: ৳ {money(fo.unitPrice)} /kg</p>
                      <p>Qty: {fo.quantityKg} kg</p>
                      <p>
                        Total: <strong>৳ {money(fo.totalPrice)}</strong>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {fo.createdAt ? new Date(fo.createdAt).toLocaleString() : ""}
                      </p>
                    </td>

                    <td className="border px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadges(
                          fo.status || "Pending"
                        )}`}
                      >
                        {fo.status || "Pending"}
                      </span>
                    </td>

                    <td className="border px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditFoodOrder(fo)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFoodOrder(fo._id)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== Modal: Edit general order status ===== */}
      {editingOrder && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
              Update Order Status
            </h2>

            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <select
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Delivered">Delivered</option>
                <option value="Done">Done</option>
                <option value="Success">Success</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Modal: Edit food order status ===== */}
      {editingFoodOrder && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
              Update Food Order Status
            </h2>

            <form onSubmit={handleUpdateFoodOrder} className="space-y-4">
              <select
                value={updatedFoodStatus}
                onChange={(e) => setUpdatedFoodStatus(e.target.value)}
                className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Delivered">Delivered</option>
                <option value="Done">Done</option>
                <option value="Success">Success</option>
              </select>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFoodOrder(null)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
