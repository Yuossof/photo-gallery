"use client"
import { memo, useCallback, useState } from "react"
import type React from "react"

import Image from "next/image"
import { type ChangeEvent, useEffect } from "react"
import { Trash, Edit, ShoppingCart, Plus, Check, AlertCircle } from "lucide-react"

interface BookType {
  id: string
  title: string
  description: string
  author: string
  image: string
}

const DEFAULT_COVERS = [
  "https://res.cloudinary.com/db1lfazhq/image/upload/v1736091988/oxrripuwg0gqwa4ithge.jpg",
  "https://res.cloudinary.com/db1lfazhq/image/upload/v1736114455/va9spfgkn9qajldmhily.jpg",
  "https://res.cloudinary.com/db1lfazhq/image/upload/v1736285175/beskrgdsbyqnky8hflgi.jpg",
]

function generateRandomId(): string {
  return "id-" + Math.random().toString(36).substr(2, 9)
}

interface ToastProps {
  message: string
  type: "success" | "error"
  onClose: () => void
}

const Toast = memo(({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg flex items-center space-x-2 ${
        type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {type === "success" ? (
        <Check className="h-5 w-5" aria-hidden="true" />
      ) : (
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      )}
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  )
})

Toast.displayName = "Toast"

interface FormErrorsType {
  title: { error: boolean; message: string }
  author: { error: boolean; message: string }
  description: { error: boolean; message: string }
}

export default function BookStore() {
  const [books, setBooks] = useState<BookType[]>([
    {
      id: generateRandomId(),
      title: "Book 1",
      author: "Author 1",
      description: "The description of book 1.",
      image: DEFAULT_COVERS[1],
    },
    {
      id: generateRandomId(),
      title: "Book 2",
      author: "Author 2",
      description: "The description of book 2.",
      image: DEFAULT_COVERS[0],
    },
  ])

  const [newBook, setNewBook] = useState({
    title: "",
    description: "",
    author: "",
    image: "",
  })

  const [editing, setEditing] = useState(false)
  const [currentBookId, setCurrentBookId] = useState("")

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedDefaultCover, setSelectedDefaultCover] = useState<string>(DEFAULT_COVERS[0])

  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  })

  const [formErrors, setFormErrors] = useState<FormErrorsType>({
    title: { error: false, message: "" },
    author: { error: false, message: "" },
    description: { error: false, message: "" },
  })

  const [touched, setTouched] = useState({
    title: false,
    author: false,
    description: false,
  })

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }))
  }, [])

  const getImageUrl = useCallback((): string => {
    if (selectedImage) {
      return selectedImage
    }

    if (editing) {
      const currentBook = books.find((book) => book.id === currentBookId)
      return currentBook?.image || selectedDefaultCover
    }

    return selectedDefaultCover
  }, [books, currentBookId, editing, selectedImage, selectedDefaultCover])

  const validateField = useCallback((field: string, value: string): { error: boolean; message: string } => {
    if (!value.trim()) {
      return { error: true, message: `${field} is required` }
    }

    switch (field) {
      case "title":
        if (value.trim().length < 3) {
          return { error: true, message: "Title must be at least 3 characters" }
        }
        if (value.trim().length > 100) {
          return { error: true, message: "Title must be less than 100 characters" }
        }
        break
      case "author":
        if (value.trim().length < 3) {
          return { error: true, message: "Author must be at least 3 characters" }
        }
        if (value.trim().length > 50) {
          return { error: true, message: "Author must be less than 50 characters" }
        }
        if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) {
          return { error: true, message: "Author name contains invalid characters" }
        }
        break
      case "description":
        if (value.trim().length < 10) {
          return { error: true, message: "Description must be at least 10 characters" }
        }
        if (value.trim().length > 500) {
          return { error: true, message: "Description must be less than 500 characters" }
        }
        break
    }

    return { error: false, message: "" }
  }, [])

  // validate form
  const validateForm = useCallback(() => {
    const titleValidation = validateField("title", newBook.title)
    const authorValidation = validateField("author", newBook.author)
    const descriptionValidation = validateField("description", newBook.description)

    setFormErrors({
      title: titleValidation,
      author: authorValidation,
      description: descriptionValidation,
    })

    setTouched({
      title: true,
      author: true,
      description: true,
    })

    return !(titleValidation.error || authorValidation.error || descriptionValidation.error)
  }, [newBook.author, newBook.description, newBook.title, validateField])

  // handle blur
  const handleBlur = useCallback(
    (field: keyof typeof touched) => {
      setTouched((prev) => ({ ...prev, [field]: true }))

      setFormErrors((prev) => ({
        ...prev,
        [field]: validateField(field, newBook[field]),
      }))
    },
    [newBook, validateField],
  )

  const resetForm = useCallback(() => {
    setSelectedImage(null)
    setNewBook({
      title: "",
      description: "",
      author: "",
      image: "",
    })

    setEditing(false)
    setCurrentBookId("")

    setFormErrors({
      title: { error: false, message: "" },
      author: { error: false, message: "" },
      description: { error: false, message: "" },
    })

    setTouched({
      title: false,
      author: false,
      description: false,
    })
  }, [])

  // add book to books
  const addBook = useCallback(() => {
    if (!validateForm()) {
      showToast("Failed to add book", "error")
      return
    }

    const imageUrl = getImageUrl()

    setBooks((prevBooks) => [
      ...prevBooks,
      {
        id: generateRandomId(),
        title: newBook.title,
        author: newBook.author,
        description: newBook.description,
        image: imageUrl,
      },
    ])

    showToast("Book added successfully!", "success")
    resetForm()
  }, [getImageUrl, newBook.author, newBook.description, newBook.title, resetForm, showToast, validateForm])

  // delete book from books
  const deleteBook = useCallback(
    (id: string) => {
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id))
      showToast("Book deleted successfully!", "success")
    },
    [showToast],
  )

  // edit book
  const editBook = useCallback((book: BookType) => {
    setEditing(true)
    setCurrentBookId(book.id)
    setNewBook({
      title: book.title,
      author: book.author,
      description: book.description,
      image: book.image,
    })

    setSelectedImage(null)

    if (DEFAULT_COVERS.includes(book.image)) {
      setSelectedDefaultCover(book.image)
    } else if (book.image.startsWith("data:")) {
      setSelectedImage(book.image)
    }

    // Reset form errors and touched state when editing
    setFormErrors({
      title: { error: false, message: "" },
      author: { error: false, message: "" },
      description: { error: false, message: "" },
    })

    setTouched({
      title: false,
      author: false,
      description: false,
    })
  }, [])

  // update book
  const updateBook = useCallback(() => {
    if (!validateForm()) {
      showToast("Please correct the errors in the form", "error")
      return
    }

    const imageUrl = getImageUrl()

    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === currentBookId
          ? {
              ...book,
              title: newBook.title,
              author: newBook.author,
              description: newBook.description,
              image: imageUrl,
            }
          : book,
      ),
    )

    showToast("Book updated successfully!", "success")
    resetForm()
  }, [
    currentBookId,
    getImageUrl,
    newBook.author,
    newBook.description,
    newBook.title,
    resetForm,
    showToast,
    validateForm,
  ])

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  /// handleFileChange
  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null

      if (file) {
        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if (!validTypes.includes(file.type)) {
          showToast("Please upload a valid image file (JPEG, PNG, GIF, WEBP)", "error")
          return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          showToast("Image file is too large. Maximum size is 5MB", "error")
          return
        }

        try {
          // Convert to base64
          const base64String = await fileToBase64(file)
          setSelectedImage(base64String)
        } catch (error) {
          console.error("Error converting file to base64:", error)
          showToast("Error processing image", "error")
        }
      } else {
        setSelectedImage(null)
      }
    },
    [showToast],
  )

  // default cover select
  const handleDefaultCoverSelect = useCallback((coverUrl: string) => {
    setSelectedDefaultCover(coverUrl)
    setSelectedImage(null)
  }, [])

  // Determine current image to display
  const currentImage =
    selectedImage ||
    (editing ? books.find((book) => book.id === currentBookId)?.image || selectedDefaultCover : selectedDefaultCover)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-7xl w-full mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Book Store</h1>
          <p className="mt-2 text-lg text-gray-600">Manage your book collection</p>
        </header>

        <section className="bg-white rounded-lg shadow-md mb-8 overflow-hidden" aria-labelledby="form-heading">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 id="form-heading" className="text-xl font-semibold text-gray-900">
              {editing ? "Edit Book" : "Add New Book"}
            </h2>
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={newBook.title}
                    onChange={(e) => {
                      setNewBook({ ...newBook, title: e.target.value })
                      if (touched.title) {
                        setFormErrors((prev) => ({
                          ...prev,
                          title: validateField("title", e.target.value),
                        }))
                      }
                    }}
                    onBlur={() => handleBlur("title")}
                    placeholder="Enter book title"
                    className={`w-full px-3 py-2 border ${formErrors.title.error ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent`}
                    aria-required="true"
                    aria-invalid={formErrors.title.error}
                    aria-describedby={formErrors.title.error ? "title-error" : undefined}
                  />
                  {formErrors.title.error && touched.title && (
                    <p className="mt-1 text-sm text-red-500" id="title-error">
                      {formErrors.title.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Title should be between 3 and 100 characters</p>
                </div>

                <div className="form-group">
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                    Author{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="author"
                    type="text"
                    value={newBook.author}
                    onChange={(e) => {
                      setNewBook({ ...newBook, author: e.target.value })
                      if (touched.author) {
                        setFormErrors((prev) => ({
                          ...prev,
                          author: validateField("author", e.target.value),
                        }))
                      }
                    }}
                    onBlur={() => handleBlur("author")}
                    placeholder="Enter author name"
                    className={`w-full px-3 py-2 border ${formErrors.author.error ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent`}
                    aria-required="true"
                    aria-invalid={formErrors.author.error}
                    aria-describedby={formErrors.author.error ? "author-error" : undefined}
                  />
                  {formErrors.author.error && touched.author && (
                    <p className="mt-1 text-sm text-red-500" id="author-error">
                      {formErrors.author.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Author name should contain letters only, spaces, and characters
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <textarea
                    id="description"
                    value={newBook.description}
                    onChange={(e) => {
                      setNewBook({ ...newBook, description: e.target.value })
                      if (touched.description) {
                        setFormErrors((prev) => ({
                          ...prev,
                          description: validateField("description", e.target.value),
                        }))
                      }
                    }}
                    onBlur={() => handleBlur("description")}
                    placeholder="Enter book description"
                    rows={3}
                    className={`w-full px-3 py-2 border ${formErrors.description.error ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent`}
                    aria-required="true"
                    aria-invalid={formErrors.description.error}
                    aria-describedby={formErrors.description.error ? "description-error" : undefined}
                  />
                  {formErrors.description.error && touched.description && (
                    <p className="mt-1 text-sm text-red-500" id="description-error">
                      {formErrors.description.message}
                    </p>
                  )}
                  <div className="mt-1 flex justify-between">
                    <p className="text-xs text-gray-500">Description should be between 10 and 500 characters</p>
                    <p className="text-xs text-gray-500">{newBook.description.length}/500</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Book Cover
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent mb-2"
                    aria-describedby="cover-help"
                  />
                  <p id="cover-help" className="text-sm text-gray-500">
                    Upload a custom image (JPEG, PNG, GIF, WEBP, max 5MB) or select from default covers below
                  </p>
                </div>

                <div className="mt-4">
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-2">Default Covers</legend>
                    <div role="radiogroup" aria-label="Choose a default cover" className="flex space-x-2">
                      {DEFAULT_COVERS.map((cover, index) => {
                        const isSelected = selectedDefaultCover === cover && !selectedImage

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDefaultCoverSelect(cover)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                handleDefaultCoverSelect(cover)
                              }

                              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                                e.preventDefault()
                                const next = (index + 1) % DEFAULT_COVERS.length
                                document.getElementById(`cover-${next}`)?.focus()
                              }

                              if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                                e.preventDefault()
                                const prev = (index - 1 + DEFAULT_COVERS.length) % DEFAULT_COVERS.length
                                document.getElementById(`cover-${prev}`)?.focus()
                              }
                            }}
                            className={`relative w-16 h-24 border-2 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                              isSelected ? "border-blue-500" : "border-gray-300"
                            }`}
                            aria-label={`Select default cover ${index + 1}`}
                            aria-checked={isSelected}
                            role="radio"
                            tabIndex={isSelected ? 0 : -1}
                            id={`cover-${index}`}
                          >
                            <Image
                              src={cover || "/placeholder.svg"}
                              alt={`Default cover ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>
                </div>

                <div className="mt-4">
                  <p className="block text-sm font-medium text-gray-700 mb-2">Cover Preview</p>
                  <div className="relative w-40 h-56 mx-auto border rounded overflow-hidden">
                    {currentImage.startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentImage || "/placeholder.svg"}
                        alt="Book cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={currentImage || "/placeholder.svg"}
                        alt="Book cover preview"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
            {editing && (
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
            )}

            <button
              onClick={editing ? updateBook : addBook}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors flex items-center"
              aria-label={editing ? "Update book" : "Add book"}
            >
              {editing ? (
                <>
                  <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                  Update Book
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Add Book
                </>
              )}
            </button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Book collection">
          {books.length > 0 ? (
            books.map((book) => (
              <BookCard key={book.id} book={book} onEdit={() => editBook(book)} onDelete={() => deleteBook(book.id)} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              <p>No books in your collection yet. Add your first book above!</p>
            </div>
          )}
        </section>
      </div>

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}

interface BookCardProps {
  book: BookType
  onEdit: () => void
  onDelete: () => void
}

// book card component
const BookCard = ({ book, onEdit, onDelete }: BookCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      action()
    }
  }

  return (
    <article
      className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
      aria-label={`Book: ${book.title} by ${book.author}`}
    >
      <div className="relative h-64 w-full">
        {book.image.startsWith("data:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.image || "/placeholder.svg"}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <Image src={book.image || "/placeholder.svg"} alt={`Cover of ${book.title}`} fill className="object-cover" />
        )}
      </div>

      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{book.title}</h2>
        <p className="text-sm text-gray-500 mb-2">by {book.author}</p>
        <p className="text-gray-700 line-clamp-3">{book.description}</p>
      </div>

      <div className="px-6 py-4 bg-gray-50 flex justify-between">
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            onKeyDown={(e) => handleKeyDown(e, onEdit)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            aria-label={`Edit ${book.title}`}
          >
            <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
            <span>Edit</span>
          </button>

          <button
            onClick={onDelete}
            onKeyDown={(e) => handleKeyDown(e, onDelete)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-red-500 hover:text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors"
            aria-label={`Delete ${book.title}`}
          >
            <Trash className="h-4 w-4 mr-1" aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>

        <button
          className="inline-flex items-center px-3 py-1.5 bg-gray-900 text-sm font-medium rounded text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors"
          aria-label={`Buy ${book.title}`}
        >
          <ShoppingCart className="h-4 w-4 mr-1" aria-hidden="true" />
          <span>Buy</span>
        </button>
      </div>
    </article>
  )
}

