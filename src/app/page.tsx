"use client"

import type React from "react"

import { useState } from "react"
import { ClipboardList, Package, Users, Clock, CheckCircle2, Loader2, ChevronDown } from "lucide-react"

// Define types for better type safety
type OrderStatus = "pending" | "in_progress" | "delivered"
type StaffRole = "manager" | "waiter" | "chef"

interface Order {
  id: number
  name: string
  status: OrderStatus
  customer: string
  total: string
}

interface InventoryItem {
  id: number
  name: string
  quantity: number
  unit: string
}

interface StaffMember {
  id: number
  name: string
  role: StaffRole
  shift: string
}

// Reusable section
interface SectionProps {
  title: string
  icon: React.ReactNode
  borderColor: string
  bgColor: string
  children: React.ReactNode
}

const Section: React.FC<SectionProps> = ({ title, icon, borderColor, bgColor, children }) => (
  <div className={`bg-white rounded-lg border ${borderColor} shadow-md overflow-hidden`}>
    <div className={`${bgColor} border-b ${borderColor} px-4 py-3`}>
      <h2 className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </h2>
    </div>
    <div className="p-4">{children}</div>
  </div>
)

// Status badge
const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" aria-hidden="true" /> Pending
        </span>
      )
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> In Progress
        </span>
      )
    case "delivered":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Delivered
        </span>
      )
    default:
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
  }
}

// Order item
interface OrderItemProps {
  order: Order
  onStatusChange: (id: number, status: OrderStatus) => void
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onStatusChange }) => (
  <div className="p-3 border border-amber-100 rounded-lg bg-white">
    <div className="flex justify-between items-center mb-2">
      <span className="font-medium">{order.name}</span>
      <StatusBadge status={order.status} />
    </div>
    <div className="text-sm text-gray-500 mb-3">
      <div>Customer: {order.customer}</div>
      <div>Total: {order.total}</div>
    </div>
    <div className="relative">
      <label htmlFor={`order-status-${order.id}`} className="sr-only">
        Change order status
      </label>
      <select
        id={`order-status-${order.id}`}
        value={order.status}
        onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 appearance-none"
        aria-label={`Change status for ${order.name}`}
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="delivered">Delivered</option>
      </select>
      <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-amber-500 pointer-events-none" aria-hidden="true" />
    </div>
  </div>
)

// Inventory item
interface InventoryItemProps {
  item: InventoryItem
  onQuantityChange: (id: number, quantity: number) => void
}

const InventoryItemComponent: React.FC<InventoryItemProps> = ({ item, onQuantityChange }) => (
  <div className="p-3 border border-green-100 rounded-lg bg-white">
    <div className="flex justify-between items-center mb-2">
      <span className="font-medium">{item.name}</span>
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
        {item.unit}
      </span>
    </div>
    <div className="flex items-center gap-2">
      <label htmlFor={`inventory-quantity-${item.id}`} className="sr-only">
        Quantity for {item.name}
      </label>
      <input
        id={`inventory-quantity-${item.id}`}
        type="number"
        value={item.quantity}
        onChange={(e) => onQuantityChange(item.id, Number.parseInt(e.target.value))}
        className="w-full px-3 py-2 bg-white border border-green-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300"
        min="0"
        aria-label={`Change quantity for ${item.name}`}
      />
      <span className="text-sm text-gray-500">in stock</span>
    </div>
  </div>
)

// Staff member
interface StaffItemProps {
  member: StaffMember
  onRoleChange: (id: number, role: StaffRole) => void
}

const StaffItem: React.FC<StaffItemProps> = ({ member, onRoleChange }) => (
  <div className="p-3 border border-blue-100 rounded-lg bg-white">
    <div className="flex justify-between items-center mb-2">
      <span className="font-medium">{member.name}</span>
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
        {member.shift}
      </span>
    </div>
    <div className="relative">
      <label htmlFor={`staff-role-${member.id}`} className="sr-only">
        Change role for {member.name}
      </label>
      <select
        id={`staff-role-${member.id}`}
        value={member.role}
        onChange={(e) => onRoleChange(member.id, e.target.value as StaffRole)}
        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 appearance-none"
        aria-label={`Change role for ${member.name}`}
      >
        <option value="manager">Manager</option>
        <option value="waiter">Waiter</option>
        <option value="chef">Chef</option>
      </select>
      <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-blue-500 pointer-events-none" aria-hidden="true" />
    </div>
  </div>
)

const RestaurantManagementSystem: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([
    { id: 1, name: "Order #1001", status: "pending", customer: "John Doe", total: "$45.50" },
    { id: 2, name: "Order #1002", status: "in_progress", customer: "Jane Smith", total: "$32.75" },
    { id: 3, name: "Order #1003", status: "delivered", customer: "Robert Johnson", total: "$78.25" },
  ])

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 1, name: "Tomatoes", quantity: 10, unit: "kg" },
    { id: 2, name: "Chicken", quantity: 20, unit: "kg" },
    { id: 3, name: "Olive Oil", quantity: 30, unit: "bottles" },
  ])

  const [staff, setStaff] = useState<StaffMember[]>([
    { id: 1, name: "Ahmed Hassan", role: "manager", shift: "Morning" },
    { id: 2, name: "Sara Ali", role: "waiter", shift: "Evening" },
    { id: 3, name: "Mohamed Kamal", role: "chef", shift: "Full day" },
  ])

  const handleOrderStatusChange = (id: number, status: OrderStatus) => {
    setOrders(
      orders.map((order) => {
        if (order.id === id) {
          return { ...order, status }
        }
        return order
      }),
    )
  }

  const handleInventoryQuantityChange = (id: number, quantity: number) => {
    setInventory(
      inventory.map((item) => {
        if (item.id === id) {
          return { ...item, quantity }
        }
        return item
      }),
    )
  }

  const handleStaffRoleChange = (id: number, role: StaffRole) => {
    setStaff(
      staff.map((member) => {
        if (member.id === id) {
          return { ...member, role }
        }
        return member
      }),
    )
  }

  return (
    <div className="container mx-auto p-4 pt-6 mt-4 bg-gradient-to-b from-amber-50 to-white min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-amber-800">Restaurant Management System</h1>
        <p className="text-amber-600 mt-2">Manage orders, inventory, and staff efficiently</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Orders Section */}
        <Section
          title="Orders"
          icon={<ClipboardList className="h-5 w-5 text-amber-800" />}
          borderColor="border-amber-200"
          bgColor="bg-amber-100"
        >
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderItem key={order.id} order={order} onStatusChange={handleOrderStatusChange} />
            ))}
          </div>
        </Section>

        {/* Inventory Section */}
        <Section
          title="Inventory"
          icon={<Package className="h-5 w-5 text-green-800" />}
          borderColor="border-green-200"
          bgColor="bg-green-100"
        >
          <div className="space-y-4">
            {inventory.map((item) => (
              <InventoryItemComponent key={item.id} item={item} onQuantityChange={handleInventoryQuantityChange} />
            ))}
          </div>
        </Section>

        {/* Staff Section */}
        <Section
          title="Staff"
          icon={<Users className="h-5 w-5 text-blue-800" />}
          borderColor="border-blue-200"
          bgColor="bg-blue-100"
        >
          <div className="space-y-4">
            {staff.map((member) => (
              <StaffItem key={member.id} member={member} onRoleChange={handleStaffRoleChange} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

export default RestaurantManagementSystem

