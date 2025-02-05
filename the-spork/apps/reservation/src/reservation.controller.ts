import { Controller, Get } from '@nestjs/common';
import { ReservationService } from './reservation.service';

@Controller()
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  getHello(): string {
    return this.reservationService.getHello();
  }
}
