import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

enum ReservationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  userId!: string; // ObjectId as string

  @IsNotEmpty()
  @IsString()
  restaurantId!: string; // ObjectId as string

  @IsNotEmpty()
  @IsDateString() // Validate as ISO 8601 date string
  date!: string;

  @IsNotEmpty()
  @IsString()
  timeSlot!: string; // Expected format: "HH:mm-HH:mm", e.g., "19:00-21:00"

  @IsEnum(ReservationStatus)
  status: ReservationStatus = ReservationStatus.PENDING; // Default status to PENDING
}
