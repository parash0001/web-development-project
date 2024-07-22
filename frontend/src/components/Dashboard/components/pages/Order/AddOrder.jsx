import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Categories = {
  APPETIZER: "APPETIZER",
  MAIN_COURSE: "MAIN_COURSE",
  DESSERT: "DESSERT",
  BEVERAGE: "BEVERAGE",
  SNACK: "SNACK",
  SALAD: "SALAD",
  SOUP: "SOUP",
  SIDE_DISH: "SIDE_DISH",
  BREAKFAST: "BREAKFAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
  SPECIAL: "SPECIAL",
};

const Types = {
  VEGETARIAN: "VEGETARIAN",
  NON_VEGETARIAN: "NON_VEGETARIAN",
  VEGAN: "VEGAN",
};

const AddOrderForm = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [formData, setFormData] = useState({
    items: [{ menuItem: "", price: 0, quantity: 1 }],
    status: "",
    deliveryType: "",
    room: "",
    table: "",
    address: "",
    email: "",
    phone: "",
  });

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/menu/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      console.log("Fetched Menu Items:", response.data);
      if (Array.isArray(response.data)) {
        setMenuItems(response.data);
      } else {
        console.error("Invalid response structure:", response.data);
        toast.error("Failed to fetch menu items. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching menu items:", error.message);
      toast.error("Failed to fetch menu items. Please try again later.");
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleMenuItemChange = (index, menuItemId) => {
    const selectedMenuItem = menuItems.find(menuItem => menuItem.id === parseInt(menuItemId));
    if (selectedMenuItem) {
      const updatedItems = [...formData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        menuItem: selectedMenuItem.id,
        price: selectedMenuItem.price,
      };
      setFormData({
        ...formData,
        items: updatedItems,
      });
      calculateTotalPrice();
    } else {
      console.error("Menu item not found");
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { menuItem: "", price: 0, quantity: 1 }
      ],
    });
    calculateTotalPrice();
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;
    formData.items.forEach(item => {
      const menuItem = menuItems.find(menuItem => menuItem.id === item.menuItem);
      if (menuItem) {
        totalPrice += menuItem.price * item.quantity;
      }
    });
    setTotalPrice(totalPrice);
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;

    if (name.startsWith('quantity')) {
      const updatedItems = [...formData.items];
      const itemIndex = parseInt(name.split('-')[1], 10);
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: parseInt(value, 10),
      };
      setFormData({
        ...formData,
        items: updatedItems,
      });
      calculateTotalPrice();
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toast.error("Unauthorized access. Please log in.");
        return;
      }

      const orderData = {
        items: formData.items.map(item => {
          const menuItem = menuItems.find(menuItem => menuItem.id === item.menuItem);
          return {
            menuItem: item.menuItem,
            name: menuItem ? menuItem.name : "",
            price: item.price,
            quantity: item.quantity,
            category: menuItem ? menuItem.category : null,
          };
        }),
        status: formData.status || "",
        deliveryType: formData.deliveryType || "",
        room: formData.deliveryType === "RoomService" ? formData.room : "",
        table: formData.deliveryType === "Hotel" ? formData.table : "",
        address: formData.deliveryType === "HomeDelivery" ? formData.address || "" : "",
        email: formData.deliveryType === "HomeDelivery" ? formData.email || "" : "",
        phone: formData.deliveryType === "HomeDelivery" ? formData.phone || "" : "",
        totalPrice: totalPrice,
      };

      const response = await axios.post(
        "http://localhost:8080/api/orders/place-order",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Order submitted successfully!");
        reset();
      } else {
        console.error("Order submission failed:", response);
        toast.error("Failed to submit order. Please try again later.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response);
        toast.error(`Error: ${error.response.data.message}`);
      } else if (error.request) {
        console.error("Error request:", error.request);
        toast.error("Network error. Please check your internet connection.");
      } else {
        console.error("Error:", error.message);
        toast.error("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const reset = () => {
    setFormData({
      items: [{ menuItem: "", price: 0, quantity: 1 }],
      status: "",
      deliveryType: "",
      room: "",
      table: "",
      address: "",
      email: "",
      phone: "",
    });
    setTotalPrice(0);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData({
      ...formData,
      items: updatedItems,
    });
    calculateTotalPrice();
  };

  return (
    <div className="max-w-4xl p-8" style={{ height: "82vh" }}>
      <h1 className="text-3xl font-semibold mb-6">Add Order</h1>
      <form onSubmit={onSubmit}>
        <h2 className="text-xl font-semibold mb-4">Items</h2>
        {formData.items.map((item, index) => (
          <div key={index} className="flex items-center gap-4 mb-4">
            <div>
              <label htmlFor={`menuItem-${index}`} className="block text-sm font-medium text-gray-700">
                Menu Item
              </label>
              <select
                name={`menuItem-${index}`}
                id={`menuItem-${index}`}
                value={item.menuItem}
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => handleMenuItemChange(index, e.target.value)}
              >
                <option value="">Select Menu Item</option>
                {menuItems.map((menuItem) => (
                  <option key={menuItem.id} value={menuItem.id}>
                    {menuItem.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`price-${index}`} className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                id={`price-${index}`}
                name={`price-${index}`}
                value={item.price}
                readOnly
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                id={`quantity-${index}`}
                name={`quantity-${index}`}
                value={item.quantity}
                onChange={(e) => handleInputChange(e, index)}
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Item
        </button>
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <input
            type="text"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="deliveryType" className="block text-sm font-medium text-gray-700">Delivery Type</label>
          <select
            name="deliveryType"
            id="deliveryType"
            value={formData.deliveryType}
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select Delivery Type</option>
            <option value="RoomService">Room Service</option>
            <option value="Hotel">Hotel</option>
            <option value="HomeDelivery">Home Delivery</option>
          </select>
        </div>
        {formData.deliveryType === "RoomService" && (
          <div className="mb-4">
            <label htmlFor="room" className="block text-sm font-medium text-gray-700">Room</label>
            <input
              type="text"
              id="room"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
        {formData.deliveryType === "Hotel" && (
          <div className="mb-4">
            <label htmlFor="table" className="block text-sm font-medium text-gray-700">Table</label>
            <input
              type="text"
              id="table"
              name="table"
              value={formData.table}
              onChange={handleInputChange}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
        {formData.deliveryType === "HomeDelivery" && (
          <>
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </>
        )}
        <div className="mb-4">
          <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700">Total Price</label>
          <input
            type="number"
            id="totalPrice"
            name="totalPrice"
            value={totalPrice}
            readOnly
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Submit Order
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddOrderForm;
