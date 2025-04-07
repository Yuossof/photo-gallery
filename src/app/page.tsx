"use client"
import { memo, useCallback, useState, useReducer } from "react"
import Image from "next/image"
import { type ChangeEvent, useEffect } from "react"
import { Trash, Edit, ShoppingCart, Plus, Check, AlertCircle, Upload, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Inter, Playfair_Display } from "next/font/google"


// Define fonts
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-playfair" })

// Types
interface Book {
  id: string
  title: string
  author: string
  description: string
  image: string
}

interface FormState {
  book: Book
  editing: boolean
  errors: {
    title: string | null
    author: string | null
    description: string | null
  }
  touched: {
    title: boolean
    author: boolean
    description: boolean
  }
  selectedImage: string | null
}

type FormAction =
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "SET_ERRORS"; errors: Partial<FormState["errors"]> }
  | { type: "SET_TOUCHED"; field: keyof FormState["touched"]; value: boolean }
  | { type: "SET_ALL_TOUCHED"; value: boolean }
  | { type: "SET_SELECTED_IMAGE"; value: string | null }
  | { type: "LOAD_BOOK"; book: Book }
  | { type: "RESET_FORM" }

// Constants
const DEFAULT_COVERS = [
  "https://res.cloudinary.com/db1lfazhq/image/upload/v1736091988/oxrripuwg0gqwa4ithge.jpg",
  "https://res.cloudinary.com/db1lfazhq/image/upload/v1736114455/va9spfgkn9qajldmhily.jpg",
  "https://res.cloudinary.com/db1lfazhq/image/upload/v1736285175/beskrgdsbyqnky8hflgi.jpg",
]

// Image upload constraints
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB - limit chosen to balance usability with performance concerns
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] // Common web formats with good compression

// CSS classes for consistent styling
// Using Tailwind utility classes for maintainable and consistent UI
// These class combinations create reusable button and input styles
const BUTTON_BASE = "focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors" // Base styles for all buttons
const PRIMARY_BUTTON = `${BUTTON_BASE} bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:ring-purple-500 shadow-md` // Action buttons
const SECONDARY_BUTTON = `${BUTTON_BASE} border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-purple-400 shadow-sm` // Secondary actions
const DANGER_BUTTON = `${BUTTON_BASE} border border-gray-300 rounded-md text-rose-500 hover:text-rose-700 bg-white hover:bg-gray-50 focus:ring-rose-400` // Destructive actions
const INPUT_BASE =
  "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200" // Form inputs

/**
 * Helper function to generate a unique ID for each book
 * Uses a random string to ensure uniqueness
 */
const generateId = () => "id-" + Math.random().toString(36).substr(2, 9)

/**
 * Form reducer to manage form state
 * Handles all form-related actions
 */
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        book: { ...state.book, [action.field]: action.value },
      }
    case "SET_ERRORS":
      return {
        ...state,
        errors: { ...state.errors, ...action.errors },
      }
    case "SET_TOUCHED":
      return {
        ...state,
        touched: { ...state.touched, [action.field]: action.value },
      }
    case "SET_ALL_TOUCHED":
      return {
        ...state,
        touched: { title: action.value, author: action.value, description: action.value },
      }
    case "SET_SELECTED_IMAGE":
      return {
        ...state,
        selectedImage: action.value,
        book: action.value ? { ...state.book, image: action.value } : state.book,
      }
    case "LOAD_BOOK":
      return {
        ...state,
        book: action.book,
        editing: true,
        selectedImage: action.book.image.startsWith("data:") ? action.book.image : null,
        errors: { title: null, author: null, description: null },
        touched: { title: false, author: false, description: false },
      }
    case "RESET_FORM":
      return {
        book: { id: "", title: "", author: "", description: "", image: DEFAULT_COVERS[0] },
        editing: false,
        errors: { title: null, author: null, description: null },
        touched: { title: false, author: false, description: false },
        selectedImage: null,
      }
    default:
      return state
  }
}

/**
 * Toast notification component
 * Displays success or error messages to the user
 * Auto-dismisses after a timeout
 */
const Toast = memo(
  ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
    useEffect(() => {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }, [onClose])

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        role="alert"
        aria-live="assertive"
        className={`fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg flex items-center space-x-2 z-50 ${
          type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
        }`}
      >
        {type === "success" ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </motion.div>
    )
  },
)

// Required for React DevTools and debugging
Toast.displayName = "Toast"

/**
 * Main BookStore component
 * Manages the book collection and provides UI for CRUD operations
 */
export default function BookStore() {
  // Books state - stores the collection of books
  const [books, setBooks] = useState<Book[]>([
    {
      id: generateId(),
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      description: "A novel about the decadence and excess of the Jazz Age.",
      image: DEFAULT_COVERS[0],
    },
    {
      id: generateId(),
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      description: "A novel about racial inequality and moral growth in the American South.",
      image: DEFAULT_COVERS[1],
    },
  ])

  // Form state - manages the current book being added or edited
  const [formState, dispatch] = useReducer(formReducer, {
    book: { id: "", title: "", author: "", description: "", image: DEFAULT_COVERS[0] },
    editing: false,
    errors: { title: null, author: null, description: null },
    touched: { title: false, author: false, description: false },
    selectedImage: null,
  })

  // Toast state - manages notification messages
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  })

  /**
   * Shows a toast notification with the specified message and type
   */
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
  }, [])

  /**
   * Hides the currently displayed toast notification
   */
  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }))
  }, [])

  /**
   * Validates a single form field
   * Returns an error message if validation fails, null otherwise
   */
  const validateField = useCallback(
    (field: keyof Pick<Book, "title" | "author" | "description">, value: string): string | null => {
      if (!value.trim()) return `${field} is required`

      switch (field) {
        case "title":
          if (value.trim().length < 3) return "Title must be at least 3 characters"
          if (value.trim().length > 100) return "Title must be less than 100 characters"
          break
        case "author":
          if (value.trim().length < 3) return "Author must be at least 3 characters"
          if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return "Author name contains invalid characters"
          break
        case "description":
          if (value.trim().length < 10) return "Description must be at least 10 characters"
          if (value.trim().length > 500) return "Description must be less than 500 characters"
          break
      }

      return null
    },
    [],
  )

  /**
   * Validates the entire form
   * Returns true if all fields are valid, false otherwise
   */
  const validateForm = useCallback(() => {
    const titleError = validateField("title", formState.book.title)
    const authorError = validateField("author", formState.book.author)
    const descriptionError = validateField("description", formState.book.description)

    dispatch({
      type: "SET_ERRORS",
      errors: { title: titleError, author: authorError, description: descriptionError },
    })
    dispatch({ type: "SET_ALL_TOUCHED", value: true })

    return !titleError && !authorError && !descriptionError
  }, [formState.book, validateField])

  /**
   * Handles changes to form fields
   * Updates the form state and validates the field if it has been touched
   */
  const handleChange = useCallback(
    (field: keyof Book, value: string) => {
      dispatch({ type: "SET_FIELD", field, value })

      if (field in formState.touched && formState.touched[field as keyof typeof formState.touched]) {
        const error = validateField(field as keyof Pick<Book, "title" | "author" | "description">, value)
        dispatch({ type: "SET_ERRORS", errors: { [field]: error } })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formState.touched, validateField],
  )

  /**
   * Handles blur events on form fields
   * Marks the field as touched and validates it
   */
  const handleBlur = useCallback(
    (field: keyof typeof formState.touched) => {
      dispatch({ type: "SET_TOUCHED", field, value: true })
      const error = validateField(field as keyof Pick<Book, "title" | "author" | "description">, formState.book[field])
      dispatch({ type: "SET_ERRORS", errors: { [field]: error } })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formState.book, validateField],
  )

  /**
   * Converts a File object to a base64 string
   * Used for image uploads
   */
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }, [])

  /**
   * Handles file input changes for image uploads
   * Validates the file type and size, then converts to base64
   * Provides detailed error feedback for invalid uploads
   */
  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!VALID_IMAGE_TYPES.includes(file.type)) {
          const validExtensions = VALID_IMAGE_TYPES.map((t) => t.split("/")[1].toUpperCase()).join(", ")
          showToast(`Invalid file type: ${file.type}. Please upload a valid image file (${validExtensions}).`, "error")
          return
        }

        // Validate file size
        if (file.size > MAX_IMAGE_SIZE) {
          const maxSizeMB = MAX_IMAGE_SIZE / (1024 * 1024)
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
          showToast(
            `Image file is too large (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB. Please compress your image or choose a smaller file.`,
            "error",
          )
          return
        }

        // Convert to base64
        try {
          const base64 = await fileToBase64(file)

          // Additional validation: Check if the base64 string is valid
          if (!base64 || !base64.startsWith("data:image/")) {
            showToast("The file appears to be corrupted or is not a valid image. Please try another file.", "error")
            return
          }

          dispatch({ type: "SET_SELECTED_IMAGE", value: base64 })
          showToast("Image uploaded successfully!", "success")
        } catch (error) {
          console.error("Error converting image to base64:", error)
          showToast("Failed to process the image. The file may be corrupted or use an unsupported encoding.", "error")
        }
      } catch (error) {
        console.error("Error processing image:", error)
        showToast(
          "An unexpected error occurred while processing your image. Please try again with a different file.",
          "error",
        )
      } finally {
        // Reset the input value to allow selecting the same file again
        e.target.value = ""
      }
    },
    [showToast, fileToBase64],
  )

  /**
   * Handles selection of a default cover image
   */
  const handleCoverSelect = useCallback((cover: string) => {
    dispatch({ type: "SET_SELECTED_IMAGE", value: null })
    dispatch({ type: "SET_FIELD", field: "image", value: cover })
  }, [])

  /**
   * Adds a new book to the collection
   * Validates the form first, then creates a new book
   */
  const addBook = useCallback(() => {
    if (!validateForm()) {
      showToast("Please correct the errors in the form before adding the book.", "error")
      return
    }

    const newBook = {
      ...formState.book,
      id: generateId(),
      image: formState.selectedImage || formState.book.image,
    }

    setBooks((prev) => [...prev, newBook])
    showToast("Book added successfully!", "success")
    dispatch({ type: "RESET_FORM" })
  }, [formState.book, formState.selectedImage, showToast, validateForm])

  /**
   * Updates an existing book in the collection
   * Validates the form first, then updates the book
   */
  const updateBook = useCallback(() => {
    if (!validateForm()) {
      showToast("Please correct the errors in the form before updating the book.", "error")
      return
    }

    const updatedBook = {
      ...formState.book,
      image: formState.selectedImage || formState.book.image,
    }

    setBooks((prev) => prev.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
    showToast("Book updated successfully!", "success")
    dispatch({ type: "RESET_FORM" })
  }, [formState.book, formState.selectedImage, showToast, validateForm])

  /**
   * Deletes a book from the collection
   */
  const deleteBook = useCallback(
    (id: string) => {
      setBooks((prev) => prev.filter((book) => book.id !== id))
      showToast("Book deleted successfully!", "success")
    },
    [showToast],
  )

  /**
   * Loads a book into the form for editing
   */
  const editBook = useCallback((book: Book) => {
    dispatch({ type: "LOAD_BOOK", book })
  }, [])

  /**
   * Handles form submission
   * Calls either addBook or updateBook depending on the editing state
   */
  const handleSubmit = useCallback(() => {
    if (formState.editing) {
      updateBook()
    } else {
      addBook()
    }
  }, [formState.editing, updateBook, addBook])

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8 ${inter.variable} ${playfair.variable} font-sans`}
    >
      {/* Skip link for keyboard users */}
      <a
        href="#form-heading"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12" role="banner">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-4xl font-bold text-gray-900 sm:text-5xl ${playfair.className} drop-shadow-sm`}
          >
            Book Store
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-lg text-purple-700"
          >
            Manage your book collection
          </motion.p>
        </header>

        {/* Book Form Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg mb-12 overflow-hidden border border-purple-100"
          aria-labelledby="form-heading"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
            <h2 id="form-heading" className={`text-xl font-semibold text-purple-900 ${playfair.className}`}>
              {formState.editing ? "Edit Book" : "Add New Book"}
            </h2>
          </div>

          <div className="p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Form Fields */}
              <div className="space-y-4">
                {/* Title Field */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formState.book.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    onBlur={() => handleBlur("title")}
                    placeholder="Enter book title"
                    className={`${INPUT_BASE} ${formState.errors.title ? "border-red-500" : "border-gray-300"}`}
                    aria-invalid={!!formState.errors.title}
                    aria-describedby={formState.errors.title ? "title-error title-help" : "title-help"}
                    required
                  />
                  {formState.errors.title && formState.touched.title && (
                    <p id="title-error" className="mt-1 text-sm text-red-500" role="alert">
                      {formState.errors.title}
                    </p>
                  )}
                  <p id="title-help" className="mt-1 text-xs text-gray-500">
                    Title should be between 3 and 100 characters
                  </p>
                </div>

                {/* Author Field */}
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                    Author{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <input
                    id="author"
                    type="text"
                    value={formState.book.author}
                    onChange={(e) => handleChange("author", e.target.value)}
                    onBlur={() => handleBlur("author")}
                    placeholder="Enter author name"
                    className={`${INPUT_BASE} ${formState.errors.author ? "border-red-500" : "border-gray-300"}`}
                    aria-invalid={!!formState.errors.author}
                    aria-describedby={formState.errors.author ? "author-error author-help" : "author-help"}
                    required
                  />
                  {formState.errors.author && formState.touched.author && (
                    <p id="author-error" className="mt-1 text-sm text-red-500" role="alert">
                      {formState.errors.author}
                    </p>
                  )}
                  <p id="author-help" className="mt-1 text-xs text-gray-500">
                    Author name should contain letters, spaces, and characters like periods, apostrophes, or hyphens
                  </p>
                </div>

                {/* Description Field */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <textarea
                    id="description"
                    value={formState.book.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    onBlur={() => handleBlur("description")}
                    placeholder="Enter book description"
                    rows={3}
                    className={`${INPUT_BASE} ${formState.errors.description ? "border-red-500" : "border-gray-300"}`}
                    aria-invalid={!!formState.errors.description}
                    aria-describedby={
                      formState.errors.description
                        ? "description-error description-help description-count"
                        : "description-help description-count"
                    }
                    required
                  />
                  {formState.errors.description && formState.touched.description && (
                    <p id="description-error" className="mt-1 text-sm text-red-500" role="alert">
                      {formState.errors.description}
                    </p>
                  )}
                  <div className="mt-1 flex justify-between">
                    <p id="description-help" className="text-xs text-gray-500">
                      Description should be between 10 and 500 characters
                    </p>
                    <p id="description-count" className="text-xs text-gray-500" aria-live="polite">
                      {formState.book.description.length}/500
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                    Book Cover
                  </label>
                  <div className="relative">
                    <input
                      id="image"
                      type="file"
                      accept={VALID_IMAGE_TYPES.join(",")}
                      onChange={handleFileChange}
                      className="sr-only"
                      aria-describedby="cover-help"
                    />
                    <label
                      htmlFor="image"
                      className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-transparent mb-2 transition-all duration-200 cursor-pointer bg-white hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2 text-gray-500" aria-hidden="true" />
                      <span>Choose image file</span>
                    </label>
                  </div>
                  <p id="cover-help" className="text-sm text-gray-500">
                    Upload a custom image (JPEG, PNG, GIF, WEBP, max 5MB) or select from default covers below
                  </p>
                </div>

                {/* Default Covers */}
                <div className="mt-4">
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-2">Default Covers</legend>
                    <div role="radiogroup" aria-label="Choose a default cover" className="flex space-x-2">
                      {DEFAULT_COVERS.map((cover, index) => {
                        const isSelected = formState.book.image === cover && !formState.selectedImage
                        return (
                          // eslint-disable-next-line jsx-a11y/role-supports-aria-props
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            key={index}
                            type="button"
                            onClick={() => handleCoverSelect(cover)}
                            onKeyDown={(e) => {
                              // Allow navigation between covers with arrow keys
                              if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                                e.preventDefault()
                                const direction = e.key === "ArrowLeft" ? -1 : 1
                                const nextIndex = (index + direction + DEFAULT_COVERS.length) % DEFAULT_COVERS.length
                                const nextCoverButton = e.currentTarget.parentElement?.children[
                                  nextIndex
                                ] as HTMLElement
                                if (nextCoverButton) {
                                  nextCoverButton.focus()
                                }
                              }
                            }}
                            className={`relative w-16 h-24 border-2 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                              isSelected ? "border-purple-500 shadow-md" : "border-gray-300"
                            }`}
                            aria-label={`Select default cover ${index + 1}`}
                            aria-pressed={isSelected}
                            role="radio"
                          >
                            <Image
                              src={cover || "/placeholder.svg"}
                              alt={`Default cover ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </motion.button>
                        )
                      })}
                    </div>
                  </fieldset>
                </div>

                {/* Cover Preview */}
                <div className="mt-4">
                  <p className="block text-sm font-medium text-gray-700 mb-2">Cover Preview</p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative w-40 h-56 mx-auto border rounded-md overflow-hidden shadow-md"
                    aria-label="Book cover preview"
                  >
                    {formState.selectedImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formState.selectedImage || "/placeholder.svg"}
                        alt="Book cover preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={formState.book.image || "/placeholder.svg"}
                        alt="Book cover preview"
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 flex justify-end gap-2">
            {formState.editing && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  dispatch({ type: "RESET_FORM" })
                  // Focus the first input after canceling
                  setTimeout(() => {
                    document.getElementById("title")?.focus()
                  }, 0)
                }}
                className={`px-4 py-2 ${SECONDARY_BUTTON}`}
                aria-label="Cancel editing"
                type="button"
              >
                Cancel
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                handleSubmit()
                // If successful (no validation errors), focus the title input
                if (!formState.errors.title && !formState.errors.author && !formState.errors.description) {
                  setTimeout(() => {
                    document.getElementById("title")?.focus()
                  }, 0)
                }
              }}
              className={`px-4 py-2 ${PRIMARY_BUTTON} flex items-center`}
              aria-label={formState.editing ? "Update book" : "Add book"}
              type="button"
            >
              {formState.editing ? (
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
            </motion.button>
          </div>
        </motion.section>

        {/* Book List Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          aria-label="Book collection"
        >
          <AnimatePresence>
            {books.length > 0 ? (
              books.map((book) => (
                <motion.article
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl border border-gray-100 focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2"
                  tabIndex={0} // Make the card focusable
                  onKeyDown={(e) => {
                    // Allow activation of the card with Enter or Space
                    if (e.key === "Enter" || e.key === " ") {
                      // Focus the first button in the card
                      const firstButton = e.currentTarget.querySelector("button")
                      if (firstButton) {
                        e.preventDefault()
                        firstButton.focus()
                      }
                    }
                  }}
                >
                  <div className="relative h-64 w-full overflow-hidden group">
                    {book.image.startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.image || "/placeholder.svg"}
                        alt={`Cover of ${book.title}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Image
                        src={book.image || "/placeholder.svg"}
                        alt={`Cover of ${book.title}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-6">
                    <h2 className={`text-xl font-semibold mb-1 ${playfair.className} text-gray-900`}>{book.title}</h2>
                    <p className="text-sm text-purple-600 mb-2 font-medium">by {book.author}</p>
                    <p className="text-gray-700 line-clamp-3">{book.description}</p>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 flex justify-between">
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => editBook(book)}
                        className={`inline-flex items-center px-3 py-1.5 ${SECONDARY_BUTTON}`}
                        aria-label={`Edit ${book.title}`}
                      >
                        <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
                        <span>Edit</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteBook(book.id)}
                        className={`inline-flex items-center px-3 py-1.5 ${DANGER_BUTTON}`}
                        aria-label={`Delete ${book.title}`}
                      >
                        <Trash className="h-4 w-4 mr-1" aria-hidden="true" />
                        <span>Delete</span>
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`inline-flex items-center px-3 py-1.5 ${PRIMARY_BUTTON}`}
                      aria-label={`Buy ${book.title}`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>Buy</span>
                    </motion.button>
                  </div>
                </motion.article>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-10 text-gray-500"
              >
                <p>No books in your collection yet. Add your first book above!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* Status announcements for screen readers */}
      <div aria-live="polite" className="sr-only" role="status">
        {formState.editing ? "Editing book: " + formState.book.title : "Adding a new book"}
        {books.length === 0 && "Your book collection is empty. Use the form to add your first book."}
        {books.length === 1 && "Your collection has 1 book."}
        {books.length > 1 && `Your collection has ${books.length} books.`}
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      </AnimatePresence>
    </div>
  )
}
