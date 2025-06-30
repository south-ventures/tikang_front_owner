import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronRight, FaHotel, FaPlus, FaEdit, FaTrash, FaBed } from "react-icons/fa";
import DashboardNavBar from "../../components/Navbar";
import DashboardTabs from "./DashboardTabs";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import WarningPopup from "../../components/WarningPopup";
import WarningPop from "../../components/WarningPop";
const RoomDetailsModal = ({ isOpen, onClose, room }) => {
  if (!isOpen || !room) return null;

  // Fallback-safe parsing for amenities
  const parsedAmenities = Array.isArray(room.room_amenities)
    ? room.room_amenities
    : typeof room.room_amenities === "string"
      ? (() => {
          try {
            return JSON.parse(room.room_amenities);
          } catch {
            return room.room_amenities.split(",").map(a => a.trim());
          }
        })()
      : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white max-w-2xl w-full rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Room Details</h2>

        {Array.isArray(room.room_images) && room.room_images.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {room.room_images.map((url, i) => (
              <img
                key={i}
                src={`${process.env.REACT_APP_API_URL}${url}`}
                alt={`room-thumbnail-${i}`}
                className="h-24 rounded object-cover border"
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm break-words">
          <p><strong>Name:</strong> {room.room_name || "N/A"}</p>
          <p><strong>Type:</strong> {room.room_type || "N/A"}</p>
          <p><strong>Rate/Night:</strong> ₱{room.room_price_per_night || room.price_per_night || "0"}</p>
          <p><strong>Max Guests:</strong> {room.max_guests ?? "N/A"}</p>
          <p><strong>Total Rooms:</strong> {room.total_rooms ?? "N/A"}</p>
          <p><strong>Status:</strong> {room.is_active ? "Active" : "Inactive"}</p>
          <p className="col-span-2">
            <strong>Amenities:</strong> {parsedAmenities.length > 0 ? parsedAmenities.join(", ") : "None"}
          </p>
          <p className="col-span-2 whitespace-pre-line break-words">
            <strong>Description:</strong> {room.room_description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
};

const ViewMoreModal = ({ isOpen, onClose, property }) => {
  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white max-w-3xl w-full rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Property Details</h2>

        {/* Image gallery */}
        {property.thumbnail_url?.length > 0 && (
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {property.thumbnail_url.map((url, i) => (
              <img
                key={i}
                src={`${process.env.REACT_APP_API_URL}${url}`}
                alt={`thumbnail-${i}`}
                className="h-24 rounded object-cover border"
              />
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm break-words">
          <p><strong>Title:</strong> {property.title}</p>
          <p><strong>Address:</strong> {property.address}</p>
          <p><strong>City:</strong> {property.city}</p>
          <p><strong>Province:</strong> {property.province}</p>
          <p><strong>Country:</strong> {property.country}</p>
          <p><strong>Type:</strong> {property.type}</p>
          <p><strong>Status:</strong> {property.status}</p>
          <p><strong>Max Rooms:</strong> {property.max_rooms}</p>
          <p><strong>Max Guests:</strong> {property.max_guests}</p>
          <p><strong>Price Per Night:</strong> ₱{property.price_per_night}</p>
          <p><strong>Price Day Use:</strong> ₱{property.price_day_use}</p>
          <p><strong>Day Use Available:</strong> {property.is_day_use_available ? "Yes" : "No"}</p>
          <p className="col-span-2"><strong>Amenities:</strong> {property.amenities?.join(", ")}</p>
          <p className="col-span-2 whitespace-pre-line break-words">
            <strong>Description:</strong> {property.description}
          </p>
        </div>
      </div>
    </div>
  );
};


const AddPropertyModal = ({ isOpen, onClose, onSubmit, formData, setFormData, formErrors }) => {
  const [isSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const propertyTypes = ["hotel", "apartment", "inn", "home", "condominium"];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white max-w-3xl w-full rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg">✕</button>
        <h2 className="text-xl font-semibold mb-4">Add New Property</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 text-sm">
          {["title", "address"].map((field) => (
            <div key={field}>
              <label className="block font-medium capitalize">{field.replace(/_/g, " ")}</label>
              <input
                name={field}
                type="text"
                value={formData[field]}
                onChange={handleChange}
                className="w-full border px-3 py-1 rounded"
              />
              {formErrors[field] && <p className="text-red-500 text-xs">{formErrors[field]}</p>}
            </div>
          ))}

          {/* Type Dropdown */}
          <div>
            <label className="block font-medium">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            >
              <option value="">Select type</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
            {formErrors.type && <p className="text-red-500 text-xs">{formErrors.type}</p>}
          </div>

          <div>
            <label className="block font-medium">Price Per Night</label>
            <input
              name="price_per_night"
              type="number"
              value={formData.price_per_night}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            />
            {formErrors.price_per_night && <p className="text-red-500 text-xs">{formErrors.price_per_night}</p>}
          </div>

          <div>
            <label className="block font-medium">Price Day Use</label>
            <input
              name="price_day_use"
              type="number"
              value={formData.price_day_use}
              onChange={handleChange}
              disabled={!formData.is_day_use_available}
              className={`w-full border px-3 py-1 rounded ${!formData.is_day_use_available ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {formErrors.price_day_use && <p className="text-red-500 text-xs">{formErrors.price_day_use}</p>}
          </div>

          <div>
            <label className="block font-medium">Max Rooms</label>
            <input
              name="max_rooms"
              type="number"
              value={formData.max_rooms}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            />
            {formErrors.max_rooms && <p className="text-red-500 text-xs">{formErrors.max_rooms}</p>}
          </div>

          {["city", "province", "country"].map((field) => (
            <div key={field}>
              <label className="block font-medium capitalize">{field.replace(/_/g, " ")}</label>
              <input
                name={field}
                type="text"
                value={formData[field]}
                onChange={handleChange}
                className="w-full border px-3 py-1 rounded"
              />
              {formErrors[field] && <p className="text-red-500 text-xs">{formErrors[field]}</p>}
            </div>
          ))}

          {/* Multi-image upload */}
          <div className="col-span-2">
            <label className="block font-medium">Upload Images</label>
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded bg-white"
            />
            {formData.images?.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {formData.images.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="col-span-2">
            <label className="block font-medium">Amenities (comma separated)</label>
            <input
              name="amenities"
              type="text"
              value={formData.amenities}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border px-3 py-1 rounded resize-y"
            />
            {formErrors.description && (
              <p className="text-red-500 text-xs">{formErrors.description}</p>
            )}
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="is_day_use_available"
              checked={formData.is_day_use_available}
              onChange={handleChange}
            />
            <label>Day Use Available</label>
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-white rounded ${isSubmitting ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddRoomModal = ({ isOpen, onClose, onSubmit, formData, setFormData, formErrors }) => {
  const [isSubmitting] = useState(false);
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      setFormData(prev => ({ ...prev, [name]: Array.from(files) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white max-w-2xl w-full rounded-xl shadow-lg p-6 overflow-y-auto max-h-[90vh] relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg">✕</button>
        <h2 className="text-xl font-semibold mb-4">Add New Room</h2>

        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block font-medium">Room Name</label>
            <input
              name="room_name"
              type="text"
              value={formData.room_name}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            />
            {formErrors.room_name && <p className="text-red-500 text-xs">{formErrors.room_name}</p>}
          </div>

          <div>
            <label className="block font-medium">Room Type</label>
            <input
              name="room_type"
              type="text"
              value={formData.room_type}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            />
            {formErrors.room_type && <p className="text-red-500 text-xs">{formErrors.room_type}</p>}
          </div>

          <div>
            <label className="block font-medium">Rate Per Night</label>
            <input
              name="room_price_per_night"
              type="number"
              value={formData.room_price_per_night}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            />
            {formErrors.room_price_per_night && <p className="text-red-500 text-xs">{formErrors.room_price_per_night}</p>}
          </div>

          <div>
            <label className="block font-medium">Max Guests</label>
            <input
              name="max_guests"
              type="number"
              value={formData.max_guests}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            />
            {formErrors.max_guests && <p className="text-red-500 text-xs">{formErrors.max_guests}</p>}
          </div>

          <div>
            <label className="block font-medium">Total Rooms</label>
            <input
              name="total_rooms"
              type="number"
              value={formData.total_rooms}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            />
            {formErrors.total_rooms && <p className="text-red-500 text-xs">{formErrors.total_rooms}</p>}
          </div>

          <div className="col-span-2">
            <label className="block font-medium">Amenities (comma separated)</label>
            <input
              name="room_amenities"
              type="text"
              value={formData.room_amenities}
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded"
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium">Room Description</label>
            <textarea
              name="room_description"
              value={formData.room_description}
              onChange={handleChange}
              rows={3}
              className="w-full border px-3 py-1 rounded"
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium">Upload Room Images</label>
            <input
              name="room_images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="w-full border px-3 py-1 rounded bg-white"
            />
            {formData.room_images?.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {formData.room_images.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <label>Active</label>
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded ${isSubmitting ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




export default function Guests() {
  const [confirmRoomDelete, setConfirmRoomDelete] = useState({ room: null, open: false });
  const [editingRoom, setEditingRoom] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ property: null, open: false });
  const [setShowEditModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    activeRooms: 0,
    inactiveRooms: 0
  });  
  const [popup, setPopup] = useState({ message: "", type: "error" });
  const { user, fetchUser, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", address: "", type: "", price_per_night: "",
    price_day_use: "", max_rooms: "", amenities: "", is_day_use_available: false,
    status: "active", city: "", province: "", country: "", images: []
  });
  const [roomFormData, setRoomFormData] = useState({
    room_name: "",
    room_type: "",
    room_price_per_night: "",
    max_guests: "",
    total_rooms: "",
    room_description: "",
    room_amenities: "",
    room_images: [],
    is_active: true,
  });
  const [roomFormErrors, setRoomFormErrors] = useState({});
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [targetPropertyId, setTargetPropertyId] = useState(null);
  
  const [formErrors, setFormErrors] = useState({});

  const initialRoomFormData = {
    room_name: "",
    room_type: "",
    room_price_per_night: "",
    max_guests: "",
    total_rooms: "",
    room_description: "",
    room_amenities: "",
    room_images: [],
    is_active: true
  };


  useEffect(() => {
    const init = async () => {
      if (!user && !loading) {
        const fetched = await fetchUser();
        if (!fetched) return navigate("/login");
        await loadProperties(fetched.userId);
      } else if (user?.userId) {
        await loadProperties(user.userId);
      }
      setInitializing(false);
    };
    init();
  }, [user, loading, fetchUser, navigate]);


  const validateForm = () => {
    const required = [
      "title", "address", "type", "price_per_night", "max_rooms",
      "city", "province", "country"
    ];
    const errors = {};
    required.forEach(field => {
      if (!formData[field]) errors[field] = "Required";
    });
    return errors;
  };

  const handleAddRoomSubmit = async (e, propertyId) => {
    e.preventDefault();
  
    // Validation
    const requiredFields = [
      "room_name",
      "room_type",
      "room_price_per_night",
      "max_guests",
      "total_rooms",
    ];
  
    const errors = {};
    requiredFields.forEach((field) => {
      if (!roomFormData[field]) errors[field] = "Required";
    });
  
    setRoomFormErrors(errors);
    if (Object.keys(errors).length !== 0) return;
  
    try {
      const formPayload = new FormData();
      formPayload.append("room_name", roomFormData.room_name);
      formPayload.append("room_type", roomFormData.room_type);
      formPayload.append("price_per_night", roomFormData.room_price_per_night);
      formPayload.append("total_rooms", roomFormData.total_rooms);
      formPayload.append("max_guests", roomFormData.max_guests);
      formPayload.append("description", roomFormData.room_description || "");
      formPayload.append("is_active", roomFormData.is_active ? "true" : "false");
  
      // ✅ Safe handling of comma-separated amenities
      formPayload.append(
        "amenities",
        JSON.stringify(
          (roomFormData.room_amenities || "")
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
        )
      );
  
      // ✅ Upload images if present
      if (Array.isArray(roomFormData.room_images)) {
        roomFormData.room_images.forEach((file) => {
          formPayload.append("images", file);
        });
      }
  
      const response = await fetch(
        `${process.env.REACT_APP_API_URL_OWNER}/add-room/${propertyId}`,
        {
          method: "POST",
          body: formPayload,
        }
      );
  
      if (response.ok) {
        setPopup({ message: "Room added successfully!", type: "success" });
        setShowAddRoomModal(false);
        setRoomFormData({
          room_name: "",
          room_type: "",
          room_price_per_night: "",
          max_guests: "",
          total_rooms: "",
          room_description: "",
          room_amenities: "",
          room_images: [],
          is_active: true,
        });
  
        // Reload property data
        let lessorId = user?.userId;
        if (!lessorId) {
          const token = localStorage.getItem("tikangToken");
          const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.user?.user_id) {
            lessorId = data.user.user_id;
          } else {
            console.error("Could not resolve lessor ID");
            return;
          }
        }
  
        await loadProperties(lessorId);
      } else {
        const errorText = await response.text();
        setPopup({ message: errorText || "Failed to add room", type: "error" });
      }
    } catch (err) {
      console.error("Error submitting room:", err);
      setPopup({ message: "An error occurred while adding the room", type: "error" });
    }
  };
  
  const EditRoomModal = ({ isOpen, onClose, room, onSubmit, setPopup }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      ...room,
      room_images: room?.room_images || [],
      room_amenities: Array.isArray(room?.room_amenities)
        ? room.room_amenities.join(", ")
        : room?.room_amenities || ""
    });
  
    const [newImages, setNewImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
  
    useEffect(() => {
      if (room) {
        setFormData({
          ...room,
          room_images: Array.isArray(room.room_images) ? room.room_images : [],
          room_amenities: Array.isArray(room.room_amenities)
            ? room.room_amenities.join(", ")
            : room.room_amenities || ""
        });
        setNewImages([]);
        setPreviewImages([]);
      }
    }, [room]);
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    };
  
    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);
      const previews = files.map(file => ({
        name: file.name,
        preview: URL.createObjectURL(file)
      }));
      setPreviewImages(prev => [...prev, ...previews]);
    };
  
    const handleRemoveImage = (index) => {
      setFormData((prev) => {
        const updated = [...prev.room_images];
        updated.splice(index, 1);
        return { ...prev, room_images: updated };
      });
    };
  
    const handleRoomEditSubmit = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const formPayload = new FormData();
        formPayload.append("room_name", formData.room_name);
        formPayload.append("room_type", formData.room_type);
        formPayload.append("price_per_night", formData.room_price_per_night);
        formPayload.append("total_rooms", formData.total_rooms);
        formPayload.append("max_guests", formData.max_guests);
        formPayload.append("description", formData.room_description);
        formPayload.append("is_active", formData.is_active);
  
        formPayload.append("amenities", JSON.stringify(
          typeof formData.room_amenities === "string"
            ? formData.room_amenities.split(",").map(a => a.trim()).filter(Boolean)
            : formData.room_amenities
        ));
  
        formPayload.append("room_images", JSON.stringify(formData.room_images));
  
        newImages.forEach(file => formPayload.append("images", file));
  
        const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/update-room/${formData.room_id}`, {
          method: "PUT",
          body: formPayload
        });
  
        if (res.ok) {
          setPopup({ message: "Room updated successfully!", type: "success" });
          await onSubmit();
          onClose();
        } else {
          const err = await res.text();
          console.error("Update failed:", err);
          setPopup({ message: err || "Failed to update room", type: "error" });
        }
      } catch (err) {
        console.error("Error:", err);
        setPopup({ message: "An error occurred while updating the room", type: "error" });
      }
    };
  
    if (!isOpen || !room) return null;
  
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center px-4">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow relative">
          <button onClick={onClose} className="absolute top-2 right-3 text-gray-600 hover:text-black">×</button>
          <h2 className="text-lg font-semibold mb-4">Edit Room</h2>
          <form onSubmit={handleRoomEditSubmit} className="grid grid-cols-2 gap-4 text-sm">
            {["room_name", "room_type", "room_price_per_night", "total_rooms", "max_guests"].map(field => (
              <div key={field}>
                <label className="font-medium capitalize">{field.replace(/_/g, " ")}</label>
                <input
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  type={field.includes("price") || field.includes("total") ? "number" : "text"}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            ))}
  
            <div className="col-span-2">
              <label className="font-medium">Amenities (comma separated)</label>
              <input name="room_amenities" value={formData.room_amenities} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
            </div>
  
            <div className="col-span-2">
              <label className="font-medium">Description</label>
              <textarea name="room_description" value={formData.room_description} onChange={handleChange} rows={3} className="w-full border px-2 py-1 rounded" />
            </div>
  
            <div className="col-span-2">
              <label className="font-medium">Upload New Images</label>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="w-full border px-2 py-1 rounded bg-white" />
            </div>
  
            <div className="col-span-2 flex flex-wrap gap-2">
              {(formData.room_images || []).map((url, i) => (
                <div key={i} className="relative">
                  <img src={`${process.env.REACT_APP_API_URL}${url}`} className="h-20 w-20 object-cover rounded" alt="Property preview" />
                  <button onClick={() => handleRemoveImage(i)} className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full">×</button>
                </div>
              ))}
              {previewImages.map((img, i) => (
                <img key={`new-${i}`} src={img.preview} className="h-20 w-20 object-cover rounded"  alt="Property preview"/>
              ))}
            </div>
  
            <div className="col-span-2 flex justify-end gap-2 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  


  const EditPropertyModal = ({ isOpen, onClose, property, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      ...property,
      thumbnail_url: property?.thumbnail_url || [],
      amenities: Array.isArray(property?.amenities)
        ? property.amenities.join(", ")
        : property?.amenities || ""
    });
  
    const [newImages, setNewImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
  
    useEffect(() => {
      if (property) {
        setFormData({
          ...property,
          thumbnail_url: Array.isArray(property.thumbnail_url) ? property.thumbnail_url : [],
          amenities: Array.isArray(property.amenities)
            ? property.amenities.join(", ")
            : property.amenities || ""
        });
        setNewImages([]);
        setPreviewImages([]);
      }
    }, [property]);
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    };
  
    const handleNewImageUpload = (e) => {
      const files = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...files]);
  
      const previews = files.map((file) => ({
        name: file.name,
        preview: URL.createObjectURL(file)
      }));
      setPreviewImages((prev) => [...prev, ...previews]);
    };
  
    const handleRemoveImage = (index) => {
      setFormData((prev) => {
        const updated = [...prev.thumbnail_url];
        updated.splice(index, 1);
        return { ...prev, thumbnail_url: updated };
      });
    };
  
    const handleEditSubmit = async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      setIsSubmitting(true);
    
      try {
        const formPayload = new FormData();
        formPayload.append("title", formData.title);
        formPayload.append("address", formData.address);
        formPayload.append("type", formData.type);
        formPayload.append("price_per_night", formData.price_per_night);
        formPayload.append("price_day_use", formData.price_day_use);
        formPayload.append("max_rooms", formData.max_rooms);
        formPayload.append("city", formData.city);
        formPayload.append("province", formData.province);
        formPayload.append("country", formData.country);
        formPayload.append("description", formData.description);
    
        formPayload.append(
          "amenities",
          JSON.stringify(
            typeof formData.amenities === "string"
              ? formData.amenities.split(",").map((a) => a.trim()).filter(Boolean)
              : formData.amenities
          )
        );
    
        formPayload.append("thumbnail_url", JSON.stringify(formData.thumbnail_url));
    
        newImages.forEach((file) => {
          formPayload.append("images", file);
        });
    
        const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/update-property/${formData.property_id}`, {
          method: "PUT",
          body: formPayload
        });
    
        if (res.ok) {
          setPopup({ message: "Property updated successfully!", type: "success" });
          await onSubmit();
          onClose();
        } else {
          const error = await res.text();
          console.error("Update error:", error);
          setPopup({ message: error || "Failed to update property", type: "error" });
        }
      } catch (err) {
        console.error("Submit error:", err);
        setPopup({ message: "An error occurred while updating the property", type: "error" });
      }
    };
    
    if (!isOpen || !property) return null;
  
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh] relative">
          <button onClick={onClose} className="absolute top-2 right-3 text-gray-600 hover:text-black text-xl">×</button>
          <h2 className="text-lg font-semibold mb-4">Edit Property</h2>
  
          <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-4 text-sm">
            {["title", "address", "city", "province", "country"].map((field) => (
              <div key={field}>
                <label className="font-medium capitalize">{field.replace("_", " ")}</label>
                <input
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            ))}
  
            {/* Property type dropdown */}
            <div>
              <label className="font-medium">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="">Select type</option>
                {["hotel", "apartment", "inn", "home", "condominium"].map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
  
            <div>
              <label className="font-medium">Price/Night</label>
              <input
                name="price_per_night"
                type="number"
                value={formData.price_per_night}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
  
            <div>
              <label className="font-medium">Price Day Use</label>
              <input
                name="price_day_use"
                type="number"
                value={formData.price_day_use}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
  
            <div>
              <label className="font-medium">Max Rooms</label>
              <input
                name="max_rooms"
                type="number"
                value={formData.max_rooms}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
  
            <div className="col-span-2">
              <label className="font-medium">Amenities (comma separated)</label>
              <input
                name="amenities"
                value={formData.amenities || ""}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
  
            <div className="col-span-2">
              <label className="font-medium">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description || ""}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
  
            {/* Existing image previews */}
            <div className="flex flex-wrap gap-2 col-span-2">
              {formData.thumbnail_url.map((url, idx) => (
                <div key={idx} className="relative">
                  <img src={`${process.env.REACT_APP_API_URL}${url}`} className="h-20 w-20 object-cover rounded"  alt="Property preview"/>
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >×</button>
                </div>
              ))}
  
              {previewImages.map((file, idx) => (
                <div key={`preview-${idx}`} className="relative">
                  <img src={file.preview} className="h-20 w-20 object-cover rounded"  alt="Property preview"/>
                  <button
                    onClick={() => {
                      setPreviewImages(prev => prev.filter((_, i) => i !== idx));
                      setNewImages(prev => prev.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >×</button>
                </div>
              ))}
            </div>
  
            <div className="col-span-2">
              <label className="font-medium">Upload New Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleNewImageUpload}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
  
            <div className="col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length !== 0) return;
  
    try {
      let lessorId = user?.userId;
  
      // 🔁 Fallback: fetch user if not found in context
      if (!lessorId) {
        const token = localStorage.getItem("tikangToken");
        const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.user?.user_id) {
          lessorId = data.user.user_id;
        } else {
          console.error("Could not resolve lessor ID");
          return;
        }
      }
  
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("address", formData.address);
      formPayload.append("type", formData.type);
      formPayload.append("price_per_night", formData.price_per_night);
      formPayload.append("price_day_use", formData.price_day_use || 0);
      formPayload.append("max_rooms", formData.max_rooms);
      formPayload.append("city", formData.city);
      formPayload.append("province", formData.province);
      formPayload.append("country", formData.country);
      formPayload.append("is_day_use_available", formData.is_day_use_available);
      formPayload.append("status", formData.status);
      formPayload.append("description", formData.description);
      formPayload.append("lessor_id", lessorId);
  
      formPayload.append(
        "amenities",
        JSON.stringify(formData.amenities.split(",").map((a) => a.trim()))
      );
  
      formData.images.forEach((file) => {
        formPayload.append("images", file);
      });
  
      const response = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/add-property`, {
        method: "POST",
        body: formPayload,
      });
  
      if (response.ok) {
        setPopup({ message: "Property added successfully!", type: "success" });
        setShowModal(false);
        setFormData({
          title: "", address: "", type: "", price_per_night: "",
          price_day_use: "", max_rooms: "", amenities: "", is_day_use_available: false,
          status: "active", city: "", province: "", country: "", images: [], description: ""
        });
        await loadProperties(lessorId);
      } else {
        const errorText = await response.text();
        setPopup({ message: errorText || "Submission failed", type: "error" });
      }
    
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };
  
  
  const loadProperties = async (lessorId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/properties/lessor/${lessorId}`);
      const result = await res.json();
      setData(result);
  
      // Group by property_id
      const grouped = result.reduce((acc, item) => {
        const propId = item.property_id;
        if (!acc[propId]) acc[propId] = { ...item, rooms: [] };
        if (item.room_id) {
          acc[propId].rooms.push({
            room_id: item.room_id,
            room_name: item.room_name,
            room_type: item.room_type,
            room_price_per_night: item.room_price_per_night,
            max_guests: item.max_guests,
            total_rooms: item.total_rooms,                   // ✅ correct
            room_description: item.room_description,         // ✅ use room_description
            room_amenities: item.room_amenities,             // ✅ use room_amenities
            room_images: item.room_images,                   // ✅ use room_images
            is_active: item.is_active,
          });
        }
        console.log(acc);
        return acc;
      }, {});
  
      const properties = Object.values(grouped);
      const allRooms = result.filter(r => r.room_id);
  
      const activeRooms = allRooms.filter(r => r.is_active).length;
      const inactiveRooms = allRooms.filter(r => r.is_active === false).length;
      const inactiveProperties = properties.filter(p => p.status === "inactive").length;
  
      setMetrics({
        totalProperties: properties.length,
        activeRooms,
        inactiveRooms,
        inactiveProperties
      });
  
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };
  

  if (initializing || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }

  const grouped = data.reduce((acc, item) => {
    const propId = item.property_id;
    if (!acc[propId]) acc[propId] = { ...item, rooms: [] };
    if (item.room_id) {
      acc[propId].rooms.push({
        room_id: item.room_id,
        room_name: item.room_name,
        room_type: item.room_type,
        room_price_per_night: item.room_price_per_night,
        max_guests: item.max_guests,
        total_rooms: item.total_rooms,
        room_description: item.room_description,
        room_amenities: item.room_amenities,
        room_images: item.room_images,                
        is_active: item.is_active,
      });
    }
    return acc;
  }, {});

  // MetricCard Component
  const MetricCard = ({ icon, label, value, color }) => (
    <div
      className="bg-white border-l-4 rounded-lg p-4 shadow flex items-center space-x-4"
      style={{ borderColor: color }}
    >
      <div className="text-3xl" style={{ color }}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h4 className="text-xl font-bold text-gray-800">{value}</h4>
      </div>
    </div>
  );


  const properties = Object.values(grouped);

  return (
    <>
      {popup.message && (
        <WarningPopup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ message: "", type: "error" })}
        />
      )}

      <DashboardNavBar />
      <DashboardTabs />
      <div className="pt-36 px-6 pb-16 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <MetricCard icon={<FaHotel />} label="Listed Properties" value={metrics.totalProperties} color="#3b82f6" />
        <MetricCard icon={<FaHotel />} label="Inactive Properties" value={metrics.inactiveProperties} color="#f87171" />
        <MetricCard icon={<FaHotel />} label="Active Rooms" value={metrics.activeRooms} color="#10b981" />
        <MetricCard icon={<FaHotel />} label="Inactive Rooms" value={metrics.inactiveRooms} color="#ef4444" />
      </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <FaHotel className="text-blue-500" /> Property Listings
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              <FaPlus /> Add Property
            </button>
          </div>

          <div className="max-h-[550px] overflow-y-auto overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50 sticky top-0 z-10 text-xs font-semibold text-blue-800 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Property</th>
                <th className="px-6 py-3 text-left">Address</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Max Rooms</th>
                <th className="px-6 py-3 text-left">Price Per Night</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {properties.map((p) => (
                <React.Fragment key={p.property_id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 cursor-pointer" onClick={() => setExpanded(prev => ({ ...prev, [p.property_id]: !prev[p.property_id] }))}>
                      {expanded[p.property_id] ? <FaChevronDown /> : <FaChevronRight />}
                    </td>
                    <td className="px-6 py-4 font-semibold">{p.title}</td>
                    <td className="px-6 py-4">{p.address}, {p.city}, {p.province}</td>
                    <td className="px-6 py-4 capitalize">{p.type}</td>
                    <td className="px-6 py-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={p.status === "active"}
                        onChange={async () => {
                          const newStatus = p.status === "active" ? "inactive" : "active";
                          try {
                            const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/switch-status/${p.property_id}`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: newStatus })
                            });

                            if (res.ok) {
                              let lessorId = user?.userId;

                              if (!lessorId) {
                                const token = localStorage.getItem("tikangToken");
                                const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/me`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                const data = await res.json();
                                if (res.ok && data.user?.user_id) {
                                  lessorId = data.user.user_id;
                                } else {
                                  console.error("Could not resolve lessor ID");
                                  return;
                                }
                              }

                              await loadProperties(lessorId);
                            } else {
                              console.error("Status update failed");
                            }
                          } catch (err) {
                            console.error("Error switching status:", err);
                          }
                        }}
                      />

                      {/* Switch Background */}
                      <div
                        className={`
                          relative w-14 h-7 rounded-full transition-colors duration-300
                          ${p.status === "active" ? "bg-green-500" : "bg-red-500"}
                        `}
                      >
                        {/* Sliding Circle */}
                        <div
                          className={`
                            absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out
                            ${p.status === "active" ? "translate-x-7" : "translate-x-1"}
                          `}
                        />
                      </div>

                      {/* Dynamic Label */}
                      <span className="ml-3 text-sm font-medium transition-colors duration-300 select-none"
                            style={{ color: p.status === "active" ? "#16a34a" : "#dc2626" }}>
                        {p.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </label>
                    </td>
                    <td className="px-6 py-4">{p.max_rooms}</td>
                    <td className="px-6 py-4 capitalize">₱{p.price_per_night}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedProperty(p)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs font-medium"
                        >
                          <FaChevronRight className="text-xs" /> View
                        </button>
                        <button
                          onClick={() => {
                            setRoomFormData({ ...initialRoomFormData }); // reset form
                            setTargetPropertyId(p.property_id); // store current property ID
                            setShowAddRoomModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 hover:bg-green-200 rounded text-xs font-medium"
                        >
                          <FaBed className="text-xs" /> Add Room
                        </button>
                        <button
                          onClick={() => {
                            setEditingProperty(p);
                            setShowEditModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded text-xs font-medium"
                        >
                          <FaEdit className="text-xs" /> Edit
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ property: p, open: true })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs font-medium"
                        >
                          <FaTrash className="text-xs" /> Delete
                        </button>
                        {confirmDelete.open && (
                          <WarningPop
                            message={`Are you sure you want to delete "${confirmDelete.property.title}"?`}
                            type="warning"
                            onConfirm={async () => {
                              try {
                                const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/delete-property/${confirmDelete.property.property_id}`, {
                                  method: "DELETE",
                                });

                                if (res.ok) {
                                  let lessorId = user?.userId;

                                  if (!lessorId) {
                                    const token = localStorage.getItem("tikangToken");
                                    const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/me`, {
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    const data = await res.json();
                                    if (res.ok && data.user?.user_id) {
                                      lessorId = data.user.user_id;
                                    } else {
                                      console.error("Could not resolve lessor ID");
                                      return;
                                    }
                                  }

                                  setPopup({ message: "Property deleted successfully", type: "success" });
                                  await loadProperties(lessorId);
                                } else {
                                  const error = await res.text();
                                  setPopup({ message: error || "Failed to delete property", type: "error" });
                                }
                              } catch (err) {
                                console.error("Delete error:", err);
                                setPopup({ message: "An error occurred during deletion", type: "error" });
                              } finally {
                                setConfirmDelete({ property: null, open: false });
                              }
                            }}
                            onCancel={() => setConfirmDelete({ property: null, open: false })}
                          />
                        )}
                      </div>
                    </td>
                  </tr>

                  {expanded[p.property_id] && (
                    <tr className="bg-gray-50">
                      <td colSpan="8" className="px-6 py-4">
                        {p.rooms.length === 0 ? (
                          <p className="italic text-sm text-gray-500">No rooms listed for this property.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                              <thead className="bg-white">
                                <tr>
                                  <th className="px-4 py-2 text-left">Room Name</th>
                                  <th className="px-4 py-2 text-left">Type</th>
                                  <th className="px-4 py-2 text-left">Rate</th>
                                  <th className="px-4 py-2 text-left">Max Guests</th>
                                  <th className="px-4 py-2 text-left">Total Rooms</th>
                                  <th className="px-4 py-2 text-left">Status</th>
                                  <th className="px-4 py-2 text-left">Action</th>

                                </tr>
                              </thead>
                              <tbody>
                              {p.rooms.map((r) => (
                                <tr key={r.room_id}>
                                  <td className="px-4 py-2">{r.room_name}</td>
                                  <td className="px-4 py-2">{r.room_type}</td>
                                  <td className="px-4 py-2">₱{r.room_price_per_night}</td>
                                  <td className="px-4 py-2">{r.max_guests}</td>
                                  <td className="px-4 py-2">{r.total_rooms}</td>
                                  <td className="px-4 py-2">
                                    <label className="inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={r.is_active}
                                        onChange={async () => {
                                          const newStatus = r.is_active ? false : true;
                                          try {
                                            const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/switch-room-status/${r.room_id}`, {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ is_active: newStatus })
                                            });

                                            if (res.ok) {
                                              let lessorId = user?.userId;
                                              if (!lessorId) {
                                                const token = localStorage.getItem("tikangToken");
                                                const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/me`, {
                                                  headers: { Authorization: `Bearer ${token}` }
                                                });
                                                const data = await res.json();
                                                lessorId = data.user?.user_id;
                                              }

                                              await loadProperties(lessorId);
                                            } else {
                                              console.error("Room status update failed");
                                            }
                                          } catch (err) {
                                            console.error("Error switching room status:", err);
                                          }
                                        }}
                                      />
                                      <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${r.is_active ? "bg-green-500" : "bg-red-500"}`}>
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${r.is_active ? "translate-x-6" : "translate-x-1"}`} />
                                      </div>
                                      <span className="ml-2 text-sm font-medium" style={{ color: r.is_active ? "#16a34a" : "#dc2626" }}>
                                        {r.is_active ? "Active" : "Inactive"}
                                      </span>
                                    </label>
                                  </td>
                                  <td className="px-4 py-2">
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => {
                                        console.log(r);
                                        setSelectedRoom(r);
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs font-medium"
                                      >
                                      <FaChevronRight className="text-xs" /> View
                                    </button>
                                    <button
                                        onClick={() => setEditingRoom(r)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded text-xs font-medium"
                                      >
                                        <FaEdit className="text-xs" /> Edit
                                      </button>
                                      <button
                                        onClick={() => setConfirmRoomDelete({ room: r, open: true })}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs font-medium"
                                      >
                                        <FaTrash className="text-xs" /> Delete
                                      </button>
                                      {confirmRoomDelete.open && (
                                        <WarningPop
                                          message={`Are you sure you want to delete room "${confirmRoomDelete.room.room_name}"?`}
                                          type="warning"
                                          onConfirm={async () => {
                                            try {
                                              const res = await fetch(
                                                `${process.env.REACT_APP_API_URL_OWNER}/delete-room/${confirmRoomDelete.room.room_id}`,
                                                { method: "DELETE" }
                                              );

                                              if (res.ok) {
                                                let lessorId = user?.userId;

                                                if (!lessorId) {
                                                  const token = localStorage.getItem("tikangToken");
                                                  const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/me`, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                  });
                                                  const data = await res.json();
                                                  lessorId = data.user?.user_id;
                                                }

                                                setPopup({ message: "Room deleted successfully", type: "success" });
                                                await loadProperties(lessorId);
                                              } else {
                                                const error = await res.text();
                                                setPopup({ message: error || "Failed to delete room", type: "error" });
                                              }
                                            } catch (err) {
                                              console.error("Delete error:", err);
                                              setPopup({ message: "An error occurred during deletion", type: "error" });
                                            } finally {
                                              setConfirmRoomDelete({ room: null, open: false });
                                            }
                                          }}
                                          onCancel={() => setConfirmRoomDelete({ room: null, open: false })}
                                        />
                                      )}
                                  </div>
                                  </td>
                                </tr>
                              ))} 
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <ViewMoreModal
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        property={selectedProperty}
      />
      <AddPropertyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
      />
      <AddRoomModal
        isOpen={showAddRoomModal}
        onClose={() => setShowAddRoomModal(false)}
        onSubmit={(e) => handleAddRoomSubmit(e, targetPropertyId)}
        formData={roomFormData}
        setFormData={setRoomFormData}
        formErrors={roomFormErrors}
      />
      <RoomDetailsModal
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        room={selectedRoom}
      />
      <EditPropertyModal
        isOpen={!!editingProperty}
        onClose={() => setEditingProperty(null)}
        property={editingProperty}
        onSubmit={async () => {
          let lessorId = user?.userId;
          if (!lessorId) {
            const token = localStorage.getItem("tikangToken");
            const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            lessorId = data.user?.user_id;
          }
          await loadProperties(lessorId);
          setEditingProperty(null);
        }}
      />
      <EditRoomModal
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        room={editingRoom}
        onSubmit={async () => {
          let lessorId = user?.userId;
          if (!lessorId) {
            const token = localStorage.getItem("tikangToken");
            const res = await fetch(`${process.env.REACT_APP_API_URL_OWNER}/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            lessorId = data.user?.user_id;
          }
          await loadProperties(lessorId);
        }}
        setPopup={setPopup}  
      />
    </>
  );  
}
