"use client"

import { useState } from "react"
import { Trash2, Edit, Plus, Save, CheckCircle, Circle, ClipboardList } from "lucide-react"

const NotesApp = () => {
  const [notes, setNotes] = useState([
    { id: 1, text: "Buy groceries", completed: false },
    { id: 2, text: "Do laundry", completed: false },
  ])
  const [newNote, setNewNote] = useState("")
  const [updateNoteId, setUpdateNoteId] = useState<number | null>(null)
  const [updateNoteText, setUpdateNoteText] = useState("")

  const addNote = () => {
    if (newNote.trim() !== "") {
      const newNotes = [...notes, { id: notes.length + 1, text: newNote, completed: false }]
      setNotes(newNotes)
      setNewNote("")
    }
  }

  const deleteNote = (id: number) => {
    const newNotes = notes.filter((note) => note.id !== id)
    setNotes(newNotes)
  }

  const updateNote = (id: number) => {
    setUpdateNoteId(id)
    const noteToUpdate = notes.find((note) => note.id === id)
    if (noteToUpdate) {
      setUpdateNoteText(noteToUpdate.text)
    }
  }

  const saveUpdateNote = () => {
    if (updateNoteId !== null && updateNoteText.trim() !== "") {
      const newNotes = notes.map((note) => {
        if (note.id === updateNoteId) {
          return { ...note, text: updateNoteText }
        }
        return note
      })
      setNotes(newNotes)
      setUpdateNoteId(null)
      setUpdateNoteText("")
    }
  }

  const toggleCompleted = (id: number) => {
    const newNotes = notes.map((note) => {
      if (note.id === id) {
        return { ...note, completed: !note.completed }
      }
      return note
    })
    setNotes(newNotes)
  }

  const filteredNotes = notes.filter((note) => note.completed)
  const activeNotes = notes.filter((note) => !note.completed)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <div className="flex items-center justify-center">
            <ClipboardList className="h-8 w-8 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">Notes App</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-2 mb-6">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="Add new note"
              onKeyDown={(e) => {
                if (e.key === "Enter") addNote()
              }}
            />
            <button
              onClick={addNote}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Note
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <Circle className="h-5 w-5 mr-2 text-purple-600" />
              Active Notes
            </h2>
            {activeNotes.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">No active notes. Add one above!</p>
            ) : (
              <ul className="space-y-3">
                {activeNotes.map((note) => (
                  <li
                    key={note.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-grow">
                        <button
                          onClick={() => toggleCompleted(note.id)}
                          className="mr-3 text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          <Circle className="h-5 w-5" />
                        </button>

                        {updateNoteId === note.id ? (
                          <input
                            type="text"
                            value={updateNoteText}
                            onChange={(e) => setUpdateNoteText(e.target.value)}
                            className="flex-grow p-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveUpdateNote()
                            }}
                          />
                        ) : (
                          <span className="text-gray-800">{note.text}</span>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {updateNoteId === note.id ? (
                          <button
                            onClick={saveUpdateNote}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            title="Save"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => updateNote(note.id)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center border-t pt-6">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Completed Notes
            </h2>
            {filteredNotes.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4">No completed notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {filteredNotes.map((note) => (
                  <li key={note.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button onClick={() => toggleCompleted(note.id)} className="mr-3 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <span className="text-gray-500 line-through">{note.text}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotesApp



