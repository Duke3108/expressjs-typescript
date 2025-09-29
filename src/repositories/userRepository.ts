import { injectable, singleton } from "tsyringe";

import { User } from "../entity/User.ts";
import { GenericRepository } from "./genericRepository.ts";
import { AppDataSource } from "../data-source.ts";

@injectable()
export class UserRepository extends GenericRepository<User> {
  constructor() {
    super(User, AppDataSource.manager);
  }

  async findByEmailTest(email: string): Promise<User | null> {
    return await this.repository.findOneBy({ email });
  }
}
