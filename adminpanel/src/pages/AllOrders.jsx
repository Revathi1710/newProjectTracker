import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Sidebar from '../component/Sidebar';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = async (page = 1, status = 'all') => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, {
        params: { page, status }
      });
      setOrders(response.data.data);
      setCurrentPage(response.data.meta.current_page);
      setLastPage(response.data.meta.last_page);
      setTotalItems(response.data.meta.total);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  // Handle filter change
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase();
    return !q || o.customer_name?.toLowerCase().includes(q) || o.razorpay_payment_id?.toLowerCase().includes(q);
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 font-sans">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">All Orders</h1>
            <p className="text-sm text-gray-500">Manage {totalItems} total transactions.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status Filter Dropdown/Tabs */}
            <select 
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 dark:text-gray-200"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search name..."
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Si.No</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Payment ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-20 text-gray-400 animate-pulse">Loading orders...</td></tr>
                ) : filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-400">
                      {String((currentPage - 1) * 10 + (index + 1)).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-800 dark:text-white">{order.customer_name}</div>
                      <div className="text-[11px] text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900 dark:text-white">
                      ₹{parseFloat(order.total).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-[11px] font-mono text-gray-400 uppercase">
                      {order.razorpay_payment_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                        order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Showing {orders.length} of {totalItems} orders
            </span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white disabled:opacity-30 transition-all dark:text-white"
              >
                Previous
              </button>
              <button 
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 transition-all shadow-md shadow-blue-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
{/* --- ORDER DETAILS MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white">Order Details</h2>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-1">ID: #{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {/* Items List */}
              <div className="space-y-4 mb-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Purchased Items</p>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img src={`${import.meta.env.VITE_SERVER_URL}/storage/${item.product.images[0].path}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{item.product?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                    </div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">₹{(item.quantity * item.price).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              {/* Shipping & Billing Grid */}
              <div className="grid grid-cols-2 gap-8 border-t border-gray-100 dark:border-gray-700 pt-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Shipping To</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{selectedOrder.customer_name}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {selectedOrder.address}, {selectedOrder.city}<br />
                    {selectedOrder.state} - {selectedOrder.pincode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Summary</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500"><span>Subtotal:</span> <span>₹{parseFloat(selectedOrder.subtotal).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between text-xs text-gray-500"><span>Tax:</span> <span>₹{parseFloat(selectedOrder.tax).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between text-sm font-black text-blue-600 pt-2 border-t border-gray-100 mt-2"><span>Total:</span> <span>₹{parseFloat(selectedOrder.total).toLocaleString('en-IN')}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    
    </div>
  );
};

export default AllOrders;