import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HoursDto } from './hours.dto';

// DTO for Coordinates type
class CoordinatesDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;
}

// DTO for Location type
class LocationDto {
  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsString()
  city!: string;

  @ValidateNested() // Validate nested CoordinatesDto
  @Type(() => CoordinatesDto) // Transformation for nested object
  coordinates!: CoordinatesDto;
}

// DTO for Menu type
class MenuDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNumber()
  price!: number;
}

export class CreateRestaurantDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ValidateNested() // Validate nested LocationDto
  @Type(() => LocationDto) // Transformation for nested object
  location!: LocationDto;

  @IsArray()
  @IsString({ each: true }) // Ensure each item in cuisine array is a string
  cuisine!: string[];

  @ValidateNested() // Validate nested HoursDto
  @Type(() => HoursDto)
  hours!: HoursDto; // Use HoursDto type

  @IsArray()
  @IsString({ each: true }) // Owners are strings (ObjectIds in DB, but strings in DTO for now)
  owners!: string[];

  @IsOptional() // Menu is optional on creation?  Adjust if needed
  @IsArray()
  @ValidateNested({ each: true }) // Validate each item in menu array is a MenuDto
  @Type(() => MenuDto) // Transformation for nested MenuDto objects
  menu?: MenuDto[];

  @IsOptional()
  @IsNumber()
  rating?: number; // Rating is optional and can be calculated later
}
