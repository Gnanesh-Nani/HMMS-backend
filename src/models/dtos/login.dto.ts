import { IsString,IsNotEmpty } from "class-validator"

class loginDto {
    @IsNotEmpty()
    @IsString()
    reg_no: string
    
    @IsNotEmpty()
    @IsString()
    password: string
}

export { loginDto }