import { injectable } from "tsyringe";
import { User } from "../entity/User.ts";
import { GenericRepository } from "./genericRepository.ts";
import AppDataSource from "../data-source.ts";
import { AuthService } from "../services/auth.service.ts";

@injectable()
export class UserRepository extends GenericRepository<User> {
  constructor() {
    super(User, AppDataSource.manager);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOneBy({ email });
  }
}
