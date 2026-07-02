const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbPath = path.join(__dirname, 'crm.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);
});

// Products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.post('/api/products', (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body;
  db.run(
    'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, stock || 0, category, image_url],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

app.put('/api/products/:id', (req, res) => {
  const { name, description, price, stock, category, image_url } = req.body;
  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ? WHERE id = ?',
    [name, description, price, stock, category, image_url, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product updated successfully' });
    }
  );
});

app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted successfully' });
  });
});

// Customers
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/customers', (req, res) => {
  const { name, email, phone, company, address } = req.body;
  db.run(
    'INSERT INTO customers (name, email, phone, company, address) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, company, address],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

app.put('/api/customers/:id', (req, res) => {
  const { name, email, phone, company, address } = req.body;
  db.run(
    'UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, address = ? WHERE id = ?',
    [name, email, phone, company, address, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Customer updated successfully' });
    }
  );
});

app.delete('/api/customers/:id', (req, res) => {
  db.run('DELETE FROM customers WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Customer deleted successfully' });
  });
});

// Orders
app.get('/api/orders', (req, res) => {
  db.all(
    `SELECT o.*, c.name as customer_name
     FROM orders o
     LEFT JOIN customers c ON o.customer_id = c.id
     ORDER BY o.created_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) return res.json([]);

      let pending = rows.length;
      const orders = [];

      rows.forEach((order, i) => {
        db.all(
          `SELECT oi.*, p.name as product_name
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id],
          (err2, items) => {
            orders[i] = { ...order, items: items || [] };
            pending -= 1;
            if (pending === 0) res.json(orders);
          }
        );
      });
    }
  );
});

app.post('/api/orders', (req, res) => {
  const { customer_id, items } = req.body;

  if (!customer_id || !items?.length) {
    return res.status(400).json({ error: 'Customer and items required' });
  }

  let total = 0;
  let index = 0;

  const finishOrder = () => {
    db.run(
      'INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, ?)',
      [customer_id, total, 'pending'],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const orderId = this.lastID;

        items.forEach((item) => {
          db.get('SELECT price FROM products WHERE id = ?', [item.product_id], (err2, product) => {
            if (!product) return;
            db.run(
              'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
              [orderId, item.product_id, item.quantity, product.price]
            );
            db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [
              item.quantity,
              item.product_id,
            ]);
          });
        });

        res.json({ id: orderId, total_amount: total, message: 'Order created successfully' });
      }
    );
  };

  const validateNext = () => {
    if (index >= items.length) return finishOrder();
    const item = items[index];
    db.get('SELECT price, stock FROM products WHERE id = ?', [item.product_id], (err, product) => {
      if (err || !product) return res.status(400).json({ error: 'Invalid product' });
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${item.product_id}` });
      }
      total += product.price * item.quantity;
      index += 1;
      validateNext();
    });
  };

  validateNext();
});

app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Order updated successfully' });
  });
});

app.delete('/api/orders/:id', (req, res) => {
  db.run('DELETE FROM order_items WHERE order_id = ?', [req.params.id], () => {
    db.run('DELETE FROM orders WHERE id = ?', [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Order deleted successfully' });
    });
  });
});

// Analytics
app.get('/api/analytics/stats', (req, res) => {
  const stats = {};

  db.get('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"', (err, row) => {
    stats.totalRevenue = row?.total || 0;

    db.get('SELECT COUNT(*) as count FROM orders', (err2, row2) => {
      stats.totalOrders = row2?.count || 0;

      db.get('SELECT COUNT(*) as count FROM customers', (err3, row3) => {
        stats.totalCustomers = row3?.count || 0;

        db.get('SELECT COUNT(*) as count FROM products', (err4, row4) => {
          stats.totalProducts = row4?.count || 0;

          db.all('SELECT status, COUNT(*) as count FROM orders GROUP BY status', (err5, rows) => {
            stats.ordersByStatus = rows || [];

            db.all(
              `SELECT DATE(created_at) as date, SUM(total_amount) as revenue
               FROM orders
               WHERE status = "completed" AND created_at >= datetime('now', '-30 days')
               GROUP BY DATE(created_at)
               ORDER BY date`,
              (err6, revRows) => {
                stats.revenueByDay = revRows || [];

                db.all(
                  `SELECT p.name, SUM(oi.quantity) as total_sold,
                          SUM(oi.quantity * oi.price) as revenue
                   FROM order_items oi
                   JOIN products p ON oi.product_id = p.id
                   JOIN orders o ON oi.order_id = o.id
                   WHERE o.status = "completed"
                   GROUP BY p.id
                   ORDER BY total_sold DESC
                   LIMIT 5`,
                  (err7, topRows) => {
                    stats.topProducts = topRows || [];
                    res.json(stats);
                  }
                );
              }
            );
          });
        });
      });
    });
  });
});

app.get('/api/dashboard/stats', (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    stats.totalProducts = row?.count || 0;

    db.get('SELECT COUNT(*) as count FROM customers', (err2, row2) => {
      stats.totalCustomers = row2?.count || 0;

      db.get('SELECT COUNT(*) as count FROM orders', (err3, row3) => {
        stats.totalOrders = row3?.count || 0;

        db.get('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"', (err4, row4) => {
          stats.totalRevenue = row4?.total || 0;

          db.all(
            `SELECT o.*, c.name as customer_name
             FROM orders o
             LEFT JOIN customers c ON o.customer_id = c.id
             ORDER BY o.created_at DESC
             LIMIT 5`,
            (err5, rows) => {
              stats.recentOrders = rows || [];
              res.json(stats);
            }
          );
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`CRM API running on http://localhost:${PORT}`);
});
