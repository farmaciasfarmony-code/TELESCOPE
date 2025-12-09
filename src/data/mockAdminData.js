export const mockStats = {
    totalRevenue: 125430,
    totalOrders: 1450,
    totalCustomers: 890,
    growth: 12.5
};

export const mockProducts = [
    { id: 1, name: 'Paracetamol 500mg', category: 'Medicamentos', price: 45.00, stock: 120, status: 'Active' },
    { id: 2, name: 'Protector Solar SPF 50', category: 'Higiene', price: 250.00, stock: 45, status: 'Active' },
    { id: 3, name: 'Vitamina C + Zinc', category: 'Vitaminas', price: 180.00, stock: 12, status: 'Low Stock' },
    { id: 4, name: 'Pañales Etapa 3', category: 'Bebés', price: 320.00, stock: 0, status: 'Out of Stock' },
    { id: 5, name: 'Jabón Neutro', category: 'Higiene', price: 25.00, stock: 200, status: 'Active' },
];

export const mockCustomers = [
    { id: 101, name: 'Juan Pérez', email: 'juan@example.com', totalSpent: 4500, lastOrder: '2023-11-25' },
    { id: 102, name: 'María González', email: 'maria@example.com', totalSpent: 1200, lastOrder: '2023-11-20' },
    { id: 103, name: 'Carlos López', email: 'carlos@example.com', totalSpent: 850, lastOrder: '2023-10-15' },
    { id: 104, name: 'Ana Martínez', email: 'ana@example.com', totalSpent: 3200, lastOrder: '2023-11-26' },
];

export const mockSales = [
    { id: 'ORD-001', customer: 'Juan Pérez', date: '2023-11-26', total: 450.00, status: 'Completed' },
    { id: 'ORD-002', customer: 'Ana Martínez', date: '2023-11-26', total: 1200.00, status: 'Processing' },
    { id: 'ORD-003', customer: 'Pedro Sánchez', date: '2023-11-25', total: 85.00, status: 'Completed' },
    { id: 'ORD-004', customer: 'Lucía Fernández', date: '2023-11-24', total: 340.00, status: 'Cancelled' },
    { id: 'ORD-005', customer: 'María González', date: '2023-11-20', total: 210.00, status: 'Completed' },
];
