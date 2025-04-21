import mongoose from "mongoose";
import { io } from "../socket/socket.js";
import Accessory from "../models/sales.model/accessory.model.js";
import { generate_nano_id } from "../utils/utils.js";
import SalesRecord from "../models/sales.model/salesrecord.model.js";

//? GETTERS

// get all accessories
export const get_all_accessories = async (req, res) => {
  try {
    const accessories = await Accessory.find({});
    res.status(200).json({ accessories });
  } catch (error) {
    console.log("Error in get_all_accessories controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get all accessories by id
export const get_accessoryById = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Accessory ID is required" });

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid Accessory ID" });

  try {
    const accessory = await Accessory.findById(id);
    if (!accessory)
      return res.status(404).json({ message: "Accessory not found" });

    res.status(200).json({ accessory });
  } catch (error) {
    console.log("Error in get_accessoryById controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get sales record
export const get_sales_record = async (req, res) => {
  try {
    const salesRecord = await SalesRecord.find({})
      .populate("items.item")
      .populate("customer")
      .populate("soldBy")
      .sort({ date: -1 });

    if (!salesRecord || salesRecord.length === 0)
      return res.status(404).json({ message: "No sales record found" });

    res.status(200).json({ salesRecord });
  } catch (error) {
    console.log("Error in get_sales_record controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get sales record by date
export const get_sales_record_by_date = async (req, res) => {
  const { date } = req.body;

  if (!date) return res.status(400).json({ message: "Date is required" });

  // get only date from full date string
  const dateString = new Date(date).toISOString().split("T")[0];

  try {
    // find sales record by date
    const salesRecord = await SalesRecord.find({ date: { $regex: dateString } })
      .populate("items.item")
      .populate("customer")
      .populate("soldBy")
      .sort({ date: -1 });

    if (!salesRecord || salesRecord.length === 0)
      return res.status(404).json({ message: "No sales record found" });

    res.status(200).json({ salesRecord });
  } catch (error) {
    console.log("Error in get_sales_record_by_date controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? SETTERS

// add/update accessory
export const add_update_accessory = async (req, res) => {
  const {
    id,
    itemName,
    category,
    itemCode,
    price,
    quantity,
    restockLimit,
    isAvailable,
  } = req.body;

  // verify fields
  if ((!itemName, !category, !price)) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const itemExists = await Accessory.findOne({ itemName });

      // if name already exist return error
      if (itemExists) {
        return res.status(400).json({ message: "Accessory already exists" });
      }

      // generate itemId
      const itemId = generate_nano_id();

      // create new accessory
      const accessory = await Accessory.create({
        itemName,
        itemId,
        category,
        itemCode,
        price,
        quantity,
        restockLimit,
        isAvailable,
      });

      res.json({ message: "Accessory Created Successfully", accessory });

      // emit event to notify all clients
      io.emit("accessory", { action: "create", accessory });
    }

    // else UPDATE
    else {
      const accessory = await Accessory.findByIdAndUpdate(
        id,
        {
          itemName,
          category,
          itemCode,
          price,
          quantity,
          restockLimit,
          isAvailable,
        },
        {
          new: true,
        }
      );

      res.json({ message: "Accessory Updated Successfully", accessory });

      // emit event to notify all clients
      io.emit("accessory", { action: "update", accessory });
    }
  } catch (error) {
    console.log("Error in add_update_accessory controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// add/update sales record
export const add_update_sales_record = async (req, res) => {
  const {
    id,
    date,
    items,
    order_price,
    order_qty,
    customer,
    discount_price,
    shortNote,
    paymentMethod,
    splitPaymentMethod,
    soldBy,
    saleType,
  } = req.body;

  // verify fields
  if ((!items, !order_price, !order_qty, !paymentMethod)) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // check item is not empty
  if (items.length < 1) {
    return res.status(400).json({ message: "Select an item" });
  }

  // verify all items
  for (let i = 0; i < items.length; i++) {
    // check if item id is valid
    if (!items[i].item) {
      return res.status(400).json({ message: "Invalid Item ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(items[i].item)) {
      return res.status(400).json({ message: "Invalid Item ID" });
    }

    // check if item exists
    const item = await Accessory.findById(items[i].item);
    if (!item) {
      return res.status(400).json({ message: "Invalid Item" });
    }

    // check qty
    if (!items[i].qty) {
      return res.status(400).json({ message: "Invalid Item Quantity" });
    }
    if (items[i].qty < 1) {
      return res.status(400).json({ message: "Invalid Item Quantity" });
    }

    //   if (item.quantity < items[i].qty) {
    //     return res.status(400).json({ message: "Insufficient Item Quantity" });
    //   }
  }

  // verify split payment method
  if (splitPaymentMethod) {
    for (let i = 0; i < splitPaymentMethod.length; i++) {
      if (
        !splitPaymentMethod[i].paymentMethod ||
        splitPaymentMethod[i].paymentMethod === "" ||
        !splitPaymentMethod[i].amount
      ) {
        return res.status(400).json({ message: "Invalid Payment Method" });
      }
    }
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      // generate orderId
      const order_id = generate_nano_id();

      const salesRecord = await SalesRecord.create({
        order_id,
        date,
        items,
        order_price,
        order_qty,
        customer,
        discount_price,
        shortNote,
        paymentMethod,
        splitPaymentMethod,
        soldBy,
        saleType,
      });

      res.json({ message: "Sales Record Created Successfully", salesRecord });

      // emit event to notify all clients
      io.emit("sales_record", { action: "create", salesRecord });
    }

    // else UPDATE
    else {
      const salesRecord = await SalesRecord.findByIdAndUpdate(
        id,
        {
          date,
          items,
          order_price,
          order_qty,
          customer,
          discount_price,
          shortNote,
          paymentMethod,
          splitPaymentMethod,
          saleType,
        },
        {
          new: true,
        }
      );

      res.json({ message: "Sales Record Updated Successfully", salesRecord });

      // emit event to notify all clients
      io.emit("sales_record", { action: "update", salesRecord });
    }
  } catch (error) {
    console.log("Error in add_update_sales_record controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? REMOVALS

// delete accessory
export const delete_accessory = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Accessory ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Accessory ID" });
  }

  try {
    const accessory = await Accessory.findByIdAndDelete(id);

    if (!accessory) {
      return res.status(404).json({ message: "Accessory not found" });
    }

    res.json({ message: "Accessory Deleted Successfully", accessory });

    // emit event to notify all clients
    io.emit("accessory", { action: "delete", id });
  } catch (error) {
    console.log("Error in delete_accessory controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// delete sales record
export const delete_sales_record = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Sales Record ID is required" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Sales Record ID" });
  }

  try {
    const salesRecord = await SalesRecord.findByIdAndDelete(id);

    if (!salesRecord) {
      return res.status(404).json({ message: "Sales Record not found" });
    }

    res.json({ message: "Sales Record Deleted Successfully", salesRecord });

    // emit event to notify all clients
    io.emit("sales_record", { action: "delete", id });
  } catch (error) {
    console.log("Error in delete_sales_record controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};
