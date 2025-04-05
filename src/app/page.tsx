"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Trash2, Edit, Plus, Leaf, Droplet, Thermometer, X } from "lucide-react"

type Plant = {
  id: string
  name: string
  description: string
  care: {
    temperature: string
    watering: string
  }
}

type ModalType = "add" | "edit" | "delete" | null

const initialPlants: Plant[] = [
  {
    id: crypto.randomUUID(),
    name: "Snake Plant",
    description: "Low-maintenance plant that can thrive in low-light conditions",
    care: {
      temperature: "65-75°F (18-24°C)",
      watering: "Water sparingly, allowing soil to dry between waterings",
    },
  },
  {
    id: crypto.randomUUID(),
    name: "Spider Plant",
    description: "Easy-to-grow plant with air-purifying properties",
    care: {
      temperature: "60-80°F (15-27°C)",
      watering: "Water thoroughly, allowing soil to dry slightly between waterings",
    },
  },
  {
    id: crypto.randomUUID(),
    name: "ZZ Plant",
    description: "Low-maintenance plant that can tolerate low light and infrequent watering",
    care: {
      temperature: "65-75°F (18-24°C)",
      watering: "Water sparingly, allowing soil to dry completely between waterings",
    },
  },

]

const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}
    >
      {message}
    </div>
  )
}

interface PlantFormProps {
  initialData: Plant
  onSubmit: (plant: Plant) => void
  onCancel: () => void
  submitLabel: string
}

const PlantForm = ({ initialData, onSubmit, onCancel, submitLabel }: PlantFormProps) => {
  const [formData, setFormData] = useState<Plant>(initialData)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    if (field === "temperature" || field === "watering") {
      setFormData({
        ...formData,
        care: {
          ...formData.care,
          [field]: e.target.value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [field]: e.target.value,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Plant Name
          </label>
          <input
            id="name"
            ref={nameInputRef}
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange(e, "name")}
            placeholder="Enter plant name"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange(e, "description")}
            placeholder="Enter plant description"
            rows={3}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="temperature" className="text-sm font-medium text-gray-700">
            Temperature Range
          </label>
          <input
            id="temperature"
            type="text"
            value={formData.care.temperature}
            onChange={(e) => handleInputChange(e, "temperature")}
            placeholder="e.g. 65-75°F (18-24°C)"
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="watering" className="text-sm font-medium text-gray-700">
            Watering Instructions
          </label>
          <textarea
            id="watering"
            value={formData.care.watering}
            onChange={(e) => handleInputChange(e, "watering")}
            placeholder="Enter watering instructions"
            rows={3}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

const Modal = ({ title, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-md mx-4" tabIndex={-1}>
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-bold">
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const PlantStore = () => {
  const [plants, setPlants] = useState<Plant[]>(initialPlants)
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(plants.length > 0 ? plants[0] : null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const emptyPlant: Plant = {
    id: "",
    name: "",
    description: "",
    care: {
      temperature: "",
      watering: "",
    },
  }

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlant(plant)
  }

  const handleAddPlantClick = () => {
    setActiveModal("add")
  }

  const handleEditPlantClick = () => {
    if (selectedPlant) {
      setActiveModal("edit")
    }
  }

  const handleDeletePlantClick = () => {
    setActiveModal("delete")
  }

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
  }

  const handleAddPlant = (newPlant: Plant) => {
    const plantWithId = {
      ...newPlant,
      id: Date.now().toString(),
    }

    const updatedPlants = [...plants, plantWithId]
    setPlants(updatedPlants)
    setSelectedPlant(plantWithId)
    setActiveModal(null)
    showToast("Plant added successfully", "success")
  }

  const handleUpdatePlant = (updatedPlant: Plant) => {
    const updatedPlants = plants.map((plant) => (plant.id === updatedPlant.id ? updatedPlant : plant))

    setPlants(updatedPlants)
    setSelectedPlant(updatedPlant)
    setActiveModal(null)
    showToast("Plant updated successfully", "success")
  }

  const handleDeletePlant = () => {
    if (!selectedPlant) return

    const updatedPlants = plants.filter((plant) => plant.id !== selectedPlant.id)
    setPlants(updatedPlants)
    setSelectedPlant(updatedPlants.length > 0 ? updatedPlants[0] : null)
    setActiveModal(null)
    showToast("Plant deleted successfully", "success")
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 my-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-800">Plant Store</h1>
        <button
          onClick={handleAddPlantClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          aria-label="Add new plant"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Plant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {plants.map((plant) => (
          <div
            key={plant.id}
            className={`cursor-pointer transition-all hover:shadow-lg rounded-lg p-4 ${selectedPlant?.id === plant.id
                ? "border-2 border-emerald-500 bg-emerald-50"
                : "border border-gray-200 hover:border-emerald-300"
              }`}
            onClick={() => handleSelectPlant(plant)}
            tabIndex={0}
            role="button"
            aria-pressed={selectedPlant?.id === plant.id}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleSelectPlant(plant)
              }
            }}
          >
            <div className="pb-2">
              <h3 className="flex items-center text-emerald-700 font-bold text-lg">
                <Leaf className="h-5 w-5 mr-2" />
                {plant.name}
              </h3>
            </div>
            <div>
              <p className="text-gray-600 mb-2 line-clamp-2">{plant.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedPlant && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <div className="pb-2">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-emerald-800 font-bold">{selectedPlant.name}</h2>
              <div className="flex gap-2">
                <button
                  className="h-8 w-8 text-amber-600 border border-amber-300 hover:bg-amber-50 rounded-md flex items-center justify-center transition-colors"
                  onClick={handleEditPlantClick}
                  aria-label={`Edit ${selectedPlant.name}`}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className="h-8 w-8 text-red-600 border border-red-300 hover:bg-red-50 rounded-md flex items-center justify-center transition-colors"
                  onClick={handleDeletePlantClick}
                  aria-label={`Delete ${selectedPlant.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div>
            <p className="text-gray-700 mb-4">{selectedPlant.description}</p>
            <h3 className="font-semibold text-emerald-700 mb-2">Care Instructions</h3>
            <div className="space-y-2">
              <div className="flex items-center text-gray-700">
                <Thermometer className="h-4 w-4 mr-2 text-emerald-600" />
                <span>Temperature: {selectedPlant.care.temperature}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Droplet className="h-4 w-4 mr-2 text-emerald-600" />
                <span>{selectedPlant.care.watering}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === "add" && (
        <Modal title="Add New Plant" onClose={() => setActiveModal(null)}>
          <PlantForm
            initialData={emptyPlant}
            onSubmit={handleAddPlant}
            onCancel={() => setActiveModal(null)}
            submitLabel="Add Plant"
          />
        </Modal>
      )}

      {activeModal === "edit" && selectedPlant && (
        <Modal title="Edit Plant" onClose={() => setActiveModal(null)}>
          <PlantForm
            initialData={selectedPlant}
            onSubmit={handleUpdatePlant}
            onCancel={() => setActiveModal(null)}
            submitLabel="Update Plant"
          />
        </Modal>
      )}

      {activeModal === "delete" && (
        <Modal title="Confirm Deletion" onClose={() => setActiveModal(null)}>
          <div className="py-4">
            <p>
              Are you sure you want to delete <span className="font-semibold">{selectedPlant?.name}</span>? This action
              cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePlant}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default PlantStore




