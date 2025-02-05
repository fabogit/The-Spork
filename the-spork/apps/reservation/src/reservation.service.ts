import { Injectable } from '@nestjs/common';

@Injectable()
export class ReservationService {
  getHello(): string {
    return 'Hello World!';
  }
}
