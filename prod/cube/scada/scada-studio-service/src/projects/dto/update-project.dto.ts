import { ValidateClass, Property, IsString, IsOptional } from "@dangao/bun-server";

@ValidateClass()
export class UpdateProjectDto {
  @Property(IsOptional(), IsString())
  name?: string;

  @Property(IsOptional(), IsString())
  description?: string;
}
