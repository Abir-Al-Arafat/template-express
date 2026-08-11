import { ClientSession } from "mongoose";
import { BaseRepository } from "../../repositories/base.repository";
import { User, UserModel } from "./user.model";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(UserModel);
  }

  findByEmail(email: string, session?: ClientSession) {
    const query = this.model.findOne({ email: email.toLowerCase() });
    if (session) {
      query.session(session);
    }
    return query;
  }

  findById(id: string, session?: ClientSession) {
    const query = this.model.findById(id);
    if (session) {
      query.session(session);
    }
    return query;
  }
}
