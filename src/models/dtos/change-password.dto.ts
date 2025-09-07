import { IsNotEmpty,IsString } from 'class-validator';

class changePasswordDto {
    @IsNotEmpty()
    @IsString()
    reg_no: string;
    @IsNotEmpty()
    @IsString()
    oldPassword: string;

    @IsNotEmpty()
    @IsString()
    newPassword: string;
}
 
export { changePasswordDto };