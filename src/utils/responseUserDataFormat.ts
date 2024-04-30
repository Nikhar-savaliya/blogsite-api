import User from "../types/user";
import generateJWtoken from "./generateJWToken";

const formatDatatoSend = (user: User) => {
  const access_token = generateJWtoken(user._id);

  return {
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    access_token,
  };
};

export default formatDatatoSend;
