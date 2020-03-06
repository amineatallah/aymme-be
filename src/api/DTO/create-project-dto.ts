import {IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {

  @ApiProperty({
      minLength: 3,
      type: String
  })
  @IsNotEmpty()
  projectName: string;

}