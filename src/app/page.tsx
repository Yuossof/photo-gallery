"use client";
import { useEffect, useState } from "react";

// Define the image data type
type Image = {
  id: number;
  url: string;
  description: string;
};

function Gallery() {
  const [images, setImages] = useState<Image[]>([]); // Store images in state
  const [selectedImage, setSelectedImage] = useState<Image | null>(null); // Store the selected image
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Store error messages
  const [description, setDescription] = useState(""); // Store the description input by the user

  // Load stored images from localStorage when the page loads
  useEffect(() => {
    const storedImages = localStorage.getItem("gallery-images");
    if (storedImages) {
      setImages(JSON.parse(storedImages));
    }
  }, []);

  // Update localStorage whenever the images array changes
  useEffect(() => {
    localStorage.setItem("gallery-images", JSON.stringify(images));
  }, [images]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null); // Reset error message

    if (!event.target.files || event.target.files.length === 0) return; // Check if files are selected

    const file = event.target.files[0];

    // Check if the uploaded file is an image
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image (JPG, PNG...)");
      return;
    }

    // Check if the file size is larger than 5MB
    if (file.size > 5 * 1024 * 1024) { 
      setErrorMessage("File size is too large. Please upload an image smaller than 5MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file); // Create a URL for the local image

    const newImage: Image = {
      id: Date.now(), // Use current time as a unique ID for the image
      url: imageUrl,
      description: description || "No description", // Use a default description if none provided
    };

    setImages((prev) => [...prev, newImage]); // Add the new image to the images array
    setDescription(""); // Reset the description input
    event.target.value = ""; // Reset the input field value
  };

  // Delete an image from the gallery
  const handleDeleteImage = (id: number) => {
    setImages((prev) => prev.filter((image) => image.id !== id)); // Remove image from the state
  };

  // Edit an image description
  const handleEditDescription = (id: number, newDescription: string) => {
    setImages((prev) =>
      prev.map((image) =>
        image.id === id ? { ...image, description: newDescription } : image
      )
    ); // Update the description of the selected image
  };

  return (
    <div className="container mx-auto p-6 bg-gradient-to-r from-blue-200 to-blue-400 min-h-screen">
      <h1 className="text-4xl font-semibold mb-6 text-center text-white">Photo Gallery</h1>

      {/* File upload and description input */}
      <div className="mb-6 flex flex-col items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="border-2 border-gray-300 p-3 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />
        <input
          type="text"
          placeholder="Enter image description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-2 border-gray-300 p-3 rounded-xl w-80 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />
        {errorMessage && (
          <p className="text-red-600 text-sm font-semibold">{errorMessage}</p>
        )}
      </div>

      {/* Display images in a responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="border-2 border-gray-300 rounded-xl p-3 hover:shadow-xl hover:bg-gray-100 transition duration-300 cursor-pointer"
            onClick={() => setSelectedImage(image)} // Show image in a modal on click
          >
            <img
              src={image.url}
              alt={image.description}
              className="w-full h-48 object-cover rounded-lg"
            />
            <p className="text-sm mt-2 text-center text-gray-700">{image.description}</p>
            
            {/* Add Edit and Delete buttons */}
            <div className="flex justify-between mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newDescription = prompt("Enter new description", image.description);
                  if (newDescription !== null) handleEditDescription(image.id, newDescription);
                }}
                className="text-blue-600 text-sm"
              >
                Edit Description
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(image.id);
                }}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to view selected image */}
      {selectedImage && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)} // Close the modal when clicking on the background
        >
          <div
            className="bg-white p-6 rounded-xl max-w-lg w-full text-center relative"
            onClick={(e) => e.stopPropagation()} // Prevent the image click from closing the modal
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.description}
              className="w-full h-80 object-cover rounded-lg mb-4"
            />
            <p className="text-lg font-semibold text-gray-800">{selectedImage.description}</p>
            <button
              onClick={() => setSelectedImage(null)} // Close the modal on button click
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;
