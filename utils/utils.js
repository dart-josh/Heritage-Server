import { nanoid } from "nanoid";

export const generate_nano_id = () => {
  return "" + nanoid(11);
};

export const generate_customer_id = () => {
  return "CUST" + generate_nano_id();
}

export const generate_accessory_id = () => {
  return "ACC" + generate_nano_id();
}

export const generate_order_id = () => {
  return "ORD" + generate_nano_id();
}