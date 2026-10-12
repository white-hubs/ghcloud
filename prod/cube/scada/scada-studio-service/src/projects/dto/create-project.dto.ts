import { ValidateClass, Property, IsString, IsOptional } from "@dangao/bun-server";

@ValidateClass()
export class CreateProjectDto {
  @Property(IsString())
  name!: string;

  @Property(IsOptional(), IsString())
  description?: string;
}
