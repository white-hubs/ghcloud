import { ValidateClass, Property, IsString, IsOptional } from "@dangao/bun-server";

@ValidateClass()
export class CreatePageDto {
  @Property(IsString())
  name!: string;

  @Property(IsOptional(), IsString())
  content?: string;

  @Property(IsOptional(), IsString())
  project_id?: string;

  @Property(IsOptional(), IsString())
  thumbnail?: string;
}
