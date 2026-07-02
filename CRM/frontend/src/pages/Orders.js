import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ product_id: '', quantity: 1 }],
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        customer_id: parseInt(formData.customer_id, 10),
        items: formData.items
          .filter((item) => item.product_id)
          .map((item) => ({
            product_id: parseInt(item.product_id, 10),
            quantity: parseInt(item.quantity, 10),
          })),
      };
      await axios.post('/api/orders', orderData);
      fetchOrders();
      fetchProducts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      alert('Error creating order: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await axios.delete(`/api/orders/${id}`);
      fetchOrders();
    } catch (error) {
      alert('Error deleting order: ' + error.message);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`/api/orders/${id}`, { status });
      fetchOrders();
    } catch (error) {
      alert('Error updating order: ' + error.message);
    }
  };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { product_id: '', quantity: 1 }] });
  };

  const removeItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const resetForm = () => {
    setFormData({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Create Order
        </button>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>Order #{order.id}</h3>
                <p className="order-customer">{order.customer_name || 'Unknown Customer'}</p>
                <p className="order-date">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="order-status-section">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span className="order-total">${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
            <div className="order-items">
              <h4>Items</h4>
              <ul>
                {order.items?.map((item, idx) => (
                  <li key={idx}>
                    {item.product_name} × {item.quantity} = $
                    {(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(order.id)}>
              Delete
            </button>
          </div>
        ))}
        {!orders.length && <p className="empty-msg">No orders yet.</p>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer *</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Order Items *</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      required
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.price} (stock: {p.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      required
                    />
                    {formData.items.length > 1 && (
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addItem}>
                  + Add Item
                </button>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Order
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
