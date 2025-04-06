"use client"

import { useState } from "react"
import { Pencil, Trash2, BookOpen, Plus, Save, X } from "lucide-react"

interface Book {
  id: number
  title: string
  author: string
  quantity: number
}

export default function BookstoreDashboard() {
  const [books, setBooks] = useState<Book[]>([
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", quantity: 15 },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", quantity: 22 },
    { id: 3, title: "1984", author: "George Orwell", quantity: 18 },
  ])

  const [newBook, setNewBook] = useState<Omit<Book, "id">>({ title: "", author: "", quantity: 0 })
  const [updateBook, setUpdateBook] = useState<Book | null>(null)

  const handleAddBook = () => {
    if (newBook.title && newBook.author && newBook.quantity > 0) {
      const maxId = books.length > 0 ? Math.max(...books.map((book) => book.id)) : 0
      setBooks([...books, { id: maxId + 1, ...newBook }])
      setNewBook({ title: "", author: "", quantity: 0 })
    }
  }

  const handleUpdateBook = (book: Book) => {
    setUpdateBook(book)
  }

  const handleSaveUpdate = () => {
    if (updateBook && updateBook.title && updateBook.author && updateBook.quantity > 0) {
      const updatedBooks = books.map((book) => (book.id === updateBook.id ? updateBook : book))
      setBooks(updatedBooks)
      setUpdateBook(null)
    }
  }

  const handleDeleteBook = (id: number) => {
    const filteredBooks = books.filter((book) => book.id !== id)
    setBooks(filteredBooks)
  }

  // Find the maximum quantity for scaling the chart
  const maxQuantity = Math.max(...books.map((book) => book.quantity), 1)

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-teal-600 flex items-center gap-2">
          <BookOpen className="h-8 w-8" />
          Bookstore Dashboard
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add/Update Book Form Card */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="border-b p-4">
            <h2 className="text-xl font-semibold text-teal-600">{updateBook ? "Update Book" : "Add New Book"}</h2>
          </div>
          <div className="p-6">
            {updateBook ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="update-title" className="text-sm font-medium block mb-1">
                    Title
                  </label>
                  <input
                    id="update-title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Book title"
                    value={updateBook.title}
                    onChange={(e) => setUpdateBook({ ...updateBook, title: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="update-author" className="text-sm font-medium block mb-1">
                    Author
                  </label>
                  <input
                    id="update-author"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Author name"
                    value={updateBook.author}
                    onChange={(e) => setUpdateBook({ ...updateBook, author: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="update-quantity" className="text-sm font-medium block mb-1">
                    Quantity
                  </label>
                  <input
                    id="update-quantity"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Quantity"
                    value={updateBook.quantity}
                    onChange={(e) => setUpdateBook({ ...updateBook, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 text-white bg-teal-600 hover:bg-teal-700 transition-colors ${
                      !updateBook.title || !updateBook.author || updateBook.quantity <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={handleSaveUpdate}
                    disabled={!updateBook.title || !updateBook.author || updateBook.quantity <= 0}
                  >
                    <Save className="h-4 w-4" /> Save Changes
                  </button>
                  <button
                    className="flex-1 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    onClick={() => setUpdateBook(null)}
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-title" className="text-sm font-medium block mb-1">
                    Title
                  </label>
                  <input
                    id="new-title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Book title"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="new-author" className="text-sm font-medium block mb-1">
                    Author
                  </label>
                  <input
                    id="new-author"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Author name"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="new-quantity" className="text-sm font-medium block mb-1">
                    Quantity
                  </label>
                  <input
                    id="new-quantity"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Quantity"
                    value={newBook.quantity}
                    onChange={(e) => setNewBook({ ...newBook, quantity: Number(e.target.value) })}
                  />
                </div>
                <button
                  className={`w-full px-4 py-2 rounded-md flex items-center justify-center gap-2 text-white bg-teal-600 hover:bg-teal-700 transition-colors ${
                    !newBook.title || !newBook.author || newBook.quantity <= 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleAddBook}
                  disabled={!newBook.title || !newBook.author || newBook.quantity <= 0}
                >
                  <Plus className="h-4 w-4" /> Add Book
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="border-b p-4">
            <h2 className="text-xl font-semibold text-teal-600">Book Inventory Chart</h2>
          </div>
          <div className="p-6 h-[300px]">
            <div className="h-full flex flex-col">
              <div className="flex-1 flex items-end gap-2 pb-2">
                {books.map((book) => (
                  <div key={book.id} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-teal-500 rounded-t-md transition-all duration-300"
                      style={{
                        height: `${(book.quantity / maxQuantity) * 100}%`,
                        minHeight: "10px",
                      }}
                    />
                    <div className="text-xs font-medium mt-1 truncate w-full text-center">{book.title}</div>
                    <div className="text-xs text-gray-500">{book.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Books Table Card */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold text-teal-600">Book Inventory</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Author</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">Quantity</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      No books in inventory. Add your first book above.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{book.title}</td>
                      <td className="py-3 px-4">{book.author}</td>
                      <td className="py-3 px-4 text-right">{book.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateBook(book)}
                            className="h-8 w-8 p-0 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="h-8 w-8 p-0 flex items-center justify-center rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
