import { injectable } from "tsyringe";
import { User } from "../entity/User.js";
import { GenericRepository } from "./genericRepository.js";
import AppDataSource from "../data-source.js";

@injectable()
export class UserRepository extends GenericRepository<User> {
  constructor() {
    super(User, AppDataSource.manager);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOneBy({ email });
  }
}
