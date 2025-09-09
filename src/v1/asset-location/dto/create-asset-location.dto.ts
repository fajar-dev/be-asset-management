import { IsNotEmpty, IsString, Validate } from "class-validator";
import { IsExist } from "../../../common/validators/is-exist.decorator";
import { Location } from "src/v1/location/entities/location.entity";

export class CreateAssetLocationDto {
  @IsNotEmpty()
  @IsString()
  @Validate(IsExist, [Location, 'locationUuid'])
  locationId: string;
}
