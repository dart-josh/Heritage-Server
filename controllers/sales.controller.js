import mongoose from "mongoose";
import { io } from "../socket/socket.js";
import Accessory from "../models/sales.model/accessory.model.js";
import { generate_nano_id, getTimezoneOffset } from "../utils/utils.js";
import SalesRecord from "../models/sales.model/salesrecord.model.js";
import RestockAccessoryRecord from "../models/sales.model/restock_accessory_record.model.js";

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
      .populate("accessories.accessory")
      .populate("customer")
      .populate("Patient")
      .populate("soldBy")
      .sort({ date: -1 });

    res.status(200).json({ salesRecord });
  } catch (error) {
    console.log("Error in get_sales_record controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get_accessory_restock_record
export const get_accessory_restock_record = async (req, res) => {
  try {
    const record = await RestockAccessoryRecord.find({})
      .populate("accessories.accessory")
      .populate("enteredBy")
      .populate("verifiedBy")
      .sort({ date: -1 });


    res.status(200).json({ record });
  } catch (error) {
    console.log("Error in get_accessory_restock_record controller:", error.message);
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
      .populate("accessories.accessory")
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
      io.emit("Accessory", accessory);
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
      io.emit("Accessory", accessory);
    }
  } catch (error) {
    console.log("Error in add_update_accessory controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// add sales record
export const add_sales_record = async (req, res) => {
  const {
    date,
    accessories,
    order_price,
    customer,
    patient,
    discount_price,
    shortNote,
    paymentMethod,
    splitPaymentMethod,
    soldBy,
    saleType,
  } = req.body;

  // verify fields
  if (!accessories || !order_price || !paymentMethod) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // check item is not empty
  if (accessories.length < 1) {
    return res.status(400).json({ message: "Select an item" });
  }

  // verify all accessories
  for (let i = 0; i < accessories.length; i++) {
    // check if item id is valid
    if (!accessories[i].accessory) {
      return res.status(400).json({ message: "Invalid Item ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(accessories[i].accessory)) {
      return res.status(400).json({ message: "Invalid Item ID" });
    }

    // check if accessory exists
    const accessory = await Accessory.findById(accessories[i].accessory);
    if (!accessory) {
      return res.status(400).json({ message: "Invalid Item" });
    }

    // check qty
    if (!accessories[i].qty) {
      return res.status(400).json({ message: "Invalid Item Quantity" });
    }
    if (accessories[i].qty < 1) {
      return res.status(400).json({ message: "Invalid Item Quantity" });
    }

    //   if (accessory.quantity < accessories[i].qty) {
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

  // get total quantity
  const order_qty = accessories.reduce((acc, accessory) => {
    return acc + accessory.qty;
  }, 0);

  try {
    // generate orderId
    const order_id = generate_nano_id();

    const salesRecord = await SalesRecord.create({
      order_id,
      date: getTimezoneOffset(date),
      accessories,
      order_price,
      order_qty,
      customer,
      patient,
      discount_price,
      shortNote,
      paymentMethod,
      splitPaymentMethod,
      soldBy,
      saleType,
    });

    // Update all accessories (decrease quantity)
    for (let index = 0; index < accessories.length; index++) {
      const accessory = accessories[index];
      var res = await update_accessory_quantity(
        accessory.accessory,
        accessory.qty,
        false
      );

      //? emit
      io.emit("Accessory", res["accessory"]);
    }

    const populatedRecord = await salesRecord.populate([
      { path: "accessories.accessory" },
      { path: "customer" },
      { path: "patient" },
      { path: "soldBy" },
    ]);

    res.json({
      message: "Sales Record Created Successfully",
      salesRecord: populatedRecord,
    });

    // emit event to notify all clients
    io.emit("SalesRecord", populatedRecord);
  } catch (error) {
    console.log("Error in add_update_sales_record controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// add/update accessory restock record
export const add_update_accessory_restock_record = async (req, res) => {
  const { id, date, accessories, shortNote, enteredBy, supplier } = req.body;

  // verify fields
  if (!accessories) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  // check accessory is not empty
  if (accessories.length < 1) {
    return res.status(400).json({ message: "Select an accessory" });
  }

  // verify all accessories
  for (let i = 0; i < accessories.length; i++) {
    // check if accessory id is valid
    if (!accessories[i].accessory) {
      return res.status(400).json({ message: "Invalid Item ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(accessories[i].accessory)) {
      return res.status(400).json({ message: "Invalid Item ID" });
    }

    // check if accessory exists
    const accessory = await Accessory.findById(accessories[i].accessory);
    if (!accessory) {
      return res.status(400).json({ message: "Invalid Item" });
    }

    // check qty
    if (!accessories[i].qty) {
      return res.status(400).json({ message: "Invalid Item Quantity" });
    }
    if (accessories[i].qty < 1) {
      return res.status(400).json({ message: "Invalid Item Quantity" });
    }
  }

  // get total quantity
  const order_qty = accessories.reduce((acc, accessory) => {
    return acc + accessory.qty;
  }, 0);

  try {
    if (!id) {
      // generate orderId
      const order_id = generate_nano_id();

      const restockRecord = await RestockAccessoryRecord.create({
        order_id,
        date: getTimezoneOffset(date),
        accessories,
        order_qty,
        shortNote,
        enteredBy,
        supplier,
      });

      const populatedRecord = await restockRecord.populate([
        { path: "accessories.accessory" },
        { path: "verifiedBy" },
        { path: "enteredBy" },
      ]);

      res.json({
        message: "Sales Record Created Successfully",
        restockRecord: populatedRecord,
      });

      // emit event to notify all clients
      io.emit("RestockAccessoryRecord", populatedRecord);
    }

    // update
    else {
      const restockRecord = await RestockAccessoryRecord.findByIdAndUpdate(
        id,
        {
          date: getTimezoneOffset(date),
          accessories,
          order_qty,
          shortNote,
          supplier,
        },
        { new: true }
      );

      const populatedRecord = await restockRecord.populate([
        { path: "accessories.accessory" },
        { path: "verifiedBy" },
        { path: "enteredBy" },
      ]);

      res.json({
        message: "Sales Record Updated Successfully",
        restockRecord: populatedRecord,
      });

      // emit event to notify all clients
      io.emit("RestockAccessoryRecord", populatedRecord);
    }
  } catch (error) {
    console.log(
      "Error in add_update_accessory_restock_record controller:",
      error.message
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// verify_accessory_restock_record
export const verify_accessory_restock_record = async (req, res) => {
  const { id, verifiedBy } = req.body;

  // verify all input
  if (!id || !verifiedBy) {
    return res.status(500).json({ message: "Invalid Verification" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // Check if record exist
  const record = await RestockAccessoryRecord.findById(id);
  if (!record) {
    return res.status(500).json({ message: "Record does not exist" });
  }

  // Check if record is verified
  if (record.verified) {
    return res.status(500).json({ message: "Record verified already" });
  }

  //  get accessories
  const accessories = record.accessories;

  // verify accessories
  if (!accessories || accessories.length < 1) {
    return res.status(500).json({ message: "Record contains No accessories" });
  }

  // verify each accessory
  for (let index = 0; index < accessories.length; index++) {
    const accessory = accessories[index];

    if (!accessory.accessory || !accessory.qty) {
      return res.status(500).json({ message: "Invalid accessory found" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(accessory.accessory)) {
      return res.status(500).json({ message: "Invalid accessory found" });
    }

    // Check if accessory exist
    const accessoryExists = await Accessory.findById(accessory.accessory);
    if (!accessoryExists) {
      return res.status(500).json({ message: "Invalid accessory found" });
    }
  }

  // Update all accessories (increase quantity)
  for (let index = 0; index < accessories.length; index++) {
    const accessory = accessories[index];
    var res = await update_accessory_quantity(
      accessory.accessory,
      accessory.qty,
      true
    );

    //? emit
    io.emit("Accessory", res["accessory"]);
  }

  const date = new Date();
  // convert date to local timezone
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  // Update record
  try {
    const record = await RestockAccessoryRecord.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          verifiedBy,
          verified: true,
          verifiedDate: date,
        },
      },
      { new: true }
    );

    const populatedRecord = await record.populate([
      { path: "accessories.accessory" },
      { path: "verifiedBy" },
      { path: "enteredBy" },
    ]);

    //? emit
    io.emit("RestockAccessoryRecord", populatedRecord);

    res.json({
      message: "Restock Accessory Entry Verified",
      record: populatedRecord,
    });
  } catch (error) {
    console.log("Error in verify_accessory_restock_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
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
    io.emit("AccessoryD", id);
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

    // Update all accessories (increase quantity)
    for (let index = 0; index < salesRecord.accessories.length; index++) {
      const accessory = salesRecord.accessories[index];
      var res = await update_accessory_quantity(
        accessory.accessory,
        accessory.qty,
        true
      );

      //? emit
      io.emit("Accessory", res["accessory"]);
    }

    res.json({ message: "Sales Record Deleted Successfully", id });

    // emit event to notify all clients
    io.emit("SalesRecord", id);
  } catch (error) {
    console.log("Error in delete_sales_record controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// delete accessory restock record
export const delete_accessory_restock_record = async (req, res) => {
  const { id } = req.params;
  const { isAllowed } = req.ody;

  if (!id) {
    return res.status(500).json({ message: "Record ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Record ID not valid" });
  }

  // delete record
  try {
    // Check if record exist
    const record = await RestockAccessoryRecord.findById(id);
    if (!record) {
      return res.status(500).json({ message: "Record does not exist" });
    }

    // check if record is verified
    if (record.verified) {
      const accessories = record.accessories;
      // Check is user is permitted
      if (!isAllowed) {
        return res.status(500).json({ message: "Unathorized to Delete" });
      }

      // User allowed to delete
      else {
        // Update all accessories (decrease quantity)
        for (let index = 0; index < accessories.length; index++) {
          const accessory = accessories[index];
          var res = await update_accessory_quantity(
            accessory.accessory,
            accessory.qty,
            false
          );

          //? emit
          io.emit("Accessory", res["accessory"]);
        }
      }
    }

    await RestockAccessoryRecord.findByIdAndDelete(id);

    //? emit
    io.emit("RestockAccessoryRecordD", id);

    res.json({ message: "Record deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_accessory_restock_record: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? UTILS

// update accessory quantity
export const update_accessory_quantity = async (id, quantity, increament) => {
  if (increament === undefined) {
    return { error: "No increament attribute" };
  }

  const finalQuantity = increament ? quantity : -quantity;

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Accessory ID not valid" };
  }

  // Check if accessory exist
  const accessoryExists = await Accessory.findById(id);
  if (!accessoryExists) {
    return { error: "Accessory does not exist" };
  }

  try {
    const accessory = await Accessory.findOneAndUpdate(
      { _id: id },
      {
        $inc: {
          quantity: finalQuantity,
        },
      },
      { new: true }
    );

    return { message: "Accessory updated", accessory };
  } catch (error) {
    console.log("Error in update_accessory_quantity: ", error.message);
    return { error: error.message };
  }
};

//?
