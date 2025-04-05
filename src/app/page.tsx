"use client";
import { Pencil, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

// Define the image data type
type ImageType = {
  id: number;
  url: string;
  description: string;
  title: string
};


const Modal = ({ image, onClose }: { image: ImageType; onClose: () => void }) => (
  <div className="modal">
    <div
      role="button"
      tabIndex={0}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      className="fixed top-0 left-0 w-full h-full bg-black flex items-center justify-center z-50"
      onClick={onClose} // Close the modal on click of the background
    >
      <div
        className="bg-slate-900 p-6 rounded-md max-w-lg w-full text-center relative"
        onClick={(e) => e.stopPropagation()} // Prevent the image click from closing the modal
      >
        <Image
          src={image.url}
          alt={image.title}
          className="w-full object-cover rounded-lg mb-4"
          height={350}
          width={500}
          loading="lazy"
        />
        <div className="px-6 py-4 text-left">
          <h3 className="text-xl font-semibold mb-2 text-blue-400">{image.title === "" ? "No Title" : image.title}</h3>
          <p className="text-gray-300 text-sm">
            {image.description}
          </p>
        </div>
        <button
          onClick={onClose} // Close the modal on button click
          className="mt-4 px-6 py-3 bg-blue-600 w-full text-white cursor-pointer rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

function Gallery() {
  const [images, setImages] = useState<ImageType[]>([]); // Store images in state
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null); // Store the selected image
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Store error messages
  const [description, setDescription] = useState(""); // Store the description input by the user
  const [title, setTitle] = useState(""); // Store the title input by the user

  // This function loads images from localStorage and sets them into state
  const loadStoredImages = () => {
    try {
      const storedImages = localStorage.getItem("gallery-images");
      if (storedImages) {
        const parsedImages: ImageType[] = JSON.parse(storedImages);
        setImages(parsedImages); // ستتم عملية التحويل بشكل صحيح هنا
      } else {
        setErrorMessage("No images found in localStorage.");
      }
    } catch (error) {
      setErrorMessage(`Failed to load images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  // loading image when loading page
  useEffect(() => {
    loadStoredImages();
  }, []);

  // Load stored images from localStorage when the page loads


  // Update localStorage whenever the images array changes
  useEffect(() => {
    localStorage.setItem("gallery-images", JSON.stringify(images));
  }, [images]);

  // Cleanup image URLs after images are removed from the gallery
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        cleanupImageUrl(image.url);
      });
    };
  }, [images]);

  const cleanupImageUrl = (url: string) => {
    if (url) {
      URL.revokeObjectURL(url); // Revoke the object URL to free memory
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  // Handle image upload
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null); // Reset error message

    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    try {
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

      const base64Image = await convertToBase64(file); // Convert image to base64

      const newImage: ImageType = {
        id: Date.now(), // Use current time as a unique ID
        url: base64Image, // Store base64 data as string
        description: description || "No description",
        title: title,
      };

      setImages((prev) => [...prev, newImage]); // Add the new image to the images array
      setDescription(""); // Reset the description input
      event.target.value = ""; // Reset the input field value

    } catch (error) {
      setErrorMessage("An error occurred while uploading the image.");
      console.error("Error uploading image:", error);
    }

  }, [description, title]);



  // Delete an image from the gallery
  const handleDeleteImage = useCallback((id: number) => {
    setImages((prev) => {
      const updatedImages = prev.filter((image) => image.id !== id);
      const deletedImage = prev.find((image) => image.id === id);

      if (deletedImage) {
        cleanupImageUrl(deletedImage.url); // Clean up the image URL only when it's deleted
      }
      return updatedImages;
    });
  }, []);

  // Edit an image description
  const handleEditDescription = (id: number, newDescription: string, newTitle: string) => {
    setImages((prev) => {
      const updatedImages = prev.map((image) =>
        image.id === id
          ? { ...image, description: newDescription, title: newTitle }
          : image
      );
      return updatedImages;
    });

  };
  return (
    <div className="container mx-auto p-6 bg-[#0f172a] min-h-screen">
      <h1 className="text-4xl font-semibold mb-6 text-center text-white">Photo Gallery</h1>

      {/* File upload and description input */}
      <div className="mb-6 flex flex-col items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="border-[1px] border-slate-600 hover:border-blue-500  shadow-md p-3 rounded-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />
        <input
          type="text"
          placeholder="Enter image title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-[1px] border-slate-600 py-2 shadow-md rounded-sm w-80 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />
        <input
          type="text"
          placeholder="Enter image description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-[1px] border-slate-600 py-2 shadow-md rounded-sm w-80 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        />
        {errorMessage && (
          <p className="text-red-600 text-sm font-semibold">{errorMessage}</p>
        )}
      </div>

      {/* Display images in a responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-16">
        {images.map((image) => (
          <SimpleCard key={image.id} image={image} handleDeleteImage={handleDeleteImage} handleEditDescription={handleEditDescription} setSelectedImage={setSelectedImage} />
        ))}
      </div>

      {/* Modal to view selected image */}
      {selectedImage && (
        <Modal
          image={selectedImage}
          onClose={() => setSelectedImage(null)} // Close the modal on click on close button
        />
      )}
    </div>
  );
}

export default Gallery;

interface Props {
  image: ImageType;
  handleEditDescription: (id: number, newDescription: string, title: string) => void;
  handleDeleteImage: (id: number) => void;
  setSelectedImage: (image: ImageType) => void
}

function SimpleCard({ image, handleEditDescription, handleDeleteImage, setSelectedImage }: Props) {
  const [showEditBox, setShowEditBox] = useState(false)
  const [imageData, setImageData] = useState({
    title: image.title,
    description: image.description
  })

  return (
    <>
      {showEditBox && (
        <div
          onClick={() => setShowEditBox(false)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          className="fixed top-0 right-0 bottom-0 left-0 z-50 flex w-full h-full justify-center">
          <div className="flex h-[70vh] w-full justify-center items-center">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-md border-[1px] border-slate-800 lg:w-2/6 md:w-2/5 w-[90%] relative">
              <X onClick={() => setShowEditBox(false)} className="absolute top-2 right-2 cursor-pointer hover:text-gray-400 text-gray-300" size={19} />
              <div className="mt-8 flex flex-col gap-3 p-3">
                <input
                  className="border-[1px] rounded-sm h-10 outline-none border-slate-700 px-2"
                  type="text"
                  value={imageData.title}
                  placeholder="Title" onChange={(e) => setImageData({ ...imageData, title: e.target.value })}
                />
                <input
                  className="border-[1px] rounded-sm h-10 outline-none border-slate-700 px-2"
                  value={imageData.description}
                  type="text"
                  placeholder="Description"
                  onChange={(e) => setImageData({ ...imageData, description: e.target.value })} />
                <button
                  aria-label={`Save image data`}
                  onClick={() => {
                    if (imageData.description || imageData.title !== "") {
                      handleEditDescription(image.id, imageData.description, imageData.title);
                    }
                    setShowEditBox(false);
                  }}
                  className="w-full h-9 bg-blue-700 text-gray-200 rounded-sm hover:bg-blue-600 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        onClick={() => setSelectedImage(image)}
        className="max-w-sm rounded-lg overflow-hidden shadow-md hover:shadow-blue-900/20 hover:shadow-xl transition-all duration-300 bg-gray-900 border border-gray-800 cursor-pointer">
        {/* Image */}
        <div className="relative">
          <Image
            src={image.url}
            alt={`Image titled ${image.title}. Description: ${image.description}`}
            className="w-full h-48 object-cover"
            height={200}
            width={300}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <h3 className="text-xl font-semibold mb-2 text-blue-400">{image.title === "" ? "No Title" : image.title}</h3>
          <p className="text-gray-300 text-sm">
            {image.description}
          </p>
        </div>

        {/* Footer with buttons */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-between">
          <button
            aria-label={`Edit image titled ${image.title}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowEditBox(true)
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-700 text-gray-300 hover:bg-blue-900/30 hover:text-blue-400 hover:border-blue-700 transition-colors">
            <Pencil className="h-4 w-4" />
            Edit
          </button>

          <button
            aria-label={`Delete image titled ${image.title}`}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteImage(image.id);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-400 hover:border-red-800 transition-colors">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </>
  )
}










