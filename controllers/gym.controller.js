import GymClient from "../models/gym.model/client.model";


// ? GETTERS

// get clients

// get client



// ? SETTERS

// register client

// edit name

// edit client profile



// get accessory requests
export const get_all_accessory_requests = async (req, res) => {
  try {
    const accessoryRequests = await AccessoryRequest.find({})
      .populate("patient")
      .populate("doctor")
      .populate("accessories.accessory");
    res.json({ accessoryRequests });
  } catch (error) {
    console.log(
      "Error in get_all_accessory_requests controller:",
      error.message
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};




// add/update accessory request
export const add_update_accessory_request = async (req, res) => {
  const { id, patient, doctor, accessories } = req.body;

  // verify fields
  if (!accessories || accessories.length < 1) {
    return res.status(500).json({ message: "No accessory added" });
  }

  // verify accessory
  for (let i = 0; i < accessories.length; i++) {
    if (!accessories[i].accessory || !accessories[i].qty) {
      return res.status(500).json({ message: "Invalid Accessory Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(accessories[i].accessory)) {
      return res.status(500).json({ message: "Invalid Accessory found" });
    }

    // Check if accessory exist
    const accessoryExists = await Accessory.findById(accessories[i].accessory);
    if (!accessoryExists) {
      return res.status(500).json({ message: "Invalid Accessory Entry" });
    }
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const request_id = generate_nano_id();

      const request = await AccessoryRequest.create({
        request_id,
        patient,
        doctor,
        accessories,
      });

      const populated_request = await request.populate([
        { path: "patient" },
        { path: "doctor" },
        { path: "accessories.accessory" },
      ]);

      res.json({
        message: "Accessory Request Sent",
        request: populated_request,
      });

      //? emit
      io.emit("AccessoryRequest", populated_request);
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if request exist
      const requestExists = await AccessoryRequest.findById(id);
      if (!requestExists) {
        return res.status(500).json({ message: "Request does not exist" });
      }

      const request = await AccessoryRequest.findByIdAndUpdate(
        id,
        {
          patient,
          doctor,
          accessories,
        },
        { new: true }
      );

      const populated_request = await request.populate([
        { path: "patient" },
        { path: "doctor" },
        { path: "accessories.accessory" },
      ]);

      res.json({ message: "Request Updated", request: populated_request });

      //? emit
      io.emit("AccessoryRequest", populated_request);
    }
  } catch (error) {
    console.log("Error in add_update_accessory_request: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};


// ? REMOVALS

// delete client

// delete accessory request
export const delete_accessory_request = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Request ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Request ID not valid" });
  }

  // Check if request exist
  const requestExists = await AccessoryRequest.findById(id);
  if (!requestExists) {
    return res.status(500).json({ message: "Request does not exist" });
  }

  try {
    await AccessoryRequest.findByIdAndDelete(id);

    //? emit
    io.emit("AccessoryRequestD", id);

    res.json({ message: "Request deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_accessory_request: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// ? UTILS

// generate client_id
export const generate_client_id = async (req, res) => {
  var all_ids = [];

  try {
    const clients = await GymClient.find({});

    for (let index = 0; index < clients.length; index++) {
      const element = clients[index];

      var id = parseInt(element.client_id.split("-")[1]);
      all_ids.push(id);
    }
  } catch (error) {
    console.log("Error in generate_client_id", error);
    return res.status(500).json({ message: "Failed to generate ID" });
  }

  var new_id = 0;

  if (all_ids.length > 0) {
    new_id = Math.max(...all_ids);
  }

  new_id++;
  return res.json({
    message: "ID Generated",
    client_id: new_id,
  });
};