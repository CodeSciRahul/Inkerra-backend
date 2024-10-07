import { getUser } from "../dataManipulation/chat.js";

export class chatService {
  getUser = async (payload) => {
    const user = getUser(payload);
    return user;
  };
}
