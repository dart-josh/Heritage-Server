import { nanoid } from "nanoid";

export const generate_nano_id = () => {
  return "" + nanoid(11);
};