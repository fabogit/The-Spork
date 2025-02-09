// libs/shared/src/lib/dtos/create-review.dto.ts

import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO for Reviewer type
class ReviewerDto {
  @IsNotEmpty()
  @IsString()
  id!: string; // ObjectId as string in DTO

  @IsNotEmpty()
  @IsString()
  name!: string;
}

// DTO for RestaurantRef type
class RestaurantRefDto {
  @IsNotEmpty()
  @IsString()
  id!: string; // ObjectId as string in DTO
}

export class CreateReviewDto {
  @ValidateNested() // Validate nested ReviewerDto
  @Type(() => ReviewerDto)
  user!: ReviewerDto;

  @ValidateNested() // Validate nested RestaurantRefDto
  @Type(() => RestaurantRefDto)
  restaurant!: RestaurantRefDto;

  @IsNumber()
  @IsNotEmpty()
  rating!: number;

  @IsString()
  @IsNotEmpty()
  comment!: string;
}
