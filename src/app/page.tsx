"use client"

import { useState } from "react"
import { Heart, Pencil, Trash2, Plus, Save, X } from "lucide-react"

interface Flower {
  id: number
  name: string
  price: number
  favorite: boolean
}

export default function FlowerStore() {
  const [flowers, setFlowers] = useState<Flower[]>([
    { id: 1, name: "Rose", price: 10.99, favorite: false },
    { id: 2, name: "Lily", price: 9.99, favorite: false },
    { id: 3, name: "Sunflower", price: 12.99, favorite: false },
  ])

  const [newFlower, setNewFlower] = useState<Omit<Flower, "id" | "favorite">>({ name: "", price: 0 })
  const [updateFlower, setUpdateFlower] = useState<Flower | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)

  const handleAddFlower = () => {
    if (newFlower.name && newFlower.price > 0) {
      setFlowers([
        ...flowers,
        {
          id: Math.max(0, ...flowers.map((f) => f.id)) + 1,
          name: newFlower.name,
          price: newFlower.price,
          favorite: false,
        },
      ])
      setNewFlower({ name: "", price: 0 })
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateFlower = (id: number) => {
    const flowerToUpdate = flowers.find((flower) => flower.id === id)
    if (flowerToUpdate) {
      setUpdateFlower(flowerToUpdate)
      setIsUpdateDialogOpen(true)
    }
  }

  const handleSaveUpdateFlower = () => {
    if (updateFlower && updateFlower.name && updateFlower.price > 0) {
      const updatedFlowers = flowers.map((flower) => (flower.id === updateFlower.id ? updateFlower : flower))
      setFlowers(updatedFlowers)
      setUpdateFlower(null)
      setIsUpdateDialogOpen(false)
    }
  }

  const handleDeleteFlower = (id: number) => {
    const filteredFlowers = flowers.filter((flower) => flower.id !== id)
    setFlowers(filteredFlowers)
  }

  const handleFavoriteFlower = (id: number) => {
    const updatedFlowers = flowers.map((flower) =>
      flower.id === id ? { ...flower, favorite: !flower.favorite } : flower,
    )
    setFlowers(updatedFlowers)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-rose-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-6 rounded-t-xl">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span>🌸</span> Flower Store
          </h1>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Flower Collection</h2>
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Flower
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {flowers.length === 0 ? (
              <p className="text-gray-500 col-span-2 text-center py-8">No flowers added yet. Add your first flower!</p>
            ) : (
              flowers.map((flower) => (
                <div
                  key={flower.id}
                  className={`bg-white rounded-lg p-4 border ${flower.favorite ? "border-rose-300 shadow-rose-100 shadow-md" : "border-gray-200"} transition-all duration-300`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{flower.name}</h3>
                    {flower.favorite && (
                      <span className="bg-rose-100 text-rose-500 text-xs px-2 py-1 rounded-full">Favorite</span>
                    )}
                  </div>
                  <p className="text-xl font-bold text-gray-700 mb-4">${flower.price.toFixed(2)}</p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleFavoriteFlower(flower.id)}
                      className={`p-2 rounded-md border ${flower.favorite ? "text-rose-500 border-rose-200" : "text-gray-400 border-gray-200"} hover:bg-gray-50`}
                    >
                      <Heart className={`h-4 w-4 ${flower.favorite ? "fill-rose-500" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleUpdateFlower(flower.id)}
                      className="p-2 rounded-md border text-amber-500 border-amber-200 hover:bg-gray-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFlower(flower.id)}
                      className="p-2 rounded-md border text-red-500 border-red-200 hover:bg-gray-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Flower Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Add New Flower</h2>
              <button onClick={() => setIsAddDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Flower Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={newFlower.name}
                  onChange={(e) => setNewFlower({ ...newFlower, name: e.target.value })}
                  placeholder="Enter flower name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newFlower.price || ""}
                  onChange={(e) => setNewFlower({ ...newFlower, price: Number(e.target.value) })}
                  placeholder="Enter price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFlower}
                className={`px-4 py-2 rounded-md text-white ${
                  !newFlower.name || newFlower.price <= 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-rose-500 hover:bg-rose-600"
                }`}
                disabled={!newFlower.name || newFlower.price <= 0}
              >
                Add Flower
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Flower Dialog */}
      {isUpdateDialogOpen && updateFlower && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Update Flower</h2>
              <button onClick={() => setIsUpdateDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="update-name" className="block text-sm font-medium text-gray-700">
                  Flower Name
                </label>
                <input
                  id="update-name"
                  type="text"
                  value={updateFlower.name}
                  onChange={(e) => setUpdateFlower({ ...updateFlower, name: e.target.value })}
                  placeholder="Enter flower name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="update-price" className="block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  id="update-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={updateFlower.price || ""}
                  onChange={(e) => setUpdateFlower({ ...updateFlower, price: Number(e.target.value) })}
                  placeholder="Enter price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setIsUpdateDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUpdateFlower}
                className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
                  !updateFlower.name || updateFlower.price <= 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
                disabled={!updateFlower.name || updateFlower.price <= 0}
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

