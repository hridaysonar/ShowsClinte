import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";

const MyOrders = () => {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  // ✅ Fetch logged-in user's orders
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["myOrders", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/orders?email=${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email && !loading,
  });

  // ✅ Delete Order
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await axiosSecure.delete(`/orders/${id}`);
      if (res.data.success) {
        alert("🗑️ Order deleted successfully!");
        queryClient.invalidateQueries(["myOrders"]);
      } else {
        alert("Failed to delete order.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting order.");
    }
  };

  // ✅ Loading & Error States
  if (loading || isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-10 w-10 rounded-full border-t-4 border-green-600"></div>
        <p className="ml-3 text-gray-600 font-medium">Loading your orders...</p>
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-red-600 font-semibold py-10">
        Failed to load orders: {error.message}
      </div>
    );

  if (!orders || orders.length === 0)
    return (
      <div className="p-10 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">My Orders</h1>
        <p className="text-gray-500 text-lg">
          You haven’t placed any orders yet.
        </p>
      </div>
    );

  // ✅ Orders Table
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        My Orders
      </h1>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-4 py-3 text-left">#</th>
              <th className="border px-4 py-3 text-left">Product</th>
              <th className="border px-4 py-3 text-left">Details</th>
              <th className="border px-4 py-3 text-left">Order Info</th>
              <th className="border px-4 py-3 text-center">Status</th>
              <th className="border px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, idx) => (
              <tr
                key={order._id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Serial */}
                <td className="border px-4 py-3 font-medium text-gray-600">
                  {idx + 1}
                </td>

                {/* Product */}
                <td className="border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.image}
                      alt={order.productTitle}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {order.productTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.category || "General"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Details */}
                <td className="border px-4 py-3 text-gray-700">
                  <p>Size: {order.size || "N/A"}</p>
                  <p>Color: {order.color || "N/A"}</p>
                  <p>Qty: {order.quantity || 1}</p>
                </td>

                {/* Info */}
                <td className="border px-4 py-3 text-gray-700">
                  <p>
                    ৳ <strong>{order.price || "N/A"}</strong>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Buyer: {order.email || "Unknown"}
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
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </td>

                {/* Delete Button Only */}
                <td className="border px-4 py-3 text-center">
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyOrders;
