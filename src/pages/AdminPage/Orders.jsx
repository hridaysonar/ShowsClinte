import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import LoadingSpinner from "../../components/Shared/Spinner/LoadingSpinner";
import Swal from "sweetalert2";

const Orders = () => {
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");

  // ✅ Fetch All Orders (Admin)
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/orders");
      return res.data;
    },
  });

  // ✅ Handle Delete
  const handleDelete = async (id) => {
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
        Swal.fire("Error", "Failed to delete order.", "error");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  // ✅ Handle Edit (Open Modal)
  const handleEdit = (order) => {
    setEditingOrder(order);
    setUpdatedStatus(order.status || "Pending");
  };

  // ✅ Handle Status Update
  const handleUpdate = async (e) => {
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
        Swal.fire("❌ Failed", "Could not update order status", "error");
      }
    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-center text-red-600 font-medium mt-10">
        Failed to load orders.
      </div>
    );

  return (
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
                  {/* Index */}
                  <td className="border px-4 py-3 font-medium text-gray-700">
                    {idx + 1}
                  </td>

                  {/* Customer Info */}
                  <td className="border px-4 py-3 text-gray-600">
                    <p className="font-semibold">{order.fullName}</p>
                    <p>{order.phone}</p>
                    <p>{order.email}</p>
                    <p>
                      {order.streetAddress}, {order.city} ({order.postalCode})
                    </p>
                  </td>

                  {/* Product Details */}
                  <td className="border px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.image}
                        alt={order.productTitle}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                      <div>
                        <p className="font-semibold">{order.productTitle}</p>
                        <p className="text-xs text-gray-500">
                          Category: {order.category}
                        </p>
                        <p className="text-xs text-gray-500">
                          Size: {order.shoeSize || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Color: {order.color || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Order Info */}
                  <td className="border px-4 py-3 text-gray-600">
                    <p>
                      ৳ <strong>{order.price || order.coverageRange}</strong>
                    </p>
                    <p>Qty: {order.quantity}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.orderDate).toLocaleString()}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="border px-4 py-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "Done"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "Success"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="border px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(order)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(order._id)}
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

      {/* ✅ Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
              Update Order Status
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
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
    </div>
  );
};

export default Orders;
