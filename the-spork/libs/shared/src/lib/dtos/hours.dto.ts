import { IsArray, IsOptional, IsString } from 'class-validator';

export class HoursDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Validate each hour range string
  monday?: string[] | 'closed';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tuesday?: string[] | 'closed';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wednesday?: string[] | 'closed';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thursday?: string[] | 'closed';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  friday?: string[] | 'closed';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  saturday?: string[] | 'closed';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sunday?: string[] | 'closed';
}
