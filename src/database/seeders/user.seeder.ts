import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/v1/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async run() {
    const count = await this.userRepository.count();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('password', 10);
      await this.userRepository.save([
        {
          name: 'Fajar Rivaldi Chan',
          email: 'fajarchan@nusa.net.id',
          phoneNumber: '0895611024559',
          password: hashedPassword,
        },
      ]);
      console.log('✅ User seeder done!');
    } else {
      console.log('⚠️ Users already seeded, skipping...');
    }
  }
}
