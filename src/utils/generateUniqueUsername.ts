import { v4 as uuidv4 } from "uuid";
import User from "../models/User";

const generateUniqueUsername = async (email: string): Promise<string> => {
  try {
    let username = email.split("@")[0];
    let usernameExists = await User.exists({
      "personal_info.username": username,
    });

    if (usernameExists) {
      // Append a UUID substring to ensure uniqueness
      const uuidSubstring = uuidv4().substring(0, 8);
      username += `-${uuidSubstring}`;
    }

    return username;
  } catch (error) {
    // Handle database or other errors gracefully
    console.error("Error generating unique username:", error);
    throw new Error("Error generating unique username");
  }
};

export default generateUniqueUsername;
