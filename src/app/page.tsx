"use client"
import { useState } from "react";

// const schema = {
//   commentary: "To create a simple photo gallery app, I will use the Next.js template and create a Gallery component. The component will display a grid of images and allow users to upload new images.",
//   template: "nextjs-developer",
//   title: "Photo Gallery",
//   description: "A simple photo gallery app built with Next.js and TypeScript.",
//   additional_dependencies: [],
//   has_additional_dependencies: false,
//   install_dependencies_command: "",
//   port: 3000,
//   file_path: "pages/index.tsx",
// }

const images = [
  { id: 1, url: "/image1.jpg" },
  { id: 2, url: "/image2.jpg" },
  { id: 3, url: "/image3.jpg" },
  { id: 4, url: "/image4.jpg" },
  { id: 5, url: "/image5.jpg" },
]

function Gallery() {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
      <h1 className="text-3xl font-bold mb-4">Photo Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="border border-gray-200 rounded-xl p-4 hover:shadow-md cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-48 h-48">
              <img className="w-full h-full object-cover" src={image.url} alt={`Image ${image.id}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Selected Image</h2>
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-80 h-80">
            <img className="w-full h-full object-cover" src={selectedImage.url} alt="Selected Image" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
